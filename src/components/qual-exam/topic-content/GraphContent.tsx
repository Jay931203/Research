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

/* ── BFS/DFS graph ── */
const BFS_NODES = ['A','B','C','D','E','F'];
const BFS_EDGES: Array<[number,number]> = [[0,1],[0,2],[1,3],[1,4],[2,5]];
const BFS_POS = [
  { x: 200, y: 40  },  // A
  { x: 100, y: 120 },  // B
  { x: 300, y: 120 },  // C
  { x: 40,  y: 210 },  // D
  { x: 160, y: 210 },  // E
  { x: 360, y: 210 },  // F
];
const BFS_ORDER  = [0,1,2,3,4,5]; // A B C D E F
const DFS_ORDER  = [0,1,3,4,2,5]; // A B D E C F

/* ── Dijkstra graph ── */
type DijkEdge = { from: string; to: string; w: number };
const DIJ_NODES = ['A','B','C','D','E','F','G'];
const DIJ_EDGES: DijkEdge[] = [
  { from:'A',to:'B',w:4 },{ from:'A',to:'G',w:1 },{ from:'A',to:'F',w:5 },
  { from:'B',to:'C',w:3 },{ from:'G',to:'C',w:9 },{ from:'G',to:'F',w:7 },
  { from:'G',to:'E',w:12},{ from:'C',to:'D',w:2 },{ from:'D',to:'E',w:1 },
];
const DIJ_POS: Record<string,{ x:number;y:number }> = {
  A:{ x:190,y:120 }, B:{ x:310,y:80 }, C:{ x:380,y:160 },
  D:{ x:340,y:260 }, E:{ x:220,y:280 }, F:{ x:70,y:160 }, G:{ x:80,y:60 },
};

type DijStep = {
  visit: string;
  dist: Record<string,number>;
  prev: Record<string,string|null>;
  relaxed: Array<[string,string]>;
  note: string;
};

const INF = 9999;
const DIJ_STEPS: DijStep[] = [
  {
    visit: 'D', note: '시작: D 방문. dist[D]=0, 나머지=∞',
    dist: {A:INF,B:INF,C:2,D:0,E:1,F:INF,G:INF},
    prev: {A:null,B:null,C:'D',D:null,E:'D',F:null,G:null},
    relaxed: [['D','C'],['D','E']],
  },
  {
    visit: 'E', note: 'E(1) 방문. D-E=1. G relaxed: 1+12=13',
    dist: {A:INF,B:INF,C:2,D:0,E:1,F:INF,G:13},
    prev: {A:null,B:null,C:'D',D:null,E:'D',F:null,G:'E'},
    relaxed: [['E','G']],
  },
  {
    visit: 'C', note: 'C(2) 방문. B relaxed: 2+3=5. G 비교: 2+9=11 < 13 → update',
    dist: {A:INF,B:5,C:2,D:0,E:1,F:INF,G:11},
    prev: {A:null,B:'C',C:'D',D:null,E:'D',F:null,G:'C'},
    relaxed: [['C','B'],['C','G']],
  },
  {
    visit: 'B', note: 'B(5) 방문. A relaxed: 5+4=9',
    dist: {A:9,B:5,C:2,D:0,E:1,F:INF,G:11},
    prev: {A:'B',B:'C',C:'D',D:null,E:'D',F:null,G:'C'},
    relaxed: [['B','A']],
  },
  {
    visit: 'A', note: 'A(9) 방문. G 비교: 9+1=10 < 11 → update. F relaxed: 9+5=14',
    dist: {A:9,B:5,C:2,D:0,E:1,F:14,G:10},
    prev: {A:'B',B:'C',C:'D',D:null,E:'D',F:'A',G:'A'},
    relaxed: [['A','G'],['A','F']],
  },
  {
    visit: 'G', note: 'G(10) 방문. F 비교: 10+7=17 > 14 → 유지',
    dist: {A:9,B:5,C:2,D:0,E:1,F:14,G:10},
    prev: {A:'B',B:'C',C:'D',D:null,E:'D',F:'A',G:'A'},
    relaxed: [],
  },
  {
    visit: 'F', note: 'F(14) 방문. 모든 노드 처리 완료!',
    dist: {A:9,B:5,C:2,D:0,E:1,F:14,G:10},
    prev: {A:'B',B:'C',C:'D',D:null,E:'D',F:'A',G:'A'},
    relaxed: [],
  },
];

/* ── MST Kruskal steps ── */
type MstEdge = { u: string; v: string; w: number; included: boolean };
const MST_EDGES_SORTED: MstEdge[] = [
  { u:'A',v:'B',w:1,included:true  },
  { u:'B',v:'C',w:2,included:true  },
  { u:'A',v:'C',w:3,included:false },
  { u:'C',v:'D',w:4,included:true  },
  { u:'B',v:'D',w:5,included:false },
];
const MST_NODES_POS: Record<string,{x:number;y:number}> = {
  A:{x:80,y:80}, B:{x:220,y:40}, C:{x:320,y:140}, D:{x:200,y:200},
};

export default function GraphContent({ topic }: Props) {
  /* BFS/DFS state */
  const [traversalMode, setTraversalMode] = useState<'bfs'|'dfs'|null>(null);
  const [visitedIdx, setVisitedIdx] = useState<number[]>([]);
  const [traversedEdges, setTraversedEdges] = useState<Array<[number,number]>>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  /* Dijkstra state */
  const [dijStep, setDijStep] = useState(0);

  /* MST state */
  const [mstStep, setMstStep] = useState(0);

  /* BFS/DFS animation */
  const runTraversal = useCallback((mode: 'bfs'|'dfs') => {
    if (isRunning) return;
    setIsRunning(true);
    setTraversalMode(mode);
    setVisitedIdx([]);
    setTraversedEdges([]);
    setQueue([]);

    const order = mode === 'bfs' ? BFS_ORDER : DFS_ORDER;
    const delays = order.map((_, i) => i * 650);

    // Build edge set for coloring
    const edgesVisited: Array<[number,number]> = [];
    order.forEach((nodeIdx, step) => {
      setTimeout(() => {
        setVisitedIdx(prev => [...prev, nodeIdx]);
        // Find which edge was traversed
        if (step > 0) {
          const prevNode = order[step-1];
          const directEdge = BFS_EDGES.find(([a,b]) => (a===prevNode&&b===nodeIdx)||(b===prevNode&&a===nodeIdx));
          if (directEdge) {
            edgesVisited.push(directEdge);
            setTraversedEdges([...edgesVisited]);
          } else {
            // Find any visited ancestor edge
            for (let k = step-1; k >= 0; k--) {
              const ancestor = order[k];
              const e = BFS_EDGES.find(([a,b]) => (a===ancestor&&b===nodeIdx)||(b===ancestor&&a===nodeIdx));
              if (e) { edgesVisited.push(e); setTraversedEdges([...edgesVisited]); break; }
            }
          }
        }
        // Update queue/stack display
        const remaining = order.slice(step+1).map(i => BFS_NODES[i]);
        setQueue(remaining);
        if (step === order.length-1) setIsRunning(false);
      }, delays[step]);
    });
  }, [isRunning]);

  const resetTraversal = useCallback(() => {
    setVisitedIdx([]); setTraversedEdges([]); setQueue([]); setTraversalMode(null); setIsRunning(false);
  }, []);

  const dijs = DIJ_STEPS[Math.min(dijStep, DIJ_STEPS.length-1)];
  const mstEdge = MST_EDGES_SORTED[Math.min(mstStep, MST_EDGES_SORTED.length-1)];

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

      {/* 1. BFS vs DFS */}
      <section>
        <SH emoji="🔍" title="BFS vs DFS 인터랙티브 시각화" id={`${topic.id}-sec-bfsdfs`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어 — BFS vs DFS</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            어떤 자료구조를 쓰는가가 핵심 차이: BFS는 Queue(선입선출) → 가까운 노드부터 방문, DFS는 Stack(후입선출, 재귀 스택) → 깊이 먼저.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1.5">직관적으로 이해하기</p>
          <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
            <li>&bull; <span className="font-bold">BFS</span> = 수면에 돌 던지기: 출발점에서 동심원을 그리며 레벨 by 레벨 탐색</li>
            <li>&bull; <span className="font-bold">DFS</span> = 미로 찾기: 한 방향으로 끝까지 가다가 막히면 되돌아와 다른 길 시도</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 mb-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">언제 무엇을?</p>
          <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
            <li>&bull; <span className="font-semibold text-blue-600 dark:text-blue-400">BFS</span>: 최단 경로(비가중), 레벨 탐색, 최소 이동 횟수</li>
            <li>&bull; <span className="font-semibold text-emerald-600 dark:text-emerald-400">DFS</span>: 사이클 감지, 위상 정렬, 연결 요소, 백트래킹 문제</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="flex flex-wrap gap-3 mb-4">
            <button onClick={() => runTraversal('bfs')} disabled={isRunning}
              className="px-4 py-1.5 rounded-lg text-sm font-bold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">
              BFS 실행 (너비 우선)
            </button>
            <button onClick={() => runTraversal('dfs')} disabled={isRunning}
              className="px-4 py-1.5 rounded-lg text-sm font-bold bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-500 transition">
              DFS 실행 (깊이 우선)
            </button>
            <button onClick={resetTraversal} disabled={isRunning}
              className="px-4 py-1.5 rounded-lg text-sm font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition">
              초기화
            </button>
            {traversalMode && (
              <span className={`self-center text-xs font-bold rounded-full px-2.5 py-0.5 ${traversalMode==='bfs' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                {traversalMode.toUpperCase()} — 방문 순서: {visitedIdx.map(i => BFS_NODES[i]).join(' → ')}
              </span>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {/* SVG Graph */}
            <div className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2">
              <svg viewBox="0 0 400 260" className="w-full max-w-sm mx-auto">
                {BFS_EDGES.map(([a,b], i) => {
                  const isTraversed = traversedEdges.some(([ta,tb]) => (ta===a&&tb===b)||(ta===b&&tb===a));
                  return (
                    <line key={i}
                      x1={BFS_POS[a].x} y1={BFS_POS[a].y}
                      x2={BFS_POS[b].x} y2={BFS_POS[b].y}
                      stroke={isTraversed ? (traversalMode==='bfs' ? '#3b82f6' : '#10b981') : '#94a3b8'}
                      strokeWidth={isTraversed ? 2.5 : 1.5}
                    />
                  );
                })}
                {BFS_NODES.map((label, i) => {
                  const visited = visitedIdx.includes(i);
                  const isCurrent = visitedIdx[visitedIdx.length-1] === i;
                  const fill = isCurrent ? '#f59e0b' : visited ? (traversalMode==='bfs' ? '#3b82f6' : '#10b981') : '#e2e8f0';
                  const textFill = visited ? 'white' : '#1e293b';
                  return (
                    <g key={i}>
                      <circle cx={BFS_POS[i].x} cy={BFS_POS[i].y} r={20} fill={fill} stroke={fill === '#e2e8f0' ? '#94a3b8' : fill} strokeWidth="2" />
                      <text x={BFS_POS[i].x} y={BFS_POS[i].y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="bold" fill={textFill}>{label}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            {/* Queue/Stack display */}
            <div className="w-full md:w-48">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                {traversalMode === 'bfs' ? '큐 (Queue)' : traversalMode === 'dfs' ? '스택 (Stack)' : '대기열'}
              </p>
              <div className="space-y-1.5 min-h-20">
                {queue.length === 0 && !isRunning && traversalMode && (
                  <p className="text-xs text-slate-400 italic">완료!</p>
                )}
                {queue.map((n, i) => (
                  <div key={i} className={`rounded px-2 py-1 text-xs font-bold text-center ${traversalMode==='bfs' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'}`}>
                    {n}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs space-y-1.5">
                {[
                  { label:'BFS 결과', val:'A→B→C→D→E→F', color:'text-blue-600 dark:text-blue-400' },
                  { label:'DFS 결과', val:'A→B→D→E→C→F', color:'text-emerald-600 dark:text-emerald-400' },
                ].map(r => (
                  <div key={r.label}>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">{r.label}</p>
                    <p className={`font-mono font-bold ${r.color}`}>{r.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Dijkstra */}
      <section>
        <SH emoji="🗺" title="Dijkstra 단계별 추적 (시작: D)" id={`${topic.id}-sec-dijkstra`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            &quot;지금까지 알려진 최단 거리가 확정된 노드부터 처리&quot;. Greedy가 성립하는 이유: 음수 간선이 없으면, 최단 거리가 확정된 노드를 통해 거리가 더 나빠질 수 없다.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1.5">직관적으로 이해하기</p>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            서울에서 전국으로 퍼지는 KTX 노선 - 가장 가까운 도시부터 확정하고, 그 도시를 경유해 더 먼 도시의 거리를 업데이트 (릴렉스, Relaxation: dist[v] &gt; dist[u] + w(u,v)이면 갱신).
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10 p-3 mb-4">
          <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">시험 포인트</p>
          <ul className="space-y-1">
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 음수 간선 있으면 Dijkstra 실패! &rarr; Bellman-Ford 사용</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 시간 복잡도: O((V+E) log V) with min-heap</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* SVG */}
            <div className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2">
              <svg viewBox="0 0 460 320" className="w-full">
                {DIJ_EDGES.map((e, i) => {
                  const isRelaxed = dijs.relaxed.some(([a,b]) => (a===e.from&&b===e.to)||(a===e.to&&b===e.from));
                  const inTree = DIJ_STEPS.slice(0, dijStep+1).some(s => s.relaxed.some(([a,b]) => (a===e.from&&b===e.to)||(a===e.to&&b===e.from)));
                  const p1 = DIJ_POS[e.from], p2 = DIJ_POS[e.to];
                  const mx = (p1.x+p2.x)/2, my = (p1.y+p2.y)/2;
                  return (
                    <g key={i}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                        stroke={isRelaxed ? '#f59e0b' : inTree ? '#3b82f6' : '#94a3b8'}
                        strokeWidth={isRelaxed ? 3 : inTree ? 2 : 1.5} />
                      <text x={mx} y={my-5} textAnchor="middle" fontSize="10" fontWeight="bold"
                        fill={isRelaxed ? '#d97706' : '#64748b'}>{e.w}</text>
                    </g>
                  );
                })}
                {DIJ_NODES.map(label => {
                  const p = DIJ_POS[label];
                  const isCurrent = dijs.visit === label;
                  const visited = DIJ_STEPS.slice(0, dijStep+1).map(s => s.visit).includes(label);
                  const d = dijs.dist[label];
                  const fill = isCurrent ? '#f59e0b' : visited ? '#3b82f6' : '#e2e8f0';
                  const textFill = (isCurrent || visited) ? 'white' : '#1e293b';
                  return (
                    <g key={label}>
                      <circle cx={p.x} cy={p.y} r={22} fill={fill} stroke={fill==='#e2e8f0'?'#94a3b8':fill} strokeWidth="2" />
                      <text x={p.x} y={p.y-3} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill={textFill}>{label}</text>
                      <text x={p.x} y={p.y+11} textAnchor="middle" fontSize="9" fill={textFill} fontWeight="bold">
                        {d === INF ? '∞' : String(d)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            {/* Dist table + step info */}
            <div className="w-full md:w-52 space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">dist[] 테이블</p>
                <div className="space-y-1">
                  {DIJ_NODES.map(node => {
                    const d = dijs.dist[node];
                    const isCurrent = dijs.visit === node;
                    const visited = DIJ_STEPS.slice(0, dijStep+1).map(s => s.visit).includes(node);
                    return (
                      <div key={node} className={`flex items-center justify-between rounded px-2 py-1 text-xs ${isCurrent ? 'bg-amber-100 dark:bg-amber-900/40 font-bold' : visited ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <span className="font-bold">{node}</span>
                        <span className={`font-mono font-black ${d===INF ? 'text-slate-400' : 'text-blue-700 dark:text-blue-300'}`}>{d===INF ? '∞' : d}</span>
                        {dijs.prev[node] && <span className="text-slate-400 text-[10px]">← {dijs.prev[node]}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">단계 {dijStep+1}/{DIJ_STEPS.length}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{dijs.note}</p>
              </div>
            </div>
          </div>
          {/* Nav */}
          <div className="flex items-center justify-between gap-2 mt-4">
            <button onClick={() => setDijStep(s => Math.max(0, s-1))} disabled={dijStep===0}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">◀ 이전</button>
            <span className="text-xs text-slate-500">단계 {dijStep+1} / {DIJ_STEPS.length}</span>
            <button onClick={() => setDijStep(s => Math.min(DIJ_STEPS.length-1, s+1))} disabled={dijStep===DIJ_STEPS.length-1}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">다음 ▶</button>
          </div>
        </div>
      </section>

      {/* 3. Bellman-Ford */}
      <section>
        <SH emoji="🔄" title="Bellman-Ford 알고리즘" id={`${topic.id}-sec-bellman`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어 — 왜 Bellman-Ford가 필요한가?</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            Dijkstra는 음수 간선에서 틀린 답을 내지만, Bellman-Ford는 정확히 처리한다. 모든 간선을 V-1번 반복 릴렉스하면 최단 경로 확정. 왜 V-1번? 최단 경로는 사이클이 없으므로 최대 V-1개의 간선 포함. 음수 사이클 감지: V번째 반복에서도 업데이트 발생하면 음수 사이클 존재.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">의사 코드</p>
            <div className="relative rounded-xl bg-slate-950 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-2 text-[11px] font-mono text-slate-500">Bellman-Ford</span>
              </div>
              <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-200 font-mono">{`BellmanFord(G, s):
  dist[v] = ∞  (모든 v)
  dist[s] = 0

  repeat |V|-1 times:
    for each edge (u,v,w):
      if dist[u]+w < dist[v]:
        dist[v] = dist[u]+w  // relax

  // 음수 사이클 검사
  for each edge (u,v,w):
    if dist[u]+w < dist[v]:
      return "음수 사이클 존재!"`}</pre>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Dijkstra vs Bellman-Ford</p>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="px-3 py-2 text-left text-slate-600 dark:text-slate-300">항목</th>
                    <th className="px-3 py-2 text-center text-blue-600 dark:text-blue-400">Dijkstra</th>
                    <th className="px-3 py-2 text-center text-violet-600 dark:text-violet-400">Bellman-Ford</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {[
                    ['시간 복잡도', 'O((V+E)logV)', 'O(VE)'],
                    ['음수 간선', '❌ 불가', '✅ 가능'],
                    ['음수 사이클', '탐지 불가', '탐지 가능'],
                    ['동작 방식', '그리디 (Greedy)', '동적 프로그래밍'],
                    ['적합한 그래프', '가중치 ≥ 0', '모든 가중치'],
                  ].map(([item, d, b]) => (
                    <tr key={item} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">{item}</td>
                      <td className="px-3 py-2 text-center font-mono text-blue-600 dark:text-blue-400">{d}</td>
                      <td className="px-3 py-2 text-center font-mono text-violet-600 dark:text-violet-400">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">음수 간선에서 Dijkstra가 실패하는 이유</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Dijkstra는 방문한 노드의 dist가 최종값이라고 가정. 음수 간선이 있으면 나중에 더 짧은 경로가 발견될 수 있어 이 가정이 깨짐.
            예: A→B=3, A→C=4, C→B=-2 → Dijkstra는 dist[B]=3으로 확정하지만, 실제 최단은 A→C→B=2.
          </p>
        </div>
      </section>

      {/* 4. MST */}
      <section>
        <SH emoji="🌲" title="MST — Kruskal & Prim" id={`${topic.id}-sec-mst`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            신장 트리(Spanning Tree): 그래프의 모든 V개 노드를 V-1개의 간선으로 연결한 트리 (사이클 없음). 최소 신장 트리(MST): 모든 신장 트리 중 간선 가중치 합이 최소인 것. 현실 예: 도시들을 최소 비용 도로로 연결.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1.5">Kruskal vs Prim</p>
          <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
            <li>&bull; <span className="font-bold">Kruskal</span>: 간선을 가중치 순 정렬 후 사이클 없으면 추가 (Union-Find 사용) &rarr; 희소 그래프(sparse)에 유리</li>
            <li>&bull; <span className="font-bold">Prim</span>: 현재 트리에서 가장 가중치 작은 간선으로 확장 (Dijkstra와 유사) &rarr; 밀집 그래프(dense)에 유리</li>
          </ul>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10 p-3 mb-4">
          <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">시험 포인트</p>
          <ul className="space-y-1">
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 두 알고리즘 모두 같은 MST를 구하지만 접근 방식이 다름 (기출에 자주 나옴)</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; MST는 유일하지 않을 수 있음 — 동일 가중치 간선이 여러 개면 여러 MST 존재</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="flex flex-col md:flex-row gap-5">
            {/* MST SVG */}
            <div className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">그래프 (4 노드 5 간선)</p>
              <svg viewBox="0 0 400 260" className="w-full max-w-xs mx-auto">
                {MST_EDGES_SORTED.map((e, i) => {
                  const p1 = MST_NODES_POS[e.u], p2 = MST_NODES_POS[e.v];
                  const mx = (p1.x+p2.x)/2, my = (p1.y+p2.y)/2;
                  const isShown = i <= mstStep;
                  const isIncluded = isShown && e.included;
                  const isRejected = isShown && !e.included;
                  return (
                    <g key={i}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                        stroke={isIncluded ? '#10b981' : isRejected ? '#ef4444' : '#cbd5e1'}
                        strokeWidth={isIncluded ? 3 : 1.5}
                        strokeDasharray={isRejected ? '4 3' : undefined} />
                      <text x={mx} y={my-6} textAnchor="middle" fontSize="11" fontWeight="bold"
                        fill={isIncluded ? '#059669' : isRejected ? '#dc2626' : '#94a3b8'}>{e.w}</text>
                    </g>
                  );
                })}
                {Object.entries(MST_NODES_POS).map(([label, p]) => (
                  <g key={label}>
                    <circle cx={p.x} cy={p.y} r={20} fill="#3b82f6" stroke="#2563eb" strokeWidth="2" />
                    <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="bold" fill="white">{label}</text>
                  </g>
                ))}
              </svg>
            </div>
            {/* Kruskal steps */}
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Kruskal — 간선 정렬 후 사이클 없으면 추가</p>
              <div className="space-y-1.5 mb-3">
                {MST_EDGES_SORTED.map((e, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all ${i === mstStep ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-900/20' : i < mstStep ? (e.included ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-red-50 dark:bg-red-900/10 opacity-60') : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">w={e.w}</span>
                    <span className="text-slate-500 dark:text-slate-400">{e.u}—{e.v}</span>
                    {i < mstStep && (
                      <span className={`ml-auto font-bold ${e.included ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {e.included ? '✓ 포함' : '✗ 사이클'}
                      </span>
                    )}
                    {i === mstStep && <span className="ml-auto text-amber-600 dark:text-amber-400 font-bold">← 현재</span>}
                  </div>
                ))}
              </div>
              {/* Nav */}
              <div className="flex items-center justify-between gap-2">
                <button onClick={() => setMstStep(s => Math.max(0,s-1))} disabled={mstStep===0}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">◀ 이전</button>
                <span className="text-xs text-slate-500">간선 {mstStep+1}/{MST_EDGES_SORTED.length}</span>
                <button onClick={() => setMstStep(s => Math.min(MST_EDGES_SORTED.length-1,s+1))} disabled={mstStep===MST_EDGES_SORTED.length-1}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">다음 ▶</button>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            {[
              { name: 'Kruskal', cx: 'O(E log E)', note: '간선 정렬 + Union-Find. 희소 그래프에 유리' },
              { name: 'Prim', cx: 'O(E log V)', note: '우선순위 큐. 밀집 그래프에 유리. Dijkstra와 유사' },
            ].map(a => (
              <div key={a.name} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{a.name}</p>
                <p className="font-mono font-black text-blue-600 dark:text-blue-400 text-base mb-1">{a.cx}</p>
                <p className="text-slate-500 dark:text-slate-400">{a.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 복잡도 표 + 함정 */}
      <section>
        <SH emoji="⏱" title="복잡도 요약 + 시험 함정" id={`${topic.id}-sec-complexity`} />
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                {['알고리즘','시간 복잡도','공간','특이사항'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                { alg:'BFS',         cx:'O(V+E)',         sp:'O(V)', note:'최단경로(비가중치), 레벨 순회' },
                { alg:'DFS',         cx:'O(V+E)',         sp:'O(V)', note:'위상정렬, SCC, 사이클 검출' },
                { alg:'Dijkstra',    cx:'O((V+E)log V)',  sp:'O(V)', note:'비음수 가중치만, 그리디' },
                { alg:'Bellman-Ford',cx:'O(VE)',          sp:'O(V)', note:'음수 간선 가능, 음수 사이클 탐지' },
                { alg:'Prim',        cx:'O(E log V)',     sp:'O(V)', note:'MST, 밀집 그래프' },
                { alg:'Kruskal',     cx:'O(E log E)',     sp:'O(V)', note:'MST, Union-Find 필요' },
                { alg:'Floyd-Warshall', cx:'O(V³)',       sp:'O(V²)',note:'모든 쌍 최단경로' },
              ].map(r => (
                <tr key={r.alg} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200">{r.alg}</td>
                  <td className="px-3 py-2.5"><span className="rounded px-1.5 py-0.5 text-xs font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{r.cx}</span></td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">{r.sp}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/10 space-y-2">
          {[
            'BFS/DFS 시간 복잡도는 O(V+E) — adjacency matrix이면 O(V²)',
            'Dijkstra는 음수 간선에서 틀린 결과를 낼 수 있음 (음수 사이클은 물론, 음수 간선 자체도 위험)',
            'MST는 유일하지 않을 수 있음 — 동일 가중치 간선이 여러 개면 여러 MST 존재',
            'Floyd-Warshall은 O(V³) — V가 크면 매우 느림. 음수 사이클 탐지는 대각선 dp[i][i] < 0 확인',
          ].map((p, i) => (
            <p key={i} className="flex gap-2 text-sm text-red-700 dark:text-red-300"><span>⚠</span>{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
