-- Create access_codes table
CREATE TABLE access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ
);

-- Create poll_config table
CREATE TABLE poll_config (
    id INT PRIMARY KEY DEFAULT 1,
    is_open BOOLEAN DEFAULT true,
    closed_at TIMESTAMPTZ,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Create votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_index INT NOT NULL CHECK (question_index >= 0 AND question_index <= 40),
    answer TEXT NOT NULL,
    is_other BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create duo_votes table (specifically for question 37)
CREATE TABLE duo_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_1 TEXT NOT NULL,
    faculty_2 TEXT NOT NULL,
    is_other BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT prevent_same_person CHECK (faculty_1 <> faculty_2)
);

-- Create other_mappings table for moderation
CREATE TABLE other_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL CHECK (table_name IN ('votes', 'duo_votes')),
    vote_id UUID NOT NULL,
    original_text TEXT NOT NULL,
    mapped_to TEXT,
    dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE duo_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_mappings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if poll is open
CREATE OR REPLACE FUNCTION is_poll_open()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT COALESCE((SELECT is_open FROM poll_config WHERE id = 1), false);
$$;

-- RLS Policies for access_codes
CREATE POLICY "Allow public SELECT on access_codes" ON access_codes
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public UPDATE on access_codes" ON access_codes
    FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- RLS Policies for poll_config
CREATE POLICY "Allow public SELECT on poll_config" ON poll_config
    FOR SELECT TO anon USING (true);

-- RLS Policies for votes
CREATE POLICY "Allow public INSERT on votes when poll is open" ON votes
    FOR INSERT TO anon WITH CHECK (is_poll_open());

-- RLS Policies for duo_votes
CREATE POLICY "Allow public INSERT on duo_votes when poll is open" ON duo_votes
    FOR INSERT TO anon WITH CHECK (is_poll_open());

-- other_mappings has no public policies (admin only access via service role)

-- Create Indexes
CREATE INDEX idx_access_codes_code ON access_codes(code);
CREATE INDEX idx_votes_question_index ON votes(question_index);
CREATE INDEX idx_duo_votes_created_at ON duo_votes(created_at);
CREATE INDEX idx_other_mappings_table_vote ON other_mappings(table_name, vote_id);

-- Insert initial poll_config row
INSERT INTO poll_config (id, is_open) VALUES (1, true)
ON CONFLICT (id) DO NOTHING;
