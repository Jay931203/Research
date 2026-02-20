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
   SECTION 1 — 생성/소멸 순서 스텝 플레이어
══════════════════════════════════════════════════════ */
const STEPS = [
  { line: 1, label: 'A a — A 생성자 호출',   call: '[++] A()',  callColor: 'text-emerald-400' },
  { line: 3, label: 'B b — B 생성자 호출',   call: '[++] B()',  callColor: 'text-emerald-400' },
  { line: 4, label: '내부 스코프 종료 → B 소멸', call: '[--] ~B()', callColor: 'text-red-400'    },
  { line: 5, label: '외부 스코프 종료 → A 소멸', call: '[--] ~A()', callColor: 'text-red-400'    },
];

const CODE_LINES = [
  { n: 1, text: '{',          indent: 0 },
  { n: 2, text: '  A a;',     indent: 1 },
  { n: 3, text: '  {',        indent: 1 },
  { n: 4, text: '    B b;',   indent: 2 },
  { n: 5, text: '  }',        indent: 1 },
  { n: 6, text: '}',          indent: 0 },
];

function OrderStepPlayer() {
  const [step, setStep] = useState(0);
  const cur = STEPS[step];
  const completed = STEPS.slice(0, step + 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Code */}
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 border-b border-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            <span className="ml-2 text-[11px] font-mono text-slate-400">example.cpp</span>
          </div>
          <div className="bg-slate-950 p-4 space-y-0.5">
            {CODE_LINES.map(l => {
              const isActive = cur.line === l.n;
              return (
                <div
                  key={l.n}
                  className={`flex items-center gap-2 rounded px-2 py-1 transition-colors ${
                    isActive ? 'bg-blue-600/30 ring-1 ring-blue-500' : ''
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-600 w-4 text-right flex-shrink-0">{l.n}</span>
                  <code className={`text-sm font-mono ${isActive ? 'text-blue-300 font-bold' : 'text-slate-300'}`}>
                    {l.text}
                  </code>
                  {isActive && (
                    <span className="ml-auto text-[10px] text-blue-400 font-semibold">← 현재</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Call log */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col">
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">호출 로그</p>
          </div>
          <div className="flex-1 p-4 space-y-2">
            {STEPS.map((s, i) => {
              const done = i <= step;
              const active = i === step;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    active  ? 'bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-300 dark:ring-blue-700' :
                    done    ? 'opacity-70' : 'opacity-25'
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black flex-shrink-0 ${
                    done ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>{i + 1}</span>
                  <code className={`text-xs font-mono font-bold flex-shrink-0 ${s.callColor}`}>{s.call}</code>
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              생성 순서: 부모→자식 &nbsp;|&nbsp; 소멸 순서: 자식→부모 (역순)
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ◀ 이전
        </button>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 w-20 text-center">
          {step + 1} / {STEPS.length}
        </span>
        <button
          onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          다음 ▶
        </button>
        <button
          onClick={() => setStep(0)}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline transition"
        >
          처음으로
        </button>
      </div>

      {/* Current step explanation */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 px-4 py-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <span className="font-bold">Step {step + 1}:</span> {completed[completed.length - 1]?.label}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 2 — 얕은/깊은 복사 메모리 다이어그램
══════════════════════════════════════════════════════ */
function MemoryDiagram() {
  const [mode, setMode] = useState<'shallow' | 'deep'>('shallow');
  const [showCrash, setShowCrash] = useState(false);

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('shallow'); setShowCrash(false); }}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition border-2 ${
            mode === 'shallow'
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-300'
          }`}
        >
          ❌ 얕은 복사 (Shallow Copy)
        </button>
        <button
          onClick={() => { setMode('deep'); setShowCrash(false); }}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition border-2 ${
            mode === 'deep'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
          }`}
        >
          ✅ 깊은 복사 (Deep Copy)
        </button>
      </div>

      {mode === 'shallow' && (
        <div className="space-y-4">
          {/* Code */}
          <pre className="rounded-xl bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`class Bad {
    char* name_;    // 포인터 멤버
public:
    Bad(const char* n) {
        name_ = new char[strlen(n)+1]; strcpy(name_, n);
    }
    ~Bad() { delete[] name_; }
    // 복사 생성자 없음 → 컴파일러가 얕은 복사 자동 생성!
};

Bad a("hello");
Bad b = a;       // 얕은 복사 → b.name_ == a.name_ (같은 주소!)`}</pre>

          {/* Memory diagram */}
          <div className="rounded-xl border-2 border-red-200 dark:border-red-800/50 bg-white dark:bg-slate-900 p-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">메모리 상태</p>
            <div className="flex gap-6 items-start">
              {/* Stack */}
              <div className="flex-1 space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase">STACK</p>
                {[
                  { name: 'a', ptr: '0x1000' },
                  { name: 'b  (= a, 얕은 복사)', ptr: '0x1000' },
                ].map((obj, i) => (
                  <div key={i} className={`rounded-lg border-2 p-3 ${
                    i === 0 ? 'border-blue-300 dark:border-blue-700' : 'border-purple-300 dark:border-purple-700'
                  }`}>
                    <p className={`text-xs font-bold mb-2 ${i === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                      Bad {obj.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-slate-600 dark:text-slate-400 flex-shrink-0">name_</code>
                      <div className="flex-1 border-t-2 border-dashed border-red-400 relative">
                        <span className="absolute -right-1 -top-2.5 text-red-400 text-sm">→</span>
                      </div>
                      <code className="text-xs font-mono text-red-600 dark:text-red-400 font-bold flex-shrink-0">{obj.ptr}</code>
                    </div>
                  </div>
                ))}
              </div>

              {/* Heap */}
              <div className="w-36">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-3">HEAP</p>
                <div className="rounded-lg border-2 border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/30 p-3 text-center">
                  <code className="text-xs font-mono text-slate-700 dark:text-slate-300">&quot;hello\0&quot;</code>
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">0x1000</p>
                  <div className="mt-2 text-[10px] text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-900/40 rounded px-2 py-1">
                    ⚠ a, b가 공유!
                  </div>
                </div>
              </div>
            </div>

            {/* Double free warning */}
            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 p-3">
              <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-2">소멸 시뮬레이션</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">1.</span>
                  <span className="text-slate-600 dark:text-slate-300">~b() 호출 → <code className="font-mono">delete[] name_</code> → 0x1000 해제 ✅</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">2.</span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">~a() 호출 → <code className="font-mono">delete[] name_</code> → 0x1000 재해제 ❌ double-free!</span>
                </div>
                <div className="mt-2 text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 rounded px-3 py-1.5">
                  💥 Undefined Behavior → 프로그램 크래시
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'deep' && (
        <div className="space-y-4">
          <pre className="rounded-xl bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`class Good {
    char* name_;
public:
    Good(const char* n) {
        name_ = new char[strlen(n)+1]; strcpy(name_, n);
    }
    ~Good() { delete[] name_; }

    // 직접 정의한 복사 생성자 (깊은 복사)
    Good(const Good& other) {
        name_ = new char[strlen(other.name_)+1]; // 새 메모리 할당
        strcpy(name_, other.name_);              // 내용만 복사
    }
};

Good a("hello");
Good b = a;   // 깊은 복사 → b.name_ != a.name_ (독립된 주소!)`}</pre>

          {/* Memory diagram */}
          <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-slate-900 p-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">메모리 상태</p>
            <div className="flex gap-6 items-start">
              {/* Stack */}
              <div className="flex-1 space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase">STACK</p>
                {[
                  { name: 'a', ptr: '0x1000', color: 'border-blue-300 dark:border-blue-700', tc: 'text-blue-600 dark:text-blue-400' },
                  { name: 'b  (깊은 복사)',   ptr: '0x2000', color: 'border-emerald-300 dark:border-emerald-700', tc: 'text-emerald-600 dark:text-emerald-400' },
                ].map((obj, i) => (
                  <div key={i} className={`rounded-lg border-2 p-3 ${obj.color}`}>
                    <p className={`text-xs font-bold mb-2 ${obj.tc}`}>Good {obj.name}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-slate-600 dark:text-slate-400 flex-shrink-0">name_</code>
                      <div className="flex-1 border-t-2 border-dashed border-emerald-500 relative">
                        <span className="absolute -right-1 -top-2.5 text-emerald-500 text-sm">→</span>
                      </div>
                      <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">{obj.ptr}</code>
                    </div>
                  </div>
                ))}
              </div>

              {/* Heap */}
              <div className="w-36 space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase">HEAP</p>
                {[
                  { label: '"hello\\0"', addr: '0x1000', who: 'a 소유', c: 'border-blue-400' },
                  { label: '"hello\\0"', addr: '0x2000', who: 'b 소유 (복사본)', c: 'border-emerald-400' },
                ].map((h, i) => (
                  <div key={i} className={`rounded-lg border-2 ${h.c} bg-white dark:bg-slate-800 p-3 text-center`}>
                    <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{h.label}</code>
                    <p className="text-[10px] text-slate-500 mt-1">{h.addr}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">{h.who}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 p-3">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">소멸 시뮬레이션</p>
              <div className="space-y-1 text-xs">
                <div className="text-slate-600 dark:text-slate-300">1. ~b() → delete[] 0x2000 ✅ 독립된 메모리 해제</div>
                <div className="text-slate-600 dark:text-slate-300">2. ~a() → delete[] 0x1000 ✅ 독립된 메모리 해제</div>
                <div className="mt-1 font-bold text-emerald-700 dark:text-emerald-300">✅ 안전! double-free 없음</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 3 — Rule of Three 인터랙티브 체크리스트
══════════════════════════════════════════════════════ */
function RuleOfThree() {
  const [hasDtor,   setHasDtor]   = useState(true);
  const [hasCopyCtor, setHasCopyCtor] = useState(true);
  const [hasCopyAssign, setHasCopyAssign] = useState(true);

  const allDefined = hasDtor && hasCopyCtor && hasCopyAssign;

  const issues: string[] = [];
  if (!hasDtor)       issues.push('소멸자가 없으면: 포인터 멤버가 가리키는 동적 메모리가 해제되지 않아 메모리 누수(memory leak) 발생!');
  if (!hasCopyCtor)   issues.push('복사 생성자가 없으면: 컴파일러가 얕은 복사를 수행 → Bad b = a; 후 double-free 위험!');
  if (!hasCopyAssign) issues.push('복사 대입 연산자가 없으면: 컴파일러가 얕은 복사를 수행 → b = a; 후 기존 b.name_ 메모리 누수 + double-free 위험!');

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
          포인터 멤버가 있는 클래스에서 각 규칙을 정의했나요?
        </p>
        <div className="space-y-3">
          {[
            { label: '① 소멸자 (Destructor)', sub: '~Student() { delete[] name_; }', val: hasDtor, set: setHasDtor },
            { label: '② 복사 생성자 (Copy Constructor)', sub: 'Student(const Student& other)', val: hasCopyCtor, set: setHasCopyCtor },
            { label: '③ 복사 대입 연산자 (Copy Assignment)', sub: 'Student& operator=(const Student& other)', val: hasCopyAssign, set: setHasCopyAssign },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => item.set(v => !v)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition border-2 ${
                item.val
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/25'
                  : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.val ? '✅' : '❌'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${item.val ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                  {item.label}
                </p>
                <code className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate block">{item.sub}</code>
              </div>
              <span className={`text-xs font-semibold flex-shrink-0 ${item.val ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                {item.val ? '정의됨' : '미정의'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className={`rounded-xl border-2 p-4 transition ${
        allDefined
          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/25'
          : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20'
      }`}>
        {allDefined ? (
          <div>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-1">✅ Rule of Three 완전 구현!</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              세 가지를 모두 정의했습니다. 포인터 멤버의 깊은 복사가 보장되어 double-free와 메모리 누수 위험이 없습니다.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">⚠️ Rule of Three 위반!</p>
            <ul className="space-y-1.5">
              {issues.map((iss, i) => (
                <li key={i} className="text-xs text-red-600 dark:text-red-400 flex gap-2">
                  <span className="flex-shrink-0 mt-0.5">•</span>
                  <span>{iss}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Full implementation */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Rule of Three — 완전 구현 예시</p>
        </div>
        <pre className="bg-slate-950 text-xs p-4 text-slate-200 overflow-x-auto leading-relaxed">{`class Student {
    int   id_;
    char* name_;    // 포인터 멤버 → Rule of Three 필요!
public:
    Student(int id, const char* n) : id_(id) {
        name_ = new char[strlen(n)+1];
        strcpy(name_, n);
    }

    // ① 소멸자 — 자원 해제
    ~Student() { delete[] name_; }

    // ② 복사 생성자 — 깊은 복사
    Student(const Student& o) : id_(o.id_) {
        name_ = new char[strlen(o.name_)+1];
        strcpy(name_, o.name_);
    }

    // ③ 복사 대입 연산자 — 깊은 복사
    Student& operator=(const Student& o) {
        if (this == &o) return *this;        // 자기 대입 검사
        delete[] name_;                       // 기존 메모리 해제
        name_ = new char[strlen(o.name_)+1]; // 새 메모리 할당
        strcpy(name_, o.name_);
        id_ = o.id_;
        return *this;
    }
};`}</pre>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 4 — 복사 대입 연산자 단계별
══════════════════════════════════════════════════════ */
const ASSIGN_STEPS = [
  {
    n: 1,
    highlight: [3],
    label: '① 자기 대입 검사',
    why: 's = s; 처럼 자기 자신에게 대입 시, 다음 단계(delete)가 자신의 데이터를 먼저 파괴해버립니다. 반드시 먼저 검사해야 합니다.',
    warn: 'if (this == &other) return *this;',
  },
  {
    n: 2,
    highlight: [4],
    label: '② 기존 메모리 해제',
    why: '새 데이터를 할당하기 전에 기존 name_이 가리키던 메모리를 먼저 해제해야 합니다. 안 하면 메모리 누수(memory leak)!',
    warn: 'delete[] name_;  // 먼저 해제!',
  },
  {
    n: 3,
    highlight: [5, 6],
    label: '③ 새 메모리 할당 및 복사',
    why: '해제 후 새 메모리를 할당하고 내용을 복사합니다. 이제 독립된 메모리를 가지게 됩니다.',
    warn: 'name_ = new char[...]; strcpy(name_, ...);',
  },
  {
    n: 4,
    highlight: [7],
    label: '④ 나머지 멤버 복사',
    why: '포인터가 아닌 일반 멤버(int, double 등)는 단순 대입으로 복사합니다.',
    warn: 'id_ = other.id_;',
  },
  {
    n: 5,
    highlight: [8],
    label: '⑤ *this 반환',
    why: 'a = b = c; 처럼 연쇄 대입이 가능하려면 자기 자신의 참조를 반환해야 합니다. 반환 타입이 T& 인 이유입니다.',
    warn: 'return *this;',
  },
];

const ASSIGN_CODE_LINES = [
  { n: 1, text: 'Student& operator=(const Student& other) {' },
  { n: 2, text: '' },
  { n: 3, text: '    if (this == &other) return *this;   // ①' },
  { n: 4, text: '    delete[] name_;                      // ②' },
  { n: 5, text: '    name_ = new char[strlen(other.name_)+1]; // ③' },
  { n: 6, text: '    strcpy(name_, other.name_);           // ③' },
  { n: 7, text: '    id_ = other.id_;                     // ④' },
  { n: 8, text: '    return *this;                        // ⑤' },
  { n: 9, text: '}' },
];

function AssignSection() {
  const [step, setStep] = useState(0);
  const cur = ASSIGN_STEPS[step];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        단계를 클릭하거나 버튼으로 이동하며 각 단계의 이유를 확인하세요.
      </p>

      {/* Step tabs */}
      <div className="flex flex-wrap gap-2">
        {ASSIGN_STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              step === i
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {s.n}단계
          </button>
        ))}
      </div>

      {/* Code with highlighting */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 border-b border-slate-700">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-2 text-[11px] font-mono text-slate-400">operator=</span>
        </div>
        <div className="bg-slate-950 p-4 space-y-0.5">
          {ASSIGN_CODE_LINES.map(l => {
            const isHighlighted = cur.highlight.includes(l.n);
            return (
              <div
                key={l.n}
                className={`flex items-center gap-2 rounded px-2 py-0.5 transition-colors ${
                  isHighlighted ? 'bg-blue-600/25 ring-1 ring-blue-500/50' : ''
                }`}
              >
                <span className="text-[10px] font-mono text-slate-600 w-4 text-right flex-shrink-0">{l.n}</span>
                <code className={`text-xs font-mono ${
                  isHighlighted ? 'text-blue-200 font-bold' : 'text-slate-400'
                }`}>
                  {l.text || <span className="opacity-0">_</span>}
                </code>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current step detail */}
      <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/30 p-4">
        <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">{cur.label}</p>
        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed mb-3">{cur.why}</p>
        <code className="block rounded-lg bg-slate-950 text-xs font-mono p-3 text-emerald-300 overflow-x-auto">
          {cur.warn}
        </code>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-lg px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ◀ 이전 단계
        </button>
        <span className="text-sm font-semibold text-slate-500 w-20 text-center">{step + 1} / {ASSIGN_STEPS.length}</span>
        <button
          onClick={() => setStep(s => Math.min(ASSIGN_STEPS.length - 1, s + 1))}
          disabled={step === ASSIGN_STEPS.length - 1}
          className="rounded-lg px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          다음 단계 ▶
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export default function ConstructorsContent({ topic }: Props) {
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

      <section id="constructors-sec-order">
        <SH icon="▶️" title="생성자·소멸자 호출 순서 — 스텝 플레이어" />
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          객체는 선언 순서로 생성되고, <strong>반대 순서(LIFO)</strong>로 소멸됩니다.
          이 역순 소멸은 C++ 자원 해제 보장의 핵심입니다 — 나중에 생성된 객체가 먼저 생성된 객체에 의존할 수 있으므로, 의존하는 쪽이 먼저 정리되어야 합니다.
          상속 시에는 <strong>부모 생성자 → 자식 생성자</strong> 순으로 생성되고,
          소멸은 역순으로 <strong>자식 소멸자 → 부모 소멸자</strong> 순서입니다.
        </p>
        <OrderStepPlayer />
      </section>

      <section id="constructors-sec-copy">
        <SH icon="🧠" title="얕은 복사 vs 깊은 복사 — 메모리 다이어그램" />
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          복사 생성자를 직접 정의하지 않으면 컴파일러가 멤버를 그대로 복사합니다.
          이 컴파일러 자동 생성 복사를 <strong>얕은 복사(shallow copy)</strong>라고 하며, 포인터나 동적 자원 멤버가 없는 클래스라면 완전히 안전하고 충분합니다.{' '}
          그러나 <strong>포인터 멤버는 주소값이 복사</strong>되어 두 객체가 같은 힙 메모리를 가리키게 되며,
          소멸 시 이중 해제(double-free) 문제가 발생합니다.
          포인터 멤버가 있는 클래스는 반드시 복사 생성자를 직접 작성하세요.
        </p>
        <MemoryDiagram />
      </section>

      <section id="constructors-sec-r3">
        <SH icon="📐" title="Rule of Three — 인터랙티브 체크리스트" />
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          <strong>소멸자 · 복사 생성자 · 복사 대입 연산자</strong> 중 하나를 직접 정의해야 한다면,
          나머지 둘도 반드시 함께 정의해야 합니다.
          셋은 모두 동적 메모리 관리와 직결되어 있기 때문입니다.
          한편 C++11에서 도입된 <strong>Rule of Zero</strong>는 그 역방향의 지혜입니다: 포인터 멤버 대신{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">unique_ptr</code>이나{' '}
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">shared_ptr</code> 같은 스마트 포인터를 사용하면, 자원 해제를 스마트 포인터가 담당하므로 소멸자·복사 생성자·대입 연산자를 직접 정의할 필요가 없어집니다.
          아래 체크박스를 클릭해 각 항목을 생략했을 때 어떤 문제가 생기는지 확인하세요.
        </p>
        <RuleOfThree />
      </section>

      <section id="constructors-sec-assign">
        <SH icon="✍️" title="복사 대입 연산자 — 단계별 분석" />
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">operator=</code>는
          이미 생성된 객체에 대입(<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">b = a</code>)할 때 호출됩니다.
          복사 생성자와 달리 기존에 할당된 자원을 먼저 해제해야 하며,
          반드시 <strong>자기 대입 검사</strong>를 첫 단계로 수행해야 합니다.
          각 단계를 클릭하며 이유를 확인하세요.
        </p>
        <AssignSection />
      </section>
    </div>
  );
}
