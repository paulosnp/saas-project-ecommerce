package com.saas.ecommerce.config;

import com.saas.ecommerce.security.RsaKeyProperties;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

/**
 * Configuração de teste que gera um par de chaves RSA em memória,
 * eliminando a necessidade de um keystore .p12 nos testes.
 * O @Primary garante que este bean sobreponha o RsaKeyConfig de produção.
 */
@TestConfiguration
public class TestRsaKeyConfig {

    @Bean
    @Primary
    public RsaKeyProperties rsaKeyProperties() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        KeyPair keyPair = generator.generateKeyPair();

        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();

        return new RsaKeyProperties(publicKey, privateKey, 86400000L);
    }
}
