'use client';
import { renderToString } from 'katex';

interface Props {
  latex: string;
  block?: boolean;
  className?: string;
}

export default function MathBlock({ latex, block = false, className = '' }: Props) {
  try {
    const html = renderToString(latex, { displayMode: block, throwOnError: false, strict: false });
    if (block) {
      return (
        <div
          className={`overflow-x-auto py-1 text-center ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return (
      <span
        className={`align-middle ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">{latex}</code>;
  }
}
