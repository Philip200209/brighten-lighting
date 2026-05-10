import axios from 'axios';

const CONSUMER_KEY = import.meta.env.VITE_MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = import.meta.env.VITE_MPESA_CONSUMER_SECRET;
const BUSINESS_SHORT_CODE = import.meta.env.VITE_MPESA_BUSINESS_SHORT_CODE;
const PASS_KEY = import.meta.env.VITE_MPESA_PASS_KEY;
const ENVIRONMENT = import.meta.env.VITE_MPESA_ENVIRONMENT || 'sandbox';

const BASE_URL = 
  ENVIRONMENT === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke';

let accessToken = null;
let tokenExpiry = null;

/**
 * Get M-Pesa access token
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const response = await axios.get(
      `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    accessToken = response.data.access_token;
    // Token typically expires in 1 hour, so we cache it for 55 minutes
    tokenExpiry = new Date(new Date().getTime() + 55 * 60 * 1000);

    return accessToken;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw new Error('Failed to authenticate with M-Pesa API');
  }
}

/**
 * Initiate M-Pesa Lipa Na M-Pesa Online payment
 * @param {Object} options - Payment options
 * @param {string} options.phoneNumber - Customer phone number (254XXXXXXXXX format)
 * @param {number} options.amount - Amount in KES
 * @param {string} options.description - Payment description
 * @param {string} options.callbackUrl - Callback URL for payment status
 */
export async function initiateMpesaPayment({ phoneNumber, amount, description, callbackUrl }) {
  if (!CONSUMER_KEY || !CONSUMER_SECRET || !BUSINESS_SHORT_CODE) {
    console.warn('M-Pesa credentials not configured. Payment not initiated.');
    return null;
  }

  try {
    const token = await getAccessToken();

    // Format timestamp for password generation
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);

    // Generate password: BusinessShortCode + PassKey + Timestamp
    const dataString = BUSINESS_SHORT_CODE + PASS_KEY + timestamp;
    const password = Buffer.from(dataString).toString('base64');

    const payload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.slice(-9)}`,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.slice(-9)}`,
      CallBackURL: callbackUrl,
      AccountReference: description.slice(0, 12).toUpperCase(),
      TransactionDesc: description.slice(0, 40),
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

    return response.data;
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    throw new Error(error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment');
  }
}

/**
 * Query M-Pesa transaction status
 * @param {string} checkoutRequestId - The checkout request ID from initiateMpesaPayment
 */
export async function queryMpesaTransactionStatus(checkoutRequestId) {
  if (!CONSUMER_KEY || !CONSUMER_SECRET || !BUSINESS_SHORT_CODE) {
    console.warn('M-Pesa credentials not configured.');
    return null;
  }

  try {
    const token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);

    const dataString = BUSINESS_SHORT_CODE + PASS_KEY + timestamp;
    const password = Buffer.from(dataString).toString('base64');

    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error querying M-Pesa transaction:', error);
    throw new Error('Failed to query transaction status');
  }
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
