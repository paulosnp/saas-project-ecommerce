package com.saas.ecommerce.repository;

import com.saas.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findAllByStoreId(UUID storeId);

    Optional<Category> findByIdAndStoreId(UUID id, UUID storeId);

    boolean existsByNameIgnoreCaseAndStoreId(String name, UUID storeId);
}
