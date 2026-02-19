'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import type { GlossaryTerm } from '@/types';

interface MarkdownContentProps {
  content: string;
  className?: string;
  glossaryTerms?: GlossaryTerm[];
}

const CATEGORY_COLORS: Record<GlossaryTerm['category'], string> = {
  architecture: '#3b82f6',
  technique: '#8b5cf6',
  metric: '#10b981',
  domain: '#f59e0b',
  training: '#ef4444',
};

function getGlossaryQuery(href: string): string | null {
  if (!href.startsWith('/glossary')) return null;
  const queryIndex = href.indexOf('?');
  if (queryIndex < 0) return null;
  const params = new URLSearchParams(href.slice(queryIndex + 1));
  const q = params.get('q');
  return q?.trim() || null;
}

function findGlossaryTerm(terms: GlossaryTerm[], q: string): GlossaryTerm | null {
  const lower = q.toLowerCase();
  return (
    terms.find((term) => {
      if (term.id.toLowerCase() === lower) return true;
      if (term.name.toLowerCase() === lower) return true;
      return term.aliases.some((alias) => alias.toLowerCase() === lower);
    }) ?? null
  );
}

function normalizeMarkdown(raw: string): string {
  let text = raw
    .replace(/\r\n?/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Convert literal "\n" only when it is likely an escaped line break (not LaTeX commands like \nu).
  text = text.replace(/\\n(?=[^A-Za-z])/g, '\n');

  // Normalize LaTeX delimiters to markdown-friendly forms.
  text = text
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, expr: string) => `$${expr.trim()}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, expr: string) => `$$\n${expr.trim()}\n$$`);

  // Normalize one-line block-math markers to dedicated lines.
  text = text.replace(/\$\$\s*([^\n][\s\S]*?[^\n])\s*\$\$/g, (_, expr: string) => {
    return `$$\n${expr.trim()}\n$$`;
  });

  // Guard against malformed odd-count block math markers.
  const blockMathCount = (text.match(/\$\$/g) ?? []).length;
  if (blockMathCount % 2 === 1) {
    text = text.replace(/\$\$(?![\s\S]*\$\$)/, '$');
  }

  return text.trim();
}

export default function MarkdownContent({
  content,
  className,
  glossaryTerms = [],
}: MarkdownContentProps) {
  const normalizedContent = useMemo(() => normalizeMarkdown(content), [content]);

  return (
    <div className={`markdown-content ${className ?? ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: 'ignore' }]]}
        components={{
          a: ({ href, children }) => {
            const isInternal = typeof href === 'string' && href.startsWith('/');

            if (href && isInternal) {
              const glossaryQuery = getGlossaryQuery(href);
              if (glossaryQuery) {
                const term = findGlossaryTerm(glossaryTerms, glossaryQuery);
                const color = term ? CATEGORY_COLORS[term.category] : '#2563eb';
                return (
                  <Link
                    href={href}
                    className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold align-middle transition hover:opacity-90"
                    style={{
                      borderColor: `${color}66`,
                      backgroundColor: `${color}18`,
                      color,
                    }}
                  >
                    {children}
                  </Link>
                );
              }

              return <Link href={href}>{children}</Link>;
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            )
          },
          code: ({ className: codeClassName, children, ...props }) => {
            const isBlockCode = typeof codeClassName === 'string' && codeClassName.length > 0;
            if (!isBlockCode) {
              return (
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.92em] dark:bg-slate-800" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={codeClassName} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
