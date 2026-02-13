'use client';

import { useMemo } from 'react';
import katex from 'katex';

interface EquationPreviewCardProps {
  equation: {
    name: string;
    latex: string;
  };
}

export default function EquationPreviewCard({ equation }: EquationPreviewCardProps) {
  const rendered = useMemo(() => {
    try {
      return katex.renderToString(equation.latex, {
        throwOnError: false,
        displayMode: false,
        trust: true,
      });
    } catch {
      return null;
    }
  }, [equation.latex]);

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
      <p className="line-clamp-1 text-[11px] font-semibold text-gray-700 dark:text-gray-200">
        {equation.name}
      </p>
      <div className="mt-1 overflow-x-auto">
        {rendered ? (
          <div
            className="text-[11px] text-gray-700 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        ) : (
          <code className="line-clamp-2 block text-[11px] text-gray-600 dark:text-gray-300">
            {equation.latex}
          </code>
        )}
      </div>
    </div>
  );
}
