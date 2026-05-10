const axios = require('axios');

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || process.env.VITE_MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || process.env.VITE_MPESA_CONSUMER_SECRET;
const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE || process.env.VITE_MPESA_BUSINESS_SHORT_CODE;
const PASS_KEY = process.env.MPESA_PASS_KEY || process.env.VITE_MPESA_PASS_KEY;
const ENVIRONMENT = process.env.MPESA_ENVIRONMENT || process.env.VITE_MPESA_ENVIRONMENT || 'sandbox';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || process.env.VITE_MPESA_CALLBACK_URL;

const BASE_URL = ENVIRONMENT === 'sandbox'
  ? 'https://sandbox.safaricom.co.ke'
  : 'https://api.safaricom.co.ke';

let accessToken = null;
let tokenExpiry = null;

function normalizePhoneNumber(phoneNumber) {
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

function buildTimestamp() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
}

function buildPassword(timestamp) {
  return Buffer.from(`${BUSINESS_SHORT_CODE}${PASS_KEY}${timestamp}`).toString('base64');
}

async function getAccessToken() {
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  if (!CONSUMER_KEY || !CONSUMER_SECRET || !BUSINESS_SHORT_CODE || !PASS_KEY) {
    throw new Error('M-Pesa credentials are not configured');
  }

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
  tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
  return accessToken;
}

function requireConfig() {
  if (!CONSUMER_KEY || !CONSUMER_SECRET || !BUSINESS_SHORT_CODE || !PASS_KEY) {
    const error = new Error('M-Pesa credentials are not configured');
    error.statusCode = 500;
    throw error;
  }
}

module.exports = {
  axios,
  BASE_URL,
  CALLBACK_URL,
  BUSINESS_SHORT_CODE,
  buildPassword,
  buildTimestamp,
  getAccessToken,
  normalizePhoneNumber,
  requireConfig,
};
