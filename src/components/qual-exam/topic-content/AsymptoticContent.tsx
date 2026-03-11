'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import MathBlock from '../MathBlock';
import type { StudyTopic } from '../TopicStudyCard';

interface Props {
  topic: StudyTopic;
}

/* ── Big-O notation definitions ── */
const notations = [
  {
    symbol: 'O',
    name: 'Big-O (상한)',
    borderColor: 'border-blue-400',
    headerBg: 'bg-blue-50 dark:bg-blue-900/30',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
    latex: 'f(n) = O(g(n)) \\iff \\exists\\, c > 0,\\, n_0 : \\forall n \\ge n_0,\\; f(n) \\le c \\cdot g(n)',
    example: 'T(n) = 3n² + 5 → O(n²)',
    desc: '최악의 경우 상한. "이보다 빠르거나 같다".',
  },
  {
    symbol: 'Ω',
    name: 'Big-Omega (하한)',
    borderColor: 'border-emerald-400',
    headerBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    latex: 'f(n) = \\Omega(g(n)) \\iff \\exists\\, c > 0,\\, n_0 : \\forall n \\ge n_0,\\; f(n) \\ge c \\cdot g(n)',
    example: 'T(n) = 3n² + 5 → Ω(n²)',
    desc: '최선의 경우 하한. "이보다 느리거나 같다".',
  },
  {
    symbol: 'Θ',
    name: 'Big-Theta (정확한 점근)',
    borderColor: 'border-purple-400',
    headerBg: 'bg-purple-50 dark:bg-purple-900/30',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
    latex: 'f(n) = \\Theta(g(n)) \\iff f(n) = O(g(n)) \\text{ and } f(n) = \\Omega(g(n))',
    example: 'T(n) = 3n² + 5 → Θ(n²)',
    desc: '상한 = 하한. 정확한 성장률.',
  },
  {
    symbol: 'o',
    name: 'Little-o (strict 상한)',
    borderColor: 'border-orange-400',
    headerBg: 'bg-orange-50 dark:bg-orange-900/30',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
    latex: 'f(n) = o(g(n)) \\iff \\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = 0',
    example: 'n = o(n²)',
    desc: '엄격한 상한. f가 g보다 진짜로 더 빠름.',
  },
  {
    symbol: 'ω',
    name: 'Little-omega (strict 하한)',
    borderColor: 'border-rose-400',
    headerBg: 'bg-rose-50 dark:bg-rose-900/30',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
    latex: 'f(n) = \\omega(g(n)) \\iff \\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = \\infty',
    example: 'n² = ω(n)',
    desc: '엄격한 하한. f가 g보다 진짜로 더 느림.',
  },
];

/* ── Master Theorem cases ── */
const masterCases = [
  {
    num: 1,
    conditionText: 'f(n)이 n^(log_b a)보다 다항식적으로 작을 때',
    conditionLatex: 'f(n) = O\\!\\left(n^{\\log_b a - \\varepsilon}\\right),\\quad \\varepsilon > 0',
    resultLatex: 'T(n) = \\Theta\\!\\left(n^{\\log_b a}\\right)',
    examples: [
      { name: 'Strassen 행렬곱', rec: 'T(n) = 7T(n/2) + n²', expl: 'log₂7 ≈ 2.807 > 2 → f(n)=n² < n^2.807', result: 'Θ(n^2.807)' },
    ],
    border: 'border-blue-400 dark:border-blue-600',
    header: 'bg-blue-50 dark:bg-blue-950/40',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
  },
  {
    num: 2,
    conditionText: 'f(n)이 n^(log_b a)와 같은 차수일 때',
    conditionLatex: 'f(n) = \\Theta\\!\\left(n^{\\log_b a}\\right)',
    resultLatex: 'T(n) = \\Theta\\!\\left(n^{\\log_b a} \\cdot \\log n\\right)',
    examples: [
      { name: 'MergeSort', rec: 'T(n) = 2T(n/2) + n', expl: 'a=2, b=2, log₂2=1 → f(n)=Θ(n¹)=Θ(n^log₂2)', result: 'Θ(n log n)' },
      { name: '이진 탐색', rec: 'T(n) = T(n/2) + 1', expl: 'a=1, b=2, log₂1=0 → f(n)=Θ(1)=Θ(n⁰)', result: 'Θ(log n)' },
    ],
    border: 'border-purple-400 dark:border-purple-600',
    header: 'bg-purple-50 dark:bg-purple-950/40',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
  },
  {
    num: 3,
    conditionText: 'f(n)이 n^(log_b a)보다 다항식적으로 크고 정칙 조건 만족',
    conditionLatex: 'f(n) = \\Omega\\!\\left(n^{\\log_b a + \\varepsilon}\\right),\\quad a\\,f(n/b) \\le c\\,f(n) \\text{ for some } c<1',
    resultLatex: 'T(n) = \\Theta(f(n))',
    examples: [
      { name: '임의 분할', rec: 'T(n) = T(n/2) + n', expl: 'a=1, b=2, log₂1=0 → f(n)=Θ(n)=Ω(n^1) > n⁰', result: 'Θ(n)' },
      { name: 'T(n) = 2T(n/2) + n²', rec: '', expl: 'a=2, b=2, log₂2=1 → f(n)=n² > n¹', result: 'Θ(n²)' },
    ],
    border: 'border-amber-400 dark:border-amber-600',
    header: 'bg-amber-50 dark:bg-amber-950/40',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
  },
] as const;

/* ── Recurrence reference table ── */
const recurrenceRows = [
  { algo: '이진 탐색 (Binary Search)', rec: 'T(n) = T(n/2) + 1',      params: 'a=1, b=2, log₂1=0', caseNum: 2, result: 'Θ(log n)' },
  { algo: 'MergeSort',                  rec: 'T(n) = 2T(n/2) + n',      params: 'a=2, b=2, log₂2=1', caseNum: 2, result: 'Θ(n log n)' },
  { algo: 'Build-Heap',                 rec: 'T(n) = 2T(n/2) + log n',  params: 'log n = o(n), Case 1', caseNum: 1, result: 'Θ(n)' },
  { algo: 'Strassen 행렬곱',            rec: 'T(n) = 7T(n/2) + n²',     params: 'log₂7 ≈ 2.807 > 2', caseNum: 1, result: 'Θ(n^2.807)' },
  { algo: '임의 분할 알고리즘',        rec: 'T(n) = T(n/2) + n',        params: 'log₂1=0, f(n)=n > n⁰', caseNum: 3, result: 'Θ(n)' },
  { algo: 'QuickSort (최악)',           rec: 'T(n) = T(n-1) + n',        params: '마스터 정리 미적용', caseNum: -1, result: 'Θ(n²)' },
  { algo: '피보나치 재귀',              rec: 'T(n) = T(n-1) + T(n-2)',   params: '마스터 정리 미적용', caseNum: -1, result: 'Θ(φⁿ) ≈ Θ(1.618ⁿ)' },
];

/* ── Key properties ── */
const properties = [
  { rule: '전이성',         latex: 'f = O(g),\\; g = O(h) \\Rightarrow f = O(h)' },
  { rule: '합의 법칙',      latex: 'O(f) + O(g) = O(\\max(f, g))' },
  { rule: '곱의 법칙',      latex: 'O(f) \\cdot O(g) = O(f \\cdot g)' },
  { rule: '다항식',         latex: 'a_k n^k + \\cdots + a_0 = O(n^k)' },
  { rule: '로그 밑 변환',   latex: '\\log_a n = \\Theta(\\log_b n)' },
  { rule: '지수 > 다항',    latex: 'n^k = o(2^n) \\text{ for any fixed } k' },
];

const difficultyLabel = { basic: '기초', intermediate: '중급', advanced: '고급' };
const difficultyColor = {
  basic: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  advanced: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300',
};

/* ── Recurrence Tree SVG component ── */
function RecurrenceTree({ mtA, mtB, mtK }: { mtA: number; mtB: number; mtK: number }) {
  const tree = useMemo(() => {
    const a = mtA;
    const b = mtB;
    const k = mtK;
    // Limit a to reasonable display (max 4 children per node shown)
    const displayA = Math.min(a, 4);
    const truncated = a > 4;

    // SVG dimensions
    const svgW = 700;
    const levelH = 80;
    const nodeR = 22;
    const levels = 3; // show levels 0, 1, 2

    // Per-level data
    const levelData = Array.from({ length: levels }, (_, lvl) => {
      const nodes = Math.pow(a, lvl);
      const sizeLabel = lvl === 0 ? 'n' : (b ** lvl === b ? `n/${b}` : `n/${b ** lvl}`);
      // work per node: c * (n/b^lvl)^k  → we show symbolically
      const workPerNode = lvl === 0
        ? (k === 0 ? 'c' : k === 1 ? 'cn' : `cn^${k}`)
        : (k === 0 ? 'c' : k === 1 ? `cn/${b ** lvl}` : `c(n/${b ** lvl})^${k}`);
      // total work at level: a^lvl * c * (n/b^lvl)^k = c * (a/b^k)^lvl * n^k
      const ratio = a / Math.pow(b, k);
      const totalWorkFactor = Math.pow(ratio, lvl);
      const totalLabel = k === 0
        ? (lvl === 0 ? 'c' : `${nodes}c`)
        : `${totalWorkFactor === 1 ? '' : (Number.isInteger(totalWorkFactor) ? totalWorkFactor : totalWorkFactor.toFixed(2))}${k === 0 ? 'c' : (k === 1 ? 'cn' : `cn^${k}`)}`;

      return { nodes, displayNodes: Math.min(nodes, Math.pow(displayA, lvl)), sizeLabel, workPerNode, totalLabel, lvl };
    });

    return { svgW, levelH, nodeR, levels, levelData, displayA, truncated, a };
  }, [mtA, mtB, mtK]);

  const { svgW, levelH, nodeR, levels, levelData, displayA, truncated, a } = tree;
  const svgH = levels * levelH + 50;

  // Compute node positions per level
  const nodePositions = useMemo(() => {
    const positions: { x: number; y: number; label: string }[][] = [];
    for (let lvl = 0; lvl < levels; lvl++) {
      const y = 30 + lvl * levelH;
      const dispN = levelData[lvl].displayNodes;
      const treeWidth = svgW - 180; // leave room for cost labels on right
      const spacing = treeWidth / (dispN + 1);
      const row: { x: number; y: number; label: string }[] = [];
      for (let i = 0; i < dispN; i++) {
        row.push({
          x: 30 + spacing * (i + 1),
          y,
          label: levelData[lvl].sizeLabel,
        });
      }
      positions.push(row);
    }
    return positions;
  }, [levels, levelH, levelData, svgW]);

  return (
    <div className="mt-5 rounded-xl border-2 border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="bg-teal-50 dark:bg-teal-950/40 px-5 py-3 border-b border-teal-200 dark:border-teal-800">
        <p className="text-sm font-bold text-teal-800 dark:text-teal-200">
          🌳 재귀 트리 시각화
        </p>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
          T(n) = {mtA}T(n/{mtB}) + n^{mtK} 의 처음 3레벨 — 위 판별기와 연동됩니다
        </p>
      </div>
      <div className="px-4 py-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full max-w-[700px] mx-auto"
          style={{ minWidth: 400 }}
        >
          {/* Edges: connect parent to children */}
          {nodePositions.slice(0, -1).map((parentRow, lvl) =>
            parentRow.map((parent, pi) => {
              const childRow = nodePositions[lvl + 1];
              // Each parent at index pi has displayA children starting at pi * displayA
              const childStart = pi * Math.min(a, displayA);
              return Array.from({ length: Math.min(displayA, childRow.length - childStart) }, (_, ci) => {
                const child = childRow[childStart + ci];
                if (!child) return null;
                return (
                  <line
                    key={`e-${lvl}-${pi}-${ci}`}
                    x1={parent.x}
                    y1={parent.y + nodeR}
                    x2={child.x}
                    y2={child.y - nodeR}
                    className="stroke-slate-300 dark:stroke-slate-600"
                    strokeWidth={1.5}
                  />
                );
              });
            })
          )}

          {/* Nodes */}
          {nodePositions.map((row, lvl) =>
            row.map((node, ni) => (
              <g key={`n-${lvl}-${ni}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeR}
                  className={`${
                    lvl === 0
                      ? 'fill-indigo-100 stroke-indigo-400 dark:fill-indigo-900/60 dark:stroke-indigo-500'
                      : lvl === 1
                      ? 'fill-sky-100 stroke-sky-400 dark:fill-sky-900/60 dark:stroke-sky-500'
                      : 'fill-emerald-100 stroke-emerald-400 dark:fill-emerald-900/60 dark:stroke-emerald-500'
                  }`}
                  strokeWidth={2}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-700 dark:fill-slate-200 text-[10px] font-mono font-bold"
                  style={{ fontSize: 10 }}
                >
                  {node.label}
                </text>
              </g>
            ))
          )}

          {/* Truncation indicator (...) if a > 4 */}
          {truncated && nodePositions.slice(1).map((row, lvl) => {
            const last = row[row.length - 1];
            if (!last) return null;
            return (
              <text
                key={`trunc-${lvl}`}
                x={last.x + nodeR + 12}
                y={last.y + 1}
                className="fill-slate-400 dark:fill-slate-500 text-[11px] font-mono"
                style={{ fontSize: 11 }}
                dominantBaseline="middle"
              >
                ...
              </text>
            );
          })}

          {/* Level labels + total cost on the right */}
          {levelData.map((ld, lvl) => {
            const y = 30 + lvl * levelH;
            return (
              <g key={`label-${lvl}`}>
                <text
                  x={svgW - 10}
                  y={y - 8}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500 text-[9px]"
                  style={{ fontSize: 9 }}
                >
                  Level {lvl}: {ld.nodes}개 노드
                </text>
                <text
                  x={svgW - 10}
                  y={y + 8}
                  textAnchor="end"
                  className="fill-indigo-600 dark:fill-indigo-400 text-[10px] font-bold font-mono"
                  style={{ fontSize: 10 }}
                >
                  = {ld.totalLabel}
                </text>
              </g>
            );
          })}

          {/* Bottom: total levels note */}
          <text
            x={svgW / 2 - 60}
            y={svgH - 10}
            className="fill-slate-400 dark:fill-slate-500 text-[10px]"
            style={{ fontSize: 10 }}
            textAnchor="middle"
          >
            총 깊이 = log_{mtB}(n) 레벨, 리프 수 = n^(log_{mtB}({mtA}))
          </text>
        </svg>

        {/* Level cost summary table */}
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700/60">
                <th className="px-3 py-1.5 text-left font-bold text-slate-600 dark:text-slate-300">레벨</th>
                <th className="px-3 py-1.5 text-left font-bold text-slate-600 dark:text-slate-300">노드 수</th>
                <th className="px-3 py-1.5 text-left font-bold text-slate-600 dark:text-slate-300">노드당 비용</th>
                <th className="px-3 py-1.5 text-left font-bold text-slate-600 dark:text-slate-300">레벨 합계</th>
              </tr>
            </thead>
            <tbody>
              {levelData.map((ld, i) => (
                <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-3 py-1.5 font-mono text-slate-600 dark:text-slate-400">{ld.lvl}</td>
                  <td className="px-3 py-1.5 font-mono text-slate-600 dark:text-slate-400">{ld.nodes}</td>
                  <td className="px-3 py-1.5 font-mono text-slate-600 dark:text-slate-400">{ld.workPerNode}</td>
                  <td className="px-3 py-1.5 font-mono font-bold text-indigo-700 dark:text-indigo-300">{ld.totalLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AsymptoticContent({ topic }: Props) {
  const [openCards, setOpenCards] = useState<Set<string>>(() => new Set(notations.map(nt => nt.symbol)));

  /* ── Master Theorem Classifier state ── */
  const [mtA, setMtA] = useState(2);
  const [mtB, setMtB] = useState(2);
  const [mtK, setMtK] = useState(0); // f(n) = n^k

  const mtResult = useMemo(() => {
    if (mtA < 1 || mtB <= 1) return { valid: false as const };
    const logBA = Math.log(mtA) / Math.log(mtB);
    const epsilon = 0.0001;
    let caseNum: 1 | 2 | 3;
    let resultLatex: string;
    let comparison: string;

    if (mtK < logBA - epsilon) {
      caseNum = 1;
      const logBAStr = Number.isInteger(logBA) ? logBA.toString() : logBA.toFixed(3);
      resultLatex = `T(n) = \\Theta\\!\\left(n^{${logBAStr}}\\right)`;
      comparison = `k = ${mtK} < log_b(a) = ${logBAStr}`;
    } else if (Math.abs(mtK - logBA) <= epsilon) {
      caseNum = 2;
      if (mtK === 0) {
        resultLatex = `T(n) = \\Theta(\\log n)`;
      } else {
        resultLatex = `T(n) = \\Theta\\!\\left(n^{${mtK}} \\cdot \\log n\\right)`;
      }
      const logBAStr = Number.isInteger(logBA) ? logBA.toString() : logBA.toFixed(3);
      comparison = `k = ${mtK} = log_b(a) = ${logBAStr}`;
    } else {
      caseNum = 3;
      resultLatex = `T(n) = \\Theta\\!\\left(n^{${mtK}}\\right)`;
      const logBAStr = Number.isInteger(logBA) ? logBA.toString() : logBA.toFixed(3);
      comparison = `k = ${mtK} > log_b(a) = ${logBAStr}`;
    }

    return { valid: true as const, logBA, caseNum, resultLatex, comparison };
  }, [mtA, mtB, mtK]);

  return (
    <div className="max-w-5xl mx-auto space-y-10 px-6 py-6">

      {/* ── Hero ── */}
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <span className="text-5xl leading-none">{topic.icon}</span>
          {topic.studyOrder != null && (
            <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow">
              {topic.studyOrder}
            </span>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${difficultyColor[topic.difficulty]}`}>
              {difficultyLabel[topic.difficulty]}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`h-3.5 w-3.5 ${i < topic.examFrequency ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-[10px] text-slate-400">출제빈도</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{topic.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{topic.titleEn}</p>
          {topic.summary && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{topic.summary}</p>
          )}
        </div>
      </div>

      {/* ── Big-O 5종 ── */}
      <section id={`${topic.id}-sec-notations`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📐</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">점근 표기법 5종</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="space-y-2">
          {notations.map(nt => {
            const isOpen = openCards.has(nt.symbol);
            return (
              <div key={nt.symbol} className={`rounded-xl border-2 overflow-hidden ${nt.borderColor} bg-white dark:bg-slate-900`}>
                <button
                  onClick={() => setOpenCards(prev => { const next = new Set(prev); if (next.has(nt.symbol)) next.delete(nt.symbol); else next.add(nt.symbol); return next; })}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left ${nt.headerBg} transition`}
                >
                  <span className={`rounded-lg px-3 py-1 text-sm font-black font-mono ${nt.badge} flex-shrink-0`}>
                    {nt.symbol}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{nt.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{nt.desc}</p>
                  </div>
                  {isOpen
                    ? <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    : <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  }
                </button>
                {isOpen && (
                  <div className="px-5 py-4 space-y-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    {/* KaTeX on light bg so it's visible in both modes */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 overflow-x-auto text-slate-900 dark:text-slate-100">
                      <MathBlock latex={nt.latex} block />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">예시:</span>
                      <code className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-700 dark:text-slate-200">
                        {nt.example}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 핵심 성질 ── */}
      <section id={`${topic.id}-sec-properties`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚡</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">핵심 성질</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">성질</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">수식</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium text-xs whitespace-nowrap">{p.rule}</td>
                  <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100">
                    <div className="overflow-x-auto">
                      <MathBlock latex={p.latex} block />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 마스터 정리 ── */}
      <section id={`${topic.id}-sec-master`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">👑</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">마스터 정리 (Master Theorem)</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* 기본 형태 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 mb-5">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            분할 정복 점화식 일반형 (a ≥ 1, b &gt; 1)
          </p>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 overflow-x-auto">
            <MathBlock latex={String.raw`T(n) = a\,T\!\left(\tfrac{n}{b}\right) + f(n)`} block />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 px-3 py-2">
              <p className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">a</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">부분문제 수</p>
            </div>
            <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 px-3 py-2">
              <p className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">n/b</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">각 부분문제 크기</p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 px-3 py-2">
              <p className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">f(n)</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">분할+합병 비용</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 px-3 py-2">
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              <span className="font-bold">핵심 기준값:</span>{' '}
              <span className="font-mono">n^(log_b a)</span> 와 <span className="font-mono">f(n)</span> 의 크기를 비교하여 3가지 케이스 중 하나를 적용
            </p>
          </div>
        </div>

        {/* 3 Cases */}
        <div className="space-y-3">
          {masterCases.map(mc => (
            <div key={mc.num} className={`rounded-xl border-2 overflow-hidden ${mc.border} bg-white dark:bg-slate-900`}>
              <div className={`${mc.header} px-4 py-3 flex items-start gap-3`}>
                <span className={`flex-shrink-0 rounded-lg px-3 py-1 text-sm font-black ${mc.badge}`}>
                  Case {mc.num}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">{mc.conditionText}</p>
                  <div className="overflow-x-auto mt-1 rounded bg-white/60 dark:bg-slate-900/60 px-2 py-1">
                    <MathBlock latex={mc.conditionLatex} block />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 space-y-3 border-t border-slate-100 dark:border-slate-800">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 overflow-x-auto">
                  <MathBlock latex={mc.resultLatex} block />
                </div>
                {mc.examples.length > 0 && (
                  <div className="space-y-1.5">
                    {mc.examples.map((ex, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400 flex-shrink-0 mt-0.5">예)</span>
                        <div className="leading-relaxed">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{ex.name}</span>
                          {ex.rec && (
                            <code className="ml-1 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-200">
                              {ex.rec}
                            </code>
                          )}
                          <span className="ml-1 text-slate-400">— {ex.expl}</span>
                          <span className="ml-1 font-bold text-blue-600 dark:text-blue-400">→ {ex.result}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 주의사항 */}
        <div className="mt-4 rounded-xl border border-orange-200 dark:border-orange-800/40 bg-orange-50 dark:bg-orange-900/10 px-4 py-3">
          <p className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-1.5">⚠ 마스터 정리 적용 불가 경우</p>
          <ul className="space-y-1 text-xs text-orange-700 dark:text-orange-300">
            <li>• <code className="font-mono">T(n) = T(n-1) + n</code> — 부분문제 크기가 n/b 형태가 아님 (등차 감소)</li>
            <li>• <code className="font-mono">T(n) = T(n-1) + T(n-2)</code> — 피보나치, 비균등 분할</li>
            <li>• f(n)이 3가지 케이스 어느 것에도 해당 안 될 때 (gap 존재 시)</li>
            <li>• a &lt; 1 또는 b ≤ 1 일 때</li>
          </ul>
        </div>

        {/* ── 마스터 정리 인터랙티브 판별기 ── */}
        <div className="mt-5 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="bg-indigo-50 dark:bg-indigo-950/40 px-5 py-3 border-b border-indigo-200 dark:border-indigo-800">
            <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
              🧮 마스터 정리 인터랙티브 판별기
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              a, b, k 값을 입력하면 어떤 케이스가 적용되는지 자동으로 판별합니다
            </p>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* 점화식 표시 */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 overflow-x-auto text-center">
              <MathBlock
                latex={String.raw`T(n) = ${mtA}\,T\!\left(\tfrac{n}{${mtB}}\right) + n^{${mtK}}`}
                block
              />
            </div>

            {/* 입력 컨트롤 */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  a <span className="font-normal text-slate-400">(부분문제 수)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={mtA}
                  onChange={e => setMtA(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  b <span className="font-normal text-slate-400">(분할 계수)</span>
                </label>
                <input
                  type="number"
                  min={2}
                  max={99}
                  value={mtB}
                  onChange={e => setMtB(Math.max(2, Number(e.target.value) || 2))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  f(n) = n^k <span className="font-normal text-slate-400">(k 값)</span>
                </label>
                <select
                  value={mtK}
                  onChange={e => setMtK(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600"
                >
                  <option value={0}>n^0 = 1 (상수)</option>
                  <option value={1}>n^1 = n</option>
                  <option value={2}>n^2</option>
                  <option value={3}>n^3</option>
                </select>
              </div>
            </div>

            {/* 프리셋 버튼 */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 self-center mr-1">프리셋:</span>
              {[
                { label: 'MergeSort', a: 2, b: 2, k: 1 },
                { label: 'Binary Search', a: 1, b: 2, k: 0 },
                { label: 'Strassen', a: 7, b: 2, k: 2 },
                { label: 'Karatsuba', a: 3, b: 2, k: 1 },
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => { setMtA(preset.a); setMtB(preset.b); setMtK(preset.k); }}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/30 dark:hover:border-indigo-700 transition"
                >
                  {preset.label}
                  <span className="ml-1 text-slate-400 font-mono text-[10px]">
                    ({preset.a},{preset.b},{preset.k})
                  </span>
                </button>
              ))}
            </div>

            {/* 판별 결과 */}
            {!mtResult.valid ? (
              <div className="rounded-lg border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 px-4 py-3">
                <p className="text-sm font-bold text-red-700 dark:text-red-400">
                  적용 불가: a &ge; 1, b &gt; 1 이어야 합니다
                </p>
              </div>
            ) : (
              <div className={`rounded-lg border-2 px-4 py-3 space-y-2 ${
                mtResult.caseNum === 1 ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30' :
                mtResult.caseNum === 2 ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30' :
                'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30'
              }`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">판별 결과:</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                    mtResult.caseNum === 1 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200' :
                    mtResult.caseNum === 2 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                  }`}>
                    Case {mtResult.caseNum}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    <span className="font-mono font-semibold">log_{mtB}({mtA})</span>
                    {' = '}
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                      {Number.isInteger(mtResult.logBA) ? mtResult.logBA : mtResult.logBA.toFixed(3)}
                    </span>
                  </p>
                  <p>
                    <span className="font-mono">f(n) = n^{mtK}</span>
                    {' → '}
                    <span className="font-semibold">{mtResult.comparison}</span>
                  </p>
                </div>
                <div className="rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 px-3 py-2 overflow-x-auto">
                  <MathBlock latex={mtResult.resultLatex} block />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 분할 상환 분석 ── */}
      <section id={`${topic.id}-sec-amortized`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏦</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">분할 상환 분석 (Amortized Analysis)</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 mb-5">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">핵심 아이디어</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            일부 연산이 비싸더라도, <span className="font-semibold">연산 전체 시퀀스에 걸쳐 평균 비용</span>이 작으면 전체 알고리즘은 효율적이다.
            최악 케이스 분석보다 정밀하게 실질적 성능을 표현할 수 있다.
          </p>
        </div>

        {/* 3가지 방법 */}
        <div className="space-y-3 mb-5">
          {[
            {
              name: '집계법 (Aggregate Analysis)',
              badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
              border: 'border-blue-200 dark:border-blue-800/40',
              bg: 'bg-blue-50 dark:bg-blue-950/20',
              desc: 'n번 연산의 전체 비용 T(n)을 계산하고, 분할 상환 비용 = T(n)/n 으로 정의.',
              example: 'Dynamic Array push_back: 대부분 O(1), 가끔 O(n) 복사 → 전체 n번 push_back 비용 = O(n) → 분할 상환 O(1)',
            },
            {
              name: '회계법 (Accounting Method)',
              badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
              border: 'border-purple-200 dark:border-purple-800/40',
              bg: 'bg-purple-50 dark:bg-purple-950/20',
              desc: '각 연산에 "분할 상환 비용(amortized cost)"을 부여. 실제 비용보다 많이 낼 때는 크레딧을 저축하고, 비싼 연산 시 크레딧을 소비.',
              example: 'push_back: 분할 상환 3 부여 (삽입 1 + 미래 복사 대비 2 저축). 복사 시 저축된 크레딧으로 충당 → 총 비용 O(n)',
            },
            {
              name: '잠재법 (Potential Method)',
              badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
              border: 'border-amber-200 dark:border-amber-800/40',
              bg: 'bg-amber-50 dark:bg-amber-950/20',
              desc: '자료구조의 "잠재 에너지" Φ를 정의. 분할 상환 비용 = 실제 비용 + ΔΦ (잠재 에너지 변화량).',
              example: 'Φ = 현재 원소 수로 정의. push_back 분할 상환 비용 = 1 + 1 = 2 = O(1). 복사 시 Φ 절반 감소해 실제 비용 상쇄.',
            },
          ].map(m => (
            <div key={m.name} className={`rounded-xl border-2 ${m.border} overflow-hidden bg-white dark:bg-slate-900`}>
              <div className={`${m.bg} px-4 py-3 flex items-center gap-3`}>
                <span className={`rounded-lg px-3 py-1 text-xs font-black ${m.badge} flex-shrink-0`}>{m.name}</span>
              </div>
              <div className="px-4 py-3 space-y-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-700 dark:text-slate-300">{m.desc}</p>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">예시:</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{m.example}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Array 핵심 */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 mb-4">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2 uppercase tracking-wide">
            대표 예시 — Dynamic Array (동적 배열)
          </p>
          <div className="space-y-1.5 text-xs text-emerald-700 dark:text-emerald-400">
            <p>• 배열이 꽉 차면 크기를 <span className="font-semibold">2배로 확장</span>하고 모든 원소를 복사 (비용 O(n))</p>
            <p>• n번 push_back 전체 복사 비용: n/2 + n/4 + n/8 + ... ≤ n → <span className="font-semibold">분할 상환 O(1)</span></p>
            <p>• 크기를 2배 대신 상수 k씩 늘리면? → 전체 비용 O(n²) → 분할 상환 O(n) — 지수 성장이 핵심!</p>
          </div>
        </div>

        {/* Worst vs Amortized */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                {['자료구조 / 연산', '최악 케이스', '분할 상환'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { ds: 'Dynamic Array push_back', worst: 'O(n)', amort: 'O(1)' },
                { ds: 'Splay Tree 탐색',         worst: 'O(n)', amort: 'O(log n)' },
                { ds: 'Union-Find (경로 압축)',   worst: 'O(log n)', amort: 'O(α(n)) ≈ O(1)' },
                { ds: 'Fibonacci Heap 삽입',      worst: 'O(1)', amort: 'O(1)' },
                { ds: 'Fibonacci Heap decrease-key', worst: 'O(log n)', amort: 'O(1)' },
              ].map((row, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium text-xs">{row.ds}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">{row.worst}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs">{row.amort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 점화식 예시 테이블 ── */}
      <section id={`${topic.id}-sec-recurrence`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔁</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">주요 알고리즘 점화식 정리</h2>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">알고리즘</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">점화식</th>
                <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 dark:text-slate-300">케이스</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 dark:text-slate-300">결과</th>
              </tr>
            </thead>
            <tbody>
              {recurrenceRows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium text-xs whitespace-nowrap">{row.algo}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600 dark:text-slate-400">{row.rec}</td>
                  <td className="px-4 py-2.5 text-center">
                    {row.caseNum > 0 ? (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        row.caseNum === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                        row.caseNum === 2 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>Case {row.caseNum}</span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">미적용</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono font-bold text-blue-700 dark:text-blue-300 text-xs">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400 text-right">
          케이스 색: <span className="text-blue-600 font-semibold">파랑=1</span> · <span className="text-purple-600 font-semibold">보라=2</span> · <span className="text-amber-600 font-semibold">주황=3</span>
        </p>

        {/* ── 재귀 트리 시각화 ── */}
        <RecurrenceTree mtA={mtA} mtB={mtB} mtK={mtK} />
      </section>
    </div>
  );
}
