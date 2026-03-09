'use client';

import { useState, useMemo } from 'react';

// Simulated prompt tokens with importance scores
const TOKENS = [
  { text: '[System]', importance: 0.02, type: 'system' },
  { text: 'You', importance: 0.03, type: 'system' },
  { text: 'are', importance: 0.02, type: 'system' },
  { text: 'a', importance: 0.01, type: 'system' },
  { text: 'helpful', importance: 0.04, type: 'system' },
  { text: 'assistant.', importance: 0.03, type: 'system' },
  { text: 'The', importance: 0.05, type: 'context' },
  { text: 'capital', importance: 0.85, type: 'context' },
  { text: 'of', importance: 0.12, type: 'context' },
  { text: 'France', importance: 0.92, type: 'context' },
  { text: 'is', importance: 0.35, type: 'context' },
  { text: 'Paris', importance: 0.95, type: 'context' },
  { text: ',', importance: 0.04, type: 'context' },
  { text: 'which', importance: 0.15, type: 'context' },
  { text: 'is', importance: 0.08, type: 'context' },
  { text: 'known', importance: 0.22, type: 'context' },
  { text: 'for', importance: 0.06, type: 'context' },
  { text: 'the', importance: 0.05, type: 'context' },
  { text: 'Eiffel', importance: 0.78, type: 'context' },
  { text: 'Tower', importance: 0.72, type: 'context' },
  { text: 'and', importance: 0.04, type: 'context' },
  { text: 'the', importance: 0.03, type: 'context' },
  { text: 'Louvre', importance: 0.68, type: 'context' },
  { text: 'Museum.', importance: 0.55, type: 'context' },
  { text: 'The', importance: 0.06, type: 'context' },
  { text: 'city', importance: 0.42, type: 'context' },
  { text: 'has', importance: 0.05, type: 'context' },
  { text: 'a', importance: 0.02, type: 'context' },
  { text: 'rich', importance: 0.18, type: 'context' },
  { text: 'history.', importance: 0.15, type: 'context' },
  { text: '[Q]', importance: 0.88, type: 'query' },
  { text: 'What', importance: 0.75, type: 'query' },
  { text: 'is', importance: 0.45, type: 'query' },
  { text: 'the', importance: 0.30, type: 'query' },
  { text: 'capital?', importance: 0.90, type: 'query' },
];

export default function CacheCompressionDemo() {
  const [compressionRate, setCompressionRate] = useState(50);

  const { kept, discarded, keptCount, totalCount } = useMemo(() => {
    const total = TOKENS.length;
    const keepCount = Math.max(1, Math.round((compressionRate / 100) * total));

    // Sort by importance, get threshold
    const sorted = [...TOKENS].map((t, i) => ({ ...t, index: i }));
    sorted.sort((a, b) => b.importance - a.importance);
    const threshold = sorted[keepCount - 1]?.importance ?? 0;

    const keptSet = new Set<number>();
    sorted.slice(0, keepCount).forEach((t) => keptSet.add(t.index));

    return {
      kept: keptSet,
      discarded: new Set(TOKENS.map((_, i) => i).filter((i) => !keptSet.has(i))),
      keptCount: keepCount,
      totalCount: total,
    };
  }, [compressionRate]);

  return (
    <div className="concept-card mb-6">
      <div className="text-xs font-semibold text-emerald-600 mb-1">Interactive</div>
      <h3 className="font-bold text-slate-800 mb-4">SnapKV Cache Compression Demo</h3>
      <p className="text-sm text-slate-600 mb-4">
        Observation window의 attention voting 결과를 기반으로 중요한 토큰만 유지합니다.
        슬라이더로 유지 비율을 조절하면서, 어떤 토큰이 살아남고 버려지는지 확인하세요.
      </p>

      {/* Controls */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          유지 비율: <strong className="text-teal-600">{compressionRate}%</strong>
          <span className="text-slate-400 ml-2">
            ({keptCount} / {totalCount} tokens)
          </span>
        </label>
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={compressionRate}
          onChange={(e) => setCompressionRate(Number(e.target.value))}
          className="w-full max-w-md accent-teal-500"
        />
        <div className="flex justify-between text-xs text-slate-400 max-w-md mt-1">
          <span>10% (aggressive)</span>
          <span>100% (no compression)</span>
        </div>
      </div>

      {/* Token visualization */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
        <div className="text-xs text-slate-400 mb-3 font-medium">Prompt Tokens (importance에 따라 색상 표시)</div>
        <div className="flex flex-wrap gap-1.5">
          {TOKENS.map((token, i) => {
            const isKept = kept.has(i);
            const bgColor = isKept
              ? token.importance > 0.7
                ? 'bg-emerald-200 border-emerald-400 text-emerald-900'
                : token.importance > 0.3
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-slate-100 border-slate-300 text-slate-700'
              : 'bg-red-50 border-red-200 text-red-300 line-through';

            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono transition-all duration-300 ${bgColor}`}
                title={`importance: ${token.importance.toFixed(2)}`}
              >
                {token.text}
                {!isKept && (
                  <svg className="w-3 h-3 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="text-2xl font-bold text-emerald-700">{keptCount}</div>
          <div className="text-xs text-emerald-600">Kept</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">{totalCount - keptCount}</div>
          <div className="text-xs text-red-500">Discarded</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">
            {((1 - keptCount / totalCount) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-blue-600">Memory Saved</div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        높은 importance를 가진 토큰(capital, France, Paris 등)은 공격적인 압축에서도 살아남습니다.
        SnapKV는 이 패턴이 생성 전(prefill stage)에서 이미 결정됨을 보여줍니다.
      </p>
    </div>
  );
}
