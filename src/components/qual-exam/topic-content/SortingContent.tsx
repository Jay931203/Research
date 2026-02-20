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

/* ── Pre-computed Lomuto partition steps ── */
type PartStep = {
  arr: number[];
  i: number;
  j: number;
  pivot: number;
  pivotIdx: number;
  phase: 'scan' | 'swap' | 'place' | 'done';
  note: string;
};

const PART_STEPS: PartStep[] = [
  { arr: [37,22,81,63,19,53,47], i: -1, j: 0,  pivot: 47, pivotIdx: 6, phase: 'scan',  note: '초기 상태: pivot=A[6]=47, i=-1, j=0부터 스캔' },
  { arr: [37,22,81,63,19,53,47], i:  0, j: 0,  pivot: 47, pivotIdx: 6, phase: 'swap',  note: 'j=0, A[0]=37 ≤ 47 → i++ = 0, swap(A[0],A[0]) (변화 없음)' },
  { arr: [37,22,81,63,19,53,47], i:  1, j: 1,  pivot: 47, pivotIdx: 6, phase: 'swap',  note: 'j=1, A[1]=22 ≤ 47 → i++ = 1, swap(A[1],A[1]) (변화 없음)' },
  { arr: [37,22,81,63,19,53,47], i:  1, j: 2,  pivot: 47, pivotIdx: 6, phase: 'scan',  note: 'j=2, A[2]=81 > 47 → skip (i 변화 없음)' },
  { arr: [37,22,81,63,19,53,47], i:  1, j: 3,  pivot: 47, pivotIdx: 6, phase: 'scan',  note: 'j=3, A[3]=63 > 47 → skip (i 변화 없음)' },
  { arr: [37,22,19,63,81,53,47], i:  2, j: 4,  pivot: 47, pivotIdx: 6, phase: 'swap',  note: 'j=4, A[4]=19 ≤ 47 → i++ = 2, swap(A[2],A[4]) → 81↔19' },
  { arr: [37,22,19,63,81,53,47], i:  2, j: 5,  pivot: 47, pivotIdx: 6, phase: 'scan',  note: 'j=5, A[5]=53 > 47 → skip (i 변화 없음)' },
  { arr: [37,22,19,47,81,53,63], i:  3, j: 5,  pivot: 47, pivotIdx: 3, phase: 'place', note: '루프 종료. swap(A[i+1=3], A[6]=pivot) → pivot 47이 인덱스 3으로 이동!' },
  { arr: [37,22,19,47,81,53,63], i:  3, j: 5,  pivot: 47, pivotIdx: 3, phase: 'done',  note: '파티션 완료! 왼쪽[0..2]=[37,22,19] ≤ 47, 오른쪽[4..6]=[81,53,63] > 47' },
];

/* ── Pre-computed MergeSort steps ── */
type MergeStep = {
  type: 'split' | 'merge';
  left: number[];
  right: number[];
  result: number[];
  desc: string;
};

const MERGE_STEPS: MergeStep[] = [
  { type: 'split', left: [38,27,43], right: [3,9,10], result: [], desc: '분할: [38,27,43,3,9,10] → [38,27,43] | [3,9,10]' },
  { type: 'split', left: [38],       right: [27,43],  result: [], desc: '분할: [38,27,43] → [38] | [27,43]' },
  { type: 'split', left: [27],       right: [43],     result: [], desc: '분할: [27,43] → [27] | [43]' },
  { type: 'merge', left: [27],       right: [43],     result: [27,43],       desc: '병합: [27] + [43] → [27,43]' },
  { type: 'merge', left: [38],       right: [27,43],  result: [27,38,43],    desc: '병합: [38] + [27,43] → [27,38,43]' },
  { type: 'split', left: [3],        right: [9,10],   result: [], desc: '분할: [3,9,10] → [3] | [9,10]' },
  { type: 'split', left: [9],        right: [10],     result: [], desc: '분할: [9,10] → [9] | [10]' },
  { type: 'merge', left: [9],        right: [10],     result: [9,10],        desc: '병합: [9] + [10] → [9,10]' },
  { type: 'merge', left: [3],        right: [9,10],   result: [3,9,10],      desc: '병합: [3] + [9,10] → [3,9,10]' },
  { type: 'merge', left: [27,38,43], right: [3,9,10], result: [3,9,10,27,38,43], desc: '최종 병합: [27,38,43] + [3,9,10] → [3,9,10,27,38,43] ✓' },
];

/* ── T/F Quiz data ── */
type QuizItem = { q: string; answer: boolean; explanation: string };
const QUIZ_ITEMS: QuizItem[] = [
  { q: 'QuickSort는 항상 O(n log n)이다', answer: false, explanation: '최악(이미 정렬된 배열+고정 피벗)은 O(n²). 랜덤 피벗이나 median-of-3으로 완화 가능.' },
  { q: 'MergeSort는 in-place 정렬이다', answer: false, explanation: 'MergeSort는 병합 시 O(n) 추가 공간이 필요. in-place 버전은 O(n log²n)으로 느려짐.' },
  { q: 'HeapSort는 안정(stable) 정렬이다', answer: false, explanation: 'HeapSort는 불안정(unstable). 동일 값의 상대 순서가 바뀔 수 있음.' },
  { q: 'InsertionSort의 최선 시간복잡도는 O(n)이다', answer: true, explanation: '이미 정렬된 배열에서 각 원소 삽입 시 비교 1번. 총 O(n) 비교.' },
  { q: '비교 기반 정렬은 O(n)도 가능하다', answer: false, explanation: '결정 트리 argument: n! 리프 → 높이 ≥ log₂(n!) = Ω(n log n). 비교 기반 정렬 하한은 Ω(n log n).' },
];

export default function SortingContent({ topic }: Props) {
  const [partStep, setPartStep] = useState(0);
  const [mergeStep, setMergeStep] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>([false,false,false,false,false]);

  const toggleReveal = useCallback((i: number) => {
    setRevealed(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }, []);

  const ps = PART_STEPS[partStep];
  const ms = MERGE_STEPS[mergeStep];

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

      {/* 1. 비교표 */}
      <section>
        <SH emoji="📊" title="알고리즘 비교표" id={`${topic.id}-sec-compare`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            정렬 알고리즘의 선택 기준은 단순히 &quot;빠름&quot;이 아니다. 데이터 크기, 메모리 제약, 안정성 요구, 데이터의 정렬 정도에 따라 최적 알고리즘이 달라진다.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                {['알고리즘','최선','평균','최악','공간','안정성','특징'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                { name: 'QuickSort',     best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)',      space: 'O(log n)', stable: false, note: '피벗 선택이 핵심, 실제 가장 빠름' },
                { name: 'MergeSort',     best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',     stable: true,  note: '안정, 외부 정렬, Linked List에 유리' },
                { name: 'HeapSort',      best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)',     stable: false, note: 'in-place, 캐시 지역성 낮음' },
                { name: 'InsertionSort', best: 'O(n)',       avg: 'O(n²)',      worst: 'O(n²)',      space: 'O(1)',     stable: true,  note: '소규모/거의 정렬된 데이터 최고' },
                { name: 'BubbleSort',    best: 'O(n)',       avg: 'O(n²)',      worst: 'O(n²)',      space: 'O(1)',     stable: true,  note: '교육용, 실용성 낮음' },
              ].map(row => (
                <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200 font-mono text-xs">{row.name}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="rounded px-1.5 py-0.5 text-xs font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{row.best}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-mono font-bold ${row.avg === 'O(n log n)' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>{row.avg}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-mono font-bold ${row.worst === 'O(n log n)' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>{row.worst}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-xs text-slate-600 dark:text-slate-400">{row.space}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-xs font-bold ${row.stable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{row.stable ? '안정 ✓' : '불안정 ✗'}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* When to use which sort */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 mb-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">언제 어떤 정렬?</p>
          <ol className="space-y-2">
            {[
              { label: '일반 목적', val: 'QuickSort', why: '실제 가장 빠름, 캐시 친화적' },
              { label: '안정성 필요', val: 'MergeSort', why: '2차 정렬 기준 유지 (e.g., 이름→학번 순)' },
              { label: '메모리 제한', val: 'HeapSort', why: 'O(1) extra space, in-place' },
              { label: '거의 정렬된 데이터', val: 'InsertionSort', why: 'O(n) best case, 실제 빠름' },
              { label: 'Linked List 정렬', val: 'MergeSort', why: '랜덤 접근 불필요, 포인터만 수정' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                <span><span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span> {'\u2192'} <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{item.val}</span> <span className="text-slate-500 dark:text-slate-500">({item.why})</span></span>
              </li>
            ))}
          </ol>
        </div>
        {/* Callout */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">비교 기반 정렬 하한 (Information-Theoretic Lower Bound)</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            어떤 비교 기반 정렬도 <span className="font-mono font-black">Ω(n log n)</span>보다 빠를 수 없다.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1.5">
            결정 트리(decision tree)에서 n개 원소를 정렬하는 리프 수 = n! → 트리 높이 ≥ log₂(n!) ≈ n log₂n (Stirling 근사)
          </p>
        </div>
      </section>

      {/* 2. QuickSort 파티션 시뮬레이터 */}
      <section>
        <SH emoji="⚡" title="QuickSort 파티션 시뮬레이터 (Lomuto)" id={`${topic.id}-sec-quicksort`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            &quot;피벗보다 작은 것들은 왼쪽, 큰 것들은 오른쪽&quot; - 이것만 반복하면 된다. 분할 정복(Divide &amp; Conquer): 큰 문제를 피벗 기준으로 두 작은 문제로 나눈다.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 mb-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Lomuto 파티션 동작 원리</p>
          <ol className="space-y-2">
            {[
              'A[high]를 pivot으로 선택',
              'i = low-1 (작은 영역의 경계 포인터)',
              'j를 low에서 high-1까지 이동: A[j] ≤ pivot이면 i++, swap(A[i], A[j])로 왼쪽 영역에 편입',
              '마지막에 swap(A[i+1], A[high])로 pivot을 제자리에 위치시킴',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10 p-3 mb-4">
          <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">시험 포인트</p>
          <ul className="space-y-1">
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 최악의 경우 O(n&sup2;): 이미 정렬된 배열에서 항상 최솟값/최댓값을 피벗으로 선택할 때</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 평균 O(n log n): 랜덤 피벗이면 기대값</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 안정하지 않다 (같은 값의 상대 순서 바뀔 수 있음)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            A = [37, 22, 81, 63, 19, 53, 47], pivot = A[6] = 47
          </p>
          {/* Array display */}
          <div className="flex flex-wrap gap-2 mb-4">
            {ps.arr.map((val, idx) => {
              const isPivot    = idx === ps.pivotIdx;
              const isI        = idx === ps.i;
              const isJ        = idx === ps.j && ps.phase !== 'done' && ps.phase !== 'place';
              const isSmall    = !isPivot && idx <= ps.i && ps.i >= 0;
              let bg = 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
              if (isPivot)      bg = 'bg-amber-400 text-white ring-2 ring-amber-300';
              else if (isI && isJ) bg = 'bg-purple-500 text-white ring-2 ring-purple-300';
              else if (isI)     bg = 'bg-blue-500 text-white ring-2 ring-blue-300';
              else if (isJ)     bg = 'bg-orange-400 text-white ring-2 ring-orange-300';
              else if (isSmall) bg = 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-200';
              return (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-black transition-all ${bg}`}>{val}</div>
                  <span className="text-[10px] font-mono text-slate-400">{idx}</span>
                  <span className="text-[10px] font-bold">
                    {isPivot ? <span className="text-amber-500">piv</span> : isI && isJ ? <span className="text-purple-500">i=j</span> : isI ? <span className="text-blue-500">i</span> : isJ ? <span className="text-orange-500">j</span> : ''}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-3 text-xs">
            {[['bg-amber-400','피벗'],['bg-blue-500','i 포인터'],['bg-orange-400','j 포인터'],['bg-emerald-200 border','≤ 피벗']].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className={`h-3.5 w-3.5 rounded ${c} inline-block`} />
                <span className="text-slate-500 dark:text-slate-400">{l}</span>
              </span>
            ))}
          </div>
          {/* Step description */}
          <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 mb-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">단계 {partStep + 1} / {PART_STEPS.length}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{ps.note}</p>
            {ps.phase === 'done' && (
              <p className="mt-2 text-sm font-black text-emerald-600 dark:text-emerald-400">피벗 47이 인덱스 3에 정착!</p>
            )}
          </div>
          {/* Nav */}
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setPartStep(s => Math.max(0, s-1))} disabled={partStep===0}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">◀ 이전</button>
            <span className="text-xs text-slate-500">단계 {partStep+1} / {PART_STEPS.length}</span>
            <button onClick={() => setPartStep(s => Math.min(PART_STEPS.length-1, s+1))} disabled={partStep===PART_STEPS.length-1}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">다음 ▶</button>
          </div>
        </div>
        {/* Complexity note */}
        <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
          {[
            { label: '최선 (균등 분할)', val: 'O(n log n)', color: 'text-emerald-600 dark:text-emerald-400' },
            { label: '평균 (랜덤 피벗)', val: 'O(n log n)', color: 'text-blue-600 dark:text-blue-400' },
            { label: '최악 (이미 정렬)', val: 'O(n²)', color: 'text-red-600 dark:text-red-400' },
          ].map(c => (
            <div key={c.label} className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5">
              <div className={`font-mono font-black text-base ${c.color}`}>{c.val}</div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MergeSort */}
      <section>
        <SH emoji="🔀" title="MergeSort 분할·병합 추적" id={`${topic.id}-sec-mergesort`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            &quot;이미 정렬된 두 배열을 합치는 건 O(n)으로 쉽다&quot; - Merge 연산의 단순함이 MergeSort의 힘. 점화식 T(n) = 2T(n/2) + O(n) → Master Theorem으로 O(n log n).
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 mb-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">분할·정복·합병 동작 원리</p>
          <ol className="space-y-2">
            {[
              '분할: 배열을 절반으로 재귀 분할 → 크기 1이 될 때까지',
              '정복: 크기 1 배열은 이미 정렬됨',
              '합병: 두 정렬된 부분을 하나로 합침 (Merge)',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10 p-3 mb-4">
          <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">시험 포인트</p>
          <ul className="space-y-1">
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 항상 O(n log n) - 입력 상태와 무관</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; O(n) 추가 메모리 필요 (in-place 아님)</li>
            <li className="text-sm text-red-700 dark:text-red-300">&bull; 안정(stable) 정렬 - 동일 값의 상대 순서 보존</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            입력: [38, 27, 43, 3, 9, 10]
          </p>
          <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 mb-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">단계 {mergeStep + 1} / {MERGE_STEPS.length}</p>
            <p className="text-sm font-semibold mb-3" style={{ color: ms.type === 'split' ? '#3b82f6' : '#10b981' }}>
              {ms.type === 'split' ? '🔵 분할' : '🟢 병합'} — {ms.desc}
            </p>
            {/* Visual */}
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-[10px] text-slate-400 mb-1.5">왼쪽</p>
                <div className="flex gap-1.5">
                  {ms.left.map((v, i) => (
                    <div key={i} className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shadow ${ms.type === 'split' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'}`}>{v}</div>
                  ))}
                </div>
              </div>
              <div className="text-slate-400 text-xl font-bold">{ms.type === 'split' ? '|' : '+'}</div>
              <div>
                <p className="text-[10px] text-slate-400 mb-1.5">오른쪽</p>
                <div className="flex gap-1.5">
                  {ms.right.map((v, i) => (
                    <div key={i} className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shadow ${ms.type === 'split' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'}`}>{v}</div>
                  ))}
                </div>
              </div>
              {ms.result.length > 0 && (
                <>
                  <div className="text-slate-400 text-xl font-bold">→</div>
                  <div>
                    <p className="text-[10px] text-amber-500 mb-1.5">결과</p>
                    <div className="flex gap-1.5">
                      {ms.result.map((v, i) => (
                        <div key={i} className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shadow bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">{v}</div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Nav */}
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setMergeStep(s => Math.max(0, s-1))} disabled={mergeStep===0}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition">◀ 이전</button>
            <span className="text-xs text-slate-500">단계 {mergeStep+1} / {MERGE_STEPS.length}</span>
            <button onClick={() => setMergeStep(s => Math.min(MERGE_STEPS.length-1, s+1))} disabled={mergeStep===MERGE_STEPS.length-1}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">다음 ▶</button>
          </div>
        </div>
        <ul className="mt-3 space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
          {[
            'MergeSort는 안정(stable) 정렬 — 동일 키 원소의 상대 순서 보존',
            'NOT in-place — 병합 시 O(n) 추가 공간 필요 (total space: O(n))',
            '점화식 T(n) = 2T(n/2) + O(n) → Master Theorem으로 O(n log n)',
            'Linked List 정렬에 특히 유리 (인덱스 접근 불필요)',
          ].map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />{pt}
            </li>
          ))}
        </ul>
      </section>

      {/* 4. 정렬 하한 & 비교 없는 정렬 */}
      <section>
        <SH emoji="📐" title="정렬 하한 & 비교 없는 정렬" id={`${topic.id}-sec-lowerbound`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            비교 기반 정렬은 O(n log n)보다 빠를 수 없다 - 수학적 증명. n개 원소의 모든 가능한 순열 = n! 가지, 각 비교 결과는 트리를 양분, n!개의 리프 &rarr; 최소 트리 높이 &asymp; n log n (Stirling 근사). 따라서 어떤 비교 기반 정렬도 최악의 경우 &Omega;(n log n) 비교가 필요하다.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1.5">선형 정렬이 가능한 조건: 비교를 안 쓰면 됨</p>
          <ul className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
            <li>&bull; <span className="font-bold">CountingSort</span>: 값이 정수이고 범위가 작을 때 O(n+k)</li>
            <li>&bull; <span className="font-bold">RadixSort</span>: 자릿수 기반, d자리 × O(n) = O(dn)</li>
            <li>&bull; <span className="font-bold">BucketSort</span>: 균등 분포 데이터, 평균 O(n)</li>
          </ul>
        </div>
        {/* Decision tree example */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 mb-4">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">결정 트리 예시 (n=3 원소 a,b,c 정렬)</p>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono">
            <p className="text-center">a≤b?</p>
            <p className="text-center">┌────────────┴────────────┐</p>
            <p className="text-center">Y: b≤c?              N: a≤c?</p>
            <p className="flex justify-between px-4">
              <span>┌────┴────┐</span>
              <span>┌────┴────┐</span>
            </p>
            <p className="flex justify-between px-4">
              <span>Y:[a,b,c]  N:a≤c?</span>
              <span>Y:[b,a,c]  N:b≤c?</span>
            </p>
            <p className="flex justify-between px-8">
              <span>┌─┴─┐</span>
              <span>┌─┴─┐</span>
            </p>
            <p className="flex justify-between px-6">
              <span>[a,c,b]  [c,a,b]</span>
              <span>[b,c,a]  [c,b,a]</span>
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            n=3: 리프 = 3! = 6가지, 높이 ≥ ⌈log₂6⌉ = 3 → 최소 3번 비교 필요
          </p>
        </div>
        {/* Non-comparison sorts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'Counting Sort', color: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200', cx: 'O(n+k)', note: 'k = 값의 범위. k가 작을 때 O(n). 안정.' },
            { name: 'Radix Sort',    color: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10',     badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',     cx: 'O(d·(n+k))', note: 'd = 자릿수, k = 기수. 정수/문자열에 적합.' },
            { name: 'Bucket Sort',   color: 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/10', badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200', cx: 'O(n) avg', note: '균일 분포 가정 시 평균 O(n). 최악 O(n²).' },
          ].map(s => (
            <div key={s.name} className={`rounded-xl border-2 ${s.color} p-4`}>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.badge} mb-2 inline-block`}>{s.name}</span>
              <p className="font-mono text-lg font-black text-slate-800 dark:text-slate-200 mb-1">{s.cx}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 시험 함정 + T/F Quiz */}
      <section>
        <SH emoji="⚠️" title="시험 함정 & True/False 퀴즈" id={`${topic.id}-sec-pitfalls`} />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/10 space-y-2 mb-5">
          {[
            'QuickSort는 평균 O(n log n)이지만 최악은 O(n²) — 이미 정렬된 배열 + 고정 피벗 조심!',
            'HeapSort는 O(n log n) 보장되지만 안정 정렬이 아님',
            'MergeSort의 공간복잡도는 O(n) — in-place가 아님',
            'Build-Heap은 O(n) — n번 삽입 O(n log n)과 다름!',
            '비교 기반 정렬의 하한은 Ω(n log n) — Radix/Counting Sort는 비교 기반이 아님',
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
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.q}</p>
                  {revealed[i] && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{item.explanation}</p>
                  )}
                </div>
                <span className={`ml-auto flex-shrink-0 text-xs font-bold rounded-full px-2 py-0.5 ${revealed[i] ? (item.answer ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300') : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
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
