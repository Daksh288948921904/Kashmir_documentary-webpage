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

  const txnId    = `KFP${Date.now()}`;
  const amount   = String(s.documentaryPriceInr);
  const currency = '356'; // INR

  const privateKey = sha256(`${apiKey}@${username}:|:${password}`);
  const sKey       = sha256(`${username}~:~${password}`);

  const buyerData = [
    input.email, input.name, input.name, '',
    input.address ?? '', input.city ?? '', input.state ?? '',
    input.country ?? 'India', amount, txnId, currency, '0', 'INR', '0',
    input.phone, input.pin_code ?? '',
  ].join('~:~');

  const checksum = sha256(`${sKey}@${buyerData}`);

  const callbackUrl = `${s.frontendUrl}/api/payment/callback`;

  const formFields: Record<string, string> = {
    mercid:         merchantId,
    orderid:        txnId,
    amount,
    currency,
    isocurrency:    'INR',
    chmod:          '0',
    buyerEmail:     input.email,
    buyerPhone:     input.phone,
    buyerFirstName: input.name,
    buyerLastName:  '',
    buyerAddress:   input.address ?? '',
    buyerCity:      input.city ?? '',
    buyerState:     input.state ?? '',
    buyerCountry:   input.country ?? 'India',
    buyerPinCode:   input.pin_code ?? '',
    privatekey:     privateKey,
    checksum,
    txnsubtype:     '',
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
