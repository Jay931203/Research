'use client';

import { useMemo } from 'react';
import katex from 'katex';
import type { Equation } from '@/types';

interface PaperEquationProps {
  equation: Equation;
}

interface PaperEquationsProps {
  equations: Equation[];
}

function SingleEquation({ equation }: PaperEquationProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(equation.latex, {
        throwOnError: false,
        displayMode: true,
        trust: true,
      });
    } catch {
      return null;
    }
  }, [equation.latex]);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
          {equation.name}
        </span>
      </div>
      <div className="overflow-x-auto py-2">
        {html ? (
          <div
            dangerouslySetInnerHTML={{ __html: html }}
            className="text-center"
          />
        ) : (
          <code className="text-sm text-red-500 dark:text-red-400 block text-center">
            {equation.latex}
          </code>
        )}
      </div>
      {equation.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          {equation.description}
        </p>
      )}
    </div>
  );
}

export default function PaperEquations({ equations }: PaperEquationsProps) {
  if (!equations || equations.length === 0) return null;

  return (
    <div className="space-y-3">
      {equations.map((eq, idx) => (
        <SingleEquation key={idx} equation={eq} />
      ))}
    </div>
  );
}

export { SingleEquation };
