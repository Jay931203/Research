'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Code,
  ExternalLink,
  FileText,
  Link2,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import type { PaperRelationship, PaperWithNote } from '@/types';
import { RELATIONSHIP_STYLES } from '@/lib/visualization/graphUtils';
import {
  buildBridgeRecommendations,
  buildPaperConnections,
  buildPaperCoreSnapshot,
  summarizeRelationship,
} from '@/lib/papers/insights';
import EquationPreviewCard from '@/components/papers/EquationPreviewCard';
import NoteEditor from '@/components/notes/NoteEditor';
import PaperEquations from './PaperEquation';

interface PaperDetailModalProps {
  paper: PaperWithNote | null;
  isOpen: boolean;
  onClose: () => void;
  relationships?: PaperRelationship[];
  allPapers?: PaperWithNote[];
  onPaperSelect?: (paperId: string) => void;
  onDataChange?: () => void;
}

export default function PaperDetailModal({
  paper,
  isOpen,
  onClose,
  relationships = [],
  allPapers = [],
  onPaperSelect,
  onDataChange,
}: PaperDetailModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const closingTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleClose = useCallback(() => {
    setIsClosing(true);
    closingTimer.current = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    },
    [handleClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      if (closingTimer.current) clearTimeout(closingTimer.current);
    };
  }, [isOpen, handleEscape]);

  const connections = useMemo(() => {
    if (!paper) return [];
    return buildPaperConnections(paper.id, allPapers, relationships);
  }, [paper, allPapers, relationships]);

  const outgoingConnections = useMemo(
    () => connections.filter((connection) => connection.direction === 'outgoing'),
    [connections]
  );

  const incomingConnections = useMemo(
    () => connections.filter((connection) => connection.direction === 'incoming'),
    [connections]
  );

  const bridgeRecommendations = useMemo(() => {
    if (!paper) return [];
    return buildBridgeRecommendations(paper.id, allPapers, relationships, 4);
  }, [paper, allPapers, relationships]);

  const snapshot = useMemo(() => {
    if (!paper) return null;
    return buildPaperCoreSnapshot(paper);
  }, [paper]);

  if (!isOpen || !paper || !snapshot) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" onClick={handleClose} />

      <div className={`fixed right-0 top-0 z-50 h-full w-full max-w-3xl overflow-hidden bg-white shadow-2xl dark:bg-gray-900 ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}>
        <div
          className="sticky top-0 z-10 border-b border-gray-200 px-6 py-4 dark:border-gray-700"
          style={{ backgroundColor: `${paper.color_hex}10` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: paper.color_hex }}
                >
                  {paper.year}
                </span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {paper.category}
                </span>
                {paper.is_favorite && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
              </div>
              <h2 className="text-lg font-bold leading-tight text-gray-900 dark:text-gray-100">
                {paper.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {paper.authors.join(', ')}
                {paper.venue ? <span className="ml-2 italic">- {paper.venue}</span> : null}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {(paper.pdf_url || paper.code_url) && (
            <div className="mt-3 flex items-center gap-2">
              {paper.pdf_url && (
                <a
                  href={paper.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  PDF
                </a>
              )}
              {paper.code_url && (
                <a
                  href={paper.code_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800"
                >
                  <Code className="h-3.5 w-3.5" />
                  Code
                </a>
              )}
            </div>
          )}
        </div>

        <div className="h-[calc(100%-148px)] space-y-7 overflow-y-auto px-6 py-5">
          <Section icon={<Sparkles className="h-4 w-4" />} title="핵심 리마인드">
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-900 dark:bg-blue-900/20 dark:text-blue-100">
              {snapshot.oneLiner}
            </p>

            {!!snapshot.methods.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {snapshot.methods.map((method) => (
                  <span
                    key={method}
                    className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-200"
                  >
                    {method}
                  </span>
                ))}
              </div>
            )}

            {!!snapshot.rememberPoints.length && (
              <div className="mt-3">
                <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  리마인드 체크포인트
                </p>
                <ul className="space-y-1">
                  {snapshot.rememberPoints.map((point) => (
                    <li key={point} className="text-sm text-gray-700 dark:text-gray-300">
                      • {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!!snapshot.expectedOutcomes.length && (
              <div className="mt-3">
                <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  기대 기여/결과
                </p>
                <ul className="space-y-1">
                  {snapshot.expectedOutcomes.map((outcome) => (
                    <li key={outcome} className="text-sm text-gray-700 dark:text-gray-300">
                      • {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!!snapshot.equationPreviews.length && (
              <div className="mt-3">
                <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  핵심 수식 요약
                </p>
                <div className="space-y-2">
                  {snapshot.equationPreviews.slice(0, 2).map((equation) => (
                    <EquationPreviewCard key={equation.name} equation={equation} />
                  ))}
                </div>
              </div>
            )}
          </Section>

          {paper.abstract && (
            <Section icon={<FileText className="h-4 w-4" />} title="초록">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {paper.abstract}
              </p>
            </Section>
          )}

          {!!paper.key_contributions?.length && (
            <Section icon={<BookOpen className="h-4 w-4" />} title="주요 기여">
              <ul className="space-y-1.5">
                {paper.key_contributions.map((contribution) => (
                  <li
                    key={contribution}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span>{contribution}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {!!paper.key_equations?.length && (
            <Section icon={<span className="text-sm font-semibold">f(x)</span>} title="핵심 수식">
              <PaperEquations equations={paper.key_equations} />
            </Section>
          )}

          <Section icon={<Link2 className="h-4 w-4" />} title="연계 논문">
            <ConnectionGroup
              title="이 논문이 참조한 방향"
              items={outgoingConnections}
              onPaperSelect={onPaperSelect}
            />
            <ConnectionGroup
              title="이 논문을 참조한 방향"
              items={incomingConnections}
              onPaperSelect={onPaperSelect}
            />

            {!!bridgeRecommendations.length && (
              <div className="mt-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  2-hop 추천 논문
                </p>
                <div className="space-y-2">
                  {bridgeRecommendations.map((recommendation) => (
                    <button
                      key={recommendation.paper.id}
                      onClick={() => onPaperSelect?.(recommendation.paper.id)}
                      className="w-full rounded-md border border-gray-200 px-2.5 py-2 text-left transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <p className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {recommendation.paper.title}
                      </p>
                      <p className="line-clamp-1 text-[11px] text-gray-500 dark:text-gray-400">
                        점수 {recommendation.score} · {recommendation.reasons.join(' / ')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <hr className="border-gray-200 dark:border-gray-700" />

          <Section icon={<FileText className="h-4 w-4" />} title="학습 노트">
            <NoteEditor
              paperId={paper.id}
              initialContent={paper.note_content || ''}
              initialFamiliarity={paper.familiarity_level || 'not_started'}
              initialFavorite={paper.is_favorite || false}
              initialImportance={paper.importance_rating || 0}
              initialTags={paper.personal_tags || []}
              onSave={onDataChange}
            />
          </Section>
        </div>
      </div>
    </>
  );
}

function ConnectionGroup({
  title,
  items,
  onPaperSelect,
}: {
  title: string;
  items: ReturnType<typeof buildPaperConnections>;
  onPaperSelect?: (paperId: string) => void;
}) {
  return (
    <div className="mb-3">
      <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">{title}</p>
      <div className="space-y-2">
        {items.slice(0, 8).map((item) => {
          const style = RELATIONSHIP_STYLES[item.relationship.relationship_type];
          return (
            <button
              key={item.relationship.id}
              onClick={() => onPaperSelect?.(item.otherPaper.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-2.5 text-left transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                  {item.otherPaper.title}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {item.otherPaper.year} ·{' '}
                  {summarizeRelationship(item.relationship.relationship_type, item.direction)}
                </p>
              </div>
              <span
                className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: `${style.color}20`, color: style.color }}
              >
                {style.label} {item.relationship.strength}/10
              </span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
            </button>
          );
        })}
        {!items.length && (
          <p className="text-xs text-gray-500 dark:text-gray-400">연결된 논문이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-gray-500 dark:text-gray-400">{icon}</span>
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h3>
      </div>
      {children}
    </section>
  );
}
