package com.tableorder.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "store_tables")
public class StoreTable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long storeId;
    @Column(nullable = false)
    private Integer tableNumber;
    @Column(nullable = false)
    private String passwordHash;
    private String currentSessionId;
    private LocalDateTime sessionStartedAt;

    public StoreTable() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }
    public Integer getTableNumber() { return tableNumber; }
    public void setTableNumber(Integer tableNumber) { this.tableNumber = tableNumber; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getCurrentSessionId() { return currentSessionId; }
    public void setCurrentSessionId(String currentSessionId) { this.currentSessionId = currentSessionId; }
    public LocalDateTime getSessionStartedAt() { return sessionStartedAt; }
    public void setSessionStartedAt(LocalDateTime sessionStartedAt) { this.sessionStartedAt = sessionStartedAt; }
}