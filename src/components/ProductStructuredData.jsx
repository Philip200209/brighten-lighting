import React from 'react';

export default function ProductStructuredData({ product }) {
  if (!product) return null;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image_url || product.image || `${window.location.origin}/assets/hero.png`],
    "description": product.description || '',
    "sku": product.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || 'Brighten Lighting'
    },
    "offers": {
      "@type": "Offer",
      "url": `${window.location.origin}/products/${product.id}`,
      "priceCurrency": product.currency || 'KES',
      "price": product.price != null ? String(product.price) : undefined,
      "availability": product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
}
