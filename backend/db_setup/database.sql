-- This is the SQL command to create the necessary 'users' table
-- in your 'MyNotesDB' database. Run this using psql if you haven't already.
-- This table structure matches what your application code expects.

CREATE TABLE users (
id SERIAL PRIMARY KEY,
google_id VARCHAR(255) UNIQUE NOT NULL,
display_name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);