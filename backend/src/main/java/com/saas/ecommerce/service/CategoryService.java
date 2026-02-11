package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.category.CategoryRequest;
import com.saas.ecommerce.dto.category.CategoryResponse;
import com.saas.ecommerce.entity.Category;
import com.saas.ecommerce.exception.DuplicateResourceException;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.mapper.CategoryMapper;
import com.saas.ecommerce.repository.CategoryRepository;
import com.saas.ecommerce.tenant.TenantAware;
import com.saas.ecommerce.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@TenantAware
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public List<CategoryResponse> findAll() {
        UUID storeId = TenantContext.requireCurrentTenant();
        return categoryRepository.findAllByStoreId(storeId).stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    public CategoryResponse findById(UUID id) {
        UUID storeId = TenantContext.requireCurrentTenant();
        Category category = categoryRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        UUID storeId = TenantContext.requireCurrentTenant();

        if (categoryRepository.existsByNameIgnoreCaseAndStoreId(request.name(), storeId)) {
            throw new DuplicateResourceException("Categoria", "nome", request.name());
        }

        Category category = categoryMapper.toEntity(request);
        category.setStoreId(storeId);
        category = categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request) {
        UUID storeId = TenantContext.requireCurrentTenant();
        Category category = categoryRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));

        boolean nameChanged = !category.getName().equalsIgnoreCase(request.name());
        if (nameChanged && categoryRepository.existsByNameIgnoreCaseAndStoreId(request.name(), storeId)) {
            throw new DuplicateResourceException("Categoria", "nome", request.name());
        }

        categoryMapper.updateEntity(request, category);
        category = categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public void delete(UUID id) {
        UUID storeId = TenantContext.requireCurrentTenant();
        Category category = categoryRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", "id", id));
        categoryRepository.delete(category);
    }
}
