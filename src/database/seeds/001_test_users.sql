-- Seed data for testing
-- Note: Password for all test users is 'Password123!'

INSERT INTO users (id, email, password_hash, phone, is_active, is_2fa_enabled)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'testuser@example.com',
        '$2b$10$YourHashedPasswordHere',
        '+1234567890',
        true,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'admin@example.com',
        '$2b$10$YourHashedPasswordHere',
        '+1234567891',
        true,
        true
    )
ON CONFLICT (email) DO NOTHING;
