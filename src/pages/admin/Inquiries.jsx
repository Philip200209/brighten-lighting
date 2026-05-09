import { useState } from 'react';
import { Mail, Phone, Calendar, Trash2, CheckCircle } from 'lucide-react';

export function Inquiries() {
  const [inquiries, setInquiries] = useState(() => {
    return JSON.parse(localStorage.getItem('inquiries') || '[]');
  });

  const handleDelete = (id) => {
    const newInquiries = inquiries.filter(i => i.id !== id);
    setInquiries(newInquiries);
    localStorage.setItem('inquiries', JSON.stringify(newInquiries));
  };

  const handleMarkRead = (id) => {
    const newInquiries = inquiries.map(i => 
      i.id === id ? { ...i, status: 'read' } : i
    );
    setInquiries(newInquiries);
    localStorage.setItem('inquiries', JSON.stringify(newInquiries));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-white">Customer Inquiries</h2>
        <div className="bg-dark-lighter border border-white/5 rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="text-sm text-gray-400">Total:</span>
          <span className="text-white font-medium">{inquiries.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {inquiries.length > 0 ? (
          inquiries.map((inquiry) => (
            <div 
              key={inquiry.id} 
              className={`bg-dark-lighter border rounded-2xl p-6 transition-colors ${
                inquiry.status === 'new' ? 'border-gold/30' : 'border-white/5'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white flex items-center gap-3">
                        {inquiry.name}
                        {inquiry.status === 'new' && (
                          <span className="bg-gold text-dark text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
                        )}
                      </h3>
                      <p className="text-gold mt-1 font-serif">{inquiry.subject}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed bg-dark p-4 rounded-xl border border-white/5">
                    {inquiry.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gold" />
                      <a href={`mailto:${inquiry.email}`} className="hover:text-white transition-colors">
                        {inquiry.email}
                      </a>
                    </div>
                    {inquiry.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gold" />
                        <a href={`tel:${inquiry.phone}`} className="hover:text-white transition-colors">
                          {inquiry.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold" />
                      <span>{new Date(inquiry.date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col justify-end gap-2 shrink-0">
                  {inquiry.status === 'new' && (
                    <button 
                      onClick={() => handleMarkRead(inquiry.id)}
                      className="p-3 bg-dark hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(inquiry.id)}
                    className="p-3 bg-dark hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete inquiry"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-dark-lighter border border-white/5 rounded-2xl">
            <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-white mb-2">No Inquiries</h3>
            <p className="text-gray-400">You don't have any customer inquiries yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
