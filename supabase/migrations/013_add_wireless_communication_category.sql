-- Add wireless_communication category for classic wireless comm theory papers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'paper_category'
      AND e.enumlabel = 'wireless_communication'
  ) THEN
    ALTER TYPE paper_category ADD VALUE 'wireless_communication';
  END IF;
END $$;
