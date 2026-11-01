import { apiClient } from './client';
import { Cart, AddToCartRequest, UpdateCartItemRequest } from '../types/cart';

export async function fetchCart(): Promise<Cart> {
  const response = await apiClient.get<Cart>('/cart');
  return response.data;
}

export async function addToCart(request: AddToCartRequest): Promise<Cart> {
  const response = await apiClient.post<Cart>('/cart/items', request);
  return response.data;
}

export async function updateCartItem(itemId: number, request: UpdateCartItemRequest): Promise<Cart> {
  const response = await apiClient.patch<Cart>(`/cart/items/${itemId}`, request);
  return response.data;
}

export async function removeCartItem(itemId: number): Promise<Cart> {
  const response = await apiClient.delete<Cart>(`/cart/items/${itemId}`);
  return response.data;
}

export async function clearCart(): Promise<void> {
  await apiClient.delete('/cart');
}
