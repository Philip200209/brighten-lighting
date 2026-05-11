# ✅ Cloudflare Migration Checklist

## Quick Start (15 minutes)

### 1. Install & Authenticate
- [ ] `npm install` - Install wrangler
- [ ] `npx wrangler login` - Authenticate with Cloudflare
- [ ] `npx wrangler whoami` - Get your Account ID
- [ ] Update `wrangler.toml` with your Account ID

### 2. Local Testing (5 minutes)
- [ ] `npm run workers:dev` - Start local Workers
- [ ] Test endpoints at `http://localhost:8787`
  - POST to `/api/mpesa-initiate` with test data
  - POST to `/api/mpesa-query` with checkoutRequestId

### 3. Deploy Pages (5 minutes)
- [ ] `npm run build` - Build React app
- [ ] `npx wrangler pages deploy dist/` - Deploy to Cloudflare Pages
- [ ] Note your deployment URL

### 4. Deploy Workers (2 minutes)
- [ ] Set sandbox secrets:
  ```bash
  wrangler secret put MPESA_CONSUMER_KEY
  wrangler secret put MPESA_CONSUMER_SECRET
  wrangler secret put MPESA_BUSINESS_SHORT_CODE
  wrangler secret put MPESA_PASS_KEY
  wrangler secret put MPESA_CALLBACK_URL
  ```
- [ ] `npm run workers:deploy` - Deploy Workers

### 5. Configure Routes (optional - if using custom domain)
- [ ] In Cloudflare Dashboard → Workers & Pages
- [ ] Add routes to your Workers

## What Changed

**Created:**
- ✅ `wrangler.toml` - Cloudflare configuration
- ✅ `src/workers/` - All M-Pesa functions converted
- ✅ `CLOUDFLARE_MIGRATION.md` - Full migration guide
- ✅ `.env.local.example` - Environment template

**Updated:**
- ✅ `package.json` - Added wrangler + new scripts
- ✅ `src/lib/mpesaService.js` - Uses new endpoints

**Can Delete:**
- ✅ `netlify.toml` (optional, keep for rollback)
- ✅ `netlify/functions/` (optional, keep for rollback)

## Key Commands

```bash
# Local development
npm run dev              # Start React dev server
npm run workers:dev      # Start Cloudflare Workers locally

# Deployment
npm run build           # Build for production
npm run workers:deploy  # Deploy to Cloudflare Workers

# Debugging
npm run lint            # Check for errors
wrangler tail          # View live Worker logs
```

## Endpoints

**Local (dev):**
- POST `http://localhost:8787/api/mpesa-initiate`
- POST `http://localhost:8787/api/mpesa-query`

**Production (replace with your domain):**
- POST `https://yoursite.pages.dev/api/mpesa-initiate`
- POST `https://yoursite.pages.dev/api/mpesa-query`

## Costs

- **Netlify**: ~$0.40 per 500k invocations
- **Cloudflare**: FREE for 100k/day, then $0.50/million
- **Savings**: 95%+ for most projects ✨

---

**Next:** Read `CLOUDFLARE_MIGRATION.md` for detailed steps!
