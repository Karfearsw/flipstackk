-- Insert test users with hashed passwords
-- Password for admin: admin123
-- Password for whoisotp: stackk10m

INSERT INTO "User" (id, username, email, "passwordHash", "firstName", "lastName", role, "createdAt", "updatedAt")
VALUES 
  (
    'admin-user-id-001',
    'admin',
    'admin@flipstackk.com',
    '$2a$12$LQv3c1yqBw2fnc.eVHXVxOzTNloFXtbzIs8GEqYrSWIvjkw8OvB.u',
    'Admin',
    'User',
    'ADMIN',
    NOW(),
    NOW()
  ),
  (
    'benji-user-id-002',
    'whoisotp',
    'benji.jelleh@flipstackk.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Benji Stackk',
    'Jelleh',
    'ACQUISITIONS',
    NOW(),
    NOW()
  )
ON CONFLICT (username) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  "updatedAt" = NOW();