package com.shopsphere.order.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStatsDto(
        BigDecimal totalRevenue,
        long totalOrders,
        long activeOrders,
        long totalProducts,
        long lowStockProducts,
        List<OrderDto> recentOrders
) {
}
