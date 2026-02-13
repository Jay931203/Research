-- 002_create_relationships_table.sql
-- CSI AutoEncoder 연구 시각화 웹: Paper Relationships 테이블 생성

-- 관계 타입 ENUM
CREATE TYPE relationship_type AS ENUM (
  'extends',          -- 확장/개선
  'builds_on',        -- 기반으로 함
  'compares_with',    -- 비교 대상
  'inspired_by',      -- 영감을 받음
  'challenges',       -- 도전/반박
  'applies',          -- 적용
  'related'           -- 관련
);

-- Paper Relationships 테이블
CREATE TABLE paper_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  from_paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  to_paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,

  relationship_type relationship_type NOT NULL,

  -- 관계 설명
  description TEXT,                       -- 관계에 대한 설명 (예: "TransNet은 CSINet의 CNN을 Transformer로 교체")
  strength INTEGER DEFAULT 5 CHECK (strength >= 1 AND strength <= 10), -- 관계 강도 (1=약함, 10=강함)

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 방지 (동일한 두 논문 간 같은 타입의 관계는 하나만)
  UNIQUE(from_paper_id, to_paper_id, relationship_type)
);

-- 인덱스 생성
CREATE INDEX idx_relationships_from ON paper_relationships(from_paper_id);
CREATE INDEX idx_relationships_to ON paper_relationships(to_paper_id);
CREATE INDEX idx_relationships_type ON paper_relationships(relationship_type);

-- 자기 참조 방지 제약
ALTER TABLE paper_relationships
  ADD CONSTRAINT no_self_reference CHECK (from_paper_id != to_paper_id);

-- 코멘트 추가
COMMENT ON TABLE paper_relationships IS '논문 간 관계 (영향, 확장, 비교 등)';
COMMENT ON COLUMN paper_relationships.strength IS '관계 강도 (1-10), 그래프 엣지 두께에 반영';
COMMENT ON TYPE relationship_type IS 'extends: 확장, builds_on: 기반, compares_with: 비교, inspired_by: 영감, challenges: 도전, applies: 적용, related: 관련';
