import crypto from 'crypto';
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
  gateway: 'airpay';
  transaction_id: string;
  post_url: string;
  form_fields: Record<string, string>;
}

export interface RazorpayOrderResult {
  gateway: 'razorpay';
  order_id: string;   // Razorpay order id (order_xxx)
  key_id: string;     // publishable key — safe to send to client
  amount: number;     // in paise
  currency: string;
  name: string;
  description: string;
}

export type CreateOrderResult = AirpayOrderResult | RazorpayOrderResult;

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

  // Two checksum formula variants seen in Airpay integrations:
  // Formula A: SHA256(skey@buyerData)        where skey = SHA256(username~:~password)
  // Formula B: SHA256(privatekey@buyerData)  where privatekey = SHA256(apiKey@username:|:password)
  const checksumA = sha256(`${sKey}@${buyerData}`);
  const checksumB = sha256(`${privateKey}@${buyerData}`);
  const checksum  = checksumB; // trying formula B — A was rejected

  const callbackUrl = `${s.frontendUrl}/api/payment/callback`;

  console.log('[airpay] mercid      :', merchantId);
  console.log('[airpay] skey        :', sKey);
  console.log('[airpay] privatekey  :', privateKey);
  console.log('[airpay] amount      :', amount);
  console.log('[airpay] buyer_data  :', buyerData);
  console.log('[airpay] checksumA   :', checksumA, '← SHA256(skey@data)');
  console.log('[airpay] checksumB   :', checksumB, '← SHA256(privatekey@data) [SENDING]');
  console.log('[airpay] callback    :', callbackUrl);

  const formFields: Record<string, string> = {
    mercid:         merchantId,
    orderid:        txnId,
    amount,
    currency,
    isocurrency:    'INR',
    isdefault,
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
    gateway:        'airpay',
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

  const expSeconds = Math.floor(Date.now() / 1000) + s.accessTokenExpireMinutes * 60;
  const token      = signJwt({ sub: apTxnId || txnId, exp: expSeconds }, s.jwtSecret);

  return { verified: true, access_token: token, message: 'Payment verified' };
}

export async function verifyAccessToken(token: string): Promise<Record<string, unknown> | null> {
  const s = getServerSettings();
  try {
    return verifyJwt(token, s.jwtSecret);
  } catch {
    return null;
  }
}

/* ── Minimal JWT via Node.js crypto (no jose dependency) ───────────────── */
function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function signJwt(payload: Record<string, unknown>, secret: string): string {
  const header  = b64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body    = b64url(Buffer.from(JSON.stringify(payload)));
  const sig     = b64url(
    crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest(),
  );
  return `${header}.${body}.${sig}`;
}

function verifyJwt(token: string, secret: string): Record<string, unknown> {
  const [header, body, sig] = token.split('.');
  if (!header || !body || !sig) throw new Error('invalid token');
  const expected = b64url(
    crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest(),
  );
  if (sig !== expected) throw new Error('invalid signature');
  const payload = JSON.parse(Buffer.from(body, 'base64').toString()) as Record<string, unknown>;
  if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('token expired');
  }
  return payload;
}

/* ── Razorpay ───────────────────────────────────────────────────────────── */

export async function createRazorpayOrder(input: AirpayOrderInput): Promise<RazorpayOrderResult> {
  const s = getServerSettings();
  const keyId     = clean(s.razorpayKeyId);
  const keySecret = clean(s.razorpayKeySecret);

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  const amountPaise = Math.round(parseFloat(String(s.documentaryPriceInr)) * 100);
  const receipt     = `KFP${Date.now()}`;

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res  = await fetch('https://api.razorpay.com/v1/orders', {
    method:  'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ amount: amountPaise, currency: 'INR', receipt }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay order creation failed: ${err}`);
  }

  const data = await res.json() as { id: string };

  console.log('[razorpay] order_id:', data.id, '| amount_paise:', amountPaise);

  return {
    gateway:     'razorpay',
    order_id:    data.id,
    key_id:      keyId,
    amount:      amountPaise,
    currency:    'INR',
    name:        'Kashmir — Fighting for Peace',
    description: 'Documentary film access',
  };
}

export async function verifyRazorpayPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
): Promise<VerifyCallbackResult> {
  const s = getServerSettings();
  const keySecret = clean(s.razorpayKeySecret);

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return { verified: false, message: 'Invalid payment signature' };
  }

  const expSeconds = Math.floor(Date.now() / 1000) + s.accessTokenExpireMinutes * 60;
  const token      = signJwt({ sub: razorpay_payment_id, exp: expSeconds }, s.jwtSecret);

  return { verified: true, access_token: token, message: 'Payment verified' };
}
