// User Note 관련 타입 정의

export type FamiliarityLevel =
  | 'not_started'  // 별 0개
  | 'difficult'    // 별 1개
  | 'moderate'     // 별 2개
  | 'familiar'     // 별 3개
  | 'expert';      // 레거시 값(내부적으로 별 3개로 취급)

export interface UserNote {
  id: string;
  paper_id: string;
  session_id: string;

  // 학습 상태
  familiarity_level: FamiliarityLevel;
  is_favorite: boolean;
  last_read_at?: string;

  // 메모
  note_content?: string;

  // 개인 평가
  importance_rating?: number; // 1-5
  personal_tags?: string[];

  // 타임스탬프
  created_at: string;
  updated_at: string;
}

// Supabase Upsert용 타입
export type NoteUpsert = Omit<UserNote, 'id' | 'created_at' | 'updated_at'> & {
  familiarity_level?: FamiliarityLevel;
  is_favorite?: boolean;
};

// 논문 + 노트 통합 타입
export interface PaperWithNote {
  // Paper 필드들 (모두 포함)
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  doi?: string;
  arxiv_id?: string;
  abstract?: string;
  key_contributions?: string[];
  algorithms?: string[];
  key_equations?: any[];
  architecture_detail?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  learning_objectives?: string[];
  self_check_questions?: string[];
  category: string;
  tags?: string[];
  pdf_url?: string;
  code_url?: string;
  color_hex: string;
  created_at: string;
  updated_at: string;

  // Note 필드들 (선택적)
  familiarity_level?: FamiliarityLevel;
  is_favorite?: boolean;
  note_content?: string;
  importance_rating?: number;
  personal_tags?: string[];
  last_read_at?: string;
  note_updated_at?: string;
}
