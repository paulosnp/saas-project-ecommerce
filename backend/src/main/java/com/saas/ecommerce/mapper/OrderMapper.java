package com.saas.ecommerce.mapper;

import com.saas.ecommerce.dto.order.OrderItemRequest;
import com.saas.ecommerce.dto.order.OrderItemResponse;
import com.saas.ecommerce.dto.order.OrderResponse;
import com.saas.ecommerce.entity.Order;
import com.saas.ecommerce.entity.OrderItem;
import com.saas.ecommerce.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "items", source = "items")
    OrderResponse toResponse(Order order);

    @Mapping(target = "productName", source = "product.name")
    OrderItemResponse toItemResponse(OrderItem item);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "product", source = "product")
    @Mapping(target = "unitPrice", source = "product.price") // Preço inicial é o do produto
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    OrderItem toItemEntity(OrderItemRequest request, Product product);
}
