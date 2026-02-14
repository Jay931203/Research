-- 006_add_architecture_detail.sql
-- Papers 테이블에 architecture_detail 컬럼 추가

ALTER TABLE papers ADD COLUMN IF NOT EXISTS architecture_detail TEXT;

COMMENT ON COLUMN papers.architecture_detail IS '아키텍처 상세 설명 (학습자 친화적 한국어)';
