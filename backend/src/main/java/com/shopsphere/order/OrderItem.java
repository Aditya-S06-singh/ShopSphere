package com.shopsphere.order;

import com.shopsphere.product.Product;
import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * Snapshot of one product line in an order.
 * We snapshot name, sku, and price at order time so historical orders
 * remain accurate even if the product is later edited or deleted.
 */
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /** Nullable: product may be soft-deleted later, we still keep the snapshot */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    /** Price at the time of order — immutable record */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    /** Snapshot of product name — preserved even if product is renamed/deleted */
    @Column(nullable = false, length = 200)
    private String productName;

    /** Snapshot of product SKU */
    @Column(nullable = false, length = 60)
    private String productSku;

    public OrderItem() {
    }

    public OrderItem(Order order, Product product, int quantity, BigDecimal unitPrice, String productName, String productSku) {
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.productName = productName;
        this.productSku = productSku;
    }

    // Getters and Setters
    public Long getId() { return id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }
}

