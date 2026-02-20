package com.saas.ecommerce.service;

import com.saas.ecommerce.entity.PlatformSetting;
import com.saas.ecommerce.repository.PlatformSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlatformSettingsService {

    public static final String KEY_MP_ACCESS_TOKEN = "mercadopago_access_token";
    public static final String KEY_MP_NOTIFICATION_URL = "mercadopago_notification_url";

    private final PlatformSettingRepository repository;

    @Transactional(readOnly = true)
    public Optional<String> get(String key) {
        return repository.findByKey(key).map(PlatformSetting::getValue);
    }

    @Transactional(readOnly = true)
    public String getOrDefault(String key, String defaultValue) {
        return repository.findByKey(key)
                .map(PlatformSetting::getValue)
                .orElse(defaultValue);
    }

    @Transactional
    public void set(String key, String value, String description) {
        PlatformSetting setting = repository.findByKey(key)
                .orElse(PlatformSetting.builder()
                        .key(key)
                        .description(description)
                        .build());
        setting.setValue(value);
        repository.save(setting);
    }

    @Transactional(readOnly = true)
    public Map<String, String> getAll() {
        Map<String, String> settings = new HashMap<>();
        repository.findAll().forEach(s -> settings.put(s.getKey(), s.getValue()));
        return settings;
    }

    /**
     * Returns the platform Mercado Pago access token from the database.
     */
    @Transactional(readOnly = true)
    public String getMercadoPagoAccessToken() {
        return get(KEY_MP_ACCESS_TOKEN).orElse("");
    }

    /**
     * Masks a token for display: shows first 10 and last 4 characters.
     */
    public String maskToken(String token) {
        if (token == null || token.length() < 20)
            return "****";
        return token.substring(0, 10) + "****" + token.substring(token.length() - 4);
    }
}
