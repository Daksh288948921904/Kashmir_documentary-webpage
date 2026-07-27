export type PaymentGateway = 'airpay' | 'razorpay';

export interface ServerSettings {
  /* Payment gateway selector */
  paymentGateway: PaymentGateway;

  /* Airpay */
  airpayMerchantId: string;
  airpayUsername: string;
  airpayPassword: string;
  airpayApiKey: string;
  airpayClientId: string;
  airpaySecretKey: string;
  airpayBaseUrl: string;

  /* Razorpay */
  razorpayKeyId: string;
  razorpayKeySecret: string;

  /* Apify */
  apifyApiToken: string;

  /* News */
  newsApiKey: string;

  /* App */
  documentaryPriceInr: number;
  frontendUrl: string;

  /* Screening (Rig360) */
  screeningPartnerKey: string;

  /* JWT */
  jwtSecret: string;
  jwtAlgorithm: 'HS256';
  accessTokenExpireMinutes: number;
}

export function getServerSettings(): ServerSettings {
  const gw = process.env.PAYMENT_GATEWAY ?? 'airpay';
  return {
    paymentGateway:    (gw === 'razorpay' ? 'razorpay' : 'airpay') as PaymentGateway,
    airpayMerchantId:  process.env.AIRPAY_MERCHANT_ID ?? '',
    airpayUsername:    process.env.AIRPAY_USERNAME ?? '',
    airpayPassword:    process.env.AIRPAY_PASSWORD ?? '',
    airpayApiKey:      process.env.AIRPAY_API_KEY ?? '',
    airpayClientId:    process.env.AIRPAY_CLIENT_ID ?? '',
    airpaySecretKey:   process.env.AIRPAY_SECRET_KEY ?? '',
    airpayBaseUrl:     process.env.AIRPAY_BASE_URL ?? 'https://payments.airpay.co.in/pay/index.php',
    razorpayKeyId:     process.env.RAZORPAY_KEY_ID ?? '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
    apifyApiToken:     process.env.APIFY_API_TOKEN ?? '',
    newsApiKey:        process.env.NEWS_API_KEY ?? '',
    documentaryPriceInr: Number(process.env.DOCUMENTARY_PRICE_INR ?? 1),
    frontendUrl:       process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    screeningPartnerKey: process.env.SCREENING_PARTNER_KEY ?? '',
    jwtSecret:         process.env.JWT_SECRET ?? 'dev-jwt-secret',
    jwtAlgorithm:      'HS256',
    accessTokenExpireMinutes: Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES ?? 1440),
  };
}
