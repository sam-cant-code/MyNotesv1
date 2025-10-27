-- This SQL command creates the 'note_tags' join table.
-- It connects a note from the 'notes' table to a tag from the 'tags' table.
-- Both note_id and tag_id are foreign keys.
-- The PRIMARY KEY (note_id, tag_id) ensures a note can only have a tag once.
-- ON DELETE CASCADE means if a note or a tag is deleted,
-- the link in this table is automatically removed.

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    
    CONSTRAINT fk_note
        FOREIGN KEY(note_id) 
        REFERENCES notes(id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_tag
        FOREIGN KEY(tag_id) 
        REFERENCES tags(id)
        ON DELETE CASCADE,
        
    PRIMARY KEY (note_id, tag_id)
);