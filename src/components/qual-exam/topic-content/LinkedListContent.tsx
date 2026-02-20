'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FileText, AlertTriangle } from 'lucide-react';
import type { StudyTopic } from '../TopicStudyCard';
import type { ExamProblem } from '../ExamProblemCard';

const AlgoVisualizer = dynamic(() => import('../AlgoVisualizer'), { ssr: false });

interface Props {
  topic: StudyTopic;
  relatedExams: ExamProblem[];
  onExamClick?: (exam: ExamProblem) => void;
}

/* ── Complexity badge helper ── */
function CxBadge({ cx }: { cx: string }) {
  const isO1 = cx === 'O(1)';
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-bold ${
      isO1
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    }`}>
      {cx}
    </span>
  );
}

/* ── Comparison table data ── */
const compareRows = [
  { op: '임의 접근',         array: 'O(1)',  ll: 'O(n)',  note: '인덱스 vs 순회' },
  { op: '검색',              array: 'O(n)',  ll: 'O(n)',  note: '모두 순차 탐색' },
  { op: '앞에 삽입',         array: 'O(n)',  ll: 'O(1)',  note: '배열은 전부 밀림' },
  { op: '뒤에 삽입',         array: 'O(1)',  ll: 'O(n)*', note: 'LL: tail ptr 없으면 O(n)' },
  { op: '삭제 (위치 알 때)', array: 'O(n)',  ll: 'O(1)',  note: '배열은 당기기 필요' },
  { op: '메모리 레이아웃',   array: '연속',  ll: '분산',  note: '캐시 효율성 차이' },
];

/* ── Array simulator ── */
const INIT_ARR = [10, 20, 30, 40, 50, 60];
type LogEntry = { op: string; cx: string; shift?: number[] };

const difficultyLabel = { basic: '기초', intermediate: '중급', advanced: '고급' };
const difficultyColor = {
  basic: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  advanced: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300',
};

const COLORS = [
  'bg-blue-400', 'bg-violet-400', 'bg-emerald-400',
  'bg-amber-400', 'bg-rose-400', 'bg-teal-400',
  'bg-pink-400', 'bg-indigo-400',
];

/* ── Code tabs (built from topic.codeExamples or hardcoded fallback) ── */
const codeTabsDefault = [
  {
    label: 'LinkedList',
    code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def prepend(self, data):          # O(1)
        node = Node(data)
        node.next = self.head
        self.head = node

    def append(self, data):           # O(n) — no tail ptr
        node = Node(data)
        if not self.head:
            self.head = node; return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node

    def delete_front(self):           # O(1)
        if self.head:
            self.head = self.head.next`,
  },
  {
    label: 'Stack',
    code: `class Stack:
    def __init__(self):
        self._data = []          # Python list (dynamic array)

    def push(self, x):           # O(1) amortized
        self._data.append(x)

    def pop(self):               # O(1)
        if self.is_empty():
            raise IndexError("stack underflow")
        return self._data.pop()

    def peek(self):              # O(1)
        return self._data[-1]

    def is_empty(self):          # O(1)
        return len(self._data) == 0`,
  },
  {
    label: 'Queue',
    code: `from collections import deque

class Queue:
    def __init__(self):
        self._data = deque()     # O(1) front/back ops

    def enqueue(self, x):        # O(1)
        self._data.append(x)

    def dequeue(self):           # O(1)
        if self.is_empty():
            raise IndexError("queue underflow")
        return self._data.popleft()

    def front(self):             # O(1)
        return self._data[0]

    def is_empty(self):          # O(1)
        return len(self._data) == 0`,
  },
];

/* ── Exam traps ── */
const traps = [
  'append는 tail pointer 없으면 O(n) — head에서 끝까지 순회 필요',
  'Python list는 dynamic array (내부 배열), linked list 아님',
  'Stack/Queue는 Python list나 deque로 구현하지만, 개념적 기본 구현은 연결 리스트',
  '연결 리스트 삭제는 이전 노드의 포인터를 바꿔야 하므로 이전 노드를 추적해야 함',
  '배열의 random access가 O(1)인 이유: 베이스 주소 + 인덱스 × 크기로 직접 계산',
];

export default function LinkedListContent({ topic, relatedExams, onExamClick }: Props) {
  const [arr, setArr] = useState<number[]>(INIT_ARR);
  const [shiftIdx, setShiftIdx] = useState<number[]>([]);
  const [lastCx, setLastCx] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [codeTab, setCodeTab] = useState(0);

  // Use topic.codeExamples if available, else fallback
  const codeTabs: { label: string; code: string }[] = (() => {
    const ex = (topic as { codeExamples?: Array<{ caption: string; language: string; code: string }> }).codeExamples;
    if (ex && ex.length >= 3) {
      return ex.map(e => ({ label: e.caption, code: e.code }));
    }
    return codeTabsDefault;
  })();

  function doOp(name: string, cx: string, shiftIndices: number[], updater: (a: number[]) => number[]) {
    setShiftIdx(shiftIndices);
    setLastCx(cx);
    setLog(prev => [{ op: name, cx, shift: shiftIndices }, ...prev].slice(0, 3));
    setTimeout(() => {
      setArr(prev => updater(prev));
      setShiftIdx([]);
    }, 400);
  }

  const nextVal = () => Math.floor(Math.random() * 90) + 10;

  const ops = [
    {
      label: '앞에 삽입',
      cx: 'O(n)',
      desc: '모든 요소를 오른쪽으로 이동',
      action: () => {
        const v = nextVal();
        doOp(`앞에 삽입 (${v})`, 'O(n)', arr.map((_, i) => i), a => [v, ...a].slice(0, 8));
      },
    },
    {
      label: '뒤에 삽입',
      cx: 'O(1)',
      desc: '끝에 추가 — 이동 없음',
      action: () => {
        const v = nextVal();
        doOp(`뒤에 삽입 (${v})`, 'O(1)', [], a => [...a, v].slice(-8));
      },
    },
    {
      label: '앞에서 삭제',
      cx: 'O(n)',
      desc: '나머지를 왼쪽으로 이동',
      action: () => {
        if (arr.length === 0) return;
        doOp('앞에서 삭제', 'O(n)', arr.map((_, i) => i).slice(1), a => a.slice(1));
      },
    },
    {
      label: '뒤에서 삭제',
      cx: 'O(1)',
      desc: '마지막 요소만 제거',
      action: () => {
        if (arr.length === 0) return;
        doOp('뒤에서 삭제', 'O(1)', [], a => a.slice(0, -1));
      },
    },
  ];

  return (
    <div className="max-w-3xl space-y-10 px-6 py-6">

      {/* ── Hero ─────────────────────────────────── */}
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

      {/* ── 배열 vs 연결 리스트 비교표 ──────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚖️</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">배열 vs 연결 리스트</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">연산</th>
                <th className="px-4 py-2.5 text-center text-xs font-bold text-blue-600 dark:text-blue-400">배열 (Array)</th>
                <th className="px-4 py-2.5 text-center text-xs font-bold text-violet-600 dark:text-violet-400">연결 리스트 (LL)</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400">비고</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium">{row.op}</td>
                  <td className="px-4 py-2.5 text-center">
                    {row.array === '연속' ? (
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{row.array}</span>
                    ) : (
                      <CxBadge cx={row.array} />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {row.ll === '분산' ? (
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{row.ll}</span>
                    ) : (
                      <CxBadge cx={row.ll} />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 인터랙티브 배열 시뮬레이터 ─────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎮</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">인터랙티브 배열 시뮬레이터</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-5">
          {/* Array boxes */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {arr.map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div
                    className={`h-12 w-12 flex items-center justify-center rounded-lg font-mono font-bold text-white text-sm transition-all duration-300 ${COLORS[i % COLORS.length]} ${
                      shiftIdx.includes(i) ? 'ring-2 ring-white scale-105 opacity-60' : ''
                    }`}
                  >
                    {v}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">[{i}]</span>
                </div>
              ))}
              {arr.length === 0 && (
                <span className="text-sm text-slate-400 italic">배열이 비었습니다</span>
              )}
            </div>
            {lastCx && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">마지막 연산:</span>
                <CxBadge cx={lastCx} />
              </div>
            )}
          </div>

          {/* Operation buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ops.map(op => (
              <button
                key={op.label}
                onClick={op.action}
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30 dark:hover:border-blue-700 px-3 py-2.5 text-center transition group"
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  {op.label}
                </span>
                <CxBadge cx={op.cx} />
                <span className="text-[10px] text-slate-400">{op.desc}</span>
              </button>
            ))}
          </div>

          {/* Log */}
          {log.length > 0 && (
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 px-3 py-2">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">연산 기록 (최근 3개)</p>
              <div className="space-y-1">
                {log.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-mono">{i === 0 ? '최근' : `${i}전`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{entry.op}</span>
                    <CxBadge cx={entry.cx} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 연결 리스트 시각화 ─────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔗</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">연결 리스트 / 스택 / 큐 시각화</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <AlgoVisualizer type="linkedlist" />
      </section>

      {/* ── 스택 vs 큐 ──────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏗️</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">스택 vs 큐</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stack */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50 dark:bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-bold text-indigo-800 dark:text-indigo-200">스택 (Stack)</p>
                <span className="text-[10px] font-black bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200 rounded px-1.5 py-0.5">LIFO</span>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-indigo-700 dark:text-indigo-300">
              <li className="flex items-center gap-1.5"><span className="font-mono font-bold">push(x)</span> — O(1) 삽입</li>
              <li className="flex items-center gap-1.5"><span className="font-mono font-bold">pop()</span> — O(1) 삭제</li>
              <li className="flex items-center gap-1.5"><span className="font-mono font-bold">peek()</span> — O(1) 조회</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-indigo-200 dark:border-indigo-700">
              <p className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 mb-1">활용 예시</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-300">함수 호출 스택, 괄호 검사, Undo/Redo, DFS</p>
            </div>
          </div>

          {/* Queue */}
          <div className="rounded-xl border border-teal-200 dark:border-teal-800/40 bg-teal-50 dark:bg-teal-950/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🚌</span>
              <div>
                <p className="font-bold text-teal-800 dark:text-teal-200">큐 (Queue)</p>
                <span className="text-[10px] font-black bg-teal-200 text-teal-800 dark:bg-teal-800 dark:text-teal-200 rounded px-1.5 py-0.5">FIFO</span>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-teal-700 dark:text-teal-300">
              <li className="flex items-center gap-1.5"><span className="font-mono font-bold">enqueue(x)</span> — O(1) 삽입</li>
              <li className="flex items-center gap-1.5"><span className="font-mono font-bold">dequeue()</span> — O(1) 삭제</li>
              <li className="flex items-center gap-1.5"><span className="font-mono font-bold">front()</span> — O(1) 조회</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-teal-200 dark:border-teal-700">
              <p className="text-[10px] font-semibold text-teal-500 dark:text-teal-400 mb-1">활용 예시</p>
              <p className="text-xs text-teal-600 dark:text-teal-300">프린터 스풀, BFS, 프로세스 스케줄링, 캐시</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 코드 예시 ────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">💻</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">코드 예시 (Python)</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            {codeTabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setCodeTab(i)}
                className={`px-4 py-2.5 text-xs font-semibold transition ${
                  codeTab === i
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Code */}
          <div className="bg-slate-950">
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-[11px] font-mono text-slate-500">python</span>
            </div>
            <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-200 font-mono">
              <code>{codeTabs[codeTab]?.code ?? ''}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ── 시험 함정 경고 ──────────────────────── */}
      <section>
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-950/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <h2 className="text-sm font-bold text-amber-800 dark:text-amber-200">시험 함정 경고</h2>
          </div>
          <ul className="space-y-2">
            {traps.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 기출 연결 ─────────────────────────────── */}
      {relatedExams.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              관련 기출문제 ({relatedExams.length})
            </h2>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedExams.map(exam => (
              <button
                key={exam.id}
                onClick={() => onExamClick?.(exam)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 px-3 py-2 text-left transition group"
              >
                <span className="rounded bg-slate-900 dark:bg-slate-100 px-2 py-0.5 text-[10px] font-black text-white dark:text-slate-900 flex-shrink-0">
                  {exam.year}-{exam.semester === '1' ? '1학기' : '2학기'}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate max-w-[200px]">
                  {exam.title}
                </span>
                <span className="text-[10px] text-slate-400 flex-shrink-0">팝업 보기 →</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
