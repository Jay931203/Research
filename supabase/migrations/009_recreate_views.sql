-- 009_recreate_views.sql
-- papers 테이블에 학습 메타데이터 컬럼 추가 후 뷰 재생성

DROP VIEW IF EXISTS papers_with_notes;

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
