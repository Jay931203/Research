'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
   SECTION 1 — 접근 지정자 시뮬레이터
══════════════════════════════════════════════════════ */
type Context = 'outside' | 'derived' | 'inside';
type InheritType = 'public' | 'protected' | 'private';

const CTX_META: Record<Context, { emoji: string; label: string; desc: string }> = {
  outside: { emoji: '🌍', label: '클래스 외부',     desc: 'main() 또는 일반 함수에서 접근' },
  derived: { emoji: '👶', label: '파생 클래스 내부', desc: 'class D : B { void f() { ... } } 안에서 접근' },
  inside:  { emoji: '🏠', label: '클래스 내부',     desc: 'B 자신의 멤버 함수에서 접근' },
};

const MEMBERS = [
  { spec: 'public'    as const, name: 'open',   type: 'int',    ok: { outside: true,  derived: true,  inside: true  } },
  { spec: 'protected' as const, name: 'shared', type: 'double', ok: { outside: false, derived: true,  inside: true  } },
  { spec: 'private'   as const, name: 'secret', type: 'char*',  ok: { outside: false, derived: false, inside: true  } },
];

const SPEC_COLOR: Record<string, string> = {
  public:    'text-emerald-600 dark:text-emerald-400',
  protected: 'text-amber-600 dark:text-amber-400',
  private:   'text-red-500 dark:text-red-400',
};

// B의 original 접근 지정자가 상속 방식에 따라 D에서 어떻게 됩니까?
type OrigSpec = 'public' | 'protected' | 'private';
function effectiveSpec(orig: OrigSpec, inh: InheritType): string {
  if (orig === 'private') return '불가 (항상)';
  const table: Record<OrigSpec, Record<InheritType, string>> = {
    public:    { public: 'public',    protected: 'protected', private: 'private'   },
    protected: { public: 'protected', protected: 'protected', private: 'private'   },
    private:   { public: '불가',      protected: '불가',      private: '불가'      },
  };
  return table[orig][inh];
}

function AccessSimulator() {
  const [ctx, setCtx] = useState<Context>('outside');
  const [inh, setInh] = useState<InheritType>('public');

  return (
    <div className="space-y-5">
      {/* Context switcher */}
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          어디서 접근하는지 선택하세요
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CTX_META) as Context[]).map(c => (
            <button
              key={c}
              onClick={() => setCtx(c)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition border
                ${ctx === c
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
            >
              <span>{CTX_META[c].emoji}</span> {CTX_META[c].label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400 italic">{CTX_META[ctx].desc}</p>
      </div>

      {/* Class visualization */}
      <div className="rounded-xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-900">
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span className="font-mono text-sm font-black text-slate-600 dark:text-slate-300">class</span>
          <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">MyClass</span>
          <span className="font-mono text-sm text-slate-400">{'{ ... }'}</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {MEMBERS.map(m => {
            const accessible = m.ok[ctx];
            return (
              <div
                key={m.name}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                  accessible
                    ? 'bg-emerald-50 dark:bg-emerald-950/25'
                    : 'bg-red-50 dark:bg-red-950/20 opacity-60'
                }`}
              >
                <code className={`text-xs font-black font-mono w-24 flex-shrink-0 ${SPEC_COLOR[m.spec]}`}>
                  {m.spec}:
                </code>
                <code className="text-sm font-mono text-slate-700 dark:text-slate-300 flex-1">
                  {m.type} <span className="text-slate-500">{m.name};</span>
                </code>
                <span className="text-lg flex-shrink-0">{accessible ? '✅' : '❌'}</span>
                <span className={`text-xs font-semibold w-20 text-right flex-shrink-0 ${
                  accessible ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                }`}>
                  {accessible ? '접근 가능' : '접근 불가'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inheritance table — shown only in derived context */}
      {ctx === 'derived' && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-700/50 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2.5 border-b border-amber-200 dark:border-amber-700/50">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
              상속 방식에 따른 접근 변화 — <code className="font-mono">class D : [?] MyClass</code>
            </p>
          </div>

          {/* Inheritance type selector */}
          <div className="flex gap-2 p-3 border-b border-slate-100 dark:border-slate-800">
            {(['public', 'protected', 'private'] as InheritType[]).map(t => (
              <button
                key={t}
                onClick={() => setInh(t)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  inh === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                : {t} B
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-slate-500 dark:text-slate-400">B의 원래 지정자</th>
                  <th className="px-4 py-2 text-left font-bold text-slate-500 dark:text-slate-400">D에서의 유효 지정자</th>
                  <th className="px-4 py-2 text-left font-bold text-slate-500 dark:text-slate-400">설명</th>
                </tr>
              </thead>
              <tbody>
                {(['public', 'protected', 'private'] as OrigSpec[]).map(orig => {
                  const eff = effectiveSpec(orig, inh);
                  const notAllowed = eff.startsWith('불가');
                  return (
                    <tr key={orig} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5">
                        <code className={`font-mono font-bold ${SPEC_COLOR[orig]}`}>{orig}</code>
                      </td>
                      <td className="px-4 py-2.5">
                        <code className={`font-mono font-bold ${
                          notAllowed ? 'text-slate-400 italic' :
                          eff === 'public' ? 'text-emerald-600 dark:text-emerald-400' :
                          eff === 'protected' ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-500'
                        }`}>{eff}</code>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                        {notAllowed ? 'D에서 접근 불가 (private은 항상 차단)' :
                         eff === 'public' ? '어디서나 접근 가능' :
                         eff === 'protected' ? 'D 자신 및 D의 파생 클래스에서만 접근' :
                         'D 자신 내에서만 접근 가능'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 2 — 초기화 리스트
══════════════════════════════════════════════════════ */
const MANDATORY_CASES = [
  {
    icon: '🔒',
    title: 'const 멤버 변수',
    badge: '대입 불가',
    color: 'border-red-200 dark:border-red-700/50',
    headBg: 'bg-red-50 dark:bg-red-900/20',
    wrong: `MyClass(int n) {\n    id_ = n;  // ❌ 컴파일 에러!\n              // const는 생성 후 수정 불가\n}`,
    right:  `MyClass(int n) : id_(n) { }\n// ✅ 생성과 동시에 초기화`,
    explain: 'const 변수는 선언과 동시에 값이 확정되어야 합니다. 초기화 리스트가 유일한 방법입니다.',
  },
  {
    icon: '🔗',
    title: '참조(reference) 멤버 변수',
    badge: '참조는 재바인딩 불가',
    color: 'border-amber-200 dark:border-amber-700/50',
    headBg: 'bg-amber-50 dark:bg-amber-900/20',
    wrong: `MyClass(int& r) {\n    ref_ = r;  // ❌ 컴파일 에러!\n               // 참조는 선언 시 바인딩 필수\n}`,
    right:  `MyClass(int& r) : ref_(r) { }\n// ✅ r에 바인딩`,
    explain: '참조(reference)는 선언과 동시에 참조 대상을 지정해야 합니다. 초기화 후 다른 객체를 참조하도록 변경할 수 없습니다.',
  },
  {
    icon: '🏗️',
    title: '기본 생성자가 없는 멤버 객체',
    badge: 'A() 없음',
    color: 'border-purple-200 dark:border-purple-700/50',
    headBg: 'bg-purple-50 dark:bg-purple-900/20',
    wrong: `class A { A(int x) {} }; // A()없음\nclass B {\n    A a_;\n    B() {\n        a_ = A(5); // ❌ 에러!\n    }              // 먼저 A()가 호출되어야\n};                 // 하는데 A()가 없음!`,
    right:  `class B {\n    A a_;\n    B() : a_(5) { } // ✅\n};  // 리스트에서 A(5) 호출`,
    explain: '생성자 본문 실행 전, 컴파일러가 멤버를 기본 생성자로 초기화하려 합니다. A()가 없으면 에러! 리스트에서 원하는 생성자를 직접 지정해야 합니다.',
  },
];

function InitListSection() {
  const [openCases, setOpenCases] = useState<boolean[]>([true, true, true]);

  return (
    <div className="space-y-6">

      {/* Side-by-side comparison */}
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
          대입 방식 vs 초기화 리스트 — 무엇이 다른가?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Bad */}
          <div className="rounded-xl overflow-hidden border-2 border-red-200 dark:border-red-800/50">
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2.5">
              <span>❌</span>
              <p className="text-xs font-bold text-red-700 dark:text-red-300">대입 방식 (비권장)</p>
            </div>
            <pre className="bg-slate-950 text-xs leading-[1.9] p-4 overflow-x-auto text-slate-200">{`MyClass(int x, double y) {
  x_ = x;  // ① x_ 기본 초기화
            // ② x 대입 ← 2단계!
  y_ = y;  // ① y_ 기본 초기화
            // ② y 대입 ← 2단계!
}`}</pre>
            <div className="bg-red-50 dark:bg-red-900/10 px-4 py-2 text-xs text-red-600 dark:text-red-300">
              멤버가 먼저 기본 생성 후 대입 → 총 2단계
            </div>
          </div>
          {/* Good */}
          <div className="rounded-xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-800/50">
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5">
              <span>✅</span>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">초기화 리스트 (권장)</p>
            </div>
            <pre className="bg-slate-950 text-xs leading-[1.9] p-4 overflow-x-auto text-slate-200">{`MyClass(int x, double y)
    : x_(x), y_(y) {
  // 생성과 동시에 초기화 완료!
  // x_ ← x, y_ ← y (각 1단계)
}`}</pre>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 text-xs text-emerald-600 dark:text-emerald-300">
              생성과 동시에 초기화 → 총 1단계 (효율적)
            </div>
          </div>
        </div>
      </div>

      {/* Order trap */}
      <div className="rounded-xl border border-orange-200 dark:border-orange-700/40 bg-orange-50 dark:bg-orange-900/10 p-4">
        <p className="text-sm font-bold text-orange-700 dark:text-orange-300 mb-4">
          ⚠️ 초기화 순서 함정 — 리스트 작성 순서가 아닌 선언 순서!
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">클래스 선언 순서</p>
            <div className="space-y-2">
              {[
                { n: '①', code: 'int a_;', note: '먼저 선언', hi: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
                { n: '②', code: 'int b_;', note: '나중 선언', hi: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
              ].map(r => (
                <div key={r.n} className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${r.hi}`}>{r.n}</span>
                  <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{r.code}</code>
                  <span className="text-xs text-slate-400">{r.note}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">실제 초기화 순서</p>
            <div className="space-y-2">
              {[
                { n: '①', code: 'a_', note: '먼저 초기화!', hi: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
                { n: '②', code: 'b_', note: '나중 초기화', hi: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
              ].map(r => (
                <div key={r.n} className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${r.hi}`}>{r.n}</span>
                  <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{r.code}</code>
                  <span className="text-xs text-slate-400">{r.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <pre className="rounded-lg bg-slate-950 text-xs p-3 text-slate-200 overflow-x-auto leading-relaxed">{`D(int x) : b_(x), a_(b_) { }
//           ^^^^^^^^^^^
//  함정! a_가 먼저 초기화되는데 이때 b_는 아직 쓰레기값!
//  → a_에 미정의 값 저장 → Undefined Behavior
//  안전: D(int x) : a_(x), b_(x) { }  (각자 독립적으로 초기화)`}</pre>
      </div>

      {/* 3 mandatory cases */}
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
          반드시 초기화 리스트를 써야 하는 3가지 경우
        </p>
        <div className="space-y-2">
          {MANDATORY_CASES.map((c, i) => {
            const open = openCases[i];
            return (
              <div key={i} className={`rounded-xl border-2 overflow-hidden transition ${open ? c.color : 'border-slate-200 dark:border-slate-700'}`}>
                <button
                  onClick={() => setOpenCases(prev => prev.map((v, j) => j === i ? !v : v))}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                    open ? `${c.headBg}` : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mr-2">{c.title}</span>
                    <span className="inline-block rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 text-[10px] font-bold">{c.badge}</span>
                  </div>
                  {open
                    ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
                </button>
                {open && (
                  <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 bg-white dark:bg-slate-900 space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{c.explain}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1.5">❌ 대입 방식</p>
                        <pre className="rounded-lg bg-slate-950 text-xs p-3 text-slate-200 overflow-x-auto leading-relaxed">{c.wrong}</pre>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">✅ 초기화 리스트</p>
                        <pre className="rounded-lg bg-slate-950 text-xs p-3 text-slate-200 overflow-x-auto leading-relaxed">{c.right}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 3 — 생성자 종류
══════════════════════════════════════════════════════ */
const COPY_CTOR_SCENARIOS = [
  { code: 'MyClass b = a;',              label: '복사 초기화',   called: true  },
  { code: 'MyClass b(a);',               label: '직접 초기화',   called: true  },
  { code: 'void f(MyClass x); f(a);',    label: '값 전달',       called: true  },
  { code: 'MyClass f() { return a; }',   label: '값 반환',       called: true  },
  { code: 'MyClass* p = &a;',            label: '포인터 대입',   called: false },
  { code: 'MyClass& r = a;',             label: '참조 초기화',   called: false },
];

function CtorSection() {
  const [openDefault, setOpenDefault] = useState(true);
  const [openCopy, setOpenCopy] = useState(true);

  return (
    <div className="space-y-3">

      {/* Default constructor card */}
      <div className={`rounded-xl border-2 overflow-hidden transition ${
        openDefault ? 'border-blue-300 dark:border-blue-700' : 'border-slate-200 dark:border-slate-700'
      } bg-white dark:bg-slate-900`}>
        <button
          onClick={() => setOpenDefault(v => !v)}
          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition ${
            openDefault ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <span className="text-2xl flex-shrink-0">🏗️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">기본 생성자 (Default Constructor)</p>
            <code className="text-xs font-mono text-slate-500">ClassName() — 인수 없음</code>
          </div>
          {openDefault
            ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
            : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
        </button>
        {openDefault && (
          <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-4 py-3 space-y-2">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">⚠️ 자동 생성 조건 — 핵심!</p>
              {[
                { icon: '✅', code: 'class A {};',           note: '생성자를 하나도 정의 안 함 → 컴파일러가 A() 자동 생성', good: true },
                { icon: '❌', code: 'class B { B(int x){}};', note: 'B(int)를 정의했으므로 B()는 자동 생성 안 됨 → B b; 컴파일 에러!', good: false },
                { icon: '✅', code: 'class C { C(int x=0){}};', note: '기본값 제공 → C()처럼 호출 가능', good: true },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="flex-shrink-0 mt-0.5">{r.icon}</span>
                  <code className="font-mono text-slate-700 dark:text-slate-300 flex-shrink-0">{r.code}</code>
                  <span className={r.good ? 'text-slate-500 dark:text-slate-400' : 'text-red-600 dark:text-red-400 font-semibold'}>{r.note}</span>
                </div>
              ))}
            </div>
            <pre className="rounded-xl bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`class Student {
    int id_;
    std::string name_;
public:
    Student() : id_(0), name_("") {}          // 명시적 기본 생성자
    Student(int id, std::string n)
        : id_(id), name_(n) {}                // 매개변수 생성자
};

Student s1;             // 기본 생성자 호출
Student s2(1, "Alice"); // 매개변수 생성자 호출
Student arr[3];         // 배열 원소 각각에 기본 생성자 호출`}</pre>
          </div>
        )}
      </div>

      {/* Copy constructor card */}
      <div className={`rounded-xl border-2 overflow-hidden transition ${
        openCopy ? 'border-purple-300 dark:border-purple-700' : 'border-slate-200 dark:border-slate-700'
      } bg-white dark:bg-slate-900`}>
        <button
          onClick={() => setOpenCopy(v => !v)}
          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition ${
            openCopy ? 'bg-purple-50 dark:bg-purple-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <span className="text-2xl flex-shrink-0">📋</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">복사 생성자 (Copy Constructor)</p>
            <code className="text-xs font-mono text-slate-500">ClassName(const ClassName&amp; other)</code>
          </div>
          {openCopy
            ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
            : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
        </button>
        {openCopy && (
          <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              같은 타입의 다른 객체를 이용해 새 객체를 초기화할 때 호출됩니다.
              아래 시나리오 중 복사 생성자가 호출되는 경우는?
            </p>
            <div className="space-y-1.5">
              {COPY_CTOR_SCENARIOS.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 border ${
                    s.called
                      ? 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-700/40'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{s.called ? '✅' : '⬜'}</span>
                  <code className="text-xs font-mono flex-1 text-slate-700 dark:text-slate-300">{s.code}</code>
                  <span className={`text-xs font-semibold flex-shrink-0 ${
                    s.called ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}>
                    {s.label} {s.called ? '→ 호출' : '→ 미호출'}
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 px-4 py-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 포인터(<code className="font-mono">MyClass*</code>)나 참조(<code className="font-mono">MyClass&amp;</code>) 초기화는
                새 객체를 생성하지 않으므로 복사 생성자가 호출되지 않습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 4 — const·this·static
══════════════════════════════════════════════════════ */
function StaticsSection() {
  return (
    <div className="space-y-5">

      {/* this type table */}
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">this 포인터 타입과 const 객체</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2.5 text-left font-bold text-slate-500 dark:text-slate-400">함수 선언</th>
                <th className="px-4 py-2.5 text-left font-bold text-slate-500 dark:text-slate-400">this 타입</th>
                <th className="px-4 py-2.5 text-center font-bold text-slate-500 dark:text-slate-400">멤버 수정</th>
                <th className="px-4 py-2.5 text-center font-bold text-slate-500 dark:text-slate-400">const 객체에서 호출</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-2.5"><code className="font-mono text-slate-700 dark:text-slate-300">void f()</code></td>
                <td className="px-4 py-2.5"><code className="font-mono text-blue-600 dark:text-blue-400">T* const</code></td>
                <td className="px-4 py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">✅</td>
                <td className="px-4 py-2.5 text-center text-red-500 font-bold">❌</td>
              </tr>
              <tr className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <td className="px-4 py-2.5"><code className="font-mono text-slate-700 dark:text-slate-300">void f() const</code></td>
                <td className="px-4 py-2.5"><code className="font-mono text-purple-600 dark:text-purple-400">const T* const</code></td>
                <td className="px-4 py-2.5 text-center text-red-500 font-bold">❌</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">const 객체(const T obj)에서는 const 멤버 함수만 호출 가능. 단, <code className="font-mono">mutable</code> 멤버는 const 함수에서도 수정 가능.</p>
      </div>

      {/* static member */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">static 멤버 패턴 — 객체 개수 추적기</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`class Widget {
    static int count_;  // 선언만 (클래스 내)
    int id_;
public:
    Widget() : id_(++count_) {}
    ~Widget() { --count_; }
    static int count() { return count_; }  // this 없음, static만 접근
};
int Widget::count_ = 0;  // ← 반드시 클래스 외부에서 정의 + 초기화!

Widget a, b, c;
cout << Widget::count();   // 3  (클래스 이름으로 호출)
cout << a.count();         // 3  (객체로도 호출 가능, 비권장)`}</pre>
      </div>

      {/* method chaining */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">this 활용 — 메서드 체이닝 (Fluent Interface)</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`class Builder {
    int x_ = 0, y_ = 0;
public:
    Builder& setX(int x) { x_ = x; return *this; }  // *this 반환!
    Builder& setY(int y) { y_ = y; return *this; }
    void build() { cout << x_ << ", " << y_; }
};

Builder b;
b.setX(10).setY(20).build();  // ← 연쇄 호출 가능 (return *this 덕분)`}</pre>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export default function OopBasicsContent({ topic }: Props) {
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

      <section id="oop-basics-sec-access">
        <SH icon="🔐" title="접근 지정자 — 인터랙티브 시뮬레이터" />
        <ConceptBox
          what="public / protected / private는 멤버를 '누가 볼 수 있는가'를 제어합니다. struct 기본값 = public, class 기본값 = private."
          rules={[
            'public: 어디서나 접근 가능',
            'protected: 클래스 내부 + 파생 클래스 내부만 접근 가능',
            'private: 해당 클래스 내부 + friend만 접근 가능',
          ]}
          caution="상속 시 접근 범위는 더 좁아질 수만 있습니다 (public→protected→private 방향). 부모의 private는 파생 클래스에서도 직접 접근 불가."
        />
        <AccessSimulator />
      </section>

      <section id="oop-basics-sec-initlist">
        <SH icon="🔧" title="초기화 리스트 (Member Initializer List)" />
        <ConceptBox
          what="초기화 리스트는 생성자 본문 { } 실행 전에 멤버를 직접 초기화하는 C++ 전용 문법입니다. 대입 방식(본문에서 =)보다 효율적이며 일부 케이스에선 필수입니다."
          rules={[
            '필수 ①: const 멤버 — 선언 후 대입 불가, 초기화 리스트에서만 초기화 가능',
            '필수 ②: 참조(reference) 멤버 — 선언 시 바인딩 필요',
            '필수 ③: 기본 생성자가 없는 멤버 객체 — 초기화 리스트에서 직접 생성자 호출',
          ]}
          caution="함정: 초기화 순서는 리스트 작성 순서가 아닌 클래스 내 선언 순서! D(int x) : b_(x), a_(b_) { }에서 a_가 먼저 초기화되므로 b_는 아직 쓰레기값 → UB."
        />
        <InitListSection />
      </section>

      <section id="oop-basics-sec-ctors">
        <SH icon="🏗️" title="생성자 종류" />
        <ConceptBox
          what="생성자는 객체가 만들어질 때 자동으로 호출되는 특수 멤버 함수입니다. 기본·매개변수·복사 생성자 3종류가 있습니다."
          rules={[
            '기본 생성자 자동 생성 조건: 사용자가 생성자를 하나도 정의하지 않아야 함. 하나라도 있으면 컴파일러 자동 생성 안 됨 → B b; 컴파일 에러!',
            '복사 생성자 호출 4가지 시점: 복사 초기화(b=a) / 직접 초기화 b(a) / 값 전달(인수) / 값 반환',
            'MyClass* p = &a; 는 포인터 대입 → 복사 생성자 호출 안 됨',
          ]}
        />
        <CtorSection />
      </section>

      <section id="oop-basics-sec-statics">
        <SH icon="📌" title="const 함수 · this · static" />
        <ConceptBox
          what="const 멤버 함수, this 포인터, static 멤버 변수는 클래스 설계에서 자주 쓰이는 세 가지 핵심 요소입니다."
          rules={[
            'const 멤버 함수: this가 const T*가 되어 멤버 값 수정 불가. const 객체는 const 함수만 호출 가능',
            'this 포인터: 현재 객체의 주소. *this는 현재 객체 자신. 메서드 체이닝에서 return *this; 패턴',
            'static 멤버 변수: 클래스당 하나만 존재. 반드시 클래스 외부에서 별도 정의 및 초기화 필요',
          ]}
        />
        <StaticsSection />
      </section>
    </div>
  );
}
