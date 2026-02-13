// Paper 관련 타입 정의

export type PaperCategory =
  | 'csi_compression'
  | 'autoencoder'
  | 'quantization'
  | 'transformer'
  | 'cnn'
  | 'other';

export interface Equation {
  name: string;
  latex: string;
  description?: string;
}

export interface Paper {
  id: string;

  // 기본 정보
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  doi?: string;
  arxiv_id?: string;

  // 내용
  abstract?: string;
  key_contributions?: string[];
  algorithms?: string[];

  // 수식
  key_equations?: Equation[];

  // 분류
  category: PaperCategory;
  tags?: string[];

  // 메타데이터
  pdf_url?: string;
  code_url?: string;
  notes_summary?: string;

  // 시각화
  color_hex: string;
  icon_name?: string;

  // 타임스탬프
  created_at: string;
  updated_at: string;
}

// Supabase Insert용 타입 (id, timestamps 제외)
export type PaperInsert = Omit<Paper, 'id' | 'created_at' | 'updated_at'> & {
  color_hex?: string; // 선택적으로 변경
};

// Supabase Update용 타입 (모든 필드 선택적)
export type PaperUpdate = Partial<Omit<Paper, 'id' | 'created_at' | 'updated_at'>>;
