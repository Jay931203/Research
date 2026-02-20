'use client';

import { useState, useCallback } from 'react';
import type { StudyTopic } from '../TopicStudyCard';

interface Props { topic: StudyTopic; }

const difficultyLabel = { basic: '기초', intermediate: '중급', advanced: '고급' };
const difficultyColor = {
  basic: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300',
  intermediate: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
  advanced: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300',
};

const M = 7; // hash table size

function SH({ emoji, title, id }: { emoji: string; title: string; id: string }) {
  return (
    <div id={id} className="flex items-center gap-2 mb-4">
      <span className="text-xl">{emoji}</span>
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

/* ── Load Factor Gauge ── */
function LoadGauge({ n, m }: { n: number; m: number }) {
  const alpha = m === 0 ? 0 : n / m;
  const pct = Math.min(100, Math.round(alpha * 100));
  const color = alpha < 0.5 ? 'bg-emerald-500' : alpha < 0.7 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = alpha < 0.5 ? 'text-emerald-700 dark:text-emerald-300' : alpha < 0.7 ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300';
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
          α = n/m = {n}/{m} = {alpha.toFixed(2)}
        </span>
        <span className={`text-xs font-bold ${textColor}`}>
          {alpha < 0.5 ? '양호' : alpha < 0.7 ? '주의' : '과부하'}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Slot color palette ── */
const PILL_COLORS = [
  'bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500',
  'bg-rose-500','bg-teal-500','bg-pink-500','bg-indigo-500',
  'bg-cyan-500','bg-orange-500',
];

export default function HashContent({ topic }: Props) {
  /* ── Chaining state ── */
  const [chainTable, setChainTable] = useState<number[][]>(Array.from({ length: M }, () => []));
  const [chainInput, setChainInput] = useState('');
  const [chainHighlight, setChainHighlight] = useState<number | null>(null);
  const [chainLog, setChainLog] = useState('');
  const [chainError, setChainError] = useState('');
  const [chainColorMap, setChainColorMap] = useState<Record<number, string>>({});
  const [chainColorIdx, setChainColorIdx] = useState(0);

  /* ── Chain: insert ── */
  const handleChainInsert = useCallback(() => {
    setChainError('');
    const num = parseInt(chainInput, 10);
    if (isNaN(num)) { setChainError('정수를 입력하세요'); return; }
    const slot = ((num % M) + M) % M;
    const totalKeys = chainTable.reduce((s, c) => s + c.length, 0);
    if (totalKeys >= 14) { setChainError('최대 14개까지 삽입 가능합니다'); return; }
    setChainTable(prev => prev.map((chain, i) => i === slot ? [num, ...chain] : chain));
    setChainColorMap(prev => ({ ...prev, [num]: PILL_COLORS[chainColorIdx % PILL_COLORS.length] }));
    setChainColorIdx(i => i + 1);
    setChainHighlight(slot);
    setChainLog(`h(${num}) = ${num} mod ${M} = ${slot} → slot ${slot}에 삽입`);
    setChainInput('');
    setTimeout(() => setChainHighlight(null), 1200);
  }, [chainInput, chainTable, chainColorIdx]);

  /* ── Chain: delete (remove first occurrence) ── */
  const handleChainDelete = useCallback(() => {
    setChainError('');
    const num = parseInt(chainInput, 10);
    if (isNaN(num)) { setChainError('정수를 입력하세요'); return; }
    const slot = ((num % M) + M) % M;
    if (!chainTable[slot].includes(num)) { setChainError(`${num}을 찾을 수 없습니다`); return; }
    setChainTable(prev => prev.map((chain, i) => i === slot ? chain.filter(v => v !== num) : chain));
    setChainLog(`h(${num}) = ${slot} → slot ${slot}에서 삭제`);
    setChainInput('');
    setChainHighlight(slot);
    setTimeout(() => setChainHighlight(null), 1000);
  }, [chainInput, chainTable]);

  /* ── Chain: reset ── */
  const handleChainReset = useCallback(() => {
    setChainTable(Array.from({ length: M }, () => []));
    setChainHighlight(null);
    setChainLog('');
    setChainError('');
    setChainColorMap({});
    setChainColorIdx(0);
  }, []);

  const chainTotal = chainTable.reduce((s, c) => s + c.length, 0);

  /* ── Linear Probing state ── */
  type SlotState = 'empty' | 'deleted' | number;
  const [probeTable, setProbeTable] = useState<SlotState[]>(Array(M).fill('empty'));
  const [probeInput, setProbeInput] = useState('');
  const [probeHighlight, setProbeHighlight] = useState<{ idx: number; type: 'probing' | 'found' | 'inserted' | 'deleted' | 'notfound' }[]>([]);
  const [probeLog, setProbeLog] = useState('');
  const [probeError, setProbeError] = useState('');
  const [probeRunning, setProbeRunning] = useState(false);

  const probeCount = probeTable.filter(s => typeof s === 'number').length;

  /* ── Probe: insert ── */
  const handleProbeInsert = useCallback(() => {
    if (probeRunning) return;
    setProbeError('');
    const num = parseInt(probeInput, 10);
    if (isNaN(num)) { setProbeError('정수를 입력하세요'); return; }
    if (probeTable.includes(num)) { setProbeError(`${num}은 이미 존재합니다`); return; }
    const emptyOrDeleted = probeTable.filter(s => s === 'empty' || s === 'deleted').length;
    if (emptyOrDeleted === 0) { setProbeError('테이블이 가득 찼습니다'); return; }

    setProbeRunning(true);
    setProbeInput('');
    const start = ((num % M) + M) % M;
    const steps: { idx: number; type: 'probing' | 'found' | 'inserted' | 'deleted' | 'notfound' }[] = [];
    let insertIdx = -1;
    let firstDeleted = -1;

    for (let k = 0; k < M; k++) {
      const idx = (start + k) % M;
      const slot = probeTable[idx];
      if (slot === 'empty') {
        const target = firstDeleted >= 0 ? firstDeleted : idx;
        steps.push({ idx, type: 'probing' });
        insertIdx = target;
        break;
      } else if (slot === 'deleted') {
        steps.push({ idx, type: 'probing' });
        if (firstDeleted < 0) firstDeleted = idx;
      } else {
        steps.push({ idx, type: 'probing' });
      }
    }
    if (insertIdx < 0 && firstDeleted >= 0) insertIdx = firstDeleted;

    let i = 0;
    const run = () => {
      if (i < steps.length) {
        setProbeHighlight(steps.slice(0, i + 1));
        i++;
        setTimeout(run, 450);
      } else if (insertIdx >= 0) {
        setProbeTable(prev => prev.map((s, idx) => idx === insertIdx ? num : s));
        setProbeHighlight([{ idx: insertIdx, type: 'inserted' }]);
        setProbeLog(`h(${num})=${start}, 탐침 후 slot ${insertIdx}에 삽입`);
        setProbeRunning(false);
        setTimeout(() => setProbeHighlight([]), 1000);
      } else {
        setProbeLog(`삽입 실패: 테이블 가득 참`);
        setProbeRunning(false);
      }
    };
    run();
  }, [probeInput, probeTable, probeRunning]);

  /* ── Probe: delete ── */
  const handleProbeDelete = useCallback(() => {
    if (probeRunning) return;
    setProbeError('');
    const num = parseInt(probeInput, 10);
    if (isNaN(num)) { setProbeError('정수를 입력하세요'); return; }
    const start = ((num % M) + M) % M;
    let found = -1;
    for (let k = 0; k < M; k++) {
      const idx = (start + k) % M;
      if (probeTable[idx] === 'empty') break;
      if (probeTable[idx] === num) { found = idx; break; }
    }
    if (found < 0) { setProbeError(`${num}을 찾을 수 없습니다`); return; }
    setProbeTable(prev => prev.map((s, i) => i === found ? 'deleted' : s));
    setProbeHighlight([{ idx: found, type: 'deleted' }]);
    setProbeLog(`slot ${found}에서 ${num} 삭제 → DELETED 표시`);
    setProbeInput('');
    setTimeout(() => setProbeHighlight([]), 1200);
  }, [probeInput, probeTable, probeRunning]);

  /* ── Probe: search ── */
  const handleProbeSearch = useCallback(() => {
    if (probeRunning) return;
    setProbeError('');
    const num = parseInt(probeInput, 10);
    if (isNaN(num)) { setProbeError('정수를 입력하세요'); return; }
    setProbeRunning(true);
    const start = ((num % M) + M) % M;
    const steps: { idx: number; type: 'probing' | 'found' | 'inserted' | 'deleted' | 'notfound' }[] = [];
    let resultType: 'found' | 'notfound' = 'notfound';
    let resultIdx = -1;
    for (let k = 0; k < M; k++) {
      const idx = (start + k) % M;
      if (probeTable[idx] === 'empty') { steps.push({ idx, type: 'probing' }); break; }
      if (probeTable[idx] === num) { steps.push({ idx, type: 'found' }); resultType = 'found'; resultIdx = idx; break; }
      steps.push({ idx, type: 'probing' });
    }
    let i = 0;
    const run = () => {
      if (i < steps.length) {
        setProbeHighlight(steps.slice(0, i + 1));
        i++;
        setTimeout(run, 450);
      } else {
        if (resultType === 'found') {
          setProbeHighlight([{ idx: resultIdx, type: 'found' }]);
          setProbeLog(`${num} 발견! slot ${resultIdx}`);
        } else {
          setProbeLog(`${num} 없음`);
        }
        setProbeRunning(false);
        setTimeout(() => setProbeHighlight([]), 1200);
      }
    };
    run();
  }, [probeInput, probeTable, probeRunning]);

  const handleProbeReset = useCallback(() => {
    setProbeTable(Array(M).fill('empty'));
    setProbeHighlight([]);
    setProbeLog('');
    setProbeError('');
    setProbeRunning(false);
  }, []);

  const slotStyle = (idx: number): string => {
    const hl = probeHighlight.find(h => h.idx === idx);
    if (hl) {
      if (hl.type === 'probing') return 'border-amber-400 bg-amber-50 dark:bg-amber-900/20';
      if (hl.type === 'inserted') return 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
      if (hl.type === 'found') return 'border-blue-400 bg-blue-50 dark:bg-blue-900/20';
      if (hl.type === 'deleted') return 'border-red-400 bg-red-50 dark:bg-red-900/20';
    }
    return 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 px-6 py-6">
      {/* Hero */}
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

      {/* 1. 개념 */}
      <section>
        <SH emoji="📖" title="해시 함수 개념 + 부하율" id={`${topic.id}-sec-concept`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">핵심 아이디어</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            해시 테이블의 목표: 키(key)를 O(1)에 값(value)으로 변환. 충돌(Collision)은 피할 수 없다 (비둘기집 원리): 키 공간(무한) &gt; 해시 테이블 크기(유한) → 반드시 충돌 발생. 따라서 충돌 처리 방법이 핵심.
          </p>
          <ul className="mt-2.5 space-y-1 text-xs text-amber-700 dark:text-amber-400">
            <li>• <span className="font-semibold">결정론적</span>: 같은 키 → 항상 같은 해시값</li>
            <li>• <span className="font-semibold">균등 분포</span>: 해시값이 테이블 전체에 고르게 분포</li>
            <li>• <span className="font-semibold">빠른 계산</span>: O(1)에 계산 가능</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: '해시 함수', icon: 'h(k)', desc: 'key → 배열 인덱스 매핑. h(k) = k mod m (나눗셈법)', color: 'border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/20' },
            { label: '부하율 α', icon: 'n/m', desc: 'n=저장 항목 수, m=슬롯 수. α가 클수록 충돌 증가', color: 'border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20' },
            { label: '충돌(Collision)', icon: '!!', desc: 'h(k1)=h(k2)인데 k1≠k2. 피할 수 없음, 처리 방법이 중요', color: 'border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/20' },
          ].map(c => (
            <div key={c.label} className={`rounded-xl border-2 p-4 ${c.color}`}>
              <div className="font-mono text-xl font-black text-slate-700 dark:text-slate-200 mb-1">{c.icon}</div>
              <div className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">{c.label}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">{c.desc}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 dark:border-violet-800/40 dark:bg-violet-950/20 p-4 mb-5">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-3 uppercase tracking-wide">좋은 해시 함수 조건</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {['균일 분포', '빠른 계산', '결정적(동일 입력→동일 출력)', 'm은 소수 권장'].map(c => (
              <div key={c} className="rounded-lg bg-white dark:bg-slate-800 px-2 py-2 shadow-sm font-semibold text-slate-700 dark:text-slate-300">{c}</div>
            ))}
          </div>
        </div>
        <ul className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
          {[
            '평균 O(1) 탐색 — 최악은 O(n), 좋은 해시 함수와 낮은 부하율 유지가 핵심',
            '나눗셈법 h(k) = k mod m — m은 소수(prime) 선택 시 충돌 감소',
            '곱셈법 h(k) = ⌊m·(k·A mod 1)⌋, A≈0.6180339887 (황금비)',
            '부하율 α = n/m: 체이닝은 α>1 허용, 오픈 어드레싱은 α<1 유지 필수',
          ].map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />{pt}
            </li>
          ))}
        </ul>
      </section>

      {/* 2. 체이닝 */}
      <section>
        <SH emoji="⛓" title="체이닝(Chaining) 시뮬레이터" id={`${topic.id}-sec-chain`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">체이닝(Chaining) 개념</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            충돌 시 같은 슬롯에 Linked List로 연결. 테이블 크기를 넘어도 삽입 가능, 삭제가 간단 (노드만 제거). 부하율(load factor) &alpha; = n/m: 평균 탐색 시간 = &Theta;(1 + &alpha;).
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="number"
              value={chainInput}
              onChange={e => { setChainInput(e.target.value); setChainError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleChainInsert(); }}
              placeholder="정수 입력"
              className="flex-1 min-w-0 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={handleChainInsert} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors">삽입</button>
            <button onClick={handleChainDelete} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition-colors">삭제</button>
            <button onClick={handleChainReset} className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">초기화</button>
          </div>
          {chainError && <p className="text-xs text-red-500 mb-2">{chainError}</p>}
          {chainLog && <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mb-3">{chainLog}</p>}

          {/* Chain table visual */}
          <div className="space-y-2">
            {chainTable.map((chain, slot) => (
              <div
                key={slot}
                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition-all ${
                  chainHighlight === slot
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-slate-200 dark:bg-slate-700 text-xs font-black text-slate-700 dark:text-slate-300">{slot}</span>
                <span className="text-slate-300 dark:text-slate-600 text-sm">→</span>
                {chain.length === 0
                  ? <span className="text-xs text-slate-400 italic">NULL</span>
                  : (
                    <div className="flex flex-wrap gap-1.5">
                      {chain.map((val, i) => (
                        <span
                          key={i}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow ${chainColorMap[val] ?? 'bg-slate-500'}`}
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  )
                }
              </div>
            ))}
          </div>
          <LoadGauge n={chainTotal} m={M} />
          <p className="text-[11px] text-slate-400 mt-2">h(k) = k mod {M} | 슬롯 수 m={M}</p>
        </div>
      </section>

      {/* 3. 오픈 어드레싱 */}
      <section>
        <SH emoji="🔍" title="오픈 어드레싱 — 선형 프로빙 시뮬레이터" id={`${topic.id}-sec-probe`} />
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10 p-4 mb-4">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1.5">선형 프로빙(Linear Probing) 개념</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            충돌 시 다음 슬롯으로 이동. 장점: 캐시 지역성 좋음 (메모리 연속 접근). 단점: 1차 군집화(Primary Clustering) - 연속된 슬롯이 채워지면 충돌 증가. DELETED 마커 필요성: 삭제 시 슬롯을 단순히 빈 것으로 표시하면, 그 슬롯을 지나가야 하는 탐색이 중간에 끊겨버림.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            탐침 함수: h(k, i) = (k mod {M} + i) mod {M}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="number"
              value={probeInput}
              onChange={e => { setProbeInput(e.target.value); setProbeError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleProbeInsert(); }}
              placeholder="정수 입력"
              className="flex-1 min-w-0 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={handleProbeInsert} disabled={probeRunning} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">삽입</button>
            <button onClick={handleProbeDelete} disabled={probeRunning} className="rounded-lg bg-red-500 px-3 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40 transition-colors">삭제</button>
            <button onClick={handleProbeSearch} disabled={probeRunning} className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors">탐색</button>
            <button onClick={handleProbeReset} disabled={probeRunning} className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors">초기화</button>
          </div>
          {probeError && <p className="text-xs text-red-500 mb-2">{probeError}</p>}
          {probeLog && <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mb-3">{probeLog}</p>}

          {/* Probe table */}
          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {probeTable.map((slot, idx) => {
              const hl = probeHighlight.find(h => h.idx === idx);
              return (
                <div
                  key={idx}
                  className={`rounded-xl border-2 p-2 text-center transition-all ${slotStyle(idx)}`}
                >
                  <div className="text-[10px] text-slate-400 mb-1">[{idx}]</div>
                  {slot === 'empty' ? (
                    <div className="text-xs text-slate-300 dark:text-slate-600 font-mono">—</div>
                  ) : slot === 'deleted' ? (
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-red-400">DEL</span>
                      <span className="text-red-400 text-xs">✕</span>
                    </div>
                  ) : (
                    <div className={`text-sm font-black ${hl?.type === 'found' ? 'text-blue-600 dark:text-blue-300' : hl?.type === 'inserted' ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {slot}
                    </div>
                  )}
                  {hl && (
                    <div className={`text-[9px] font-bold mt-0.5 ${
                      hl.type === 'probing' ? 'text-amber-500' :
                      hl.type === 'inserted' ? 'text-emerald-500' :
                      hl.type === 'found' ? 'text-blue-500' :
                      hl.type === 'deleted' ? 'text-red-500' : ''
                    }`}>
                      {hl.type === 'probing' ? '탐침' : hl.type === 'inserted' ? '삽입' : hl.type === 'found' ? '발견' : hl.type === 'deleted' ? '삭제' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs mb-2">
            {[
              { color: 'bg-amber-400', label: '탐침 중' },
              { color: 'bg-emerald-400', label: '삽입됨' },
              { color: 'bg-blue-400', label: '탐색 발견' },
              { color: 'bg-red-400', label: '삭제(DELETED)' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <span className={`inline-block h-2.5 w-2.5 rounded-sm ${l.color}`} />{l.label}
              </span>
            ))}
          </div>

          <LoadGauge n={probeCount} m={M} />

          <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">DELETED 마커의 역할</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              삭제 시 슬롯을 단순히 empty로 만들면 탐색 체인이 끊김. DELETED 마커를 두면 탐색 시 건너뛰고, 삽입 시 재사용 가능.
            </p>
          </div>
        </div>
      </section>

      {/* 4. 비교 표 */}
      <section>
        <SH emoji="⚖" title="충돌 해결 방법 비교" id={`${topic.id}-sec-compare`} />
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="px-4 py-2.5 text-left font-bold text-slate-700 dark:text-slate-300">항목</th>
                <th className="px-4 py-2.5 text-center font-bold text-blue-700 dark:text-blue-300">체이닝</th>
                <th className="px-4 py-2.5 text-center font-bold text-violet-700 dark:text-violet-300">선형 프로빙</th>
                <th className="px-4 py-2.5 text-center font-bold text-emerald-700 dark:text-emerald-300">이중 해싱</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                { item: '부하율', chain: 'α > 1 허용', linear: 'α < 1 필수', dh: 'α < 1 필수' },
                { item: '탐색 (평균)', chain: 'O(1+α)', linear: 'O(1/(1-α))', dh: 'O(1/(1-α))' },
                { item: '캐시 효율', chain: '낮음 (포인터)', linear: '높음 (연속)', dh: '중간' },
                { item: '군집화', chain: '없음', linear: 'Primary clustering', dh: '거의 없음' },
                { item: '삭제', chain: '간단', linear: 'DELETED 필요', dh: 'DELETED 필요' },
                { item: '구현 복잡도', chain: '단순', linear: '단순', dh: '복잡 (2nd hash)' },
              ].map(row => (
                <tr key={row.item} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300">{row.item}</td>
                  <td className="px-4 py-2.5 text-center text-xs text-slate-600 dark:text-slate-400 font-mono">{row.chain}</td>
                  <td className="px-4 py-2.5 text-center text-xs text-slate-600 dark:text-slate-400 font-mono">{row.linear}</td>
                  <td className="px-4 py-2.5 text-center text-xs text-slate-600 dark:text-slate-400 font-mono">{row.dh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. 완전 해시 + 함정 */}
      <section>
        <SH emoji="💎" title="완전 해시 + 시험 함정" id={`${topic.id}-sec-perfect`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {[
            {
              title: '완전 해시 (Perfect Hashing)',
              color: 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20',
              items: [
                '모든 키에 대해 충돌 없음 — O(1) 최악 보장',
                '정적 집합(키 미리 알 때)에만 실용적',
                'FKS 완전 해싱: 2단계 구조, O(n) 공간',
              ],
            },
            {
              title: '유니버설 해싱 (Universal Hashing)',
              color: 'border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/20',
              items: [
                '임의로 선택된 해시 함수 — 임의의 두 키가 충돌할 확률 ≤ 1/m',
                '공격자가 최악 케이스 강제 불가',
                'h_{a,b}(k) = ((ak+b) mod p) mod m',
              ],
            },
          ].map(c => (
            <div key={c.title} className={`rounded-xl border-2 ${c.color} p-4`}>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2">{c.title}</p>
              <ul className="space-y-1.5">
                {c.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-slate-500" />{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-900/10 space-y-2">
          {[
            '해시 테이블 탐색 O(1)은 평균 — 최악은 O(n), 시험에서 "항상 O(1)"이라고 하면 틀림',
            '오픈 어드레싱에서 삭제 후 empty 처리 시 탐색 체인이 끊겨 찾지 못할 수 있음 → DELETED 필수',
            '선형 프로빙의 Primary Clustering: 연속된 슬롯 점령 → 긴 탐침 체인 형성',
            'm을 2의 거듭제곱으로 하면 비트 마스킹으로 빠르지만 해시 함수 품질에 취약',
          ].map((p, i) => (
            <p key={i} className="flex gap-2 text-sm text-red-700 dark:text-red-300"><span>⚠</span>{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
