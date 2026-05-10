const { axios, BASE_URL, CALLBACK_URL, BUSINESS_SHORT_CODE, buildPassword, buildTimestamp, getAccessToken, normalizePhoneNumber, requireConfig } = require('./mpesa-shared.cjs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    requireConfig();

    const { phoneNumber, amount, description } = JSON.parse(event.body || '{}');
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const safeAmount = Math.max(1, Math.round(Number(amount || 0)));

    if (!normalizedPhone || !/^254(7|1)\d{8}$/.test(normalizedPhone)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Please enter a valid M-Pesa phone number.' }),
      };
    }

    if (!safeAmount || Number.isNaN(safeAmount)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Please enter a valid payment amount.' }),
      };
    }

    if (!CALLBACK_URL) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'MPESA_CALLBACK_URL is not configured.' }),
      };
    }

    const token = await getAccessToken();
    const timestamp = buildTimestamp();
    const password = buildPassword(timestamp);

    const payload = {
      BusinessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: safeAmount,
      PartyA: normalizedPhone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: String(description || 'Brighten Lighting').slice(0, 12).toUpperCase(),
      TransactionDesc: String(description || 'Payment for Brighten Lighting').slice(0, 40),
    };

    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    const statusCode = error.statusCode || error.response?.status || 500;
    const message = error.response?.data?.errorMessage || error.message || 'Failed to initiate M-Pesa payment';

    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: message }),
    };
  }
};
