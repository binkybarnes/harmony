CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email text NOT NULL,
    username TEXT NOT NULL UNIQUE,
    display_username TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    s3_icon_key TEXT,
    date_joined DATE NOT NULL DEFAULT NOW()
);

CREATE TYPE server_type AS ENUM ('dm', 'groupchat', 'server');

CREATE TABLE servers (
    server_id SERIAL PRIMARY KEY,
    server_type SERVER_TYPE NOT NULL,
    members INTEGER NOT NULL DEFAULT 0,
    server_name TEXT NOT NULL,
    admins INTEGER[] NOT NULL DEFAULT '{}',
    s3_icon_key TEXT
);


CREATE TABLE users_servers (
    user_id INTEGER NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    server_id INTEGER NOT NULL REFERENCES servers (server_id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, server_id),
    joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE channels (
    channel_id SERIAL PRIMARY KEY,
    server_id INTEGER NOT NULL REFERENCES servers (server_id) ON DELETE CASCADE,
    channel_name TEXT NOT NULL DEFAULT 'channel'::text
);


CREATE TABLE messages (
    message_id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (user_id),
    channel_id INTEGER NOT NULL REFERENCES channels (channel_id),
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    display_username TEXT NOT NULL,
    s3_icon_key TEXT
);
CREATE INDEX idx_user_id_hash ON messages USING hash (user_id);
