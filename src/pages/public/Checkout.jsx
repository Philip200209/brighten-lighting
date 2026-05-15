import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Smartphone, BadgeCheck, ShoppingCart } from 'lucide-react';
import { productsService, ordersService } from '../../lib/supabase';
import { getProducts } from '../../data/mockData';
import { initiateMpesaPayment, formatPhoneNumber, isValidMpesaPhoneNumber } from '../../lib/mpesaService';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

function createFallbackCheckoutItem(product) {
  return {
    productId: String(product.id),
    name: product.name,
    price: Number(product.price) || 0,
    quantity: 1,
    image_url: product.image_url || product.image || '',
    category: product.category || '',
    description: product.description || '',
  };
}

function buildOrderNumber() {
  const randomSegment = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BL-${Date.now().toString().slice(-8)}-${randomSegment}`;
}

export function Checkout() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cartItems, clearCart, isHydrated } = useCart();

  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    if (cartItems.length > 0 || !productId || !isHydrated) {
      return;
    }

    let isMounted = true;

    const loadProduct = async () => {
      try {
        const data = await productsService.getById(productId);
        if (isMounted) {
          setProduct(data);
        }
      } catch {
        const fallback = getProducts().find((item) => String(item.id) === String(productId));
        if (isMounted) {
          setProduct(fallback || null);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [cartItems.length, isHydrated, productId]);

  const checkoutItems = useMemo(() => {
    if (cartItems.length > 0) return cartItems;
    if (product) return [createFallbackCheckoutItem(product)];
    return [];
  }, [cartItems, product]);

  const subtotal = useMemo(
    () => checkoutItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [checkoutItems]
  );

  const deliveryFee = subtotal > 0 ? 0 : 0;
  const total = subtotal + deliveryFee;

  const handleFieldChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setOrderError('');

    if (!checkoutItems.length) {
      setOrderError('Your cart is empty. Add products before checking out.');
      return;
    }

    if (!formData.address.trim()) {
      setOrderError('Please enter a delivery address.');
      return;
    }

    if (!formData.phone.trim()) {
      setOrderError('Please enter a phone number.');
      return;
    }

    if (paymentMethod === 'mpesa' && !isValidMpesaPhoneNumber(formData.phone)) {
      setOrderError('Please enter a valid M-Pesa number like 0712345678 or 254712345678.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = buildOrderNumber();
      const orderPayload = {
        order_number: orderNumber,
        user_id: user?.id || null,
        email: user?.email || '',
        customer_name: formData.fullName.trim() || profile?.full_name || user?.email || 'Customer',
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'mpesa' ? 'pending' : 'cash_on_delivery',
        subtotal,
        delivery_fee: deliveryFee,
        total,
        items: checkoutItems,
        status: 'pending',
      };

      const savedOrder = await ordersService.create(orderPayload);

      if (paymentMethod === 'mpesa') {
        try {
          await initiateMpesaPayment({
            phoneNumber: formatPhoneNumber(formData.phone),
            amount: total,
            description: `Order ${savedOrder.order_number}`,
          });
        } catch (paymentError) {
          console.error('M-Pesa prompt failed:', paymentError);
        }
      }

      if (cartItems.length > 0) {
        clearCart();
      }

      navigate(`/order-success/${savedOrder.id}`, {
        replace: true,
        state: {
          order: savedOrder,
          paymentMethod,
        },
      });
    } catch (error) {
      console.error('Order checkout failed:', error);
      setOrderError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadingProduct = Boolean(productId) && cartItems.length === 0 && !product;

  if (loadingProduct) {
    return <div className="pt-32 pb-24 min-h-screen container mx-auto px-6 lg:px-12 text-gray-400">Loading checkout...</div>;
  }

  if (!checkoutItems.length) {
    return (
      <div className="pt-32 pb-24 min-h-screen">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <div className="bg-dark-lighter border border-white/5 rounded-3xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <ShoppingCart className="w-10 h-10 text-gold" />
            </div>
            <h1 className="text-3xl font-serif text-white mb-4">No items to checkout</h1>
            <p className="text-gray-400 mb-8">Your cart is empty. Add products from the shop before continuing to checkout.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-light transition-colors">
              Back to Shop
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-8 md:mb-12">
          <p className="text-gold uppercase tracking-[0.3em] text-xs sm:text-sm font-semibold mb-3">Secure Checkout</p>
          <h1 className="text-3xl md:text-5xl font-serif text-white mb-4">Complete your order</h1>
          <p className="text-gray-400 max-w-2xl">
            Confirm your delivery details, review your order summary, and choose either M-Pesa or Cash on Delivery.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-6 xl:gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-dark-lighter border border-white/5 rounded-3xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <h2 className="text-2xl font-serif text-white">Delivery Information</h2>
              </div>

              {orderError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 text-sm">
                  {orderError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || profile?.full_name || user?.user_metadata?.full_name || ''}
                    onChange={handleFieldChange}
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFieldChange}
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                    placeholder="0712345678"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-300">Delivery Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFieldChange}
                    rows={4}
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-gold/50 transition-colors"
                    placeholder="Town, estate, building, apartment, or any delivery notes"
                  />
                </div>
              </div>
            </div>

            <div className="bg-dark-lighter border border-white/5 rounded-3xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gold" />
                <h2 className="text-2xl font-serif text-white">Payment Options</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`text-left rounded-2xl border p-4 transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(245,158,11,0.2)]'
                      : 'border-white/10 bg-dark hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                      <Smartphone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">M-Pesa</p>
                      <p className="text-xs text-gray-400">Main option for instant payment</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">You will receive an STK prompt on your phone after placing the order.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`text-left rounded-2xl border p-4 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(245,158,11,0.2)]'
                      : 'border-white/10 bg-dark hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Truck className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Cash on Delivery</p>
                      <p className="text-xs text-gray-400">Pay when the order arrives</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">A team member will confirm the delivery details before dispatch.</p>
                </button>
              </div>

              <div className="flex items-center gap-3 bg-dark border border-white/5 rounded-xl p-4 text-sm text-gray-300">
                <BadgeCheck className="w-5 h-5 text-gold shrink-0" />
                Your order will be saved in Supabase as soon as you place it.
              </div>
            </div>
          </div>

          <aside className="bg-dark-lighter border border-white/5 rounded-3xl p-5 sm:p-6 space-y-6 sticky top-28">
            <div>
              <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold mb-2">Order Summary</p>
              <h2 className="text-2xl font-serif text-white">Review your items</h2>
            </div>

            <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
              {checkoutItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 bg-dark border border-white/5 rounded-2xl p-3">
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-dark shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    <p className="text-sm text-gray-400">Qty {item.quantity}</p>
                    <p className="text-sm text-gold">KSh {(Number(item.price) * Number(item.quantity)).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Delivery</span>
                <span className="text-white">KSh {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-white/5">
                <span className="text-gray-200">Total</span>
                <span className="text-gold">KSh {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? 'Placing Order...' : paymentMethod === 'mpesa' ? 'Place Order & Pay with M-Pesa' : 'Place Order'}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By placing this order, you agree to our delivery and payment terms.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
