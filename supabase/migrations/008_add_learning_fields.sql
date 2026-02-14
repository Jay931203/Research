-- 008_add_learning_fields.sql
-- Papers 테이블에 학습 메타데이터 컬럼 추가

ALTER TABLE papers ADD COLUMN IF NOT EXISTS difficulty_level TEXT;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE papers ADD COLUMN IF NOT EXISTS learning_objectives TEXT[];
ALTER TABLE papers ADD COLUMN IF NOT EXISTS self_check_questions TEXT[];

COMMENT ON COLUMN papers.difficulty_level IS '난이도 (beginner, intermediate, advanced)';
COMMENT ON COLUMN papers.prerequisites IS '선행 지식 목록';
COMMENT ON COLUMN papers.learning_objectives IS '학습 목표 목록';
COMMENT ON COLUMN papers.self_check_questions IS '셀프 체크 질문 목록';
