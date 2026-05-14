// src/workers/mpesa-initiate.js
import {
  normalizePhoneNumber,
  buildTimestamp,
  buildPassword,
  getAccessToken,
  requireConfig,
  createPaymentRecord,
  updatePaymentRecord,
  jsonResponse,
} from './mpesa-shared.js';

export async function handleMpesaInitiate(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    requireConfig(env);

    const { phoneNumber, amount, description, productId = null } = await request.json();
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

    const payment = await createPaymentRecord(env, {
      phone_number: normalizedPhone,
      amount: safeAmount,
      product_id: productId || null,
      status: 'pending',
      notes: 'STK push initiated',
    });

    const BASE_URL = env.MPESA_ENVIRONMENT === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';

    const token = await getAccessToken(env);
    const timestamp = buildTimestamp();
    const password = buildPassword(timestamp, env.MPESA_BUSINESS_SHORT_CODE, env.MPESA_PASS_KEY);
    const transactionType = env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline';
    const accountReference = env.MPESA_ACCOUNT_REFERENCE || description || 'Payment';
    const transactionDescription = env.MPESA_TRANSACTION_DESCRIPTION || description || 'M-Pesa Payment';

    const payload = {
      BusinessShortCode: env.MPESA_BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: safeAmount,
      PartyA: normalizedPhone,
      PartyB: env.MPESA_BUSINESS_SHORT_CODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: env.MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: transactionDescription,
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
      if (payment?.id) {
        await updatePaymentRecord(env, payment.id, {
          status: 'failed',
          notes: 'Failed to initiate M-Pesa payment',
        }).catch((updateError) => {
          console.error('Failed to mark payment as failed:', updateError);
        });
      }

      return jsonResponse({ error: 'Failed to initiate payment' }, mpesaResponse.status);
    }

    const data = await mpesaResponse.json();

    if (payment?.id && data.CheckoutRequestID) {
      await updatePaymentRecord(env, payment.id, {
        transaction_ref: data.CheckoutRequestID,
        notes: description || 'M-Pesa payment',
      }).catch((updateError) => {
        console.error('Failed to store CheckoutRequestID:', updateError);
      });
    }

    return jsonResponse({
      ...data,
      payment,
    });
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    const statusCode = error.statusCode || 500;
    return jsonResponse(
      { error: error.message || 'An error occurred' },
      statusCode
    );
  }
}
