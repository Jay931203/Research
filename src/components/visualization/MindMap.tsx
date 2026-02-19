'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type NodeMouseHandler,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import {
  ArrowRightLeft,
  Filter,
  ListTree,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import 'reactflow/dist/style.css';

import type {
  FamiliarityLevel,
  PaperNodeData,
  PaperRelationship,
  PaperWithNote,
  RelationshipType,
} from '@/types';
import {
  RELATIONSHIP_STYLES,
  getFamiliarityStarScore,
  RESEARCH_TOPIC_LABELS,
  RESEARCH_TOPIC_ORDER,
  type ResearchTopic,
  inferResearchTopic,
} from '@/lib/visualization/graphUtils';
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
type LayerMode = 'year' | 'year_topic' | 'category';

const CORE_REL_TYPES: RelationshipType[] = ['extends', 'builds_on', 'inspired_by'];
const ALL_REL_TYPES = Object.keys(RELATIONSHIP_STYLES) as RelationshipType[];
const FAMILIARITY_STAR_OPTIONS = [0, 1, 2, 3] as const;
const IMPORTANCE_OPTIONS = [1, 2, 3, 4, 5] as const;
const MINDMAP_FILTERS_STORAGE_KEY = 'dashboard-mindmap-filters-v2';
const MINDMAP_FILTERS_PINNED_STORAGE_KEY = 'dashboard-mindmap-filters-pinned-v2';

interface MindMapFilterPayload {
  surfaceMode: SurfaceMode;
  viewMode: GraphViewMode;
  direction: 'TB' | 'LR';
  layerMode: LayerMode;
  focusDepth: 1 | 2;
  focusPaperId: string | null;
  enabledRelationshipTypes: RelationshipType[];
  minStrength: number;
  isPanelOpen: boolean;
  useFamiliarityOpacity: boolean;
  searchText: string;
  selectedPaperIds: string[];
  selectedFamiliarityStars: number[];
  selectedImportanceRatings: number[];
  selectedResearchTopics: ResearchTopic[];
}

interface MindMapPinnedSnapshot {
  savedAt: string;
  payload: MindMapFilterPayload;
}

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
  const [surfaceMode] = useState<SurfaceMode>('graph');
  const [viewMode, setViewMode] = useState<GraphViewMode>('overview');
  const [direction, setDirection] = useState<'TB' | 'LR'>('TB');
  const [layerMode, setLayerMode] = useState<LayerMode>('year_topic');
  const [focusDepth, setFocusDepth] = useState<1 | 2>(1);
  const [focusPaperId, setFocusPaperId] = useState<string | null>(null);
  const [enabledRelationshipTypes, setEnabledRelationshipTypes] =
    useState<RelationshipType[]>(CORE_REL_TYPES);
  const [minStrength, setMinStrength] = useState(4);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [useFamiliarityOpacity, setUseFamiliarityOpacity] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [selectedFamiliarityStars, setSelectedFamiliarityStars] = useState<number[]>([]);
  const [selectedImportanceRatings, setSelectedImportanceRatings] = useState<number[]>([]);
  const [selectedResearchTopics, setSelectedResearchTopics] = useState<ResearchTopic[]>([]);
  const [isFilterStateHydrated, setIsFilterStateHydrated] = useState(false);
  const [hasPinnedSnapshot, setHasPinnedSnapshot] = useState(false);
  const [pinnedSavedAt, setPinnedSavedAt] = useState<string | null>(null);
  const { fitView } = useReactFlow();

  const buildFilterPayload = useCallback(
    (): MindMapFilterPayload => ({
      surfaceMode,
      viewMode,
      direction,
      layerMode,
      focusDepth,
      focusPaperId,
      enabledRelationshipTypes,
      minStrength,
      isPanelOpen,
      useFamiliarityOpacity,
      searchText,
      selectedPaperIds,
      selectedFamiliarityStars,
      selectedImportanceRatings,
      selectedResearchTopics,
    }),
    [
      surfaceMode,
      viewMode,
      direction,
      layerMode,
      focusDepth,
      focusPaperId,
      enabledRelationshipTypes,
      minStrength,
      isPanelOpen,
      useFamiliarityOpacity,
      searchText,
      selectedPaperIds,
      selectedFamiliarityStars,
      selectedImportanceRatings,
      selectedResearchTopics,
    ]
  );

  const applyFilterPayload = useCallback((parsed: Partial<MindMapFilterPayload>) => {
    if (
      parsed.viewMode === 'overview' ||
      parsed.viewMode === 'focus' ||
      parsed.viewMode === 'timeline'
    ) {
      setViewMode(parsed.viewMode);
    }
    if (parsed.direction === 'TB' || parsed.direction === 'LR') {
      setDirection(parsed.direction);
    }
    // Keep layer mode fixed to year/topic lanes for consistent dashboard map.
    setLayerMode('year_topic');
    if (parsed.focusDepth === 1 || parsed.focusDepth === 2) {
      setFocusDepth(parsed.focusDepth);
    }
    if (typeof parsed.focusPaperId === 'string' || parsed.focusPaperId === null) {
      setFocusPaperId(parsed.focusPaperId);
    }
    if (typeof parsed.minStrength === 'number' && Number.isFinite(parsed.minStrength)) {
      setMinStrength(Math.max(1, Math.min(10, Math.round(parsed.minStrength))));
    }
    if (typeof parsed.isPanelOpen === 'boolean') {
      setIsPanelOpen(parsed.isPanelOpen);
    }
    if (typeof parsed.useFamiliarityOpacity === 'boolean') {
      setUseFamiliarityOpacity(parsed.useFamiliarityOpacity);
    }
    if (typeof parsed.searchText === 'string') {
      setSearchText(parsed.searchText);
    }
    if (Array.isArray(parsed.enabledRelationshipTypes)) {
      const nextRelationshipTypes = parsed.enabledRelationshipTypes.filter(
        (value): value is RelationshipType =>
          typeof value === 'string' && ALL_REL_TYPES.includes(value as RelationshipType)
      );
      if (nextRelationshipTypes.length) {
        setEnabledRelationshipTypes(Array.from(new Set(nextRelationshipTypes)));
      }
    }
    if (Array.isArray(parsed.selectedPaperIds)) {
      setSelectedPaperIds(
        Array.from(
          new Set(parsed.selectedPaperIds.filter((value): value is string => typeof value === 'string'))
        )
      );
    }
    if (Array.isArray(parsed.selectedFamiliarityStars)) {
      const nextStars = parsed.selectedFamiliarityStars
        .filter(
          (value): value is number =>
            typeof value === 'number' && FAMILIARITY_STAR_OPTIONS.includes(value as 0 | 1 | 2 | 3)
        )
        .sort((a, b) => a - b);
      setSelectedFamiliarityStars(Array.from(new Set(nextStars)));
    }
    if (Array.isArray(parsed.selectedImportanceRatings)) {
      const nextImportanceRatings = parsed.selectedImportanceRatings
        .filter(
          (value): value is number =>
            typeof value === 'number' && IMPORTANCE_OPTIONS.includes(value as 1 | 2 | 3 | 4 | 5)
        )
        .sort((a, b) => a - b);
      setSelectedImportanceRatings(Array.from(new Set(nextImportanceRatings)));
    }
    if (Array.isArray(parsed.selectedResearchTopics)) {
      const nextTopics = parsed.selectedResearchTopics.filter(
        (value): value is ResearchTopic =>
          typeof value === 'string' &&
          RESEARCH_TOPIC_ORDER.includes(value as ResearchTopic)
      );
      setSelectedResearchTopics(
        Array.from(new Set(nextTopics)).sort(
          (a, b) => RESEARCH_TOPIC_ORDER.indexOf(a) - RESEARCH_TOPIC_ORDER.indexOf(b)
        )
      );
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MINDMAP_FILTERS_STORAGE_KEY);
      if (raw) {
        applyFilterPayload(JSON.parse(raw) as Partial<MindMapFilterPayload>);
      }

      const pinnedRaw = localStorage.getItem(MINDMAP_FILTERS_PINNED_STORAGE_KEY);
      if (pinnedRaw) {
        const pinnedParsed = JSON.parse(pinnedRaw) as Partial<MindMapPinnedSnapshot>;
        const hasPayload = !!pinnedParsed.payload;
        setHasPinnedSnapshot(hasPayload || typeof pinnedParsed.savedAt === 'string');
        if (typeof pinnedParsed.savedAt === 'string') {
          setPinnedSavedAt(pinnedParsed.savedAt);
        }
      }
    } catch (error) {
      console.warn('Failed to restore dashboard filter state:', error);
    } finally {
      setIsFilterStateHydrated(true);
    }
  }, [applyFilterPayload]);

  useEffect(() => {
    if (!isFilterStateHydrated) return;

    try {
      localStorage.setItem(MINDMAP_FILTERS_STORAGE_KEY, JSON.stringify(buildFilterPayload()));
    } catch (error) {
      console.warn('Failed to persist dashboard filter state:', error);
    }
  }, [isFilterStateHydrated, buildFilterPayload]);

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const familiarityLevel: FamiliarityLevel | undefined = paper.familiarity_level;
      const starScore = getFamiliarityStarScore(familiarityLevel);
      const familiarityMatch =
        !selectedFamiliarityStars.length || selectedFamiliarityStars.includes(starScore);
      const importance = paper.importance_rating ?? 0;
      const importanceMatch =
        !selectedImportanceRatings.length || selectedImportanceRatings.includes(importance);
      const researchTopic = inferResearchTopic(paper);
      const researchTopicMatch =
        !selectedResearchTopics.length || selectedResearchTopics.includes(researchTopic);
      return familiarityMatch && importanceMatch && researchTopicMatch;
    });
  }, [papers, selectedFamiliarityStars, selectedImportanceRatings, selectedResearchTopics]);

  const researchTopicCounts = useMemo(() => {
    const counts: Partial<Record<ResearchTopic, number>> = {};
    for (const paper of papers) {
      const topic = inferResearchTopic(paper);
      counts[topic] = (counts[topic] ?? 0) + 1;
    }
    return counts;
  }, [papers]);

  const availableResearchTopics = useMemo(
    () => RESEARCH_TOPIC_ORDER.filter((topic) => (researchTopicCounts[topic] ?? 0) > 0),
    [researchTopicCounts]
  );

  const filteredPaperIdSet = useMemo(
    () => new Set(filteredPapers.map((paper) => paper.id)),
    [filteredPapers]
  );

  const sortedPapers = useMemo(() => {
    return [...filteredPapers].sort((a, b) => b.year - a.year);
  }, [filteredPapers]);

  const selectionCandidates = useMemo(() => {
    if (!searchText.trim()) return sortedPapers;
    return sortedPapers.filter((paper) => matchesSearch(paper, searchText));
  }, [sortedPapers, searchText]);

  const favoritePaperIds = useMemo(
    () => filteredPapers.filter((paper) => paper.is_favorite).map((paper) => paper.id),
    [filteredPapers]
  );

  const selectedPaperSet = useMemo(() => new Set(selectedPaperIds), [selectedPaperIds]);

  useEffect(() => {
    if (!filteredPapers.length) {
      setFocusPaperId(null);
      return;
    }

    const exists = focusPaperId && filteredPapers.some((paper) => paper.id === focusPaperId);
    if (exists) return;

    setFocusPaperId(sortedPapers[0]?.id ?? null);
  }, [filteredPapers, sortedPapers, focusPaperId]);

  useEffect(() => {
    if (!selectedPaperIds.length) return;
    if (focusPaperId && selectedPaperSet.has(focusPaperId)) return;
    setFocusPaperId(selectedPaperIds[0] ?? null);
  }, [selectedPaperIds, selectedPaperSet, focusPaperId]);

  useEffect(() => {
    setSelectedPaperIds((previous) =>
      previous.filter((id) => filteredPapers.some((paper) => paper.id === id))
    );
  }, [filteredPapers]);

  const filteredRelationships = useMemo(() => {
    return relationships.filter((relationship) => {
      if (!enabledRelationshipTypes.includes(relationship.relationship_type)) {
        return false;
      }
      if (relationship.strength < minStrength) return false;
      return (
        filteredPaperIdSet.has(relationship.from_paper_id) &&
        filteredPaperIdSet.has(relationship.to_paper_id)
      );
    });
  }, [relationships, enabledRelationshipTypes, minStrength, filteredPaperIdSet]);

  const { searchedPapers, searchedRelationships } = useMemo(() => {
    if (!searchText.trim()) {
      return {
        searchedPapers: filteredPapers,
        searchedRelationships: filteredRelationships,
      };
    }

    const matchedIds = new Set(
      filteredPapers.filter((paper) => matchesSearch(paper, searchText)).map((paper) => paper.id)
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
      searchedPapers: filteredPapers.filter((paper) => visibleIds.has(paper.id)),
      searchedRelationships: relatedEdges,
    };
  }, [filteredPapers, filteredRelationships, searchText]);

  const { selectionFilteredPapers, selectionFilteredRelationships } = useMemo(() => {
    if (!selectedPaperSet.size) {
      return {
        selectionFilteredPapers: searchedPapers,
        selectionFilteredRelationships: searchedRelationships,
      };
    }

    return {
      selectionFilteredPapers: searchedPapers.filter((paper) => selectedPaperSet.has(paper.id)),
      selectionFilteredRelationships: searchedRelationships.filter(
        (relationship) =>
          selectedPaperSet.has(relationship.from_paper_id) &&
          selectedPaperSet.has(relationship.to_paper_id)
      ),
    };
  }, [searchedPapers, searchedRelationships, selectedPaperSet]);

  const { displayPapers, displayRelationships } = useMemo(() => {
    if (viewMode !== 'focus' || !focusPaperId) {
      return {
        displayPapers: selectionFilteredPapers,
        displayRelationships: selectionFilteredRelationships,
      };
    }

    const focusedSet = bfsNodeSet(focusPaperId, selectionFilteredRelationships, focusDepth);
    return {
      displayPapers: selectionFilteredPapers.filter((paper) => focusedSet.has(paper.id)),
      displayRelationships: selectionFilteredRelationships.filter((relationship) => {
        return (
          focusedSet.has(relationship.from_paper_id) && focusedSet.has(relationship.to_paper_id)
        );
      }),
    };
  }, [
    viewMode,
    focusPaperId,
    focusDepth,
    selectionFilteredPapers,
    selectionFilteredRelationships,
  ]);

  const focusPaper = useMemo(() => {
    if (!focusPaperId) return null;
    return filteredPapers.find((paper) => paper.id === focusPaperId) ?? null;
  }, [focusPaperId, filteredPapers]);

  const focusSnapshot = useMemo(() => {
    if (!focusPaper) return null;
    return buildPaperCoreSnapshot(focusPaper);
  }, [focusPaper]);

  const focusConnections = useMemo(() => {
    if (!focusPaperId) return [];
    return buildPaperConnections(focusPaperId, filteredPapers, displayRelationships);
  }, [focusPaperId, filteredPapers, displayRelationships]);

  const focusRecommendations = useMemo(() => {
    if (!focusPaperId) return [];
    return buildBridgeRecommendations(
      focusPaperId,
      filteredPapers,
      selectionFilteredRelationships,
      5
    );
  }, [focusPaperId, filteredPapers, selectionFilteredRelationships]);

  const strongestRelationships = useMemo(() => {
    return [...displayRelationships]
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 20)
      .map((relationship) => {
        const from = filteredPapers.find((paper) => paper.id === relationship.from_paper_id);
        const to = filteredPapers.find((paper) => paper.id === relationship.to_paper_id);
        return { relationship, from, to };
      })
      .filter((item) => item.from && item.to);
  }, [displayRelationships, filteredPapers]);

  const visibleTopicLabels = useMemo(() => {
    return RESEARCH_TOPIC_ORDER.filter((topic) =>
      displayPapers.some((paper) => inferResearchTopic(paper) === topic)
    ).map((topic) => RESEARCH_TOPIC_LABELS[topic]);
  }, [displayPapers]);

  const activeDirection = viewMode === 'timeline' ? 'TB' : direction;
  const graphData = useGraphData(displayPapers, displayRelationships, {
    direction: activeDirection,
    applyFamiliarityOpacity: useFamiliarityOpacity,
  });
  const graphNodes = graphData.nodes;

  const layeredNodes = useMemo(() => {
    const nodeMap = new Map(graphNodes.map((node) => [node.id, node]));

    if (layerMode === 'year_topic') {
      const sorted = [...displayPapers].sort((a, b) => {
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
    }

    if (layerMode === 'year') {
      const sorted = [...displayPapers].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.title.localeCompare(b.title);
      });
      const yearOrder = Array.from(new Set(sorted.map((paper) => paper.year)));
      const groupedByYear = new Map<number, PaperWithNote[]>();
      for (const year of yearOrder) groupedByYear.set(year, []);
      for (const paper of sorted) {
        groupedByYear.get(paper.year)?.push(paper);
      }

      const yearGap = 260;
      const colGap = 320;
      const positioned: typeof graphNodes = [];

      yearOrder.forEach((year, rowIndex) => {
        const row = groupedByYear.get(year) ?? [];
        const totalWidth = Math.max(0, (row.length - 1) * colGap);
        row.forEach((paper, colIndex) => {
          const base = nodeMap.get(paper.id);
          if (!base) return;
          positioned.push({
            ...base,
            position: {
              x: colIndex * colGap - totalWidth / 2,
              y: rowIndex * yearGap,
            },
          });
        });
      });

      return positioned;
    }

    const categoryBaseOrder = [
      'csi_compression',
      'autoencoder',
      'quantization',
      'transformer',
      'cnn',
      'other',
    ];
    const dynamicCategories = Array.from(
      new Set(displayPapers.map((paper) => paper.category))
    ).filter((category) => !categoryBaseOrder.includes(category));
    const categoryOrder = [
      ...categoryBaseOrder.filter((category) =>
        displayPapers.some((paper) => paper.category === category)
      ),
      ...dynamicCategories,
    ];
    const groupedByCategory = new Map<string, PaperWithNote[]>();
    for (const category of categoryOrder) groupedByCategory.set(category, []);
    for (const paper of [...displayPapers].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title))) {
      groupedByCategory.get(paper.category)?.push(paper);
    }

    const colGap = 360;
    const rowGap = 230;
    const centeredOffset = (categoryOrder.length - 1) / 2;
    const positioned: typeof graphNodes = [];

    categoryOrder.forEach((category, colIndex) => {
      const column = groupedByCategory.get(category) ?? [];
      column.forEach((paper, rowIndex) => {
        const base = nodeMap.get(paper.id);
        if (!base) return;
        positioned.push({
          ...base,
          position: {
            x: (colIndex - centeredOffset) * colGap,
            y: rowIndex * rowGap,
          },
        });
      });
    });

    return positioned;
  }, [displayPapers, graphNodes, layerMode]);

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

  const openPaper = useCallback(
    (paperId: string) => {
      setFocusPaperId(paperId);
      onNodeClick?.(paperId);
    },
    [onNodeClick]
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node: Node<PaperNodeData>) => {
      openPaper(node.id);
    },
    [openPaper]
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

  const togglePaperSelection = useCallback((paperId: string) => {
    setSelectedPaperIds((previous) =>
      previous.includes(paperId)
        ? previous.filter((id) => id !== paperId)
        : [...previous, paperId]
    );
  }, []);

  const toggleFamiliarityStarFilter = useCallback((star: number) => {
    setSelectedFamiliarityStars((previous) =>
      previous.includes(star)
        ? previous.filter((value) => value !== star)
        : [...previous, star].sort((a, b) => a - b)
    );
  }, []);

  const toggleImportanceFilter = useCallback((rating: number) => {
    setSelectedImportanceRatings((previous) =>
      previous.includes(rating)
        ? previous.filter((value) => value !== rating)
        : [...previous, rating].sort((a, b) => a - b)
    );
  }, []);

  const toggleResearchTopicFilter = useCallback((topic: ResearchTopic) => {
    setSelectedResearchTopics((previous) =>
      previous.includes(topic)
        ? previous.filter((value) => value !== topic)
        : [...previous, topic].sort(
            (a, b) => RESEARCH_TOPIC_ORDER.indexOf(a) - RESEARCH_TOPIC_ORDER.indexOf(b)
          )
    );
  }, []);

  const clearPaperSelection = useCallback(() => {
    setSelectedPaperIds([]);
  }, []);

  const selectFavoritePapers = useCallback(() => {
    setSelectedPaperIds(favoritePaperIds);
  }, [favoritePaperIds]);

  const selectSearchCandidates = useCallback(() => {
    setSelectedPaperIds(selectionCandidates.map((paper) => paper.id));
  }, [selectionCandidates]);

  const resetAllFilters = useCallback(() => {
    setViewMode('overview');
    setDirection('TB');
    setLayerMode('year_topic');
    setFocusDepth(1);
    setEnabledRelationshipTypes(CORE_REL_TYPES);
    setMinStrength(4);
    setUseFamiliarityOpacity(false);
    setSearchText('');
    setSelectedPaperIds([]);
    setSelectedFamiliarityStars([]);
    setSelectedImportanceRatings([]);
    setSelectedResearchTopics([]);
  }, []);

  const savePinnedFilterState = useCallback(() => {
    const snapshot: MindMapPinnedSnapshot = {
      savedAt: new Date().toISOString(),
      payload: buildFilterPayload(),
    };

    try {
      localStorage.setItem(MINDMAP_FILTERS_PINNED_STORAGE_KEY, JSON.stringify(snapshot));
      setHasPinnedSnapshot(true);
      setPinnedSavedAt(snapshot.savedAt);
    } catch (error) {
      console.warn('Failed to save pinned dashboard filter state:', error);
    }
  }, [buildFilterPayload]);

  const loadPinnedFilterState = useCallback(() => {
    try {
      const pinnedRaw = localStorage.getItem(MINDMAP_FILTERS_PINNED_STORAGE_KEY);
      if (!pinnedRaw) return;

      const parsed = JSON.parse(pinnedRaw) as Partial<MindMapPinnedSnapshot>;
      if (parsed.payload) {
        applyFilterPayload(parsed.payload);
      } else {
        applyFilterPayload(parsed as Partial<MindMapFilterPayload>);
      }

      setHasPinnedSnapshot(true);
      if (typeof parsed.savedAt === 'string') {
        setPinnedSavedAt(parsed.savedAt);
      }
    } catch (error) {
      console.warn('Failed to load pinned dashboard filter state:', error);
    }
  }, [applyFilterPayload]);

  useEffect(() => {
    if (surfaceMode !== 'graph' || !layeredNodes.length) return;
    const raf = window.requestAnimationFrame(() => {
      fitView({ padding: 0.22, duration: 350 });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [layeredNodes, surfaceMode, fitView]);

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
          <p className="mb-2 text-gray-600 dark:text-gray-300">?쒖떆???쇰Ц???놁뒿?덈떎.</p>
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
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
              <ListTree className="h-3.5 w-3.5" />
              洹몃옒??            </span>

            <button
              onClick={savePinnedFilterState}
              className="rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              title="현재 필터 상태 저장"
            >
              상태 저장
            </button>
            <button
              onClick={loadPinnedFilterState}
              disabled={!hasPinnedSnapshot}
              className="rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
              title="저장한 필터 상태 불러오기"
            >
              상태 불러오기
            </button>
            <button
              onClick={resetAllFilters}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              title="필터/선택/검색 전체 초기화"
            >
              전체 초기화
            </button>
            {hasPinnedSnapshot && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                저장됨: {pinnedSavedAt ? new Date(pinnedSavedAt).toLocaleString('ko-KR') : '확인됨'}
              </span>
            )}

            <button
              onClick={() => setIsPanelOpen(false)}
              className="ml-auto rounded-md border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              title="?⑤꼸 ?リ린"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2 text-[11px] md:grid-cols-5">
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">?꾩껜 ?쇰Ц {papers.length}</div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">?쒖떆 ?쇰Ц {displayPapers.length}</div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">표시 관계 {displayRelationships.length}</div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">
              ?좏깮 ?쇰Ц {selectedPaperIds.length || sortedPapers.length}
            </div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 dark:bg-gray-800">理쒖냼 媛뺣룄 {minStrength}</div>
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

          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
                <span className="font-semibold">?듭닕??蹂?</span>
                {!!selectedFamiliarityStars.length && (
                  <button
                    onClick={() => setSelectedFamiliarityStars([])}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    珥덇린??                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FAMILIARITY_STAR_OPTIONS.map((star) => {
                  const active = selectedFamiliarityStars.includes(star);
                  return (
                    <button
                      key={star}
                      onClick={() => toggleFamiliarityStarFilter(star)}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
                        active
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300'
                      }`}
                    >
                      蹂?{star}媛?                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
                <span className="font-semibold">중요도</span>
                {!!selectedImportanceRatings.length && (
                  <button
                    onClick={() => setSelectedImportanceRatings([])}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    珥덇린??                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {IMPORTANCE_OPTIONS.map((rating) => {
                  const active = selectedImportanceRatings.includes(rating);
                  return (
                    <button
                      key={rating}
                      onClick={() => toggleImportanceFilter(rating)}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
                        active
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300'
                      }`}
                    >
                      {rating}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
              <span className="font-semibold">대표 카테고리</span>
              {!!selectedResearchTopics.length && (
                <button
                  onClick={() => setSelectedResearchTopics([])}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  珥덇린??                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableResearchTopics.map((topic) => {
                const active = selectedResearchTopics.includes(topic);
                const count = researchTopicCounts[topic] ?? 0;
                return (
                  <button
                    key={topic}
                    onClick={() => toggleResearchTopicFilter(topic)}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
                      active
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300'
                    }`}
                  >
                    {RESEARCH_TOPIC_LABELS[topic]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 text-[11px] dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-200">익숙도 배경 강조 시각화</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                蹂?0媛쒕룄 遺덊닾紐??곹깭瑜??좎??섍퀬, 蹂꾩씠 ?믪쓣?섎줉 諛곌꼍?됱씠 ??吏꾪빐吏묐땲??
              </p>
            </div>
            <button
              onClick={() => setUseFamiliarityOpacity((previous) => !previous)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                useFamiliarityOpacity
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300'
              }`}
            >
              {useFamiliarityOpacity ? '耳쒖쭚' : '爰쇱쭚'}
            </button>
          </div>

          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1 font-semibold">
                <ListTree className="h-3.5 w-3.5" />
                선택 논문 ({selectedPaperIds.length ? `${selectedPaperIds.length}개` : '전체'})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={selectSearchCandidates}
                  disabled={!selectionCandidates.length}
                  className="rounded border border-blue-300 px-2 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  검색결과 선택
                </button>
                <button
                  onClick={selectFavoritePapers}
                  className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                >
                  <Star className="h-3 w-3" />
                  利먭꺼李얘린留?                </button>
                <button
                  onClick={clearPaperSelection}
                  disabled={!selectedPaperIds.length}
                  className="rounded border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  ?꾩껜 蹂닿린
                </button>
              </div>
            </div>
            <div className="max-h-40 overflow-auto rounded-md border border-gray-200 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900">
              {selectionCandidates.map((paper) => (
                <label key={paper.id} className="flex items-center gap-2 py-1 text-[11px]">
                  <input
                    type="checkbox"
                    checked={selectedPaperSet.has(paper.id)}
                    onChange={() => togglePaperSelection(paper.id)}
                    className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate text-gray-700 dark:text-gray-300">
                    {paper.year} - {paper.title}
                  </span>
                </label>
              ))}
              {selectionCandidates.length === 0 && (
                <p className="py-2 text-center text-[11px] text-gray-400 dark:text-gray-500">
                  검색 결과가 없습니다.
                </p>
              )}
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
              {(selectedPaperIds.length ? selectionFilteredPapers : sortedPapers).map((paper) => (
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
                <option value="focus">珥덉젏 紐⑤뱶</option>
                <option value="overview">?꾩껜 蹂닿린</option>
                <option value="timeline">타임라인</option>
              </select>
              <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                ?곕룄 x 二쇱젣 ?뺣젹
              </span>
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
            <p className="font-semibold">?숈옉 ?먮━ ?붿빟</p>
            <p className="mt-1">
              화면 관계는 관계 타입 + 최소 강도 + 검색 조건을 동시에 만족하는 연결만 보여줍니다.
            </p>
            <p className="mt-0.5">
              ?ъ빱??紐⑤뱶??湲곗? ?쇰Ц?먯꽌 {focusDepth}-hop ?대궡留??④꺼 蹂듭옟?꾨? 以꾩엯?덈떎.
            </p>
            <p className="mt-0.5">
              논문 선택/필터/정렬 변경 시 맵은 자동으로 재정렬됩니다.
            </p>
            {layerMode === 'year_topic' && (
              <p className="mt-0.5">
                ?꾩옱 x異?二쇱젣: {visibleTopicLabels.length ? visibleTopicLabels.join(' 쨌 ') : '?놁쓬'}
              </p>
            )}
            <p className="mt-0.5">
              2-hop 異붿쿇 ?먯닔??怨듯넻 ?곌껐쨌寃쎈줈 媛뺣룄쨌移댄뀒怨좊━쨌?쒓렇쨌?곕룄쨌蹂듭뒿 ?곗꽑?쒖쐞瑜??④퍡 諛섏쁺?⑸땲??
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs font-semibold text-gray-700 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <SlidersHorizontal className="h-4 w-4" />
          ?⑤꼸 ?닿린
        </button>
      )}

      {surfaceMode === 'list' ? (
        <div className="h-full overflow-auto px-3 pb-3 pt-[250px] md:pt-[245px]">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm xl:col-span-1 dark:border-gray-700 dark:bg-gray-900">
              {!focusPaper || !focusSnapshot ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">?쇰Ц???좏깮?댁＜?몄슂.</p>
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
                      ?곸꽭 ?닿린
                    </button>
                  </div>

                  <p className="rounded-md bg-blue-50 px-2.5 py-2 text-xs text-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
                    {focusSnapshot.oneLiner}
                  </p>

                  {!!focusSnapshot.rememberPoints.length && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        由щ쭏?몃뱶 泥댄겕?ъ씤??                      </p>
                      <ul className="space-y-1">
                        {focusSnapshot.rememberPoints.map((item) => (
                          <li key={item} className="text-xs text-gray-700 dark:text-gray-300">
                            ??{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!!focusSnapshot.expectedOutcomes.length && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        湲곕? 湲곗뿬/寃곌낵
                      </p>
                      <ul className="space-y-1">
                        {focusSnapshot.expectedOutcomes.map((item) => (
                          <li key={item} className="text-xs text-gray-700 dark:text-gray-300">
                            ??{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!!focusSnapshot.equationPreviews.length && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        ?듭떖 ?섏떇
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
                  {focusConnections.length}媛?                </span>
              </div>

              <div className="max-h-[300px] overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                    <tr className="text-[11px] text-gray-500 dark:text-gray-300">
                      <th className="px-2 py-2">諛⑺뼢</th>
                      <th className="px-2 py-2">관계</th>
                      <th className="px-2 py-2">?곌껐 ?쇰Ц</th>
                      <th className="px-2 py-2">媛뺣룄</th>
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
                              openPaper(connection.otherPaper.id);
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
                    2-hop 異붿쿇 ?곌껐
                  </h4>
                  <div className="space-y-1.5">
                    {focusRecommendations.map((recommendation) => (
                      <button
                        key={recommendation.paper.id}
                        onClick={() => openPaper(recommendation.paper.id)}
                        className="flex w-full items-center justify-between rounded-md border border-gray-200 px-2 py-1.5 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <span className="line-clamp-1 text-xs text-gray-700 dark:text-gray-200">
                          {recommendation.paper.title}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          ?먯닔 {recommendation.score}
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
                    onClick={() => openPaper(item.relationship.from_paper_id)}
                    className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs text-gray-700 dark:text-gray-200">
                        {item.from?.title} ??{item.to?.title}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {RELATIONSHIP_STYLES[item.relationship.relationship_type].label} 쨌 媛뺣룄 {item.relationship.strength}/10
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
            zoomOnScroll
            zoomOnPinch
            zoomOnDoubleClick
            panOnDrag
            panOnScroll={false}
            preventScrolling
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
            fitViewOptions={{ padding: 0.25, duration: 500 }}
            minZoom={0.15}
            maxZoom={2.8}
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
