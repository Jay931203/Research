-- 004_create_views.sql
-- CSI AutoEncoder 연구 시각화 웹: 편의를 위한 뷰 생성

-- 1. Papers + Notes 통합 뷰
CREATE VIEW papers_with_notes AS
SELECT
  p.*,
  un.familiarity_level,
  un.is_favorite,
  un.note_content,
  un.importance_rating,
  un.personal_tags,
  un.last_read_at,
  un.updated_at as note_updated_at
FROM papers p
LEFT JOIN user_notes un ON p.id = un.paper_id AND un.session_id = 'default_user';

COMMENT ON VIEW papers_with_notes IS '논문 정보 + 사용자 노트 통합 뷰 (기본 세션)';

-- 2. Relationship Graph 뷰 (노드 정보 포함)
CREATE VIEW relationship_graph AS
SELECT
  pr.id,
  pr.from_paper_id,
  pr.to_paper_id,
  pr.relationship_type,
  pr.description,
  pr.strength,
  fp.title as from_title,
  fp.year as from_year,
  fp.category as from_category,
  fp.color_hex as from_color,
  tp.title as to_title,
  tp.year as to_year,
  tp.category as to_category,
  tp.color_hex as to_color
FROM paper_relationships pr
JOIN papers fp ON pr.from_paper_id = fp.id
JOIN papers tp ON pr.to_paper_id = tp.id;

COMMENT ON VIEW relationship_graph IS '논문 관계 + 양쪽 논문 정보 통합 뷰 (그래프 시각화용)';

-- 3. 통계 뷰 (선택적)
CREATE VIEW paper_statistics AS
SELECT
  category,
  COUNT(*) as paper_count,
  MIN(year) as earliest_year,
  MAX(year) as latest_year,
  AVG(year) as avg_year
FROM papers
GROUP BY category;

COMMENT ON VIEW paper_statistics IS '카테고리별 논문 통계';
