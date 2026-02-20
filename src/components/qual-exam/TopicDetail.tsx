'use client';
import { useState } from 'react';
import { Zap, BookOpen, Code2, AlertTriangle, FileText, PlayCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import MathBlock from './MathBlock';
import PracticeList from './PracticeList';
import type { StudyTopic } from './TopicStudyCard';
import type { ExamProblem } from './ExamProblemCard';
import type { QuizQuestion } from './PracticeList';
import AsymptoticContent from './topic-content/AsymptoticContent';
import LinkedListContent from './topic-content/LinkedListContent';

const AlgoVisualizer = dynamic(() => import('./AlgoVisualizer'), { ssr: false });

/* ── Theory renderer helpers ── */

/** Renders the body of a ■ section: bullets, code blocks, structured mono text */
function TheoryBody({ body }: { body: string }) {
  if (!body.trim()) return null;
  const lines = body.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    if (!lines[i].trim()) { i++; continue; }

    // Bullet list: consecutive lines starting with •
    if (lines[i].trimStart().startsWith('•')) {
      const bullets: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('•')) {
        bullets.push(lines[i].trimStart().slice(1).trim());
        i++;
      }
      result.push(
        <ul key={`b-${i}`} className="space-y-1.5 mb-2">
          {bullets.map((b, j) => (
            <li key={j} className="flex items-start gap-2 text-sm">
              <span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
              <span className="text-slate-700 dark:text-slate-300 leading-snug">{b}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Collect a block of non-empty, non-bullet lines
    const blockLines: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].trimStart().startsWith('•')) {
      blockLines.push(lines[i]);
      i++;
    }

    if (blockLines.length === 0) continue;

    const content = blockLines.join('\n');
    const isCode = blockLines.some(l =>
      /^  /.test(l) ||
      /^\s*(if\s|else|while\s|for\s|return\s|swap\(|def |function |partition|mergesort|quicksort|heapify|tree-insert|let |const )/.test(l.trim())
    );

    if (isCode) {
      result.push(
        <pre key={`code-${i}`} className="overflow-x-auto rounded-lg bg-slate-950 px-3 py-2.5 text-xs leading-relaxed text-slate-200 font-mono mb-2">
          {content}
        </pre>
      );
    } else {
      result.push(
        <div key={`mono-${i}`} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 border border-slate-100 dark:border-slate-700/50 mb-2">
          <pre className="whitespace-pre-wrap text-xs leading-[1.8] text-slate-700 dark:text-slate-300 font-mono">
            {content}
          </pre>
        </div>
      );
    }
  }

  return <>{result}</>;
}

/** Renders the full theory string: splits by ■ into section cards */
function TheoryRenderer({ theory }: { theory: string }) {
  // Split by lines starting with ■
  const rawParts: string[] = [];
  let current = '';
  for (const line of theory.split('\n')) {
    if (line.startsWith('■ ') && current.trim()) {
      rawParts.push(current);
      current = line + '\n';
    } else {
      current += line + '\n';
    }
  }
  if (current.trim()) rawParts.push(current);

  return (
    <div className="space-y-2.5">
      {rawParts.map((raw, si) => {
        const trimmed = raw.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('■ ')) {
          const nlIdx = trimmed.indexOf('\n');
          const title = nlIdx > 0 ? trimmed.slice(2, nlIdx).trim() : trimmed.slice(2).trim();
          const body = nlIdx > 0 ? trimmed.slice(nlIdx + 1) : '';

          return (
            <div key={si} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
              </div>
              <div className="px-4 py-3">
                <TheoryBody body={body} />
              </div>
            </div>
          );
        }

        // Intro/preamble text (before any ■ section)
        return (
          <p key={si} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed px-1">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

const difficultyLabel = { basic: '기초', intermediate: '중급', advanced: '고급' };
const difficultyColor = {
  basic: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  advanced: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300',
};

function SectionHeading({ icon, title }: { icon?: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-slate-400">{icon}</span>}
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{title}</h2>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

interface Props {
  topic: StudyTopic;
  relatedExams: ExamProblem[];
  practiceQuestions: QuizQuestion[];
  onExamClick?: (exam: ExamProblem) => void;
}

export default function TopicDetail({ topic, relatedExams, practiceQuestions, onExamClick }: Props) {
  const [showViz, setShowViz] = useState(false);

  // Route to custom per-topic pages
  if (topic.id === 'asymptotic') {
    return <AsymptoticContent topic={topic} relatedExams={relatedExams} onExamClick={onExamClick} />;
  }
  if (topic.id === 'linked-list') {
    return <LinkedListContent topic={topic} relatedExams={relatedExams} onExamClick={onExamClick} />;
  }

  return (
    <div className="max-w-3xl space-y-8 px-6 py-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <span className="text-5xl leading-none">{topic.icon}</span>
          {(topic as { studyOrder?: number }).studyOrder != null && (
            <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow">
              {(topic as { studyOrder?: number }).studyOrder}
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
                <svg key={i} className={`h-3.5 w-3.5 ${i < topic.examFrequency ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-[10px] text-slate-400">출제빈도</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{topic.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{topic.titleEn}</p>
          {(topic as { summary?: string }).summary && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {(topic as { summary?: string }).summary}
            </p>
          )}
        </div>
      </div>

      {/* ── Key Points ─────────────────────────────────── */}
      <section>
        <SectionHeading icon={<Zap className="h-3.5 w-3.5" />} title="핵심 포인트" />
        <ul className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
          {topic.keyPoints.map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
              {pt}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Theory ─────────────────────────────────────── */}
      <section>
        <SectionHeading icon={<BookOpen className="h-3.5 w-3.5" />} title="이론 설명" />
        <TheoryRenderer theory={topic.theory} />
      </section>

      {/* ── Math Formulas ──────────────────────────────── */}
      {(topic as { mathFormulas?: Array<{ label: string; latex: string }> }).mathFormulas?.length && (
        <section>
          <SectionHeading title="핵심 수식" />
          <div className="space-y-3">
            {(topic as { mathFormulas?: Array<{ label: string; latex: string }> }).mathFormulas!.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                <p className="mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{f.label}</p>
                <MathBlock latex={f.latex} block />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Complexity Table ───────────────────────────── */}
      {topic.complexityTable && topic.complexityTable.length > 0 && (
        <section>
          <SectionHeading title="시간 복잡도" />
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">연산 / 알고리즘</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">복잡도</th>
                  {topic.complexityTable.some(r => r.note) && (
                    <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">비고</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {topic.complexityTable.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{row.operation}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-blue-700 dark:text-blue-300">{row.complexity}</td>
                    {topic.complexityTable!.some(r => r.note) && (
                      <td className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">{row.note ?? ''}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Code Examples ──────────────────────────────── */}
      {(() => {
        const examples = (topic as { codeExamples?: Array<{ caption: string; language: string; code: string }> }).codeExamples;
        const legacy = topic.codeExample;
        if (!examples?.length && !legacy) return null;
        return (
          <section>
            <SectionHeading icon={<Code2 className="h-3.5 w-3.5" />} title="코드 예시" />
            <div className="space-y-3">
              {examples?.map((ex, i) => (
                <div key={i}>
                  <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{ex.caption}</p>
                  <div className="relative rounded-xl bg-slate-950 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                      <span className="ml-2 text-[11px] font-mono text-slate-500">{ex.language}</span>
                    </div>
                    <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-200">
                      <code>{ex.code}</code>
                    </pre>
                  </div>
                </div>
              ))}
              {!examples?.length && legacy && (
                <div className="relative rounded-xl bg-slate-950 overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-200">
                    <code>{legacy}</code>
                  </pre>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* ── Common Pitfalls ────────────────────────────── */}
      {topic.commonPitfalls && topic.commonPitfalls.length > 0 && (
        <section>
          <SectionHeading icon={<AlertTriangle className="h-3.5 w-3.5" />} title="자주 하는 실수" />
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/10 space-y-2">
            {topic.commonPitfalls.map((p, i) => (
              <p key={i} className="flex gap-2 text-sm text-red-700 dark:text-red-300">
                <span className="flex-shrink-0">⚠</span> {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ── Related Exam Problems ──────────────────────── */}
      {relatedExams.length > 0 && (
        <section>
          <SectionHeading icon={<FileText className="h-3.5 w-3.5" />} title={`관련 기출문제 (${relatedExams.length})`} />
          <div className="flex flex-wrap gap-2">
            {relatedExams.map(exam => (
              <button
                key={exam.id}
                onClick={() => onExamClick?.(exam)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 px-3 py-2 text-left transition group"
              >
                <span className="rounded bg-slate-900 dark:bg-slate-100 px-2 py-0.5 text-[10px] font-black text-white dark:text-slate-900 flex-shrink-0">
                  {exam.year}-{exam.semester === '1' ? '1학기' : '2학기'}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate max-w-[200px]">
                  {exam.title}
                </span>
                <span className="text-[10px] text-slate-400 flex-shrink-0">팝업 보기 →</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Practice Questions ─────────────────────────── */}
      {practiceQuestions.length > 0 && (
        <section>
          <SectionHeading title={`연습 문제 (${practiceQuestions.length})`} />
          <PracticeList questions={practiceQuestions} filterByTopic={topic.title} />
        </section>
      )}

      {/* ── Algorithm Visualizer ───────────────────────── */}
      {topic.visualizerType && (
        <section>
          <SectionHeading icon={<PlayCircle className="h-3.5 w-3.5" />} title="알고리즘 시각화" />
          <button
            onClick={() => setShowViz(v => !v)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
          >
            <PlayCircle className="h-4 w-4" />
            {showViz ? '시각화 닫기' : '인터랙티브 시각화 열기'}
          </button>
          {showViz && (
            <div className="mt-3">
              <AlgoVisualizer type={topic.visualizerType} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
