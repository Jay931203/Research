'use client';
import { useState } from 'react';
import type { StudyTopic } from '../TopicStudyCard';

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

/* ── Section 1: Pair<int> add() 추적 ── */
const INITIAL_DATA = [1, 2, 3, 4];
const PAIR_STEPS = [
  {
    label: '초기 상태',
    desc: 'data[4] = {1, 2, 3, 4}',
    data: [1, 2, 3, 4] as number[],
    aFirst: 0, aSecond: 2,
    bFirst: 1, bSecond: 3,
    highlight: [] as number[],
  },
  {
    label: 'Pair a 생성',
    desc: 'Pair a(data, data+2)\na.first = &data[0] (값=1)\na.second = &data[2] (값=3)',
    data: [1, 2, 3, 4],
    aFirst: 0, aSecond: 2,
    bFirst: 1, bSecond: 3,
    highlight: [0, 2],
  },
  {
    label: 'Pair b 생성',
    desc: 'Pair b(data+1, data+3)\nb.first = &data[1] (값=2)\nb.second = &data[3] (값=4)',
    data: [1, 2, 3, 4],
    aFirst: 0, aSecond: 2,
    bFirst: 1, bSecond: 3,
    highlight: [1, 3],
  },
  {
    label: 'a.add(b) 실행',
    desc: '*a.first += *b.first\ndata[0] += data[1]\n→ 1 + 2 = 3',
    data: [3, 2, 3, 4],
    aFirst: 0, aSecond: 2,
    bFirst: 1, bSecond: 3,
    highlight: [0, 1],
  },
  {
    label: 'a.add(b) 계속',
    desc: '*a.second += *b.second\ndata[2] += data[3]\n→ 3 + 4 = 7',
    data: [3, 2, 7, 4],
    aFirst: 0, aSecond: 2,
    bFirst: 1, bSecond: 3,
    highlight: [2, 3],
  },
  {
    label: 'a.print() 출력',
    desc: '(*a.first, *a.second)\n= (data[0], data[2])\n= (3, 7)\n\n출력: (3,7)',
    data: [3, 2, 7, 4],
    aFirst: 0, aSecond: 2,
    bFirst: 1, bSecond: 3,
    highlight: [0, 2],
  },
];

function PairTraceSection() {
  const [step, setStep] = useState(0);
  const cur = PAIR_STEPS[step];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Pair&lt;int&gt; add() 추적 — <span className="text-blue-600 dark:text-blue-400">{cur.label}</span>
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded px-2 py-1 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-300 dark:hover:bg-slate-600 transition">
              ◀
            </button>
            <span className="text-xs text-slate-500 font-mono">{step + 1} / {PAIR_STEPS.length}</span>
            <button onClick={() => setStep(s => Math.min(PAIR_STEPS.length - 1, s + 1))}
              disabled={step === PAIR_STEPS.length - 1}
              className="rounded px-2 py-1 text-xs font-bold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">
              ▶
            </button>
            <button onClick={() => setStep(0)}
              className="rounded px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition">
              ↺
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
          {/* data[] array cells */}
          <div>
            <p className="text-[10px] text-slate-400 font-mono mb-2">int data[4]</p>
            <div className="flex gap-2">
              {cur.data.map((val, i) => {
                const isAFirst = i === cur.aFirst;
                const isASecond = i === cur.aSecond;
                const isBFirst = i === cur.bFirst;
                const isBSecond = i === cur.bSecond;
                const isHighlighted = cur.highlight.includes(i);
                return (
                  <div key={i} className={`flex flex-col items-center gap-1 rounded-lg border-2 px-4 py-3 transition ${
                    isHighlighted
                      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">{val}</span>
                    <span className="text-[9px] text-slate-400 font-mono">[{i}]</span>
                    <div className="flex flex-col gap-0.5 items-center">
                      {isAFirst && <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">a.first</span>}
                      {isASecond && <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">a.second</span>}
                      {isBFirst && <span className="text-[8px] font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">b.first</span>}
                      {isBSecond && <span className="text-[8px] font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">b.second</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" />a 포인터</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-400 inline-block" />b 포인터</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-400 inline-block" />현재 연산</span>
            </div>
          </div>

          {/* step desc */}
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
            <pre className="text-xs font-mono text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{cur.desc}</pre>
          </div>

          {step === PAIR_STEPS.length - 1 && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 p-3 text-xs text-emerald-800 dark:text-emerald-200 font-mono font-bold text-center text-base">
              출력: (3,7)
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
          <p className="text-xs text-slate-400">Pair 클래스 템플릿</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`template<typename T>
class Pair {
private:
    T* first;
    T* second;
public:
    Pair(T* a, T* b) : first(a), second(b) {}

    void add(const Pair<T>& other) {
        *first  += *(other.first);   // T에 += 필요!
        *second += *(other.second);
    }

    void print() const {
        cout << "(" << *first
             << "," << *second << ")" << endl;
    }
};`}</pre>
      </div>
    </div>
  );
}

/* ── Section 2: T 타입 제약 체커 ── */
type TypeChoice = 'int' | 'double' | 'string' | 'LinkedList';

interface TypeInfo {
  label: string;
  hasPlus: boolean;
  hasPrint: boolean;
  note: string;
}

const TYPE_INFO: Record<TypeChoice, TypeInfo> = {
  int:        { label: 'int',        hasPlus: true,  hasPrint: true,  note: 'int는 += 연산자를 기본 지원합니다.' },
  double:     { label: 'double',     hasPlus: true,  hasPrint: true,  note: 'double도 += 연산자를 기본 지원합니다.' },
  string:     { label: 'string',     hasPlus: true,  hasPrint: true,  note: 'std::string은 += (문자열 이어붙이기)와 << 모두 지원합니다.' },
  LinkedList: { label: 'LinkedList', hasPlus: false, hasPrint: false, note: 'LinkedList는 operator+=가 없어 add() 인스턴스화 시 컴파일 에러!' },
};

function TypeConstraintSection() {
  const [selected, setSelected] = useState<TypeChoice>('int');
  const info = TYPE_INFO[selected];

  const checks = [
    { label: 'T에 operator+= 있음?', ok: info.hasPlus, usage: 'add() 메서드에서 *first += *other.first 사용' },
    { label: 'T에 operator<< 있음?', ok: info.hasPrint, usage: 'print()에서 cout << *first 사용' },
    { label: '복사 생성자 있음?', ok: true, usage: 'Pair 생성 시 T* 포인터만 받으므로 복사 불필요' },
  ];

  const compiles = checks.every(c => c.ok);

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TYPE_INFO) as TypeChoice[]).map(t => (
          <button key={t} onClick={() => setSelected(t)}
            className={`rounded-full px-4 py-2 text-xs font-bold font-mono transition ${
              selected === t
                ? TYPE_INFO[t].hasPlus ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}>
            Pair&lt;{t}&gt;
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className={`px-4 py-3 border-b ${compiles ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{compiles ? '✅' : '❌'}</span>
            <span className={`text-sm font-bold ${compiles ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
              Pair&lt;{info.label}&gt; — {compiles ? '컴파일 성공' : '컴파일 에러'}
            </span>
          </div>
          <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">{info.note}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 space-y-2">
          {checks.map((c, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${c.ok ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
              <span className="text-base flex-shrink-0">{c.ok ? '✅' : '❌'}</span>
              <div>
                <p className={`text-xs font-bold ${c.ok ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>{c.label}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{c.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected === 'LinkedList' && (
        <div className="rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800/40">
          <div className="bg-emerald-900 px-4 py-2 border-b border-emerald-700">
            <p className="text-xs text-emerald-200 font-bold">해결책: 헤더 선언만 추가</p>
          </div>
          <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`class LinkedList {
public:
    // 이 선언만 추가하면 컴파일 가능!
    // (구현은 불필요 — 사용하지 않으면 링크 오류 없음)
    LinkedList& operator+=(const LinkedList& other);
};`}</pre>
        </div>
      )}
    </div>
  );
}

/* ── Section 3: 인스턴스화 개념 ── */
function InstantiationSection() {
  const [showInt, setShowInt] = useState(true);
  const [showDouble, setShowDouble] = useState(true);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">컴파일 타임 인스턴스화 — 각 T마다 별도 코드 생성</p>
        </div>
        <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowInt(v => !v)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${showInt ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              Pair&lt;int&gt; {showInt ? '숨기기' : '보기'}
            </button>
            <button onClick={() => setShowDouble(v => !v)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${showDouble ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
              Pair&lt;double&gt; {showDouble ? '숨기기' : '보기'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {showInt && (
              <div className="rounded-xl overflow-hidden border border-blue-200 dark:border-blue-800/40">
                <div className="bg-blue-900 px-3 py-2 border-b border-blue-700">
                  <p className="text-xs text-blue-200 font-bold">Pair&lt;int&gt; — 컴파일러가 생성</p>
                </div>
                <pre className="bg-slate-950 text-xs p-3 text-slate-200 overflow-x-auto leading-relaxed">{`class Pair_int {
    int* first;
    int* second;
public:
    Pair_int(int* a, int* b)
        : first(a), second(b) {}
    void add(const Pair_int& o) {
        *first  += *(o.first);
        *second += *(o.second);
    }
    void print() const {
        cout << "(" << *first
             << "," << *second << ")\\n";
    }
};`}</pre>
              </div>
            )}
            {showDouble && (
              <div className="rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800/40">
                <div className="bg-purple-900 px-3 py-2 border-b border-purple-700">
                  <p className="text-xs text-purple-200 font-bold">Pair&lt;double&gt; — 컴파일러가 생성</p>
                </div>
                <pre className="bg-slate-950 text-xs p-3 text-slate-200 overflow-x-auto leading-relaxed">{`class Pair_double {
    double* first;
    double* second;
public:
    Pair_double(double* a, double* b)
        : first(a), second(b) {}
    void add(const Pair_double& o) {
        *first  += *(o.first);
        *second += *(o.second);
    }
    void print() const {
        cout << "(" << *first
             << "," << *second << ")\\n";
    }
};`}</pre>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-200">핵심 사항</p>
            <p>• 템플릿 정의는 <strong>헤더 파일</strong>에 있어야 함 — 컴파일러가 인스턴스화 시 코드를 볼 수 있어야 하므로</p>
            <p>• 사용된 타입만 인스턴스화됨 — Pair&lt;LinkedList&gt;를 안 쓰면 컴파일 에러 없음</p>
            <p>• <strong>코드 팽창(code bloat)</strong>: 타입마다 별도 코드 생성 → 실행 파일 크기 증가 가능</p>
          </div>
        </div>
      </div>

      {/* typename vs class */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">typename vs class</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-950 p-3">
              <pre className="text-xs text-slate-200 font-mono">{`template<typename T>  // 권장
template<class T>     // 동일
// 둘 다 사용 가능`}</pre>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              일반 타입 파라미터에서는 동일하게 동작합니다.
            </p>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-950 p-3">
              <pre className="text-xs text-slate-200 font-mono">{`// typename 필수 케이스:
// 의존 타입(dependent type)
typename T::iterator it;
// T의 중첩 타입을 명시`}</pre>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              의존 타입에는 반드시 <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">typename</code>을 써야 합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function TemplatesContent({ topic }: { topic: StudyTopic }) {
  void topic;
  return (
    <div className="max-w-5xl mx-auto space-y-8 px-6 py-6">
      <section id="templates-sec-trace">
        <SH icon="🧬" title="Pair<int> add() 추적" />
        <ConceptBox
          what="Pair&lt;T&gt;는 T 타입 값을 가리키는 두 포인터(first, second)를 가집니다. add()는 포인터를 통해 원본 배열의 값을 직접 수정합니다."
          rules={[
            'Pair a(data, data+2): a.first = &data[0](값=1), a.second = &data[2](값=3) — 배열 원소를 가리킴',
            'a.add(b): *a.first += *b.first → data[0] += data[1] → 원본 배열 직접 수정!',
            'a.print(): (*a.first, *a.second) = (data[0], data[2]) = 수정된 값 출력 → (3, 7)',
          ]}
          caution="a와 b가 같은 data[] 배열의 원소를 가리키므로 add() 후 data[0], data[2]가 변합니다. a.print()는 수정된 원본 배열 값을 출력합니다."
        />
        <PairTraceSection />
      </section>

      <section id="templates-sec-constraints">
        <SH icon="🔒" title="T 타입 제약 체커" />
        <ConceptBox
          what="클래스 템플릿에서 T가 가진 연산(+=, &lt;&lt;, 복사 생성자 등)이 충분해야 컴파일됩니다. 오류는 Pair&lt;T&gt;를 실제로 사용(인스턴스화)하는 시점에 발생합니다."
          rules={[
            'add() 사용 시: T에 operator+=가 있어야 함 (*first += *(other.first))',
            'print() 사용 시: T에 operator<<가 있어야 함 (cout << *first)',
            'Pair&lt;LinkedList&gt;의 add()를 호출하지 않으면: 컴파일 가능 (사용하지 않는 함수는 인스턴스화 안 됨)',
          ]}
          caution="해결책: LinkedList에 operator+= 선언만 추가하면 됩니다 — 구현 없이 선언만으로 컴파일 통과 (add()를 실제 호출하지 않으면 링크 에러도 없음)."
        />
        <TypeConstraintSection />
      </section>

      <section id="templates-sec-instantiation">
        <SH icon="⚙️" title="컴파일 타임 인스턴스화" />
        <ConceptBox
          what="컴파일러는 T를 실제 타입으로 치환하여 각 타입마다 별도의 구체 코드를 생성합니다. 이를 템플릿 인스턴스화(template instantiation)라고 합니다."
          rules={[
            'Pair&lt;int&gt; → 컴파일 시 int용 코드 생성 / Pair&lt;double&gt; → double용 코드 별도 생성',
            '헤더 파일 정의 필수: 컴파일러가 인스턴스화 시 템플릿 코드를 볼 수 있어야 함 (분리 컴파일 불가)',
            'typename과 class는 템플릿 파라미터에서 동일. 단, 의존 타입(typename T::iterator)에는 typename 필수',
          ]}
          caution="코드 팽창(code bloat): 타입마다 별도 코드가 생성되어 실행 파일 크기가 커질 수 있습니다. 자주 쓰는 타입만 인스턴스화되도록 설계하세요."
        />
        <InstantiationSection />
      </section>
    </div>
  );
}
