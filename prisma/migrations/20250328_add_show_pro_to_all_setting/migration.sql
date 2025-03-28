-- Add showProToAll setting with default value of false
INSERT INTO "admin_settings" ("id", "key", "value", "description", "created_at", "updated_at")
VALUES (
    gen_random_uuid(), 
    'showProToAll', 
    'false', 
    'When enabled, all users (including unsubscribed users) will see the full content of PRO prompts',
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE 
SET "value" = EXCLUDED."value",
    "description" = EXCLUDED."description",
    "updated_at" = CURRENT_TIMESTAMP;
