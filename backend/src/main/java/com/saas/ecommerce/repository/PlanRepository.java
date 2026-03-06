package com.saas.ecommerce.repository;

import com.saas.ecommerce.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlanRepository extends JpaRepository<Plan, UUID> {

    List<Plan> findAllByActiveTrue();

    List<Plan> findAllByOrderByDisplayOrderAsc();

    List<Plan> findAllByActiveTrueOrderByDisplayOrderAsc();
}
