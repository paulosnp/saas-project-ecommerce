package com.saas.ecommerce.mapper;

import com.saas.ecommerce.dto.subscription.SubscriptionResponse;
import com.saas.ecommerce.entity.Subscription;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {

    @Mapping(target = "storeName", source = "store.name")
    @Mapping(target = "planName", source = "plan.name")
    @Mapping(target = "status", expression = "java(subscription.getStatus().name())")
    SubscriptionResponse toResponse(Subscription subscription);
}
