# Admin Authentication Setup

This project uses Supabase Auth plus a `profiles` table to support multiple admins.

## 1. Create the `profiles` table

Run the hardened SQL file at [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor.

If you prefer to paste it manually, the same file contains the full production schema, RLS policies, and trigger setup.
Why this matters:
- It creates the `profiles`, `products`, `inquiries`, and `payments` tables.
- It enables Row Level Security and applies admin/user policies.
- It replaces the temporary local fallback mode with a proper database-backed setup.

## 2. Add admin user

After the schema is applied, create or update the admin profile so the dashboard recognizes your account.

## 5. Auth settings

Set your Supabase Auth redirect URLs to include:

- `http://localhost:5173/admin/reset-password`
- your production admin reset URL

## 6. How the app uses this

- Register creates a Supabase Auth user.
- The app inserts a matching `profiles` row with `role = 'admin'`.
- Login accepts username or email.
- `ProtectedRoute` only allows access when `profile.role === 'admin'`.
- Products, inquiries, and payments are read from Supabase when the tables exist; otherwise the app now falls back locally so the UI still works during setup.

## 7. Local test flow

1. Apply the SQL above.
2. Create or reuse an admin user.
3. Run the app:

```bash
npm run dev
```

4. Open `/admin/login`.
5. Log in using username or email.
6. Confirm non-admin accounts are redirected away from `/admin`.
