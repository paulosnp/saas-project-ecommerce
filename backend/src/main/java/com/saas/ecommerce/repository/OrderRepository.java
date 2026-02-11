package com.saas.ecommerce.repository;

import com.saas.ecommerce.entity.Order;
import com.saas.ecommerce.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findAllByStoreId(UUID storeId, Pageable pageable);

    Page<Order> findAllByCustomerId(UUID customerId, Pageable pageable);

    Optional<Order> findByIdAndStoreId(UUID id, UUID storeId);

    long countByStoreIdAndStatus(UUID storeId, OrderStatus status);
}
