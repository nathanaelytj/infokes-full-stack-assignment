-- Create a table to store both folders and files
-- We use a single table with a 'type' column to differentiate between them.
-- This approach is flexible and efficient for hierarchical data.
CREATE TABLE items (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES items(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('folder', 'file')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger that calls the function before each update on the items table
CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Sample data for a hierarchical folder and file structure
-- I'm using placeholder UUIDs for clarity. In a real app, you would generate these.

-- Insert root folders (parent_id is NULL)
INSERT INTO items (id, name, parent_id, type) VALUES
('b0f4d3c1-e7a9-4b67-a0d3-3c9f2b1d5a67', 'Documents', NULL, 'folder'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Pictures', NULL, 'folder'),
('c1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6', 'Desktop', NULL, 'folder');

-- Insert subfolders and files into Documents
INSERT INTO items (id, name, parent_id, type) VALUES
('1a2b3c4d-5e6f-789a-bcde-f01234567890', 'Projects', 'b0f4d3c1-e7a9-4b67-a0d3-3c9f2b1d5a67', 'folder'),
('2b3c4d5e-6f7a-89ab-cdef-012345678901', 'Reports', 'b0f4d3c1-e7a9-4b67-a0d3-3c9f2b1d5a67', 'folder'),
('3c4d5e6f-7a8b-9abc-def0-123456789012', 'MyReport.pdf', 'b0f4d3c1-e7a9-4b67-a0d3-3c9f2b1d5a67', 'file');

-- Insert subfolders and files into Projects
INSERT INTO items (id, name, parent_id, type) VALUES
('4d5e6f7a-8b9c-abcd-ef01-234567890123', 'Project A', '1a2b3c4d-5e6f-789a-bcde-f01234567890', 'folder'),
('5e6f7a8b-9cde-f012-3456-789012345678', 'Project B', '1a2b3c4d-5e6f-789a-bcde-f01234567890', 'folder');

-- Insert subfolders and files into Pictures
INSERT INTO items (id, name, parent_id, type) VALUES
('6f7a8b9c-def0-1234-5678-901234567890', 'Vacation Photos', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'folder'),
('7a8b9cde-f012-3456-7890-123456789012', 'profile.png', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'file');

-- Insert files into Vacation Photos
INSERT INTO items (id, name, parent_id, type) VALUES
('8b9cdef0-1234-5678-9012-345678901234', 'beach.jpg', '6f7a8b9c-def0-1234-5678-901234567890', 'file'),
('9cdef012-3456-7890-1234-567890123456', 'mountain.png', '6f7a8b9c-def0-1234-5678-901234567890', 'file');