-- Create user_events table for analytics tracking
CREATE TABLE IF NOT EXISTS "user_events" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "event_type" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "error_message" TEXT,
    "conversion_source" TEXT,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_events_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "user_events_event_type_idx" ON "user_events"("event_type");
CREATE INDEX IF NOT EXISTS "user_events_user_id_idx" ON "user_events"("user_id");
CREATE INDEX IF NOT EXISTS "user_events_session_id_idx" ON "user_events"("session_id");
CREATE INDEX IF NOT EXISTS "user_events_timestamp_idx" ON "user_events"("timestamp");
CREATE INDEX IF NOT EXISTS "user_events_conversion_source_idx" ON "user_events"("conversion_source");

-- Add foreign key constraint to User table if user_id is provided
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;