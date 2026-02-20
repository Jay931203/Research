'use client';

import { useState, useCallback } from 'react';
import type { StudyTopic } from '../TopicStudyCard';

interface Props { topic: StudyTopic; }

const difficultyLabel = { basic: '기초', intermediate: '중급', advanced: '고급' };
const difficultyColor = {
  basic: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  advanced: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300',
};

function SH({ emoji, title, id }: { emoji: string; title: string; id: string }) {
  return (
    <div id={id} className="flex items-center gap-2 mb-4">
      <span className="text-xl">{emoji}</span>
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

/* ── Fixed 7-node BST ── */
const BST_NODES = [
  { val: 50, x: 190, y: 35 },
  { val: 30, x: 100, y: 87 },
  { val: 70, x: 280, y: 87 },
  { val: 20, x: 55,  y: 139 },
  { val: 40, x: 145, y: 139 },
  { val: 60, x: 235, y: 139 },
  { val: 80, x: 325, y: 139 },
];
const BST_EDGES = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]] as const;

const TRAVERSALS: Record<string, { order: number[]; label: string; note: string }> = {
  '전위': { order: [50,30,20,40,70,60,80], label: 'root → L → R', note: '루트 먼저' },
  '중위': { order: [20,30,40,50,60,70,80], label: 'L → root → R', note: '항상 오름차순 ★' },
  '후위': { order: [20,40,30,60,80,70,50], label: 'L → R → root', note: '루트가 마지막' },
  'BFS':  { order: [50,30,70,20,40,60,80], label: '레벨 순서', note: '큐 사용' },
};

/* ── Fixed BST SVG ── */
function FixedBstSVG({ activeVal }: { activeVal: number | null }) {
  return (
    <svg viewBox="0 0 380 175" className="w-full max-w-sm mx-auto">
      {BST_EDGES.map(([p, c], i) => (
        <line
          key={i}
          x1={BST_NODES[p].x} y1={BST_NODES[p].y}
          x2={BST_NODES[c].x} y2={BST_NODES[c].y}
          stroke="#94a3b8" strokeWidth="1.5"
        />
      ))}
      {BST_NODES.map(({ val, x, y }) => {
        const active = val === activeVal;
        return (
          <g key={val}>
            <circle cx={x} cy={y} r={18} fill={active ? '#3b82f6' : '#e2e8f0'} stroke={active ? '#3b82f6' : '#94a3b8'} strokeWidth="2" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill={active ? 'white' : '#1e293b'}>{val}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Dynamic BST layout ── */
interface BSTNode {
  val: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

function insertBST(root: BSTNode | null, val: number): BSTNode {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) return { ...root, left: insertBST(root.left, val) };
  if (val > root.val) return { ...root, right: insertBST(root.right, val) };
  return root;
}

type LayoutNode = { val: number; x: number; y: number; id: number };
type LayoutEdge = { x1: number; y1: number; x2: number; y2: number };

function layoutBST(root: BSTNode | null): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  let id = 0;
  function traverse(node: BSTNode | null, depth: number, minX: number, maxX: number, parentX: number | null, parentY: number | null) {
    if (!node) return;
    const x = (minX + maxX) / 2;
    const y = 30 + depth * 55;
    const myId = id++;
    nodes.push({ val: node.val, x, y, id: myId });
    if (parentX !== null && parentY !== null) {
      edges.push({ x1: parentX, y1: parentY, x2: x, y2: y });
    }
    traverse(node.left, depth + 1, minX, x, x, y);
    traverse(node.right, depth + 1, x, maxX, x, y);
  }
  traverse(root, 0, 0, 400, null, null);
  return { nodes, edges };
}

function DynBstSVG({ keys, highlightVal }: { keys: number[]; highlightVal: number | null }) {
  let root: BSTNode | null = null;
  for (const k of keys) root = insertBST(root, k);
  if (!root) return <div className="text-center text-slate-400 text-sm py-4">트리가 비어 있습니다</div>;
  const { nodes, edges } = layoutBST(root);
  const maxY = Math.max(...nodes.map(n => n.y), 30);
  return (
    <svg viewBox={`0 0 400 ${maxY + 40}`} className="w-full max-w-sm mx-auto">
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#94a3b8" strokeWidth="1.5" />
      ))}
      {nodes.map(n => {
        const active = n.val === highlightVal;
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={16} fill={active ? '#3b82f6' : '#e2e8f0'} stroke={active ? '#3b82f6' : '#94a3b8'} strokeWidth="2" />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="bold" fill={active ? 'white' : '#1e293b'}>{n.val}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Delete case SVGs ── */
function DeleteCaseSVG({ caseNum }: { caseNum: 1 | 2 | 3 }) {
  if (caseNum === 1) {
    // Before: 50->30->20 (20 is leaf, highlighted red), After: 50->30
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] text-center text-slate-400 mb-1">삭제 전</p>
          <svg viewBox="0 0 200 120" className="w-full">
            <line x1={100} y1={25} x2={55} y2={75} stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1={55} y1={75} x2={30} y2={110} stroke="#94a3b8" strokeWidth="1.5"/>
            {[{x:100,y:25,v:50,red:false},{x:55,y:75,v:30,red:false},{x:30,y:110,v:20,red:true}].map(n=>(
              <g key={n.v}>
                <circle cx={n.x} cy={n.y} r={16} fill={n.red?'#ef4444':'#e2e8f0'} stroke={n.red?'#ef4444':'#94a3b8'} strokeWidth="2"/>
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="bold" fill={n.red?'white':'#1e293b'}>{n.v}</text>
              </g>
            ))}
          </svg>
        </div>
        <div>
          <p className="text-[11px] text-center text-slate-400 mb-1">삭제 후</p>
          <svg viewBox="0 0 200 120" className="w-full">
            <line x1={100} y1={25} x2={55} y2={75} stroke="#94a3b8" strokeWidth="1.5"/>
            {[{x:100,y:25,v:50},{x:55,y:75,v:30}].map(n=>(
              <g key={n.v}>
                <circle cx={n.x} cy={n.y} r={16} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"/>
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="bold" fill="#1e293b">{n.v}</text>
              </g>
            ))}
            <text x={30} y={110} textAnchor="middle" fontSize="18" fill="#94a3b8">✕</text>
          </svg>
        </div>
      </div>
    );
  }
  if (caseNum === 2) {
    // Before: 50->30(red)->20, After: 50->20
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] text-center text-slate-400 mb-1">삭제 전</p>
          <svg viewBox="0 0 200 120" className="w-full">
            <line x1={100} y1={25} x2={70} y2={75} stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1={70} y1={75} x2={40} y2={110} stroke="#94a3b8" strokeWidth="1.5"/>
            {[{x:100,y:25,v:50,red:false},{x:70,y:75,v:30,red:true},{x:40,y:110,v:20,red:false}].map(n=>(
              <g key={n.v}>
                <circle cx={n.x} cy={n.y} r={16} fill={n.red?'#ef4444':'#e2e8f0'} stroke={n.red?'#ef4444':'#94a3b8'} strokeWidth="2"/>
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="bold" fill={n.red?'white':'#1e293b'}>{n.v}</text>
              </g>
            ))}
          </svg>
        </div>
        <div>
          <p className="text-[11px] text-center text-slate-400 mb-1">삭제 후 (자식으로 대체)</p>
          <svg viewBox="0 0 200 120" className="w-full">
            <line x1={100} y1={25} x2={70} y2={75} stroke="#94a3b8" strokeWidth="1.5"/>
            {[{x:100,y:25,v:50},{x:70,y:75,v:20}].map(n=>(
              <g key={n.v}>
                <circle cx={n.x} cy={n.y} r={16} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"/>
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="bold" fill="#1e293b">{n.v}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  }
  // Case 3: two children — find inorder successor
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-[11px] text-center text-slate-400 mb-1">삭제 전 (50 삭제)</p>
        <svg viewBox="0 0 240 160" className="w-full">
          <line x1={120} y1={25} x2={65} y2={75} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={120} y1={25} x2={175} y2={75} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={175} y1={75} x2={145} y2={120} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={175} y1={75} x2={205} y2={120} stroke="#94a3b8" strokeWidth="1.5"/>
          {[
            {x:120,y:25,v:50,col:'#ef4444'},
            {x:65,y:75,v:30,col:'#e2e8f0'},
            {x:175,y:75,v:70,col:'#e2e8f0'},
            {x:145,y:120,v:60,col:'#10b981'},
            {x:205,y:120,v:80,col:'#e2e8f0'},
          ].map(n=>(
            <g key={n.v}>
              <circle cx={n.x} cy={n.y} r={16} fill={n.col} stroke={n.col==='#e2e8f0'?'#94a3b8':n.col} strokeWidth="2"/>
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="bold" fill={n.col==='#e2e8f0'?'#1e293b':'white'}>{n.v}</text>
            </g>
          ))}
          <text x={145} y={143} textAnchor="middle" fontSize="9" fill="#10b981" fontWeight="bold">중위 후계자</text>
        </svg>
      </div>
      <div>
        <p className="text-[11px] text-center text-slate-400 mb-1">삭제 후 (60으로 대체)</p>
        <svg viewBox="0 0 240 160" className="w-full">
          <line x1={120} y1={25} x2={65} y2={75} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={120} y1={25} x2={175} y2={75} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={175} y1={75} x2={205} y2={120} stroke="#94a3b8" strokeWidth="1.5"/>
          {[
            {x:120,y:25,v:60,col:'#10b981'},
            {x:65,y:75,v:30,col:'#e2e8f0'},
            {x:175,y:75,v:70,col:'#e2e8f0'},
            {x:205,y:120,v:80,col:'#e2e8f0'},
          ].map(n=>(
            <g key={n.v}>
              <circle cx={n.x} cy={n.y} r={16} fill={n.col} stroke={n.col==='#e2e8f0'?'#94a3b8':n.col} strokeWidth="2"/>
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="bold" fill={n.col==='#e2e8f0'?'#1e293b':'white'}>{n.v}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function BstContent({ topic }: Props) {
  /* ── Traversal state ── */
  const [activeTraversal, setActiveTraversal] = useState<string>('중위');
  const [travStep, setTravStep] = useState<number>(-1);
  const [travRunning, setTravRunning] = useState(false);

  /* ── Insert simulator state ── */
  const [insertedKeys, setInsertedKeys] = useState<number[]>([50, 30, 70]);
  const [inputVal, setInputVal] = useState('');
  const [insertHighlight, setInsertHighlight] = useState<number | null>(null);
  const [insertError, setInsertError] = useState('');

  /* ── Delete tab state ── */
  const [deleteTab, setDeleteTab] = useState<1 | 2 | 3>(1);

  /* ── Run traversal animation ── */
  const runTraversal = useCallback((key: string) => {
    if (travRunning) return;
    setActiveTraversal(key);
    setTravStep(-1);
    setTravRunning(true);
    const order = TRAVERSALS[key].order;
    let step = 0;
    const tick = () => {
      if (step >= order.length) { setTravRunning(false); return; }
      setTravStep(step);
      step++;
      setTimeout(tick, 500);
    };
    setTimeout(tick, 200);
  }, [travRunning]);

  /* ── BST Insert ── */
  const handleBstInsert = useCallback(() => {
    setInsertError('');
    const num = parseInt(inputVal, 10);
    if (isNaN(num) || num < 1 || num > 999) { setInsertError('1~999 사이 정수를 입력하세요'); return; }
    if (insertedKeys.includes(num)) { setInsertError(`${num} 은 이미 존재합니다`); return; }
    if (insertedKeys.length >= 10) { setInsertError('최대 10개까지 삽입 가능합니다'); return; }
    setInsertedKeys(prev => [...prev, num]);
    setInsertHighlight(num);
    setInputVal('');
    setTimeout(() => setInsertHighlight(null), 1500);
  }, [inputVal, insertedKeys]);

  const currentOrder = TRAVERSALS[activeTraversal].order;
  const currentActiveVal = travStep >= 0 && travStep < currentOrder.length ? currentOrder[travStep] : null;

  const deleteDescs: Record<1 | 2 | 3, { title: string; desc: string; steps: string[] }> = {
    1: {
      title: 'Case 1: 리프 노드 삭제',
      desc: '삭제할 노드가 자식이 없는 경우 — 그냥 제거',
      steps: ['부모 노드의 해당 자식 포인터를 null로 설정', '노드 메모리 해제'],
    },
    2: {
      title: 'Case 2: 자식 1개',
      desc: '삭제할 노드가 자식 1개인 경우 — 자식으로 대체',
      steps: ['삭제 노드의 부모가 삭제 노드의 유일한 자식을 가리키도록 포인터 변경', '노드 메모리 해제'],
    },
    3: {
      title: 'Case 3: 자식 2개 (가장 복잡)',
      desc: '삭제할 노드의 중위 후계자(inorder successor)로 대체 — 오른쪽 서브트리의 최솟값',
      steps: [
        '오른쪽 서브트리에서 최솟값(중위 후계자) 탐색',
        '삭제 노드의 값을 중위 후계자 값으로 덮어쓰기',
        '중위 후계자를 재귀적으로 삭제 (Case 1 또는 Case 2로 귀결)',
      ],
    },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 px-6 py-6">
      {/* Hero */}
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <span className="text-5xl leading-none">{topic.icon}</span>
          {topic.studyOrder != null && (
            <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow">
              {topic.studyOrder}
            </span>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${difficultyColor[topic.difficulty]}`}>
              {difficultyLabel[topic.difficulty]}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`h-3.5 w-3.5 ${i < topic.examFrequency ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-[10px] text-slate-400">출제빈도</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{topic.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{topic.titleEn}</p>
          {topic.summary && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{topic.summary}</p>
          )}
        </div>
      </div>

      {/* 1. BST 속성 */}
      <section>
        <SH emoji="📖" title="BST 속성" id={`${topic.id}-sec-property`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            어떤 노드 N에 대해, N의 왼쪽 서브트리의 모든 값 &lt; N &lt; N의 오른쪽 서브트리의 모든 값. 이진 탐색(Binary Search)을 트리 구조로 구현한 것 — 탐색할 때 매 단계에서 절반을 버릴 수 있어 O(log n) 기대 성능.
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10 p-3 mb-4">
          <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">BST의 약점 — 시험 포인트</p>
          <ul className="space-y-1">
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 삽입 순서에 따라 트리가 편향(Skewed)될 수 있음</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 1,2,3,4,5 순으로 삽입 &rarr; 오른쪽으로만 뻗는 선형 구조 &rarr; O(n) 탐색</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 이를 해결하기 위해 균형 트리(AVL, Red-Black Tree) 등장</li>
          </ul>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 dark:border-violet-800/40 dark:bg-violet-950/20 p-4 mb-5">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-3 uppercase tracking-wide">BST 핵심 속성</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            {[
              { label: '왼쪽 서브트리', desc: '모든 키 < 루트', color: 'text-blue-700 dark:text-blue-300' },
              { label: '오른쪽 서브트리', desc: '모든 키 > 루트', color: 'text-emerald-700 dark:text-emerald-300' },
              { label: '재귀적 적용', desc: '모든 서브트리에 동일 속성', color: 'text-amber-700 dark:text-amber-300' },
            ].map(p => (
              <div key={p.label} className="rounded-lg bg-white dark:bg-slate-800 p-3 shadow-sm">
                <div className={`font-bold text-sm ${p.color}`}>{p.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 mb-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">BST 탐색 알고리즘</p>
          <ol className="space-y-2 mb-3">
            {[
              '루트에서 시작',
              '찾는 값 < 현재 노드 → 왼쪽 자식으로',
              '찾는 값 > 현재 노드 → 오른쪽 자식으로',
              '찾는 값 == 현재 노드 → 탐색 성공',
              'null 도달 → 탐색 실패',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 rounded px-3 py-2">
              예: 위 트리(루트=50)에서 60 탐색: 50(루트) → 70 → 60 (2번 비교로 발견)
            </p>
            <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 rounded px-3 py-2">
              예: 40 탐색: 50 → 30 → 40 (2번 비교로 발견)
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">BST 최악 케이스 (편향 트리)</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            1, 2, 3, 4, 5 순서로 삽입하면 오른쪽으로만 뻗는 선형 구조가 된다. 탐색이 O(n)으로 저하.
            이를 막기 위해 <span className="font-bold">AVL Tree</span>(높이차 ≤1 유지, rotation으로 균형)와{' '}
            <span className="font-bold">Red-Black Tree</span>(색깔 규칙으로 균형 유지) 등 균형 BST가 등장했다.
          </p>
        </div>
        <ul className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
          {[
            '중위 순회(Inorder)는 항상 오름차순 — 이 성질로 정렬된 출력 가능',
            '탐색: 비교할 때마다 탐색 공간이 절반 → 평균 O(log n), 최악(편향 트리) O(n)',
            '중복 키 처리 방법: 왼쪽에 두거나, 오른쪽에 두거나, 카운트 필드 — 정책을 통일해야 함',
            'BST는 자기 균형을 보장하지 않음 → AVL, Red-Black Tree로 보완',
          ].map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />{pt}
            </li>
          ))}
        </ul>
      </section>

      {/* 2. 순회 시각화 */}
      <section>
        <SH emoji="🔄" title="4가지 순회 인터랙티브 시각화" id={`${topic.id}-sec-traversal`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">순회 4종의 활용</p>
          <ul className="space-y-1.5 text-sm text-amber-700 dark:text-amber-400">
            <li>&bull; <span className="font-bold">중위순회(In-order)</span>: BST에서 중위순회 = 오름차순 정렬된 출력! (가장 중요)</li>
            <li>&bull; <span className="font-bold">전위순회(Pre-order)</span>: 트리 복사/직렬화에 사용 (루트 먼저)</li>
            <li>&bull; <span className="font-bold">후위순회(Post-order)</span>: 폴더 삭제처럼 자식 먼저 처리 (루트 마지막)</li>
            <li>&bull; <span className="font-bold">레벨순회(Level-order)</span>: BFS, 레벨별 처리</li>
          </ul>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10 p-3 mb-4">
          <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">시험 포인트</p>
          <ul className="space-y-1">
            <li className="text-sm text-red-700 dark:text-red-300">&bull; &quot;BST 중위순회 = 정렬된 배열&quot; - 이 성질이 자주 출제됨</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(TRAVERSALS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => runTraversal(key)}
                disabled={travRunning}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 ${
                  activeTraversal === key
                    ? 'bg-blue-600 text-white shadow'
                    : 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {key}
                <span className="ml-1.5 text-[10px] opacity-70">{val.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 mb-4">
            <FixedBstSVG activeVal={currentActiveVal} />
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                {activeTraversal} 순회 결과
                <span className="ml-2 text-blue-500">{TRAVERSALS[activeTraversal].note}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TRAVERSALS[activeTraversal].order.map((val, i) => (
                  <div key={i} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-bold transition-all ${
                    i < travStep ? 'bg-blue-600 text-white shadow'
                    : i === travStep ? 'bg-blue-400 text-white shadow-lg scale-110'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    <span className="text-[10px] opacity-60">{i + 1}.</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            {travRunning && (
              <span className="text-xs text-blue-500 animate-pulse font-bold">순회 중...</span>
            )}
          </div>
        </div>
      </section>

      {/* 3. BST 삽입 시뮬레이터 */}
      <section>
        <SH emoji="➕" title="BST 삽입 시뮬레이터" id={`${topic.id}-sec-insert`} />
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="number"
              value={inputVal}
              onChange={e => { setInputVal(e.target.value); setInsertError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleBstInsert(); }}
              placeholder="정수 입력 (1~999)"
              className="flex-1 min-w-0 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleBstInsert}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
            >
              삽입
            </button>
            <button
              onClick={() => { setInsertedKeys([50]); setInsertHighlight(null); setInsertError(''); setInputVal(''); }}
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              초기화
            </button>
          </div>
          {insertError && <p className="text-xs text-red-500 mb-3">{insertError}</p>}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {insertedKeys.map((k, i) => (
              <span key={i} className={`rounded-full px-2.5 py-1 text-xs font-bold font-mono ${
                k === insertHighlight ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>{k}</span>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <DynBstSVG keys={insertedKeys} highlightVal={insertHighlight} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            삽입 순서: {insertedKeys.join(' → ')}
          </p>
        </div>
      </section>

      {/* 4. 삭제 3케이스 */}
      <section>
        <SH emoji="✂️" title="삭제 3케이스" id={`${topic.id}-sec-delete`} />
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {([1, 2, 3] as const).map(n => (
              <button
                key={n}
                onClick={() => setDeleteTab(n)}
                className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
                  deleteTab === n
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Case {n}
              </button>
            ))}
          </div>
          <div className="p-5 bg-white dark:bg-slate-800">
            <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{deleteDescs[deleteTab].title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{deleteDescs[deleteTab].desc}</p>
            <DeleteCaseSVG caseNum={deleteTab} />
            <ol className="mt-4 space-y-1.5">
              {deleteDescs[deleteTab].steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-black">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 5. Red-Black Tree */}
      <section>
        <SH emoji="🔴" title="Red-Black Tree 5속성 + 복잡도" id={`${topic.id}-sec-rbtree`} />
        <div className="grid grid-cols-1 gap-3 mb-5">
          {[
            { num: 1, title: '모든 노드는 Red 또는 Black', detail: '이진 색상(binary coloring)' },
            { num: 2, title: '루트 노드는 Black', detail: '루트는 항상 Black' },
            { num: 3, title: '모든 리프(NIL)는 Black', detail: 'NULL 포인터를 Black 리프로 취급' },
            { num: 4, title: 'Red 노드의 자식은 반드시 Black', detail: '연속된 Red 불가 — "Red 부모-Red 자식" 없음' },
            { num: 5, title: '루트에서 임의 리프까지 Black 노드 수 동일', detail: 'Black-Height 일정 — 균형 보장 핵심' },
          ].map(r => (
            <div key={r.num} className="flex gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-white text-xs font-black">{r.num}</span>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{r.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="px-4 py-2.5 text-left font-bold text-slate-700 dark:text-slate-300">연산</th>
                <th className="px-4 py-2.5 text-center font-bold text-slate-700 dark:text-slate-300">평균</th>
                <th className="px-4 py-2.5 text-center font-bold text-slate-700 dark:text-slate-300">최악</th>
                <th className="px-4 py-2.5 text-left text-slate-700 dark:text-slate-300 text-xs hidden sm:table-cell">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                { op: '탐색', avg: 'O(log n)', worst: 'O(log n)', note: '균형 보장' },
                { op: '삽입', avg: 'O(log n)', worst: 'O(log n)', note: 'Recolor + Rotation' },
                { op: '삭제', avg: 'O(log n)', worst: 'O(log n)', note: '복잡한 케이스 처리' },
                { op: 'BST 탐색 (무균형)', avg: 'O(log n)', worst: 'O(n)', note: '편향 트리 최악' },
              ].map(row => (
                <tr key={row.op} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">{row.op}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">{row.avg}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs font-bold text-amber-700 dark:text-amber-300">{row.worst}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/10 space-y-2">
          {[
            '일반 BST는 삽입 순서에 따라 O(n) 최악 — 정렬된 데이터 삽입 시 편향 트리',
            'AVL 트리 vs RB 트리: AVL은 더 엄격한 균형 → 탐색 빠름, RB는 삽입/삭제 빠름',
            '중위 순회 = 오름차순 출력 — 이 성질이 BST의 핵심, 시험 단골 문제',
            'Case 3 삭제 시 중위 전임자(inorder predecessor, 왼쪽 최댓값) 사용도 가능',
          ].map((p, i) => (
            <p key={i} className="flex gap-2 text-sm text-red-700 dark:text-red-300"><span>⚠</span>{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
