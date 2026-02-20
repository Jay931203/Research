'use client';
import { useState } from 'react';
import type { StudyTopic } from '../TopicStudyCard';

const MAX = 6;

function SH({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{title}</h2>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

function ConceptBox({ what, rules, caution }: { what: string; rules: string[]; caution?: string }) {
  return (
    <div className="mb-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-4 space-y-2.5">
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

/* ── Section 1: Stack 시뮬레이터 ── */
function StackSection() {
  const [arr, setArr] = useState<(number | null)[]>(Array(MAX).fill(null));
  const [top, setTop] = useState(-1);
  const [inputVal, setInputVal] = useState('');
  const [log, setLog] = useState<string[]>([]);

  function push() {
    const v = parseInt(inputVal);
    if (isNaN(v)) return;
    if (top >= MAX - 1) {
      setLog(prev => [`push(${v}) → OVERFLOW (top=${top})`, ...prev.slice(0, 4)]);
      setInputVal('');
      return;
    }
    const newTop = top + 1;
    const newArr = [...arr];
    newArr[newTop] = v;
    setArr(newArr);
    setTop(newTop);
    setLog(prev => [`push(${v}) → arr[${newTop}]=${v}, top=${newTop}`, ...prev.slice(0, 4)]);
    setInputVal('');
  }

  function pop() {
    if (top === -1) {
      setLog(prev => [`pop() → UNDERFLOW (top=-1)`, ...prev.slice(0, 4)]);
      return;
    }
    const val = arr[top];
    const newArr = [...arr];
    newArr[top] = null;
    setArr(newArr);
    setTop(top - 1);
    setLog(prev => [`pop() → ${val} (arr[${top}]=${val}), top=${top - 1}`, ...prev.slice(0, 4)]);
  }

  function reset() {
    setArr(Array(MAX).fill(null));
    setTop(-1);
    setLog([]);
    setInputVal('');
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Stack — LIFO · top 초기값: <span className="text-red-500">-1</span>
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900">
          {/* Array cells */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">arr[MAX={MAX}] — top={top}</p>
            <div className="flex flex-col-reverse gap-1">
              {arr.map((val, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
                  i === top
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                    : val !== null
                      ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                      : 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900'
                }`}>
                  <span className="text-[10px] font-mono text-slate-400 w-8">[{i}]</span>
                  <span className={`flex-1 text-sm font-mono font-bold ${
                    val !== null ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'
                  }`}>{val !== null ? val : '—'}</span>
                  {i === top && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">← top</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls + log */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && push()}
                placeholder="정수"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={push}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition">
                push
              </button>
              <button onClick={pop}
                className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white hover:bg-red-400 transition">
                pop
              </button>
              <button onClick={reset}
                className="rounded-lg bg-slate-200 dark:bg-slate-700 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition">
                ↺
              </button>
            </div>

            <div className="space-y-1">
              {log.length === 0 ? (
                <p className="text-xs text-slate-400 italic">연산 결과가 여기 표시됩니다</p>
              ) : log.map((l, i) => (
                <div key={i} className={`rounded px-2.5 py-1.5 text-xs font-mono ${
                  l.includes('OVERFLOW') || l.includes('UNDERFLOW')
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/40'
                    : i === 0
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Code */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
          <p className="text-xs text-slate-400">Stack 핵심 코드</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`Stack() { top = -1; }   // 초기값 -1

void push(int x) {
    if (top < MAX-1)       // overflow 체크
        arr[++top] = x;    // ① top 증가 ② 저장
}

int pop() {
    if (top == -1) return -1;   // underflow
    return arr[top--];          // ① 반환 ② top 감소
}

bool isEmpty() { return top == -1; }`}</pre>
      </div>
    </div>
  );
}

/* ── Section 2: Queue 시뮬레이터 ── */
function QueueSection() {
  const [arr, setArr] = useState<(number | null)[]>(Array(MAX).fill(null));
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [log, setLog] = useState<string[]>([]);

  function enqueue() {
    const v = parseInt(inputVal);
    if (isNaN(v)) return;
    if (rear >= MAX) {
      setLog(prev => [`enqueue(${v}) → OVERFLOW (rear=${rear})`, ...prev.slice(0, 4)]);
      setInputVal('');
      return;
    }
    const newArr = [...arr];
    newArr[rear] = v;
    setArr(newArr);
    setRear(rear + 1);
    setLog(prev => [`enqueue(${v}) → arr[${rear}]=${v}, rear=${rear + 1}`, ...prev.slice(0, 4)]);
    setInputVal('');
  }

  function dequeue() {
    if (front === rear) {
      setLog(prev => [`dequeue() → EMPTY (front==rear==${front})`, ...prev.slice(0, 4)]);
      return;
    }
    const val = arr[front];
    setFront(front + 1);
    setLog(prev => [`dequeue() → ${val}, front=${front + 1}`, ...prev.slice(0, 4)]);
  }

  function reset() {
    setArr(Array(MAX).fill(null));
    setFront(0);
    setRear(0);
    setLog([]);
    setInputVal('');
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Queue — FIFO · <span className="text-emerald-600 dark:text-emerald-400">front</span> / <span className="text-purple-600 dark:text-purple-400">rear</span> 초기값: 0
          </p>
        </div>
        <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
          {/* Array cells */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">arr[MAX={MAX}] — front={front}, rear={rear}</p>
            <div className="flex gap-1">
              {arr.map((val, i) => (
                <div key={i} className={`flex-1 flex flex-col items-center gap-1 rounded-lg border px-1.5 py-2 transition min-w-[40px] ${
                  i === front && i < rear
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : i === rear - 1 && i >= front
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40'
                      : i >= front && i < rear
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20'
                        : i < front
                          ? 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 opacity-40'
                          : 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900'
                }`}>
                  <span className={`text-xs font-mono font-bold ${
                    val !== null && i >= front && i < rear ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'
                  }`}>{val !== null && i >= front && i < rear ? val : '—'}</span>
                  <span className="text-[9px] text-slate-400 font-mono">[{i}]</span>
                  <div className="flex gap-0.5">
                    {i === front && front < rear && (
                      <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">F</span>
                    )}
                    {i === rear && (
                      <span className="text-[8px] font-bold text-purple-600 dark:text-purple-400">R</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" /> front (dequeue 위치)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-400 inline-block" /> rear (enqueue 위치)</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enqueue()}
              placeholder="정수"
              className="w-24 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button onClick={enqueue}
              className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-500 transition">
              enqueue
            </button>
            <button onClick={dequeue}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition">
              dequeue
            </button>
            <button onClick={reset}
              className="rounded-lg bg-slate-200 dark:bg-slate-700 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition">
              ↺
            </button>
          </div>

          {/* log */}
          <div className="space-y-1">
            {log.length === 0 ? (
              <p className="text-xs text-slate-400 italic">연산 결과가 여기 표시됩니다</p>
            ) : log.map((l, i) => (
              <div key={i} className={`rounded px-2.5 py-1.5 text-xs font-mono ${
                l.includes('OVERFLOW') || l.includes('EMPTY')
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/40'
                  : i === 0
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Code */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
          <p className="text-xs text-slate-400">Queue 핵심 코드</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`Queue() { front = 0; rear = 0; }

void enqueue(int x) {
    if (rear < MAX)         // overflow 체크
        arr[rear++] = x;    // 저장 후 rear 증가
}

int dequeue() {
    if (front == rear) return -1;  // empty
    return arr[front++];           // 반환 후 front 증가
}

bool isEmpty() { return front == rear; }`}</pre>
      </div>

      <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-4">
        <p className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1.5">⚠ 선형 큐의 한계</p>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          dequeue 후 front가 앞으로 이동하면 [0]~[front-1] 공간이 낭비됩니다.
          원형 큐(Circular Queue)는 <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">rear = (rear + 1) % MAX</code>로 이를 해결합니다.
        </p>
      </div>
    </div>
  );
}

/* ── Section 3: 실행 결과 추적 ── */
function TraceSection() {
  const [revealed, setRevealed] = useState(false);

  const ops = [
    { type: 'stack', calls: [
      { op: 'push(10)', effect: 'arr[0]=10, top=0' },
      { op: 'push(20)', effect: 'arr[1]=20, top=1' },
      { op: 'push(30)', effect: 'arr[2]=30, top=2' },
      { op: 'pop()', effect: '→ 30, top=1', output: '30' },
      { op: 'pop()', effect: '→ 20, top=0', output: '20' },
    ]},
    { type: 'queue', calls: [
      { op: 'enqueue(5)', effect: 'arr[0]=5, rear=1' },
      { op: 'enqueue(6)', effect: 'arr[1]=6, rear=2' },
      { op: 'enqueue(7)', effect: 'arr[2]=7, rear=3' },
      { op: 'dequeue()', effect: '→ 5, front=1', output: '5' },
      { op: 'dequeue()', effect: '→ 6, front=2', output: '6' },
    ]},
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">실행 결과 추적</p>
          <button onClick={() => setRevealed(v => !v)}
            className={`rounded px-2.5 py-1 text-[10px] font-bold transition ${
              revealed ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}>
            {revealed ? '결과 숨기기' : '결과 보기'}
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900">
          {ops.map(({ type, calls }) => (
            <div key={type}>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{type}</p>
              <div className="space-y-1">
                {calls.map((c, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono ${
                    c.output ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40' : 'bg-slate-50 dark:bg-slate-800'
                  }`}>
                    <span className="text-slate-700 dark:text-slate-300 font-bold w-24 flex-shrink-0">{c.op}</span>
                    {revealed ? (
                      <span className="text-slate-500 dark:text-slate-400">{c.effect}</span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 select-none">·····</span>
                    )}
                    {c.output && revealed && (
                      <span className="ml-auto text-blue-700 dark:text-blue-300 font-bold">출력: {c.output}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-mono">
                {revealed ? (
                  <span className="text-emerald-400">
                    출력: {calls.filter(c => c.output).map(c => c.output).join(' ')}
                  </span>
                ) : (
                  <span className="text-slate-600">출력: ? ?</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function StackQueueContent({ topic }: { topic: StudyTopic }) {
  void topic;
  return (
    <div className="max-w-5xl mx-auto space-y-8 px-6 py-6">
      <section id="stack-queue-sec-stack">
        <SH icon="📦" title="Stack 시뮬레이터 (LIFO)" />
        <ConceptBox
          what="Stack은 LIFO(Last In, First Out) 자료구조입니다. 나중에 push한 데이터를 먼저 pop합니다. top 포인터(-1이 초기값)로 스택 꼭대기를 추적합니다."
          rules={[
            'push(x): top < MAX-1 확인(overflow 체크) → arr[++top] = x (top 먼저 증가, 그다음 저장)',
            'pop(): top == -1이면 언더플로우. return arr[top--] (값 반환 후 top 감소)',
            'isEmpty(): top == -1 (top이 -1이면 아무것도 없음)',
          ]}
          caution="함정: arr[top++]가 아닌 arr[++top] — push 전에 top을 먼저 증가시켜야 올바른 인덱스에 저장됩니다. 순서를 바꾸면 인덱스가 어긋납니다."
        />
        <StackSection />
      </section>

      <section id="stack-queue-sec-queue">
        <SH icon="🚶" title="Queue 시뮬레이터 (FIFO)" />
        <ConceptBox
          what="Queue는 FIFO(First In, First Out) 자료구조입니다. 먼저 enqueue한 데이터를 먼저 dequeue합니다. front(출구)와 rear(입구) 두 포인터로 관리합니다."
          rules={[
            'enqueue(x): rear < MAX 확인(overflow 체크) → arr[rear++] = x (저장 후 rear 증가)',
            'dequeue(): front == rear이면 비어있음. return arr[front++] (값 반환 후 front 증가)',
            'isEmpty(): front == rear (두 포인터가 같으면 비어있음)',
          ]}
          caution="선형 큐의 한계: dequeue 후 front 앞의 공간이 낭비됩니다. 원형 큐(Circular Queue)는 rear = (rear+1)%MAX로 이를 해결합니다."
        />
        <QueueSection />
      </section>

      <section id="stack-queue-sec-trace">
        <SH icon="🔍" title="실행 결과 추적" />
        <ConceptBox
          what="Stack과 Queue의 출력 결과를 추적할 때 핵심은 'LIFO냐 FIFO냐'입니다. push/enqueue 순서를 기억하고 pop/dequeue 순서를 예측하세요."
          rules={[
            'Stack 출력 순서: LIFO — 가장 나중에 push한 것이 먼저 pop. 예: push(10,20,30) → pop 결과: 30, 20',
            'Queue 출력 순서: FIFO — 가장 먼저 enqueue한 것이 먼저 dequeue. 예: enqueue(5,6,7) → dequeue 결과: 5, 6',
          ]}
        />
        <TraceSection />
      </section>
    </div>
  );
}
