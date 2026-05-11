// src/workers/mpesa-initiate.js
import {
  normalizePhoneNumber,
  buildTimestamp,
  buildPassword,
  getAccessToken,
  requireConfig,
  jsonResponse,
} from './mpesa-shared.js';

export async function handleMpesaInitiate(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    requireConfig(env);

    const { phoneNumber, amount, description } = await request.json();
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const safeAmount = Math.max(1, Math.round(Number(amount || 0)));

    if (!normalizedPhone || !/^254(7|1)\d{8}$/.test(normalizedPhone)) {
      return jsonResponse({ error: 'Please enter a valid M-Pesa phone number.' }, 400);
    }

    if (!safeAmount || Number.isNaN(safeAmount)) {
      return jsonResponse({ error: 'Please enter a valid payment amount.' }, 400);
    }

    if (!env.MPESA_CALLBACK_URL) {
      return jsonResponse({ error: 'MPESA_CALLBACK_URL is not configured.' }, 500);
    }

    const BASE_URL = env.MPESA_ENVIRONMENT === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';

    const token = await getAccessToken(env);
    const timestamp = buildTimestamp();
    const password = buildPassword(timestamp, env.MPESA_BUSINESS_SHORT_CODE, env.MPESA_PASS_KEY);

    const payload = {
      BusinessShortCode: env.MPESA_BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: safeAmount,
      PartyA: normalizedPhone,
      PartyB: env.MPESA_BUSINESS_SHORT_CODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: env.MPESA_CALLBACK_URL,
      AccountReference: description || 'Payment',
      TransactionDesc: description || 'M-Pesa Payment',
    };

    const mpesaResponse = await fetch(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!mpesaResponse.ok) {
      return jsonResponse({ error: 'Failed to initiate payment' }, mpesaResponse.status);
    }

    const data = await mpesaResponse.json();
    return jsonResponse(data);
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    const statusCode = error.statusCode || 500;
    return jsonResponse(
      { error: error.message || 'An error occurred' },
      statusCode
    );
  }
}
