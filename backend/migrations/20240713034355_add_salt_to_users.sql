-- Add migration script here
ALTER TABLE user_info ADD COLUMN salt TEXT NOT NULL;