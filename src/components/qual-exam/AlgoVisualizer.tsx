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
   Linked List / Stack / Queue Visualizer
───────────────────────────────────── */

type LLTab = 'singly' | 'stack' | 'queue';
interface LLNode { id: number; val: string; }

function LinkedListVisualizer() {
  const [tab, setTab] = useState<LLTab>('singly');
  const [nodes, setNodes] = useState<LLNode[]>([
    { id: 1, val: '3' }, { id: 2, val: '7' }, { id: 3, val: '1' },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [log, setLog] = useState<{ op: string; complexity: string; detail: string }[]>([]);
  const [flashId, setFlashId] = useState<number | null>(null);
  const idRef = useRef(10);
  const nextId = () => ++idRef.current;

  const flash = (id: number) => {
    setFlashId(id);
    setTimeout(() => setFlashId(null), 1200);
  };
  const addLog = (op: string, complexity: string, detail: string) =>
    setLog(prev => [{ op, complexity, detail }, ...prev].slice(0, 5));

  const reset = () => {
    setNodes([{ id: 1, val: '3' }, { id: 2, val: '7' }, { id: 3, val: '1' }]);
    setLog([]); setFlashId(null); idRef.current = 10;
  };

  /* ── Singly LL ops ── */
  const prepend = () => {
    const v = inputVal.trim(); if (!v) return;
    const id = nextId();
    setNodes(p => [{ id, val: v }, ...p]);
    addLog(`prepend("${v}")`, 'O(1)', '새 노드.next = head, head = 새 노드');
    flash(id); setInputVal('');
  };
  const append = () => {
    const v = inputVal.trim(); if (!v) return;
    const id = nextId(); const n = nodes.length;
    setNodes(p => [...p, { id, val: v }]);
    addLog(`append("${v}")`, n > 0 ? 'O(n)' : 'O(1)',
      n > 0 ? `tail까지 ${n}칸 순회 후 삽입` : '빈 리스트에 삽입');
    flash(id); setInputVal('');
  };
  const deleteHead = () => {
    if (!nodes.length) return;
    const { val } = nodes[0]; setNodes(p => p.slice(1));
    addLog(`deleteHead()`, 'O(1)', `'${val}' 제거, head 포인터 이동`);
  };
  const deleteTail = () => {
    if (!nodes.length) return;
    const { val } = nodes[nodes.length - 1]; const n = nodes.length;
    setNodes(p => p.slice(0, -1));
    addLog(`deleteTail()`, 'O(n)', `${n}칸 순회 후 '${val}' 제거`);
  };

  /* ── Stack ops ── */
  const stackPush = () => {
    const v = inputVal.trim(); if (!v) return;
    const id = nextId();
    setNodes(p => [{ id, val: v }, ...p]);
    addLog(`push("${v}")`, 'O(1)', 'top에 추가 (LIFO)');
    flash(id); setInputVal('');
  };
  const stackPop = () => {
    if (!nodes.length) return;
    const { val } = nodes[0]; setNodes(p => p.slice(1));
    addLog(`pop()`, 'O(1)', `top '${val}' 제거 및 반환`);
  };

  /* ── Queue ops ── */
  const enqueue = () => {
    const v = inputVal.trim(); if (!v) return;
    const id = nextId();
    setNodes(p => [...p, { id, val: v }]);
    addLog(`enqueue("${v}")`, 'O(1)', 'rear(tail)에 추가 (FIFO)');
    flash(id); setInputVal('');
  };
  const dequeue = () => {
    if (!nodes.length) return;
    const { val } = nodes[0]; setNodes(p => p.slice(1));
    addLog(`dequeue()`, 'O(1)', `front '${val}' 제거 및 반환`);
  };

  /* ── Renders ── */
  const renderSingly = () => {
    const nodeW = 44, nodeH = 34, arrowW = 26, padL = 56;
    const W = padL + nodes.length * (nodeW + arrowW) + 40;
    return (
      <svg viewBox={`0 0 ${Math.max(W, 160)} ${nodeH + 12}`} className="w-full" style={{ maxHeight: 64 }}>
        <defs>
          <marker id="la" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0,7 2.5,0 5" fill="#64748b" />
          </marker>
        </defs>
        <text x="4" y={nodeH / 2 + 6} fontSize="10" fontWeight="700" fill="#64748b">HEAD</text>
        {nodes.length > 0
          ? <line x1={42} y1={nodeH / 2 + 2} x2={padL - 4} y2={nodeH / 2 + 2} stroke="#64748b" strokeWidth="1.5" markerEnd="url(#la)" />
          : <text x={48} y={nodeH / 2 + 6} fontSize="10" fill="#94a3b8">→ NIL (빈 리스트)</text>}
        {nodes.map((node, i) => {
          const x = padL + i * (nodeW + arrowW);
          const hl = flashId === node.id;
          return (
            <g key={node.id}>
              <rect x={x} y={4} width={nodeW} height={nodeH} rx="5"
                fill={hl ? '#dbeafe' : '#f1f5f9'} stroke={hl ? '#3b82f6' : '#94a3b8'}
                strokeWidth={hl ? 2 : 1.5} className="transition-all duration-300" />
              <text x={x + nodeW / 2} y={nodeH / 2 + 6} textAnchor="middle" fontSize="12"
                fontWeight="600" fill={hl ? '#1d4ed8' : '#1e293b'}>{node.val}</text>
              {i < nodes.length - 1
                ? <line x1={x + nodeW} y1={nodeH / 2 + 2} x2={x + nodeW + arrowW - 2} y2={nodeH / 2 + 2}
                    stroke="#64748b" strokeWidth="1.5" markerEnd="url(#la)" />
                : <>
                    <line x1={x + nodeW} y1={nodeH / 2 + 2} x2={x + nodeW + 16} y2={nodeH / 2 + 2}
                      stroke="#64748b" strokeWidth="1.5" />
                    <text x={x + nodeW + 18} y={nodeH / 2 + 6} fontSize="9" fill="#94a3b8">NIL</text>
                  </>}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderStack = () => (
    <div className="flex flex-col items-center gap-0">
      <div className="text-[10px] font-bold text-blue-500 mb-1">▲ TOP (가장 최근 push)</div>
      {nodes.slice(0, 6).map((node, i) => (
        <div key={node.id} style={{ width: 96 }}
          className={`h-9 flex items-center justify-center border-2 font-mono font-bold text-sm transition-all
            ${flashId === node.id ? 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/30'
            : i === 0 ? 'bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
            : 'bg-slate-50 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200'}`}>
          {node.val}
          {i === 0 && <span className="ml-1.5 text-[9px] font-normal opacity-60">← TOP</span>}
        </div>
      ))}
      {nodes.length > 6 && <div className="w-24 border-x-2 border-slate-300 text-center text-xs text-slate-400 py-0.5">···</div>}
      {nodes.length === 0 && <div className="text-xs text-slate-400 py-3">빈 스택 (empty)</div>}
      <div className="text-[10px] font-bold text-slate-400 mt-0.5">▼ BOTTOM</div>
    </div>
  );

  const renderQueue = () => (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <div className="flex items-center gap-1 overflow-x-auto w-full justify-center py-1">
        <span className="text-[9px] font-bold text-green-600 whitespace-nowrap">FRONT↑<br/>dequeue</span>
        <span className="text-slate-300 text-sm px-0.5">→</span>
        {nodes.slice(0, 8).map((node, i) => (
          <div key={node.id} style={{ width: 40, height: 40 }}
            className={`flex-shrink-0 flex items-center justify-center border-2 font-mono font-bold text-sm transition-all
              ${flashId === node.id ? 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/30'
              : i === 0 ? 'bg-green-50 border-green-400 text-green-700'
              : i === Math.min(nodes.length, 8) - 1 ? 'bg-orange-50 border-orange-400 text-orange-700'
              : 'bg-slate-50 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600'}`}>
            {node.val}
          </div>
        ))}
        {nodes.length === 0 && <span className="text-xs text-slate-400 px-6">빈 큐 (empty)</span>}
        <span className="text-slate-300 text-sm px-0.5">→</span>
        <span className="text-[9px] font-bold text-orange-600 whitespace-nowrap">REAR↑<br/>enqueue</span>
      </div>
    </div>
  );

  const llTabs: { key: LLTab; label: string }[] = [
    { key: 'singly', label: '🔗 단방향 연결 리스트' },
    { key: 'stack', label: '📚 스택 (LIFO)' },
    { key: 'queue', label: '🚶 큐 (FIFO)' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
        {llTabs.map(({ key, label }) => (
          <button key={key} onClick={() => { setTab(key); reset(); }}
            className={`flex-1 rounded py-1.5 text-[11px] font-semibold transition
              ${tab === key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Visualization area */}
      <div className="flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 min-h-[100px]">
        {tab === 'singly' && renderSingly()}
        {tab === 'stack' && renderStack()}
        {tab === 'queue' && renderQueue()}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <input value={inputVal} onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => {
            if (e.key !== 'Enter') return;
            if (tab === 'stack') stackPush();
            else if (tab === 'queue') enqueue();
            else prepend();
          }}
          placeholder="값 입력 (Enter)"
          className="w-24 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-mono dark:text-slate-200" />
        {tab === 'singly' && <>
          <button onClick={prepend} className="rounded bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-500 transition">앞 삽입 O(1)</button>
          <button onClick={append}  className="rounded bg-slate-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-500 transition">뒤 삽입 O(n)</button>
          <button onClick={deleteHead} className="rounded bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-400 transition">head 삭제 O(1)</button>
          <button onClick={deleteTail} className="rounded bg-red-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-600 transition">tail 삭제 O(n)</button>
        </>}
        {tab === 'stack' && <>
          <button onClick={stackPush} className="rounded bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-500 transition">push O(1)</button>
          <button onClick={stackPop}  className="rounded bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-400 transition">pop O(1)</button>
        </>}
        {tab === 'queue' && <>
          <button onClick={enqueue} className="rounded bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-orange-400 transition">enqueue O(1)</button>
          <button onClick={dequeue} className="rounded bg-green-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-green-500 transition">dequeue O(1)</button>
        </>}
        <button onClick={reset} className="ml-auto p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Operation log */}
      {log.length > 0 && (
        <div className="space-y-1">
          {log.map((entry, i) => (
            <div key={i} className={`flex flex-wrap gap-1.5 items-center rounded-lg px-2.5 py-1.5 text-xs
              ${i === 0 ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{entry.op}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold
                ${entry.complexity === 'O(1)' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                {entry.complexity}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{entry.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   Main AlgoVisualizer Component
───────────────────────────────────── */

type VisualizerType = 'quicksort' | 'minheap' | 'bst' | 'dijkstra' | 'linkedlist';

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

  if (type === 'linkedlist') return <LinkedListVisualizer />;

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
