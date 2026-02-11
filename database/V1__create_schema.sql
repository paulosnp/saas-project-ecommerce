-- ============================================================
-- SaaS Multi-tenant E-commerce — DDL Script (PostgreSQL)
-- Estratégia: Single DB, Schema Compartilhado, coluna store_id
-- Compatível com Flyway (V1__create_schema.sql)
-- ============================================================

-- Extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. STORES (Tabela raiz do tenant)
-- ============================================================
CREATE TABLE stores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150)  NOT NULL,
    slug_url        VARCHAR(100)  NOT NULL UNIQUE,
    banner_url      TEXT,
    logo_url        TEXT,
    primary_color   VARCHAR(7)    DEFAULT '#000000',
    mercado_pago_token  TEXT,
    melhor_envio_token  TEXT,
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_slug ON stores (slug_url);

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name   VARCHAR(150)  NOT NULL,
    email       VARCHAR(255)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    role        VARCHAR(20)   NOT NULL
                    CHECK (role IN ('SUPER_ADMIN', 'ADMIN_LOJA', 'CLIENTE')),
    phone       VARCHAR(20),
    store_id    UUID          REFERENCES stores(id) ON DELETE SET NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_store_id ON users (store_id);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    store_id    UUID         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_store_id ON categories (store_id);

-- Garante que não haja categorias com mesmo nome na mesma loja
CREATE UNIQUE INDEX uq_category_name_per_store ON categories (store_id, LOWER(name));

-- ============================================================
-- 4. PRODUCTS
-- ============================================================
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200)   NOT NULL,
    description     TEXT,
    price           DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    stock_quantity  INTEGER        NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url       TEXT,
    weight_kg       DECIMAL(8, 3),
    height_cm       DECIMAL(8, 2),
    width_cm        DECIMAL(8, 2),
    length_cm       DECIMAL(8, 2),
    active          BOOLEAN        NOT NULL DEFAULT TRUE,
    category_id     UUID           NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    store_id        UUID           NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_store_id    ON products (store_id);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_active      ON products (store_id, active);

-- ============================================================
-- 5. ORDERS
-- ============================================================
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status          VARCHAR(30)    NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN (
                            'PENDING',
                            'AWAITING_PAYMENT',
                            'PAYMENT_CONFIRMED',
                            'PROCESSING',
                            'SHIPPED',
                            'DELIVERED',
                            'CANCELLED',
                            'REFUNDED'
                        )),
    total           DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
    shipping_cost   DECIMAL(10, 2) DEFAULT 0,
    tracking_code   VARCHAR(100),
    customer_id     UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    store_id        UUID           NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_store_id    ON orders (store_id);
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status      ON orders (store_id, status);

-- ============================================================
-- 6. ORDER_ITEMS
-- ============================================================
CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quantity    INTEGER        NOT NULL CHECK (quantity > 0),
    unit_price  DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    order_id    UUID           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID           NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

-- ============================================================
-- 7. ADDRESSES (Endereço de entrega do cliente)
-- ============================================================
CREATE TABLE addresses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    street      VARCHAR(255) NOT NULL,
    number      VARCHAR(20)  NOT NULL,
    complement  VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(2)   NOT NULL,
    zip_code    VARCHAR(9)   NOT NULL,
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses (user_id);

-- ============================================================
-- 8. PLANS (Planos de assinatura da plataforma)
-- ============================================================
CREATE TABLE plans (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(50)    NOT NULL UNIQUE,
    description     TEXT,
    price           DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    max_products    INTEGER        NOT NULL DEFAULT 50,
    max_orders_month INTEGER       NOT NULL DEFAULT 100,
    features        JSONB          DEFAULT '{}',
    active          BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Planos padrão
INSERT INTO plans (name, description, price, max_products, max_orders_month) VALUES
    ('FREE',       'Plano gratuito com recursos limitados',    0.00,   10,   20),
    ('BASIC',      'Plano básico para pequenos lojistas',     49.90,   50,  200),
    ('PREMIUM',    'Plano premium com recursos avançados',   149.90,  500, 2000),
    ('ENTERPRISE', 'Plano empresarial sem limites',          399.90, -1,   -1);

-- ============================================================
-- 9. SUBSCRIPTIONS (Assinaturas das lojas)
-- ============================================================
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id        UUID           NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    plan_id         UUID           NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status          VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN (
                            'ACTIVE',
                            'PAST_DUE',
                            'CANCELLED',
                            'EXPIRED',
                            'TRIAL'
                        )),
    starts_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP,
    cancelled_at    TIMESTAMP,
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_store_id ON subscriptions (store_id);
CREATE INDEX idx_subscriptions_status   ON subscriptions (status);
CREATE UNIQUE INDEX uq_active_subscription_per_store
    ON subscriptions (store_id) WHERE status IN ('ACTIVE', 'TRIAL');

-- ============================================================
-- TRIGGER: Validação Cross-Tenant (Produto ↔ Categoria)
-- Garante que um produto só pode ser vinculado a uma categoria
-- que pertença à MESMA loja (mesmo store_id).
-- ============================================================
CREATE OR REPLACE FUNCTION fn_validate_product_category_tenant()
RETURNS TRIGGER AS $$
DECLARE
    v_category_store_id UUID;
BEGIN
    SELECT store_id INTO v_category_store_id
    FROM categories
    WHERE id = NEW.category_id;

    IF v_category_store_id IS NULL THEN
        RAISE EXCEPTION 'Categoria com id "%" não encontrada.', NEW.category_id;
    END IF;

    IF v_category_store_id <> NEW.store_id THEN
        RAISE EXCEPTION
            'Violação de isolamento multi-tenant: produto (store_id=%) não pode usar categoria (store_id=%).',
            NEW.store_id, v_category_store_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_product_category_tenant
    BEFORE INSERT OR UPDATE OF category_id, store_id
    ON products
    FOR EACH ROW
    EXECUTE FUNCTION fn_validate_product_category_tenant();

-- ============================================================
-- TRIGGER: Validação Cross-Tenant (Order ↔ Loja)
-- Garante que o customer de um pedido está associado à loja
-- ou é um cliente geral (store_id IS NULL).
-- ============================================================
CREATE OR REPLACE FUNCTION fn_validate_order_customer()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_role VARCHAR(20);
BEGIN
    SELECT role INTO v_customer_role
    FROM users
    WHERE id = NEW.customer_id;

    IF v_customer_role IS NULL THEN
        RAISE EXCEPTION 'Usuário com id "%" não encontrado.', NEW.customer_id;
    END IF;

    IF v_customer_role <> 'CLIENTE' THEN
        RAISE EXCEPTION
            'Apenas usuários com role CLIENTE podem realizar pedidos. Role atual: %.',
            v_customer_role;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_order_customer
    BEFORE INSERT OR UPDATE OF customer_id
    ON orders
    FOR EACH ROW
    EXECUTE FUNCTION fn_validate_order_customer();

-- ============================================================
-- FUNCTION: Atualiza updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
