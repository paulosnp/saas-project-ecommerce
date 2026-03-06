package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.plan.PlanRequest;
import com.saas.ecommerce.dto.plan.PlanResponse;
import com.saas.ecommerce.entity.Plan;
import com.saas.ecommerce.entity.Subscription;
import com.saas.ecommerce.enums.SubscriptionStatus;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.mapper.PlanMapper;
import com.saas.ecommerce.repository.PlanRepository;
import com.saas.ecommerce.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlanService {

    private final PlanRepository planRepository;
    private final PlanMapper planMapper;
    private final SubscriptionRepository subscriptionRepository;

    private static final List<SubscriptionStatus> ACTIVE_STATUSES = List.of(SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIAL);

    public List<PlanResponse> findAll() {
        return planRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(planMapper::toResponse)
                .toList();
    }

    public List<PlanResponse> findAllActive() {
        return planRepository.findAllByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(planMapper::toResponse)
                .toList();
    }

    public PlanResponse findById(UUID id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plano", "id", id));
        return planMapper.toResponse(plan);
    }

    @Transactional
    public PlanResponse create(PlanRequest request) {
        Plan plan = planMapper.toEntity(request);
        plan = planRepository.save(plan);
        return planMapper.toResponse(plan);
    }

    @Transactional
    public PlanResponse update(UUID id, PlanRequest request) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plano", "id", id));
        planMapper.updateEntity(request, plan);
        plan = planRepository.save(plan);
        return planMapper.toResponse(plan);
    }

    public long countActiveSubscriptions(UUID planId) {
        planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plano", "id", planId));
        return subscriptionRepository.findAllByPlanId(planId).size();
    }

    @Transactional
    public void delete(UUID planId, UUID migrateToPlanId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plano", "id", planId));

        // Check ALL subscriptions (any status) due to FK constraint
        List<Subscription> allSubs = subscriptionRepository.findAllByPlanId(planId);

        if (!allSubs.isEmpty()) {
            // Separate active vs inactive subscriptions
            List<Subscription> activeSubs = allSubs.stream()
                    .filter(s -> ACTIVE_STATUSES.contains(s.getStatus()))
                    .toList();
            List<Subscription> inactiveSubs = allSubs.stream()
                    .filter(s -> !ACTIVE_STATUSES.contains(s.getStatus()))
                    .toList();

            if (!activeSubs.isEmpty()) {
                // Active subscriptions require migration
                if (migrateToPlanId == null) {
                    throw new IllegalStateException(
                            "Existem " + activeSubs.size() + " assinaturas ativas neste plano. " +
                                    "Informe um plano de destino para migração.");
                }

                Plan targetPlan = planRepository.findById(migrateToPlanId)
                        .orElseThrow(() -> new ResourceNotFoundException("Plano destino", "id", migrateToPlanId));

                if (!targetPlan.getActive()) {
                    throw new IllegalStateException("O plano de destino está inativo.");
                }

                // Migrate active subscriptions
                activeSubs.forEach(sub -> sub.setPlanId(migrateToPlanId));
                subscriptionRepository.saveAll(activeSubs);
            }

            // Delete inactive subscriptions (CANCELLED, EXPIRED) so they don't block FK
            if (!inactiveSubs.isEmpty()) {
                subscriptionRepository.deleteAll(inactiveSubs);
            }
        }

        planRepository.delete(plan);
    }
}
