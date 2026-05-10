import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsService } from '../../lib/supabase';
import { getProducts } from '../../data/mockData';
import { MpesaPayButton } from '../../components/MpesaPaymentForm';

export function Checkout() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await productsService.getById(productId);
        setProduct(data);
      } catch (error) {
        const fallback = getProducts().find(item => String(item.id) === String(productId));
        setProduct(fallback || null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (loading) {
    return <div className="pt-32 pb-24 min-h-screen container mx-auto px-6 lg:px-12 text-gray-400">Loading checkout...</div>;
  }

  if (!product) {
    return (
      <div className="pt-32 pb-24 min-h-screen container mx-auto px-6 lg:px-12">
        <div className="max-w-xl mx-auto text-center bg-dark-lighter border border-white/5 rounded-2xl p-10">
          <h1 className="text-3xl font-serif text-white mb-4">Product not found</h1>
          <p className="text-gray-400 mb-6">The item you selected is unavailable.</p>
          <Link to="/shop" className="inline-flex px-6 py-3 bg-gold text-dark font-semibold rounded-lg">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="bg-dark-lighter border border-white/5 rounded-2xl overflow-hidden">
            <img src={product.image_url || product.image} alt={product.name} className="w-full aspect-[4/3] object-cover" />
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-gold uppercase tracking-widest text-sm mb-2">Checkout</p>
              <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">{product.name}</h1>
              <p className="text-gray-400">{product.description}</p>
            </div>

            <div className="bg-dark-lighter border border-white/5 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Price</span>
                <span className="text-2xl font-bold text-gold">KSh {Number(product.price).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Category</span>
                <span>{product.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Stock</span>
                <span>{product.stock}</span>
              </div>
            </div>

            <MpesaPayButton product={product} amount={product.price} className="w-full" />

            <p className="text-sm text-gray-500">
              Your payment prompt will be sent to the phone number you enter after login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
