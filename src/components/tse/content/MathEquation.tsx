'use client';

import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathEquationProps {
  children: string;
}

export function MathEquation({ children }: MathEquationProps) {
  return <InlineMath math={children} />;
}
