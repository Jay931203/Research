import type { Edge, Node } from 'reactflow';
import type { FamiliarityLevel } from './note';
import type { Paper } from './paper';
import type { RelationshipType } from './relationship';

export interface PaperNodeData {
  paper: Paper;
  familiarity_level?: FamiliarityLevel;
  apply_familiarity_opacity?: boolean;
  is_favorite?: boolean;
  note_content?: string;
  on_remove_paper?: (paperId: string) => void;
}

export interface RelationshipEdgeData {
  relationship_type: RelationshipType;
  description?: string;
  strength: number;
  show_label?: boolean;
}

export type PaperNode = Node<PaperNodeData>;
export type RelationshipEdge = Edge<RelationshipEdgeData>;

export interface GraphData {
  nodes: PaperNode[];
  edges: RelationshipEdge[];
}
