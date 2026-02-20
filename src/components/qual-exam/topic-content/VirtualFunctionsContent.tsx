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

/* ══════════════════════════════════════════════════════
   SECTION 1 — 정적 vs 동적 바인딩 데모
══════════════════════════════════════════════════════ */
type PtrType  = 'Student' | 'GradStudent' | 'PhD';
type ObjType  = 'Student' | 'GradStudent' | 'PhD';
type FuncId   = 'm1' | 'm2' | 'm3';

// Which classes define virtual m1/m2/m3
const VIRTUAL_FUNCS: Record<FuncId, boolean> = { m1: true, m2: true, m3: false };

// Which function body each class uses for each method
const CLASS_IMPL: Record<ObjType, Record<FuncId, string>> = {
  Student:     { m1: 'Student::m1()',     m2: 'Student::m2()',     m3: 'Student::m3()'     },
  GradStudent: { m1: 'GradStudent::m1()', m2: 'GradStudent::m2()', m3: 'Student::m3()'     },
  PhD:         { m1: 'PhD::m1()',         m2: 'GradStudent::m2()', m3: 'Student::m3()'     },
};

// Static dispatch uses pointer type
const STATIC_DISPATCH: Record<PtrType, Record<FuncId, string>> = {
  Student:     { m1: 'Student::m1()',     m2: 'Student::m2()',     m3: 'Student::m3()'     },
  GradStudent: { m1: 'GradStudent::m1()', m2: 'GradStudent::m2()', m3: 'GradStudent::m3()' },
  PhD:         { m1: 'PhD::m1()',         m2: 'GradStudent::m2()', m3: 'PhD::m3()'         },
};

function DispatchDemoSection() {
  const [ptrType, setPtrType] = useState<PtrType>('Student');
  const [objType, setObjType] = useState<ObjType>('PhD');
  const [func, setFunc] = useState<FuncId>('m1');

  const isVirtual = VIRTUAL_FUNCS[func];
  const calledFn  = isVirtual ? CLASS_IMPL[objType][func] : STATIC_DISPATCH[ptrType][func];
  const isDynamic = isVirtual;

  return (
    <div className="space-y-5">
      {/* Setup */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pointer type */}
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">① 포인터 타입</p>
          <div className="space-y-1.5">
            {(['Student', 'GradStudent', 'PhD'] as PtrType[]).map(t => (
              <button key={t} onClick={() => setPtrType(t)}
                className={`w-full rounded-lg px-3 py-2 text-xs font-bold font-mono text-left transition border ${
                  ptrType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}>
                {t}*
              </button>
            ))}
          </div>
        </div>

        {/* Object type */}
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">② 실제 객체 타입</p>
          <div className="space-y-1.5">
            {(['Student', 'GradStudent', 'PhD'] as ObjType[]).map(t => (
              <button key={t} onClick={() => setObjType(t)}
                className={`w-full rounded-lg px-3 py-2 text-xs font-bold font-mono text-left transition border ${
                  objType === t ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                }`}>
                new {t}()
              </button>
            ))}
          </div>
        </div>

        {/* Function */}
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">③ 호출할 함수</p>
          <div className="space-y-1.5">
            {([
              { id: 'm1' as FuncId, label: 'm1() — virtual' },
              { id: 'm2' as FuncId, label: 'm2() — virtual' },
              { id: 'm3' as FuncId, label: 'm3() — non-virtual' },
            ]).map(f => (
              <button key={f.id} onClick={() => setFunc(f.id)}
                className={`w-full rounded-lg px-3 py-2 text-xs font-bold font-mono text-left transition border ${
                  func === f.id ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code preview */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-slate-800 px-4 py-2 text-[11px] font-mono text-slate-400">dispatch.cpp</div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto">{`${ptrType}* p = new ${objType}();
p->${func}();  // ${isVirtual ? 'virtual → 동적 바인딩' : 'non-virtual → 정적 바인딩'}`}</pre>
      </div>

      {/* Dispatch result */}
      <div className={`rounded-xl border-2 p-5 ${isDynamic ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/20' : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20'}`}>
        <div className="flex items-start gap-4">
          <span className="text-3xl flex-shrink-0">{isDynamic ? '🔮' : '📌'}</span>
          <div>
            <p className={`text-xs font-bold mb-1 ${isDynamic ? 'text-purple-700 dark:text-purple-300' : 'text-blue-700 dark:text-blue-300'}`}>
              {isDynamic ? '동적 바인딩 (런타임 — vtable 조회)' : '정적 바인딩 (컴파일 타임 — 포인터 타입 기준)'}
            </p>
            <p className={`text-sm mb-2 ${isDynamic ? 'text-purple-800 dark:text-purple-200' : 'text-blue-800 dark:text-blue-200'}`}>
              {isDynamic
                ? `${func}은 virtual → 실제 객체(${objType})의 vtable 조회`
                : `${func}은 non-virtual → 포인터 타입(${ptrType})의 함수 직접 호출`}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">호출됨:</span>
              <code className={`text-base font-black font-mono ${isDynamic ? 'text-purple-600 dark:text-purple-300' : 'text-blue-600 dark:text-blue-300'}`}>
                {calledFn}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Key rule box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-purple-200 dark:border-purple-700/40 bg-purple-50 dark:bg-purple-950/20 p-4">
          <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-2">🔮 virtual 함수 — 동적 바인딩</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            포인터/참조 타입 무관. <strong>실제 객체 타입</strong>의 vtable에서 함수 조회. 런타임에 결정.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 dark:border-blue-700/40 bg-blue-50 dark:bg-blue-950/20 p-4">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">📌 non-virtual 함수 — 정적 바인딩</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            실제 객체 타입 무관. <strong>포인터/참조 선언 타입</strong>의 함수 직접 호출. 컴파일 타임에 결정.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 2 — vtable 시각화
══════════════════════════════════════════════════════ */
const VTABLE_DATA = [
  {
    cls: 'Student',
    color: 'border-blue-300 dark:border-blue-700',
    headBg: 'bg-blue-50 dark:bg-blue-950/30',
    tc: 'text-blue-700 dark:text-blue-300',
    slots: [
      { slot: 'm1', fn: '&Student::m1', note: '기본 구현', color: 'text-blue-500' },
      { slot: 'm2', fn: '&Student::m2', note: '기본 구현', color: 'text-blue-500' },
    ],
    note: 'virtual m1, m2 선언. m3, m4는 비가상 → vtable 없음',
  },
  {
    cls: 'GradStudent',
    color: 'border-amber-300 dark:border-amber-700',
    headBg: 'bg-amber-50 dark:bg-amber-950/30',
    tc: 'text-amber-700 dark:text-amber-300',
    slots: [
      { slot: 'm1', fn: '&GradStudent::m1', note: 'override!', color: 'text-emerald-500' },
      { slot: 'm2', fn: '&GradStudent::m2', note: 'override!', color: 'text-emerald-500' },
    ],
    note: 'm1, m2 모두 재정의. 슬롯 수는 부모와 동일',
  },
  {
    cls: 'PhD',
    color: 'border-purple-300 dark:border-purple-700',
    headBg: 'bg-purple-50 dark:bg-purple-950/30',
    tc: 'text-purple-700 dark:text-purple-300',
    slots: [
      { slot: 'm1', fn: '&PhD::m1', note: 'override!', color: 'text-emerald-500' },
      { slot: 'm2', fn: '&GradStudent::m2', note: '부모 상속', color: 'text-amber-500' },
      { slot: 'm3(new)', fn: '&PhD::m3', note: 'PhD가 새로 추가한 virtual', color: 'text-purple-500' },
    ],
    note: 'm1 재정의, m2는 GradStudent 상속, virtual m3 새로 추가 → 슬롯 증가!',
  },
];

function VTableSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const cls = selected ? VTABLE_DATA.find(v => v.cls === selected) : null;

  return (
    <div className="space-y-5">
      {/* Class hierarchy */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
        {VTABLE_DATA.map((v, i) => (
          <div key={v.cls} className="flex items-center gap-3">
            <button
              onClick={() => setSelected(selected === v.cls ? null : v.cls)}
              className={`rounded-xl border-2 px-5 py-3 font-bold font-mono text-sm transition ${
                selected === v.cls ? `${v.color} ${v.headBg}` : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400'
              }`}
            >
              <span className={selected === v.cls ? v.tc : 'text-slate-700 dark:text-slate-200'}>{v.cls}</span>
            </button>
            {i < VTABLE_DATA.length - 1 && (
              <div className="flex flex-col items-center">
                <span className="text-slate-400 text-sm rotate-90 sm:rotate-0">→</span>
                <span className="text-[10px] text-slate-400">상속</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center">클래스를 클릭하면 vtable 내용을 볼 수 있습니다</p>

      {/* Selected vtable */}
      {cls ? (
        <div className={`rounded-xl border-2 overflow-hidden ${cls.color}`}>
          <div className={`${cls.headBg} px-5 py-3 border-b ${cls.color}`}>
            <p className={`text-sm font-black font-mono ${cls.tc}`}>{cls.cls}의 vtable</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cls.note}</p>
          </div>
          <div className="bg-white dark:bg-slate-900">
            <div className="flex items-center gap-0 bg-slate-50 dark:bg-slate-800 px-5 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              <span className="w-24">슬롯</span>
              <span className="flex-1">가리키는 함수</span>
              <span className="w-32 text-right">설명</span>
            </div>
            {cls.slots.map((s, i) => (
              <div key={i} className="flex items-center gap-0 px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                <code className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 w-24">{s.slot}</code>
                <code className={`text-xs font-mono font-bold flex-1 ${s.color}`}>{s.fn}</code>
                <span className={`text-[11px] font-bold w-32 text-right ${s.color}`}>{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className="text-slate-400 text-sm">클래스를 선택하면 vtable 내용이 표시됩니다</p>
        </div>
      )}

      {/* vptr explanation */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">vptr — 가상 함수 포인터 (모든 가상 객체가 보유)</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`Student* ss = new PhD();
// ┌─────── 스택 ───────┐   ┌──── 힙 (PhD 객체) ────┐
// │ ss: 0x1000        │→→→│ vptr: PhD의 vtable    │
// └───────────────────┘   │ + Student 멤버들       │
//                         └───────────────────────┘
//                              ↓
//                    ┌──── PhD vtable ────┐
//                    │ m1 → PhD::m1       │
//                    │ m2 → GradStudent:: │
//                    │ m3 → PhD::m3       │
//                    └────────────────────┘

ss->m1();  // ss의 vptr → PhD vtable → m1 슬롯 → PhD::m1() 호출!`}</pre>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 3 — 함수 호출 추적기 (기출 코드 기반)
══════════════════════════════════════════════════════ */
interface TraceStep {
  callExpr: string;
  ptrDecl: string;
  steps: string[];
  result: string;
  isInfinite?: boolean;
}

const TRACE_SCENARIOS: TraceStep[] = [
  {
    callExpr: 'ss->m1()',
    ptrDecl: 'Student* ss = new PhD()',
    steps: [
      '1. m1 — virtual (Student에서 선언)',
      '2. 포인터 타입(Student*)은 무관 → vtable 조회',
      '3. 실제 객체(PhD) vptr → PhD vtable',
      '4. m1 슬롯 → PhD::m1 (최종 재정의)',
    ],
    result: '"phd::m1"',
  },
  {
    callExpr: 'ss->m3()',
    ptrDecl: 'Student* ss = new PhD()',
    steps: [
      '1. m3 — non-virtual (Student에서 선언)',
      '2. 포인터 타입(Student*) 기준으로 정적 바인딩',
      '3. → Student::m3() 호출',
      '4. Student::m3() 내부: m2() 호출',
      '5. m2는 virtual → PhD 객체의 vtable 조회',
      '6. m2 슬롯 → GradStudent::m2',
    ],
    result: '"gs::m2" + "ss::m3"',
  },
  {
    callExpr: 'gs->m1()',
    ptrDecl: 'GradStudent* gs = new PhD()',
    steps: [
      '1. m1 — virtual (Student에서 선언)',
      '2. 포인터 타입(GradStudent*)은 무관 → vtable 조회',
      '3. 실제 객체(PhD) vptr → PhD vtable',
      '4. m1 슬롯 → PhD::m1',
    ],
    result: '"phd::m1"',
  },
  {
    callExpr: 'gs->m3()',
    ptrDecl: 'GradStudent* gs = new PhD()',
    steps: [
      '1. m3 — non-virtual',
      '2. 포인터 타입(GradStudent*) 기준 정적 바인딩',
      '3. → GradStudent::m3() 호출',
      '4. GradStudent::m3() 내부: m1() 호출',
      '5. m1은 virtual → PhD::m1 (vtable)',
    ],
    result: '"phd::m1" + "gs::m3"',
  },
  {
    callExpr: 'mina->m3()',
    ptrDecl: 'PhD* mina = new PhD()',
    steps: [
      '1. m3 — PhD에서 virtual로 새로 선언!',
      '2. 동적 바인딩 → PhD::m3() 호출',
      '3. PhD::m3() 내부: m4() 호출',
      '4. m4는 non-virtual → Student::m4()',
      '5. Student::m4() 내부: m3() 호출',
      '6. m3은 virtual (PhD에서) → PhD::m3() ← 3번으로 돌아감!',
    ],
    result: '💥 무한 재귀 → Stack Overflow!',
    isInfinite: true,
  },
];

function CallTracerSection() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [revealSteps, setRevealSteps] = useState(true);
  const s = TRACE_SCENARIOS[selectedScenario];

  return (
    <div className="space-y-5">
      {/* Scenario selector */}
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          시나리오 선택
        </p>
        <div className="flex flex-wrap gap-2">
          {TRACE_SCENARIOS.map((sc, i) => (
            <button key={i} onClick={() => { setSelectedScenario(i); setRevealSteps(true); }}
              className={`rounded-full px-3 py-1.5 text-xs font-bold font-mono transition ${
                selectedScenario === i
                  ? sc.isInfinite ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}>
              {sc.callExpr}
            </button>
          ))}
        </div>
      </div>

      {/* Class code reference */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">클래스 선언 참고</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`class Student {
    virtual void m1() { cout << "ss::m1"; }   // virtual
    virtual void m2() { cout << "ss::m2"; }   // virtual
    void m3() { m2(); cout << "ss::m3"; }     // non-virtual, m2()는 가상 호출!
    void m4() { m3(); cout << "ss::m4"; }     // non-virtual
};
class GradStudent : public Student {
    void m1() { cout << "gs::m1"; }          // m1 override
    virtual void m2() { cout << "gs::m2"; }  // m2 override
    void m3() { m1(); cout << "gs::m3"; }    // non-virtual (shadows)
};
class PhD : public GradStudent {
    void m1() { cout << "phd::m1"; }        // m1 override
    virtual void m3() { m4(); cout << "phd::m3"; }  // 새 virtual m3 추가!
};`}</pre>
      </div>

      {/* Trace */}
      <div className={`rounded-xl border-2 overflow-hidden ${s.isInfinite ? 'border-red-300 dark:border-red-700' : 'border-blue-200 dark:border-blue-700'}`}>
        {/* Header */}
        <div className={`px-5 py-3 border-b ${s.isInfinite ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-700' : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700'}`}>
          <code className={`text-base font-black font-mono ${s.isInfinite ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>{s.callExpr}</code>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <code className="font-mono">{s.ptrDecl};</code>
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-slate-900 p-5">
          {revealSteps ? (
            <div className="space-y-2">
              {s.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black flex-shrink-0 mt-0.5 ${
                    s.isInfinite && i === s.steps.length - 1 ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>{i + 1}</span>
                  <p className={`text-sm leading-snug ${s.isInfinite && i === s.steps.length - 1 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={() => setRevealSteps(true)}
              className="w-full rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 py-4 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition">
              🔍 추적 단계 보기
            </button>
          )}
        </div>

        {/* Result */}
        <div className={`border-t px-5 py-3 ${s.isInfinite ? 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-950/20' : 'border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20'}`}>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">출력:</span>
          <code className={`text-sm font-bold font-mono ${s.isInfinite ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{s.result}</code>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 4 — 가상 소멸자
══════════════════════════════════════════════════════ */
function VirtualDtorSection() {
  const [hasVirtual, setHasVirtual] = useState(true);

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setHasVirtual(false)}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition border-2 ${
            !hasVirtual ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}>
          ❌ 가상 소멸자 없음
        </button>
        <button onClick={() => setHasVirtual(true)}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition border-2 ${
            hasVirtual ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}>
          ✅ 가상 소멸자 있음
        </button>
      </div>

      {/* Code */}
      <pre className="rounded-xl bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`class Base {
public:
    ${hasVirtual ? 'virtual ~Base() { cout << "[~Base]"; }  // ✅ 가상 소멸자' : '~Base() { cout << "[~Base]"; }  // ❌ 비가상 소멸자'}
};

class Derived : public Base {
public:
    char* data = new char[100];  // 동적 메모리!
    ~Derived() { delete[] data; cout << "[~Derived]"; }
};

Base* ptr = new Derived();
delete ptr;  // → 어떤 소멸자가 호출될까?`}</pre>

      {/* Result */}
      <div className={`rounded-xl border-2 p-5 ${hasVirtual ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20' : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20'}`}>
        <p className={`text-sm font-bold mb-3 ${hasVirtual ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
          delete ptr; 실행 결과:
        </p>
        <div className="space-y-2">
          {hasVirtual ? (
            <>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-emerald-500 font-bold">1.</span>
                <code className="font-mono text-emerald-600 dark:text-emerald-400">~Derived()</code>
                <span className="text-slate-600 dark:text-slate-300">호출 → data 메모리 해제 ✅</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-emerald-500 font-bold">2.</span>
                <code className="font-mono text-emerald-600 dark:text-emerald-400">~Base()</code>
                <span className="text-slate-600 dark:text-slate-300">호출 ✅</span>
              </div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-2">
                출력: [~Derived][~Base] — 메모리 안전!
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-red-500 font-bold">1.</span>
                <code className="font-mono text-red-600 dark:text-red-400">~Base()</code>
                <span className="text-red-600 dark:text-red-400 font-semibold">만 호출! (포인터 타입 Base* 기준, 정적 바인딩)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-red-500 font-bold">❌</span>
                <code className="font-mono text-red-600 dark:text-red-400">~Derived()</code>
                <span className="text-red-600 dark:text-red-400">호출 안 됨 → data 메모리 해제 안 됨!</span>
              </div>
              <p className="text-sm font-bold text-red-700 dark:text-red-300 mt-2">
                출력: [~Base] — 💥 100 byte 메모리 누수!
              </p>
            </>
          )}
        </div>
      </div>

      {/* Rule */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/10 px-4 py-3">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">📌 황금 규칙</p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>기반 클래스 포인터로 파생 클래스 객체를 delete할 가능성이 있으면 항상 기반 클래스에 <code className="font-mono text-amber-600 dark:text-amber-300">virtual ~Base()</code> 선언!</strong>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          순수 가상 소멸자도 가능: <code className="font-mono text-xs">virtual ~Base() = 0;</code> (단, 반드시 구현 본문도 필요)
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export default function VirtualFunctionsContent({ topic }: Props) {
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

      <section id="virtual-sec-dispatch">
        <SH icon="🔀" title="정적 vs 동적 바인딩 — 인터랙티브 데모" />
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          <strong>가상 함수(virtual)</strong>는 &ldquo;어떤 버전의 함수를 호출할지&rdquo;를 결정하는 방식을 바꿉니다.{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">non-virtual</code> 함수는 <strong>정적 바인딩</strong>으로 컴파일 타임에 포인터 선언 타입 기준으로 고정되고,{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">virtual</code> 함수는 <strong>동적 바인딩</strong>으로 런타임에 실제 객체 타입(vptr 조회)을 기준으로 결정됩니다.
          예를 들어 <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">{'Student* ss = new PhD(); ss->m1()'}</code>에서{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">m1</code>이 virtual이라면 포인터 타입이{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">Student</code>여도 실제 객체인{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">PhD::m1()</code>이 호출됩니다.
          한 가지 놓치기 쉬운 점: <strong>non-virtual 함수 안에서 virtual 함수를 호출해도 동적 바인딩이 적용됩니다.</strong>{' '}
          non-virtual 함수 자체는 정적으로 고정되지만, 그 안에서 호출하는 virtual 함수는{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">this</code>가 실제 객체를 가리키므로 vptr을 통해 파생 클래스 버전이 호출됩니다.
        </p>
        <DispatchDemoSection />
      </section>

      <section id="virtual-sec-vtable">
        <SH icon="📋" title="vtable 시각화" />
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">virtual</code> 함수를 가진 클래스마다{' '}
          <strong>가상 함수 테이블(vtable)</strong>이 하나 생성됩니다.
          vtable은 virtual 함수 포인터들의 배열로, 파생 클래스가 함수를 오버라이드하면 해당 슬롯이 파생 클래스의 구현으로 교체됩니다.
          각 객체는 생성자 시작 시 자신의 클래스 vtable을 가리키는 <strong>vptr</strong>을 갖게 됩니다.
          메모리 비용 측면에서는, <strong>vptr은 객체마다 하나씩</strong>(포인터 크기, 보통 8바이트) 추가되고, <strong>vtable 자체는 클래스당 하나만</strong> 존재하며 모든 인스턴스가 공유합니다.
          동적 디스패치 과정은{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">obj-&gt;vptr → vtable[슬롯] → 실제 함수</code> 순으로 진행됩니다.
        </p>
        <VTableSection />
      </section>

      <section id="virtual-sec-tracer">
        <SH icon="🔬" title="함수 호출 추적기" />
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          복잡한 상속 계층에서 함수 호출을 추적할 때는 규칙 두 가지만 기억하면 됩니다:{' '}
          <strong>virtual 함수는 실제 객체 타입</strong>을 기준으로,{' '}
          <strong>non-virtual 함수는 포인터/참조 선언 타입</strong>을 기준으로 호출됩니다.
          주의해야 할 함정은 <strong>무한 재귀</strong>입니다.
          virtual 함수 A가 non-virtual 함수 B를 호출하고, B가 다시 A를 호출하는 구조에서
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">this</code>는 변하지 않으므로 A는 계속 파생 클래스 버전으로 호출됩니다(A → B → A → B → ...).
          종료 조건 없이 이 패턴이 반복되면 스택 오버플로우로 이어집니다.
        </p>
        <CallTracerSection />
      </section>

      <section id="virtual-sec-dtor">
        <SH icon="🗑️" title="가상 소멸자의 중요성" />
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          기반 클래스 포인터로 파생 클래스 객체를{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">delete</code>할 때, 기반 클래스 소멸자가{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">virtual</code>이 아니면 파생 클래스 소멸자가 호출되지 않습니다.
          결과적으로 파생 클래스에서{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">new</code>로 할당한 자원이 해제되지 않아 메모리 누수가 발생합니다.
          해결책은 기반 클래스에{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">{'virtual ~Base() {}'}</code>를 선언하는 것입니다.
          <strong>다형성을 사용하는 기반 클래스라면 항상 virtual 소멸자를 선언하세요</strong> — 비용은 거의 없지만 버그 예방 효과는 큽니다.
          부연하면, 가상 함수를 재정의할 때{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">override</code> 키워드(C++11)를 붙이면 컴파일러가 시그니처 불일치를 검사해줍니다 — 함수 이름을 오타 내거나 매개변수 타입을 잘못 쓰면 컴파일 에러로 즉시 알 수 있어 소리 없이 새 함수가 생성되는 사고를 막을 수 있습니다.
        </p>
        <VirtualDtorSection />
      </section>
    </div>
  );
}
