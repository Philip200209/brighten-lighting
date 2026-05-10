/**
 * SEO Utilities for dynamic meta tag management
 */

/**
 * Update page meta tags dynamically
 */
export function updateMetaTags({
  title,
  description,
  image = 'https://brighten-lighting.netlify.app/og-image.jpg',
  url = window.location.href,
  type = 'website',
}) {
  // Update title
  document.title = title ? `${title} | Brighten Lighting` : 'Brighten Lighting';

  // Update meta description
  updateMetaTag('description', description);
  updateMetaTag('og:description', description);
  updateMetaTag('twitter:description', description);

  // Update OG tags
  updateMetaTag('og:title', title);
  updateMetaTag('og:image', image);
  updateMetaTag('og:url', url);
  updateMetaTag('og:type', type);
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:image', image);
}

/**
 * Update individual meta tag
 */
function updateMetaTag(name, content) {
  let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    const isProperty = name.includes('og:') || name.includes('twitter:');
    isProperty ? element.setAttribute('property', name) : element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

/**
 * Generate SEO-friendly product JSON-LD schema
 */
export function generateProductSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': product.image_url,
    'price': product.price,
    'priceCurrency': 'KES',
    'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    'category': product.category,
    'url': `https://brighten-lighting.netlify.app/shop?product=${product.id}`,
  };
}

/**
 * Generate SEO-friendly breadcrumb schema
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  };
}

/**
 * Inject JSON-LD schema into page head
 */
export function injectSchema(schema) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Generate sitemap XML
 */
export function generateSitemap(products = []) {
  const baseUrl = 'https://brighten-lighting.netlify.app';
  
  const pages = [
    { url: '', priority: 1.0 },
    { url: '/shop', priority: 0.9 },
    { url: '/about', priority: 0.8 },
    { url: '/contact', priority: 0.8 },
  ];

  const productPages = products.map(p => ({
    url: `/shop?product=${p.id}`,
    priority: 0.7,
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pages, ...productPages].map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>${page.priority}</priority>
  </url>
`).join('')}
</urlset>`;

  return sitemap;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

Sitemap: https://brighten-lighting.netlify.app/sitemap.xml

# Respect crawl delay
Crawl-delay: 1

# Google-specific
User-agent: Googlebot
Crawl-delay: 0`;
}

/**
 * Track event with Google Analytics
 */
export function trackEvent(eventName, eventData = {}) {
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }
}

/**
 * Track page view
 */
export function trackPageView(pagePath, pageTitle) {
  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}

/**
 * Track purchase
 */
export function trackPurchase(transactionId, amount, items = []) {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: amount,
      currency: 'KES',
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });
  }
}

/**
 * Track search
 */
export function trackSearch(searchTerm, resultCount) {
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      result_count: resultCount,
    });
  }
}

/**
 * Track form submission
 */
export function trackFormSubmission(formName, formData = {}) {
  if (window.gtag) {
    window.gtag('event', 'form_submit', {
      form_name: formName,
      ...formData,
    });
  }
}
