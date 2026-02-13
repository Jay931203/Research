export type RelationshipType =
  | 'extends'
  | 'builds_on'
  | 'compares_with'
  | 'inspired_by'
  | 'inspires'
  | 'challenges'
  | 'applies'
  | 'related';

export interface PaperRelationship {
  id: string;
  from_paper_id: string;
  to_paper_id: string;
  relationship_type: RelationshipType;
  description?: string;
  strength: number;
  created_at: string;
}

export type RelationshipInsert = Omit<PaperRelationship, 'id' | 'created_at'> & {
  strength?: number;
};

export type RelationshipUpdate = Partial<
  Omit<PaperRelationship, 'id' | 'created_at'>
>;

export interface RelationshipWithPapers extends PaperRelationship {
  from_title: string;
  from_year: number;
  from_category: string;
  from_color: string;
  to_title: string;
  to_year: number;
  to_category: string;
  to_color: string;
}

