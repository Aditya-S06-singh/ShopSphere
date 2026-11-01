import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle, Ban, Truck, AlertTriangle } from 'lucide-react';
import { fetchUserOrders, cancelOrder } from '../../api/orders';
import { Order, OrderStatus } from '../../types/order';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'PAYMENT_CONFIRMED':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3 h-3" />
          <span>Payment Confirmed</span>
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3" />
          <span>Processing</span>
        </span>
      );
    case 'SHIPPED':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Truck className="w-3 h-3" />
          <span>Shipped</span>
        </span>
      );
    case 'DELIVERED':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
          <CheckCircle className="w-3 h-3" />
          <span>Delivered</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <Ban className="w-3 h-3" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" />
          <span>Pending</span>
        </span>
      );
  }
};

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchUserOrders(0, 20);
      setOrders(res.content);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  const handleCancel = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    try {
      setCancellingId(orderId);
      await cancelOrder(orderId);
      await loadOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl z-10 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Your Order History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2 stroke-1" />
              <p className="font-semibold text-gray-700">No orders placed yet</p>
              <p className="text-xs text-gray-400 mt-1">Complete a checkout to see orders and tracking status here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-50/70 border border-gray-200/70 rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/50 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-gray-900">
                      {order.orderNumber}
                    </span>
                    {statusBadge(order.status)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.productName} ({item.productSku})
                      </span>
                      <span className="font-semibold text-gray-800">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-200/50 text-xs">
                  <div className="text-gray-500">
                    Ref:{' '}
                    <span className="font-mono text-gray-700">
                      {order.paymentReference || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-sm text-gray-900">
                      Total: ${order.totalAmount.toFixed(2)}
                    </span>
                    {(order.status === 'PENDING' || order.status === 'PAYMENT_CONFIRMED') && (
                      <button
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancel(order.id)}
                        className="text-rose-600 hover:text-rose-700 font-medium hover:underline flex items-center space-x-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

