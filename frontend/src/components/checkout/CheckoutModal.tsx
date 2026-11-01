import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, AlertCircle, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { checkoutOrder } from '../../api/orders';
import { Order } from '../../types/order';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

const TEST_CARDS = [
  { token: 'tok_visa', label: 'Visa (Simulated Success)', type: 'visa' },
  { token: 'tok_mastercard', label: 'Mastercard (Simulated Success)', type: 'mastercard' },
  { token: 'tok_fail', label: 'Card Declined (Simulated Failure)', type: 'fail' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, refreshCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState('42 Tech Boulevard, Silicon Valley, CA 94025');
  const [selectedToken, setSelectedToken] = useState('tok_visa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !cart) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const order = await checkoutOrder({
        shippingAddress: shippingAddress.trim(),
        testPaymentToken: selectedToken,
      });
      await refreshCart();
      onOrderSuccess(order);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Payment processing failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Secure Simulated Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / Portfolio Banner */}
        <div className="my-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 flex items-start space-x-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Simulated Payment Environment</p>
            <p className="text-amber-700">
              No real card numbers are collected or stored. Select a simulated token to test successful authorization or declined card flows.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Order Summary Snapshot */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Items Total ({cart.totalItems})</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Shipping (Simulated)</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-sm">
              <span>Total Due</span>
              <span className="text-indigo-600 text-base">${cart.subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Shipping Address</span>
            </label>
            <textarea
              required
              rows={2}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Full street address, City, State, Zip"
            />
          </div>

          {/* Test Payment Token Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
              Simulated Payment Token
            </label>
            <div className="space-y-2">
              {TEST_CARDS.map((card) => (
                <label
                  key={card.token}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedToken === card.token
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentToken"
                      value={card.token}
                      checked={selectedToken === card.token}
                      onChange={() => setSelectedToken(card.token)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-800">{card.label}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-400">{card.token}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cart.items.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Payment Gateway...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorize & Place Order (${cart.subtotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
