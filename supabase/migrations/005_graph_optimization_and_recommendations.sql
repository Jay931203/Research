-- 005_graph_optimization_and_recommendations.sql
-- Graph traversal optimization + recommendation views

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'relationship_type'
      AND e.enumlabel = 'inspires'
  ) THEN
    ALTER TYPE relationship_type ADD VALUE 'inspires';
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_papers_lookup_title_year
  ON papers (lower(title), year);

CREATE INDEX IF NOT EXISTS idx_relationships_from_type_strength
  ON paper_relationships (from_paper_id, relationship_type, strength DESC);

CREATE INDEX IF NOT EXISTS idx_relationships_to_type_strength
  ON paper_relationships (to_paper_id, relationship_type, strength DESC);

CREATE INDEX IF NOT EXISTS idx_relationships_pair_strength
  ON paper_relationships (from_paper_id, to_paper_id, strength DESC);

CREATE OR REPLACE VIEW paper_graph_stats AS
SELECT
  p.id AS paper_id,
  p.title,
  p.year,
  p.category,
  COALESCE(outgoing.out_degree, 0) AS out_degree,
  COALESCE(incoming.in_degree, 0) AS in_degree,
  COALESCE(outgoing.out_degree, 0) + COALESCE(incoming.in_degree, 0) AS total_degree,
  COALESCE(strongest.max_strength, 0) AS strongest_link_strength
FROM papers p
LEFT JOIN (
  SELECT from_paper_id AS paper_id, COUNT(*) AS out_degree
  FROM paper_relationships
  GROUP BY from_paper_id
) outgoing ON outgoing.paper_id = p.id
LEFT JOIN (
  SELECT to_paper_id AS paper_id, COUNT(*) AS in_degree
  FROM paper_relationships
  GROUP BY to_paper_id
) incoming ON incoming.paper_id = p.id
LEFT JOIN (
  SELECT paper_id, MAX(strength) AS max_strength
  FROM (
    SELECT from_paper_id AS paper_id, strength FROM paper_relationships
    UNION ALL
    SELECT to_paper_id AS paper_id, strength FROM paper_relationships
  ) rel_strength
  GROUP BY paper_id
) strongest ON strongest.paper_id = p.id;

COMMENT ON VIEW paper_graph_stats IS
  'Per-paper connectivity stats for graph quality monitoring and UI summaries.';

CREATE OR REPLACE VIEW paper_memory_cards AS
SELECT
  p.id AS paper_id,
  p.title,
  p.year,
  p.category,
  COALESCE(
    NULLIF(p.key_contributions[1], ''),
    LEFT(COALESCE(p.abstract, ''), 280)
  ) AS one_liner,
  p.key_contributions[1:3] AS top_contributions,
  p.algorithms[1:3] AS top_algorithms,
  COALESCE(un.familiarity_level, 'not_started'::familiarity_level) AS familiarity_level,
  COALESCE(un.is_favorite, FALSE) AS is_favorite,
  COALESCE(un.importance_rating, 0) AS importance_rating,
  un.last_read_at
FROM papers p
LEFT JOIN user_notes un
  ON p.id = un.paper_id
 AND un.session_id = 'default_user';

COMMENT ON VIEW paper_memory_cards IS
  'Quick memory-card data for paper detail and review queue UIs.';

CREATE OR REPLACE VIEW paper_related_recommendations AS
WITH direct_edges AS (
  SELECT from_paper_id AS paper_id, to_paper_id AS neighbor_id, strength
  FROM paper_relationships
  UNION ALL
  SELECT to_paper_id AS paper_id, from_paper_id AS neighbor_id, strength
  FROM paper_relationships
),
two_hop_candidates AS (
  SELECT
    d1.paper_id,
    d2.neighbor_id AS candidate_id,
    COUNT(*) AS shared_paths,
    SUM(LEAST(d1.strength, d2.strength)) AS path_score
  FROM direct_edges d1
  JOIN direct_edges d2
    ON d1.neighbor_id = d2.paper_id
  WHERE d1.paper_id <> d2.neighbor_id
  GROUP BY d1.paper_id, d2.neighbor_id
),
filtered_candidates AS (
  SELECT c.*
  FROM two_hop_candidates c
  LEFT JOIN direct_edges d
    ON d.paper_id = c.paper_id
   AND d.neighbor_id = c.candidate_id
  WHERE d.neighbor_id IS NULL
)
SELECT
  c.paper_id,
  c.candidate_id AS related_paper_id,
  c.shared_paths,
  c.path_score,
  ROW_NUMBER() OVER (
    PARTITION BY c.paper_id
    ORDER BY c.path_score DESC, c.shared_paths DESC, p.year DESC
  ) AS recommendation_rank
FROM filtered_candidates c
JOIN papers p
  ON p.id = c.candidate_id;

COMMENT ON VIEW paper_related_recommendations IS
  'Two-hop related-paper candidates ranked by shared paths and path strength.';

