-- Grant permissions to anon and authenticated roles for all tables

-- Grant permissions for User table
GRANT SELECT, INSERT, UPDATE, DELETE ON "User" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "User" TO authenticated;

-- Grant permissions for Lead table
GRANT SELECT, INSERT, UPDATE, DELETE ON "Lead" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Lead" TO authenticated;

-- Grant permissions for Buyer table
GRANT SELECT, INSERT, UPDATE, DELETE ON "Buyer" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Buyer" TO authenticated;

-- Grant permissions for Task table
GRANT SELECT, INSERT, UPDATE, DELETE ON "Task" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Task" TO authenticated;

-- Grant permissions for Property table
GRANT SELECT, INSERT, UPDATE, DELETE ON "Property" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Property" TO authenticated;

-- Grant permissions for Offer table
GRANT SELECT, INSERT, UPDATE, DELETE ON "Offer" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Offer" TO authenticated;