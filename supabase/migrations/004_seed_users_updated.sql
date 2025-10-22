-- Insert test users with correct schema
INSERT INTO "User" ("id", "username", "email", "passwordHash", "firstName", "lastName", "role", "createdAt", "updatedAt")
VALUES 
  ('admin-user-id', 'admin', 'admin@flipstackk.com', '$2b$10$KpAqOm5kz/ZFL/4OmIxmqeZJBeg7ByyUKr7A0xztqWEB/gL3ufqn6', 'Admin', 'User', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('whoisotp-user-id', 'whoisotp', 'benji.jelleh@flipstackk.com', '$2b$10$QC4KSaBbD4Jhepx4l.VW9On/n4irYAN21UF0YRi0WL4rUVJh/OM4W', 'Benji', 'Jelleh', 'ACQUISITIONS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("username") DO UPDATE SET
  "email" = EXCLUDED."email",
  "passwordHash" = EXCLUDED."passwordHash",
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  "role" = EXCLUDED."role",
  "updatedAt" = CURRENT_TIMESTAMP;