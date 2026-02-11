package com.saas.ecommerce.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final RsaKeyProperties rsaKeys;

    public String generateToken(CustomUserDetails userDetails) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + rsaKeys.expiration());

        var builder = Jwts.builder()
                .subject(userDetails.getId().toString())
                .claim("email", userDetails.getUsername())
                .claim("role", userDetails.getRole().name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(rsaKeys.privateKey(), Jwts.SIG.RS256);

        if (userDetails.getStoreId() != null) {
            builder.claim("storeId", userDetails.getStoreId().toString());
        }

        return builder.compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(rsaKeys.publicKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Token JWT inválido: {}", e.getMessage());
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(rsaKeys.publicKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(getClaims(token).getSubject());
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).get("email", String.class);
    }

    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    public UUID getStoreIdFromToken(String token) {
        String storeId = getClaims(token).get("storeId", String.class);
        return storeId != null ? UUID.fromString(storeId) : null;
    }
}
