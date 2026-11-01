package com.shopsphere.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Fetch an order with its items eagerly — avoids N+1 on detail view */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items oi WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    /** All orders for a user, paginated (summary list — no items fetch needed) */
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** Find by orderNumber (public-facing reference) */
    Optional<Order> findByOrderNumber(String orderNumber);

    /** Admin: all orders paginated */
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** Admin: filter orders by status */
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    /** Admin Dashboard: total revenue from completed/active orders */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> com.shopsphere.order.OrderStatus.CANCELLED")
    BigDecimal sumTotalRevenue();

    /** Admin Dashboard: count orders matching statuses */
    long countByStatusIn(Collection<OrderStatus> statuses);

    /** Admin Dashboard: 5 most recent orders */
    List<Order> findTop5ByOrderByCreatedAtDesc();
}

