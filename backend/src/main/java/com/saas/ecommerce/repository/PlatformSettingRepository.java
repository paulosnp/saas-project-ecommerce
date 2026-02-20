package com.saas.ecommerce.repository;

import com.saas.ecommerce.entity.PlatformSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, String> {

    Optional<PlatformSetting> findByKey(String key);
}
