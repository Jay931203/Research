'use client';

import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathBlockProps {
  children: string;
}

export function MathBlock({ children }: MathBlockProps) {
  return (
    <div className="my-4 overflow-x-auto">
      <BlockMath math={children} />
    </div>
  );
}
