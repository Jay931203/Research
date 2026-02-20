'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen, BrainCircuit, ChevronLeft, ChevronRight,
  ClipboardList, FileText, GraduationCap, Menu, X,
} from 'lucide-react';
import TopicDetail from './TopicDetail';
import ExamProblemCard from './ExamProblemCard';
import ExamProblemModal from './ExamProblemModal';
import PracticeList from './PracticeList';
import { DSA_TOPICS, DSA_EXAM_PROBLEMS, DSA_PRACTICE_QUESTIONS } from '@/data/qual-exam/dsa-data';
import { PROG_TOPICS, PROG_EXAM_PROBLEMS, PROG_PRACTICE_QUESTIONS } from '@/data/qual-exam/prog-data';
import type { StudyTopic } from './TopicStudyCard';
import type { ExamProblem } from './ExamProblemCard';
import type { QuizQuestion } from './PracticeList';

type Subject = 'dsa' | 'prog';
type View = { kind: 'topic'; topicId: string } | { kind: 'exams' };

function semLabel(s: '1' | '2') { return s === '1' ? '1학기' : '2학기'; }

/* ── ToC sections per topic ── */
const CUSTOM_SECTIONS: Record<string, Array<{ id: string; label: string }>> = {
  'asymptotic': [
    { id: 'sec-growth',     label: '성장률 비교'   },
    { id: 'sec-notations',  label: '표기법 5종'    },
    { id: 'sec-properties', label: '핵심 성질'     },
  ],
  'linked-list': [
    { id: 'sec-compare',     label: '배열 vs LL'   },
    { id: 'sec-array-sim',   label: '배열 시뮬레이터' },
    { id: 'sec-ll-viz',      label: 'LL/스택/큐 시각화' },
    { id: 'sec-stack-queue', label: '스택 vs 큐'   },
    { id: 'sec-code',        label: '코드 예시'    },
  ],
};

function getGenericSections(topic: StudyTopic): Array<{ id: string; label: string }> {
  const secs: Array<{ id: string; label: string }> = [
    { id: 'sec-keypoints', label: '핵심 포인트' },
    { id: 'sec-theory',    label: '이론 설명'   },
  ];
  if (topic.complexityTable?.length) secs.push({ id: 'sec-complexity', label: '시간 복잡도' });
  if ((topic as { codeExamples?: unknown[] }).codeExamples?.length || topic.codeExample)
    secs.push({ id: 'sec-code', label: '코드 예시' });
  if (topic.commonPitfalls?.length) secs.push({ id: 'sec-pitfalls', label: '자주 하는 실수' });
  if (topic.visualizerType)         secs.push({ id: 'sec-viz',      label: '알고리즘 시각화' });
  return secs;
}

/* ── Sidebar topic item ── */
function TopicItem({ topic, active, onClick, examCount }: {
  topic: StudyTopic; active: boolean; onClick: () => void; examCount: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition
        ${active
          ? 'bg-blue-600 text-white'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
      <span className="text-base flex-shrink-0">{topic.icon}</span>
      <span className="flex-1 min-w-0 text-sm font-medium truncate">{topic.title}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {Array.from({ length: Math.min(topic.examFrequency, 5) }).map((_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white/60' : 'bg-amber-400'}`} />
        ))}
        {examCount > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5
            ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
            {examCount}
          </span>
        )}
      </div>
    </button>
  );
}

/* ── Right exam panel ── */
function RightPanel({ exams, practiceQs, onExamClick, onClose }: {
  exams: ExamProblem[];
  practiceQs: QuizQuestion[];
  onExamClick: (e: ExamProblem) => void;
  onClose: () => void;
}) {
  return (
    <aside className="w-72 flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">기출 / 연습 문제</p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <X className="h-4 w-4 text-slate-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {exams.length > 0 && (
          <>
            <p className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">기출문제 ({exams.length})</p>
            {exams.map(exam => (
              <button
                key={exam.id}
                onClick={() => onExamClick(exam)}
                className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 p-3 transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded bg-slate-900 dark:bg-slate-100 px-2 py-0.5 text-[10px] font-black text-white dark:text-slate-900">
                    {exam.year}-{semLabel(exam.semester)}
                  </span>
                  <span className="text-[10px] text-slate-400">{exam.totalPoints}점</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug">{exam.title}</p>
              </button>
            ))}
          </>
        )}

        {practiceQs.length > 0 && (
          <div className={exams.length > 0 ? 'pt-3 border-t border-slate-100 dark:border-slate-800' : ''}>
            <p className="px-1 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">연습 문제 ({practiceQs.length})</p>
            <PracticeList questions={practiceQs} />
          </div>
        )}

        {exams.length === 0 && practiceQs.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">이 토픽의 기출/연습 문제가 없습니다.</p>
        )}
      </div>
    </aside>
  );
}

/* ── All exams view ── */
function AllExamsPanel({ examProblems, onExamClick }: {
  examProblems: ExamProblem[];
  onExamClick: (e: ExamProblem) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, ExamProblem[]>();
    for (const p of examProblems) {
      const key = `${p.year}-${p.semester}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, probs]) => ({ year: probs[0].year, semester: probs[0].semester, probs }));
  }, [examProblems]);

  return (
    <div className="max-w-3xl px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">기출문제 전체</h1>
        <span className="text-sm text-slate-400">{examProblems.length}문제</span>
      </div>
      {groups.map(g => (
        <div key={`${g.year}-${g.semester}`} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {g.year}년 {semLabel(g.semester)}
            </h2>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-[11px] text-slate-400">{g.probs.length}문제</span>
          </div>
          {g.probs.map(p => (
            <ExamProblemCard key={p.id} problem={p} defaultExpanded={false} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Main ─── */
export default function QualExamMain() {
  const [subject,           setSubject]           = useState<Subject>('dsa');
  const [view,              setView]              = useState<View>({ kind: 'topic', topicId: 'asymptotic' });
  const [leftCollapsed,     setLeftCollapsed]     = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [examPanelOpen,     setExamPanelOpen]     = useState(false);
  const [modalExam,         setModalExam]         = useState<ExamProblem | null>(null);
  const [activeSectionId,   setActiveSectionId]   = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const topics       = subject === 'dsa' ? DSA_TOPICS        : PROG_TOPICS;
  const examProblems = subject === 'dsa' ? DSA_EXAM_PROBLEMS  : PROG_EXAM_PROBLEMS;
  const practiceQs   = subject === 'dsa' ? DSA_PRACTICE_QUESTIONS : PROG_PRACTICE_QUESTIONS;

  const currentTopic = useMemo(
    () => view.kind === 'topic' ? (topics.find(t => t.id === view.topicId) ?? null) : null,
    [view, topics]
  );

  const relatedExams = useMemo(() => {
    if (!currentTopic) return [];
    const ids: string[] = (currentTopic as { relatedExamIds?: string[] }).relatedExamIds ?? [];
    return examProblems.filter(p => ids.includes(p.id));
  }, [currentTopic, examProblems]);

  const topicPracticeQs = useMemo(() => {
    if (!currentTopic) return [];
    return practiceQs.filter(q => q.topic === currentTopic.title) as QuizQuestion[];
  }, [currentTopic, practiceQs]);

  const examCountByTopic = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of topics) {
      counts[t.id] = ((t as { relatedExamIds?: string[] }).relatedExamIds ?? []).length;
    }
    return counts;
  }, [topics]);

  const tocSections = useMemo(() => {
    if (!currentTopic) return [];
    return CUSTOM_SECTIONS[currentTopic.id] ?? getGenericSections(currentTopic);
  }, [currentTopic]);

  /* ── Scroll spy ── */
  useEffect(() => {
    const container = mainRef.current;
    setActiveSectionId(tocSections[0]?.id ?? null);
    container?.scrollTo({ top: 0 });
    if (!container || tocSections.length === 0) return;

    const onScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      let found = tocSections[0].id;
      for (const sec of tocSections) {
        const el = container.querySelector(`#${sec.id}`) as HTMLElement | null;
        if (!el) continue;
        if (el.getBoundingClientRect().top - containerTop < 120) found = sec.id;
      }
      setActiveSectionId(found);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [tocSections]);

  const scrollToSection = useCallback((id: string) => {
    const container = mainRef.current;
    if (!container) return;
    const el = container.querySelector(`#${id}`) as HTMLElement | null;
    if (!el) return;
    const diff = el.getBoundingClientRect().top - container.getBoundingClientRect().top - 80;
    container.scrollBy({ top: diff, behavior: 'smooth' });
  }, []);

  const switchSubject = (s: Subject) => {
    setSubject(s);
    setView({ kind: 'topic', topicId: (s === 'dsa' ? DSA_TOPICS : PROG_TOPICS)[0].id });
    setExamPanelOpen(false);
    setMobileSidebarOpen(false);
  };

  const mainContent = useMemo(() => {
    if (view.kind === 'topic') {
      const topic = topics.find(t => t.id === view.topicId);
      return topic ? <TopicDetail topic={topic} /> : null;
    }
    if (view.kind === 'exams') {
      return <AllExamsPanel examProblems={examProblems} onExamClick={setModalExam} />;
    }
    return null;
  }, [view, topics, examProblems]);

  const hasPanelContent = relatedExams.length > 0 || topicPracticeQs.length > 0;

  /* ── Sidebar content (shared desktop + mobile) ── */
  const sidebarContent = (
    <div className="flex flex-col h-full min-h-0">

      {/* Collapse toggle row */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        {!leftCollapsed && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">목차</span>
        )}
        <button
          onClick={() => setLeftCollapsed(c => !c)}
          className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          title={leftCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {leftCollapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!leftCollapsed && (
        <>
          {/* Subject + exam button */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 space-y-2">
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => switchSubject('dsa')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition
                  ${subject === 'dsa'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <BrainCircuit className="h-3.5 w-3.5" /> 자알
              </button>
              <button
                onClick={() => switchSubject('prog')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border-l border-slate-200 dark:border-slate-700 transition
                  ${subject === 'prog'
                    ? 'bg-violet-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <BookOpen className="h-3.5 w-3.5" /> 프기
              </button>
            </div>

            {/* All exams button */}
            <button
              onClick={() => { setView({ kind: 'exams' }); setExamPanelOpen(false); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition
                ${view.kind === 'exams'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <ClipboardList className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium">기출문제</span>
              <span className={`text-[10px] font-semibold ${view.kind === 'exams' ? 'text-white/60 dark:text-slate-600' : 'text-slate-400'}`}>
                {examProblems.length}문제
              </span>
            </button>
          </div>

          {/* Topic list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5 min-h-0">
            {[...topics]
              .sort((a, b) =>
                ((a as { studyOrder?: number }).studyOrder ?? 99) -
                ((b as { studyOrder?: number }).studyOrder ?? 99)
              )
              .map(t => (
                <TopicItem
                  key={t.id}
                  topic={t}
                  active={view.kind === 'topic' && view.topicId === t.id}
                  onClick={() => { setView({ kind: 'topic', topicId: t.id }); setMobileSidebarOpen(false); }}
                  examCount={examCountByTopic[t.id] ?? 0}
                />
              ))}
          </div>

          {/* In-page ToC */}
          {view.kind === 'topic' && tocSections.length > 0 && (
            <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 p-3">
              <p className="px-1 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">이 페이지</p>
              <div className="space-y-0.5">
                {tocSections.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition
                      ${activeSectionId === sec.id
                        ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span className={`text-base leading-none ${activeSectionId === sec.id ? 'text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>›</span>
                    {sec.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 text-center">SNU ECE 논자시 · 2020~2025</p>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <ExamProblemModal problem={modalExam} onClose={() => setModalExam(null)} />

      <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sm:hidden flex-shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(o => !o)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileSidebarOpen
              ? <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              : <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />}
          </button>
          <GraduationCap className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">논자시 준비</span>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          <aside className={`hidden sm:flex flex-col flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 overflow-hidden
            ${leftCollapsed ? 'w-10' : 'w-64'}`}>
            {sidebarContent}
          </aside>

          {/* Mobile sidebar overlay */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 sm:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
              <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                {sidebarContent}
              </aside>
            </div>
          )}

          {/* Content column */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Exam panel toggle bar (only when topic view has content) */}
            {view.kind === 'topic' && hasPanelContent && (
              <div className="flex items-center justify-end px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
                <button
                  onClick={() => setExamPanelOpen(o => !o)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition
                    ${examPanelOpen
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'}`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  기출 {relatedExams.length} · 연습 {topicPracticeQs.length}
                  {examPanelOpen
                    ? <ChevronRight className="h-3 w-3" />
                    : <ChevronLeft className="h-3 w-3" />}
                </button>
              </div>
            )}

            {/* Main + right panel */}
            <div className="flex flex-1 overflow-hidden">
              <main
                ref={mainRef}
                className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950"
              >
                {mainContent ?? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    왼쪽에서 토픽을 선택하세요
                  </div>
                )}
              </main>

              {examPanelOpen && view.kind === 'topic' && (
                <RightPanel
                  exams={relatedExams}
                  practiceQs={topicPracticeQs}
                  onExamClick={setModalExam}
                  onClose={() => setExamPanelOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
