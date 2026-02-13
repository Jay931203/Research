-- 001_create_papers_table.sql
-- CSI AutoEncoder 연구 시각화 웹: Papers 테이블 생성

-- 카테고리 ENUM 타입
CREATE TYPE paper_category AS ENUM (
  'csi_compression',
  'autoencoder',
  'quantization',
  'transformer',
  'cnn',
  'other'
);

-- Papers 테이블
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  venue TEXT,                              -- 학회/저널명 (e.g., "CVPR 2023", "arXiv")
  doi TEXT,
  arxiv_id TEXT,

  -- 내용
  abstract TEXT,
  key_contributions TEXT[],                 -- 주요 기여도 리스트
  algorithms TEXT[],                        -- 알고리즘명 리스트

  -- 수식 (LaTeX 형식으로 저장)
  -- 형식: [{name: "Loss Function", latex: "\\mathcal{L} = ...", description: "..."}]
  key_equations JSONB,

  -- 분류
  category paper_category DEFAULT 'other',
  tags TEXT[],                              -- 자유 태그 (예: ["csi", "deep-learning", "5G"])

  -- 메타데이터
  pdf_url TEXT,
  code_url TEXT,
  notes_summary TEXT,                       -- 논문 자체의 요약 (관리자용)

  -- 시각화 관련
  color_hex TEXT DEFAULT '#6366f1',         -- 노드 색상 (기본값: indigo-500)
  icon_name TEXT,                           -- 아이콘 식별자 (선택적)

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_papers_year ON papers(year);
CREATE INDEX idx_papers_category ON papers(category);
CREATE INDEX idx_papers_title ON papers USING gin(to_tsvector('english', title));
CREATE INDEX idx_papers_tags ON papers USING gin(tags);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
CREATE TRIGGER update_papers_updated_at
  BEFORE UPDATE ON papers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE papers IS 'CSI AutoEncoder 관련 연구 논문 정보';
COMMENT ON COLUMN papers.key_equations IS 'JSONB 형식: [{name: string, latex: string, description?: string}]';
COMMENT ON COLUMN papers.color_hex IS '마인드맵 노드 색상 (HEX 형식)';
