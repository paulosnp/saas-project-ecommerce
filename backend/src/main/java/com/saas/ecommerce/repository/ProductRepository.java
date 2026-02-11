package com.saas.ecommerce.repository;

import com.saas.ecommerce.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findAllByStoreId(UUID storeId, Pageable pageable);

    Page<Product> findAllByStoreIdAndActiveTrue(UUID storeId, Pageable pageable);

    Optional<Product> findByIdAndStoreId(UUID id, UUID storeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.storeId = :storeId")
    Optional<Product> findByIdAndStoreIdForUpdate(UUID id, UUID storeId);

    long countByStoreId(UUID storeId);
}
