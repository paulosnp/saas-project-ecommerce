package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.plan.PlanRequest;
import com.saas.ecommerce.dto.plan.PlanResponse;
import com.saas.ecommerce.entity.Plan;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.mapper.PlanMapper;
import com.saas.ecommerce.repository.PlanRepository;
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

    public List<PlanResponse> findAll() {
        return planRepository.findAll().stream()
                .map(planMapper::toResponse)
                .toList();
    }

    public List<PlanResponse> findAllActive() {
        return planRepository.findAllByActiveTrue().stream()
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
}
