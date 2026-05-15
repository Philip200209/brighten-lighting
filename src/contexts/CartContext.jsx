/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CART_STORAGE_KEY = 'brighten_cart';
const CartContext = createContext(null);

function normalizeItem(item) {
  if (!item) return null;

  const productId = String(item.productId ?? item.product_id ?? item.id ?? '');
  if (!productId) return null;

  return {
    productId,
    name: item.name || item.product_name || 'Product',
    price: Number(item.price ?? item.product_price ?? 0),
    quantity: Math.max(1, Number(item.quantity ?? 1)),
    image_url: item.image_url || item.image || '',
    category: item.category || '',
    description: item.description || '',
  };
}

function normalizeItems(items) {
  return (Array.isArray(items) ? items : [])
    .map(normalizeItem)
    .filter(Boolean);
}

function mergeItems(primaryItems, secondaryItems) {
  const merged = new Map();

  [...normalizeItems(primaryItems), ...normalizeItems(secondaryItems)].forEach((item) => {
    const existing = merged.get(item.productId);
    if (existing) {
      merged.set(item.productId, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
      return;
    }

    merged.set(item.productId, item);
  });

  return Array.from(merged.values());
}

function readStoredCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return normalizeItems(stored ? JSON.parse(stored) : []);
  } catch (error) {
    console.error('Failed to read stored cart:', error);
    return [];
  }
}

function writeStoredCart(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to persist cart:', error);
  }
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState(() => readStoredCart());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    writeStoredCart(cartItems);
  }, [cartItems]);

  useEffect(() => {
    let isActive = true;

    const syncCartFromServer = async () => {
      if (authLoading) return;

      if (!user?.id) {
        if (isActive) {
          setIsHydrated(true);
        }
        return;
      }

      if (isActive) {
        setIsHydrated(false);
      }

      try {
        const { data, error } = await supabase
          .from('carts')
          .select('items')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        const remoteItems = normalizeItems(data?.items);
        const localItems = readStoredCart();
        const mergedItems = remoteItems.length > 0 ? mergeItems(remoteItems, localItems) : localItems;

        if (isActive) {
          setCartItems(mergedItems);
        }

        if (!remoteItems.length && mergedItems.length) {
          await supabase
            .from('carts')
            .upsert(
              {
                user_id: user.id,
                items: mergedItems,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );
        }
      } catch (error) {
        console.error('Failed to sync cart from Supabase:', error);
      } finally {
        if (isActive) {
          setIsHydrated(true);
        }
      }
    };

    syncCartFromServer();

    return () => {
      isActive = false;
    };
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (!isHydrated || authLoading || !user?.id) return;

    const syncCartToServer = async () => {
      try {
        const { error } = await supabase
          .from('carts')
          .upsert(
            {
              user_id: user.id,
              items: cartItems,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

        if (error) throw error;
      } catch (error) {
        console.error('Failed to persist cart to Supabase:', error);
      }
    };

    syncCartToServer();
  }, [authLoading, cartItems, isHydrated, user?.id]);

  const addToCart = (product, quantity = 1) => {
    const normalizedProduct = normalizeItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image_url: product.image_url || product.image,
      category: product.category,
      description: product.description,
    });

    if (!normalizedProduct) return;

    setCartItems((currentItems) => {
      const existingIndex = currentItems.findIndex((item) => item.productId === normalizedProduct.productId);
      if (existingIndex === -1) {
        return [...currentItems, normalizedProduct];
      }

      return currentItems.map((item) => {
        if (item.productId !== normalizedProduct.productId) return item;
        return {
          ...item,
          quantity: item.quantity + normalizedProduct.quantity,
        };
      });
    });
  };

  const updateQuantity = (productId, quantity) => {
    const safeQuantity = Number(quantity);

    if (!safeQuantity || safeQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) => (
        item.productId === String(productId)
          ? { ...item, quantity: Math.max(1, safeQuantity) }
          : item
      ))
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.productId !== String(productId)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const setCartFromItems = (items) => {
    setCartItems(normalizeItems(items));
  };

  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const value = {
    cartItems,
    itemCount,
    subtotal,
    isHydrated,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setCartFromItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
