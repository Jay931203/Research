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

/* ── LCS DP Table (pre-computed) ── */
const LCS_X = ['A','C','D','B','E'];
const LCS_Y = ['A','B','C','D','E'];
const M = LCS_X.length;
const N = LCS_Y.length;

function buildLcsTable(): number[][] {
  const dp: number[][] = Array.from({ length: M+1 }, () => Array(N+1).fill(0));
  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      if (LCS_X[i-1] === LCS_Y[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp;
}
const LCS_TABLE = buildLcsTable();
const LCS_TOTAL_CELLS = M * N;

function lcsBacktrack(): Array<[number,number]> {
  const path: Array<[number,number]> = [];
  let i = M, j = N;
  while (i > 0 && j > 0) {
    if (LCS_X[i-1] === LCS_Y[j-1]) { path.unshift([i,j]); i--; j--; }
    else if (LCS_TABLE[i-1][j] >= LCS_TABLE[i][j-1]) i--;
    else j--;
  }
  return path;
}
const LCS_PATH = lcsBacktrack();

/* ── Knapsack DP (pre-computed) ── */
const KN_W = 5;
const KN_ITEMS: Array<{ w: number; v: number; name: string }> = [
  { w: 2, v: 3, name: '물품A' },
  { w: 3, v: 4, name: '물품B' },
  { w: 1, v: 2, name: '물품C' },
];

function buildKnapTable(): number[][] {
  const n = KN_ITEMS.length;
  const dp: number[][] = Array.from({ length: n+1 }, () => Array(KN_W+1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= KN_W; w++) {
      dp[i][w] = dp[i-1][w];
      if (KN_ITEMS[i-1].w <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i-1][w - KN_ITEMS[i-1].w] + KN_ITEMS[i-1].v);
      }
    }
  }
  return dp;
}
const KNAP_TABLE = buildKnapTable();
const KNAP_TOTAL = KN_ITEMS.length * (KN_W + 1);

function knapBacktrack(): number[] {
  const selected: number[] = [];
  let w = KN_W;
  for (let i = KN_ITEMS.length; i >= 1; i--) {
    if (KNAP_TABLE[i][w] !== KNAP_TABLE[i-1][w]) {
      selected.push(i-1);
      w -= KN_ITEMS[i-1].w;
    }
  }
  return selected;
}
const KNAP_SELECTED = knapBacktrack();

/* ── Edit Distance (pre-computed) ── */
const ED_S = 'KITTEN';
const ED_T = 'SITTING';

function buildEditTable(): number[][] {
  const m = ED_S.length, n = ED_T.length;
  const dp: number[][] = Array.from({ length: m+1 }, () => Array(n+1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (ED_S[i-1] === ED_T[j-1]) dp[i][j] = dp[i-1][j-1];
      else dp[i][j] = 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp;
}
const EDIT_TABLE = buildEditTable();

export default function DpContent({ topic }: Props) {
  const [lcsStep, setLcsStep] = useState(0);   // 0..M*N, beyond M*N = show backtrack
  const [knapStep, setKnapStep] = useState(0); // 0..KNAP_TOTAL, beyond = show backtrack
  const [edStep, setEdStep] = useState(0);     // show/hide

  const showBacktrack = lcsStep > LCS_TOTAL_CELLS;
  const showKnapBt = knapStep > KNAP_TOTAL;

  // Which LCS cell is currently being filled (1-indexed linear)
  const lcsCurLinear = Math.min(lcsStep, LCS_TOTAL_CELLS);
  const getCellState = useCallback((i: number, j: number): 'future' | 'current' | 'filled' => {
    const linear = (i-1)*N + j;
    if (linear > lcsCurLinear) return 'future';
    if (linear === lcsCurLinear) return 'current';
    return 'filled';
  }, [lcsCurLinear]);

  const knapCurLinear = Math.min(knapStep, KNAP_TOTAL);
  const getKnapState = useCallback((i: number, w: number): 'future' | 'current' | 'filled' => {
    const linear = (i-1)*(KN_W+1) + w + 1;
    if (linear > knapCurLinear) return 'future';
    if (linear === knapCurLinear) return 'current';
    return 'filled';
  }, [knapCurLinear]);

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

      {/* 1. DP 핵심 개념 */}
      <section>
        <SH emoji="🧩" title="DP 핵심 개념" id={`${topic.id}-sec-concept`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 p-4">
            <p className="font-bold text-blue-800 dark:text-blue-200 mb-2">최적 부분구조 (Optimal Substructure)</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed mb-2">큰 문제의 최적해 안에 작은 부분 문제의 최적해가 포함된다.</p>
            <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
              <li>• 최단경로: dist(s→v) = dist(s→u) + w(u,v)</li>
              <li>• LCS: X[m]=Y[n]이면 LCS(m,n) = LCS(m-1,n-1)+1</li>
              <li>• Knapsack: dp[i][w] = max(dp[i-1][w], dp[i-1][w-wᵢ]+vᵢ)</li>
            </ul>
          </div>
          <div className="rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/10 p-4">
            <p className="font-bold text-violet-800 dark:text-violet-200 mb-2">중복 부분문제 (Overlapping Subproblems)</p>
            <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed mb-2">같은 부분 문제를 여러 번 계산. DP는 이를 저장해 재활용.</p>
            <div className="font-mono text-xs text-violet-600 dark:text-violet-400 space-y-0.5">
              <p>fib(5)</p>
              <p className="pl-2">├ fib(4)</p>
              <p className="pl-4">│ ├ fib(3) ← 중복!</p>
              <p className="pl-4">│ └ fib(2) ← 중복!</p>
              <p className="pl-2">└ fib(3) ← 중복!</p>
            </div>
          </div>
        </div>
        {/* Fibonacci analogy */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1.5">피보나치 예제: 재귀 vs 메모이제이션</p>
          <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
            <li>&bull; <span className="font-bold">순수 재귀</span>: fib(5)를 계산하면 fib(3)을 2번, fib(2)를 3번 계산 &rarr; 지수적 O(2^n)</li>
            <li>&bull; <span className="font-bold">메모이제이션</span>: 한 번 계산한 값을 저장 &rarr; fib(1)~fib(5)를 각 1번만 &rarr; O(n)</li>
            <li>&bull; <span className="font-bold">핵심</span>: &quot;중복 계산을 캐싱&quot;이 DP의 본질</li>
          </ul>
        </div>
        {/* DP 4 steps */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 mb-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">DP 문제 풀이 4단계</p>
          <ol className="space-y-2">
            {[
              { title: '부분문제 정의', desc: 'dp[i][j]가 무엇을 의미하는지 명확히' },
              { title: '점화식 도출', desc: '큰 문제를 작은 문제로 표현' },
              { title: '기저 조건', desc: 'dp[0], dp[i][0] 등 초기값 설정' },
              { title: '계산 순서', desc: 'Bottom-up은 작은 것부터, Top-down은 재귀' },
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                <span><span className="font-semibold text-slate-700 dark:text-slate-300">{step.title}</span>: {step.desc}</span>
              </li>
            ))}
          </ol>
        </div>
        {/* Memo vs Tabulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {[
            { name: '메모이제이션 (Top-Down)', color: 'emerald', items: ['재귀 + 캐시','필요한 부분만 계산','직관적 구현','재귀 스택 비용 있음'] },
            { name: '타뷸레이션 (Bottom-Up)',  color: 'amber',   items: ['반복문 + 테이블','모든 부분문제 계산','스택 오버플로 없음','공간 최적화 가능'] },
          ].map(c => (
            <div key={c.name} className={`rounded-xl border border-${c.color}-200 dark:border-${c.color}-800/40 bg-${c.color}-50 dark:bg-${c.color}-900/10 p-3`}>
              <p className={`font-bold text-${c.color}-800 dark:text-${c.color}-200 text-sm mb-2`}>{c.name}</p>
              {c.items.map((it, i) => (
                <p key={i} className={`text-xs text-${c.color}-700 dark:text-${c.color}-300 flex items-center gap-1.5`}>
                  <span className={`h-1.5 w-1.5 rounded-full bg-${c.color}-500 flex-shrink-0`} />{it}
                </p>
              ))}
            </div>
          ))}
        </div>
        <ul className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
          {[
            'DP = 최적 부분구조 + 중복 부분문제 — 두 조건이 모두 성립해야 DP 적용 가능',
            '그리디는 매 단계 최선 선택이 전체 최적을 보장할 때만 사용 가능',
            '분할정복은 부분문제가 독립적 (중복 없음) — DP와 차이점',
          ].map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />{pt}
            </li>
          ))}
        </ul>
      </section>

      {/* 2. LCS 인터랙티브 DP 테이블 */}
      <section>
        <SH emoji="🔤" title="LCS 인터랙티브 DP 테이블" id={`${topic.id}-sec-lcs`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            LCS란? &quot;두 문자열에서 순서를 유지하며 공통으로 등장하는 가장 긴 부분수열&quot;. 예: &quot;ABCDE&quot;와 &quot;ACDBE&quot; &rarr; LCS = &quot;ACDE&quot; (길이 4). 연속할 필요 없음 — 부분문자열(substring)과 다름!
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1.5">점화식 직관</p>
          <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
            <li>&bull; <span className="font-bold">X[i] == Y[j]</span>: 두 문자가 같으면, 둘 다 LCS에 포함! &rarr; dp[i-1][j-1]+1</li>
            <li>&bull; <span className="font-bold">X[i] &ne; Y[j]</span>: 둘 중 하나를 제외한 최대값 &rarr; max(dp[i-1][j], dp[i][j-1])</li>
          </ul>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10 p-3 mb-4">
          <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">시험 포인트</p>
          <ul className="space-y-1">
            <li className="text-sm text-red-700 dark:text-red-300">&bull; LCS는 부분수열(not 연속)</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 역추적(backtracking)으로 실제 수열 복원 가능</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            X = &quot;{LCS_X.join('')}&quot;, Y = &quot;{LCS_Y.join('')}&quot;
          </p>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-4">
            점화식: X[i]=Y[j]이면 dp[i][j]=dp[i-1][j-1]+1, 아니면 max(dp[i-1][j], dp[i][j-1])
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="border-collapse text-center text-sm mx-auto">
              <thead>
                <tr>
                  <td className="w-8 h-8" />
                  <td className="w-8 h-8 text-xs text-slate-400">ε</td>
                  {LCS_Y.map((c, j) => (
                    <td key={j} className="w-8 h-8 text-xs font-bold text-blue-600 dark:text-blue-400">{c}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: M+1 }, (_, i) => (
                  <tr key={i}>
                    <td className="w-8 h-8 text-xs font-bold text-violet-600 dark:text-violet-400">
                      {i === 0 ? 'ε' : LCS_X[i-1]}
                    </td>
                    {Array.from({ length: N+1 }, (_, j) => {
                      const state = i === 0 || j === 0 ? 'filled' : getCellState(i, j);
                      const isOnPath = showBacktrack && LCS_PATH.some(([pi,pj]) => pi===i && pj===j);
                      const isMatch  = i > 0 && j > 0 && LCS_X[i-1] === LCS_Y[j-1];
                      let cls = 'border border-slate-200 dark:border-slate-700 ';
                      if (isOnPath) cls += 'bg-amber-200 dark:bg-amber-700/60 font-black text-amber-900 dark:text-amber-100 ring-2 ring-amber-400';
                      else if (state === 'current') cls += 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400';
                      else if (state === 'filled' && isMatch && i>0 && j>0) cls += 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200';
                      else if (state === 'filled' && i>0 && j>0) cls += 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
                      else if (state === 'future') cls += 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600';
                      else cls += 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                      const val = state === 'future' ? '' : String(LCS_TABLE[i][j]);
                      return <td key={j} className={`w-8 h-8 text-xs ${cls} transition-all`}>{val}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Current cell info */}
          {lcsStep >= 1 && lcsStep <= LCS_TOTAL_CELLS && (() => {
            const i = Math.ceil(lcsStep / N);
            const j = ((lcsStep-1) % N) + 1;
            const match = LCS_X[i-1] === LCS_Y[j-1];
            return (
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 mb-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  dp[{i}][{j}] ({LCS_X[i-1]}↔{LCS_Y[j-1]}):{' '}
                </span>
                {match
                  ? <span className="text-emerald-600 dark:text-emerald-400">일치! dp[{i-1}][{j-1}]+1 = {LCS_TABLE[i][j]}</span>
                  : <span className="text-blue-600 dark:text-blue-400">불일치. max(dp[{i-1}][{j}]={LCS_TABLE[i-1][j]}, dp[{i}][{j-1}]={LCS_TABLE[i][j-1]}) = {LCS_TABLE[i][j]}</span>
                }
              </div>
            );
          })()}
          {showBacktrack && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3 mb-3 text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300">역추적 결과: LCS = </span>
              <span className="font-mono font-black text-amber-700 dark:text-amber-200">
                {LCS_PATH.map(([i,j]) => LCS_X[i-1]).join('')}
              </span>
              <span className="text-amber-600 dark:text-amber-400 ml-1">(길이 {LCS_PATH.length})</span>
            </div>
          )}
          {/* Nav */}
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setLcsStep(s => Math.max(0, s-1))} disabled={lcsStep===0}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">◀ 이전</button>
            <span className="text-xs text-slate-500">
              {lcsStep === 0 ? '빈 테이블' : lcsStep <= LCS_TOTAL_CELLS ? `셀 ${lcsStep}/${LCS_TOTAL_CELLS} 채우는 중` : '역추적 완료'}
            </span>
            <button onClick={() => setLcsStep(s => Math.min(LCS_TOTAL_CELLS+1, s+1))} disabled={lcsStep===LCS_TOTAL_CELLS+1}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">다음 ▶</button>
          </div>
        </div>
      </section>

      {/* 3. 0-1 Knapsack */}
      <section>
        <SH emoji="🎒" title="0-1 Knapsack DP 테이블" id={`${topic.id}-sec-knapsack`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            각 물건을 &quot;넣거나(1) 말거나(0)&quot; - 쪼갤 수 없다. dp[i][w] = 물건 1~i까지 고려, 무게 한도 w일 때 최대 가치.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1.5">점화식 직관</p>
          <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
            <li>&bull; 물건 i를 넣을 수 없음(w&#x1D456; &gt; w): dp[i-1][w] (이전 결과 그대로)</li>
            <li>&bull; 물건 i를 넣을 수 있음: max(넣지 않는 경우: dp[i-1][w], 넣는 경우: dp[i-1][w-w&#x1D456;]+v&#x1D456;)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10 p-3 mb-4">
          <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">시험 포인트 — 0-1 vs Fractional Knapsack</p>
          <ul className="space-y-1">
            <li className="text-sm text-red-700 dark:text-red-300">&bull; <span className="font-bold">0-1 Knapsack</span>: DP 필요, 물건 쪼갤 수 없음</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; <span className="font-bold">Fractional Knapsack</span>: Greedy로 풀 수 있음 (단위 가치 순 정렬 후 채우기)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">최대 용량 W={KN_W}</span>
            {KN_ITEMS.map((it, i) => (
              <span key={i} className="rounded-full px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {it.name}: w={it.w}, v={it.v}
              </span>
            ))}
          </div>
          <div className="overflow-x-auto mb-4">
            <table className="border-collapse text-center text-xs mx-auto">
              <thead>
                <tr>
                  <th className="px-2 py-1.5 text-slate-500 dark:text-slate-400">아이템 \\ w</th>
                  {Array.from({ length: KN_W+1 }, (_, w) => (
                    <th key={w} className="w-9 py-1.5 text-slate-500 dark:text-slate-400">{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: KN_ITEMS.length+1 }, (_, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1.5 font-bold text-violet-600 dark:text-violet-400 text-left">
                      {i === 0 ? '없음' : KN_ITEMS[i-1].name}
                    </td>
                    {Array.from({ length: KN_W+1 }, (_, w) => {
                      const state = i === 0 ? 'filled' : getKnapState(i, w);
                      const isSelected = showKnapBt && KNAP_SELECTED.includes(i-1);
                      const inPath = showKnapBt && (() => {
                        let wi = KN_W;
                        for (let ii = KN_ITEMS.length; ii >= 1; ii--) {
                          if (KNAP_TABLE[ii][wi] !== KNAP_TABLE[ii-1][wi]) {
                            if (ii === i && wi === w) return true;
                            wi -= KN_ITEMS[ii-1].w;
                          }
                        }
                        return false;
                      })();
                      let cls = 'border border-slate-200 dark:border-slate-700 w-9 h-8 ';
                      if (inPath) cls += 'bg-amber-200 dark:bg-amber-700/60 font-black text-amber-900 dark:text-amber-100';
                      else if (state === 'current') cls += 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400';
                      else if (state === 'filled' && isSelected) cls += 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200';
                      else if (state === 'filled') cls += 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
                      else cls += 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600';
                      return (
                        <td key={w} className={`text-xs ${cls} transition-all`}>
                          {state === 'future' ? '' : String(KNAP_TABLE[i][w])}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Current cell decision */}
          {knapStep >= 1 && knapStep <= KNAP_TOTAL && (() => {
            const i = Math.ceil(knapStep / (KN_W+1));
            const w = ((knapStep-1) % (KN_W+1));
            const item = KN_ITEMS[i-1];
            const canTake = item.w <= w;
            return (
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 mb-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">dp[{i}][{w}] ({item.name}, w={w}):{' '}</span>
                {!canTake
                  ? <span className="text-slate-500 dark:text-slate-400">무게 초과 → dp[{i-1}][{w}]={KNAP_TABLE[i-1][w]}</span>
                  : <span className="text-blue-600 dark:text-blue-400">
                      포함 dp[{i-1}][{w-item.w}]+{item.v}={KNAP_TABLE[i-1][w-item.w]+item.v} vs 미포함 dp[{i-1}][{w}]={KNAP_TABLE[i-1][w]}
                      {' → '}<span className="font-bold text-emerald-600 dark:text-emerald-400">max={KNAP_TABLE[i][w]}</span>
                    </span>
                }
              </div>
            );
          })()}
          {showKnapBt && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 p-3 mb-3 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">선택된 물품: </span>
              {KNAP_SELECTED.map(i => (
                <span key={i} className="mr-2 font-mono text-emerald-700 dark:text-emerald-200">
                  {KN_ITEMS[i].name}(w={KN_ITEMS[i].w},v={KN_ITEMS[i].v})
                </span>
              ))}
              <span className="text-emerald-600 dark:text-emerald-400 ml-1">
                → 총 가치={KNAP_SELECTED.reduce((s,i)=>s+KN_ITEMS[i].v,0)}, 총 무게={KNAP_SELECTED.reduce((s,i)=>s+KN_ITEMS[i].w,0)}
              </span>
            </div>
          )}
          {/* Nav */}
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setKnapStep(s => Math.max(0, s-1))} disabled={knapStep===0}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">◀ 이전</button>
            <span className="text-xs text-slate-500">
              {knapStep === 0 ? '빈 테이블' : knapStep <= KNAP_TOTAL ? `셀 ${knapStep}/${KNAP_TOTAL}` : '역추적 완료'}
            </span>
            <button onClick={() => setKnapStep(s => Math.min(KNAP_TOTAL+1, s+1))} disabled={knapStep===KNAP_TOTAL+1}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">다음 ▶</button>
          </div>
        </div>
      </section>

      {/* 4. 편집 거리 */}
      <section>
        <SH emoji="✏️" title="편집 거리 (Edit Distance)" id={`${topic.id}-sec-edit`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            편집 거리(Levenshtein Distance): 한 문자열을 다른 문자열로 바꾸는 최소 연산 수 (삽입/삭제/교체 각 비용 1). 활용: 맞춤법 검사, DNA 서열 비교, 버전 관리 diff.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1.5">점화식 직관</p>
          <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
            <li>&bull; <span className="font-bold">s[i] == t[j]</span>: 이 문자는 비용 없음 &rarr; dp[i-1][j-1]</li>
            <li>&bull; <span className="font-bold">s[i] &ne; t[j]</span>: 세 연산 중 최소 &rarr; min(삭제: dp[i-1][j]+1, 삽입: dp[i][j-1]+1, 교체: dp[i-1][j-1]+1)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="flex gap-4 mb-3 text-sm flex-wrap">
            <span className="font-mono font-bold text-blue-700 dark:text-blue-300">s = &quot;{ED_S}&quot;</span>
            <span className="font-mono font-bold text-violet-700 dark:text-violet-300">t = &quot;{ED_T}&quot;</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 self-end">연산: 삽입/삭제/교체 각 비용 1</span>
          </div>
          <button
            onClick={() => setEdStep(s => 1 - s)}
            className="mb-4 px-4 py-1.5 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition"
          >
            {edStep === 0 ? 'DP 테이블 보기 ▶' : '테이블 숨기기'}
          </button>
          {edStep === 1 && (
            <>
              <div className="overflow-x-auto mb-3">
                <table className="border-collapse text-center text-xs mx-auto">
                  <thead>
                    <tr>
                      <td className="w-8 h-7" />
                      <td className="w-8 h-7 text-slate-400">ε</td>
                      {ED_T.split('').map((c, j) => (
                        <td key={j} className="w-8 h-7 font-bold text-violet-600 dark:text-violet-400">{c}</td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: ED_S.length+1 }, (_, i) => (
                      <tr key={i}>
                        <td className="w-8 h-7 font-bold text-blue-600 dark:text-blue-400 text-left px-1">
                          {i === 0 ? 'ε' : ED_S[i-1]}
                        </td>
                        {Array.from({ length: ED_T.length+1 }, (_, j) => {
                          const val = EDIT_TABLE[i][j];
                          const isMatch = i>0 && j>0 && ED_S[i-1]===ED_T[j-1];
                          const isFinal = i===ED_S.length && j===ED_T.length;
                          let cls = 'border border-slate-200 dark:border-slate-700 w-8 h-7 ';
                          if (isFinal) cls += 'bg-amber-200 dark:bg-amber-700/60 font-black text-amber-900 dark:text-amber-100 ring-2 ring-amber-400';
                          else if (isMatch) cls += 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200';
                          else cls += 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400';
                          return <td key={j} className={`text-xs ${cls}`}>{val}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3 text-sm">
                <span className="font-bold text-amber-800 dark:text-amber-300">편집 거리 = </span>
                <span className="font-mono font-black text-amber-700 dark:text-amber-200 text-lg">
                  {EDIT_TABLE[ED_S.length][ED_T.length]}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">
                  KITTEN → SITTING: K→S(교체), E→I(교체), +(삽입G) = 3번
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 5. Greedy vs DP */}
      <section>
        <SH emoji="⚔️" title="Greedy vs DP" id={`${topic.id}-sec-greedy`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { name: '탐욕 (Greedy)', color: 'amber', props: ['매 단계 현재 최선 선택','전체 최적 보장 안됨','빠름 O(n log n) 이하','최적 부분구조 + 탐욕 선택 속성 필요','Huffman, Dijkstra, MST에 적용'] },
            { name: '동적 프로그래밍 (DP)', color: 'blue', props: ['모든 경우를 테이블에 저장','전체 최적 보장','느릴 수 있음 O(n²) 이상','최적 부분구조 + 중복 부분문제 필요','LCS, Knapsack, Edit Distance에 적용'] },
          ].map(c => (
            <div key={c.name} className={`rounded-xl border-2 border-${c.color}-200 dark:border-${c.color}-800 bg-${c.color}-50 dark:bg-${c.color}-900/10 p-4`}>
              <p className={`font-bold text-${c.color}-800 dark:text-${c.color}-200 mb-3`}>{c.name}</p>
              {c.props.map((p, i) => (
                <p key={i} className={`text-xs text-${c.color}-700 dark:text-${c.color}-300 flex items-center gap-1.5 mb-1`}>
                  <span className={`h-1.5 w-1.5 rounded-full bg-${c.color}-500 flex-shrink-0`} />{p}
                </p>
              ))}
            </div>
          ))}
        </div>
        {/* Greedy failure example */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 mb-4">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">LCS에서 Greedy 실패 예시</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">X=&quot;ACDBE&quot;, Y=&quot;ABCDE&quot;</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 p-3">
              <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">Greedy (욕심쟁이)</p>
              <p className="text-xs text-red-600 dark:text-red-400">A→A 첫 매치 선택, 그 다음 C... 결과: &quot;ACE&quot; (길이 3)</p>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">❌ 최적이 아님!</p>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40 p-3">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">DP (동적 프로그래밍)</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">모든 경우 탐색, 결과: &quot;ACDE&quot; (길이 4)</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">✅ 최적 보장!</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/10 space-y-2">
          {[
            'LCS, 0-1 Knapsack은 Greedy 불가 — DP 필수',
            'Fractional Knapsack은 Greedy 가능 (무게 비율로 정렬)',
            'Dijkstra는 음수 간선 없을 때만 Greedy 가능',
            'Huffman coding은 Greedy — 탐욕 선택 속성 성립',
          ].map((p, i) => (
            <p key={i} className="flex gap-2 text-sm text-red-700 dark:text-red-300"><span>⚠</span>{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
