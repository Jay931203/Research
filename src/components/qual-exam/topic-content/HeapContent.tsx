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

/* ── Heap Tree SVG ── */
function HeapTreeSVG({ heap, highlighted }: { heap: number[]; highlighted: number[] }) {
  const N = Math.min(heap.length, 15);
  if (N === 0) return <div className="text-center text-slate-400 text-sm py-4">힙이 비어 있습니다</div>;

  const W = 380;
  const ROW_H = 52;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < N; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const levelFirst = (1 << level) - 1;
    const pos = i - levelFirst;
    const count = 1 << level;
    positions.push({ x: (W / (count + 1)) * (pos + 1), y: 28 + level * ROW_H });
  }
  const H = 28 + Math.floor(Math.log2(N)) * ROW_H + 32;

  const nodeColor = (i: number): string => {
    if (highlighted[0] === i) return '#3b82f6';
    if (highlighted[1] === i) return '#f59e0b';
    return '#e2e8f0';
  };
  const textColor = (i: number): string => {
    if (highlighted[0] === i || highlighted[1] === i) return 'white';
    return '#1e293b';
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto">
      {heap.slice(0, N).map((_, i) => {
        if (i === 0) return null;
        const p = Math.floor((i - 1) / 2);
        return (
          <line
            key={`l${i}`}
            x1={positions[p].x} y1={positions[p].y}
            x2={positions[i].x} y2={positions[i].y}
            stroke="#94a3b8" strokeWidth="1.5"
          />
        );
      })}
      {heap.slice(0, N).map((val, i) => {
        const { x, y } = positions[i];
        const c = nodeColor(i);
        return (
          <g key={`n${i}`}>
            <circle cx={x} cy={y} r={17} fill={c} stroke={c === '#e2e8f0' ? '#94a3b8' : c} strokeWidth="2" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill={textColor(i)}>{val}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Pre-computed Build-Heap steps ── */
type BuildStep = { desc: string; arr: number[]; highlight: number[] };
const BUILD_STEPS: BuildStep[] = [
  { desc: '초기 배열 A = [4, 10, 3, 5, 1, 2]', arr: [4,10,3,5,1,2], highlight: [] },
  { desc: 'i=2: idx2(val=3) heapify — 자식 idx5(2) < 3 → swap', arr: [4,10,2,5,1,3], highlight: [2,5] },
  { desc: 'i=1: idx1(val=10) heapify — 자식 idx4(1)가 최솟값 → swap', arr: [4,1,2,5,10,3], highlight: [1,4] },
  { desc: 'i=0: idx0(val=4) heapify — 자식 idx1(1)가 최솟값 → swap', arr: [1,4,2,5,10,3], highlight: [0,1] },
  { desc: 'idx1(val=4) 재heapify — 자식 idx3(5),idx4(10) 모두 4보다 크므로 stop', arr: [1,4,2,5,10,3], highlight: [1] },
  { desc: 'Build-Heap 완료! O(n) 시간 복잡도', arr: [1,4,2,5,10,3], highlight: [] },
];

/* ── Pre-computed HeapSort steps ── */
type SortStep = { desc: string; arr: number[]; sorted: number[]; highlight: number[] };
const SORT_STEPS: SortStep[] = [
  { desc: 'Min-Heap [1,4,2,5,10,3] — 정렬 시작', arr: [1,4,2,5,10,3], sorted: [], highlight: [] },
  { desc: 'Extract-min(1) → 끝에 배치, 남은 [4,5,2,3,10] → heapify', arr: [2,4,3,5,10], sorted: [1], highlight: [0] },
  { desc: 'Extract-min(2) → 끝에 배치, 남은 [3,4,10,5] → heapify', arr: [3,4,10,5], sorted: [1,2], highlight: [0] },
  { desc: 'Extract-min(3) → 끝에 배치, 남은 [4,5,10] → heapify', arr: [4,5,10], sorted: [1,2,3], highlight: [0] },
  { desc: 'Extract-min(4) → 끝에 배치, 남은 [5,10] → heapify', arr: [5,10], sorted: [1,2,3,4], highlight: [0] },
  { desc: 'Extract-min(5) → 끝에 배치, 남은 [10] → heapify', arr: [10], sorted: [1,2,3,4,5], highlight: [0] },
  { desc: 'Extract-min(10) → 정렬 완료! [1,2,3,4,5,10]', arr: [], sorted: [1,2,3,4,5,10], highlight: [] },
];

type SimPhase = 'idle' | 'inserting' | 'extracting';

export default function HeapContent({ topic }: Props) {
  /* ── Simulator state ── */
  const [heap, setHeap] = useState<number[]>([3, 7, 5, 10, 12, 9]);
  const [highlighted, setHighlighted] = useState<number[]>([]);
  const [phase, setPhase] = useState<SimPhase>('idle');
  const [log, setLog] = useState<string[]>(['Min-Heap 초기 상태']);

  /* ── Build-Heap trace state ── */
  const [buildStep, setBuildStep] = useState(0);

  /* ── HeapSort trace state ── */
  const [sortStep, setSortStep] = useState(0);

  /* ── Insert with sift-up animation ── */
  const handleInsert = useCallback(() => {
    if (phase !== 'idle' || heap.length >= 12) return;
    setPhase('inserting');
    const val = Math.floor(Math.random() * 20) + 1;
    const newHeap = [...heap, val];
    let idx = newHeap.length - 1;
    const steps: Array<{ h: number[]; hl: number[] }> = [];
    steps.push({ h: [...newHeap], hl: [idx] });

    // sift-up simulation
    const tmp = [...newHeap];
    let cur = idx;
    while (cur > 0) {
      const parent = Math.floor((cur - 1) / 2);
      if (tmp[parent] > tmp[cur]) {
        [tmp[parent], tmp[cur]] = [tmp[cur], tmp[parent]];
        steps.push({ h: [...tmp], hl: [parent, cur] });
        cur = parent;
      } else break;
    }
    steps.push({ h: [...tmp], hl: [] });

    let i = 0;
    setLog(prev => [`삽입: ${val}`, ...prev.slice(0, 4)]);
    const run = () => {
      if (i >= steps.length) { setPhase('idle'); return; }
      setHeap(steps[i].h);
      setHighlighted(steps[i].hl);
      i++;
      setTimeout(run, 600);
    };
    run();
  }, [heap, phase]);

  /* ── Extract-min with sift-down animation ── */
  const handleExtract = useCallback(() => {
    if (phase !== 'idle' || heap.length === 0) return;
    setPhase('extracting');
    const minVal = heap[0];
    const steps: Array<{ h: number[]; hl: number[] }> = [];

    if (heap.length === 1) {
      steps.push({ h: [], hl: [] });
    } else {
      const tmp = [...heap];
      tmp[0] = tmp[tmp.length - 1];
      tmp.pop();
      steps.push({ h: [...tmp], hl: [0] });

      // sift-down
      let cur = 0;
      while (true) {
        const l = 2 * cur + 1;
        const r = 2 * cur + 2;
        let smallest = cur;
        if (l < tmp.length && tmp[l] < tmp[smallest]) smallest = l;
        if (r < tmp.length && tmp[r] < tmp[smallest]) smallest = r;
        if (smallest === cur) break;
        [tmp[smallest], tmp[cur]] = [tmp[cur], tmp[smallest]];
        steps.push({ h: [...tmp], hl: [cur, smallest] });
        cur = smallest;
      }
      steps.push({ h: [...tmp], hl: [] });
    }

    let i = 0;
    setLog(prev => [`추출: min=${minVal}`, ...prev.slice(0, 4)]);
    const run = () => {
      if (i >= steps.length) { setPhase('idle'); return; }
      setHeap(steps[i].h);
      setHighlighted(steps[i].hl);
      i++;
      setTimeout(run, 600);
    };
    run();
  }, [heap, phase]);

  const COLORS = ['bg-blue-400','bg-violet-400','bg-emerald-400','bg-amber-400','bg-rose-400','bg-teal-400','bg-pink-400','bg-indigo-400','bg-cyan-400','bg-orange-400','bg-lime-400','bg-fuchsia-400'];

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

      {/* 1. 개념 */}
      <section>
        <SH emoji="📖" title="힙 개념" id={`${topic.id}-sec-concept`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            &quot;부모는 항상 자식보다 크다(Max-Heap) 또는 작다(Min-Heap)&quot; — 이 한 규칙만 지키면 된다. 배열로 구현할 수 있는 이유는 힙이 완전 이진 트리이기 때문: 레벨 순서(BFS 순서)대로 배열에 저장하면 포인터 없이 인덱스만으로 탐색 가능. 인덱스 0-based 기준: 왼쪽 자식 = 2i+1, 오른쪽 자식 = 2i+2, 부모 = ⌊(i-1)/2⌋.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {[
            { name: 'Min-Heap', color: 'border-blue-300 dark:border-blue-700', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', props: ['부모 ≤ 자식 (항상)', '루트 = 전체 최솟값', '삽입/삭제 O(log n)', '완전 이진 트리'] },
            { name: 'Max-Heap', color: 'border-orange-300 dark:border-orange-700', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200', props: ['부모 ≥ 자식 (항상)', '루트 = 전체 최댓값', '삽입/삭제 O(log n)', '완전 이진 트리'] },
          ].map(h => (
            <div key={h.name} className={`rounded-xl border-2 ${h.color} p-4`}>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${h.badge} mb-3 inline-block`}>{h.name}</span>
              <ul className="space-y-1.5">
                {h.props.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Index formula card */}
        <div className="rounded-xl border border-violet-200 bg-violet-50 dark:border-violet-800/40 dark:bg-violet-950/20 p-4 mb-5">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-3 uppercase tracking-wide">배열 인덱스 공식 (0-based)</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: '왼쪽 자식', formula: '2i + 1' },
              { label: '오른쪽 자식', formula: '2i + 2' },
              { label: '부모', formula: '⌊(i-1)/2⌋' },
            ].map(f => (
              <div key={f.label} className="rounded-lg bg-white dark:bg-slate-800 p-3 shadow-sm">
                <div className="font-mono text-lg font-black text-violet-700 dark:text-violet-300">{f.formula}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        <ul className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
          {[
            '힙 속성(heap property): 부모와 자식 간 대소 관계만 보장, 형제 간 순서 없음',
            '완전 이진 트리(Complete Binary Tree): 마지막 레벨을 제외하고 모두 채워짐, 마지막 레벨은 왼쪽부터',
            '배열로 표현 가능 — 포인터 불필요, 캐시 효율적',
          ].map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />{pt}
            </li>
          ))}
        </ul>
      </section>

      {/* 2. 시뮬레이터 */}
      <section>
        <SH emoji="🎮" title="인터랙티브 Min-Heap 시뮬레이터" id={`${topic.id}-sec-sim`} />
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 mb-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">삽입과 삭제의 동작 원리</p>
          <ol className="space-y-2">
            {[
              { title: 'Sift-Up (삽입 후 복구)', desc: '새 원소를 배열 끝에 추가 → 부모와 비교 → 힙 조건 위반 시 swap → 루트까지 반복. 시간: O(log n)' },
              { title: 'Sift-Down (삭제 후 복구)', desc: '루트 제거 → 마지막 원소를 루트로 이동 → 두 자식 중 더 작은 것과 비교 → 힙 조건 위반 시 swap → 리프까지 반복. 시간: O(log n)' },
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                <span><span className="font-semibold text-slate-700 dark:text-slate-300">{step.title}</span>: {step.desc}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              onClick={handleInsert}
              disabled={phase !== 'idle' || heap.length >= 12}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              랜덤 삽입 (Insert)
            </button>
            <button
              onClick={handleExtract}
              disabled={phase !== 'idle' || heap.length === 0}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              최솟값 추출 (Extract-min)
            </button>
            <button
              onClick={() => { setHeap([]); setHighlighted([]); setPhase('idle'); setLog(['힙 초기화']); }}
              disabled={phase !== 'idle'}
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              초기화
            </button>
            <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-bold ${
              phase === 'idle' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 animate-pulse'
            }`}>
              {phase === 'idle' ? '대기 중' : phase === 'inserting' ? '삽입 중...' : '추출 중...'}
            </span>
          </div>

          {/* Array view */}
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">배열 표현 (인덱스 0부터)</p>
            <div className="flex flex-wrap gap-1.5">
              {heap.length === 0
                ? <span className="text-sm text-slate-400 italic">비어 있음</span>
                : heap.map((val, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow transition-all ${
                      highlighted[0] === i ? 'ring-4 ring-blue-400 ' + COLORS[0]
                      : highlighted[1] === i ? 'ring-4 ring-amber-400 ' + COLORS[3]
                      : COLORS[i % COLORS.length]
                    }`}>{val}</div>
                    <span className="text-[10px] text-slate-400 mt-0.5">{i}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Tree view */}
          <div className="mb-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">트리 시각화</p>
            <HeapTreeSVG heap={heap} highlighted={highlighted} />
            {highlighted.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-blue-500" /> 비교/이동 대상 A</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-amber-400" /> 비교/이동 대상 B</span>
              </div>
            )}
          </div>

          {/* Log */}
          <div className="space-y-1">
            {log.map((entry, i) => (
              <p key={i} className={`text-xs font-mono ${i === 0 ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                {i === 0 ? '▶ ' : '  '}{entry}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Build-Heap O(n) */}
      <section>
        <SH emoji="🔨" title="Build-Heap O(n) 단계별 트레이스" id={`${topic.id}-sec-build`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어 — Build-Heap이 왜 O(n)인가?</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            Heapify를 리프부터 시작하면: 리프 노드(n/2개)는 이미 힙이라 heapify 불필요, 높이 1 노드(n/4개)는 최대 1번 swap, 높이 2 노드(n/8개)는 최대 2번 swap... 합산하면 n/4&middot;1 + n/8&middot;2 + n/16&middot;3 + ... &le; 2n &rarr; O(n).
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10 p-3 mb-4">
          <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">시험 포인트</p>
          <ul className="space-y-1">
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 반직관: &quot;n번 삽입하면 O(n log n)&quot;인데 Build-Heap은 O(n) - 이 차이가 자주 출제됨</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; Build-Heap은 bottom-up heapify를 사용하기 때문에 가능</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            입력 A = [4, 10, 3, 5, 1, 2] — <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">i = ⌊n/2⌋-1</code> 부터 역순으로 Heapify
          </p>
          <div className="mb-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              단계 {buildStep + 1} / {BUILD_STEPS.length}
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">{BUILD_STEPS[buildStep].desc}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {BUILD_STEPS[buildStep].arr.map((val, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shadow ${
                    BUILD_STEPS[buildStep].highlight[0] === i ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                    : BUILD_STEPS[buildStep].highlight[1] === i ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                    : BUILD_STEPS[buildStep].highlight[0] === i && BUILD_STEPS[buildStep].highlight.length === 1 ? 'bg-violet-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}>{val}</div>
                  <span className="text-[10px] text-slate-400 mt-0.5">{i}</span>
                </div>
              ))}
            </div>
            <HeapTreeSVG heap={BUILD_STEPS[buildStep].arr} highlighted={BUILD_STEPS[buildStep].highlight} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setBuildStep(s => Math.max(0, s - 1))}
              disabled={buildStep === 0}
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >← 이전</button>
            <button
              onClick={() => setBuildStep(s => Math.min(BUILD_STEPS.length - 1, s + 1))}
              disabled={buildStep === BUILD_STEPS.length - 1}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >다음 →</button>
            <button
              onClick={() => setBuildStep(0)}
              className="ml-auto rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >처음으로</button>
          </div>
          <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 p-3">
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">왜 O(n)인가?</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">높이가 h인 노드는 최대 ⌈n/2^(h+1)⌉개. 각 노드의 heapify 비용 = O(h). 합산하면 Σ h·n/2^h = O(n).</p>
          </div>
        </div>
      </section>

      {/* 4. HeapSort */}
      <section>
        <SH emoji="📊" title="HeapSort 추적" id={`${topic.id}-sec-heapsort`} />
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="mb-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              단계 {sortStep + 1} / {SORT_STEPS.length}
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">{SORT_STEPS[sortStep].desc}</p>
            <div className="flex flex-wrap gap-2 items-end mb-4">
              <div>
                <p className="text-[10px] text-slate-400 mb-1">힙 (미정렬)</p>
                <div className="flex gap-1.5 flex-wrap">
                  {SORT_STEPS[sortStep].arr.length === 0
                    ? <span className="text-xs text-slate-400 italic">비어 있음</span>
                    : SORT_STEPS[sortStep].arr.map((val, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shadow ${
                          i === 0 && SORT_STEPS[sortStep].highlight[0] === 0 ? 'bg-amber-500 text-white ring-2 ring-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}>{val}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
              {SORT_STEPS[sortStep].sorted.length > 0 && (
                <div>
                  <p className="text-[10px] text-emerald-500 mb-1">정렬 완료 ✓</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {SORT_STEPS[sortStep].sorted.map((val, i) => (
                      <div key={i} className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shadow bg-emerald-500 text-white">{val}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortStep(s => Math.max(0, s - 1))}
              disabled={sortStep === 0}
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >← 이전</button>
            <button
              onClick={() => setSortStep(s => Math.min(SORT_STEPS.length - 1, s + 1))}
              disabled={sortStep === SORT_STEPS.length - 1}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >다음 →</button>
            <button
              onClick={() => setSortStep(0)}
              className="ml-auto rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >처음으로</button>
          </div>
        </div>
      </section>

      {/* 5. 시간 복잡도 */}
      <section>
        <SH emoji="⏱" title="시간 복잡도 표 + 시험 함정" id={`${topic.id}-sec-complexity`} />
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="px-4 py-2.5 text-left font-bold text-slate-700 dark:text-slate-300">연산</th>
                <th className="px-4 py-2.5 text-center font-bold text-slate-700 dark:text-slate-300">시간 복잡도</th>
                <th className="px-4 py-2.5 text-left font-bold text-slate-700 dark:text-slate-300 hidden sm:table-cell">설명</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                { op: 'Insert', cx: 'O(log n)', note: 'Sift-up: 트리 높이만큼', good: false },
                { op: 'Extract-min/max', cx: 'O(log n)', note: 'Sift-down: 트리 높이만큼', good: false },
                { op: 'Get-min/max', cx: 'O(1)', note: '루트 바로 반환', good: true },
                { op: 'Build-Heap', cx: 'O(n)', note: '반복 insert O(n log n)와 다름!', good: true },
                { op: 'HeapSort', cx: 'O(n log n)', note: 'Build O(n) + n번 extract O(log n)', good: false },
                { op: 'Decrease-Key', cx: 'O(log n)', note: 'Dijkstra에서 사용', good: false },
              ].map((row) => (
                <tr key={row.op} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">{row.op}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold font-mono ${
                      row.good ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}>{row.cx}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/10 space-y-2">
          {[
            'Build-Heap은 O(n log n)이 아니라 O(n)! n번 Insert가 아닌 bottom-up heapify를 사용하기 때문',
            'HeapSort는 in-place지만 캐시 지역성 낮아 실제로는 QuickSort보다 느린 경우 많음',
            '힙은 k번째 최솟값을 O(k log n)에 구할 수 있지만 완전 정렬은 불필요',
            'Min-Heap에서 최댓값 탐색은 O(n) — 힙 속성은 부모-자식 관계만 보장',
          ].map((p, i) => (
            <p key={i} className="flex gap-2 text-sm text-red-700 dark:text-red-300"><span>⚠</span>{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
