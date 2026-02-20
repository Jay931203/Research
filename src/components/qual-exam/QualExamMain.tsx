'use client';

import { useMemo, useState } from 'react';
import { BookOpen, BrainCircuit, ClipboardList, GraduationCap, LayoutGrid, TrendingUp } from 'lucide-react';
import TopicStudyCard from './TopicStudyCard';
import ExamProblemCard from './ExamProblemCard';
import PracticeQuiz from './PracticeQuiz';
import { DSA_TOPICS, DSA_EXAM_PROBLEMS, DSA_PRACTICE_QUESTIONS } from '@/data/qual-exam/dsa-data';
import { PROG_TOPICS, PROG_EXAM_PROBLEMS, PROG_PRACTICE_QUESTIONS } from '@/data/qual-exam/prog-data';

type SubjectKey = 'dsa' | 'prog';
type SectionKey = 'overview' | 'study' | 'exam' | 'practice';

const SUBJECTS: { key: SubjectKey; label: string; labelEn: string; icon: React.ElementType; color: string; border: string; bg: string }[] = [
  {
    key: 'dsa',
    label: '자료구조 및 알고리즘',
    labelEn: 'Data Structures & Algorithms',
    icon: BrainCircuit,
    color: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500',
    bg: 'bg-blue-600',
  },
  {
    key: 'prog',
    label: '프로그래밍의 기초',
    labelEn: 'Fundamentals of Programming',
    icon: BookOpen,
    color: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500',
    bg: 'bg-violet-600',
  },
];

const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: '개요', icon: LayoutGrid },
  { key: 'study', label: '토픽 학습', icon: BookOpen },
  { key: 'exam', label: '기출문제', icon: ClipboardList },
  { key: 'practice', label: '연습 문제', icon: TrendingUp },
];

/* ── Stats Overview Card ── */
function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`rounded-xl border bg-white p-4 dark:bg-slate-900 ${color}`}>
      <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

/* ── Asymptotic Notation Quick Reference ── */
function AsymptoticRef() {
  const rows = [
    { notation: 'O(f(n))', name: 'Big-O', meaning: '점근적 상한 (Asymptotic Upper Bound)', condition: 'A ≤ c·f(n) for n ≥ n₀' },
    { notation: 'Ω(f(n))', name: 'Big-Omega', meaning: '점근적 하한 (Asymptotic Lower Bound)', condition: 'A ≥ c·f(n) for n ≥ n₀' },
    { notation: 'Θ(f(n))', name: 'Big-Theta', meaning: '점근적 정확한 한계 (Tight Bound)', condition: 'c₁·f(n) ≤ A ≤ c₂·f(n)' },
    { notation: 'o(f(n))', name: 'Little-o', meaning: '엄격한 상한 (Strict Upper)', condition: 'lim(A/f(n)) = 0' },
    { notation: 'ω(f(n))', name: 'Little-omega', meaning: '엄격한 하한 (Strict Lower)', condition: 'lim(f(n)/A) = 0' },
  ];
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="border-b border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200">표기법</th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200">이름</th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200">의미</th>
            <th className="border-b border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200">조건</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="border-b border-slate-100 dark:border-slate-800 px-3 py-2 font-mono font-bold text-blue-700 dark:text-blue-300">{r.notation}</td>
              <td className="border-b border-slate-100 dark:border-slate-800 px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">{r.name}</td>
              <td className="border-b border-slate-100 dark:border-slate-800 px-3 py-2 text-slate-600 dark:text-slate-400">{r.meaning}</td>
              <td className="border-b border-slate-100 dark:border-slate-800 px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-500">{r.condition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Complexity Cheat Sheet ── */
function ComplexitySheet() {
  const data = [
    { name: 'O(1)', label: '상수', color: 'bg-emerald-100 text-emerald-800', examples: 'array[i], hash map get' },
    { name: 'O(log n)', label: '로그', color: 'bg-teal-100 text-teal-800', examples: '이진 탐색, BST 탐색' },
    { name: 'O(n)', label: '선형', color: 'bg-blue-100 text-blue-800', examples: '선형 탐색, 연결 리스트 순회' },
    { name: 'O(n log n)', label: '선형로그', color: 'bg-indigo-100 text-indigo-800', examples: '합병 정렬, 힙 정렬, 퀵 정렬 평균' },
    { name: 'O(n²)', label: '이차', color: 'bg-amber-100 text-amber-800', examples: '버블/삽입/선택 정렬' },
    { name: 'O(2ⁿ)', label: '지수', color: 'bg-red-100 text-red-800', examples: '피보나치 재귀, 부분집합' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {data.map((d, i) => (
        <div key={i} className={`rounded-lg px-3 py-2.5 ${d.color}`}>
          <p className="font-mono text-sm font-bold">{d.name}</p>
          <p className="text-[11px] font-semibold">{d.label}</p>
          <p className="text-[10px] mt-0.5 opacity-80">{d.examples}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ── */
export default function QualExamMain() {
  const [subject, setSubject] = useState<SubjectKey>('dsa');
  const [section, setSection] = useState<SectionKey>('overview');
  const [examYearFilter, setExamYearFilter] = useState<string>('all');

  const sub = SUBJECTS.find(s => s.key === subject)!;
  const topics = subject === 'dsa' ? DSA_TOPICS : PROG_TOPICS;
  const examProblems = subject === 'dsa' ? DSA_EXAM_PROBLEMS : PROG_EXAM_PROBLEMS;
  const practiceQs = subject === 'dsa' ? DSA_PRACTICE_QUESTIONS : PROG_PRACTICE_QUESTIONS;

  const years = useMemo(() => ['all', ...Array.from(new Set(examProblems.map(p => p.year)))].sort(), [examProblems]);
  const filteredProblems = examYearFilter === 'all' ? examProblems : examProblems.filter(p => p.year === examYearFilter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-orange-100 p-2.5 dark:bg-orange-900/30">
          <GraduationCap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">논자시 준비</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">SNU ECE 박사 자격시험 · 2020~2025 기출 + 인터랙티브 학습</p>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="mb-4 flex gap-2">
        {SUBJECTS.map(s => (
          <button
            key={s.key}
            onClick={() => { setSubject(s.key); setSection('overview'); }}
            className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition ${
              subject === s.key
                ? `${s.border} ${s.bg} text-white`
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <s.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{s.key === 'dsa' ? '자알' : '프기'}</span>
          </button>
        ))}
      </div>

      {/* Section Nav */}
      <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
        {SECTIONS.map(sec => (
          <button
            key={sec.key}
            onClick={() => setSection(sec.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition sm:px-3 ${
              section === sec.key
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <sec.icon className="h-3.5 w-3.5" />
            {sec.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {section === 'overview' && (
        <div className="space-y-6">
          {/* Subject intro */}
          <div className={`rounded-xl border-l-4 ${sub.border} bg-white p-5 shadow-sm dark:bg-slate-900`}>
            <div className="flex items-center gap-2 mb-2">
              <sub.icon className={`h-5 w-5 ${sub.color}`} />
              <h2 className="font-bold text-slate-900 dark:text-slate-100">{sub.label}</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {subject === 'dsa'
                ? 'SNU ECE 논자시 자료구조·알고리즘 파트는 점근 분석(Big-O), 정렬(QuickSort, Heap), 트리(BST, 힙), 그래프(Dijkstra, BFS/DFS, Prim/Kruskal), 해시, 동적 프로그래밍 등을 다룹니다. 최근 시험에서는 알고리즘을 직접 trace하거나 복잡도를 분석하는 문제가 주로 출제됩니다.'
                : 'SNU ECE 논자시 프로그래밍의 기초 파트는 C++ 객체지향 프로그래밍(OOP)을 중심으로 클래스 설계, 가상 함수와 다형성, 소멸자와 메모리 관리(rule of three), 포인터, 템플릿, STL 컨테이너 구현(Stack/Queue) 등을 다룹니다. 코드 trace와 버그 수정 문제가 자주 출제됩니다.'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="총 기출문제" value={examProblems.length} color="border-blue-200" />
            <StatCard label="학습 토픽" value={topics.length} color="border-violet-200" />
            <StatCard label="연습 문제" value={practiceQs.length} color="border-emerald-200" />
            <StatCard label="시험 연도" value="2020~2025" color="border-amber-200" />
          </div>

          {/* Topic map */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">출제 토픽 맵</h3>
            <div className="flex flex-wrap gap-2">
              {topics.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSection('study')}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <span>{t.icon}</span>
                  {t.title}
                  <span className="text-[10px] text-amber-500">{'★'.repeat(t.examFrequency)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick reference for DSA */}
          {subject === 'dsa' && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">점근 표기법 빠른 참조</h3>
                <AsymptoticRef />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">시간 복잡도 치트시트</h3>
                <ComplexitySheet />
              </div>
            </div>
          )}

          {/* Quick CTA */}
          <div className="flex gap-3">
            <button
              onClick={() => setSection('exam')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${sub.bg} hover:opacity-90`}
            >
              <ClipboardList className="h-4 w-4" /> 기출문제 풀기
            </button>
            <button
              onClick={() => setSection('practice')}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <TrendingUp className="h-4 w-4" /> 연습 문제
            </button>
          </div>
        </div>
      )}

      {/* ── STUDY ── */}
      {section === 'study' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            토픽을 클릭하면 이론 설명, 복잡도 표, 알고리즘 시각화를 볼 수 있습니다.
          </p>
          {topics.map((t, i) => (
            <TopicStudyCard key={t.id} topic={t} defaultExpanded={i === 0} />
          ))}
        </div>
      )}

      {/* ── EXAM ── */}
      {section === 'exam' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              SNU ECE 논자시 기출문제 (2023~2025)
            </p>
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-500">연도:</label>
              <select
                value={examYearFilter}
                onChange={e => setExamYearFilter(e.target.value)}
                className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y === 'all' ? '전체' : y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {filteredProblems.map(p => (
              <ExamProblemCard key={p.id} problem={p} />
            ))}
          </div>
          {filteredProblems.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-400">해당 연도의 기출문제가 없습니다.</p>
          )}
        </div>
      )}

      {/* ── PRACTICE ── */}
      {section === 'practice' && (
        <PracticeQuiz
          questions={practiceQs}
          title={`${sub.label} 연습 문제`}
        />
      )}
    </div>
  );
}
