DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'paper_category'
      AND e.enumlabel = 'representation_learning'
  ) THEN
    ALTER TYPE paper_category ADD VALUE 'representation_learning';
  END IF;
END $$;
