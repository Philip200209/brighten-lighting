import { ArrowUpRight, Clock3, MessageSquare, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useMemo } from 'react';
import { getProducts } from '../../data/mockData';

export function Dashboard() {
  const products = useMemo(() => getProducts(), []);

  const inquiries = useMemo(() => JSON.parse(localStorage.getItem('inquiries') || '[]'), []);
  const newInquiries = inquiries.filter(i => i.status === 'new').length;
  const totalCatalogValue = products.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const topCategory = useMemo(() => {
    if (!products.length) return 'No category yet';
    const counts = products.reduce((acc, item) => {
      const key = item.category || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [products]);

  const formatCurrency = (value) => `KSh ${Number(value || 0).toLocaleString()}`;

  const stats = [
    {
      name: 'Total Products',
      value: products.length,
      helper: 'Items in catalog',
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      name: 'Total Inquiries',
      value: inquiries.length,
      helper: 'Customer messages',
      icon: MessageSquare,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      name: 'New Inquiries',
      value: newInquiries,
      helper: 'Need attention',
      icon: Users,
      color: 'text-gold',
      bg: 'bg-gold/10',
    },
    {
      name: 'Catalog Value',
      value: formatCurrency(totalCatalogValue),
      helper: 'Sum of listed prices',
      icon: TrendingUp,
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="glass-dark rounded-3xl border border-white/10 p-5 md:p-8 overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Admin Dashboard
            </div>
            <h2 className="text-2xl md:text-4xl font-serif text-white leading-tight">
              Welcome back. Here is your store snapshot.
            </h2>
            <p className="mt-3 text-gray-300 max-w-2xl">
              Track inquiries, keep an eye on catalog health, and monitor product mix from one clean overview.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[300px]">
            <div className="bg-dark/80 border border-white/10 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Top Category</p>
              <p className="text-sm sm:text-base text-white font-semibold truncate">{topCategory}</p>
            </div>
            <div className="bg-dark/80 border border-white/10 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Updated</p>
              <p className="text-sm sm:text-base text-white font-semibold inline-flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-gold" />
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-dark p-4 sm:p-5 rounded-2xl border border-white/10 transition-all hover:-translate-y-1 hover:border-gold/30">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.name}</p>
              <h3 className="text-2xl sm:text-3xl font-serif text-white leading-none break-words">{stat.value}</h3>
              <p className="text-xs text-gray-500 mt-2">{stat.helper}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-dark p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-serif text-white">Recent Inquiries</h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10">
              {inquiries.length} total
            </span>
          </div>

          {inquiries.length > 0 ? (
            <div className="space-y-4">
              {inquiries.slice(0, 5).map((inquiry) => (
                <div key={inquiry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-4 bg-dark/80 rounded-xl border border-white/10">
                  <div className="min-w-0">
                    <h4 className="text-white font-medium truncate">{inquiry.name}</h4>
                    <p className="text-sm text-gray-400 truncate">{inquiry.subject || inquiry.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap self-start sm:self-auto">
                    {new Date(inquiry.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-14 rounded-xl border border-dashed border-white/10 bg-dark/40">
              <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No inquiries yet.</p>
              <p className="text-sm text-gray-500 mt-1">New customer messages will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
