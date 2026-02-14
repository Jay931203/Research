import { useMemo } from 'react';
import { MarkerType } from 'reactflow';
import type {
  GraphData,
  PaperNode,
  PaperRelationship,
  PaperWithNote,
  RelationshipEdge,
} from '@/types';
import { applyDagreLayout } from '@/lib/visualization/graphLayout';
import { getEdgeStrokeWidth, RELATIONSHIP_STYLES } from '@/lib/visualization/graphUtils';

interface UseGraphDataOptions {
  direction?: 'TB' | 'LR';
}

function getFlowSourceTarget(relationship: PaperRelationship): {
  source: string;
  target: string;
} {
  // Most relationships in this dataset are "new paper -> reference paper".
  // For timeline readability we render the edge in reverse so old -> new.
  // "inspires" is authored as "source inspires target", so keep that direction.
  if (relationship.relationship_type === 'inspires') {
    return {
      source: relationship.from_paper_id,
      target: relationship.to_paper_id,
    };
  }

  return {
    source: relationship.to_paper_id,
    target: relationship.from_paper_id,
  };
}

function toPaperNodes(papers: PaperWithNote[]): PaperNode[] {
  return papers.map((paper) => ({
    id: paper.id,
    type: 'paperNode',
    position: { x: 0, y: 0 },
    data: {
      paper: {
        ...paper,
        category: paper.category as
          | 'csi_compression'
          | 'autoencoder'
          | 'quantization'
          | 'transformer'
          | 'cnn'
          | 'other',
      },
      familiarity_level: paper.familiarity_level,
      is_favorite: paper.is_favorite,
      note_content: paper.note_content,
    },
  }));
}

function toRelationshipEdges(
  relationships: PaperRelationship[]
): RelationshipEdge[] {
  return relationships.map((relationship) => {
    const style = RELATIONSHIP_STYLES[relationship.relationship_type];
    const { source, target } = getFlowSourceTarget(relationship);

    return {
      id: relationship.id,
      source,
      target,
      type: 'relationshipEdge',
      data: {
        relationship_type: relationship.relationship_type,
        description: relationship.description,
        strength: relationship.strength,
      },
      style: {
        stroke: style.color,
        strokeWidth: getEdgeStrokeWidth(relationship.strength),
        strokeDasharray: style.strokeDasharray,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: style.color,
        width: 20,
        height: 20,
      },
      label: style.label,
      labelStyle: {
        fill: style.color,
        fontSize: 11,
        fontWeight: 600,
      },
      labelBgStyle: {
        fill: 'white',
        fillOpacity: 0.86,
      },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
    };
  });
}

export function useGraphData(
  papers: PaperWithNote[],
  relationships: PaperRelationship[],
  options: UseGraphDataOptions = {}
): GraphData {
  const { direction = 'TB' } = options;

  return useMemo(() => {
    if (!papers.length) {
      return { nodes: [], edges: [] };
    }

    const nodes = toPaperNodes(papers);
    const edges = toRelationshipEdges(relationships);
    const positionedNodes = applyDagreLayout(nodes, edges, { direction });

    return {
      nodes: positionedNodes,
      edges,
    };
  }, [papers, relationships, direction]);
}

