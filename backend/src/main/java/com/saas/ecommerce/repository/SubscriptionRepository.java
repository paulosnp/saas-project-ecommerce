package com.saas.ecommerce.repository;

import com.saas.ecommerce.entity.Subscription;
import com.saas.ecommerce.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByStoreIdAndStatusIn(UUID storeId, java.util.Collection<SubscriptionStatus> statuses);

    Page<Subscription> findAllByStatus(SubscriptionStatus status, Pageable pageable);

    Optional<Subscription> findByStoreIdAndStatus(UUID storeId, SubscriptionStatus status);
}
