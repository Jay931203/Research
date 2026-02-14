// 용어집(Glossary) 관련 타입 정의

export interface GlossaryTerm {
  id: string;
  name: string;
  aliases: string[];
  category: 'architecture' | 'technique' | 'metric' | 'domain' | 'training';
  description: string;
  related_paper_titles: string[];
}
