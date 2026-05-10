import { useEffect } from 'react';
import { updateMetaTags } from '../lib/seoUtils';

/**
 * Head component for managing page meta tags
 * Usage: <Head title="Products" description="Browse our collection..." />
 */
export function Head({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  children,
}) {
  useEffect(() => {
    if (title || description) {
      updateMetaTags({
        title,
        description,
        image,
        url,
        type,
      });
    }
  }, [title, description, image, url, type]);

  return children;
}
