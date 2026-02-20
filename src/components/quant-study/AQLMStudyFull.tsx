'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  FlaskConical,
  GraduationCap,
  Hash,
} from 'lucide-react';
import katex from 'katex';
import AddQuantViz from './AddQuantViz';

/* ── helpers ─────────────────────────────────────────────────── */

function EquationRenderer({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try { return katex.renderToString(latex, { throwOnError: false, displayMode: true }); }
    catch { return null; }
  }, [latex]);
  if (!html) return <code className="block text-center text-sm text-red-400">{latex}</code>;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ icon, title, collapsed, onToggle }: {
  icon: React.ReactNode; title: string; collapsed?: boolean; onToggle?: () => void;
}) {
  return (
    <button onClick={onToggle} className="mb-3 flex w-full items-center gap-2.5 text-left">
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
      {onToggle && <ChevronDown className={`ml-auto h-5 w-5 text-gray-400 transition-transform dark:text-gray-500 ${collapsed ? '-rotate-90' : ''}`} />}
    </button>
  );
}

function SubSectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-center text-xs italic text-gray-500 dark:text-gray-400">{children}</p>;
}

function EqCard({ idx, name, latex, description }: {
  idx: number; name: string; latex: string; description: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-emerald-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions }: { questions: { q: string; a: string }[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <div className="space-y-3">
      {questions.map(({ q, a }, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <button onClick={() => toggle(i)} className="flex w-full items-start gap-3 p-4 text-left">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">Q{i + 1}</span>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{q}</span>
            <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${revealed.has(i) ? 'rotate-180' : ''}`} />
          </button>
          {revealed.has(i) && (
            <div className="mx-4 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <span className="mr-1 font-bold text-green-600 dark:text-green-400">A:</span>{a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function AQLMStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="aqlm-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICML 2024</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">가산 양자화 LLM SOTA</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              AQLM: Extreme Compression of Large Language Models via Additive Quantization
            </h2>
            <p className="mt-3 text-sm text-emerald-200">
              Vage Egiazarian, Andrei Panferov, Denis Kuznedelev 외 (IST Austria, Yandex) · ICML 2024
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              음성/이미지 벡터 양자화에서 수십 년간 연구된
              <span className="font-semibold text-emerald-700 dark:text-emerald-300"> 가산 양자화(Additive Quantization, AQ)</span>를
              LLM 가중치 압축에 적용합니다. 핵심 아이디어: 각 가중치 열(column)을 M개 코드북 조회의 합으로 표현하면,
              동일 비트에서 단순 스칼라 양자화보다 K^M배 넓은 표현 공간을 활용할 수 있습니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              특히 전역 SGD 미세조정(end-to-end fine-tuning with STE)을 도입해 레이어 간 오차 보상을 달성합니다.
              Llama-2-7B 2비트에서 PPL <strong>5.22</strong> — QuIP#(5.57)을 크게 뛰어넘고 FP16(5.47)보다도 낮습니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['잔차 양자화 (RQ)', 'M개 코드북 합', '빔 서치 최적화', '전역 SGD + STE', '1~2비트 SOTA'].map(tag => (
                <span key={tag} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Background: Classical AQ ──────────────────────────── */}
      <section id="aqlm-background" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="배경: 고전적 가산 양자화와 벡터 양자화" collapsed={!!col['aqlm-background']} onToggle={() => toggle('aqlm-background')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-background'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="벡터 양자화 (Vector Quantization, VQ)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              스칼라 양자화: 각 원소를 독립적으로 이산화. 벡터 양자화: d차원 벡터를 하나의 코드워드로 매핑.
              Lloyd-Max 알고리즘(k-means)으로 최적 코드북 학습. Shannon 정보 이론에서 VQ가 점근적으로 최적임이 증명됨.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\hat{w} = C[b^*], \quad b^* = \mathop{\arg\min}_{b \in [K]} \|w - C[b]\|_2^2`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              단순 VQ의 한계: K개 코드워드로 d차원 공간을 커버하려면 K가 지수적으로 커야 함.
              d=8, 2비트/원소이면 이론적으로 K = 2^(8·2) = 65536개 코드워드 필요 → 코드북 크기 과대.
            </p>

            <SubSectionHeading number="1.2" title="Product Quantization (PQ) vs Residual Quantization (RQ)" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">아이디어</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">적용 예시</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">한계</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'Scalar Quantization (SQ)', idea: '각 원소 독립 이산화', ex: 'GPTQ, QuIP', lim: '원소 간 상관 무시' },
                    { m: 'Product Quantization (PQ)', idea: 'w를 M개 서브벡터로 분할, 각 독립 VQ', ex: 'FAISS (Facebook ANN)', lim: '서브벡터 간 독립 가정' },
                    { m: 'Residual Quantization (RQ)', idea: '잔차를 순차적으로 코드북에 양자화', ex: 'ITU 음성 코덱, AQLM', lim: '빔 서치 필요 (탐욕적 최적화 부족)' },
                    { m: 'Additive Quantization (AQ)', idea: 'RQ + 공유 코드북 + 최적화', ex: 'AQLM', lim: '높은 최적화 비용' },
                  ].map((r, i) => (
                    <tr key={i} className={i === 3 ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${i === 3 ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{i === 3 && '★ '}{r.m}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.idea}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.ex}</td>
                      <td className="px-3 py-2 text-red-600 dark:text-red-400">{r.lim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="1.3" title="AQLM = LLM 가중치에 특화된 RQ" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              AQLM은 <em>잔차 양자화(Residual Quantization)</em>의 LLM 특화 버전입니다.
              핵심 차이점: 표준 RQ와 달리, AQLM은 코드북을 모든 열에서 <em>공유</em>합니다.
              이는 코드북 학습 시 전체 가중치 행렬의 통계적 구조를 반영할 수 있게 합니다.
            </p>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">VQ-VAE와의 유사성</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                VQ-VAE(Van den Oord 2017): 연속 잠재 공간을 이산 코드북으로 학습. 코드북 학습에 commitment loss + STE 사용.
                AQLM: 동일한 이산 최적화 + STE 프레임워크를 LLM 가중치 압축에 적용.
                차이: VQ-VAE는 분포 학습 목적, AQLM은 재구성 오차(weight distortion) 최소화가 목적.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Core Idea ─────────────────────────────────────────── */}
      <section id="aqlm-idea" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="핵심 아이디어: 가산 양자화 (Additive Quantization)" collapsed={!!col['aqlm-idea']} onToggle={() => toggle('aqlm-idea')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-idea'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="기본 표현: M개 코드북의 합" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              가중치 행렬 W의 j번째 열 w_j ∈ ℝ^d를 M개 코드북 조회의 합으로 표현합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\hat{w}_j = \sum_{m=1}^{M} C_m[\, b_{j,m}\,], \quad C_m \in \mathbb{R}^{d \times K},\; b_{j,m} \in [K]`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              C_m: m번째 코드북 (d×K 행렬, K = 2^k 코드워드), b_j,m: j번째 열의 m번째 코드 인덱스.
              유효 비트 수 = (M × k) / d 비트/가중치. 예: d=8, M=2, k=8 → (2×8)/8 = 2비트/가중치.
            </p>

            <SubSectionHeading number="2.2" title="인터랙티브 데모" />
            <AddQuantViz />
            <Caption>코드북을 추가할수록 잔차(residual)가 줄어드는 과정을 확인하세요.</Caption>

            <div className="mt-5">
              <SubSectionHeading number="2.3" title="왜 M개 코드북의 합이 강력한가?" />
              <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <EquationRenderer latex={String.raw`|\text{표현 가능 벡터}| = K^M = 2^{Mk}, \quad \text{저장 비트} = M \cdot k \cdot (\text{열 수})`} />
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                단일 코드북 K=65536 vs M=2 코드북 각 K=256:
                동일한 K^M = 65536가지 표현 가능하지만, 학습 비용이 65536 코드워드 vs 2 × 256 = 512 코드워드로 극적으로 감소합니다.
                구성적 표현이 탐색 공간을 덧셈으로 분해합니다.
              </p>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">특성</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">스칼라 (GPTQ)</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">VQ 단일 코드북</th>
                    <th className="px-3 py-2 text-center text-emerald-600 dark:text-emerald-400">AQLM (M=2)</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { p: '코드워드 수', s: '4 (2비트)', vq: '65536 (K=2^16)', aqlm: '256 × 2 = 512' },
                      { p: '유효 표현 수 (2비트)', s: '4', vq: '65536', aqlm: '256² = 65536' },
                      { p: '코드북 메모리 (d=8)', s: '무시 가능', vq: '65536 × 8 × 2B = 1MB', aqlm: '2 × 256 × 8 × 2B = 8KB' },
                      { p: '최적화', s: '그리디 (GPTQ)', vq: 'LBG/k-means', aqlm: '빔 서치 + SGD' },
                      { p: '가중치 간 의존성', s: '없음', vq: '부분적 (같은 코드워드 공유)', aqlm: '공유 코드북으로 전체 포착' },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.p}</td>
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.s}</td>
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.vq}</td>
                        <td className="px-3 py-2 text-center font-semibold text-emerald-600 dark:text-emerald-400">{r.aqlm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Algorithm ─────────────────────────────────────────── */}
      <section id="aqlm-algorithm" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="알고리즘: 빔 서치 + SGD 코드북 업데이트" collapsed={!!col['aqlm-algorithm']} onToggle={() => toggle('aqlm-algorithm')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-algorithm'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              이산 코드 B = {'{b_{j,m}}'}와 연속 코드북 C = {'{C_m}'}의 교대 최적화(alternating optimization).
              NP-hard 문제를 두 단계로 근사:
            </p>

            <div className="space-y-4">
              {/* Phase 1: Beam Search */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">1</span>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">코드 탐색: 빔 서치 (C 고정 → B 최적화)</p>
                </div>
                <p className="mb-2 text-xs text-emerald-600 dark:text-emerald-400">
                  각 열 j에 대해 (b_j1, ..., b_jM)의 최적 조합 탐색. 완전 탐색은 K^M = 65536가지로 불가.
                </p>
                <div className="mb-2 overflow-x-auto rounded-lg bg-white/60 p-2 dark:bg-emerald-950/30">
                  <EquationRenderer latex={String.raw`(b_{j,1:M}^*)= \mathop{\arg\min}_{b_1,\ldots,b_M} \left\| w_j - \sum_{m=1}^{M} C_m[b_m] \right\|_H^2`} />
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  빔 서치: m=1부터 순서대로, 빔 폭 B만큼 유망한 부분 코드를 유지.
                  각 단계: B × K 후보 평가 → 상위 B 유지. 전체 복잡도: O(M × B × K × d).
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { label: '완전 탐색', cost: 'O(K^M)', color: 'text-red-600 dark:text-red-400' },
                    { label: '탐욕적 (m=1 먼저)', cost: 'O(M × K)', color: 'text-orange-600 dark:text-orange-400' },
                    { label: '빔 서치 (AQLM)', cost: 'O(M × B × K)', color: 'text-green-600 dark:text-green-400' },
                  ].map(({ label, cost, color }) => (
                    <div key={label} className="rounded-lg border border-emerald-100 bg-white/60 p-2 text-center dark:bg-emerald-950/20">
                      <p className="text-[10px] text-gray-600 dark:text-gray-400">{label}</p>
                      <p className={`font-mono text-xs font-bold ${color}`}>{cost}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 2: SGD */}
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">2</span>
                  <p className="text-sm font-bold text-teal-700 dark:text-teal-300">코드북 업데이트: SGD (B 고정 → C 최적화)</p>
                </div>
                <p className="mb-2 text-xs text-teal-600 dark:text-teal-400">
                  코드 인덱스 B를 고정한 채 코드북 C_m을 연속 최적화. 목적 함수가 C_m에 대해 볼록(convex)하므로 SGD로 수렴:
                </p>
                <div className="overflow-x-auto rounded-lg bg-white/60 p-2 dark:bg-teal-950/30">
                  <EquationRenderer latex={String.raw`\min_{\{C_m\}} \sum_j \left\| w_j - \sum_{m=1}^{M} C_m[b_{j,m}] \right\|_H^2 \quad (\text{B 고정})`} />
                </div>
                <p className="mt-2 text-xs text-teal-600 dark:text-teal-400">
                  각 코드북 원소 C_m[k]의 기울기 = -2Σ_(j: b_j,m=k) H_j (w_j - Σ_m′ C_m′[b_j,m′]).
                  즉, 코드워드 k를 선택한 모든 열의 잔차를 평균 → 업데이트.
                </p>
              </div>

              {/* Iteration */}
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white">→</span>
                  <p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">교대 반복 수렴 (Local Optimization)</p>
                </div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  Phase 1 (빔 서치) + Phase 2 (SGD)를 수렴할 때까지 반복.
                  일반적으로 수십 회 반복으로 안정적 수렴. 전체 최적은 아닐 수 있음 → 전역 미세조정(Phase 3)으로 보완.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <SubSectionHeading number="3.1" title="Hessian 가중치 목적 함수" />
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                각 레이어의 가중치 복원 오차를 입력 Hessian H = E[XX^T]로 가중합니다. 이는 가중치가 출력에 미치는 실제 영향을 반영합니다:
              </p>
              <div className="overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <EquationRenderer latex={String.raw`\|w - \hat{w}\|_H^2 = (w - \hat{w})^\top H (w - \hat{w}) = \text{Tr}\!\left[(W - \hat{W})H(W - \hat{W})^\top\right]`} />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Global Fine-tuning ────────────────────────────────── */}
      <section id="aqlm-finetuning" className="scroll-mt-20">
        <SectionHeading icon={<GraduationCap className="h-5 w-5" />} title="전역 미세조정 (Global End-to-End Fine-tuning)" collapsed={!!col['aqlm-finetuning']} onToggle={() => toggle('aqlm-finetuning')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-finetuning'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="왜 전역 미세조정이 필요한가?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              레이어별 그리디 최적화는 <em>레이어 간 오차 보상</em>을 불가능하게 합니다.
              레이어 ℓ에서 발생한 양자화 오차가 레이어 ℓ+1로 전파되면서 누적됩니다.
              전역 목적 함수를 최적화하면 한 레이어의 오차를 다른 레이어가 보상할 수 있습니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\min_{\{C_m^{(\ell)}\}, \{B^{(\ell)}\}} \sum_{\ell=1}^{L} \left\| W^{(\ell)} X^{(\ell)} - \hat{W}^{(\ell)} X^{(\ell)} \right\|_F^2`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              그러나 B^(ℓ)은 이산 변수이므로 표준 역전파 불가능 → Straight-Through Estimator(STE) 필요.
            </p>

            <SubSectionHeading number="4.2" title="STE (Straight-Through Estimator) 상세" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              STE (Bengio et al. 2013): 이산 연산의 역전파를 근사하는 방법.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">순전파 (Forward)</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  실제 이산 양자화 사용:<br/>
                  ŵ = Σ_m C_m[argmin_k ‖w - C_m[k]‖²]
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">역전파 (Backward, STE)</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  이산 함수의 기울기를 항등 함수로 대체:<br/>
                  ∂L/∂w ≈ ∂L/∂ŵ (기울기 그대로 통과)
                </p>
              </div>
            </div>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\frac{\partial \mathcal{L}}{\partial C_m[k]} = \sum_{j:\, b_{j,m}=k} \frac{\partial \mathcal{L}}{\partial \hat{w}_j} \approx \sum_{j:\, b_{j,m}=k} \frac{\partial \mathcal{L}}{\partial w_j}`} />
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">STE의 한계와 정당성</p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                STE는 편향된(biased) 기울기 추정이지만 실용적으로 잘 동작합니다.
                이론적 정당성: 코드북이 충분히 미세하면 argmin 함수의 불연속성이 드물어지고,
                대부분의 시간에 기울기가 연속적으로 잘 정의됩니다.
                실용적으로는 learning rate를 낮게 유지하여 코드 인덱스가 자주 바뀌지 않도록 합니다.
              </p>
            </div>

            <div className="mt-5">
              <SubSectionHeading number="4.3" title="전역 미세조정 프로토콜" />
              <div className="space-y-2">
                {[
                  { step: '①', title: '로컬 초기화', desc: '각 레이어를 독립적으로 빔 서치 + SGD로 먼저 최적화. 전역 미세조정의 좋은 초기점 제공.' },
                  { step: '②', title: '보정 데이터 준비', desc: 'C4 데이터셋에서 2048 샘플 추출, 시퀀스 길이 4096. 실제 텍스트 분포를 대표하는 활성화를 사용.' },
                  { step: '③', title: 'End-to-End SGD', desc: 'AdamW 옵티마이저, 학습률 1e-4, 기울기 클리핑 1.0. 이산 인덱스 B는 STE로 역전파. 코드북 C_m만 업데이트.' },
                  { step: '④', title: '스케줄', desc: '약 5000 스텝(대형 모델은 더 많음). 레이어 간 오차 보상이 주된 효과. 약 0.3 PPL 추가 개선.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">{step}</span>
                    <div>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{title}</p>
                      <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="aqlm-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['aqlm-equations']} onToggle={() => toggle('aqlm-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="가산 양자화 표현"
                latex={String.raw`\hat{W}_{:,j} = \sum_{m=1}^{M} C_m\!\left[\, b_{j,m} \,\right], \quad C_m \in \mathbb{R}^{d \times K}`}
                description="j번째 가중치 열을 M개 코드북 조회의 합으로 표현. C_m은 d×K 코드북 행렬, b_{j,m}은 정수 인덱스 ∈ [K]. 저장: M·k 비트/열 (k = log₂K)." />

              <EqCard idx={2} name="유효 비트 수"
                latex={String.raw`\text{bits/weight} = \frac{M \cdot \log_2 K}{d} = \frac{M \cdot k}{d}`}
                description="d차원 열에 M개 코드북, 각 K = 2^k 크기이면 열당 M·k 비트. 예: d=8, M=2, K=256(k=8) → 2·8/8 = 2비트/가중치. 코드북 자체(d·K·M 파라미터)는 별도 저장." />

              <EqCard idx={3} name="빔 서치 최적 코드 탐색"
                latex={String.raw`b_{j,1:M}^{\star} = \mathop{\arg\min}_{b_1,\ldots,b_M} \left\| w_j - \sum_{m=1}^{M} C_m[b_m] \right\|_H^2`}
                description="H = E[xx^T] Hessian 가중 오차 최소화. K^M 완전 탐색 대신 빔 폭 B의 빔 서치: O(M·B·K) 후보 평가. M=2, K=256, B=8이면 각 열에 약 4096회 코드워드 평가." />

              <EqCard idx={4} name="전역 목적 함수 (레이어 간 최적화)"
                latex={String.raw`\min_{\{C_m^{(\ell)}\}, \{B^{(\ell)}\}} \;\sum_{\ell=1}^{L} \left\| W^{(\ell)} X^{(\ell)} - \hat{W}^{(\ell)} X^{(\ell)} \right\|_F^2`}
                description="모든 L개 레이어에 걸친 전역 목적. 레이어 입력 X^(ℓ)은 이전 레이어의 양자화 오차가 전파된 결과 (단, AQLM은 로컬 최적화로 X^(ℓ)을 고정). STE로 B의 역전파 근사." />

              <EqCard idx={5} name="STE (Straight-Through Estimator)"
                latex={String.raw`\frac{\partial \mathcal{L}}{\partial w} \;\overset{\text{STE}}{\approx}\; \frac{\partial \mathcal{L}}{\partial \hat{w}}, \quad \hat{w} = \sum_m C_m[\text{argmin}_k\|w - C_m[k]\|^2]`}
                description="이산 argmin의 기울기가 0이거나 정의되지 않으므로 항등 함수로 대체. 코드북 C_m에 대한 기울기: ∂L/∂C_m[k] = Σ_{j: b_{j,m}=k} ∂L/∂ŵ_j. 연속 최적화로 코드북 업데이트." />

              <EqCard idx={6} name="AQLM 추론 연산"
                latex={String.raw`\hat{W}X = \left(\sum_{m=1}^{M} C_m[\![B_m]\!]\right)X = \sum_{m=1}^{M} C_m[\![B_m]\!] X`}
                description="추론 시: B_m (인덱스 행렬)으로 C_m 조회 후 행렬 곱. CUDA 커널 최적화: 인덱스 조회 → 코드워드 합산 → X와 행렬곱을 융합(fused). 2비트 연산이 FP16 대비 메모리 4배 절약." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────── */}
      <section id="aqlm-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['aqlm-results']} onToggle={() => toggle('aqlm-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['aqlm-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Llama-2 · WikiText-2 Perplexity ↓ (설정별 비교)</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">비트</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">7B PPL</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">13B PPL</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">설정</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'FP16',             b: '16', p7: '5.47', p13: '4.88', cfg: '—',                   hi: false },
                    { m: 'QuIP# (E8)',        b: '2',  p7: '5.57', p13: '4.95', cfg: 'E8 격자',             hi: false },
                    { m: 'AQLM (M=1)',        b: '2',  p7: '5.92', p13: '5.15', cfg: 'K=65536 단일 VQ',    hi: false },
                    { m: 'AQLM (M=2) ★',     b: '2',  p7: '5.22', p13: '4.72', cfg: 'K=256, d=8',         hi: true  },
                    { m: 'AQLM + finetune',  b: '2',  p7: '4.98', p13: '4.51', cfg: 'M=2 + 전역 SGD',     hi: false },
                    { m: 'AQLM (M=1, 1비트)', b: '1', p7: '7.35', p13: '6.12', cfg: 'K=65536, 극단 압축', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.b}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.p7}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.p13}</td>
                      <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{r.cfg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { title: 'M=2가 M=1보다 나은 이유', desc: 'M=1 K=65536은 코드북 자체가 너무 커서 학습 난이도 높음. M=2 K=256은 512 코드워드로 동일 표현력. 구성적 분해가 학습 용이성과 표현력을 동시에 달성.' },
                { title: '전역 미세조정 효과', desc: 'M=2 5.22 → 전역 SGD 후 4.98: 0.24 PPL 추가 개선. FP16(5.47)보다 낮음! 레이어 간 오차 보상이 핵심. 단, 미세조정 비용 상당 (GPU 수 시간).' },
                { title: '1비트 PPL 7.35', desc: '1비트 LLM은 이전에는 불가능 수준. AQLM M=1 K=65536으로 7.35 달성 — 생성 텍스트가 의미 있는 수준. 모델 크기 16배 압축의 가능성을 보임.' },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{title}</p>
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────── */}
      <section id="aqlm-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection questions={[
            {
              q: 'AQLM의 가산(additive) 구조가 단일 코드북 VQ보다 근본적으로 우수한 이유는?',
              a: '단일 코드북 K=65536: 학습 시 65536개 코드워드를 동시에 최적화 → 차원의 저주, 학습 불안정. M=2 코드북 K=256: 512개 코드워드만 학습, 하지만 가산 구조로 256² = 65536가지 표현 가능. 추가 이점: 각 코드북이 잔차(residual)를 점진적으로 줄이므로, m번째 코드북은 (m-1)번째까지의 근사 오차를 보정. 이 계층적 표현이 실제 가중치 분포를 훨씬 잘 포착합니다.',
            },
            {
              q: '빔 서치가 순수 탐욕적(greedy) 탐색보다 반드시 나은 이유를 M=2 예시로 설명하라.',
              a: 'M=2, K=256일 때: 그리디는 m=1 코드 b_1을 먼저 최소화 → b_1이 결정되면 b_2를 최소화. 문제: 전역적으로 (b_1, b_2) 쌍이 최적이라도, b_1만 볼 때는 다른 후보가 더 좋을 수 있음. 빔 서치(B=8): m=1에서 상위 8개 후보 b_1^(1)...b_1^(8) 유지 → m=2에서 각각에 대해 최적 b_2 탐색 → 8가지 (b_1, b_2) 쌍 중 최적 선택. 탐색 공간: 그리디 O(K) vs 빔서치 O(B·K), 품질: 전역 최적에 훨씬 가깝습니다.',
            },
            {
              q: 'STE를 사용한 전역 미세조정이 레이어별 최적화보다 나은 이유와 STE의 한계는?',
              a: '레이어별 최적화: 레이어 ℓ의 입력 X^(ℓ)을 고정(FP16로 가정). 실제로는 이전 레이어의 양자화 오차가 X^(ℓ)을 변경 → 레이어 간 오차 누적. 전역 SGD: 전체 forward pass를 통해 실제 X^(ℓ)을 사용 → 레이어 간 보상 가능. 한 레이어가 이전 레이어의 오차를 "흡수"하도록 학습 가능. STE 한계: (1) 편향된 기울기 추정 → 느린 수렴, (2) 코드 인덱스가 자주 바뀌면 불안정, (3) 전체 모델을 메모리에 올려야 함 (70B 모델에서 비용 큰).',
            },
            {
              q: 'AQLM 2비트 PPL 5.22가 FP16 5.47보다 낮은 것이 가능한 이유는?',
              a: '직관: 양자화는 항상 오차를 추가한다고 생각하지만, 전역 미세조정은 일종의 정규화(regularization) 효과를 줄 수 있습니다. 기존 FP16 가중치는 원래 훈련 손실에 최적화되었지만, WikiText-2 perplexity에 과적합(overfit)될 수 있습니다. 전역 SGD 미세조정은 C4 데이터로 재학습하므로, 일반화 성능이 개선될 수 있습니다. 또한, 양자화 노이즈 자체가 드롭아웃과 유사한 정규화 역할을 할 수 있습니다. 이는 모델 크기와 데이터 특성에 의존하는 현상입니다.',
            },
            {
              q: 'AQLM의 가산 양자화 구조가 CSI 피드백 코드북 설계에 주는 시사점은?',
              a: 'CSI 피드백 코드북(3GPP Type I/II): 현재는 단일 DFT 기반 코드북 + 선택적 오버샘플링. AQLM 아이디어 적용: (1) 다중 코드북 합: 채널 벡터를 M개 코드북의 합으로 표현 → 동일 피드백 비트에서 훨씬 세밀한 CSI 복원. (2) 학습 기반 코드북: 실제 채널 통계(각도 스프레드, 지연 스프레드)에 맞게 코드북 학습 → DFT 기반보다 우수. (3) 빔 서치 피드백: UE가 빔 서치로 최적 코드 인덱스 선택 후 전송 → 기지국 재구성. 현재 CSI-RS 측정 프레임워크에 자연스럽게 통합 가능.',
            },
          ]} />
        </Card>
      </section>
    </div>
  );
}
