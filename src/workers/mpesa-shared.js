// src/workers/mpesa-shared.js
export function normalizePhoneNumber(phoneNumber) {
  let cleaned = String(phoneNumber || '').replace(/[\s-]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.startsWith('0')) {
    cleaned = `254${cleaned.slice(1)}`;
  } else if (!cleaned.startsWith('254')) {
    cleaned = `254${cleaned}`;
  }

  return cleaned;
}

export function buildTimestamp() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
}

export function buildPassword(timestamp, businessShortCode, passKey) {
  return btoa(`${businessShortCode}${passKey}${timestamp}`);
}

export async function getAccessToken(env) {
  const CONSUMER_KEY = env.MPESA_CONSUMER_KEY;
  const CONSUMER_SECRET = env.MPESA_CONSUMER_SECRET;
  const BASE_URL = env.MPESA_ENVIRONMENT === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke';

  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error('M-Pesa credentials are not configured');
  }

  const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
  const response = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export function requireConfig(env) {
  if (!env.MPESA_CONSUMER_KEY || !env.MPESA_CONSUMER_SECRET || !env.MPESA_BUSINESS_SHORT_CODE || !env.MPESA_PASS_KEY) {
    throw new Error('M-Pesa credentials are not configured');
  }
}

export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
