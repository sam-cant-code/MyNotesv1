-- This SQL command creates the 'tags' table.
-- It's linked to a user so users can have their own set of tags.
-- The UNIQUE constraint on (user_id, name) prevents a user
-- from having duplicate tags (e.g., two "work" tags).

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
        
    CONSTRAINT uq_user_tag_name
        UNIQUE (user_id, name)
);