-- 003_create_user_notes_table.sql
-- CSI AutoEncoder 연구 시각화 웹: User Notes 테이블 생성

-- 익숙함 레벨 ENUM
CREATE TYPE familiarity_level AS ENUM (
  'not_started',      -- 아직 읽지 않음
  'difficult',        -- 어려움
  'moderate',         -- 보통
  'familiar',         -- 익숙함
  'expert'            -- 전문가 수준
);

-- User Notes 테이블
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,

  -- 사용자 세션 식별 (로그인 없이 로컬 세션 ID 사용)
  session_id TEXT NOT NULL DEFAULT 'default_user',

  -- 학습 상태
  familiarity_level familiarity_level DEFAULT 'not_started',
  is_favorite BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMPTZ,

  -- 메모 내용
  note_content TEXT,                      -- 마크다운 형식

  -- 개인 평가
  importance_rating INTEGER CHECK (importance_rating >= 1 AND importance_rating <= 5),
  personal_tags TEXT[],                   -- 개인 태그 (예: ["내가-모르는-개념", "나중에-읽기"])

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 동일 논문에 대해 세션당 하나의 노트만
  UNIQUE(paper_id, session_id)
);

-- 인덱스 생성
CREATE INDEX idx_notes_paper ON user_notes(paper_id);
CREATE INDEX idx_notes_session ON user_notes(session_id);
CREATE INDEX idx_notes_familiarity ON user_notes(familiarity_level);
CREATE INDEX idx_notes_favorite ON user_notes(is_favorite) WHERE is_favorite = TRUE;

-- updated_at 트리거
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON user_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE user_notes IS '사용자의 논문 학습 상태 및 메모';
COMMENT ON COLUMN user_notes.session_id IS '로컬 세션 ID (로그인 없이 사용, 기본값: default_user)';
COMMENT ON COLUMN user_notes.note_content IS '마크다운 형식의 개인 메모';
COMMENT ON TYPE familiarity_level IS 'not_started: 미시작, difficult: 어려움, moderate: 보통, familiar: 익숙함, expert: 전문가';
