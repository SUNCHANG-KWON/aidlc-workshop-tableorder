package com.tableorder.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stores")
public class Store {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String storeIdentifier;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Store() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStoreIdentifier() { return storeIdentifier; }
    public void setStoreIdentifier(String storeIdentifier) { this.storeIdentifier = storeIdentifier; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}