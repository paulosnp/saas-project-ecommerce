-- Platform settings table for key-value configuration
CREATE TABLE platform_settings (
    setting_key   VARCHAR(100) NOT NULL PRIMARY KEY,
    setting_value TEXT,
    description   VARCHAR(255),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed the default platform MP token (empty)
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES ('mercadopago_access_token', '', 'Access Token do Mercado Pago da plataforma')
ON CONFLICT DO NOTHING;
