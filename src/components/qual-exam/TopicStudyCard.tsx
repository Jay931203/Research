'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Star, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';

const AlgoVisualizer = dynamic(() => import('./AlgoVisualizer'), { ssr: false });

export interface StudyTopic {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  examFrequency: number;
  keyPoints: string[];
  theory: string;
  complexityTable?: { operation: string; complexity: string; note?: string }[];
  codeExample?: string;
  commonPitfalls?: string[];
  visualizerType?: 'quicksort' | 'minheap' | 'bst' | 'dijkstra';
}

interface TopicStudyCardProps {
  topic: StudyTopic;
  defaultExpanded?: boolean;
}

const difficultyLabel = { basic: '기초', intermediate: '중급', advanced: '고급' };
const difficultyColor = {
  basic: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
  intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  advanced: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
};

export default function TopicStudyCard({ topic, defaultExpanded = false }: TopicStudyCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showViz, setShowViz] = useState(false);

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${expanded ? 'border-blue-200 dark:border-blue-800' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
      >
        <span className="text-2xl flex-shrink-0">{topic.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${difficultyColor[topic.difficulty]}`}>
              {difficultyLabel[topic.difficulty]}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-2.5 w-2.5 ${i < topic.examFrequency ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'}`} />
              ))}
              <span className="ml-1 text-[10px] text-slate-400">출제빈도</span>
            </div>
          </div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{topic.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{topic.titleEn}</p>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 mt-1" /> : <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400 mt-1" />}
      </button>

      {/* Body */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 pb-4 pt-3 space-y-4">
          {/* Key Points */}
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="mb-2 flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              <Zap className="h-3.5 w-3.5" /> 핵심 포인트
            </p>
            <ul className="space-y-1">
              {topic.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Theory */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {topic.theory}
            </pre>
          </div>

          {/* Complexity Table */}
          {topic.complexityTable && topic.complexityTable.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">연산</th>
                    <th className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">시간 복잡도</th>
                    {topic.complexityTable.some(r => r.note) && (
                      <th className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">비고</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {topic.complexityTable.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-300">{row.operation}</td>
                      <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 font-mono font-semibold text-blue-700 dark:text-blue-300">{row.complexity}</td>
                      {topic.complexityTable!.some(r => r.note) && (
                        <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{row.note ?? ''}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Code Example */}
          {topic.codeExample && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">코드 예시</p>
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs leading-relaxed text-slate-200">
                <code>{topic.codeExample}</code>
              </pre>
            </div>
          )}

          {/* Common Pitfalls */}
          {topic.commonPitfalls && topic.commonPitfalls.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800/40 dark:bg-red-900/10">
              <p className="mb-1.5 text-xs font-bold text-red-700 dark:text-red-400">⚠️ 자주 하는 실수</p>
              <ul className="space-y-1">
                {topic.commonPitfalls.map((p, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-300">• {p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Visualizer Toggle */}
          {topic.visualizerType && (
            <div>
              <button
                onClick={() => setShowViz(v => !v)}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
              >
                🎬 {showViz ? '시각화 닫기' : '알고리즘 시각화 보기'}
              </button>
              {showViz && (
                <div className="mt-3">
                  <AlgoVisualizer type={topic.visualizerType} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
