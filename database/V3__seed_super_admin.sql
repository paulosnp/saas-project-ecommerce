-- Seed Super Admin user
-- Email: superadmin@plataforma.com / Password: admin123
-- BCrypt hash of 'admin123'
INSERT INTO users (id, full_name, email, password, role, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Super Admin',
    'superadmin@plataforma.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyev8EJebsTpfPZYQTfNnBXGLK5W42/tiy',
    'SUPER_ADMIN',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
