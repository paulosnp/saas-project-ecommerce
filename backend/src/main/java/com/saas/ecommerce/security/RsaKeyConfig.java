package com.saas.ecommerce.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnResource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.InputStream;
import java.security.KeyStore;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.cert.Certificate;

/**
 * Carrega as chaves RSA do keystore PKCS12 para assinatura JWT.
 * Só é ativado quando o keystore existe no classpath.
 * Em testes, usa-se TestRsaKeyConfig (chaves in-memory).
 */
@Configuration
@ConditionalOnResource(resources = "${jwt.keystore-path:classpath:keys/keystore.p12}")
public class RsaKeyConfig {

    @Value("${jwt.keystore-path:classpath:keys/keystore.p12}")
    private Resource keystorePath;

    @Value("${jwt.keystore-password:changeit}")
    private String keystorePassword;

    @Value("${jwt.key-alias:jwt}")
    private String keyAlias;

    @Value("${jwt.expiration:86400000}")
    private long expiration;

    @Bean
    public RsaKeyProperties rsaKeyProperties() throws Exception {
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        try (InputStream is = keystorePath.getInputStream()) {
            keyStore.load(is, keystorePassword.toCharArray());
        }

        RSAPrivateKey privateKey = (RSAPrivateKey) keyStore.getKey(keyAlias, keystorePassword.toCharArray());
        Certificate cert = keyStore.getCertificate(keyAlias);
        RSAPublicKey publicKey = (RSAPublicKey) cert.getPublicKey();

        return new RsaKeyProperties(publicKey, privateKey, expiration);
    }
}
