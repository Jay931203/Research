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
    <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20">
      <p className="line-clamp-1 text-xs font-bold text-blue-900 dark:text-blue-100">
        {equation.name}
      </p>
      <div className="mt-1.5 overflow-x-auto">
        {rendered ? (
          <div
            className="text-sm text-gray-800 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        ) : (
          <code className="line-clamp-2 block text-xs text-gray-600 dark:text-gray-300">
            {equation.latex}
          </code>
        )}
      </div>
    </div>
  );
}
