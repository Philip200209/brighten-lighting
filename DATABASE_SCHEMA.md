# Brighten Lighting - Database Schema

Complete database structure for Brighten Lighting production application.

## Tables Overview

| Table | Purpose | Records | Primary Use |
|-------|---------|---------|-------------|
| products | Product catalog | ~50-500 | Shop display, Admin management |
| inquiries | Customer inquiries | Unlimited | Contact form, Admin management |
| payments | Payment transactions | Unlimited | M-Pesa tracking, Reporting |

---

## Table: products

Stores all product information for the lighting shop.

### Schema

```sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  stock INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
```

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO | Unique product identifier |
| name | VARCHAR(255) | NOT NULL | Product name (e.g., "Aura Gold Pendant") |
| category | VARCHAR(100) | NOT NULL | Category (e.g., "Pendant Lights") |
| price | DECIMAL(10,2) | NOT NULL | Price in KES (0-9999999.99) |
| description | TEXT | NOT NULL | Product description (500+ characters) |
| image_url | TEXT | NOT NULL | Image URL or data URI |
| stock | INTEGER | DEFAULT 10 | Available stock quantity |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### Sample Records

```sql
INSERT INTO products VALUES
(1, 'Aura Gold Pendant', 'Pendant Lights', 15500, 'Stunning minimalist gold pendant...', 'https://...', 15, NOW(), NOW()),
(2, 'Lumina Chandelier', 'Ceiling Lights', 45000, 'Modern cinematic chandelier...', 'https://...', 8, NOW(), NOW()),
(3, 'Eclipse Wall Sconce', 'Wall Lights', 8500, 'Sleek black and gold wall sconce...', 'https://...', 25, NOW(), NOW());
```

### Usage Examples

```javascript
// Get all products
const products = await productsService.getAll();

// Get by category
const pendants = await productsService.getByCategory('Pendant Lights');

// Search products
const results = await productsService.search('gold');

// Create product
await productsService.create({
  name: 'New Light',
  category: 'Pendant Lights',
  price: 12000,
  description: 'Description...',
  image_url: 'https://...',
  stock: 20
});

// Update product
await productsService.update(1, { price: 16000, stock: 14 });

// Delete product
await productsService.delete(1);
```

### Queries

```sql
-- Get featured products
SELECT * FROM products WHERE stock > 0 ORDER BY created_at DESC LIMIT 6;

-- Get low stock products
SELECT * FROM products WHERE stock < 5 ORDER BY stock ASC;

-- Get products by price range
SELECT * FROM products WHERE price BETWEEN 10000 AND 50000 ORDER BY price;

-- Count products by category
SELECT category, COUNT(*) as count FROM products GROUP BY category;
```

---

## Table: inquiries

Stores customer inquiries and contact form submissions.

### Schema

```sql
CREATE TABLE inquiries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  subject VARCHAR(255),
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_email ON inquiries(email);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
```

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO | Unique inquiry identifier |
| name | VARCHAR(255) | NOT NULL | Customer name |
| email | VARCHAR(255) | NOT NULL | Customer email |
| phone | VARCHAR(20) | NULLABLE | Customer phone number |
| message | TEXT | NOT NULL | Inquiry message |
| subject | VARCHAR(255) | NULLABLE | Inquiry subject |
| product_id | BIGINT | FK → products | Related product (if applicable) |
| status | VARCHAR(50) | DEFAULT 'new' | Status: new/resolved/spam |
| created_at | TIMESTAMP | DEFAULT NOW() | Inquiry submitted timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last status update timestamp |

### Status Values

- `new` - Fresh inquiry, not yet reviewed
- `resolved` - Inquiry handled/answered
- `spam` - Marked as spam
- `archived` - Resolved and archived

### Sample Records

```sql
INSERT INTO inquiries VALUES
(1, 'John Doe', 'john@example.com', '0712345678', 'Is this product dimmable?', 'Product Question', 1, 'new', NOW(), NOW()),
(2, 'Jane Smith', 'jane@example.com', '0722345678', 'Bulk order inquiry for office', 'Bulk Order', NULL, 'new', NOW(), NOW());
```

### Usage Examples

```javascript
// Get all inquiries
const inquiries = await inquiriesService.getAll();

// Get by status
const newInquiries = await inquiriesService.getByStatus('new');

// Create inquiry (from contact form)
await inquiriesService.create({
  name: 'Customer Name',
  email: 'email@example.com',
  phone: '0712345678',
  message: 'I am interested in...',
  subject: 'Product Inquiry',
  product_id: null,
  status: 'new'
});

// Update status
await inquiriesService.updateStatus(1, 'resolved');

// Delete inquiry
await inquiriesService.delete(1);
```

### Queries

```sql
-- Get new inquiries
SELECT * FROM inquiries WHERE status = 'new' ORDER BY created_at DESC;

-- Get inquiries from last 7 days
SELECT * FROM inquiries 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Get inquiries with product details
SELECT i.*, p.name as product_name, p.price 
FROM inquiries i
LEFT JOIN products p ON i.product_id = p.id
WHERE i.status = 'new';

-- Count inquiries by status
SELECT status, COUNT(*) as count FROM inquiries GROUP BY status;
```

---

## Table: payments

Stores all M-Pesa payment transactions.

### Schema

```sql
CREATE TABLE payments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  phone_number VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  product_id BIGINT REFERENCES products(id),
  inquiry_id BIGINT REFERENCES inquiries(id),
  status VARCHAR(50) DEFAULT 'pending',
  transaction_ref VARCHAR(255),
  mpesa_receipt_number VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_phone ON payments(phone_number);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_transaction_ref ON payments(transaction_ref);
```

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO | Unique payment identifier |
| phone_number | VARCHAR(20) | NOT NULL | Customer M-Pesa phone |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount in KES |
| product_id | BIGINT | FK → products | Product purchased (optional) |
| inquiry_id | BIGINT | FK → inquiries | Related inquiry (optional) |
| status | VARCHAR(50) | DEFAULT 'pending' | Status: pending/completed/failed |
| transaction_ref | VARCHAR(255) | NULLABLE | M-Pesa CheckoutRequestID |
| mpesa_receipt_number | VARCHAR(255) | NULLABLE | M-Pesa receipt number after completion |
| notes | TEXT | NULLABLE | Internal notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Payment initiated timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last status update timestamp |

### Status Values

- `pending` - Payment initiated, waiting for confirmation
- `completed` - Payment successful
- `failed` - Payment failed
- `cancelled` - Customer cancelled

### Sample Records

```sql
INSERT INTO payments VALUES
(1, '254712345678', 15500, 1, NULL, 'completed', 'ws_CO_191220202007291234', 'LHD2146E5K', NULL, NOW(), NOW()),
(2, '254722345678', 45000, 2, NULL, 'pending', 'ws_CO_191220202008124567', NULL, 'Waiting for confirmation', NOW(), NOW());
```

### Usage Examples

```javascript
// Get all payments
const payments = await paymentsService.getAll();

// Create payment record
await paymentsService.create({
  phone_number: '254712345678',
  amount: 15500,
  product_id: 1,
  inquiry_id: null,
  status: 'pending',
  transaction_ref: 'ws_CO_xxx',
  notes: 'Purchase of Aura Gold Pendant'
});

// Update payment status
await paymentsService.updateStatus(1, 'completed', {
  mpesa_receipt_number: 'LHD2146E5K'
});
```

### Queries

```sql
-- Get payment summary
SELECT 
  DATE(created_at) as date,
  COUNT(*) as transactions,
  SUM(amount) as total_amount,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
FROM payments
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Get revenue by product
SELECT 
  p.name,
  COUNT(pa.id) as purchases,
  SUM(pa.amount) as revenue
FROM payments pa
LEFT JOIN products p ON pa.product_id = p.id
WHERE pa.status = 'completed'
GROUP BY p.name
ORDER BY revenue DESC;

-- Get today's transactions
SELECT * FROM payments 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Get failed payments
SELECT * FROM payments 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

---

## Relationships & Constraints

### Foreign Key Relationships

```
products (1) ─── (N) inquiries
  ↓product_id

products (1) ─── (N) payments
  ↓product_id

inquiries (1) ─── (N) payments
  ↓inquiry_id
```

### Data Integrity

- Deleting a product cascades to inquiries (SET NULL)
- Deleting an inquiry cascades to payments (SET NULL)
- Timestamps are automatically managed
- Indexes optimize common queries

---

## Backup & Recovery

### Daily Backups

Supabase automatically backs up your database:

```bash
# To restore from backup:
# 1. Go to Supabase Dashboard
# 2. Settings > Database > Backups
# 3. Click "Restore" on desired backup point
```

### Manual Exports

```sql
-- Export products
SELECT * FROM products 
TO '/path/to/products_backup.csv'
WITH (FORMAT csv, DELIMITER ',', HEADER);
```

---

## Performance Optimization

### Index Strategy

Indexes are created on:
- `products.category` - For category filtering
- `inquiries.status` - For admin dashboard filters
- `inquiries.email` - For duplicate detection
- `payments.status` - For payment reports
- `payments.created_at` - For date-based queries

### Query Optimization Tips

1. Always use indexes in WHERE clauses
2. Use SELECT specific columns, not SELECT *
3. Limit results with LIMIT and OFFSET
4. Use JOINs efficiently
5. Avoid N+1 queries

---

## Security Considerations

### Row Level Security (RLS)

Enable RLS on all tables:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

### Policies

```sql
-- Public read access to products
CREATE POLICY "Public can read products"
ON products FOR SELECT
TO public
USING (true);

-- Admin only for payments
CREATE POLICY "Admin access to payments"
ON payments
USING (auth.jwt() ->> 'email' = 'info@brighteninglighting.com');
```

---

## Maintenance Tasks

### Weekly
- Check for failed payments
- Review new inquiries
- Monitor stock levels

### Monthly
- Analyze payment patterns
- Clean up spam inquiries
- Review database performance

### Quarterly
- Full database audit
- Backup verification
- Security review

---

## Migration Guide

### Adding a New Field

```sql
ALTER TABLE products ADD COLUMN sku VARCHAR(50);
UPDATE products SET sku = CONCAT('SKU-', id);
ALTER TABLE products ALTER COLUMN sku SET NOT NULL;
```

### Adding a New Table

```sql
CREATE TABLE reviews (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES products(id),
  customer_name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

**Database Version:** 1.0  
**Last Updated:** May 2026  
**Maintainer:** Brighten Lighting Dev Team
