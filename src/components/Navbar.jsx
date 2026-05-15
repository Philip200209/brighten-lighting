import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lightbulb, Menu, X, Search, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from '../contexts/CartContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'glass-dark py-4' : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Lightbulb className="w-8 h-8 text-gold group-hover:text-gold-light transition-colors animate-pulse" />
          <span className="font-serif text-xl tracking-widest text-white font-bold group-hover:text-glow transition-all">
            BRIGHTEN LIGHTING
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                'text-sm font-medium uppercase tracking-wider transition-colors hover:text-gold relative group',
                location.pathname === link.path ? 'text-gold' : 'text-gray-300'
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-2 left-0 h-[2px] bg-gold transition-all duration-300",
                location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
              )}></span>
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-gold hover:border-gold/40 transition-colors flex items-center justify-center">
            <Search className="w-5 h-5" />
          </button>
          <Link
            to="/cart"
            className="relative w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-gold hover:border-gold/40 transition-colors flex items-center justify-center"
            aria-label="View cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-gold text-dark text-[10px] font-bold flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          <Link to="/admin" className="text-xs text-gray-500 hover:text-white transition-colors border border-gray-800 px-3 py-2 rounded-full">
            Admin
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-3">
          <Link
            to="/cart"
            className="relative w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-gold transition-colors flex items-center justify-center"
            aria-label="View cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-gold text-dark text-[10px] font-bold flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          <button
            className="text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-dark absolute top-full left-0 right-0 border-t border-white/10 animate-fade-in">
          <div className="flex flex-col px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'text-lg font-medium tracking-wide transition-colors',
                  location.pathname === link.path ? 'text-gold' : 'text-gray-300 hover:text-white'
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-gray-500 hover:text-white pt-4 border-t border-white/10"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
