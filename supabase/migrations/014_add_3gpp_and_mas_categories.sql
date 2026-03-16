-- Add 3gpp_spec and mas categories for PHY standardization and Multi-Agent Systems papers

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'paper_category'
      AND e.enumlabel = '3gpp_spec'
  ) THEN
    ALTER TYPE paper_category ADD VALUE '3gpp_spec';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'paper_category'
      AND e.enumlabel = 'mas'
  ) THEN
    ALTER TYPE paper_category ADD VALUE 'mas';
  END IF;
END $$;
