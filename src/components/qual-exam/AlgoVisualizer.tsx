'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, RotateCcw, Square } from 'lucide-react';

/* ─────────────────────────────────────
   Sorting Visualizer (QuickSort / Heap)
───────────────────────────────────── */

type SortStep = {
  array: number[];
  comparing: number[];
  swapping: number[];
  pivotIdx?: number;
  sortedIdx?: number[];
  label: string;
};

function generateQuickSortSteps(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];

  function partition(lo: number, hi: number): number {
    const pivot = a[hi];
    steps.push({ array: [...a], comparing: [hi], swapping: [], pivotIdx: hi, sortedIdx: [], label: `피벗 선택: ${pivot} (인덱스 ${hi})` });
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      steps.push({ array: [...a], comparing: [j, hi], swapping: [], pivotIdx: hi, sortedIdx: [], label: `비교: a[${j}]=${a[j]} vs 피벗=${pivot}` });
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        if (i !== j) steps.push({ array: [...a], comparing: [], swapping: [i, j], pivotIdx: hi, sortedIdx: [], label: `교환: a[${i}]=${a[i]} ↔ a[${j}]=${a[j]}` });
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    steps.push({ array: [...a], comparing: [], swapping: [i + 1, hi], pivotIdx: i + 1, sortedIdx: [], label: `피벗 배치: ${pivot} → 인덱스 ${i + 1}` });
    return i + 1;
  }

  const sorted: number[] = [];
  function quickSort(lo: number, hi: number) {
    if (lo >= hi) {
      if (lo === hi) sorted.push(lo);
      return;
    }
    const p = partition(lo, hi);
    sorted.push(p);
    quickSort(lo, p - 1);
    quickSort(p + 1, hi);
  }

  quickSort(0, a.length - 1);
  steps.push({ array: [...a], comparing: [], swapping: [], sortedIdx: a.map((_, i) => i), label: '정렬 완료!' });
  return steps;
}

function generateHeapSteps(nums: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a: number[] = [];

  function siftUp(idx: number) {
    let i = idx;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      steps.push({ array: [...a], comparing: [i, parent], swapping: [], label: `비교: a[${i}]=${a[i]} vs 부모 a[${parent}]=${a[parent]}` });
      if (a[i] < a[parent]) {
        [a[i], a[parent]] = [a[parent], a[i]];
        steps.push({ array: [...a], comparing: [], swapping: [i, parent], label: `교환: ${a[parent]} ↔ ${a[i]}` });
        i = parent;
      } else break;
    }
  }

  for (const val of nums) {
    a.push(val);
    steps.push({ array: [...a], comparing: [a.length - 1], swapping: [], label: `삽입: ${val}` });
    siftUp(a.length - 1);
    steps.push({ array: [...a], comparing: [], swapping: [], label: `힙 상태 (${val} 삽입 완료)` });
  }

  return steps;
}

function generateDijkstraSteps() {
  // Graph from 2024 2nd exam: A,B,C,D,E,F,G
  const nodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const edges: [string, string, number][] = [
    ['A', 'B', 4], ['A', 'G', 1], ['A', 'F', 5],
    ['B', 'C', 3], ['G', 'C', 9], ['G', 'F', 7],
    ['G', 'E', 12], ['C', 'D', 2], ['D', 'E', 1],
  ];

  type DijkStep = { dist: Record<string, number>; visited: string[]; current: string; relaxed: string[]; label: string };
  const steps: DijkStep[] = [];
  const INF = Infinity;
  const dist: Record<string, number> = {};
  const visited: string[] = [];

  nodes.forEach(n => dist[n] = INF);
  dist['D'] = 0;
  steps.push({ dist: { ...dist }, visited: [], current: 'D', relaxed: [], label: '시작: D=0, 나머지=∞' });

  const remaining = new Set(nodes);
  while (remaining.size > 0) {
    let u = '';
    let minD = INF;
    for (const n of Array.from(remaining)) {
      if (dist[n] < minD) { minD = dist[n]; u = n; }
    }
    if (!u || dist[u] === INF) break;
    remaining.delete(u);
    visited.push(u);

    const relaxed: string[] = [];
    for (const [a, b, w] of edges) {
      let v = '';
      if (a === u) v = b;
      else if (b === u) v = a;
      if (!v || !remaining.has(v)) continue;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        relaxed.push(v);
      }
    }
    steps.push({ dist: { ...dist }, visited: [...visited], current: u, relaxed, label: `방문: ${u} (거리=${dist[u]})${relaxed.length ? `, 갱신: ${relaxed.join(',')}` : ''}` });
  }

  return { steps, edges, nodes };
}

/* ─────────────────────────────────────
   Tree Visualizer (BST)
───────────────────────────────────── */

interface TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; }

function insertBST(root: TreeNode | null, val: number): TreeNode {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) root.left = insertBST(root.left, val);
  else root.right = insertBST(root.right, val);
  return root;
}

function treeToPositions(node: TreeNode | null, x: number, y: number, gap: number, result: { val: number; x: number; y: number; parentX?: number; parentY?: number }[] = []) {
  if (!node) return result;
  result.push({ val: node.val, x, y });
  if (node.left) {
    result.push({ val: -1, x: x - gap, y: y + 60, parentX: x, parentY: y });
    treeToPositions(node.left, x - gap, y + 60, gap / 2, result);
  }
  if (node.right) {
    result.push({ val: -1, x: x + gap, y: y + 60, parentX: x, parentY: y });
    treeToPositions(node.right, x + gap, y + 60, gap / 2, result);
  }
  return result;
}

function buildBSTPositions(vals: number[]) {
  let root: TreeNode | null = null;
  for (const v of vals) root = insertBST(root, v);

  const nodes: { val: number; x: number; y: number }[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];

  function traverse(n: TreeNode | null, x: number, y: number, gap: number) {
    if (!n) return;
    nodes.push({ val: n.val, x, y });
    if (n.left) { edges.push({ x1: x, y1: y, x2: x - gap, y2: y + 70 }); traverse(n.left, x - gap, y + 70, gap / 2); }
    if (n.right) { edges.push({ x1: x, y1: y, x2: x + gap, y2: y + 70 }); traverse(n.right, x + gap, y + 70, gap / 2); }
  }
  traverse(root, 200, 30, 80);
  return { nodes, edges };
}

/* ─────────────────────────────────────
   Main AlgoVisualizer Component
───────────────────────────────────── */

type VisualizerType = 'quicksort' | 'minheap' | 'bst' | 'dijkstra';

interface AlgoVisualizerProps {
  type: VisualizerType;
}

export default function AlgoVisualizer({ type }: AlgoVisualizerProps) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // QuickSort state
  const [sortInput, setSortInput] = useState('37,22,81,63,19,97,53,47,73,55');
  const [sortSteps, setSortSteps] = useState<SortStep[]>([]);

  // Heap state
  const [heapInput, setHeapInput] = useState('11,9,12,14,3,15,7,8,1');
  const [heapSteps, setHeapSteps] = useState<SortStep[]>([]);

  // BST state
  const [bstInput, setBstInput] = useState('30,20,40,10,35,42,37,50,36');
  const [bstData, setBstData] = useState<{ nodes: { val: number; x: number; y: number }[]; edges: { x1: number; y1: number; x2: number; y2: number }[] }>({ nodes: [], edges: [] });

  // Dijkstra state
  const [dijkData] = useState(() => generateDijkstraSteps());
  const [dijkStep, setDijkStep] = useState(0);

  useEffect(() => {
    if (type === 'quicksort') {
      const nums = sortInput.split(',').map(Number).filter(n => !isNaN(n)).slice(0, 12);
      setSortSteps(generateQuickSortSteps(nums));
      setStep(0);
    }
  }, [type, sortInput]);

  useEffect(() => {
    if (type === 'minheap') {
      const nums = heapInput.split(',').map(Number).filter(n => !isNaN(n)).slice(0, 12);
      setHeapSteps(generateHeapSteps(nums));
      setStep(0);
    }
  }, [type, heapInput]);

  useEffect(() => {
    if (type === 'bst') {
      const nums = bstInput.split(',').map(Number).filter(n => !isNaN(n)).slice(0, 15);
      setBstData(buildBSTPositions(nums));
    }
  }, [type, bstInput]);

  const steps = type === 'quicksort' ? sortSteps : type === 'minheap' ? heapSteps : [];
  const maxStep = type === 'dijkstra' ? dijkData.steps.length - 1 : steps.length - 1;
  const currentStep = type === 'dijkstra' ? dijkData.steps[dijkStep] : steps[step];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        if (type === 'dijkstra') {
          setDijkStep(s => { if (s >= maxStep) { setPlaying(false); return s; } return s + 1; });
        } else {
          setStep(s => { if (s >= maxStep) { setPlaying(false); return s; } return s + 1; });
        }
      }, 600);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, maxStep, type]);

  const reset = () => {
    setPlaying(false);
    setStep(0);
    setDijkStep(0);
  };

  const curStep = type === 'dijkstra' ? dijkStep : step;
  const setCurStep = type === 'dijkstra' ? setDijkStep : setStep;

  /* ── QuickSort & Heap Array View ── */
  const renderArrayViz = (s: SortStep) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-center gap-1">
        {s.array.map((val, i) => {
          const isPivot = s.pivotIdx === i;
          const isComparing = s.comparing.includes(i);
          const isSwapping = s.swapping.includes(i);
          const isSorted = s.sortedIdx?.includes(i);
          const maxVal = Math.max(...s.array);
          const h = Math.round((val / maxVal) * 120) + 20;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500">{val}</span>
              <div
                style={{ height: `${h}px` }}
                className={`w-7 rounded-t transition-all duration-300 ${
                  isSorted ? 'bg-emerald-400' :
                  isPivot ? 'bg-red-400' :
                  isSwapping ? 'bg-yellow-400' :
                  isComparing ? 'bg-blue-400' :
                  'bg-slate-300 dark:bg-slate-600'
                }`}
              />
              <span className="text-[9px] text-slate-400">{i}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-red-400" /> 피벗</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-blue-400" /> 비교 중</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-yellow-400" /> 교환</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-emerald-400" /> 정렬됨</span>
      </div>
    </div>
  );

  /* ── Heap Tree View ── */
  const renderHeapViz = (s: SortStep) => {
    const arr = s.array;
    const getX = (i: number, level: number) => {
      const nodesInLevel = Math.pow(2, level);
      const posInLevel = i - (nodesInLevel - 1);
      const totalW = 340;
      return (totalW / (nodesInLevel + 1)) * (posInLevel + 1);
    };
    const getY = (level: number) => 20 + level * 60;
    const getLevel = (i: number) => Math.floor(Math.log2(i + 1));

    return (
      <svg viewBox="0 0 340 220" className="w-full max-w-[360px]">
        {arr.map((_, i) => {
          const left = 2 * i + 1;
          const right = 2 * i + 2;
          const level = getLevel(i);
          const x = getX(i, level);
          const y = getY(level);
          return (
            <g key={`edge-${i}`}>
              {left < arr.length && <line x1={x} y1={y} x2={getX(left, level + 1)} y2={getY(level + 1)} stroke="#94a3b8" strokeWidth="1.5" />}
              {right < arr.length && <line x1={x} y1={y} x2={getX(right, level + 1)} y2={getY(level + 1)} stroke="#94a3b8" strokeWidth="1.5" />}
            </g>
          );
        })}
        {arr.map((val, i) => {
          const level = getLevel(i);
          const x = getX(i, level);
          const y = getY(level);
          const isComparing = s.comparing.includes(i);
          const isSwapping = s.swapping.includes(i);
          return (
            <g key={`node-${i}`}>
              <circle cx={x} cy={y} r={16}
                fill={isSwapping ? '#facc15' : isComparing ? '#60a5fa' : '#e2e8f0'}
                stroke={isSwapping ? '#ca8a04' : isComparing ? '#2563eb' : '#94a3b8'}
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e293b">{val}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  /* ── BST View ── */
  const renderBSTViz = () => (
    <svg viewBox="0 0 400 280" className="w-full max-w-[400px]">
      {bstData.edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#94a3b8" strokeWidth="1.5" />
      ))}
      {bstData.nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={16} fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af">{n.val}</text>
        </g>
      ))}
    </svg>
  );

  /* ── Dijkstra View ── */
  const renderDijkstra = () => {
    if (!dijkData.steps.length) return null;
    const s = dijkData.steps[dijkStep];
    const nodePos: Record<string, { x: number; y: number }> = {
      A: { x: 80, y: 120 }, B: { x: 170, y: 40 }, C: { x: 280, y: 60 },
      D: { x: 330, y: 150 }, E: { x: 270, y: 220 }, F: { x: 130, y: 210 }, G: { x: 200, y: 140 },
    };
    return (
      <div className="flex gap-4">
        <svg viewBox="0 0 400 270" className="w-full max-w-[260px] flex-shrink-0">
          {dijkData.edges.map(([a, b, w], i) => {
            const p1 = nodePos[a]; const p2 = nodePos[b];
            const mx = (p1.x + p2.x) / 2; const my = (p1.y + p2.y) / 2;
            return (
              <g key={i}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeWidth="1.5" />
                <text x={mx} y={my - 4} textAnchor="middle" fontSize="10" fill="#64748b">{w}</text>
              </g>
            );
          })}
          {dijkData.nodes.map(node => {
            const pos = nodePos[node];
            const isVisited = s.visited.includes(node);
            const isCurrent = s.current === node;
            const isRelaxed = s.relaxed.includes(node);
            return (
              <g key={node}>
                <circle cx={pos.x} cy={pos.y} r={18}
                  fill={isCurrent ? '#f97316' : isVisited ? '#86efac' : isRelaxed ? '#93c5fd' : '#e2e8f0'}
                  stroke={isCurrent ? '#ea580c' : isVisited ? '#16a34a' : '#94a3b8'}
                  strokeWidth="2"
                />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e293b">{node}</text>
                <text x={pos.x} y={pos.y + 32} textAnchor="middle" fontSize="9" fill="#475569">
                  {s.dist[node] === Infinity ? '∞' : s.dist[node]}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">최단 거리 (D 기준)</p>
          {dijkData.nodes.map(n => (
            <div key={n} className={`flex justify-between rounded px-2 py-0.5 text-xs ${s.current === n ? 'bg-orange-100 font-bold dark:bg-orange-900/30' : s.visited.includes(n) ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
              <span className="font-mono font-semibold">{n}</span>
              <span className="font-mono">{s.dist[n] === Infinity ? '∞' : s.dist[n]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      {/* Input */}
      {(type === 'quicksort' || type === 'minheap' || type === 'bst') && (
        <div className="mb-3 flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">입력값:</label>
          <input
            value={type === 'quicksort' ? sortInput : type === 'minheap' ? heapInput : bstInput}
            onChange={e => { if (type === 'quicksort') setSortInput(e.target.value); else if (type === 'minheap') setHeapInput(e.target.value); else setBstInput(e.target.value); reset(); }}
            className="flex-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            placeholder="숫자를 쉼표로 구분"
          />
        </div>
      )}

      {/* Visualization */}
      <div className="mb-3 flex min-h-[180px] items-center justify-center rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
        {type === 'bst' ? renderBSTViz() :
         type === 'dijkstra' ? renderDijkstra() :
         currentStep ? renderArrayViz(type === 'minheap' ? (currentStep as SortStep) : (currentStep as SortStep)) : null}
      </div>

      {/* Step label */}
      {type !== 'bst' && (
        <div className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          {type === 'dijkstra' ? dijkData.steps[dijkStep]?.label :
           (type === 'quicksort' ? sortSteps[step]?.label : heapSteps[step]?.label) ?? ''}
        </div>
      )}

      {/* Controls */}
      {type !== 'bst' && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={reset} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="처음으로">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={() => setCurStep(Math.max(0, curStep - 1))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPlaying(p => !p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${playing ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
          >
            {playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button onClick={() => setCurStep(Math.min(maxStep, curStep + 1))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-xs text-slate-400">{curStep + 1}/{maxStep + 1}</span>
        </div>
      )}
    </div>
  );
}
