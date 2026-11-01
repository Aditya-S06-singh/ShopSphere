import { Order, OrderStatus } from './order';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: Order[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}
