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
import {
  ArrowRightLeft,
  Filter,
  ListTree,
  Network,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
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

type SurfaceMode = 'list' | 'graph';
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
  const [surfaceMode, setSurfaceMode] = useState<SurfaceMode>('list');
  const [viewMode, setViewMode] = useState<GraphViewMode>('focus');
  const [direction, setDirection] = useState<'TB' | 'LR'>('TB');
  const [layerMode, setLayerMode] = useState<LayerMode>('year');
  const [focusDepth, setFocusDepth] = useState<1 | 2>(1);
  const [focusPaperId, setFocusPaperId] = useState<string | null>(null);
  const [enabledRelationshipTypes, setEnabledRelationshipTypes] =
    useState<RelationshipType[]>(CORE_REL_TYPES);
  const [minStrength, setMinStrength] = useState(4);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [searchText, setSearchText] = useState('');

  const sortedPapers = useMemo(() => {
    return [...papers].sort((a, b) => b.year - a.year);
  }, [papers]);

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

    const matchedIds = new Set(
      papers.filter((paper) => matchesSearch(paper, searchText)).map((paper) => paper.id)
    );

    const relatedEdges = filteredRelationships.filter((relationship) => {
      return (
        matchedIds.has(relationship.from_paper_id) || matchedIds.has(relationship.to_paper_id)
      );
    });

    const visibleIds = new Set<string>(matchedIds);
    for (const relationship of relatedEdges) {
      visibleIds.add(relationship.from_paper_id);
      visibleIds.add(relationship.to_paper_id);
    }

    return {
      searchedPapers: papers.filter((paper) => visibleIds.has(paper.id)),
      searchedRelationships: relatedEdges,
    };
  }, [papers, filteredRelationships, searchText]);

  const { displayPapers, displayRelationships } = useMemo(() => {
    if (viewMode !== 'focus' || !focusPaperId) {
      return {
        displayPapers: searchedPapers,
        displayRelationships: searchedRelationships,
      };
    }

    const focusedSet = bfsNodeSet(focusPaperId, searchedRelationships, focusDepth);
    return {
      displayPapers: searchedPapers.filter((paper) => focusedSet.has(paper.id)),
      displayRelationships: searchedRelationships.filter((relationship) => {
        return (
          focusedSet.has(relationship.from_paper_id) && focusedSet.has(relationship.to_paper_id)
        );
      }),
    };
  }, [viewMode, focusPaperId, focusDepth, searchedPapers, searchedRelationships]);

  const focusPaper = useMemo(() => {
    if (!focusPaperId) return null;
    return papers.find((paper) => paper.id === focusPaperId) ?? null;
  }, [focusPaperId, papers]);

  const focusSnapshot = useMemo(() => {
    if (!focusPaper) return null;
    return buildPaperCoreSnapshot(focusPaper);
  }, [focusPaper]);

  const focusConnections = useMemo(() => {
    if (!focusPaperId) return [];
    return buildPaperConnections(focusPaperId, papers, displayRelationships);
  }, [focusPaperId, papers, displayRelationships]);

  const focusRecommendations = useMemo(() => {
    if (!focusPaperId) return [];
    return buildBridgeRecommendations(focusPaperId, papers, filteredRelationships, 5);
  }, [focusPaperId, papers, filteredRelationships]);

  const strongestRelationships = useMemo(() => {
    return [...displayRelationships]
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 20)
      .map((relationship) => {
        const from = papers.find((paper) => paper.id === relationship.from_paper_id);
        const to = papers.find((paper) => paper.id === relationship.to_paper_id);
        return { relationship, from, to };
      })
      .filter((item) => item.from && item.to);
  }, [displayRelationships, papers]);

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
    const showLabel = zoomLevel >= 0.78 && displayPapers.length <= 45;
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

  const tabClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-xs font-semibold transition ${
      active
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
    }`;

  if (!papers.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-gray-600 dark:text-gray-300">표시할 논문이 없습니다.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Import 페이지에서 데이터를 먼저 불러오세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isPanelOpen ? (
        <div className="absolute left-3 top-3 z-20 w-[calc(100%-24px)] max-h-[56vh] overflow-auto rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg md:w-[760px] md:max-w-[calc(100%-420px)] dark:border-gray-700 dark:bg-gray-900/95">
          <div className="mb-3 flex items-center gap-2">
            <button className={tabClass(surfaceMode === 'list')} onClick={() => setSurfaceMode('list')}>
              <span className="inline-flex items-center gap-1">
                <ListTree className="h-3.5 w-3.5" />
                관계 리스트
              </span>
            </button>
            <button className={tabClass(surfaceMode === 'graph')} onClick={() => setSurfaceMode('graph')}>
              <span className="inline-flex items-center gap-1">
                <Network className="h-3.5 w-3.5" />
                그래프
              </span>
            </button>

            <button
              onClick={() => setIsPanelOpen(false)}
              className="ml-auto rounded-md border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              title="패널 닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4 text-[11px]">
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">전체 논문 {papers.length}</div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">표시 논문 {displayPapers.length}</div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">표시 관계 {displayRelationships.length}</div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">최소 강도 {minStrength}</div>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              논문 검색
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="제목, 저자, 태그"
                className="input-base !py-2 !pl-8 !text-xs"
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Filter className="h-3.5 w-3.5" />
                관계 강도 필터
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
            <button className={tabClass(enabledRelationshipTypes.length <= CORE_REL_TYPES.length)} onClick={() => setEnabledRelationshipTypes(CORE_REL_TYPES)}>
              핵심 관계만
            </button>
            <button className={tabClass(enabledRelationshipTypes.length === ALL_REL_TYPES.length)} onClick={() => setEnabledRelationshipTypes(ALL_REL_TYPES)}>
              전체 관계
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

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
            <div className="flex items-center gap-2">
              <select
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value as GraphViewMode)}
                className="input-base !py-2 !text-xs"
              >
                <option value="focus">포커스</option>
                <option value="overview">전체</option>
                <option value="timeline">타임라인</option>
              </select>
              <select
                value={focusDepth}
                onChange={(event) => {
                  setFocusDepth((Number(event.target.value) === 2 ? 2 : 1) as 1 | 2);
                }}
                className="input-base !py-2 !text-xs"
              >
                <option value={1}>1-hop</option>
                <option value={2}>2-hop</option>
              </select>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
            <p className="font-semibold">동작 원리 요약</p>
            <p className="mt-1">
              화면 관계 = 관계 타입 + 최소 강도 + 검색 조건을 동시에 만족하는 연결입니다.
            </p>
            <p className="mt-0.5">
              포커스 모드는 기준 논문에서 {focusDepth}-hop 이내만 남겨 복잡도를 줄입니다.
            </p>
            <p className="mt-0.5">
              2-hop 추천 점수는 공통 연결·경로 강도·카테고리·태그·연도·복습 우선순위를 함께 반영합니다.
            </p>
          </div>
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

      {surfaceMode === 'list' ? (
        <div className="h-full overflow-auto px-3 pb-3 pt-[250px] md:pt-[245px]">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm xl:col-span-1 dark:border-gray-700 dark:bg-gray-900">
              {!focusPaper || !focusSnapshot ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">논문을 선택해주세요.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
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
                      상세 열기
                    </button>
                  </div>

                  <p className="rounded-md bg-blue-50 px-2.5 py-2 text-xs text-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
                    {focusSnapshot.oneLiner}
                  </p>

                  {!!focusSnapshot.rememberPoints.length && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        리마인드 체크포인트
                      </p>
                      <ul className="space-y-1">
                        {focusSnapshot.rememberPoints.map((item) => (
                          <li key={item} className="text-xs text-gray-700 dark:text-gray-300">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!!focusSnapshot.expectedOutcomes.length && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        기대 기여/결과
                      </p>
                      <ul className="space-y-1">
                        {focusSnapshot.expectedOutcomes.map((item) => (
                          <li key={item} className="text-xs text-gray-700 dark:text-gray-300">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!!focusSnapshot.equationPreviews.length && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        핵심 수식
                      </p>
                      <div className="space-y-1.5">
                        {focusSnapshot.equationPreviews.slice(0, 2).map((equation) => (
                          <div
                            key={equation.name}
                            className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                          >
                            <p className="line-clamp-1 text-[11px] font-semibold text-gray-700 dark:text-gray-200">
                              {equation.name}
                            </p>
                            <code className="line-clamp-2 block text-[10px] text-gray-600 dark:text-gray-300">
                              {equation.latex}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm xl:col-span-2 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">직접 연결 관계</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {focusConnections.length}개
                </span>
              </div>

              <div className="max-h-[300px] overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                    <tr className="text-[11px] text-gray-500 dark:text-gray-300">
                      <th className="px-2 py-2">방향</th>
                      <th className="px-2 py-2">관계</th>
                      <th className="px-2 py-2">연결 논문</th>
                      <th className="px-2 py-2">강도</th>
                    </tr>
                  </thead>
                  <tbody>
                    {focusConnections.map((connection) => (
                      <tr
                        key={connection.relationship.id}
                        className="border-t border-gray-100 dark:border-gray-700"
                      >
                        <td className="px-2 py-2 text-gray-600 dark:text-gray-300">
                          {connection.direction === 'outgoing' ? '참조함' : '참조됨'}
                        </td>
                        <td className="px-2 py-2">
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${RELATIONSHIP_STYLES[connection.relationship.relationship_type].color}20`,
                              color: RELATIONSHIP_STYLES[connection.relationship.relationship_type].color,
                            }}
                          >
                            {RELATIONSHIP_STYLES[connection.relationship.relationship_type].label}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => {
                              setFocusPaperId(connection.otherPaper.id);
                            }}
                            className="line-clamp-1 text-left font-medium text-blue-700 hover:underline dark:text-blue-300"
                          >
                            {connection.otherPaper.title}
                          </button>
                        </td>
                        <td className="px-2 py-2 text-gray-700 dark:text-gray-200">
                          {connection.relationship.strength}/10
                        </td>
                      </tr>
                    ))}
                    {!focusConnections.length && (
                      <tr>
                        <td colSpan={4} className="px-2 py-3 text-center text-gray-500 dark:text-gray-400">
                          직접 연결된 관계가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {!!focusRecommendations.length && (
                <div className="mt-3">
                  <h4 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    2-hop 추천 연결
                  </h4>
                  <div className="space-y-1.5">
                    {focusRecommendations.map((recommendation) => (
                      <button
                        key={recommendation.paper.id}
                        onClick={() => setFocusPaperId(recommendation.paper.id)}
                        className="flex w-full items-center justify-between rounded-md border border-gray-200 px-2 py-1.5 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <span className="line-clamp-1 text-xs text-gray-700 dark:text-gray-200">
                          {recommendation.paper.title}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          점수 {recommendation.score}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {!!strongestRelationships.length && (
            <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                현재 필터 기준 강한 관계 상위
              </h3>
              <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                {strongestRelationships.slice(0, 10).map((item) => (
                  <button
                    key={item.relationship.id}
                    onClick={() => setFocusPaperId(item.relationship.from_paper_id)}
                    className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs text-gray-700 dark:text-gray-200">
                        {item.from?.title} → {item.to?.title}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {RELATIONSHIP_STYLES[item.relationship.relationship_type].label} · 강도 {item.relationship.strength}/10
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <>
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
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#d1d5db"
            />
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

          {focusPaper && focusSnapshot && (
            <div className="absolute right-3 top-3 z-20 hidden max-h-[76vh] w-[360px] overflow-auto rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg xl:block dark:border-gray-700 dark:bg-gray-900/95">
              <div className="flex items-center justify-between gap-2">
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

              <p className="mt-2 rounded-md bg-blue-50 px-2.5 py-2 text-xs text-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
                {focusSnapshot.oneLiner}
              </p>

              {!!focusSnapshot.rememberPoints.length && (
                <div className="mt-2">
                  <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                    리마인드 체크포인트
                  </p>
                  <ul className="space-y-1">
                    {focusSnapshot.rememberPoints.map((item) => (
                      <li key={item} className="text-[11px] text-gray-700 dark:text-gray-300">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!!focusSnapshot.expectedOutcomes.length && (
                <div className="mt-2">
                  <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                    기대 기여/결과
                  </p>
                  <ul className="space-y-1">
                    {focusSnapshot.expectedOutcomes.slice(0, 3).map((item) => (
                      <li key={item} className="text-[11px] text-gray-700 dark:text-gray-300">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!!focusSnapshot.equationPreviews.length && (
                <div className="mt-2">
                  <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                    핵심 수식
                  </p>
                  <div className="space-y-1.5">
                    {focusSnapshot.equationPreviews.slice(0, 2).map((equation) => (
                      <div
                        key={equation.name}
                        className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <p className="line-clamp-1 text-[11px] font-semibold text-gray-700 dark:text-gray-200">
                          {equation.name}
                        </p>
                        <code className="line-clamp-2 block text-[10px] text-gray-600 dark:text-gray-300">
                          {equation.latex}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
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
