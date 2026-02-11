package com.saas.ecommerce.mapper;

import com.saas.ecommerce.dto.plan.PlanRequest;
import com.saas.ecommerce.dto.plan.PlanResponse;
import com.saas.ecommerce.entity.Plan;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PlanMapper {

    PlanResponse toResponse(Plan plan);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "features", ignore = true)
    Plan toEntity(PlanRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "features", ignore = true)
    void updateEntity(PlanRequest request, @MappingTarget Plan plan);
}
