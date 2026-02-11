package com.saas.ecommerce.repository;

import com.saas.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findAllByStoreId(UUID storeId, Pageable pageable);

    Page<Product> findAllByStoreIdAndActiveTrue(UUID storeId, Pageable pageable);

    Optional<Product> findByIdAndStoreId(UUID id, UUID storeId);

    long countByStoreId(UUID storeId);
}
