import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import heroImage from '../assets/hero.png';
import ProductStructuredData from './ProductStructuredData';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

export function ProductCard({ product }) {
  const imageSrc = product.image_url || product.image || heroImage;
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="group relative bg-dark-light rounded-xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 hover:-translate-y-2">
      <div className="aspect-[4/5] overflow-hidden relative">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = heroImage;
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold mb-1 block">
            {product.category}
          </span>
          <h3 className="text-lg text-white font-serif">{product.name}</h3>
        </div>
      </div>
      
      <div className="p-5 flex flex-col gap-4">
        <p className="text-sm text-gray-400 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto gap-3">
          <span className="text-lg font-medium text-white">
            KSh {product.price.toLocaleString()}
          </span>
          
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-light transition-colors"
          >
            <ShoppingCart className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            Add to Cart
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/contact?product=${product.id}`}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg py-3 transition-colors"
          >
            Inquire
          </Link>
          <Link
            to={`/checkout/${product.id}`}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded-lg py-3 transition-colors"
          >
            Buy Now
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      <ProductStructuredData product={product} />
    </div>
  );
}
