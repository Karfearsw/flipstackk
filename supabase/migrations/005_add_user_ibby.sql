-- Insert new user 'ibby'
INSERT INTO "User" ("id", "username", "email", "passwordHash", "firstName", "lastName", "role", "createdAt", "updatedAt")
VALUES 
  ('ibby-user-id', 'ibby', 'ibrahim.ibby@flipstackk.com', '$2b$10$dpYwuFS54q.crlu5RA5YwOA.Km75doKx09VGkk.YbdUjU3N3zDXxm', 'Ibrahim', 'Ibby', 'ACQUISITIONS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("username") DO UPDATE SET
  "email" = EXCLUDED."email",
  "passwordHash" = EXCLUDED."passwordHash",
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  "role" = EXCLUDED."role",
  "updatedAt" = CURRENT_TIMESTAMP;