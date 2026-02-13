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
} from 'reactflow';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import 'reactflow/dist/style.css';

import type {
  PaperNodeData,
  PaperRelationship,
  PaperWithNote,
  RelationshipType,
} from '@/types';
import { RELATIONSHIP_STYLES } from '@/lib/visualization/graphUtils';
import { useGraphData } from '@/hooks/useGraphData';
import {
  buildBridgeRecommendations,
  buildPaperConnections,
  buildPaperCoreSnapshot,
} from '@/lib/papers/insights';
import CustomEdge from './CustomEdge';
import CustomNode from './CustomNode';
import GraphLegend from './GraphLegend';
import MindMapControls from './MindMapControls';

interface MindMapProps {
  papers: PaperWithNote[];
  relationships: PaperRelationship[];
  onNodeClick?: (paperId: string) => void;
}

type GraphViewMode = 'overview' | 'focus' | 'timeline';
type LayerMode = 'year' | 'category';

const CORE_REL_TYPES: RelationshipType[] = ['extends', 'builds_on', 'inspired_by'];
const ALL_REL_TYPES = Object.keys(RELATIONSHIP_STYLES) as RelationshipType[];

const nodeTypes = { paperNode: CustomNode };
const edgeTypes = { relationshipEdge: CustomEdge };

function bfsNodeSet(
  rootId: string,
  relationships: PaperRelationship[],
  depth: number
): Set<string> {
  const adjacency = new Map<string, Set<string>>();

  for (const relationship of relationships) {
    if (!adjacency.has(relationship.from_paper_id)) {
      adjacency.set(relationship.from_paper_id, new Set());
    }
    if (!adjacency.has(relationship.to_paper_id)) {
      adjacency.set(relationship.to_paper_id, new Set());
    }

    adjacency.get(relationship.from_paper_id)?.add(relationship.to_paper_id);
    adjacency.get(relationship.to_paper_id)?.add(relationship.from_paper_id);
  }

  const visited = new Set<string>([rootId]);
  let frontier = new Set<string>([rootId]);

  for (let level = 0; level < depth; level += 1) {
    const next = new Set<string>();

    for (const nodeId of Array.from(frontier)) {
      const neighbors = adjacency.get(nodeId);
      if (!neighbors) continue;

      for (const neighborId of Array.from(neighbors)) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);
        next.add(neighborId);
      }
    }

    frontier = next;
    if (!frontier.size) break;
  }

  return visited;
}

function matchesSearch(paper: PaperWithNote, rawQuery: string): boolean {
  if (!rawQuery.trim()) return true;

  const query = rawQuery.toLowerCase().trim();
  return (
    paper.title.toLowerCase().includes(query) ||
    paper.authors.some((author) => author.toLowerCase().includes(query)) ||
    (paper.tags ?? []).some((tag) => tag.toLowerCase().includes(query))
  );
}

function MindMapInner({ papers, relationships, onNodeClick }: MindMapProps) {
  const [viewMode, setViewMode] = useState<GraphViewMode>('focus');
  const [direction, setDirection] = useState<'TB' | 'LR'>('TB');
  const [layerMode, setLayerMode] = useState<LayerMode>('year');
  const [focusDepth, setFocusDepth] = useState<1 | 2>(1);
  const [focusPaperId, setFocusPaperId] = useState<string | null>(null);
  const [enabledRelationshipTypes, setEnabledRelationshipTypes] =
    useState<RelationshipType[]>(CORE_REL_TYPES);
  const [minStrength, setMinStrength] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [searchText, setSearchText] = useState('');

  const sortedPapers = useMemo(
    () => [...papers].sort((a, b) => b.year - a.year),
    [papers]
  );

  useEffect(() => {
    if (!papers.length) return;

    const exists = focusPaperId && papers.some((paper) => paper.id === focusPaperId);
    if (exists) return;

    setFocusPaperId(sortedPapers[0]?.id ?? null);
  }, [papers, sortedPapers, focusPaperId]);

  const filteredRelationships = useMemo(() => {
    return relationships.filter((relationship) => {
      if (!enabledRelationshipTypes.includes(relationship.relationship_type)) {
        return false;
      }
      return relationship.strength >= minStrength;
    });
  }, [relationships, enabledRelationshipTypes, minStrength]);

  const { searchedPapers, searchedRelationships } = useMemo(() => {
    if (!searchText.trim()) {
      return {
        searchedPapers: papers,
        searchedRelationships: filteredRelationships,
      };
    }

    const matchedPaperIds = new Set(
      papers.filter((paper) => matchesSearch(paper, searchText)).map((paper) => paper.id)
    );

    const relatedRelationships = filteredRelationships.filter((relationship) => {
      return (
        matchedPaperIds.has(relationship.from_paper_id) ||
        matchedPaperIds.has(relationship.to_paper_id)
      );
    });

    const visiblePaperIds = new Set<string>(matchedPaperIds);
    for (const relationship of relatedRelationships) {
      visiblePaperIds.add(relationship.from_paper_id);
      visiblePaperIds.add(relationship.to_paper_id);
    }

    return {
      searchedPapers: papers.filter((paper) => visiblePaperIds.has(paper.id)),
      searchedRelationships: relatedRelationships,
    };
  }, [papers, filteredRelationships, searchText]);

  const { displayPapers, displayRelationships } = useMemo(() => {
    if (viewMode !== 'focus' || !focusPaperId) {
      return {
        displayPapers: searchedPapers,
        displayRelationships: searchedRelationships,
      };
    }

    const focusedNodeSet = bfsNodeSet(focusPaperId, searchedRelationships, focusDepth);
    return {
      displayPapers: searchedPapers.filter((paper) => focusedNodeSet.has(paper.id)),
      displayRelationships: searchedRelationships.filter((relationship) => {
        return (
          focusedNodeSet.has(relationship.from_paper_id) &&
          focusedNodeSet.has(relationship.to_paper_id)
        );
      }),
    };
  }, [viewMode, focusPaperId, focusDepth, searchedPapers, searchedRelationships]);

  const activeDirection = viewMode === 'timeline' ? 'TB' : direction;

  const graphData = useGraphData(displayPapers, displayRelationships, {
    direction: activeDirection,
  });

  const layeredNodes = useMemo(() => {
    const yearOrder = Array.from(new Set(displayPapers.map((paper) => paper.year))).sort(
      (a, b) => a - b
    );
    const yearRank = new Map(yearOrder.map((year, index) => [year, index]));

    const categoryOrder = [
      'csi_compression',
      'autoencoder',
      'quantization',
      'transformer',
      'cnn',
      'other',
    ];
    const categoryRank = new Map(categoryOrder.map((category, index) => [category, index]));
    const paperMap = new Map(displayPapers.map((paper) => [paper.id, paper]));

    return graphData.nodes.map((node) => {
      const paper = paperMap.get(node.id);
      if (!paper) return node;

      if (layerMode === 'year') {
        const rank = yearRank.get(paper.year) ?? 0;
        return {
          ...node,
          position: {
            x: node.position.x,
            y: rank * 240 + (node.position.y % 120),
          },
        };
      }

      const rank = categoryRank.get(paper.category) ?? categoryOrder.length;
      return {
        ...node,
        position: {
          x: rank * 340 + (node.position.x % 140),
          y: node.position.y,
        },
      };
    });
  }, [displayPapers, graphData.nodes, layerMode]);

  const labeledEdges = useMemo(() => {
    const showLabel = zoomLevel >= 0.75 && displayPapers.length <= 50;
    return graphData.edges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        show_label: showLabel,
      },
    }));
  }, [graphData.edges, zoomLevel, displayPapers.length]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layeredNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(labeledEdges);

  useEffect(() => {
    setNodes(layeredNodes);
  }, [layeredNodes, setNodes]);

  useEffect(() => {
    setEdges(labeledEdges);
  }, [labeledEdges, setEdges]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node: Node<PaperNodeData>) => {
      setFocusPaperId(node.id);
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  const miniMapNodeColor = useCallback((node: Node<PaperNodeData>) => {
    return node.data?.paper?.color_hex ?? '#6b7280';
  }, []);

  const toggleRelationshipType = useCallback((type: RelationshipType) => {
    setEnabledRelationshipTypes((previous) =>
      previous.includes(type)
        ? previous.filter((value) => value !== type)
        : [...previous, type]
    );
  }, []);

  const setCoreEdges = useCallback(() => {
    setEnabledRelationshipTypes(CORE_REL_TYPES);
  }, []);

  const setAllEdges = useCallback(() => {
    setEnabledRelationshipTypes(ALL_REL_TYPES);
  }, []);

  const focusPaper = useMemo(() => {
    if (!focusPaperId) return null;
    return papers.find((paper) => paper.id === focusPaperId) ?? null;
  }, [focusPaperId, papers]);

  const focusConnections = useMemo(() => {
    if (!focusPaperId) return [];
    return buildPaperConnections(focusPaperId, papers, displayRelationships);
  }, [focusPaperId, papers, displayRelationships]);

  const focusBridgeRecommendations = useMemo(() => {
    if (!focusPaperId) return [];
    return buildBridgeRecommendations(focusPaperId, papers, filteredRelationships, 4);
  }, [focusPaperId, papers, filteredRelationships]);

  const focusSnapshot = useMemo(() => {
    if (!focusPaper) return null;
    return buildPaperCoreSnapshot(focusPaper);
  }, [focusPaper]);

  const recentCount = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return papers.filter((paper) => paper.year >= currentYear - 2).length;
  }, [papers]);

  const quantRatio = useMemo(() => {
    if (!papers.length) return 0;
    const quantizationCount = papers.filter((paper) => paper.category === 'quantization').length;
    return Math.round((quantizationCount / papers.length) * 100);
  }, [papers]);

  if (!papers.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-gray-600 dark:text-gray-300">표시할 논문이 없습니다.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Import 페이지에서 데이터를 먼저 로드하세요.
          </p>
        </div>
      </div>
    );
  }

  const tabClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-xs font-semibold transition ${
      active
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
    }`;

  return (
    <div className="relative h-full w-full">
      {isPanelOpen ? (
        <div className="absolute left-3 top-3 z-20 max-h-[56vh] w-[760px] max-w-[calc(100%-420px)] overflow-auto rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900/95">
          <div className="mb-3 flex items-center gap-2">
            <button className={tabClass(viewMode === 'overview')} onClick={() => setViewMode('overview')}>
              Overview
            </button>
            <button className={tabClass(viewMode === 'focus')} onClick={() => setViewMode('focus')}>
              Focus
            </button>
            <button className={tabClass(viewMode === 'timeline')} onClick={() => setViewMode('timeline')}>
              Timeline
            </button>

            <div className="ml-2 flex items-center gap-2">
              <button className={tabClass(layerMode === 'year')} onClick={() => setLayerMode('year')}>
                Year Lanes
              </button>
              <button className={tabClass(layerMode === 'category')} onClick={() => setLayerMode('category')}>
                Category Lanes
              </button>
            </div>

            <button
              onClick={() => setIsPanelOpen(false)}
              className="ml-auto rounded-md border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              title="패널 닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 grid grid-cols-4 gap-2 text-[11px]">
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">총 논문 {papers.length}</div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">최근 3년 {recentCount}</div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">양자화 비중 {quantRatio}%</div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">
              노드/엣지 {displayPapers.length}/{displayRelationships.length}
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <label className="col-span-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              논문 검색
            </label>
            <div className="col-span-2 relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="제목, 저자, 태그로 검색"
                className="input-base !py-2 !pl-8 !text-xs"
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Filter className="h-3.5 w-3.5" />
                최소 관계 강도
              </span>
              <span>{minStrength}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={minStrength}
              onChange={(event) => setMinStrength(Number(event.target.value))}
              className="w-full"
            />
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button className={tabClass(enabledRelationshipTypes.length <= CORE_REL_TYPES.length)} onClick={setCoreEdges}>
              Core Edges
            </button>
            <button className={tabClass(enabledRelationshipTypes.length === ALL_REL_TYPES.length)} onClick={setAllEdges}>
              All Edges
            </button>
            {ALL_REL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleRelationshipType(type)}
                className={`rounded border px-2 py-1 text-[11px] ${
                  enabledRelationshipTypes.includes(type)
                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-gray-300 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400'
                }`}
              >
                {RELATIONSHIP_STYLES[type].label}
              </button>
            ))}
          </div>

          {viewMode === 'focus' && (
            <div className="grid grid-cols-2 gap-2">
              <select
                value={focusPaperId ?? ''}
                onChange={(event) => setFocusPaperId(event.target.value || null)}
                className="input-base !py-2 !text-xs"
              >
                {sortedPapers.map((paper) => (
                  <option key={paper.id} value={paper.id}>
                    {paper.year} - {paper.title}
                  </option>
                ))}
              </select>
              <select
                value={focusDepth}
                onChange={(event) => {
                  setFocusDepth((Number(event.target.value) === 2 ? 2 : 1) as 1 | 2);
                }}
                className="input-base !py-2 !text-xs"
              >
                <option value={1}>Depth 1-hop</option>
                <option value={2}>Depth 2-hop</option>
              </select>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs font-semibold text-gray-700 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <SlidersHorizontal className="h-4 w-4" />
          패널 열기
        </button>
      )}

      {focusPaper && focusSnapshot && (
        <div className="absolute right-3 top-3 z-20 max-h-[74vh] w-[360px] overflow-auto rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900/95">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-blue-600">{focusPaper.year}</p>
              <h3 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                {focusPaper.title}
              </h3>
            </div>
            <button
              onClick={() => onNodeClick?.(focusPaper.id)}
              className="rounded-md border border-gray-300 px-2 py-1 text-[11px] font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              상세 보기
            </button>
          </div>

          <p className="mb-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            {focusSnapshot.oneLiner}
          </p>

          {!!focusSnapshot.methods.length && (
            <div className="mb-2 flex flex-wrap gap-1">
              {focusSnapshot.methods.map((method) => (
                <span
                  key={method}
                  className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                >
                  {method}
                </span>
              ))}
            </div>
          )}

          <div className="mb-3">
            <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              직접 연결 논문
            </p>
            <div className="space-y-1.5">
              {focusConnections.slice(0, 6).map((connection) => (
                <button
                  key={connection.relationship.id}
                  onClick={() => setFocusPaperId(connection.otherPaper.id)}
                  className="flex w-full items-center justify-between rounded-md border border-gray-200 px-2 py-1.5 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <span className="line-clamp-1 pr-2 text-[11px] text-gray-700 dark:text-gray-200">
                    {connection.otherPaper.title}
                  </span>
                  <span className="whitespace-nowrap text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    {RELATIONSHIP_STYLES[connection.relationship.relationship_type].label}{' '}
                    {connection.relationship.strength}/10
                  </span>
                </button>
              ))}
              {!focusConnections.length && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400">직접 연결된 논문이 없습니다.</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              2-hop 추천 논문
            </p>
            <div className="space-y-1.5">
              {focusBridgeRecommendations.map((recommendation) => (
                <button
                  key={recommendation.paper.id}
                  onClick={() => setFocusPaperId(recommendation.paper.id)}
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <p className="line-clamp-1 text-[11px] font-medium text-gray-800 dark:text-gray-200">
                    {recommendation.paper.title}
                  </p>
                  <p className="line-clamp-1 text-[10px] text-gray-500 dark:text-gray-400">
                    점수 {recommendation.score} · {recommendation.reasons.join(' / ')}
                  </p>
                </button>
              ))}
              {!focusBridgeRecommendations.length && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  추천 가능한 2-hop 논문이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.25, duration: 500 }}
        minZoom={0.2}
        maxZoom={2}
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
