'use client';
import { useState } from 'react';
import type { StudyTopic } from '../TopicStudyCard';

interface Props { topic: StudyTopic; }

const difficultyLabel = { basic: '기초', intermediate: '중급', advanced: '고급' };
const difficultyColor = {
  basic: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  advanced: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300',
};

function SH({ icon, title, id }: { icon: string; title: string; id?: string }) {
  return (
    <div id={id} className="flex items-center gap-2 mb-5">
      <span className="text-xl">{icon}</span>
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

function ConceptBox({ what, rules, caution }: { what: string; rules: string[]; caution?: string }) {
  return (
    <div className="mb-5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-4 space-y-2.5">
      <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{what}</p>
      <ul className="space-y-1.5">
        {rules.map((r, i) => (
          <li key={i} className="flex gap-2 text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded bg-blue-400/70 flex items-center justify-center text-[9px] font-black text-white">{i + 1}</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
      {caution && (
        <div className="flex gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
          <span className="flex-shrink-0 font-bold">⚠</span>
          <span>{caution}</span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 1 — Stack vs Heap 메모리 레이아웃 스텝 플레이어
══════════════════════════════════════════════════════ */
interface MemVar { name: string; val: string; addr: string; }
interface HeapBlock { val: string; addr: string; owner: string; }

const MEM_STEPS: {
  line: number; label: string; stack: MemVar[]; heap: HeapBlock[]; note: string; leak?: boolean;
}[] = [
  {
    line: 2,
    label: 'int x = 10 → 스택에 할당',
    stack: [{ name: 'x', val: '10', addr: '0xFFE8' }],
    heap: [],
    note: '지역 변수 x는 스택에 자동 할당됩니다. 스코프 종료 시 자동 해제됩니다.',
  },
  {
    line: 3,
    label: 'int* p = new int(5) → 힙에 할당',
    stack: [{ name: 'x', val: '10', addr: '0xFFE8' }, { name: 'p', val: '→0x2000', addr: '0xFFE4' }],
    heap: [{ val: 'int: 5', addr: '0x2000', owner: 'p가 가리킴' }],
    note: 'new는 힙에서 메모리를 할당합니다. 포인터 변수 p는 스택에, 실제 int 데이터는 힙에 있습니다.',
  },
  {
    line: 5,
    label: 'int y = 20 → 내부 스코프에 스택 할당',
    stack: [
      { name: 'x', val: '10', addr: '0xFFE8' },
      { name: 'p', val: '→0x2000', addr: '0xFFE4' },
      { name: 'y', val: '20', addr: '0xFFE0' },
    ],
    heap: [{ val: 'int: 5', addr: '0x2000', owner: 'p가 가리킴' }],
    note: '내부 중괄호 { } 안의 y도 스택에 할당됩니다.',
  },
  {
    line: 6,
    label: '내부 스코프 } 종료 → y 자동 소멸',
    stack: [{ name: 'x', val: '10', addr: '0xFFE8' }, { name: 'p', val: '→0x2000', addr: '0xFFE4' }],
    heap: [{ val: 'int: 5', addr: '0x2000', owner: 'p가 가리킴' }],
    note: 'y는 스코프 종료와 함께 자동으로 해제됩니다. 힙의 데이터는 영향 없습니다.',
  },
  {
    line: 8,
    label: '외부 스코프 } 종료 — delete 없이 p 소멸 → 메모리 누수!',
    stack: [],
    heap: [{ val: 'int: 5', addr: '0x2000', owner: '⚠️ 참조 불가 (누수!)' }],
    note: 'x, p(포인터 변수)는 스택에서 해제됩니다. 그러나 힙의 int 데이터는 delete 없이 고아가 됩니다 → 메모리 누수!',
    leak: true,
  },
];

const MEM_CODE_LINES = [
  '1  {',
  '2    int x = 10;',
  '3    int* p = new int(5);',
  '4    {',
  '5      int y = 20;',
  '6    }  // ← y 자동 해제',
  '7    // delete p; 없음!',
  '8  }  // ← x, p 해제 — 힙 누수!',
];

function MemoryLayoutSection() {
  const [step, setStep] = useState(0);
  const s = MEM_STEPS[step];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Code panel */}
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 border-b border-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            <span className="ml-2 text-[11px] font-mono text-slate-400">memory.cpp</span>
          </div>
          <div className="bg-slate-950 p-4 space-y-0.5">
            {MEM_CODE_LINES.map((line, i) => {
              const lineNum = i + 1;
              const isActive = s.line === lineNum;
              return (
                <div key={i} className={`flex items-center gap-2 rounded px-2 py-1 transition-colors ${isActive ? 'bg-blue-600/30 ring-1 ring-blue-500' : ''}`}>
                  <span className="text-[10px] font-mono text-slate-600 w-4 text-right flex-shrink-0">{lineNum}</span>
                  <code className={`text-xs font-mono whitespace-pre ${isActive ? 'text-blue-300 font-bold' : 'text-slate-300'}`}>{line.slice(2)}</code>
                  {isActive && <span className="ml-auto text-[10px] text-blue-400 font-semibold flex-shrink-0">← 현재</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Memory diagram */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col gap-4 p-4">
          {/* Stack */}
          <div>
            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2">📦 STACK (자동 관리)</p>
            <div className="space-y-1.5 min-h-[56px]">
              {s.stack.length === 0
                ? <div className="rounded border border-dashed border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-400 text-center">비어 있음</div>
                : [...s.stack].reverse().map((v, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-950/25 px-3 py-2">
                    <code className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 w-8 flex-shrink-0">{v.name}</code>
                    <span className="text-slate-400 text-xs">=</span>
                    <code className="text-xs font-mono text-slate-700 dark:text-slate-300 flex-1">{v.val}</code>
                    <code className="text-[10px] font-mono text-slate-400 flex-shrink-0">{v.addr}</code>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Heap */}
          <div>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">🏗️ HEAP (수동 관리)</p>
            <div className="space-y-1.5 min-h-[40px]">
              {s.heap.length === 0
                ? <div className="rounded border border-dashed border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-400 text-center">비어 있음</div>
                : s.heap.map((h, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                    s.leak ? 'border-red-300 dark:border-red-700/50 bg-red-50 dark:bg-red-950/25' : 'border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/20'
                  }`}>
                    <code className={`text-xs font-mono flex-1 font-bold ${s.leak ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{h.val}</code>
                    <code className="text-[10px] font-mono text-slate-400 flex-shrink-0">{h.addr}</code>
                    <span className={`text-[10px] flex-shrink-0 ${s.leak ? 'text-red-500' : 'text-slate-400'}`}>{h.owner}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className={`rounded-xl border-2 p-4 ${s.leak ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20' : 'border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/30'}`}>
        <p className={`text-xs font-bold mb-1.5 ${s.leak ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>{s.label}</p>
        <p className={`text-sm leading-relaxed ${s.leak ? 'text-red-800 dark:text-red-200' : 'text-blue-800 dark:text-blue-200'}`}>{s.note}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => setStep(v => Math.max(0, v - 1))} disabled={step === 0}
          className="rounded-lg px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
          ◀ 이전
        </button>
        <span className="text-sm text-slate-500 w-16 text-center">{step + 1} / {MEM_STEPS.length}</span>
        <button onClick={() => setStep(v => Math.min(MEM_STEPS.length - 1, v + 1))} disabled={step === MEM_STEPS.length - 1}
          className="rounded-lg px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
          다음 ▶
        </button>
      </div>

      {/* Fix */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-3">
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">💡 누수 방지 패턴</p>
        <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">{`// 스코프 종료 전 반드시 delete
delete p;    // 힙 메모리 해제
p = nullptr; // 댕글링 포인터 방지 (선택, 권장)

// C++11 이후 — unique_ptr (자동 해제!)
std::unique_ptr<int> p2 = std::make_unique<int>(5);
// 스코프 종료 시 자동 delete → 누수 없음`}</pre>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 2 — 포인터 연산 시각화
══════════════════════════════════════════════════════ */
const ARRAY_VALUES = [10, 20, 30, 40, 50];
const BASE_ADDR = 0x1000;
const INT_SIZE = 4;

type PtrOp = 'deref' | 'addr' | 'plus1' | 'plus2' | 'bracket';
const OPS: { id: PtrOp; label: string; desc: string; result: (i: number) => string; warn?: (i: number) => boolean }[] = [
  {
    id: 'deref', label: '*ptr', desc: 'ptr이 가리키는 값 (역참조)',
    result: i => `${ARRAY_VALUES[i]}`,
  },
  {
    id: 'addr', label: '&arr[i]', desc: 'i번째 원소의 메모리 주소 (= ptr + i)',
    result: i => `0x${(BASE_ADDR + i * INT_SIZE).toString(16).toUpperCase()}`,
  },
  {
    id: 'plus1', label: 'ptr + 1', desc: '다음 int 포인터 (주소 +4 byte)',
    result: i => `0x${(BASE_ADDR + (i + 1) * INT_SIZE).toString(16).toUpperCase()}`,
    warn: i => i >= ARRAY_VALUES.length - 1,
  },
  {
    id: 'plus2', label: 'ptr + 2', desc: '두 칸 뒤 int 포인터 (주소 +8 byte)',
    result: i => `0x${(BASE_ADDR + (i + 2) * INT_SIZE).toString(16).toUpperCase()}`,
    warn: i => i >= ARRAY_VALUES.length - 2,
  },
  {
    id: 'bracket', label: 'ptr[i]', desc: '*(ptr + i) 와 동일 — 배열 첨자',
    result: i => `${ARRAY_VALUES[i]} (== *(arr + ${i}))`,
  },
];

function PointerOpsSection() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedOp, setSelectedOp] = useState<PtrOp>('deref');
  const op = OPS.find(o => o.id === selectedOp)!;
  const isWarn = op.warn?.(selectedIdx) ?? false;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 font-mono">
          int arr[5] = &#123;10, 20, 30, 40, 50&#125;; &nbsp; int* ptr = arr;
        </p>

        {/* Array visualization — click to select index */}
        <div className="flex justify-center gap-2 mb-5 overflow-x-auto pb-1">
          {ARRAY_VALUES.map((val, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`flex-shrink-0 rounded-xl border-2 p-3 text-center transition min-w-[64px] ${
                selectedIdx === i
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              <p className="text-base font-black font-mono text-slate-800 dark:text-slate-100">{val}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">arr[{i}]</p>
              <p className="text-[10px] font-mono text-blue-500 dark:text-blue-400">+{i * INT_SIZE}B</p>
            </button>
          ))}
        </div>

        {/* Op selector */}
        <div className="flex flex-wrap gap-2 mb-5">
          {OPS.map(o => (
            <button key={o.id} onClick={() => setSelectedOp(o.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold font-mono transition ${
                selectedOp === o.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Result panel */}
        <div className={`rounded-xl p-4 text-center border ${isWarn ? 'border-red-300 dark:border-red-700/50 bg-red-950/10' : 'bg-slate-900 border-slate-700'}`}>
          <p className="text-xs text-slate-400 mb-2">{op.desc}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <code className="text-base font-bold font-mono text-amber-300">
              {op.id === 'bracket' ? `arr[${selectedIdx}]` : op.id === 'deref' ? `*(arr + ${selectedIdx})` : op.label.replace('ptr', `(arr+${selectedIdx})`)}
            </code>
            <span className="text-slate-500 text-lg">=</span>
            <code className={`text-base font-bold font-mono ${isWarn ? 'text-red-400' : 'text-emerald-300'}`}>{op.result(selectedIdx)}</code>
          </div>
          {isWarn && (
            <p className="mt-2 text-xs text-red-400 font-bold animate-pulse">⚠️ 배열 경계 밖! 유효하지 않은 접근 (Undefined Behavior)</p>
          )}
        </div>
      </div>

      {/* Key insight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: '📐', title: 'sizeof(int) = 4', body: 'int* ptr에서 ptr+1은 주소 +4 byte 이동. double*이면 +8, char*이면 +1.' },
          { icon: '🔗', title: 'arr == &arr[0]', body: '배열 이름은 첫 원소의 포인터. arr[i] == *(arr+i) == *(ptr+i) 모두 동일.' },
          { icon: '⚠️', title: '*ptr vs ptr', body: 'ptr은 주소값 (포인터). *ptr은 그 주소의 값 (역참조). 혼동하지 말 것!' },
        ].map((c, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{c.icon} {c.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 3 — Off-by-One 버그 시뮬레이터
══════════════════════════════════════════════════════ */
function OffByOneSection() {
  const [useLeq, setUseLeq] = useState(false);
  const N = 5;

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setUseLeq(false)}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition border-2 ${
            !useLeq ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}>
          ✅ i &lt; n (올바른 조건)
        </button>
        <button onClick={() => setUseLeq(true)}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition border-2 ${
            useLeq ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}>
          ❌ i &lt;= n (Off-by-One 버그)
        </button>
      </div>

      {/* Code */}
      <div className={`rounded-xl border overflow-hidden ${useLeq ? 'border-red-700/30' : 'border-slate-700'}`}>
        <div className={`px-4 py-2 text-[11px] font-mono font-bold ${useLeq ? 'bg-red-900/30 text-red-300' : 'bg-slate-800 text-slate-400'}`}>
          {useLeq ? '❌ 버그 코드' : '✅ 올바른 코드'}
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`int arr[${N}] = {1, 2, 3, 4, 5};  // 인덱스: 0 ~ ${N-1}

for (int i = 0; i ${useLeq ? `<= ${N}` : `< ${N}`}; i++) {
    arr[i] = 0;  // ${useLeq ? `⚠️ i==${N}일 때 arr[${N}] 접근 → out-of-bounds!` : `✅ i=0~${N-1}, 모두 유효`}
}`}</pre>
      </div>

      {/* Visual array */}
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          접근 패턴 시각화 — int arr[{N}]
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: N + 1 }, (_, i) => {
            const valid = i < N;
            const accessed = useLeq ? i <= N : i < N;
            return (
              <div key={i} className={`flex-shrink-0 rounded-xl border-2 p-3 text-center min-w-[70px] transition-all ${
                !valid && accessed
                  ? 'border-red-500 bg-red-100 dark:bg-red-950/50 ring-2 ring-red-500 ring-offset-1 animate-pulse'
                  : accessed
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 opacity-30'
              }`}>
                {valid ? (
                  <>
                    <p className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">arr[{i}]</p>
                    {accessed && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">접근</p>}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold font-mono text-red-600">arr[{i}]</p>
                    <p className="text-[10px] text-red-500 font-bold mt-1">범위 밖!</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Result */}
      <div className={`rounded-xl border-2 p-4 text-center ${
        useLeq ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20' : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'
      }`}>
        <p className={`text-sm font-bold ${useLeq ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
          {useLeq
            ? `💥 Segmentation Fault! arr[${N}]는 유효하지 않은 메모리 접근`
            : `✅ 안전! arr[0]~arr[${N - 1}] (총 ${N}개) 접근`}
        </p>
      </div>

      {/* Exam reference */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/10 p-4">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">📌 실전 코드 예시 — Buffer 버그 패턴</p>
        <pre className="rounded-lg bg-slate-950 text-xs p-3 text-slate-200 overflow-x-auto leading-relaxed">{`void fill_with(Buffer& b, int v) {
    for (size_t i = 0; i <= b.size(); ++i)  // ❌ Bug 2: <= 때문에 out-of-bounds
        b.at(i) = v;
}
// 수정: i < b.size() 로 변경해야 함`}</pre>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 4 — 포인터 Swap 함정
══════════════════════════════════════════════════════ */
function SwapSection() {
  const [mode, setMode] = useState<'wrong' | 'right'>('wrong');
  const [showResult, setShowResult] = useState(true);

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex gap-2">
        <button onClick={() => { setMode('wrong'); setShowResult(true); }}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition border-2 ${
            mode === 'wrong' ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}>
          ❌ 잘못된 swap (포인터 교환)
        </button>
        <button onClick={() => { setMode('right'); setShowResult(true); }}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition border-2 ${
            mode === 'right' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}>
          ✅ 올바른 swap (값 교환)
        </button>
      </div>

      {/* Explanation */}
      <div className={`rounded-xl border px-4 py-3 text-sm ${
        mode === 'wrong'
          ? 'border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200'
          : 'border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200'
      }`}>
        {mode === 'wrong'
          ? '매개변수 a, b는 포인터의 지역 복사본입니다. a와 b를 서로 바꿔도 원본 포인터에는 영향이 없습니다!'
          : '*a, *b는 역참조(dereference)로 포인터가 가리키는 실제 값에 접근합니다. 값을 직접 교환하므로 원본이 바뀝니다.'}
      </div>

      {/* Code */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 border-b border-slate-700">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-2 text-[11px] font-mono text-slate-400">{mode === 'wrong' ? 'swap_wrong.cpp' : 'swap_right.cpp'}</span>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">
          {mode === 'wrong'
            ? `void swap(int* a, int* b) {
    int* tmp;      // tmp는 포인터형!
    tmp = a;       // 지역 포인터 a, b만 교환
    a   = b;       // 원본에는 영향 없음
    b   = tmp;     // ← 함수 반환 시 사라짐
}

int x = 10, y = 20;
swap(&x, &y);
// x == 10, y == 20 (변경 없음!)`
            : `void swap(int* a, int* b) {
    int tmp;       // tmp는 int형 (포인터 아님)
    tmp = *a;      // *역참조: a가 가리키는 값 읽기
    *a  = *b;      // a가 가리키는 위치에 b의 값 저장
    *b  = tmp;     // b가 가리키는 위치에 원래 a값 저장
}

int x = 10, y = 20;
swap(&x, &y);
// x == 20, y == 10 (올바르게 교환!)`}
        </pre>
      </div>

      {/* Result */}
      {showResult && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '호출 전', x: 10, y: 20, hi: false },
            { label: mode === 'wrong' ? '❌ swap 후 (변화 없음)' : '✅ swap 후 (교환됨)', x: mode === 'wrong' ? 10 : 20, y: mode === 'wrong' ? 20 : 10, hi: true },
          ].map((state, i) => (
            <div key={i} className={`rounded-xl border p-4 ${
              state.hi && mode === 'right' ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20' :
              state.hi && mode === 'wrong' ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20' :
              'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">{state.label}</p>
              <div className="flex gap-3">
                {[{ name: 'x', val: state.x }, { name: 'y', val: state.y }].map(v => (
                  <div key={v.name} className="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-center">
                    <p className="text-xs font-bold text-slate-400 mb-1">int {v.name}</p>
                    <p className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">{v.val}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pointer vs address table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-2.5 text-left font-bold text-slate-500 dark:text-slate-400">표현식</th>
              <th className="px-4 py-2.5 text-left font-bold text-slate-500 dark:text-slate-400">의미</th>
              <th className="px-4 py-2.5 text-left font-bold text-slate-500 dark:text-slate-400">x=10일 때</th>
            </tr>
          </thead>
          <tbody>
            {[
              { expr: 'x', meaning: 'int 변수 x의 값', val: '10' },
              { expr: '&x', meaning: 'x의 메모리 주소', val: '0xFFE8 (예시)' },
              { expr: 'int* p = &x', meaning: 'p는 x의 주소를 담은 포인터', val: 'p == 0xFFE8' },
              { expr: '*p', meaning: 'p가 가리키는 값 (역참조)', val: '10 (== x)' },
              { expr: '*p = 99', meaning: 'p가 가리키는 위치에 99 저장', val: 'x == 99로 변경됨' },
            ].map((r, i) => (
              <tr key={i} className={`border-t border-slate-100 dark:border-slate-800 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}>
                <td className="px-4 py-2.5"><code className="font-mono font-bold text-blue-600 dark:text-blue-400">{r.expr}</code></td>
                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{r.meaning}</td>
                <td className="px-4 py-2.5"><code className="font-mono text-emerald-600 dark:text-emerald-400">{r.val}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export default function MemoryManagementContent({ topic }: Props) {
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">{topic.title}</h1>
            <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${difficultyColor[topic.difficulty]}`}>
              {difficultyLabel[topic.difficulty]}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{topic.summary}</p>
        </div>
      </div>

      {/* Key points */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⚡</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">핵심 포인트</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <ul className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
          {topic.keyPoints.map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
              {pt}
            </li>
          ))}
        </ul>
      </section>

      <section id="memory-sec-layout">
        <SH icon="🧠" title="스택 vs 힙 — 메모리 영역 시각화" />
        <ConceptBox
          what="C++ 메모리는 스택(Stack)과 힙(Heap)으로 나뉩니다. 스택은 선언 시 자동 관리, 힙은 new/delete로 수동 관리합니다."
          rules={[
            '스택: 지역 변수 저장. 스코프(}) 종료 시 자동 해제. 크기 제한 있음 (보통 수 MB)',
            '힙: new로 할당, delete로 수동 해제. 크기 제한 적음. 해제 안 하면 메모리 누수(memory leak)',
            '포인터 변수 자체는 스택에 / 포인터가 가리키는 데이터(new로 할당)는 힙에 위치',
          ]}
          caution="힙 메모리는 스코프가 끝나도 자동 해제되지 않습니다. delete를 빠뜨리면 포인터는 사라지지만 힙 데이터는 영원히 남습니다 (메모리 누수)."
        />
        <MemoryLayoutSection />
      </section>

      <section id="memory-sec-pointer">
        <SH icon="🔍" title="포인터 연산 인터랙티브 탐색기" />
        <ConceptBox
          what="포인터는 메모리 주소를 저장하는 변수입니다. & 연산자로 주소를 얻고, * 연산자로 해당 주소의 값에 접근(역참조)합니다."
          rules={[
            '& (주소 연산자): int x = 5; int* p = &x; → p에 x의 주소 저장',
            '* (역참조 연산자): *p = 10; → p가 가리키는 주소의 값을 10으로 변경. x도 10이 됨',
            '포인터 산술: ptr + n → n번째 요소의 주소 (sizeof(T) × n 바이트 이동)',
          ]}
          caution="배열 범위 밖 접근(arr[n] 등)은 Undefined Behavior — 어떤 결과가 나와도 비정상입니다. 컴파일 오류 없이 런타임에 충돌하거나 조용히 잘못된 값을 반환합니다."
        />
        <PointerOpsSection />
      </section>

      <section id="memory-sec-offbyone">
        <SH icon="🐛" title="Off-by-One 버그 시뮬레이터" />
        <ConceptBox
          what="Off-by-One 오류: 배열 인덱스는 0~n-1이므로 반복 조건을 하나 잘못 쓰면 범위를 벗어납니다."
          rules={[
            '올바른 패턴: for (int i = 0; i < n; i++) — i < n이 정확합니다',
            '잘못된 패턴: for (int i = 0; i <= n; i++) — i == n일 때 arr[n] 접근 → UB',
            '적용 범위: 배열 순회 외에도 버퍼 크기 계산, 이진 탐색 mid, 문자열 null 종료에서 자주 발생',
          ]}
        />
        <OffByOneSection />
      </section>

      <section id="memory-sec-swap">
        <SH icon="🔄" title="포인터 Swap 함정" />
        <ConceptBox
          what="함수에 포인터를 값으로 전달하면 포인터 변수 자체가 복사됩니다. 함수 내에서 포인터를 교환해도 원본 포인터에는 영향이 없습니다."
          rules={[
            '잘못된 swap: void swap(int* a, int* b) { int* tmp=a; a=b; b=tmp; } → a, b는 지역 복사, 원본 불변',
            '올바른 swap: *a와 *b의 값을 직접 교환 — 역참조로 값에 접근해야 원본 변경',
            '포인터 주소 비교 함정: if (p1 > p2) — 이는 값 비교가 아닌 메모리 주소 비교!',
          ]}
          caution="'포인터를 전달했으니 원본이 바뀌겠지'는 오해입니다. 포인터 변수 자체는 복사됩니다. 원본 값을 바꾸려면 *p를 통해 역참조해야 합니다."
        />
        <SwapSection />
      </section>
    </div>
  );
}
