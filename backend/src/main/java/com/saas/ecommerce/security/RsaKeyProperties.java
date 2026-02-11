package com.saas.ecommerce.security;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

/**
 * Record contendo as chaves RSA (carregadas do keystore PKCS12)
 * e o tempo de expiração do token JWT.
 */
public record RsaKeyProperties(
                RSAPublicKey publicKey,
                RSAPrivateKey privateKey,
                long expiration) {
}
