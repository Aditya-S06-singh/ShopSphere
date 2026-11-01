package com.shopsphere.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Fetch an order with its items eagerly — avoids N+1 on detail view */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items oi WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    /** All orders for a user, paginated (summary list — no items fetch needed) */
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** Find by orderNumber (public-facing reference) */
    Optional<Order> findByOrderNumber(String orderNumber);
}

