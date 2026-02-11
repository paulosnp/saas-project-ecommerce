package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.subscription.SubscriptionRequest;
import com.saas.ecommerce.dto.subscription.SubscriptionResponse;
import com.saas.ecommerce.entity.Plan;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.entity.Subscription;
import com.saas.ecommerce.enums.SubscriptionStatus;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.mapper.SubscriptionMapper;
import com.saas.ecommerce.repository.PlanRepository;
import com.saas.ecommerce.repository.StoreRepository;
import com.saas.ecommerce.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final StoreRepository storeRepository;
    private final PlanRepository planRepository;
    private final SubscriptionMapper subscriptionMapper;

    public Page<SubscriptionResponse> findAll(Pageable pageable) {
        return subscriptionRepository.findAll(pageable)
                .map(subscriptionMapper::toResponse);
    }

    public SubscriptionResponse findById(UUID id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assinatura", "id", id));
        return subscriptionMapper.toResponse(sub);
    }

    @Transactional
    public SubscriptionResponse create(SubscriptionRequest request) {
        Store store = storeRepository.findById(request.storeId())
                .orElseThrow(() -> new ResourceNotFoundException("Loja", "id", request.storeId()));

        Plan plan = planRepository.findById(request.planId())
                .orElseThrow(() -> new ResourceNotFoundException("Plano", "id", request.planId()));

        // Cancela assinatura ativa anterior, se existir
        subscriptionRepository.findByStoreIdAndStatusIn(
                request.storeId(),
                List.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL)).ifPresent(existing -> {
                    existing.setStatus(SubscriptionStatus.CANCELLED);
                    existing.setCancelledAt(LocalDateTime.now());
                    subscriptionRepository.save(existing);
                });

        Subscription subscription = Subscription.builder()
                .storeId(store.getId())
                .planId(plan.getId())
                .status(SubscriptionStatus.ACTIVE)
                .startsAt(LocalDateTime.now())
                .build();
        subscription = subscriptionRepository.save(subscription);

        // Recarrega com joins para o mapper
        subscription = subscriptionRepository.findById(subscription.getId()).orElseThrow();
        return subscriptionMapper.toResponse(subscription);
    }

    @Transactional
    public SubscriptionResponse updateStatus(UUID id, SubscriptionStatus newStatus) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assinatura", "id", id));

        sub.setStatus(newStatus);
        if (newStatus == SubscriptionStatus.CANCELLED) {
            sub.setCancelledAt(LocalDateTime.now());
        }

        sub = subscriptionRepository.save(sub);
        return subscriptionMapper.toResponse(sub);
    }
}
