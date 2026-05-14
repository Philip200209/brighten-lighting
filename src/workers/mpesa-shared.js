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

function requireSupabaseConfig(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server credentials are not configured');
  }
}

async function supabaseRequest(env, path, { method = 'POST', body }) {
  requireSupabaseConfig(env);

  const response = await fetch(`${env.SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const error = new Error(errorText || `Supabase request failed with status ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

export async function createPaymentRecord(env, payment) {
  const rows = await supabaseRequest(env, '/rest/v1/payments?select=*', {
    body: [payment],
  });

  return Array.isArray(rows) ? rows[0] : null;
}

export async function updatePaymentRecord(env, id, updates) {
  const rows = await supabaseRequest(env, `/rest/v1/payments?id=eq.${id}&select=*`, {
    method: 'PATCH',
    body: updates,
  });

  return Array.isArray(rows) ? rows[0] : null;
}

export async function getPaymentByTransactionRef(env, transactionRef) {
  const rows = await supabaseRequest(env, `/rest/v1/payments?transaction_ref=eq.${encodeURIComponent(transactionRef)}&select=*`, {
    method: 'GET',
  });

  return Array.isArray(rows) ? rows[0] : null;
}

export function parseMpesaCallback(callbackData) {
  const body = callbackData?.Body?.stkCallback;

  if (!body) {
    throw new Error('Invalid callback data format');
  }

  const metadata = {};
  for (const item of body.CallbackMetadata?.Item || []) {
    metadata[item.Name] = item.Value;
  }

  return {
    success: body.ResultCode === 0,
    resultCode: body.ResultCode,
    resultDesc: body.ResultDesc,
    checkoutRequestId: body.CheckoutRequestID,
    merchantRequestId: body.MerchantRequestID,
    mpesaReceiptNumber: metadata.MpesaReceiptNumber,
    transactionDate: metadata.TransactionDate,
    phoneNumber: metadata.PhoneNumber,
    amount: metadata.Amount,
  };
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
