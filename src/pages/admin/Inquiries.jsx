import { useState, useEffect, useCallback } from 'react';
import { supabase, inquiriesService } from '../../lib/supabase';
import { Mail, Phone, Calendar, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadInquiries = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await inquiriesService.getAll();
      setInquiries(data);
    } catch (error) {
      console.error('Error loading inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();

    // Subscribe to realtime changes for inquiries so admin view updates live
    const channel = supabase
      .channel('public:inquiries')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiries' }, (payload) => {
        setInquiries((prev) => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'inquiries' }, (payload) => {
        setInquiries((prev) => prev.map(i => i.id === payload.new.id ? payload.new : i));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'inquiries' }, (payload) => {
        setInquiries((prev) => prev.filter(i => i.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      // unsubscribe on unmount
      try { supabase.removeChannel(channel); } catch (e) { /* ignore */ }
    };
  }, [loadInquiries]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) {
      return;
    }

    try {
      await inquiriesService.delete(id);
      toast.success('Inquiry deleted');
      await loadInquiries();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await inquiriesService.updateStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      await loadInquiries();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredInquiries = inquiries.filter(i => 
    filterStatus === 'all' ? true : i.status === filterStatus
  );

  const newCount = inquiries.filter(i => i.status === 'new').length;
  const resolvedCount = inquiries.filter(i => i.status === 'resolved').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-2xl font-serif text-white">Customer Inquiries</h2>
        <div className="flex gap-2 flex-wrap">
          <div className="bg-dark-lighter border border-white/5 rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-gray-400">Total:</span>
            <span className="text-white font-medium">{inquiries.length}</span>
          </div>
          {newCount > 0 && (
            <div className="bg-gold/10 border border-gold/30 rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-gold">New:</span>
              <span className="text-gold font-medium">{newCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap text-sm">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
            filterStatus === 'all'
              ? 'bg-gold text-dark'
              : 'bg-dark-lighter border border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          All ({inquiries.length})
        </button>
        <button
          onClick={() => setFilterStatus('new')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
            filterStatus === 'new'
              ? 'bg-gold text-dark'
              : 'bg-dark-lighter border border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          New ({newCount})
        </button>
        <button
          onClick={() => setFilterStatus('resolved')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
            filterStatus === 'resolved'
              ? 'bg-gold text-dark'
              : 'bg-dark-lighter border border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-24 bg-dark-lighter border border-white/5 rounded-2xl">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading inquiries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry) => (
                <div 
                  key={inquiry.id}
                  className={`bg-dark-lighter border rounded-2xl p-4 sm:p-6 transition-colors ${
                    inquiry.status === 'new' ? 'border-gold/30 bg-gold/5' : 'border-white/5'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4 sm:gap-6">
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-medium text-white flex items-center gap-2 sm:gap-3">
                          <span className="truncate">{inquiry.name}</span>
                          {inquiry.status === 'new' && (
                            <span className="bg-gold text-dark text-xs px-2 py-0.5 rounded-full font-bold shrink-0">NEW</span>
                          )}
                          {inquiry.status === 'resolved' && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-bold shrink-0">✓</span>
                          )}
                        </h3>
                      </div>

                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed bg-dark p-3 sm:p-4 rounded-xl border border-white/5 line-clamp-4">
                      {inquiry.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 text-gold shrink-0" />
                        <a href={`mailto:${inquiry.email}`} className="hover:text-white transition-colors truncate">
                          {inquiry.email}
                        </a>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone className="w-4 h-4 text-gold shrink-0" />
                          <a href={`tel:${inquiry.phone}`} className="hover:text-white transition-colors truncate">
                            {inquiry.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Calendar className="w-4 h-4 text-gold shrink-0" />
                        <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap md:flex-col justify-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 md:pl-4">
                    {inquiry.status === 'new' && (
                      <button 
                        onClick={() => handleStatusChange(inquiry.id, 'resolved')}
                        className="flex-1 md:flex-none p-2 sm:p-3 bg-dark hover:bg-green-500/10 rounded-lg sm:rounded-xl text-gray-400 hover:text-green-400 transition-colors text-xs sm:text-sm font-medium"
                        title="Mark as resolved"
                      >
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 mx-auto" />
                      </button>
                    )}
                    {inquiry.status === 'resolved' && (
                      <button 
                        onClick={() => handleStatusChange(inquiry.id, 'new')}
                        className="flex-1 md:flex-none p-2 sm:p-3 bg-dark hover:bg-gold/10 rounded-lg sm:rounded-xl text-gray-400 hover:text-gold transition-colors text-xs sm:text-sm font-medium"
                        title="Mark as new"
                      >
                        <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 mx-auto" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(inquiry.id)}
                      className="flex-1 md:flex-none p-2 sm:p-3 bg-dark hover:bg-red-500/10 rounded-lg sm:rounded-xl text-gray-400 hover:text-red-400 transition-colors text-xs sm:text-sm font-medium"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 sm:w-5 h-4 sm:h-5 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-dark-lighter border border-white/5 rounded-2xl">
              <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-white mb-2">No Inquiries</h3>
              <p className="text-gray-400">
                {filterStatus !== 'all' 
                  ? `No ${filterStatus} inquiries at the moment.`
                  : "You don't have any customer inquiries yet."
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
