package com.saas.ecommerce.repository;

import com.saas.ecommerce.entity.User;
import com.saas.ecommerce.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByStoreIdAndRole(UUID storeId, UserRole role);
}
