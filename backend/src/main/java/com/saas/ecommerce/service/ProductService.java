package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.product.ProductRequest;
import com.saas.ecommerce.dto.product.ProductResponse;
import com.saas.ecommerce.entity.Product;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.mapper.ProductMapper;
import com.saas.ecommerce.repository.ProductRepository;
import com.saas.ecommerce.tenant.TenantAware;
import com.saas.ecommerce.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service para gerenciamento de produtos com isolamento multi-tenant.
 * A anotação @TenantAware ativa o Hibernate Filter automaticamente,
 * garantindo que NENHUMA query vaze dados entre lojas.
 */
@Service
@RequiredArgsConstructor
@TenantAware
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public Page<ProductResponse> findAll(Pageable pageable) {
        UUID storeId = TenantContext.requireCurrentTenant();
        return productRepository.findAllByStoreId(storeId, pageable)
                .map(productMapper::toResponse);
    }

    public Page<ProductResponse> findAllActive(Pageable pageable) {
        UUID storeId = TenantContext.requireCurrentTenant();
        return productRepository.findAllByStoreIdAndActiveTrue(storeId, pageable)
                .map(productMapper::toResponse);
    }

    public ProductResponse findById(UUID id) {
        UUID storeId = TenantContext.requireCurrentTenant();
        Product product = productRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        UUID storeId = TenantContext.requireCurrentTenant();
        Product product = productMapper.toEntity(request);
        product.setStoreId(storeId);
        product = productRepository.save(product);
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        UUID storeId = TenantContext.requireCurrentTenant();
        Product product = productRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));
        productMapper.updateEntity(request, product);
        product = productRepository.save(product);
        return productMapper.toResponse(product);
    }

    @Transactional
    public void delete(UUID id) {
        UUID storeId = TenantContext.requireCurrentTenant();
        Product product = productRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", "id", id));
        productRepository.delete(product);
    }
}
