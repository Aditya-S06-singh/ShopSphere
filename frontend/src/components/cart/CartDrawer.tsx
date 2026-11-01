import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { cart, updateQuantity, removeItem, loading } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
              {cart && (
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {cart.totalItems} items
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!cart || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-3 stroke-1" />
                <p className="text-base font-semibold text-gray-700">Your cart is empty</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Discover portfolio products and add them to test the shopping cart flow.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex space-x-4 p-3 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <img
                      src={item.productImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg bg-gray-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-rose-500 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">SKU: {item.productSku}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold text-indigo-600">
                          ${item.unitPrice.toFixed(2)}
                        </span>
                        <div className="flex items-center space-x-1.5 bg-white border border-gray-200 rounded-lg px-1.5 py-0.5">
                          <button
                            disabled={item.quantity <= 1 || loading}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-gray-500 hover:text-gray-800 disabled:opacity-30 p-0.5"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= item.availableStock || loading}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-gray-800 disabled:opacity-30 p-0.5"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Checkout Actions */}
          {cart && cart.items.length > 0 && (
            <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">
                  ${cart.subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Taxes and simulated shipping calculated at checkout.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
