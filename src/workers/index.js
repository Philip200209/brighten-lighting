// src/workers/index.js
import { handleMpesaInitiate } from './mpesa-initiate.js';
import { handleMpesaQuery } from './mpesa-query.js';

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route to handlers
    if (path === '/api/mpesa-initiate' || path === '/mpesa-initiate') {
      const response = await handleMpesaInitiate(request, env);
      response.headers.set('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
      return response;
    }

    if (path === '/api/mpesa-query' || path === '/mpesa-query') {
      const response = await handleMpesaQuery(request, env);
      response.headers.set('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
      return response;
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
