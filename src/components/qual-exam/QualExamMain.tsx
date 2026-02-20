'use client';
import { useMemo, useState } from 'react';
import { BookOpen, BrainCircuit, ChevronRight, ClipboardList, GraduationCap, Menu, X } from 'lucide-react';
import TopicDetail from './TopicDetail';
import ExamProblemCard from './ExamProblemCard';
import { DSA_TOPICS, DSA_EXAM_PROBLEMS, DSA_PRACTICE_QUESTIONS } from '@/data/qual-exam/dsa-data';
import { PROG_TOPICS, PROG_EXAM_PROBLEMS, PROG_PRACTICE_QUESTIONS } from '@/data/qual-exam/prog-data';
import type { StudyTopic } from './TopicStudyCard';
import type { ExamProblem } from './ExamProblemCard';
import type { QuizQuestion } from './PracticeList';

type Subject = 'dsa' | 'prog';
type View = { kind: 'topic'; topicId: string } | { kind: 'exam'; year: string; semester: '1' | '2' };

/* ─── Helpers ─── */
function semLabel(s: '1' | '2') { return s === '1' ? '1학기' : '2학기'; }

/* ─── Sidebar Topic Item ─── */
function TopicItem({
  topic, active, onClick,
  examCount,
}: {
  topic: StudyTopic; active: boolean; onClick: () => void; examCount: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition group
        ${active
          ? 'bg-blue-600 text-white'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
      <span className="text-base flex-shrink-0">{topic.icon}</span>
      <span className="flex-1 min-w-0 text-sm font-medium truncate">{topic.title}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* exam frequency dots */}
        <div className="flex gap-0.5">
          {Array.from({ length: topic.examFrequency }).map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white/60' : 'bg-amber-400'}`} />
          ))}
        </div>
        {examCount > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1
            ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
            기출{examCount}
          </span>
        )}
      </div>
    </button>
  );
}

/* ─── Exam Year Item ─── */
function ExamItem({
  year, semester, active, count, onClick,
}: {
  year: string; semester: '1' | '2'; active: boolean; count: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition
        ${active
          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
      <ClipboardList className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="flex-1 text-xs font-medium">{year}년 {semLabel(semester)}</span>
      <span className={`text-[10px] font-semibold ${active ? 'text-white/70 dark:text-slate-600' : 'text-slate-400'}`}>
        {count}문제
      </span>
      <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50" />
    </button>
  );
}

/* ─── Exam Year Panel ─── */
function ExamYearPanel({ problems }: { problems: ExamProblem[] }) {
  if (problems.length === 0) {
    return <p className="text-center py-16 text-sm text-slate-400">이 시험에 해당하는 문제가 없습니다.</p>;
  }
  const [year, semester] = [problems[0].year, problems[0].semester];
  return (
    <div className="max-w-3xl px-6 py-6 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-xl bg-slate-900 dark:bg-slate-100 px-3 py-1.5">
          <p className="text-sm font-black text-white dark:text-slate-900">{year}년 {semLabel(semester)}</p>
        </div>
        <p className="text-sm text-slate-500">SNU ECE 논자시 기출문제 · {problems.length}문제</p>
      </div>
      {problems.map(p => <ExamProblemCard key={p.id} problem={p} defaultExpanded={false} />)}
    </div>
  );
}

/* ─── Main Component ─── */
export default function QualExamMain() {
  const [subject, setSubject] = useState<Subject>('dsa');
  const [view, setView] = useState<View>({ kind: 'topic', topicId: 'asymptotic' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const topics = subject === 'dsa' ? DSA_TOPICS : PROG_TOPICS;
  const examProblems = subject === 'dsa' ? DSA_EXAM_PROBLEMS : PROG_EXAM_PROBLEMS;
  const practiceQs = subject === 'dsa' ? DSA_PRACTICE_QUESTIONS : PROG_PRACTICE_QUESTIONS;

  // Group exams by year+semester
  const examGroups = useMemo(() => {
    const map = new Map<string, ExamProblem[]>();
    for (const p of examProblems) {
      const key = `${p.year}-${p.semester}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a)) // newest first
      .map(([key, probs]) => ({ key, year: probs[0].year, semester: probs[0].semester, probs }));
  }, [examProblems]);

  // Get exam count per topic
  const examCountByTopic = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const topic of topics) {
      const relatedIds: string[] = (topic as { relatedExamIds?: string[] }).relatedExamIds ?? [];
      counts[topic.id] = relatedIds.length;
    }
    return counts;
  }, [topics]);

  // Switch subject
  const switchSubject = (s: Subject) => {
    setSubject(s);
    const defaultTopic = (s === 'dsa' ? DSA_TOPICS : PROG_TOPICS)[0];
    setView({ kind: 'topic', topicId: defaultTopic.id });
    setSidebarOpen(false);
  };

  // Render main panel
  const mainContent = useMemo(() => {
    if (view.kind === 'topic') {
      const topic = topics.find(t => t.id === view.topicId);
      if (!topic) return null;
      const relatedIds: string[] = (topic as { relatedExamIds?: string[] }).relatedExamIds ?? [];
      const relatedExams = examProblems.filter(p => relatedIds.includes(p.id));
      const topicPractice = practiceQs.filter(q => q.topic === topic.title);
      return (
        <TopicDetail
          topic={topic}
          relatedExams={relatedExams}
          practiceQuestions={topicPractice as QuizQuestion[]}
        />
      );
    }
    if (view.kind === 'exam') {
      const probs = examProblems.filter(
        p => p.year === view.year && p.semester === view.semester
      );
      return <ExamYearPanel problems={probs} />;
    }
    return null;
  }, [view, topics, examProblems, practiceQs]);

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Subject Toggle */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => switchSubject('dsa')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition
              ${subject === 'dsa' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <BrainCircuit className="h-3.5 w-3.5" /> 자알
          </button>
          <button
            onClick={() => switchSubject('prog')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition border-l border-slate-200 dark:border-slate-700
              ${subject === 'prog' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <BookOpen className="h-3.5 w-3.5" /> 프기
          </button>
        </div>
      </div>

      {/* Topics */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">토픽 (공부 순서)</p>
        {[...topics]
          .sort((a, b) => {
            const ao = (a as { studyOrder?: number }).studyOrder ?? 99;
            const bo = (b as { studyOrder?: number }).studyOrder ?? 99;
            return ao - bo;
          })
          .map(t => (
            <TopicItem
              key={t.id}
              topic={t}
              active={view.kind === 'topic' && view.topicId === t.id}
              onClick={() => { setView({ kind: 'topic', topicId: t.id }); setSidebarOpen(false); }}
              examCount={examCountByTopic[t.id] ?? 0}
            />
          ))}

        {/* Exam Groups */}
        <div className="pt-3">
          <p className="px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">기출문제 (연도별)</p>
          {examGroups.map(g => (
            <ExamItem
              key={g.key}
              year={g.year}
              semester={g.semester}
              active={view.kind === 'exam' && view.year === g.year && view.semester === g.semester}
              count={g.probs.length}
              onClick={() => { setView({ kind: 'exam', year: g.year, semester: g.semester }); setSidebarOpen(false); }}
            />
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 text-center">SNU ECE 논자시 · 2020~2025</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 60px)' }}>
      {/* Mobile top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sm:hidden">
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="h-5 w-5 text-slate-600 dark:text-slate-300" /> : <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />}
        </button>
        <GraduationCap className="h-5 w-5 text-orange-500" />
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">논자시 준비</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop always visible, mobile overlay */}
        <aside
          className={`
            flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
            transition-all duration-200
            sm:w-64 sm:block
            ${sidebarOpen
              ? 'fixed inset-0 z-50 w-full sm:relative sm:w-64'
              : 'hidden sm:block'}
          `}
        >
          {sidebar}
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {mainContent ?? (
            <div className="flex items-center justify-center h-full text-sm text-slate-400">
              왼쪽에서 토픽 또는 기출문제를 선택하세요
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
