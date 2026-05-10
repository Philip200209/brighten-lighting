import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb, ShieldCheck, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProducts, CATEGORIES } from '../../data/mockData';
import { productsService } from '../../lib/supabase';
import { ProductCard } from '../../components/ProductCard';

export function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const dbProducts = await productsService.getAll();
        setProducts(dbProducts);
      } catch (error) {
        console.error('Failed to load products from Supabase, using fallback data:', error);
        setProducts(getProducts());
      }
    };

    loadProducts();
  }, []);

  const featuredProducts = products.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540932239986-30128078f3b5?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Lighting" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-dark"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-black/30 backdrop-blur-md mb-8">
            <Lightbulb className="w-4 h-4 text-gold animate-pulse" />
            <span className="text-gold text-sm tracking-widest uppercase font-medium">Premium Lighting</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 drop-shadow-2xl">
            Light Up <br/> Every Moment
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover our curated collection of luxury lighting fixtures designed to transform your space into a cinematic masterpiece.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/shop" 
              className="px-8 py-4 bg-gold hover:bg-gold-light text-dark font-semibold tracking-wider uppercase rounded-none transition-all hover:scale-105"
            >
              Browse Collection
            </Link>
            <Link 
              to="/categories" 
              className="px-8 py-4 bg-transparent border border-white hover:border-gold hover:text-gold text-white font-semibold tracking-wider uppercase rounded-none transition-all"
            >
              View Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark relative z-20 -mt-1">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Lightbulb, title: "Curated Design", desc: "Handpicked selections of the most elegant and modern lighting fixtures." },
              { icon: ShieldCheck, title: "Premium Quality", desc: "Built with the highest quality materials to ensure durability and lasting beauty." },
              { icon: Zap, title: "Energy Efficient", desc: "Modern LED technology that provides brilliant illumination while saving energy." }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-8 rounded-2xl glass-dark hover:border-gold/30 transition-colors">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-serif mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-dark-lighter border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-gold tracking-widest uppercase text-sm font-semibold mb-2 block">Our Collection</span>
              <h2 className="text-4xl md:text-5xl font-serif">Featured Pieces</h2>
            </div>
            <Link to="/shop" className="flex items-center gap-2 text-gray-300 hover:text-gold transition-colors pb-2 border-b border-transparent hover:border-gold">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-dark">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <span className="text-gold tracking-widest uppercase text-sm font-semibold mb-2 block">Explore By Space</span>
          <h2 className="text-4xl md:text-5xl font-serif mb-16">Lighting Categories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((category, idx) => (
              <Link 
                key={category} 
                to={`/shop?category=${category}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-dark-lighter border border-white/5 flex items-center justify-center p-6 hover:border-gold/50 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="relative z-20 text-xl font-serif text-gray-300 group-hover:text-gold group-hover:-translate-y-2 transition-all text-center">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
