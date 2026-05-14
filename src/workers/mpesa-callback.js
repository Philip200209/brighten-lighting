import { parseMpesaCallback, getPaymentByTransactionRef, updatePaymentRecord, jsonResponse } from './mpesa-shared.js';

export async function handleMpesaCallback(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const callbackData = await request.json();
    const paymentResult = parseMpesaCallback(callbackData);

    if (!paymentResult.checkoutRequestId) {
      return jsonResponse({ error: 'checkoutRequestId is required' }, 400);
    }

    const updates = {
      status: paymentResult.success ? 'completed' : 'failed',
      mpesa_receipt_number: paymentResult.mpesaReceiptNumber || null,
      notes: paymentResult.resultDesc || null,
    };

    const payment = await getPaymentByTransactionRef(env, paymentResult.checkoutRequestId);

    if (payment?.id) {
      await updatePaymentRecord(env, payment.id, updates);
    }

    return jsonResponse({ ok: true, ...paymentResult });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    return jsonResponse({ error: error.message || 'Failed to process callback' }, error.statusCode || 500);
  }
}