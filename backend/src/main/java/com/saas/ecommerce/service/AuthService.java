package com.saas.ecommerce.service;

import com.saas.ecommerce.dto.auth.LoginRequest;
import com.saas.ecommerce.dto.auth.LoginResponse;
import com.saas.ecommerce.dto.auth.RegisterRequest;
import com.saas.ecommerce.entity.Store;
import com.saas.ecommerce.entity.User;
import com.saas.ecommerce.enums.UserRole;
import com.saas.ecommerce.exception.ResourceNotFoundException;
import com.saas.ecommerce.repository.StoreRepository;
import com.saas.ecommerce.repository.UserRepository;
import com.saas.ecommerce.security.CustomUserDetails;
import com.saas.ecommerce.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = tokenProvider.generateToken(userDetails);

        return new LoginResponse(
                token,
                userDetails.getRole().name(),
                userDetails.getStoreId(),
                userDetails.getUsername(),
                getUserFullName(userDetails.getId()));
    }

    @Transactional
    public LoginResponse registerStoreOwner(RegisterRequest request) {
        validateEmailNotTaken(request.email());

        Store store = Store.builder()
                .name(request.storeName())
                .slugUrl(request.storeSlug())
                .active(true)
                .build();
        store = storeRepository.save(store);

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(UserRole.ADMIN_LOJA)
                .phone(request.phone())
                .storeId(store.getId())
                .build();
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(
                user.getId(), user.getEmail(), user.getPassword(),
                user.getRole(), user.getStoreId());
        String token = tokenProvider.generateToken(userDetails);

        return new LoginResponse(
                token, user.getRole().name(), store.getId(),
                user.getEmail(), user.getFullName());
    }

    @Transactional
    public LoginResponse registerCustomer(RegisterRequest request) {
        validateEmailNotTaken(request.email());

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(UserRole.CLIENTE)
                .phone(request.phone())
                .build();
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(
                user.getId(), user.getEmail(), user.getPassword(),
                user.getRole(), null);
        String token = tokenProvider.generateToken(userDetails);

        return new LoginResponse(
                token, user.getRole().name(), null,
                user.getEmail(), user.getFullName());
    }

    private void validateEmailNotTaken(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email já está em uso: " + email);
        }
    }

    private String getUserFullName(java.util.UUID userId) {
        return userRepository.findById(userId)
                .map(User::getFullName)
                .orElse("");
    }
}
