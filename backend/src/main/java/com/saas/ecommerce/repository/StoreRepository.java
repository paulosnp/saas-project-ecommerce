package com.saas.ecommerce.repository;

import com.saas.ecommerce.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StoreRepository extends JpaRepository<Store, UUID> {

    Optional<Store> findBySlugUrl(String slugUrl);

    boolean existsBySlugUrl(String slugUrl);

    long countByActive(Boolean active);
}
