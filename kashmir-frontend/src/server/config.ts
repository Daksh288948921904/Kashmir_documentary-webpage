export interface ServerSettings {
  /* Apify */
  apifyApiToken: string;

  /* Airpay */
  airpayMerchantId: string;
  airpayUsername: string;
  airpayPassword: string;
  airpayApiKey: string;
  airpayClientId: string;
  airpaySecretKey: string;
  airpayBaseUrl: string;

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
  return {
    apifyApiToken:     process.env.APIFY_API_TOKEN ?? '',
    airpayMerchantId:  process.env.AIRPAY_MERCHANT_ID ?? '',
    airpayUsername:     process.env.AIRPAY_USERNAME ?? '',
    airpayPassword:     process.env.AIRPAY_PASSWORD ?? '',
    airpayApiKey:       process.env.AIRPAY_API_KEY ?? '',
    airpayClientId:     process.env.AIRPAY_CLIENT_ID ?? '',
    airpaySecretKey:    process.env.AIRPAY_SECRET_KEY ?? '',
    airpayBaseUrl:      process.env.AIRPAY_BASE_URL ?? 'https://payments.airpay.co.in/pay/index.php',
    newsApiKey:        process.env.NEWS_API_KEY ?? '',
    documentaryPriceInr: Number(process.env.DOCUMENTARY_PRICE_INR ?? 1),
    frontendUrl:       process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    screeningPartnerKey: process.env.SCREENING_PARTNER_KEY ?? '',
    jwtSecret:         process.env.JWT_SECRET ?? 'dev-jwt-secret',
    jwtAlgorithm:      'HS256',
    accessTokenExpireMinutes: Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES ?? 1440),
  };
}
