# Brighten Lighting - Production Setup Guide

This guide walks you through setting up the complete production-ready Brighten Lighting application with Supabase, authentication, email notifications, M-Pesa payments, and analytics.

## Prerequisites

- Node.js v18+ installed
- npm or yarn package manager
- A Supabase account (free tier available at https://supabase.com)
- A Resend account for emails (free tier available at https://resend.com)
- M-Pesa Daraja API credentials (from Safaricom)
- Google Analytics account (optional but recommended)

## 1. Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the form:
   - Project Name: `brighten-lighting`
   - Database Password: Save this securely
   - Region: Choose closest to your location (e.g., Europe-West-1)
4. Click "Create new project" and wait for it to be provisioned (5-10 minutes)

### 1.2 Get Your API Keys

1. In your Supabase project, go to **Settings > API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon (public) key** → `VITE_SUPABASE_ANON_KEY`

### 1.3 Create Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Run the hardened schema from [supabase/schema.sql](supabase/schema.sql).
   This file creates `profiles`, `products`, `inquiries`, and `payments`, then enables RLS policies for production use.

### 1.4 Enable Row Level Security (RLS)

1. The SQL file already enables RLS and creates policies.
2. If you change the schema manually later, make sure RLS stays enabled on all tables.

## 2. Email Setup (Resend)

### 2.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address
4. Go to **API Keys** and create a new API key
5. Copy the key → `VITE_RESEND_API_KEY`

### 2.2 Set Up Email Domain (Optional but Recommended)

For production:
1. In Resend dashboard, add your domain
2. Add DNS records as instructed
3. Verify domain

For testing, the default `noreply@resend.dev` domain works fine.

## 3. M-Pesa Setup

### 3.1 Get M-Pesa Daraja API Credentials

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create a developer account
3. Create a new app
4. Request for Lipa Na M-Pesa Online credentials
5. You'll receive:
   - `Consumer Key` → `VITE_MPESA_CONSUMER_KEY`
   - `Consumer Secret` → `VITE_MPESA_CONSUMER_SECRET`
   - Business Short Code: `174379` (or your business code)
   - Pass Key: `bfb279f9aa9bdbcf158e97dd1a503b6e` (sandbox)

### 3.2 Configure M-Pesa Environment

- For testing: Set `VITE_MPESA_ENVIRONMENT=sandbox`
- For production: Set `VITE_MPESA_ENVIRONMENT=production` and update credentials

## 4. Google Analytics (Optional)

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new property for your website
3. Get your Measurement ID: `G-XXXXXXXXXX`
4. Set `VITE_GA_MEASUREMENT_ID` in your `.env` file

## 5. Environment Variables

### 5.1 Create `.env.local` File

Copy `.env.example` to `.env.local` and fill in all values:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Credentials (for first setup, change these!)
VITE_ADMIN_EMAIL=info@brighteninglighting.com
VITE_ADMIN_PASSWORD=your-secure-password

# Email Configuration
VITE_RESEND_API_KEY=your-resend-api-key
VITE_RECIPIENT_EMAIL=Info@brighteninglighting.co.ke

# M-Pesa Configuration
VITE_MPESA_CONSUMER_KEY=your-mpesa-consumer-key
VITE_MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
VITE_MPESA_BUSINESS_SHORT_CODE=174379
VITE_MPESA_PASS_KEY=bfb279f9aa9bdbcf158e97dd1a503b6e
VITE_MPESA_ENVIRONMENT=sandbox

# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
VITE_APP_NAME=Brighten Lighting
VITE_APP_DOMAIN=brighten-lighting.netlify.app
```

## 6. Installation & Setup

### 6.1 Install Dependencies

```bash
npm install
```

### 6.2 Create Supabase Admin User

Use the Supabase dashboard to create your admin user:

1. Go to **Authentication > Users**
2. Click **Add user** (or invite)
3. Create user with email: `info@brighteninglighting.com`
4. Set password (use the one from `VITE_ADMIN_PASSWORD`)
5. Confirm email

### 6.3 Seed Sample Data

Create a file `src/lib/seedDatabase.js`:

```javascript
import { productsService } from './supabase';

const SAMPLE_PRODUCTS = [
  {
    name: 'Aura Gold Pendant',
    category: 'Pendant Lights',
    price: 15500,
    description: 'A stunning minimalist gold pendant light that adds warmth and elegance to any dining or living area.',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800',
    stock: 15,
  },
  {
    name: 'Lumina Chandelier',
    category: 'Ceiling Lights',
    price: 45000,
    description: 'Modern cinematic chandelier with adjustable arms and soft glowing bulbs. Perfect for a grand entryway.',
    image_url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5e8d?auto=format&fit=crop&q=80&w=800',
    stock: 8,
  },
  {
    name: 'Eclipse Wall Sconce',
    category: 'Wall Lights',
    price: 8500,
    description: 'Sleek black and gold wall sconce providing indirect ambient lighting for hallways and bedrooms.',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
    stock: 25,
  },
  {
    name: 'Zenith Outdoor Lantern',
    category: 'Outdoor Lights',
    price: 12000,
    description: 'Weather-resistant outdoor lantern with a warm vintage glow. Ideal for patios and garden pathways.',
    image_url: 'https://images.unsplash.com/photo-1580130080645-8120d938bf8c?auto=format&fit=crop&q=80&w=800',
    stock: 12,
  },
  {
    name: 'Nova Drop Light',
    category: 'Pendant Lights',
    price: 9800,
    description: 'Industrial-chic drop light with exposed filament bulb and matte black finish.',
    image_url: 'https://images.unsplash.com/photo-1540932239986-30128078f3b5?auto=format&fit=crop&q=80&w=800',
    stock: 20,
  },
  {
    name: 'Edison Vintage Bulb Set',
    category: 'Decorative Bulbs',
    price: 4500,
    description: 'Set of 4 vintage Edison-style LED bulbs with warm glow and classic design.',
    image_url: 'https://images.unsplash.com/photo-1565049666747-69f6646db940?auto=format&fit=crop&q=80&w=800',
    stock: 30,
  },
  {
    name: 'Smart LED Strip Lights',
    category: 'Smart Lights',
    price: 6800,
    description: 'RGB smart LED strips controlled via mobile app. Create any mood lighting you want.',
    image_url: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b2?auto=format&fit=crop&q=80&w=800',
    stock: 18,
  },
  {
    name: 'Table Lamp Pro',
    category: 'Table Lamps',
    price: 7200,
    description: 'Modern table lamp with adjustable brightness and flexible neck for perfect reading light.',
    image_url: 'https://images.unsplash.com/photo-1565182999555-b4e20bc8ddb2?auto=format&fit=crop&q=80&w=800',
    stock: 22,
  },
  {
    name: 'Floor Lamp Elegance',
    category: 'Floor Lights',
    price: 11000,
    description: 'Tall floor lamp with arc design and three light points for ambient and accent lighting.',
    image_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800',
    stock: 10,
  },
  {
    name: 'Ceiling Fan with Light',
    category: 'Ceiling Lights',
    price: 18000,
    description: 'Energy-efficient ceiling fan with integrated LED lighting and remote control.',
    image_url: 'https://images.unsplash.com/photo-1565049666747-69f6646db940?auto=format&fit=crop&q=80&w=800',
    stock: 7,
  },
];

export async function seedDatabase() {
  try {
    // Check if products already exist
    const existing = await productsService.getAll();
    if (existing.length > 0) {
      console.log('Database already has products. Skipping seed.');
      return;
    }

    // Add sample products
    for (const product of SAMPLE_PRODUCTS) {
      await productsService.create(product);
    }

    console.log('✓ Database seeded successfully with 10 sample products');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
```

Then run in console when needed:
```javascript
import { seedDatabase } from './src/lib/seedDatabase.js';
await seedDatabase();
```

## 7. Run Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

### 7.1 Test Admin Login

1. Navigate to `/admin/login`
2. Enter your admin email and password
3. You should be redirected to the dashboard

## 8. Build for Production

```bash
npm run build
```

## 9. Deploy to Netlify

### 9.1 Connect GitHub Repository

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Set build command: `npm run build`
6. Set publish directory: `dist`

### 9.2 Add Environment Variables

1. In Netlify project settings, go to **Build & deploy > Environment**
2. Add all environment variables from your `.env.local`
3. Trigger a rebuild

### 9.3 Set Up Custom Domain

1. In Netlify, go to **Domain settings**
2. Add your custom domain: `www.brighteninglighting.com`
3. Update your domain registrar's DNS to point to Netlify

## 10. Testing M-Pesa Payments

### Test Phone Numbers (Sandbox Mode)

Use any number in format: `254712345678`

### Test Amounts

- Any amount works in sandbox
- PIN: `1234`

### Test Credentials

- Business Short Code: `174379`
- Pass Key: `bfb279f9aa9bdbcf158e97dd1a503b6e`

## 11. Monitoring & Maintenance

### 11.1 Monitor Inquiries

Check the admin dashboard regularly for new inquiries:
- `/admin/inquiries` - View all customer inquiries
- Mark as resolved when handled
- Delete completed inquiries

### 11.2 Monitor Payments

All M-Pesa payments are logged in the `payments` table:
- View transaction history
- Check payment status
- Download payment reports

### 11.3 Monitor Analytics

- Google Analytics dashboard for visitor metrics
- Supabase dashboard for database usage
- Netlify analytics for deployment metrics

## 12. Production Checklist

- [ ] Change admin password from default
- [ ] Set up email domain verification in Resend
- [ ] Switch M-Pesa environment from sandbox to production
- [ ] Update Google Analytics production ID
- [ ] Configure custom domain DNS
- [ ] Enable Supabase backups
- [ ] Set up SSL/TLS (auto-enabled on Netlify)
- [ ] Configure email forwarding from Info@brighteninglighting.co.ke
- [ ] Test contact form and M-Pesa payments
- [ ] Set up error tracking/monitoring
- [ ] Create database backups
- [ ] Set up automated security updates

## 13. Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution:**
```bash
npm install @supabase/supabase-js
```

### Issue: "Supabase credentials not configured"

**Solution:** Ensure all environment variables are set in `.env.local` and restart dev server.

### Issue: Emails not sending

**Solution:**
1. Check Resend API key is correct
2. Verify recipient email is valid
3. Check Resend dashboard for delivery logs

### Issue: M-Pesa payment fails

**Solution:**
1. Verify credentials in `.env.local`
2. Check environment is set to `sandbox` for testing
3. Use valid test phone number format: `254XXXXXXXXX`

### Issue: Admin login not working

**Solution:**
1. Verify user exists in Supabase Authentication > Users
2. Check email matches `VITE_ADMIN_EMAIL`
3. Clear browser cache and try again

## 14. Support & Documentation

- **Supabase Docs:** https://supabase.com/docs
- **Resend Docs:** https://resend.com/docs
- **Safaricom Daraja:** https://developer.safaricom.co.ke
- **Netlify Docs:** https://docs.netlify.com

## 15. Next Steps

After deployment, consider:

1. **Inventory Management** - Add low stock alerts
2. **Customer Accounts** - Let customers track orders
3. **Advanced Analytics** - Revenue tracking, popular products
4. **Marketing** - Email campaigns, discount codes
5. **Mobile App** - React Native app for iOS/Android
6. **Multi-language Support** - Swahili & English

---

**Last Updated:** May 2026
**Version:** 1.0.0
