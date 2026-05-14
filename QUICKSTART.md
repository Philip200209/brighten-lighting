# 🚀 Quick Start Guide

Get Brighten Lighting running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Create Environment File (2 min)

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials. At minimum, get these from:

### Get Supabase Keys
1. Go to https://supabase.com → Create project
2. Copy Project URL and anon key
3. Paste into `.env.local`

### Get Resend Email API Key
1. Go to https://resend.com → Get API key
2. Paste into `VITE_RESEND_API_KEY`

### Get M-Pesa Credentials (Optional for Testing)
1. Use sandbox credentials provided
2. Or get your own at https://developer.safaricom.co.ke

## Step 3: Setup Supabase Database (1 min)

1. In your Supabase project, go to **SQL Editor**
2. Copy-paste the SQL from [SETUP_GUIDE.md](./SETUP_GUIDE.md) section 1.3
3. Run it to create tables

## Step 4: Create Admin User (30 sec)

1. In Supabase, go to **Authentication > Users**
2. Click **Add user**
3. Email: `info@brightenlighting.com` (or your email from `VITE_ADMIN_EMAIL`)
4. Password: (same as `VITE_ADMIN_PASSWORD` in `.env.local`)
5. Click **Send invite**

## Step 5: Run Development Server (30 sec)

```bash
npm run dev
```

Open http://localhost:5173

## ✅ You're Ready!

### Test Admin Panel
- Go to http://localhost:5173/admin/login
- Use your admin credentials
- Add some test products

### Test Customer Features
- Go to http://localhost:5173/contact
- Fill and submit inquiry form
- Check email

### Test M-Pesa Payment
- Go to http://localhost:5173/shop
- Click "Pay with M-Pesa"
- Use test phone: `0712345678`
- Check database for payment record

---

## 📚 Full Documentation

For complete setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

For database details, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

For production deployment, see [README_PRODUCTION.md](./README_PRODUCTION.md)

---

## 🆘 Common Issues

**"Cannot find module '@supabase/supabase-js'"**
```bash
npm install @supabase/supabase-js
```

**"Supabase credentials not found"**
- Check `.env.local` exists in root
- Restart dev server after editing `.env.local`

**Emails not sending**
- Verify Resend API key is correct
- Check VITE_RECIPIENT_EMAIL is valid

**Login not working**
- Verify admin user created in Supabase
- Email must match VITE_ADMIN_EMAIL

---

**Next Step:** Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for comprehensive documentation
