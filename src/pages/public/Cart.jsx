import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    subtotal,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const deliveryFee = subtotal > 0 ? 0 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (!user) {
      navigate('/account/login?returnTo=/checkout');
      return;
    }

    navigate('/checkout');
  };

  if (!cartItems.length) {
    return (
      <div className="pt-32 pb-24 min-h-screen">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <div className="bg-dark-lighter border border-white/5 rounded-3xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
              <ShoppingCart className="w-10 h-10 text-gold" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Browse our lighting collection and add pieces to your cart when you are ready.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gold hover:bg-gold-light text-dark font-semibold transition-colors"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-white hover:border-gold/40 hover:text-gold transition-colors"
              >
                View Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-8 md:mb-12">
          <p className="text-gold uppercase tracking-[0.3em] text-xs sm:text-sm font-semibold mb-3">Shopping Cart</p>
          <h1 className="text-3xl md:text-5xl font-serif text-white mb-4">Review your selected items</h1>
          <p className="text-gray-400 max-w-2xl">
            Your cart currently has {itemCount} item{itemCount === 1 ? '' : 's'} ready for checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-6 xl:gap-8 items-start">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="bg-dark-lighter border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                <Link to={`/checkout/${item.productId}`} className="shrink-0">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full sm:w-28 h-48 sm:h-28 object-cover rounded-xl bg-dark"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="inline-flex mb-2 text-[10px] uppercase tracking-[0.25em] text-gold bg-gold/10 border border-gold/20 px-2 py-1 rounded-full">
                        {item.category || 'Lighting'}
                      </span>
                      <h2 className="text-lg sm:text-xl font-serif text-white truncate">{item.name}</h2>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm">Quantity</span>
                      <div className="flex items-center gap-2 bg-dark border border-white/10 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="min-w-8 text-center text-white font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs uppercase tracking-widest text-gray-500">Price</p>
                      <p className="text-lg font-semibold text-gold">KSh {Number(item.price).toLocaleString()}</p>
                      <p className="text-sm text-gray-400">Line total: KSh {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-dark-lighter border border-white/5 rounded-3xl p-5 sm:p-6 sticky top-28 space-y-6">
            <div>
              <p className="text-gold uppercase tracking-[0.25em] text-xs font-semibold mb-2">Order Summary</p>
              <h2 className="text-2xl font-serif text-white">Ready to checkout?</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white font-medium">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Delivery</span>
                <span className="text-white font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                <span className="text-base text-gray-300">Total</span>
                <span className="text-2xl font-bold text-gold">KSh {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-gold hover:bg-gold-light text-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={clearCart}
              className="w-full text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl py-3 transition-colors"
            >
              Clear Cart
            </button>

            <Link
              to="/shop"
              className="block text-center text-sm text-gold hover:text-gold-light transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
