# Cloudflare Migration Guide

## Overview
This guide walks you through migrating from Netlify to Cloudflare Pages with Cloudflare Workers for your M-Pesa payment functions.

## What's Changed

### Files Created:
- `wrangler.toml` - Cloudflare Workers configuration
- `src/workers/index.js` - Main Workers entry point
- `src/workers/mpesa-shared.js` - Shared M-Pesa utilities
- `src/workers/mpesa-initiate.js` - STK Push initiate endpoint
- `src/workers/mpesa-query.js` - Payment status query endpoint

### Files to Remove:
- `netlify.toml` - No longer needed
- `netlify/functions/` - Replaced by Workers

### Updated Files:
- `package.json` - Added wrangler and new scripts

## Step 1: Setup Cloudflare Account

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up or log in
3. Create a new project or use existing account

## Step 2: Get Your Account Details

Run this command to authenticate:
```bash
npm run auth
```

Then get your account ID:
```bash
npx wrangler whoami
```

Update `wrangler.toml`:
```toml
account_id = "YOUR_ACCOUNT_ID_HERE"
```

## Step 3: Install Dependencies

```bash
npm install
```

This installs wrangler and all other dependencies.

## Step 4: Set Environment Variables

Set your M-Pesa credentials as Cloudflare secrets:

```bash
# Sandbox environment (testing)
wrangler secret put MPESA_CONSUMER_KEY
wrangler secret put MPESA_CONSUMER_SECRET
wrangler secret put MPESA_BUSINESS_SHORT_CODE
wrangler secret put MPESA_PASS_KEY
wrangler secret put MPESA_CALLBACK_URL
```

For production:
```bash
wrangler secret put MPESA_CONSUMER_KEY --env production
wrangler secret put MPESA_CONSUMER_SECRET --env production
wrangler secret put MPESA_BUSINESS_SHORT_CODE --env production
wrangler secret put MPESA_PASS_KEY --env production
wrangler secret put MPESA_CALLBACK_URL --env production
```

## Step 5: Test Locally

Deploy Workers locally to test:

```bash
npm run workers:dev
```

Your Workers will run at: `http://localhost:8787`

Test endpoints:
- POST `http://localhost:8787/api/mpesa-initiate` - Initiate STK Push
- POST `http://localhost:8787/api/mpesa-query` - Query payment status

## Step 6: Update Frontend API Calls

Update your frontend calls to use the new endpoints. In your M-Pesa service file:

**Before (Netlify):**
```javascript
const response = await fetch('/.netlify/functions/mpesa-initiate', {
  method: 'POST',
  body: JSON.stringify({ phoneNumber, amount, description })
});
```

**After (Cloudflare):**
```javascript
// For development
const baseUrl = import.meta.env.DEV ? 'http://localhost:8787' : '';
const response = await fetch(`${baseUrl}/api/mpesa-initiate`, {
  method: 'POST',
  body: JSON.stringify({ phoneNumber, amount, description })
});
```

Or set environment variables:
```env
VITE_API_BASE_URL=http://localhost:8787  # development
VITE_API_BASE_URL=https://api.yourdomain.com  # production
```

## Step 7: Deploy to Cloudflare Pages

### Option A: Deploy via Cloudflare Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Pages → Create a project
3. Connect your Git repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Deploy!

### Option B: Deploy via CLI

```bash
npm run build
npx wrangler pages deploy dist/
```

## Step 8: Deploy Workers

Deploy your M-Pesa Workers:

```bash
npm run workers:deploy
```

For production:
```bash
wrangler deploy src/workers/index.js --env production
```

## Step 9: Configure Routes (if using custom domain)

In Cloudflare Dashboard → Workers Routes:

Add these routes:
- `yourdomain.com/api/mpesa-initiate` → `bright-mpesa-workers`
- `yourdomain.com/api/mpesa-query` → `bright-mpesa-workers`

## Step 10: Update Environment Variables

Set production environment variables in Cloudflare Dashboard or via:

```bash
wrangler env list
wrangler secret put MPESA_ENVIRONMENT --env production
# Set value to: production
```

## Endpoint Mapping

| Netlify | Cloudflare |
|---------|-----------|
| `/.netlify/functions/mpesa-initiate` | `/api/mpesa-initiate` |
| `/.netlify/functions/mpesa-query` | `/api/mpesa-query` |

## Cost Comparison

### Netlify:
- Free tier: 125,000 function invocations/month
- Overages: $0.40 per 500,000 invocations

### Cloudflare:
- Free tier: 100,000 requests/day (Workers), unlimited bandwidth
- Paid: $5/month for first 10M requests, then $0.50 per million

**Estimated savings: 95%+ for most projects**

## Troubleshooting

### Workers not responding
```bash
# Check deployment status
wrangler deployments list

# View logs
wrangler tail
```

### 404 on API endpoints
- Check that Workers route is configured in Cloudflare Dashboard
- Verify `wrangler.toml` has correct routes
- Check that functions are deployed: `npm run workers:deploy`

### Environment variables not working
```bash
# List all secrets
wrangler secret list

# Verify specific secret is set
wrangler secret list | grep MPESA
```

### CORS issues
The Workers include CORS headers. If still having issues, check:
- Browser console for exact error
- Verify `OPTIONS` requests are being handled
- Check `Access-Control-Allow-Origin` header

## Rollback to Netlify

If you need to rollback:
1. Keep `netlify.toml` and `netlify/functions/` directory
2. Commit to git
3. In Netlify dashboard, redeploy from the commit before migration

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set secrets for sandbox
3. ✅ Test locally: `npm run workers:dev`
4. ✅ Update frontend API endpoints
5. ✅ Deploy Pages: `npx wrangler pages deploy dist/`
6. ✅ Deploy Workers: `npm run workers:deploy`
7. ✅ Set production secrets
8. ✅ Update custom domain routes

## Support

- Cloudflare Docs: https://developers.cloudflare.com/
- Workers Documentation: https://developers.cloudflare.com/workers/
- Pages Documentation: https://developers.cloudflare.com/pages/
