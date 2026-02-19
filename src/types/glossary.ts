// 용어집(Glossary) 관련 타입 정의

export type GlossaryCategory =
  | 'architecture'
  | 'technique'
  | 'metric'
  | 'domain'
  | 'training';

export type GlossaryStudyAxis =
  | 'optimization'
  | 'quantization_module'
  | 'learning_flow';

export type GlossaryStudyClassification = Partial<
  Record<GlossaryStudyAxis, string[]>
>;

export type GlossaryTermSet = string;

export interface GlossaryTerm {
  id: string;
  name: string;
  aliases: string[];
  category: GlossaryCategory;
  term_set?: GlossaryTermSet;
  description: string;
  related_paper_titles: string[];
  hierarchy?: string[];
  study_classification?: GlossaryStudyClassification;
  details_markdown?: string;
}
