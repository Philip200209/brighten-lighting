import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, PackageCheck, ReceiptText } from 'lucide-react';
import { ordersService } from '../../lib/supabase';

export function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order && Boolean(orderId));

  useEffect(() => {
    if (!orderId || order) {
      return;
    }

    let isMounted = true;

    const loadOrder = async () => {
      try {
        const data = await ordersService.getById(orderId);
        if (isMounted) {
          setOrder(data);
        }
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [order, orderId]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen container mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center py-20 text-gray-400">Loading order confirmation...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-32 pb-24 min-h-screen container mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center bg-dark-lighter border border-white/5 rounded-3xl p-8 md:p-12">
          <h1 className="text-3xl font-serif text-white mb-4">Order not found</h1>
          <p className="text-gray-400 mb-8">We could not load the order confirmation, but your cart and account are still safe.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold hover:bg-gold-light text-dark font-semibold transition-colors">
            Back to Shop
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-dark-lighter border border-gold/20 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-gold/5">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-gold" />
              </div>
              <p className="text-gold uppercase tracking-[0.3em] text-xs sm:text-sm font-semibold mb-2">Order Confirmed</p>
              <h1 className="text-3xl md:text-5xl font-serif text-white mb-3">Your order has been placed</h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                We have saved your order in Supabase and will prepare it for the next step.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="space-y-6">
                <div className="bg-dark border border-white/5 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <PackageCheck className="w-5 h-5 text-gold" />
                    <h2 className="text-xl font-serif text-white">Order Details</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Order ID</p>
                      <p className="text-white font-medium">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Order Number</p>
                      <p className="text-white font-medium">{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Payment Method</p>
                      <p className="text-white font-medium capitalize">{order.payment_method === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Payment Status</p>
                      <p className="text-white font-medium capitalize">{order.payment_status?.replace(/_/g, ' ') || 'Pending'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-dark border border-white/5 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ReceiptText className="w-5 h-5 text-gold" />
                    <h2 className="text-xl font-serif text-white">Delivery Information</h2>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Email</p>
                      <p className="text-white">{order.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Phone</p>
                      <p className="text-white">{order.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Address</p>
                      <p className="text-white leading-relaxed">{order.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-dark border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
                <h2 className="text-xl font-serif text-white">Order Summary</h2>

                <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 bg-dark-lighter border border-white/5 rounded-xl p-3">
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-dark shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.name}</p>
                        <p className="text-sm text-gray-400">Qty {item.quantity}</p>
                        <p className="text-sm text-gold">KSh {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white">KSh {Number(order.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Delivery</span>
                    <span className="text-white">KSh {Number(order.delivery_fee || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-white/5">
                    <span className="text-gray-200">Total</span>
                    <span className="text-gold">KSh {Number(order.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6">
              <p className="text-sm text-gray-400 text-center sm:text-left">
                {order.payment_method === 'mpesa'
                  ? 'Your M-Pesa prompt has been sent. Approve it on your phone to complete payment.'
                  : 'You selected Cash on Delivery. Our team will contact you before delivery.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-white hover:border-gold/40 hover:text-gold transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/cart"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gold hover:bg-gold-light text-dark font-semibold transition-colors"
                >
                  View Cart
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
