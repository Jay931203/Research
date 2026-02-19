'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlowProvider,
  type Node,
  type NodeMouseHandler,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type {
  PaperNodeData,
  PaperRelationship,
  PaperWithNote,
  RelationshipType,
} from '@/types';
import { RELATIONSHIP_STYLES, RESEARCH_TOPIC_ORDER, inferResearchTopic } from '@/lib/visualization/graphUtils';
import { useGraphData } from '@/hooks/useGraphData';
import type { GraphFilterSettings } from '@/store/useAppStore';
import { CORE_RELATIONSHIP_TYPES } from '@/store/useAppStore';
import CustomEdge from './CustomEdge';
import CustomNode from './CustomNode';
import GraphLegend from './GraphLegend';
import MindMapControls from './MindMapControls';

interface MindMapProps {
  papers: PaperWithNote[];
  relationships: PaperRelationship[];
  graphFilterSettings: GraphFilterSettings;
  onNodeClick?: (paperId: string) => void;
}

const nodeTypes = { paperNode: CustomNode };
const edgeTypes = { relationshipEdge: CustomEdge };
const ALL_RELATIONSHIP_TYPES = Object.keys(RELATIONSHIP_STYLES) as RelationshipType[];

function normalizeGraphFilterSettings(settings: GraphFilterSettings): GraphFilterSettings {
  const normalizedTypes = Array.from(
    new Set(
      settings.enabledRelationshipTypes.filter((type) =>
        ALL_RELATIONSHIP_TYPES.includes(type)
      )
    )
  );

  return {
    minStrength: Math.max(1, Math.min(10, Math.round(settings.minStrength))),
    enabledRelationshipTypes:
      normalizedTypes.length > 0 ? normalizedTypes : CORE_RELATIONSHIP_TYPES,
    useFamiliarityOpacity: !!settings.useFamiliarityOpacity,
  };
}

function MindMapInner({
  papers,
  relationships,
  graphFilterSettings,
  onNodeClick,
}: MindMapProps) {
  const { fitView } = useReactFlow();
  const [direction, setDirection] = useState<'TB' | 'LR'>('TB');
  const [zoomLevel, setZoomLevel] = useState(1);

  const normalizedGraphFilters = useMemo(
    () => normalizeGraphFilterSettings(graphFilterSettings),
    [graphFilterSettings]
  );

  const paperIdSet = useMemo(() => new Set(papers.map((paper) => paper.id)), [papers]);
  const sortedPapers = useMemo(
    () => [...papers].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)),
    [papers]
  );

  const filteredRelationships = useMemo(() => {
    return relationships.filter((relationship) => {
      if (!normalizedGraphFilters.enabledRelationshipTypes.includes(relationship.relationship_type)) {
        return false;
      }
      if (relationship.strength < normalizedGraphFilters.minStrength) {
        return false;
      }
      return (
        paperIdSet.has(relationship.from_paper_id) &&
        paperIdSet.has(relationship.to_paper_id)
      );
    });
  }, [relationships, normalizedGraphFilters, paperIdSet]);

  const graphData = useGraphData(sortedPapers, filteredRelationships, {
    direction,
    applyFamiliarityOpacity: normalizedGraphFilters.useFamiliarityOpacity,
  });

  const layeredNodes = useMemo(() => {
    const graphNodes = graphData.nodes;
    const nodeMap = new Map(graphNodes.map((node) => [node.id, node]));
    const sorted = [...sortedPapers].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.title.localeCompare(b.title);
    });

    const yearOrder = Array.from(new Set(sorted.map((paper) => paper.year)));
    const topicByPaperId = new Map(sorted.map((paper) => [paper.id, inferResearchTopic(paper)]));
    const topicOrder = RESEARCH_TOPIC_ORDER.filter((topic) =>
      sorted.some((paper) => topicByPaperId.get(paper.id) === topic)
    );

    if (!topicOrder.length) return graphNodes;

    const groupedByCell = new Map<string, PaperWithNote[]>();
    for (const year of yearOrder) {
      for (const topic of topicOrder) {
        groupedByCell.set(`${year}|${topic}`, []);
      }
    }
    for (const paper of sorted) {
      const topic = topicByPaperId.get(paper.id);
      if (!topic) continue;
      groupedByCell.get(`${paper.year}|${topic}`)?.push(paper);
    }

    const topicGap = 430;
    const maxCellCols = 2;
    const innerColGap = 140;
    const innerRowGap = 150;
    const yearSectionGap = 120;
    const centeredTopicOffset = (topicOrder.length - 1) / 2;
    const yearStartY = new Map<number, number>();
    let yCursor = 0;

    for (const year of yearOrder) {
      yearStartY.set(year, yCursor);
      let maxRowsInYear = 1;
      for (const topic of topicOrder) {
        const count = groupedByCell.get(`${year}|${topic}`)?.length ?? 0;
        const rowCount = Math.max(1, Math.ceil(count / maxCellCols));
        if (rowCount > maxRowsInYear) maxRowsInYear = rowCount;
      }
      yCursor += maxRowsInYear * innerRowGap + yearSectionGap;
    }

    const positioned: typeof graphNodes = [];
    for (const year of yearOrder) {
      const baseYearY = yearStartY.get(year) ?? 0;

      topicOrder.forEach((topic, topicIndex) => {
        const cell = groupedByCell.get(`${year}|${topic}`) ?? [];
        const baseTopicX = (topicIndex - centeredTopicOffset) * topicGap;

        cell.forEach((paper, index) => {
          const base = nodeMap.get(paper.id);
          if (!base) return;

          const localCol = index % maxCellCols;
          const localRow = Math.floor(index / maxCellCols);
          const columnOffset = (localCol - (maxCellCols - 1) / 2) * innerColGap;

          positioned.push({
            ...base,
            position: {
              x: baseTopicX + columnOffset,
              y: baseYearY + localRow * innerRowGap,
            },
          });
        });
      });
    }

    return positioned;
  }, [graphData.nodes, sortedPapers]);

  const labeledEdges = useMemo(() => {
    const showLabel = zoomLevel >= 0.78 && sortedPapers.length <= 45;
    return graphData.edges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        show_label: showLabel,
      },
    }));
  }, [graphData.edges, zoomLevel, sortedPapers.length]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layeredNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(labeledEdges);

  useEffect(() => {
    setNodes(layeredNodes);
  }, [layeredNodes, setNodes]);

  useEffect(() => {
    setEdges(labeledEdges);
  }, [labeledEdges, setEdges]);

  useEffect(() => {
    if (!layeredNodes.length) return;
    const raf = window.requestAnimationFrame(() => {
      fitView({ padding: 0.22, duration: 350 });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [layeredNodes, fitView]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node: Node<PaperNodeData>) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  const miniMapNodeColor = useCallback((node: Node<PaperNodeData>) => {
    return node.data?.paper?.color_hex ?? '#6b7280';
  }, []);

  if (!papers.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-gray-600 dark:text-gray-300">표시할 논문이 없습니다.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            왼쪽 필터를 조정하거나 데이터를 먼저 불러오세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onMoveEnd={(_, viewport) => setZoomLevel(viewport.zoom)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        panOnDrag
        panOnScroll={false}
        preventScrolling
        nodesDraggable={false}
        nodesConnectable={false}
        minZoom={0.15}
        maxZoom={2.8}
        proOptions={{ hideAttribution: true }}
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="!rounded-lg !border-gray-200 !bg-white !shadow-lg dark:!border-gray-700 dark:!bg-gray-800"
          pannable
          zoomable
        />
        <MindMapControls direction={direction} onDirectionChange={setDirection} />
        <GraphLegend />
      </ReactFlow>
    </div>
  );
}

export default function MindMap(props: MindMapProps) {
  return (
    <ReactFlowProvider>
      <MindMapInner {...props} />
    </ReactFlowProvider>
  );
}
