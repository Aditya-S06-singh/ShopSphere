import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  Ban,
  RefreshCw,
  Plus
} from 'lucide-react';
import { DashboardStats } from '../../types/admin';
import { Order, OrderStatus } from '../../types/order';
import { Product } from '../../types/product';
import { fetchDashboardStats, fetchAdminOrders, updateAdminOrderStatus } from '../../api/admin';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateStock: (productId: number, newStock: number) => Promise<void>;
  onOpenAddProduct: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateStock,
  onOpenAddProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<number, number>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        fetchDashboardStats(),
        fetchAdminOrders(selectedStatusFilter === 'ALL' ? undefined : selectedStatusFilter, 0, 30),
      ]);
      setStats(statsData);
      setOrders(ordersData.content);
    } catch (e) {
      console.error('Failed to load admin dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedStatusFilter]);

  if (!isOpen) return null;

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await updateAdminOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStockSave = async (productId: number) => {
    const val = stockInputs[productId];
    if (val === undefined || isNaN(val) || val < 0) return;
    await onUpdateStock(productId, val);
    await loadData();
  };

  const statusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAYMENT_CONFIRMED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Paid</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Operations Console</h2>
              <p className="text-xs text-gray-500">
                Milestone 5: Real-time analytics, order lifecycle fulfillment & inventory control
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              title="Refresh"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-gray-100 pt-3 pb-1 text-sm font-medium flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Overview & KPIs
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'orders'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Order Fulfillment ({stats?.totalOrders || orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-2 px-1 border-b-2 cursor-pointer transition-all ${
              activeTab === 'inventory'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Inventory Watch ({products.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-emerald-700 mb-1">
                    <span className="text-xs font-semibold">Total Revenue</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-emerald-900">
                    ${stats.totalRevenue.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">Excludes cancelled</span>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-indigo-700 mb-1">
                    <span className="text-xs font-semibold">Total Orders</span>
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-indigo-900">{stats.totalOrders}</div>
                  <span className="text-[10px] text-indigo-600 font-medium">Lifetime count</span>
                </div>

                <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-blue-700 mb-1">
                    <span className="text-xs font-semibold">Active Orders</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-blue-900">{stats.activeOrders}</div>
                  <span className="text-[10px] text-blue-600 font-medium">Needs fulfillment</span>
                </div>

                <div className="bg-purple-50/70 border border-purple-200/80 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-purple-700 mb-1">
                    <span className="text-xs font-semibold">Catalog Items</span>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-purple-900">{stats.totalProducts}</div>
                  <span className="text-[10px] text-purple-600 font-medium">Active products</span>
                </div>

                <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-amber-700 mb-1">
                    <span className="text-xs font-semibold">Low Stock (&le; 5)</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-amber-900">{stats.lowStockProducts}</div>
                  <span className="text-[10px] text-amber-600 font-medium">Restock needed</span>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 font-semibold text-xs text-gray-700">
                  Most Recent Transactions
                </div>
                <div className="divide-y divide-gray-100">
                  {stats.recentOrders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">No recent orders yet.</div>
                  ) : (
                    stats.recentOrders.map((ord) => (
                      <div key={ord.id} className="p-3.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-gray-800">{ord.orderNumber}</div>
                          <div className="text-gray-400 text-[11px]">
                            {ord.customerEmail} &bull; {new Date(ord.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-gray-900">${ord.totalAmount.toFixed(2)}</span>
                          {statusBadge(ord.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {(['ALL', 'PENDING', 'PAYMENT_CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        selectedStatusFilter === st
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              {/* Orders Table */}
              <div className="border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Current Status</th>
                      <th className="py-2.5 px-3">Lifecycle Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          No orders found matching this filter.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                            {order.orderNumber}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-gray-800">{order.customerName}</div>
                            <div className="text-[11px] text-gray-400">{order.customerEmail}</div>
                          </td>
                          <td className="py-3 px-3">
                            {order.items.map((i) => (
                              <div key={i.id} className="text-[11px] truncate max-w-xs">
                                {i.quantity}x {i.productName}
                              </div>
                            ))}
                          </td>
                          <td className="py-3 px-3 font-bold text-gray-900 whitespace-nowrap">
                            ${order.totalAmount.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">{statusBadge(order.status)}</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <select
                              disabled={updatingOrderId === order.id}
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              aria-label={`Change status for order ${order.orderNumber}`}
                              className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-purple-500 cursor-pointer disabled:opacity-40"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED (Restocks)</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY WATCH */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Direct stock controls — quantities updated here take effect immediately in checkout validation.
                </p>
                <button
                  onClick={onOpenAddProduct}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Product</span>
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Stock Level</th>
                      <th className="py-2.5 px-3">Quick Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => {
                      const isLow = p.stockQuantity <= 5;
                      const isOut = p.stockQuantity === 0;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 font-semibold text-gray-900 flex items-center space-x-2">
                            <img
                              src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                              alt={p.name}
                              className="w-7 h-7 rounded object-cover flex-shrink-0"
                            />
                            <span className="truncate max-w-xs">{p.name}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-gray-500">{p.sku}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-800">${p.price.toFixed(2)}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {isOut ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1 w-max">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Low: {p.stockQuantity} left</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {p.stockQuantity} in stock
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="number"
                                min="0"
                                placeholder={p.stockQuantity.toString()}
                                value={stockInputs[p.id] ?? ''}
                                onChange={(e) =>
                                  setStockInputs({ ...stockInputs, [p.id]: parseInt(e.target.value, 10) })
                                }
                                aria-label={`Set new stock for ${p.name}`}
                                className="w-16 border border-gray-200 rounded px-2 py-0.5 text-xs text-center"
                              />
                              <button
                                onClick={() => handleStockSave(p.id)}
                                disabled={stockInputs[p.id] === undefined}
                                className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 cursor-pointer text-xs"
                              >
                                Save
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

