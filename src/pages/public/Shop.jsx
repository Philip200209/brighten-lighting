import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getProducts, CATEGORIES } from '../../data/mockData';
import { productsService } from '../../lib/supabase';
import { ProductCard } from '../../components/ProductCard';

export function Shop() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                            product.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, products]);

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Our Collection</h1>
          <p className="text-gray-400 max-w-2xl">
            Browse our full catalog of premium lighting fixtures. Find the perfect piece to elevate your space.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('All')}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full border transition-all ${
                activeCategory === 'All' 
                  ? 'bg-gold border-gold text-dark font-medium' 
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full border transition-all ${
                  activeCategory === category 
                    ? 'bg-gold border-gold text-dark font-medium' 
                    : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-lighter border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-dark-lighter rounded-2xl border border-white/5">
            <SlidersHorizontal className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-white mb-2">No products found</h3>
            <p className="text-gray-400 mb-6">We couldn't find anything matching your current filters.</p>
            <button 
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="text-gold hover:text-gold-light border-b border-gold pb-1"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
