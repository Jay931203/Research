-- Add delta_claim field to paper_relationships
-- Stores the single most important difference/change between two connected papers
ALTER TABLE paper_relationships
ADD COLUMN IF NOT EXISTS delta_claim TEXT;

COMMENT ON COLUMN paper_relationships.delta_claim IS 'The single key difference/advancement between the two connected papers';
