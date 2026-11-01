import { apiClient } from './client';
import { Order, CheckoutRequest, PagedOrders } from '../types/order';

export async function checkoutOrder(request: CheckoutRequest): Promise<Order> {
  const response = await apiClient.post<Order>('/orders/checkout', request);
  return response.data;
}

export async function fetchUserOrders(page = 0, size = 10): Promise<PagedOrders> {
  const response = await apiClient.get<PagedOrders>('/orders', {
    params: { page, size },
  });
  return response.data;
}

export async function fetchOrderById(id: number): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${id}`);
  return response.data;
}

export async function cancelOrder(id: number): Promise<Order> {
  const response = await apiClient.patch<Order>(`/orders/${id}/cancel`);
  return response.data;
}
