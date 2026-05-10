import { Package, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { useMemo } from 'react';
import { getProducts } from '../../data/mockData';

export function Dashboard() {
  const products = useMemo(() => getProducts(), []);

  const inquiries = useMemo(() => JSON.parse(localStorage.getItem('inquiries') || '[]'), []);
  const newInquiries = inquiries.filter(i => i.status === 'new').length;

  const stats = [
    { name: 'Total Products', value: products.length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Total Inquiries', value: inquiries.length, icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'New Inquiries', value: newInquiries, icon: Users, color: 'text-gold', bg: 'bg-gold/10' },
    { name: 'Revenue (Est.)', value: 'KSh 0', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-dark p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.name}</p>
              <h3 className="text-3xl font-serif text-white">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-dark p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-serif text-white mb-6">Recent Inquiries</h3>
          {inquiries.length > 0 ? (
            <div className="space-y-4">
              {inquiries.slice(0, 5).map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-4 bg-dark rounded-xl border border-white/5">
                  <div>
                    <h4 className="text-white font-medium">{inquiry.name}</h4>
                    <p className="text-sm text-gray-400">{inquiry.subject}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(inquiry.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No inquiries yet.
            </div>
          )}
        </div>

        <div className="glass-dark p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-serif text-white mb-6">Product Overview</h3>
          <div className="space-y-4">
             {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-dark rounded-xl border border-white/5">
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-400">{product.category}</p>
                  </div>
                  <span className="text-sm font-medium text-gold">
                    KSh {product.price.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
