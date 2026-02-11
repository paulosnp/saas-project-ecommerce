package com.saas.ecommerce.repository;

import com.saas.ecommerce.entity.Order;
import com.saas.ecommerce.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findAllByStoreId(UUID storeId, Pageable pageable);

    Page<Order> findAllByCustomerId(UUID customerId, Pageable pageable);

    Optional<Order> findByIdAndStoreId(UUID id, UUID storeId);

    long countByStoreIdAndStatus(UUID storeId, OrderStatus status);

    long countByStoreId(UUID storeId);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.storeId = :storeId AND o.status IN :statuses")
    BigDecimal sumTotalByStoreIdAndStatusIn(UUID storeId, List<OrderStatus> statuses);

    long countByStoreIdAndCreatedAtAfter(UUID storeId, LocalDateTime after);

    List<Order> findTop5ByStoreIdOrderByCreatedAtDesc(UUID storeId);
}
