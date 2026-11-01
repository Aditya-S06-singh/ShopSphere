import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart } from '../types/cart';
import { fetchCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../api/cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearUserCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId: number, quantity = 1) => {
    const updated = await apiAddToCart({ productId, quantity });
    setCart(updated);
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    const updated = await apiUpdateCartItem(itemId, { quantity });
    setCart(updated);
  };

  const removeItem = async (itemId: number) => {
    const updated = await apiRemoveCartItem(itemId);
    setCart(updated);
  };

  const clearUserCart = async () => {
    await apiClearCart();
    setCart(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        addItem,
        updateQuantity,
        removeItem,
        clearUserCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
