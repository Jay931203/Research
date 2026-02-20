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

/* ── Huffman build steps ── */
type HeapPill = { label: string; freq: number; color: string };
type HuffStep = {
  heap: HeapPill[];
  action: string;
  treeDesc: string;
  svgData: {
    nodes: Array<{ id: string; x: number; y: number; label: string; freq: number; isLeaf: boolean }>;
    edges: Array<{ x1: number; y1: number; x2: number; y2: number; bit: string }>;
  };
};

const PILL_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 border-violet-300 dark:border-violet-700',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200 border-rose-300 dark:border-rose-700',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200 border-teal-300 dark:border-teal-700',
];

const HUFF_STEPS: HuffStep[] = [
  {
    heap: [
      { label:'c', freq:4,  color: PILL_COLORS[0] },
      { label:'b', freq:10, color: PILL_COLORS[1] },
      { label:'a', freq:11, color: PILL_COLORS[2] },
      { label:'e', freq:13, color: PILL_COLORS[3] },
      { label:'d', freq:17, color: PILL_COLORS[4] },
      { label:'f', freq:45, color: PILL_COLORS[5] },
    ],
    action: '초기 힙: 빈도 기준 정렬 — c(4), b(10), a(11), e(13), d(17), f(45)',
    treeDesc: '아직 트리가 없음',
    svgData: { nodes: [], edges: [] },
  },
  {
    heap: [
      { label:'a', freq:11, color: PILL_COLORS[2] },
      { label:'e', freq:13, color: PILL_COLORS[3] },
      { label:'cb', freq:14, color: PILL_COLORS[0] },
      { label:'d', freq:17, color: PILL_COLORS[4] },
      { label:'f', freq:45, color: PILL_COLORS[5] },
    ],
    action: 'Extract c(4) + b(10) → 내부노드 cb(14) 생성',
    treeDesc: 'cb(14): 왼쪽 c(4), 오른쪽 b(10)',
    svgData: {
      nodes: [
        { id:'cb', x:200, y:40,  label:'cb', freq:14, isLeaf:false },
        { id:'c',  x:140, y:110, label:'c',  freq:4,  isLeaf:true  },
        { id:'b',  x:260, y:110, label:'b',  freq:10, isLeaf:true  },
      ],
      edges: [
        { x1:200,y1:40, x2:140,y2:110, bit:'0' },
        { x1:200,y1:40, x2:260,y2:110, bit:'1' },
      ],
    },
  },
  {
    heap: [
      { label:'cb', freq:14, color: PILL_COLORS[0] },
      { label:'d',  freq:17, color: PILL_COLORS[4] },
      { label:'ae', freq:24, color: PILL_COLORS[2] },
      { label:'f',  freq:45, color: PILL_COLORS[5] },
    ],
    action: 'Extract a(11) + e(13) → 내부노드 ae(24) 생성',
    treeDesc: 'ae(24): 왼쪽 a(11), 오른쪽 e(13) / cb(14): c(4), b(10)',
    svgData: {
      nodes: [
        { id:'cb', x:120, y:40,  label:'cb', freq:14, isLeaf:false },
        { id:'c',  x:70,  y:110, label:'c',  freq:4,  isLeaf:true  },
        { id:'b',  x:170, y:110, label:'b',  freq:10, isLeaf:true  },
        { id:'ae', x:320, y:40,  label:'ae', freq:24, isLeaf:false },
        { id:'a',  x:270, y:110, label:'a',  freq:11, isLeaf:true  },
        { id:'e',  x:370, y:110, label:'e',  freq:13, isLeaf:true  },
      ],
      edges: [
        { x1:120,y1:40, x2:70,  y2:110, bit:'0' },
        { x1:120,y1:40, x2:170, y2:110, bit:'1' },
        { x1:320,y1:40, x2:270, y2:110, bit:'0' },
        { x1:320,y1:40, x2:370, y2:110, bit:'1' },
      ],
    },
  },
  {
    heap: [
      { label:'ae',  freq:24, color: PILL_COLORS[2] },
      { label:'cbd', freq:31, color: PILL_COLORS[0] },
      { label:'f',   freq:45, color: PILL_COLORS[5] },
    ],
    action: 'Extract cb(14) + d(17) → 내부노드 cbd(31) 생성',
    treeDesc: 'cbd(31): 왼쪽 cb(14), 오른쪽 d(17)',
    svgData: {
      nodes: [
        { id:'cbd', x:200, y:30,  label:'cbd', freq:31, isLeaf:false },
        { id:'cb',  x:120, y:100, label:'cb',  freq:14, isLeaf:false },
        { id:'d',   x:280, y:100, label:'d',   freq:17, isLeaf:true  },
        { id:'c',   x:70,  y:170, label:'c',   freq:4,  isLeaf:true  },
        { id:'b',   x:170, y:170, label:'b',   freq:10, isLeaf:true  },
      ],
      edges: [
        { x1:200,y1:30, x2:120,y2:100, bit:'0' },
        { x1:200,y1:30, x2:280,y2:100, bit:'1' },
        { x1:120,y1:100,x2:70, y2:170, bit:'0' },
        { x1:120,y1:100,x2:170,y2:170, bit:'1' },
      ],
    },
  },
  {
    heap: [
      { label:'f',       freq:45, color: PILL_COLORS[5] },
      { label:'aecbd',   freq:55, color: PILL_COLORS[2] },
    ],
    action: 'Extract ae(24) + cbd(31) → 내부노드 aecbd(55) 생성',
    treeDesc: 'aecbd(55): 왼쪽 ae(24), 오른쪽 cbd(31)',
    svgData: {
      nodes: [
        { id:'r2', x:220, y:25,  label:'55',  freq:55, isLeaf:false },
        { id:'ae', x:130, y:90,  label:'ae',  freq:24, isLeaf:false },
        { id:'cbd',x:310, y:90,  label:'cbd', freq:31, isLeaf:false },
        { id:'a',  x:80,  y:155, label:'a',   freq:11, isLeaf:true  },
        { id:'e',  x:180, y:155, label:'e',   freq:13, isLeaf:true  },
        { id:'cb', x:255, y:155, label:'cb',  freq:14, isLeaf:false },
        { id:'d',  x:355, y:155, label:'d',   freq:17, isLeaf:true  },
        { id:'c',  x:220, y:215, label:'c',   freq:4,  isLeaf:true  },
        { id:'b',  x:300, y:215, label:'b',   freq:10, isLeaf:true  },
      ],
      edges: [
        { x1:220,y1:25, x2:130,y2:90,  bit:'0' },
        { x1:220,y1:25, x2:310,y2:90,  bit:'1' },
        { x1:130,y1:90, x2:80, y2:155, bit:'0' },
        { x1:130,y1:90, x2:180,y2:155, bit:'1' },
        { x1:310,y1:90, x2:255,y2:155, bit:'0' },
        { x1:310,y1:90, x2:355,y2:155, bit:'1' },
        { x1:255,y1:155,x2:220,y2:215, bit:'0' },
        { x1:255,y1:155,x2:300,y2:215, bit:'1' },
      ],
    },
  },
  {
    heap: [
      { label:'root', freq:100, color: PILL_COLORS[3] },
    ],
    action: 'Extract f(45) + aecbd(55) → 루트(100) 생성! 트리 완성',
    treeDesc: '완성된 허프만 트리 (루트=100)',
    svgData: {
      nodes: [
        { id:'root', x:220, y:20,  label:'100', freq:100,isLeaf:false },
        { id:'f',    x:110, y:80,  label:'f',   freq:45, isLeaf:true  },
        { id:'r2',   x:330, y:80,  label:'55',  freq:55, isLeaf:false },
        { id:'ae',   x:250, y:145, label:'24',  freq:24, isLeaf:false },
        { id:'cbd',  x:400, y:145, label:'31',  freq:31, isLeaf:false },
        { id:'a',    x:210, y:205, label:'a',   freq:11, isLeaf:true  },
        { id:'e',    x:290, y:205, label:'e',   freq:13, isLeaf:true  },
        { id:'cb',   x:360, y:205, label:'14',  freq:14, isLeaf:false },
        { id:'d',    x:440, y:205, label:'d',   freq:17, isLeaf:true  },
        { id:'c',    x:330, y:265, label:'c',   freq:4,  isLeaf:true  },
        { id:'b',    x:400, y:265, label:'b',   freq:10, isLeaf:true  },
      ],
      edges: [
        { x1:220,y1:20, x2:110,y2:80,  bit:'0' },
        { x1:220,y1:20, x2:330,y2:80,  bit:'1' },
        { x1:330,y1:80, x2:250,y2:145, bit:'0' },
        { x1:330,y1:80, x2:400,y2:145, bit:'1' },
        { x1:250,y1:145,x2:210,y2:205, bit:'0' },
        { x1:250,y1:145,x2:290,y2:205, bit:'1' },
        { x1:400,y1:145,x2:360,y2:205, bit:'0' },
        { x1:400,y1:145,x2:440,y2:205, bit:'1' },
        { x1:360,y1:205,x2:330,y2:265, bit:'0' },
        { x1:360,y1:205,x2:400,y2:265, bit:'1' },
      ],
    },
  },
];

/* ── Huffman codes ── */
const HUFF_CODES = [
  { ch:'f', freq:45, code:'0',    bits:1, contrib:45 },
  { ch:'a', freq:11, code:'100',  bits:3, contrib:33 },
  { ch:'e', freq:13, code:'101',  bits:3, contrib:39 },
  { ch:'c', freq:4,  code:'1100', bits:4, contrib:16 },
  { ch:'b', freq:10, code:'1101', bits:4, contrib:40 },
  { ch:'d', freq:17, code:'111',  bits:3, contrib:51 },
];
const ABL = 2.24;
const TOTAL_FREQ = 100;

/* ── T/F Quiz ── */
type QuizItem = { q: string; answer: boolean; explanation: string };
const QUIZ_ITEMS: QuizItem[] = [
  { q: '허프만 코드 트리는 유일하다', answer: false, explanation: '빈도가 동률인 원소가 있으면 여러 가지 허프만 트리가 가능. 코드가 달라질 수 있음.' },
  { q: '리프 노드만 실제 문자를 나타낸다', answer: true, explanation: '내부 노드는 자식들의 빈도 합만 가짐. 실제 문자는 모두 리프에 위치.' },
  { q: '빈도가 높은 문자일수록 긴 코드가 할당된다', answer: false, explanation: '반대. 빈도가 높은 문자에 짧은 코드 배정 → ABL 최소화가 목적.' },
  { q: 'ABL은 항상 고정 길이 코드보다 크다', answer: false, explanation: 'ABL ≤ 고정 길이 코드 (항상). 허프만 코딩은 최적 prefix-free 코드를 보장.' },
  { q: '허프만 알고리즘의 시간 복잡도는 O(n log n)이다', answer: true, explanation: '우선순위 큐(min-heap) 사용: n-1번 Extract-min + Insert = O(n log n).' },
];

export default function HuffmanContent({ topic }: Props) {
  const [simStep, setSimStep] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>([false,false,false,false,false]);

  const toggleReveal = useCallback((i: number) => {
    setRevealed(prev => { const n=[...prev]; n[i]=!n[i]; return n; });
  }, []);

  const hs = HUFF_STEPS[simStep];
  const svgH = simStep <= 1 ? 160 : simStep <= 2 ? 160 : simStep <= 3 ? 210 : simStep <= 4 ? 260 : 310;

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

      {/* 1. 핵심 개념 */}
      <section>
        <SH emoji="📖" title="핵심 개념" id={`${topic.id}-sec-concept`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 p-4">
            <p className="font-bold text-blue-800 dark:text-blue-200 mb-2">고정 길이 코드 (Fixed-Length)</p>
            <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <li>• 모든 문자가 동일한 비트 수 사용</li>
              <li>• n개 문자 → ⌈log₂n⌉ 비트</li>
              <li>• 예: 6개 문자 → 3비트씩</li>
              <li>• 총 비트 = 3 × 100 = 300비트</li>
            </ul>
          </div>
          <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-4">
            <p className="font-bold text-emerald-800 dark:text-emerald-200 mb-2">가변 길이 코드 (Variable-Length)</p>
            <ul className="space-y-1 text-xs text-emerald-700 dark:text-emerald-300">
              <li>• 빈도 높은 문자 = 짧은 코드</li>
              <li>• Prefix-free: 어떤 코드도 다른 코드의 접두사가 아님</li>
              <li>• 예: f(45)=&quot;0&quot; (1비트), c(4)=&quot;1100&quot; (4비트)</li>
              <li>• ABL = 2.24비트 → 약 25% 압축</li>
            </ul>
          </div>
        </div>
        {/* ABL formula */}
        <div className="rounded-xl border border-violet-200 bg-violet-50 dark:border-violet-800/40 dark:bg-violet-900/10 p-4 mb-4">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-2 uppercase tracking-wide">평균 비트 길이 (ABL)</p>
          <div className="font-mono text-sm text-violet-800 dark:text-violet-200 space-y-1">
            <p>ABL = Σ freq(x) × |code(x)| / Σ freq(x)</p>
            <p className="text-xs text-violet-600 dark:text-violet-400">= (45×1 + 11×3 + 13×3 + 4×4 + 10×4 + 17×3) / 100</p>
            <p className="text-xs text-violet-600 dark:text-violet-400">= (45+33+39+16+40+51) / 100 = 224 / 100 = <span className="font-black text-violet-700 dark:text-violet-200">2.24 bits</span></p>
          </div>
        </div>
        <ul className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
          {[
            'Prefix-free 코드는 디코딩이 유일 — 트리를 따라가며 리프에서 문자 확인',
            '허프만 코딩은 최적 prefix-free 코드 (ABL 최소) 를 O(n log n)에 구성',
            '탐욕 알고리즘 — 매 단계 최소 빈도 두 노드를 합침 (Greedy 성립 증명 가능)',
          ].map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />{pt}
            </li>
          ))}
        </ul>
      </section>

      {/* 2. 허프만 트리 빌드 시뮬레이터 */}
      <section>
        <SH emoji="🔨" title="허프만 트리 빌드 시뮬레이터" id={`${topic.id}-sec-sim`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            자주 나오는 문자 = 짧은 코드, 드물게 나오는 문자 = 긴 코드. 매 단계에서 빈도가 가장 낮은 두 노드를 합쳐 트리를 구성. Greedy가 최적인 이유: 빈도가 낮은 문자는 트리에서 깊은 위치(긴 코드)에 배치해야 전체 ABL이 최소.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1.5">Prefix-free 성질</p>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            어떤 코드도 다른 코드의 접두사(prefix)가 아니다. 이 성질 덕분에 구분자(delimiter) 없이도 복호화 가능하다. 트리에서 루트부터 내려가다 리프에 도달하면 반드시 하나의 문자로 확정되므로, 연속된 비트열을 모호함 없이 분리할 수 있다.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          {/* Min-heap pills */}
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Min-Heap (빈도 순 정렬)</p>
            <div className="flex flex-wrap gap-2">
              {hs.heap.map((pill, i) => (
                <div key={i} className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${pill.color} transition-all`}>
                  <span>{pill.label}</span>
                  <span className="opacity-70">({pill.freq})</span>
                </div>
              ))}
            </div>
          </div>
          {/* Action description */}
          <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">단계 {simStep + 1} / {HUFF_STEPS.length}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{hs.action}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hs.treeDesc}</p>
          </div>
          {/* SVG Tree */}
          {hs.svgData.nodes.length > 0 && (
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 mb-4 overflow-x-auto">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">트리 구조</p>
              <svg viewBox={`0 0 460 ${svgH}`} className="w-full">
                {hs.svgData.edges.map((e, i) => {
                  const mx = (e.x1+e.x2)/2, my = (e.y1+e.y2)/2;
                  return (
                    <g key={i}>
                      <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#94a3b8" strokeWidth="1.5" />
                      <circle cx={mx} cy={my} r={8} fill={e.bit==='0' ? '#dbeafe' : '#fef3c7'} stroke={e.bit==='0' ? '#93c5fd' : '#fcd34d'} strokeWidth="1" />
                      <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="bold"
                        fill={e.bit==='0' ? '#1d4ed8' : '#92400e'}>{e.bit}</text>
                    </g>
                  );
                })}
                {hs.svgData.nodes.map(node => {
                  const fill = node.isLeaf ? '#3b82f6' : '#6366f1';
                  return (
                    <g key={node.id}>
                      <circle cx={node.x} cy={node.y} r={18} fill={fill} stroke={fill} strokeWidth="2" />
                      <text x={node.x} y={node.y-4} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="bold" fill="white">{node.label}</text>
                      <text x={node.x} y={node.y+8} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)">{node.freq}</text>
                    </g>
                  );
                })}
              </svg>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-500 inline-block" />리프(문자)</span>
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-indigo-500 inline-block" />내부 노드</span>
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-200 border border-blue-400 inline-block" />0 (왼쪽)</span>
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-amber-200 border border-amber-400 inline-block" />1 (오른쪽)</span>
              </div>
            </div>
          )}
          {/* Nav */}
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setSimStep(s => Math.max(0, s-1))} disabled={simStep===0}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">◀ 이전</button>
            <span className="text-xs text-slate-500">단계 {simStep+1} / {HUFF_STEPS.length}</span>
            <button onClick={() => setSimStep(s => Math.min(HUFF_STEPS.length-1, s+1))} disabled={simStep===HUFF_STEPS.length-1}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">다음 ▶</button>
          </div>
        </div>
      </section>

      {/* 3. 코드 할당 & ABL 계산 */}
      <section>
        <SH emoji="🏷" title="코드 할당 & ABL 계산" id={`${topic.id}-sec-codes`} />
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                {['문자','빈도','코드','비트수','기여 (fₓ×|c(x)|)'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {HUFF_CODES.map(row => (
                <tr key={row.ch} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2.5 font-black text-base text-slate-800 dark:text-slate-200">{row.ch}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-400">{row.freq}</td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">{row.code}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${row.bits===1 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : row.bits===3 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>{row.bits}</span>
                  </td>
                  <td className="px-3 py-2.5 font-mono font-bold text-violet-600 dark:text-violet-400">{row.contrib}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 dark:bg-slate-800">
                <td className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300" colSpan={2}>합계</td>
                <td colSpan={2} className="px-3 py-2.5 font-bold text-slate-600 dark:text-slate-400">{TOTAL_FREQ}</td>
                <td className="px-3 py-2.5 font-black text-violet-700 dark:text-violet-300">
                  {HUFF_CODES.reduce((s,r)=>s+r.contrib,0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* ABL comparison bar */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">ABL 비교</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">허프만 코드</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">{ABL} bits</span>
              </div>
              <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(ABL/3)*100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-600 dark:text-slate-400">고정 길이 코드 (3비트)</span>
                <span className="font-mono font-black text-slate-600 dark:text-slate-400">3.00 bits</span>
              </div>
              <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-slate-400 dark:bg-slate-600" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 p-2.5 text-xs">
            <span className="font-bold text-emerald-800 dark:text-emerald-300">절감률: </span>
            <span className="font-mono font-black text-emerald-700 dark:text-emerald-200">
              ({`3.00 - ${ABL}`}) / 3.00 × 100 = {(((3-ABL)/3)*100).toFixed(1)}%
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 ml-1">압축</span>
          </div>
        </div>
      </section>

      {/* 4. 고정 vs 허프만 비교 */}
      <section>
        <SH emoji="📉" title="고정 코드 vs 허프만 비교" id={`${topic.id}-sec-compare`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            {
              title:'고정 길이 코드 (⌈log₂6⌉=3 bits)',
              rows: [
                ['f=45', '000','3','135'],['a=11','001','3','33'],['e=13','010','3','39'],
                ['c=4', '011','3','12'],['b=10','100','3','30'],['d=17','101','3','51'],
              ],
              total:'300',
              color:'slate',
            },
            {
              title:'허프만 코드 (ABL=2.24 bits)',
              rows: [
                ['f=45','0','1','45'],['a=11','100','3','33'],['e=13','101','3','39'],
                ['c=4','1100','4','16'],['b=10','1101','4','40'],['d=17','111','3','51'],
              ],
              total:'224',
              color:'emerald',
            },
          ].map(tbl => (
            <div key={tbl.title} className={`rounded-xl border border-${tbl.color}-200 dark:border-${tbl.color}-800/40 bg-${tbl.color}-50 dark:bg-${tbl.color}-900/10 overflow-hidden`}>
              <div className={`px-3 py-2 bg-${tbl.color}-100 dark:bg-${tbl.color}-900/20`}>
                <p className={`text-xs font-bold text-${tbl.color}-700 dark:text-${tbl.color}-300`}>{tbl.title}</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className={`border-b border-${tbl.color}-200 dark:border-${tbl.color}-800/40`}>
                    {['문자','코드','bits','기여'].map(h => (
                      <th key={h} className={`px-2 py-1.5 text-${tbl.color}-600 dark:text-${tbl.color}-400 text-left`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tbl.rows.map(([ch,code,bits,contrib]) => (
                    <tr key={ch} className={`border-b border-${tbl.color}-100 dark:border-${tbl.color}-900/20`}>
                      <td className="px-2 py-1 font-bold text-slate-700 dark:text-slate-300">{ch}</td>
                      <td className="px-2 py-1 font-mono text-slate-600 dark:text-slate-400">{code}</td>
                      <td className="px-2 py-1 text-slate-500 dark:text-slate-400">{bits}</td>
                      <td className="px-2 py-1 font-mono font-bold text-slate-700 dark:text-slate-200">{contrib}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className={`px-2 py-1.5 font-bold text-${tbl.color}-700 dark:text-${tbl.color}-300`}>합계</td>
                    <td className={`px-2 py-1.5 font-mono font-black text-${tbl.color}-700 dark:text-${tbl.color}-300 text-base`}>{tbl.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10 p-4 text-sm">
          <p className="font-bold text-blue-800 dark:text-blue-200 mb-1">압축 효과 (100글자 기준)</p>
          <p className="text-blue-700 dark:text-blue-300">고정 코드: <span className="font-mono font-black">300비트</span> → 허프만: <span className="font-mono font-black">224비트</span> → <span className="font-black text-emerald-600 dark:text-emerald-400">25.3% 절감</span></p>
        </div>
      </section>

      {/* 5. 시험 함정 + T/F */}
      <section>
        <SH emoji="⚠️" title="시험 함정 & True/False 퀴즈" id={`${topic.id}-sec-pitfalls`} />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/10 space-y-2 mb-5">
          {[
            '허프만 트리는 동률 빈도 처리 방식에 따라 여러 가지가 될 수 있음 (모두 최적)',
            'ABL은 항상 고정 길이 코드 이하 — 절대로 더 나쁘지 않음',
            '내부 노드는 문자를 나타내지 않음 — 모든 문자는 반드시 리프에만',
            '빈도 합이 100이 아닌 경우도 ABL = Σ(fᵢ×bᵢ) / Σfᵢ 공식 그대로',
            'Prefix-free ≠ Prefix code — 전자는 어떤 코드도 다른 코드의 접두사가 아님을 의미',
          ].map((p, i) => (
            <p key={i} className="flex gap-2 text-sm text-red-700 dark:text-red-300"><span>⚠</span>{p}</p>
          ))}
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">True / False 퀴즈 — 클릭하여 정답 확인</p>
        <div className="space-y-2">
          {QUIZ_ITEMS.map((item, i) => (
            <div key={i}
              onClick={() => toggleReveal(i)}
              className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 hover:border-blue-300 dark:hover:border-blue-700 transition-all select-none"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 text-lg">
                  {!revealed[i] ? '❓' : item.answer ? '✅' : '❌'}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.q}</p>
                  {revealed[i] && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{item.explanation}</p>
                  )}
                </div>
                <span className={`flex-shrink-0 text-xs font-bold rounded-full px-2 py-0.5 ${revealed[i] ? (item.answer ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300') : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {revealed[i] ? (item.answer ? 'TRUE' : 'FALSE') : '?'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
