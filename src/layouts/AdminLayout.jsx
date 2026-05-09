import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, MessageSquare, LogOut, Lightbulb, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAdminAuth') === 'true');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isAdminAuth') === 'true');
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!isAuthenticated && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  if (location.pathname === '/admin/login') {
    return <Outlet />;
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-dark flex overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-dark-lighter border-r border-white/5 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Lightbulb className="w-6 h-6 text-gold" />
            <span className="font-serif tracking-widest text-white font-bold text-sm">
              BRIGHTEN ADMIN
            </span>
          </Link>
          <button className="md:hidden text-gray-400 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isActive 
                    ? "bg-gold/10 text-gold font-medium" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-dark-lighter border-b border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-400 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-white font-serif text-lg md:text-xl tracking-wide hidden sm:block">
              {navItems.find(item => item.path === location.pathname)?.name || 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
              A
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
