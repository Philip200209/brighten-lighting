// Get API base URL (use environment variable or default)
const getApiBaseUrl = () => {
  // For development with local Cloudflare Workers
  if (import.meta.env.DEV && import.meta.env.VITE_WORKERS_URL) {
    return import.meta.env.VITE_WORKERS_URL;
  }
  // For production, use same domain or VITE_API_BASE_URL
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return '';
};

/**
 * Initiate M-Pesa Lipa Na M-Pesa Online payment through a server-side function
 * @param {Object} options - Payment options
 * @param {string} options.phoneNumber - Customer phone number (254XXXXXXXXX format)
 * @param {number} options.amount - Amount in KES
 * @param {string} options.description - Payment description
 */
export async function initiateMpesaPayment({ phoneNumber, amount, description }) {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/mpesa-initiate`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber,
      amount,
      description,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || 'Failed to initiate M-Pesa payment');
  }

  return payload;
}

/**
 * Query M-Pesa transaction status
 * @param {string} checkoutRequestId - The checkout request ID from initiateMpesaPayment
 */
export async function queryMpesaTransactionStatus(checkoutRequestId) {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/mpesa-query`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ checkoutRequestId }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || 'Failed to query transaction status');
  }

  return payload;
}

/**
 * Process M-Pesa callback and validate payment
 * @param {Object} callbackData - Data from M-Pesa callback
 */
export function processMpesaCallback(callbackData) {
  // The callback structure from M-Pesa
  const body = callbackData.Body?.stkCallback;

  if (!body) {
    throw new Error('Invalid callback data format');
  }

  const resultCode = body.ResultCode;
  const resultDesc = body.ResultDesc;
  const checkoutRequestId = body.CheckoutRequestID;
  const merchantRequestId = body.MerchantRequestID;

  // Parse the metadata from the callback
  let metadata = {};
  if (body.CallbackMetadata?.Item) {
    body.CallbackMetadata.Item.forEach((item) => {
      const key = item.Name;
      const value = item.Value;
      metadata[key] = value;
    });
  }

  return {
    success: resultCode === 0,
    resultCode,
    resultDesc,
    checkoutRequestId,
    merchantRequestId,
    mpesaReceiptNumber: metadata['MpesaReceiptNumber'],
    transactionDate: metadata['TransactionDate'],
    phoneNumber: metadata['PhoneNumber'],
    amount: metadata['Amount'],
  };
}

/**
 * Validate M-Pesa phone number format
 */
export function isValidMpesaPhoneNumber(phoneNumber) {
  // Remove any spaces or dashes
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // Should be either 254XXXXXXXXX or 07XXXXXXXXX or 01XXXXXXXXX
  return /^(?:254|\+254|0)(7|1)\d{8}$/.test(cleaned);
}

/**
 * Format phone number to M-Pesa format (254XXXXXXXXX)
 */
export function formatPhoneNumber(phoneNumber) {
  let cleaned = phoneNumber.replace(/[\s-]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }

  return cleaned;
}
