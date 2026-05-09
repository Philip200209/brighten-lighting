import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, MessageSquare, LogOut, Lightbulb, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Defaulting to true for demo purposes, or check localStorage
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('isAdminAuth');
    if (auth !== 'true') {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
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
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-lighter border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 group">
            <Lightbulb className="w-6 h-6 text-gold" />
            <span className="font-serif tracking-widest text-white font-bold text-sm">
              BRIGHTEN ADMIN
            </span>
          </Link>
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
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-dark-lighter border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-white font-serif text-xl tracking-wide">
            {navItems.find(item => item.path === location.pathname)?.name || 'Admin'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
              A
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
