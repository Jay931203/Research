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
   SECTION 1 — 순수 가상 함수와 추상 클래스
══════════════════════════════════════════════════════ */
type ShapeImpl = 'Circle' | 'Rectangle' | 'Triangle';

const SHAPE_IMPLS: Record<ShapeImpl, { area: boolean; clone: boolean; note: string }> = {
  Circle:    { area: true,  clone: true,  note: 'circle: area(), clone() 모두 구현 → 인스턴스화 가능' },
  Rectangle: { area: true,  clone: false, note: 'clone() 미구현 → 추상 클래스 → 인스턴스화 불가!' },
  Triangle:  { area: false, clone: false, note: 'area(), clone() 모두 미구현 → 추상 클래스 → 인스턴스화 불가!' },
};

function AbstractClassSection() {
  const [selected, setSelected] = useState<ShapeImpl>('Circle');
  const impl = SHAPE_IMPLS[selected];
  const isAbstract = !impl.area || !impl.clone;

  return (
    <div className="space-y-5">
      {/* Base code */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">기반 추상 클래스 Shape</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`struct Shape {
    virtual ~Shape() {}                     // 가상 소멸자 (필수!)
    virtual double area()  const = 0;       // 순수 가상 함수 (1)
    virtual Shape* clone() const = 0;       // 순수 가상 함수 (2)
};
// Shape s; → 컴파일 에러! 추상 클래스는 인스턴스화 불가
// Shape* p = new Shape(); → 에러!`}</pre>
      </div>

      {/* Derived class selector */}
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          파생 클래스 선택 — 어떤 함수를 구현했나요?
        </p>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(SHAPE_IMPLS) as ShapeImpl[]).map(cls => (
            <button key={cls} onClick={() => setSelected(cls)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition border-2 ${
                selected === cls ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}>
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Implementation status */}
      <div className={`rounded-xl border-2 overflow-hidden ${isAbstract ? 'border-red-300 dark:border-red-700' : 'border-emerald-300 dark:border-emerald-700'}`}>
        <div className={`px-5 py-3 ${isAbstract ? 'bg-red-50 dark:bg-red-950/30' : 'bg-emerald-50 dark:bg-emerald-950/20'}`}>
          <code className={`text-base font-black font-mono ${isAbstract ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{selected}</code>
          <span className="ml-2 text-xs font-bold">{isAbstract ? '→ 추상 클래스 (인스턴스화 불가!)' : '→ 완전 구현 (인스턴스화 가능!)'}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 space-y-2">
          {[
            { method: 'area()', implemented: impl.area },
            { method: 'clone()', implemented: impl.clone },
          ].map(m => (
            <div key={m.method} className={`flex items-center gap-3 rounded-lg px-4 py-2.5 border ${
              m.implemented ? 'border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-950/20' : 'border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-950/20'
            }`}>
              <span className="text-lg flex-shrink-0">{m.implemented ? '✅' : '❌'}</span>
              <code className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300 flex-1">{m.method}</code>
              <span className={`text-xs font-semibold ${m.implemented ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {m.implemented ? '구현됨' : '미구현 (순수 가상 유지)'}
              </span>
            </div>
          ))}
        </div>
        {/* Instantiation test */}
        <div className={`border-t px-5 py-3 ${isAbstract ? 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-950/20' : 'border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'}`}>
          <code className={`text-xs font-mono font-bold ${isAbstract ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isAbstract
              ? `${selected} s;  // ❌ 컴파일 에러 — 순수 가상 함수(${[!impl.area && 'area', !impl.clone && 'clone'].filter(Boolean).join(', ')}) 미구현!`
              : `${selected} s(3.0);  // ✅ OK — 모든 순수 가상 함수 구현됨`}
          </code>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{impl.note}</p>
        </div>
      </div>

      {/* Pure virtual rule */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">순수 가상 함수 규칙 정리</p>
        </div>
        <div className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { rule: '= 0 으로 선언', effect: '그 클래스는 추상 클래스(Abstract Class)가 됨', color: 'text-red-600 dark:text-red-400' },
            { rule: '파생 클래스에서 전부 override', effect: '콘크리트 클래스(Concrete) → 인스턴스화 가능', color: 'text-emerald-600 dark:text-emerald-400' },
            { rule: '파생 클래스에서 일부만 override', effect: '파생 클래스도 추상 클래스 → 인스턴스화 불가', color: 'text-red-600 dark:text-red-400' },
            { rule: '기반 클래스 포인터/참조 사용', effect: 'Shape* p = new Circle(1.0); → 다형성 활용 가능!', color: 'text-blue-600 dark:text-blue-400' },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-3">
              <code className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex-shrink-0 w-56 leading-relaxed">{r.rule}</code>
              <span className={`text-xs ${r.color} leading-relaxed`}>{r.effect}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 2 — clone() 패턴 — 다형적 깊은 복사
══════════════════════════════════════════════════════ */
type CloneMode = 'without' | 'with';

function ClonePatternSection() {
  const [mode, setMode] = useState<CloneMode>('with');

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setMode('without')}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition border-2 ${
            mode === 'without' ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}>
          ❌ clone() 없이 복사
        </button>
        <button onClick={() => setMode('with')}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition border-2 ${
            mode === 'with' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}>
          ✅ clone() 패턴 사용
        </button>
      </div>

      {/* Code */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 border-b border-slate-700">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-2 text-[11px] font-mono text-slate-400">{mode === 'without' ? 'scene_bad.cpp' : 'scene_good.cpp'}</span>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">
          {mode === 'without'
            ? `// ❌ clone() 없이 — 복사 생성자 문제
struct Shape { virtual ~Shape() {} virtual double area() const = 0; };
struct Circle : Shape {
    double r;
    Circle(double rr) : r(rr) {}
    double area() const { return 3.14 * r * r; }
    // clone() 없음!
};

struct Scene {
    vector<Shape*> v;

    // 복사 생성자 — 포인터만 복사 (얕은 복사!)
    Scene(const Scene& s) {
        for (auto* p : s.v)
            v.push_back(p);  // ❌ 같은 Shape*를 공유!
    }                         // → 소멸 시 double-free!
};`
            : `// ✅ clone() 패턴 — 올바른 다형적 깊은 복사
struct Shape {
    virtual ~Shape() {}
    virtual double area()  const = 0;
    virtual Shape* clone() const = 0;  // 순수 가상 clone
};
struct Circle : Shape {
    double r;
    Circle(double rr) : r(rr) {}
    double area()  const { return 3.14 * r * r; }
    Shape* clone() const { return new Circle(*this); }  // ✅ 자신 복사
};
struct Triangle : Shape {
    double b, h;
    Triangle(double bb, double hh) : b(bb), h(hh) {}
    double area()  const { return 0.5 * b * h; }
    Shape* clone() const { return new Triangle(*this); } // ✅ 자신 복사
};

struct Scene {
    vector<Shape*> v;

    void add(const Shape& s) { v.push_back(s.clone()); }

    // 복사 생성자 — clone()으로 깊은 복사!
    Scene(const Scene& s) {
        for (auto* p : s.v)
            v.push_back(p->clone());  // ✅ 실제 타입 그대로 복사!
    }

    ~Scene() { for (auto* p : v) delete p; }
};`}
        </pre>
      </div>

      {/* Diagram */}
      <div className={`rounded-xl border-2 p-5 ${mode === 'without' ? 'border-red-300 dark:border-red-700' : 'border-emerald-300 dark:border-emerald-700'}`}>
        <p className={`text-xs font-bold mb-4 ${mode === 'without' ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
          {mode === 'without' ? '❌ 얕은 복사 — 포인터 공유' : '✅ 깊은 복사 — clone()으로 독립된 객체'}
        </p>

        {mode === 'without' ? (
          <div className="space-y-3">
            {/* Original scene */}
            <div>
              <p className="text-[11px] font-bold text-blue-400 uppercase mb-2">원본 Scene a</p>
              <div className="flex gap-2 flex-wrap">
                {[{ t: 'Circle', r: 3 }, { t: 'Triangle', b: 4 }].map((s, i) => (
                  <div key={i} className="rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 text-xs font-mono">
                    <p className="font-bold text-blue-600 dark:text-blue-400">{s.t}</p>
                    <p className="text-[10px] text-slate-400">0x{(0x1000 + i * 0x100).toString(16).toUpperCase()}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-red-500">
              <span className="flex-1 border-t-2 border-dashed border-red-400" />
              <span className="font-bold">복사 후 b.v에 같은 포인터!</span>
              <span className="flex-1 border-t-2 border-dashed border-red-400" />
            </div>
            {/* Copied scene */}
            <div>
              <p className="text-[11px] font-bold text-red-400 uppercase mb-2">복사 Scene b (얕은 복사)</p>
              <div className="flex gap-2 flex-wrap">
                {[{ t: 'Circle', r: 3 }, { t: 'Triangle', b: 4 }].map((s, i) => (
                  <div key={i} className="rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20 px-3 py-2 text-xs font-mono">
                    <p className="font-bold text-red-600 dark:text-red-400">{s.t}</p>
                    <p className="text-[10px] text-red-500">0x{(0x1000 + i * 0x100).toString(16).toUpperCase()} ← 같은 주소!</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 font-bold">→ ~b() 소멸 시 delete, ~a() 다시 delete → double-free 크래시!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Original */}
            <div>
              <p className="text-[11px] font-bold text-blue-400 uppercase mb-2">원본 Scene a</p>
              <div className="flex gap-2 flex-wrap">
                {[{ t: 'Circle', addr: '0x1000' }, { t: 'Triangle', addr: '0x1100' }].map((s, i) => (
                  <div key={i} className="rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 text-xs font-mono">
                    <p className="font-bold text-blue-600 dark:text-blue-400">{s.t}</p>
                    <p className="text-[10px] text-slate-400">{s.addr}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-500">
              <span className="flex-1 border-t-2 border-dashed border-emerald-400" />
              <span className="font-bold">clone()으로 독립 복사본 생성!</span>
              <span className="flex-1 border-t-2 border-dashed border-emerald-400" />
            </div>
            {/* Copied */}
            <div>
              <p className="text-[11px] font-bold text-emerald-400 uppercase mb-2">복사 Scene b (clone() 깊은 복사)</p>
              <div className="flex gap-2 flex-wrap">
                {[{ t: 'Circle', addr: '0x2000' }, { t: 'Triangle', addr: '0x2100' }].map((s, i) => (
                  <div key={i} className="rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 text-xs font-mono">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{s.t}</p>
                    <p className="text-[10px] text-emerald-500">{s.addr} ← 새 주소!</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              → 실제 타입(Circle, Triangle) 그대로 복사. 독립적으로 소멸 가능. ✅
            </p>
          </div>
        )}
      </div>

      {/* clone() key points */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3">💡 clone() 패턴의 핵심</p>
        <div className="space-y-2">
          {[
            { icon: '🎯', text: 'Shape* clone() const = 0; — 순수 가상으로 선언, 파생 클래스마다 "return new [자기타입](*this);" 로 구현' },
            { icon: '🔒', text: '다형적 컨테이너(vector<Shape*>)에서 복사 시 포인터가 아닌 clone()으로 실제 타입을 보존하며 복사' },
            { icon: '🗑️', text: '소멸자 체인 필수: Shape에 virtual ~Shape() 선언 → delete p 시 Circle::~Circle() 등이 정확히 호출됨' },
          ].map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-base flex-shrink-0 mt-0.5">{p.icon}</span>
              <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{p.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 3 — Scene 컨테이너 완전 구현 — 기출 빈칸 채우기
══════════════════════════════════════════════════════ */
type BlankId = 'A' | 'B' | 'C' | 'D' | 'E';

const BLANKS: Record<BlankId, { answer: string; hint: string; line: string }> = {
  A: {
    answer: 'virtual double area() const = 0',
    hint: '순수 가상 함수 — 면적 계산',
    line: 'virtual double area() const = 0;  // (A)',
  },
  B: {
    answer: 'virtual Shape* clone() const = 0',
    hint: '순수 가상 clone — 다형 복사용',
    line: 'virtual Shape* clone() const = 0; // (B)',
  },
  C: {
    answer: '3.14159 * r * r',
    hint: 'Circle의 넓이 공식',
    line: 'double area() const { return (C); }',
  },
  D: {
    answer: 'new Circle(*this)',
    hint: 'Circle 자기 자신의 복사본 반환',
    line: 'Shape* clone() const { return (D); }',
  },
  E: {
    answer: 's.clone()',
    hint: 'clone()으로 다형 복사본 추가',
    line: 'void add(const Shape& s) { v.push_back( (E) ); }',
  },
};

function ExamFillSection() {
  const [revealed, setRevealed] = useState<Set<BlankId>>(new Set());

  const toggle = (id: BlankId) => setRevealed(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const revealAll = () => setRevealed(new Set(Object.keys(BLANKS) as BlankId[]));
  const hideAll   = () => setRevealed(new Set());

  return (
    <div className="space-y-5">
      {/* Code with blanks */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">빈칸 채우기 — Scene 패턴</p>
          <div className="flex gap-2">
            <button onClick={revealAll} className="rounded px-2.5 py-1 text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-500 transition">
              전체 보기
            </button>
            <button onClick={hideAll} className="rounded px-2.5 py-1 text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition">
              전체 숨기기
            </button>
          </div>
        </div>
        <div className="bg-slate-950 p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-[2]">
          <div><span className="text-slate-400">struct</span> <span className="text-blue-300 font-bold">Shape</span> <span className="text-slate-400">{'{'}</span></div>
          <div>&nbsp;&nbsp;<span className="text-slate-400">virtual</span> ~Shape() {'{}'}</div>
          {(['A', 'B'] as BlankId[]).map(id => (
            <div key={id} className="flex items-center gap-2">
              <span>&nbsp;&nbsp;</span>
              {revealed.has(id)
                ? <code className="text-emerald-300 font-bold">{BLANKS[id].answer};</code>
                : (
                  <button onClick={() => toggle(id)}
                    className="rounded border border-dashed border-amber-500/60 bg-amber-500/10 px-2 py-0.5 text-amber-400 font-bold hover:bg-amber-500/20 transition text-xs">
                    빈칸 ({id}) — 클릭해서 보기
                  </button>
                )}
              <span className="text-slate-600">{`// (${id})`}</span>
            </div>
          ))}
          <div><span className="text-slate-400">{'};'}</span></div>
          <div className="mt-2"><span className="text-slate-400">struct</span> <span className="text-blue-300 font-bold">Circle</span> <span className="text-slate-400">: public Shape {'{'}</span></div>
          <div>&nbsp;&nbsp;<span className="text-slate-400">double r;</span></div>
          <div>&nbsp;&nbsp;<span className="text-slate-400">Circle(double rr) : r(rr) {'{}'}</span></div>
          {(['C', 'D'] as BlankId[]).map(id => (
            <div key={id} className="flex items-center gap-2">
              <span>&nbsp;&nbsp;</span>
              {id === 'C' ? (
                <span>
                  <span className="text-slate-400">double area() const {'{ return '}</span>
                  {revealed.has(id)
                    ? <code className="text-emerald-300 font-bold">{BLANKS[id].answer}</code>
                    : <button onClick={() => toggle(id)} className="rounded border border-dashed border-amber-500/60 bg-amber-500/10 px-2 py-0.5 text-amber-400 font-bold hover:bg-amber-500/20 transition text-xs">빈칸 ({id})</button>}
                  <span className="text-slate-400">; {'}'}</span>
                </span>
              ) : (
                <span>
                  <span className="text-slate-400">Shape* clone() const {'{ return '}</span>
                  {revealed.has(id)
                    ? <code className="text-emerald-300 font-bold">{BLANKS[id].answer}</code>
                    : <button onClick={() => toggle(id)} className="rounded border border-dashed border-amber-500/60 bg-amber-500/10 px-2 py-0.5 text-amber-400 font-bold hover:bg-amber-500/20 transition text-xs">빈칸 ({id})</button>}
                  <span className="text-slate-400">; {'}'}</span>
                </span>
              )}
              <span className="text-slate-600">{`// (${id})`}</span>
            </div>
          ))}
          <div><span className="text-slate-400">{'};'}</span></div>
          <div className="mt-2"><span className="text-slate-400">struct</span> <span className="text-blue-300 font-bold">Scene</span> <span className="text-slate-400">{'{'}</span></div>
          <div>&nbsp;&nbsp;<span className="text-slate-400">vector&lt;Shape*&gt; v;</span></div>
          <div className="flex items-center gap-2">
            <span>&nbsp;&nbsp;<span className="text-slate-400">void add(const Shape&amp; s) {'{ v.push_back( '}</span></span>
            {revealed.has('E')
              ? <code className="text-emerald-300 font-bold">{BLANKS['E'].answer}</code>
              : <button onClick={() => toggle('E')} className="rounded border border-dashed border-amber-500/60 bg-amber-500/10 px-2 py-0.5 text-amber-400 font-bold hover:bg-amber-500/20 transition text-xs">빈칸 (E)</button>}
            <span className="text-slate-400">{' ); }'}</span>
            <span className="text-slate-600">{'// (E)'}</span>
          </div>
          <div>&nbsp;&nbsp;<span className="text-slate-400">~Scene() {'{ for (auto* p : v) delete p; }'}</span></div>
          <div><span className="text-slate-400">{'};'}</span></div>
        </div>
      </div>

      {/* Answer hints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.entries(BLANKS) as [BlankId, typeof BLANKS[BlankId]][]).map(([id, b]) => (
          <div key={id}
            onClick={() => toggle(id)}
            className={`rounded-xl border-2 cursor-pointer p-3 transition ${
              revealed.has(id)
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 bg-white dark:bg-slate-900'
            }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black flex-shrink-0 ${
                revealed.has(id) ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>{id}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{b.hint}</span>
            </div>
            {revealed.has(id) ? (
              <code className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300 break-all">{b.answer}</code>
            ) : (
              <p className="text-xs text-slate-400">클릭해서 정답 보기</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export default function PolymorphismContent({ topic }: Props) {
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

      <section id="abstract-sec-concepts">
        <SH icon="🎯" title="순수 가상 함수와 추상 클래스 — 인터랙티브 체크" />
        <ConceptBox
          what="순수 가상 함수(= 0)를 하나라도 가진 클래스를 추상 클래스라고 합니다. 직접 인스턴스화할 수 없으며, 파생 클래스가 특정 인터페이스를 구현하도록 강제합니다."
          rules={[
            '순수 가상 함수: virtual void area() const = 0; — 구현 없이 선언만 (본문 없음)',
            '추상 클래스: 직접 인스턴스화 불가 → Shape s; 는 컴파일 에러',
            '파생 클래스 인스턴스화 조건: 모든 순수 가상 함수를 override해야 인스턴스화 가능',
          ]}
        />
        <AbstractClassSection />
      </section>

      <section id="abstract-sec-clone">
        <SH icon="📋" title="clone() 패턴 — 다형적 깊은 복사" />
        <ConceptBox
          what="clone() 패턴은 기반 클래스 포인터/참조만으로 실제 파생 클래스 타입의 복사본을 만드는 설계 패턴입니다."
          rules={[
            'add(const Shape& s): s는 Shape 참조 → s.clone() 호출 → 실제 타입의 clone()이 동적 디스패치',
            '각 파생 클래스: Shape* clone() const { return new Circle(*this); } — 자신의 복사본 반환',
            'void add에서 &s를 직접 저장하면 안 되는 이유: 임시 인수 객체가 함수 종료 후 소멸 → dangling pointer',
          ]}
          caution="객체 슬라이싱(object slicing): Shape s2 = *circle_ptr; 처럼 값 대입하면 Circle 고유 정보가 잘려나감. 다형성은 항상 포인터/참조로!"
        />
        <ClonePatternSection />
      </section>

      <section id="abstract-sec-exam">
        <SH icon="📝" title="빈칸 채우기 — Scene 패턴" />
        <ConceptBox
          what="Scene 클래스는 vector&lt;Shape*&gt;로 다형성 컨테이너를 구현합니다. 각 빈칸은 다형성과 clone() 패턴의 핵심을 묻습니다."
          rules={[
            '(A),(B): clone() — 파생 클래스가 자신의 타입으로 new Circle(*this) / new Rect(*this) 반환',
            '(C): 소멸자에서 delete v[i] — 가상 소멸자 덕분에 파생 소멸자도 호출',
            '(D): s.clone() — 다형적 복사 / (E): v[i]->area() — 다형적 넓이 계산',
          ]}
        />
        <ExamFillSection />
      </section>
    </div>
  );
}
