# Production Implementation Checklist

Complete implementation guide for Brighten Lighting production deployment.

## Phase 1: Initial Setup ✅ COMPLETED

- [x] Updated package.json with all required dependencies
  - @supabase/supabase-js v2.45.0
  - axios v1.7.2
  - react-hot-toast v2.4.1
  - react-gtag v1.0.0
  - resend v3.0.0

- [x] Created environment configuration
  - .env.example with all required variables
  - .env.local template ready for credentials

- [x] Implemented Supabase integration
  - src/lib/supabase.js with client setup
  - Authentication service functions
  - Products service CRUD operations
  - Inquiries service with status management
  - Payments service for transactions

- [x] Created authentication system
  - src/contexts/AuthContext.jsx for state management
  - src/components/ProtectedRoute.jsx for admin protection
  - Login page with email/password and password reset
  - Session persistence and auto-login

- [x] Updated admin pages for Supabase
  - Products.jsx - Full CRUD with real database
  - Inquiries.jsx - Real inquiry management
  - Added email notifications and status tracking

- [x] Enhanced contact form
  - Contact.jsx - Supabase inquiry storage
  - Automatic email notifications to admin
  - Customer confirmation emails
  - Real-time form submission

- [x] Implemented email notifications
  - src/lib/emailService.js with Resend integration
  - Inquiry notification templates
  - Customer confirmation emails
  - Payment receipt emails

- [x] Added M-Pesa payment integration
  - src/lib/mpesaService.js with Daraja API
  - src/components/MpesaPaymentForm.jsx for UI
  - Payment processing and tracking
  - Transaction verification

- [x] Created SEO optimization
  - src/lib/seoUtils.js with meta tag utilities
  - src/components/Head.jsx for dynamic meta tags
  - index.html with complete SEO tags
  - JSON-LD schema generation

- [x] Setup Google Analytics
  - Analytics event tracking
  - Page view tracking
  - Purchase tracking
  - Form submission tracking

---

## Phase 2: Configuration (USER ACTION REQUIRED)

### [ ] 2.1 Supabase Project Setup

- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project "brighten-lighting"
- [ ] Get Project URL
  - Save to VITE_SUPABASE_URL in .env.local
- [ ] Get anon public key
  - Save to VITE_SUPABASE_ANON_KEY in .env.local
- [ ] Go to SQL Editor and run database schema SQL
  - SQL provided in SETUP_GUIDE.md section 1.3
- [ ] Create admin user in Authentication > Users
  - Email: info@brightenlighting.com
  - Password: (your chosen password)
- [ ] Verify connection
  - Run: npm run dev
  - Check browser console for errors

### [ ] 2.2 Email Setup (Resend)

- [ ] Create Resend account at https://resend.com
- [ ] Create API key
  - Save to VITE_RESEND_API_KEY in .env.local
- [ ] Set recipient email
  - Save to VITE_RECIPIENT_EMAIL in .env.local
  - Default: Info@brightenlighting.com
- [ ] (Optional) Add custom email domain
  - Add DNS records as Resend guides
  - Verify domain ownership

### [ ] 2.3 M-Pesa Setup

- [ ] Go to https://developer.safaricom.co.ke
- [ ] Create developer account
- [ ] Create application
- [ ] Request Lipa Na M-Pesa Online credentials
- [ ] Get credentials:
  - Consumer Key → VITE_MPESA_CONSUMER_KEY
  - Consumer Secret → VITE_MPESA_CONSUMER_SECRET
- [ ] Use provided sandbox credentials:
  - Business Short Code: 174379
  - Pass Key: bfb279f9aa9bdbcf158e97dd1a503b6e
  - Environment: sandbox (for testing)

### [ ] 2.4 Analytics Setup (Optional)

- [ ] Go to https://analytics.google.com
- [ ] Create new property
- [ ] Get Measurement ID (G-XXXXXXXXXX)
- [ ] Save to VITE_GA_MEASUREMENT_ID in .env.local
- [ ] Verify tracking in browser DevTools

### [ ] 2.5 Complete .env.local File

Copy this template and fill in your values:

```env
# Supabase (from project settings)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Admin Login (create user in Supabase Auth)
VITE_ADMIN_EMAIL=info@brightenlighting.com
VITE_ADMIN_PASSWORD=your-secure-password-here

# Email (from Resend dashboard)
VITE_RESEND_API_KEY=re_xxxxx
VITE_RECIPIENT_EMAIL=Info@brightenlighting.com

# M-Pesa (sandbox credentials provided, or get your own)
VITE_MPESA_CONSUMER_KEY=xxxxxxx
VITE_MPESA_CONSUMER_SECRET=xxxxxxx
VITE_MPESA_BUSINESS_SHORT_CODE=174379
VITE_MPESA_PASS_KEY=bfb279f9aa9bdbcf158e97dd1a503b6e
VITE_MPESA_ENVIRONMENT=sandbox

# Analytics (from Google Analytics)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# App Config
VITE_APP_NAME=Brighten Lighting
VITE_APP_DOMAIN=brighten-lighting.netlify.app
```

---

## Phase 3: Testing Locally

### [ ] 3.1 Install & Run

- [ ] npm install
- [ ] npm run dev
- [ ] Open http://localhost:5173

### [ ] 3.2 Test Admin Features

- [ ] Go to /admin/login
- [ ] Login with admin credentials
- [ ] Add a test product
  - Name: "Test Light"
  - Category: "Pendant Lights"
  - Price: 10000
  - Stock: 10
  - Upload test image
- [ ] Edit the product
- [ ] Delete the product
- [ ] Check /admin/inquiries (should be empty)

### [ ] 3.3 Test Customer Features

- [ ] Go to /contact
- [ ] Fill inquiry form with:
  - Name: "Test User"
  - Email: "test@example.com"
  - Phone: "0712345678"
  - Subject: "Test Inquiry"
  - Message: "This is a test"
- [ ] Submit and verify success message
- [ ] Check Supabase → inquiries table for entry
- [ ] Check email for:
  - Admin notification (check spam folder)
  - Customer confirmation email
- [ ] Go to /admin/inquiries to see inquiry

### [ ] 3.4 Test M-Pesa Payment (Sandbox)

- [ ] Go to /shop
- [ ] Click "Pay with M-Pesa" on any product (or add test product first)
- [ ] Enter test phone: 0712345678
- [ ] Click "Pay with M-Pesa"
- [ ] Verify success message
- [ ] Check Supabase → payments table for transaction
- [ ] Verify status is "pending"

### [ ] 3.5 Test Authentication

- [ ] Login as admin → Dashboard
- [ ] Go to /admin/login and click "Forgot password"
- [ ] Enter admin email
- [ ] Check email for password reset link
- [ ] Test reset flow (don't actually reset if using real account)
- [ ] Logout and verify redirect to /admin/login

### [ ] 3.6 Test SEO

- [ ] Open DevTools → Elements
- [ ] Check meta tags in <head>:
  - og:title
  - og:description
  - og:image
  - og:url
- [ ] Check robots.txt at /robots.txt
- [ ] Check sitemap.xml generation works

---

## Phase 4: Deploy to Netlify

### [ ] 4.1 Prepare for Build

- [ ] npm run build
- [ ] Verify dist/ folder is created
- [ ] Check build size is reasonable

### [ ] 4.2 Connect to Netlify

#### Option A: GitHub Integration (Recommended)

- [ ] Push code to GitHub
- [ ] Go to https://netlify.com
- [ ] Click "New site from Git"
- [ ] Select GitHub and authorize
- [ ] Select "bright" repository
- [ ] Configure build:
  - Build command: npm run build
  - Publish directory: dist
  - Click "Deploy site"

#### Option B: Manual Deploy

- [ ] Run: npm run build
- [ ] Go to https://netlify.com/drop
- [ ] Drag & drop dist/ folder
- [ ] Get temporary URL

### [ ] 4.3 Add Environment Variables

- [ ] In Netlify project → Settings → Build & deploy → Environment
- [ ] Add all variables from .env.local:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_ADMIN_EMAIL
  - VITE_ADMIN_PASSWORD
  - VITE_RESEND_API_KEY
  - VITE_RECIPIENT_EMAIL
  - VITE_MPESA_CONSUMER_KEY
  - VITE_MPESA_CONSUMER_SECRET
  - VITE_MPESA_BUSINESS_SHORT_CODE
  - VITE_MPESA_PASS_KEY
  - VITE_MPESA_ENVIRONMENT
  - VITE_GA_MEASUREMENT_ID
  - VITE_APP_NAME
  - VITE_APP_DOMAIN
- [ ] Trigger rebuild

### [ ] 4.4 Test Live Deployment

- [ ] Visit Netlify URL
- [ ] Test all features:
  - Product shop loads
  - Admin login works
  - Contact form sends emails
  - M-Pesa payment initiates
- [ ] Check console for errors

### [ ] 4.5 Custom Domain Setup

- [ ] In Netlify → Domain settings
- [ ] Add custom domain: www.brightenlighting.com
- [ ] Note the nameservers provided
- [ ] Go to domain registrar (GoDaddy, Namecheap, etc.)
- [ ] Update nameservers to Netlify's
- [ ] Wait 24-48 hours for DNS propagation
- [ ] Verify custom domain works

---

## Phase 5: Production Hardening

### [ ] 5.1 Security

- [ ] Change admin password to something strong
- [ ] Store credentials securely (password manager)
- [ ] Enable Supabase backups
- [ ] Review Supabase Row Level Security policies
- [ ] Set up 2FA on admin email account

### [ ] 5.2 Email Configuration

- [ ] For Resend (if not already):
  - Add company domain for emails
  - Add DNS records
  - Verify SPF/DKIM/DMARC
- [ ] Test sending emails to real addresses
- [ ] Setup email forwarding for Info@brightenlighting.com

### [ ] 5.3 M-Pesa Production (When Ready)

- [ ] Contact Safaricom for production credentials
- [ ] Update:
  - VITE_MPESA_CONSUMER_KEY (production)
  - VITE_MPESA_CONSUMER_SECRET (production)
  - VITE_MPESA_ENVIRONMENT=production
- [ ] Test with real payment
- [ ] Monitor payment dashboard

### [ ] 5.4 Analytics

- [ ] Verify Google Analytics is tracking
- [ ] Check real user data arriving
- [ ] Set up goals:
  - Product purchase
  - Inquiry form submission
  - Support contact

### [ ] 5.5 Database Backup

- [ ] In Supabase → Settings → Database → Backups
- [ ] Verify automatic daily backups are enabled
- [ ] Test restore process (don't actually restore production)

### [ ] 5.6 Monitoring

- [ ] Enable error tracking (optional: Sentry)
- [ ] Set up email alerts for errors
- [ ] Monitor Netlify deployment logs
- [ ] Check bandwidth usage

---

## Phase 6: Launch Preparation

### [ ] 6.1 Content

- [ ] Update homepage banner
- [ ] Add product images for at least 8 products
- [ ] Write compelling product descriptions
- [ ] Add testimonials/reviews
- [ ] Update About page
- [ ] Add business hours on Contact

### [ ] 6.2 Legal

- [ ] Add Terms of Service
- [ ] Add Privacy Policy
- [ ] Add Return Policy
- [ ] Add Cookie consent banner

### [ ] 6.3 Marketing

- [ ] Create social media accounts
- [ ] Add social media links to footer
- [ ] Set up Google Business profile
- [ ] Add WhatsApp number to contact
- [ ] Create basic email template for responses

### [ ] 6.4 Testing Checklist

- [ ] [ ] Test on Chrome, Firefox, Safari
- [ ] [ ] Test on mobile (iOS & Android)
- [ ] [ ] Test form validation
- [ ] [ ] Test payment flow end-to-end
- [ ] [ ] Test email delivery
- [ ] [ ] Test admin dashboard
- [ ] [ ] Performance test (Lighthouse)
- [ ] [ ] Security scan (no console errors)

---

## Phase 7: Launch

### [ ] 7.1 Pre-Launch

- [ ] Final testing on live site
- [ ] Announce on social media
- [ ] Send launch email to contacts
- [ ] Monitor for issues first 24 hours

### [ ] 7.2 Post-Launch Monitoring

- [ ] Daily: Check admin dashboard for inquiries
- [ ] Daily: Monitor payments
- [ ] Weekly: Review analytics
- [ ] Weekly: Check backup status
- [ ] Monthly: Review error logs

### [ ] 7.3 Future Improvements

- [ ] Customer accounts & order tracking
- [ ] Advanced analytics
- [ ] Product reviews & ratings
- [ ] Email marketing integration
- [ ] Mobile app (React Native)

---

## Reference Documentation

- **Quick Setup:** [QUICKSTART.md](./QUICKSTART.md)
- **Full Guide:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Database:** [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **Production:** [README_PRODUCTION.md](./README_PRODUCTION.md)

---

## Support Resources

- **Supabase:** https://supabase.com/docs
- **Resend:** https://resend.com/docs
- **M-Pesa Daraja:** https://developer.safaricom.co.ke
- **Netlify:** https://docs.netlify.com
- **React:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**Status:** Ready for implementation  
**Last Updated:** May 2026  
**Version:** 1.0

Total Implementation Time: ~4-6 hours (depending on familiarity)
