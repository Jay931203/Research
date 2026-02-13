'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  RELATIONSHIP_STYLES,
  FAMILIARITY_COLORS,
  FAMILIARITY_LABELS,
} from '@/lib/visualization/graphUtils';
import type { RelationshipType } from '@/types';

export default function GraphLegend() {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);

  const relationshipTypes = Object.entries(RELATIONSHIP_STYLES) as [
    RelationshipType,
    (typeof RELATIONSHIP_STYLES)[RelationshipType]
  ][];

  const familiarityLevels = Object.entries(FAMILIARITY_COLORS) as [string, string][];

  if (!visible) {
    return (
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setVisible(true)}
          className="px-3 py-2 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          범례 열기
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden min-w-[126px]">
        <div className="flex items-center px-3 py-2 gap-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-left hover:text-blue-600 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">범례</span>
            {expanded ? (
              <ChevronUp className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            )}
          </button>

          <button
            onClick={() => setVisible(false)}
            className="ml-auto p-1 rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Close legend"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {expanded && (
          <div className="px-3 pb-3 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-2">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                관계 타입
              </p>
              <div className="space-y-1">
                {relationshipTypes.map(([type, style]) => (
                  <div key={type} className="flex items-center gap-2">
                    <svg width="24" height="8">
                      <line
                        x1="0"
                        y1="4"
                        x2="24"
                        y2="4"
                        stroke={style.color}
                        strokeWidth="2"
                        strokeDasharray={style.strokeDasharray || ''}
                      />
                    </svg>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{style.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                익숙함 레벨
              </p>
              <div className="space-y-1">
                {familiarityLevels.map(([level, color]) => (
                  <div key={level} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">
                      {FAMILIARITY_LABELS[level]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
