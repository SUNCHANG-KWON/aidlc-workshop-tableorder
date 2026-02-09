package com.tableorder.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_history")
public class OrderHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long tableId;
    @Column(nullable = false)
    private String sessionId;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String orderData;
    @Column(nullable = false)
    private Integer totalAmount;
    @Column(nullable = false)
    private LocalDateTime orderedAt;
    @Column(nullable = false)
    private LocalDateTime completedAt;

    public OrderHistory() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTableId() { return tableId; }
    public void setTableId(Long tableId) { this.tableId = tableId; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getOrderData() { return orderData; }
    public void setOrderData(String orderData) { this.orderData = orderData; }
    public Integer getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Integer totalAmount) { this.totalAmount = totalAmount; }
    public LocalDateTime getOrderedAt() { return orderedAt; }
    public void setOrderedAt(LocalDateTime orderedAt) { this.orderedAt = orderedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}