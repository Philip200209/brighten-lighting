// src/workers/mpesa-query.js
import {
  buildTimestamp,
  buildPassword,
  getAccessToken,
  requireConfig,
  jsonResponse,
} from './mpesa-shared.js';

export async function handleMpesaQuery(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    requireConfig(env);

    const { checkoutRequestId } = await request.json();
    if (!checkoutRequestId) {
      return jsonResponse({ error: 'checkoutRequestId is required' }, 400);
    }

    const BASE_URL = env.MPESA_ENVIRONMENT === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';

    const token = await getAccessToken(env);
    const timestamp = buildTimestamp();
    const password = buildPassword(timestamp, env.MPESA_BUSINESS_SHORT_CODE, env.MPESA_PASS_KEY);

    const response = await fetch(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: env.MPESA_BUSINESS_SHORT_CODE,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        }),
      }
    );

    if (!response.ok) {
      return jsonResponse({ error: 'Failed to query payment status' }, response.status);
    }

    const data = await response.json();
    return jsonResponse(data);
  } catch (error) {
    console.error('Error querying M-Pesa payment:', error);
    const statusCode = error.statusCode || 500;
    return jsonResponse(
      { error: error.message || 'An error occurred' },
      statusCode
    );
  }
}
