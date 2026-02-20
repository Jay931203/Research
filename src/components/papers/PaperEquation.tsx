'use client';

import { useMemo } from 'react';
import katex from 'katex';
import type { Equation } from '@/types';

interface PaperEquationProps {
  equation: Equation;
  forceLight?: boolean;
}

interface PaperEquationsProps {
  equations: Equation[];
  forceLight?: boolean;
}

function SingleEquation({ equation, forceLight = false }: PaperEquationProps) {
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
    <div
      className={
        forceLight
          ? 'rounded-lg border border-gray-200 bg-white p-4'
          : 'rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'
      }
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={
            forceLight
              ? 'rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700'
              : 'rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          }
        >
          {equation.name}
        </span>
      </div>
      <div className="overflow-x-auto py-2">
        {html ? (
          <div
            dangerouslySetInnerHTML={{ __html: html }}
            className={forceLight ? 'text-center text-gray-900' : 'text-center text-gray-900 dark:text-gray-100'}
          />
        ) : (
          <code className={forceLight ? 'block text-center text-sm text-red-500' : 'block text-center text-sm text-red-500 dark:text-red-400'}>
            {equation.latex}
          </code>
        )}
      </div>
      {equation.description && (
        <p className={forceLight ? 'mt-2 text-xs leading-relaxed text-gray-600' : 'mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400'}>
          {equation.description}
        </p>
      )}
    </div>
  );
}

export default function PaperEquations({ equations, forceLight = false }: PaperEquationsProps) {
  if (!equations || equations.length === 0) return null;

  return (
    <div className="space-y-3">
      {equations.map((eq, idx) => (
        <SingleEquation key={eq.name || idx} equation={eq} forceLight={forceLight} />
      ))}
    </div>
  );
}

export { SingleEquation };
