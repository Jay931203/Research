'use client';

/**
 * GlossaryText — wraps any React subtree and auto-highlights glossary terms
 * found in text nodes by consulting GlossaryTermsContext.
 *
 * Only recurses into native HTML elements (typeof type === 'string').
 * Custom components (function/class types) are left untouched so their
 * internal state and hooks are preserved.
 */

import React, { Fragment } from 'react';
import type { GlossaryTerm } from '@/types';
import GlossaryHighlighter from './GlossaryHighlighter';
import { useGlossaryTerms } from './GlossaryContext';

function processNode(node: React.ReactNode, terms: GlossaryTerm[]): React.ReactNode {
  // Plain text node — apply glossary highlighting
  if (typeof node === 'string') {
    return <GlossaryHighlighter text={node} terms={terms} />;
  }

  // Array of children — process each recursively
  if (Array.isArray(node)) {
    return (
      <>
        {node.map((child, i) => (
          <Fragment key={i}>{processNode(child, terms)}</Fragment>
        ))}
      </>
    );
  }

  // React element
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;

    // Only recurse into native HTML elements (string tag names like 'p', 'span', 'div', …).
    // Custom components (function or class types) are returned as-is.
    if (typeof el.type === 'string' && el.props.children !== undefined) {
      return React.cloneElement(el, {}, processNode(el.props.children, terms));
    }

    return node;
  }

  // null, undefined, boolean, number — return unchanged
  return node;
}

export default function GlossaryText({ children }: { children: React.ReactNode }) {
  const terms = useGlossaryTerms();

  if (!terms.length) return <>{children}</>;

  return <>{processNode(children, terms)}</>;
}
