package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.address.AddressRequest;
import com.saas.ecommerce.dto.address.AddressResponse;
import com.saas.ecommerce.entity.Address;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.mapper.AddressMapper;
import com.saas.ecommerce.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AddressService {

    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;

    public List<AddressResponse> findAllByUser(UUID userId) {
        return addressRepository.findAllByUserId(userId)
                .stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    public AddressResponse findByIdAndUser(UUID id, UUID userId) {
        return addressRepository.findByIdAndUserId(id, userId)
                .map(addressMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Endereço", "id", id));
    }

    @Transactional
    public AddressResponse create(AddressRequest request, UUID userId) {
        if (Boolean.TRUE.equals(request.isDefault())) {
            addressRepository.clearDefaultForUser(userId);
        }

        Address address = addressMapper.toEntity(request);
        address.setUserId(userId);
        address = addressRepository.save(address);
        return addressMapper.toResponse(address);
    }

    @Transactional
    public AddressResponse update(UUID id, AddressRequest request, UUID userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Endereço", "id", id));

        if (Boolean.TRUE.equals(request.isDefault())) {
            addressRepository.clearDefaultForUser(userId);
        }

        addressMapper.updateEntity(request, address);
        address = addressRepository.save(address);
        return addressMapper.toResponse(address);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Endereço", "id", id));
        addressRepository.delete(address);
    }
}
