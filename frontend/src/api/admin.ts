import { apiClient } from './client';
import { DashboardStats } from '../types/admin';
import { Order, OrderStatus, PagedOrders } from '../types/order';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
  return response.data;
}

export async function fetchAdminOrders(
  status?: OrderStatus,
  page = 0,
  size = 15
): Promise<PagedOrders> {
  const params: Record<string, any> = { page, size };
  if (status) params.status = status;
  const response = await apiClient.get<PagedOrders>('/admin/orders', { params });
  return response.data;
}

export async function updateAdminOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<Order> {
  const response = await apiClient.patch<Order>(`/admin/orders/${orderId}/status`, { status });
  return response.data;
}

