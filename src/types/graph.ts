// React Flow 그래프 관련 타입 정의

import { Node, Edge } from 'reactflow';
import { Paper } from './paper';
import { PaperRelationship, RelationshipType } from './relationship';
import { FamiliarityLevel } from './note';

// 커스텀 노드 데이터
export interface PaperNodeData {
  paper: Paper;
  familiarity_level?: FamiliarityLevel;
  apply_familiarity_opacity?: boolean;
  is_favorite?: boolean;
  note_content?: string;
}

// 커스텀 엣지 데이터
export interface RelationshipEdgeData {
  relationship_type: RelationshipType;
  description?: string;
  strength: number;
  show_label?: boolean;
}

// React Flow 노드 타입
export type PaperNode = Node<PaperNodeData>;

// React Flow 엣지 타입
export type RelationshipEdge = Edge<RelationshipEdgeData>;

// 그래프 데이터 전체
export interface GraphData {
  nodes: PaperNode[];
  edges: RelationshipEdge[];
}
