// Dagre 기반 그래프 레이아웃 알고리즘

import dagre from 'dagre';
import type { PaperNode, RelationshipEdge } from '@/types';

const NODE_WIDTH = 260;
const NODE_HEIGHT = 120;

interface LayoutOptions {
  direction?: 'TB' | 'LR'; // Top-Bottom or Left-Right
  nodeSpacing?: number;
  rankSpacing?: number;
}

/**
 * Dagre 알고리즘을 사용하여 노드 위치를 자동 배치
 */
export function applyDagreLayout(
  nodes: PaperNode[],
  edges: RelationshipEdge[],
  options: LayoutOptions = {}
): PaperNode[] {
  const { direction = 'TB', nodeSpacing = 60, rankSpacing = 100 } = options;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 40,
    marginy: 40,
  });

  // 노드 등록
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // 엣지 등록
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 레이아웃 계산
  dagre.layout(dagreGraph);

  // 계산된 위치를 노드에 적용
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });
}

/**
 * 타임라인 레이아웃: X축 = 발행 연도, Y축 = 카테고리 레인
 */
export function applyTimelineLayout(
  nodes: PaperNode[],
  edges: RelationshipEdge[],
): PaperNode[] {
  const years = Array.from(new Set(nodes.map(n => n.data.paper.year))).sort();
  const categories = Array.from(new Set(nodes.map(n => n.data.paper.category)));

  const YEAR_GAP = 350;
  const CATEGORY_GAP = 200;
  const NODE_STACK_GAP = 140;

  const yearIndex = new Map(years.map((y, i) => [y, i]));
  const categoryIndex = new Map(categories.map((c, i) => [c, i]));

  // Count papers per (year, category) for stacking
  const cellCount = new Map<string, number>();

  return nodes.map(node => {
    const year = node.data.paper.year;
    const cat = node.data.paper.category;
    const key = `${year}-${cat}`;
    const stackIdx = cellCount.get(key) ?? 0;
    cellCount.set(key, stackIdx + 1);

    return {
      ...node,
      position: {
        x: (yearIndex.get(year) ?? 0) * YEAR_GAP,
        y: (categoryIndex.get(cat) ?? 0) * CATEGORY_GAP + stackIdx * NODE_STACK_GAP,
      },
    };
  });
}

export { NODE_WIDTH, NODE_HEIGHT };
