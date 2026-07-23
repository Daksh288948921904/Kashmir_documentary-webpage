import crypto from 'crypto';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { getServerSettings } from '@/server/config';

export interface AirpayOrderInput {
  email: string;
  name: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pin_code?: string;
}

export interface AirpayOrderResult {
  transaction_id: string;
  post_url: string;
  form_fields: Record<string, string>;
}

export interface VerifyCallbackResult {
  verified: boolean;
  access_token?: string;
  message: string;
}

function clean(val: string): string {
  return val.trim().replace(/^['"]|['"]$/g, '');
}

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function createAirpayOrder(input: AirpayOrderInput): Promise<AirpayOrderResult> {
  const s = getServerSettings();

  const merchantId = clean(s.airpayMerchantId);
  const username   = clean(s.airpayUsername);
  const password   = clean(s.airpayPassword);
  const apiKey     = clean(s.airpayApiKey);

  if (!merchantId || !username || !password || !apiKey) {
    throw new Error(
      `Airpay credentials not configured. Set AIRPAY_MERCHANT_ID, AIRPAY_USERNAME, AIRPAY_PASSWORD, AIRPAY_API_KEY in environment variables.`
    );
  }

  const txnId = `KFP${Date.now()}`;
  // Airpay normalises amount to 2 decimal places server-side before computing checksum.
  // We must use the same format or the checksums will never match.
  const amount = parseFloat(String(s.documentaryPriceInr)).toFixed(2);
  const currency = '356'; // INR

  const privateKey = sha256(`${apiKey}@${username}:|:${password}`);
  const sKey       = sha256(`${username}~:~${password}`);

  // Build form values first — checksum must use IDENTICAL values to what the form sends.
  // Airpay recomputes checksum from the posted fields; any mismatch → "Wrong Checksum".
  const buyerFirstName = input.name;
  const buyerLastName  = '';          // we don't collect last name separately
  const buyerAddress   = input.address  ?? '';
  const buyerCity      = input.city     ?? '';
  const buyerState     = input.state    ?? '';
  const buyerCountry   = input.country  ?? 'India';
  const buyerPinCode   = input.pin_code ?? '';
  const isdefault      = '0';
  const txnsubtype     = '';          // must be '' here AND in the form field

  // Airpay checksum: email~:~fname~:~lname~:~addr~:~city~:~state~:~country~:~amount~:~orderid~:~currency~:~isdefault~:~isocurrency~:~txnsubtype~:~phone~:~pincode
  const buyerData = [
    input.email, buyerFirstName, buyerLastName,
    buyerAddress, buyerCity, buyerState,
    buyerCountry, amount, txnId, currency, isdefault, 'INR', txnsubtype,
    input.phone, buyerPinCode,
  ].join('~:~');

  const checksum = sha256(`${sKey}@${buyerData}`);

  const callbackUrl = `${s.frontendUrl}/api/payment/callback`;

  // ── Debug logs (visible in Vercel / Render function logs) ─────────────────
  // skey is sha256(username~:~password). Expected value with .env.local creds:
  //   d3d01234a5a79f7c59d2a7582cffc9092d2b3e2d7d58c49e14ab43ec3dcff4f3
  // If skey below differs, Vercel AIRPAY_USERNAME / AIRPAY_PASSWORD is wrong.
  console.log('[airpay] mercid    :', merchantId);
  console.log('[airpay] skey      :', sKey);
  console.log('[airpay] amount    :', amount);
  console.log('[airpay] buyer_data:', buyerData);
  console.log('[airpay] checksum  :', checksum);
  console.log('[airpay] callback  :', callbackUrl);

  const formFields: Record<string, string> = {
    mercid:         merchantId,
    orderid:        txnId,
    amount,
    currency,
    isocurrency:    'INR',
    chmod:          isdefault,
    buyerEmail:     input.email,
    buyerPhone:     input.phone,
    buyerFirstName,
    buyerLastName,
    buyerAddress,
    buyerCity,
    buyerState,
    buyerCountry,
    buyerPinCode,
    privatekey:     privateKey,
    checksum,
    txnsubtype,
    redirecturl:    callbackUrl,
  };

  return {
    transaction_id: txnId,
    post_url:       s.airpayBaseUrl,
    form_fields:    formFields,
  };
}

export async function verifyAirpayCallback(formData: Record<string, string>): Promise<VerifyCallbackResult> {
  const s = getServerSettings();
  const secret = clean(s.airpaySecretKey);

  const txnId   = formData.TRANSACTIONID ?? '';
  const apTxnId = formData.APTRANSACTIONID ?? '';
  const amount  = formData.AMOUNT ?? '';
  const status  = formData.TRANSACTIONSTATUS ?? '';
  const message = formData.MESSAGE ?? '';
  const apHash  = formData.ap_SecureHash ?? '';

  const verifyStr = `${txnId}:${apTxnId}:${amount}:${status}:${message}:${secret}`;
  const expected  = sha256(verifyStr);

  if (expected !== apHash) {
    return { verified: false, message: 'Invalid checksum' };
  }

  if (status !== '200') {
    return { verified: false, message: `Payment failed: ${message}` };
  }

  const key        = new TextEncoder().encode(s.jwtSecret);
  const expSeconds = Math.floor(Date.now() / 1000) + s.accessTokenExpireMinutes * 60;
  const token      = await new SignJWT({})
    .setProtectedHeader({ alg: s.jwtAlgorithm })
    .setSubject(apTxnId || txnId)
    .setExpirationTime(expSeconds)
    .sign(key);

  return { verified: true, access_token: token, message: 'Payment verified' };
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  const s = getServerSettings();
  try {
    const key = new TextEncoder().encode(s.jwtSecret);
    const { payload } = await jwtVerify(token, key, { algorithms: [s.jwtAlgorithm] });
    return payload;
  } catch {
    return null;
  }
}
