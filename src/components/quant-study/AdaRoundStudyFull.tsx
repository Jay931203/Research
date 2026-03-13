'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Cpu,
  Hash,
  Layers,
  Zap,
  FlaskConical,
  Target,
} from 'lucide-react';
import katex from 'katex';
import GlossaryText from '@/components/glossary/GlossaryText';

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
      {onToggle && (
        <ChevronDown className={`ml-auto h-5 w-5 text-gray-400 transition-transform dark:text-gray-500 ${collapsed ? '-rotate-90' : ''}`} />
      )}
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

function EqCard({ idx, name, latex, description, color = 'emerald' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    green:   'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    teal:    'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    blue:    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    indigo:  'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
  };
  const badgeMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    green:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    teal:    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    blue:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    indigo:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-emerald-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.emerald}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.emerald}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}


/* ── Rounding Comparison Interactive ──────────────────────────── */

function RoundingComparisonViz() {
  const [weight, setWeight] = useState(2.3);
  const [softV, setSoftV] = useState(0.5);

  const roundDown = Math.floor(weight);
  const roundUp = Math.ceil(weight);
  const nearestRound = Math.round(weight);
  // Soft rounding: h(V) = clip(sigmoid(V)(zeta + gamma) - gamma, 0, 1)
  // Simplified for visualization
  const sigmoid = 1 / (1 + Math.exp(-softV * 5));
  const adaRoundValue = roundDown + sigmoid * (roundUp - roundDown);
  const adaRoundFinal = sigmoid > 0.5 ? roundUp : roundDown;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/5">
      {/* Weight slider */}
      <div className="mb-4">
        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
          가중치 값 (w): <span className="font-mono text-emerald-600 dark:text-emerald-400">{weight.toFixed(2)}</span>
        </label>
        <input
          type="range" min={0} max={5} step={0.01} value={weight}
          onChange={e => setWeight(Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
      </div>

      {/* Soft variable slider */}
      <div className="mb-4">
        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
          연속 변수 V (학습됨): <span className="font-mono text-emerald-600 dark:text-emerald-400">{softV.toFixed(2)}</span>
          <span className="ml-2 text-gray-400">&rarr; h(V) = {sigmoid.toFixed(3)}</span>
        </label>
        <input
          type="range" min={-3} max={3} step={0.01} value={softV}
          onChange={e => setSoftV(Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Nearest Rounding</p>
          <p className="mt-1 font-mono text-2xl font-bold text-gray-700 dark:text-gray-300">{nearestRound}</p>
          <p className="mt-1 text-xs text-gray-400">|w - q| 최소화</p>
          <p className="text-xs text-red-500 dark:text-red-400">태스크 손실 무시</p>
        </div>
        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4 text-center dark:border-emerald-700 dark:bg-emerald-900/20">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">AdaRound (학습 중)</p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">{adaRoundValue.toFixed(2)}</p>
          <p className="mt-1 text-xs text-emerald-500">h(V) = {sigmoid.toFixed(3)}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">태스크 손실 최적화</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-white p-4 text-center dark:border-emerald-800 dark:bg-gray-800">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">AdaRound (최종)</p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">{adaRoundFinal}</p>
          <p className="mt-1 text-xs text-emerald-500">h(V) &rarr; {sigmoid > 0.5 ? '1 (올림)' : '0 (내림)'}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">경사 하강법으로 결정</p>
        </div>
      </div>

      {/* Number line visualization */}
      <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4 dark:border-emerald-800 dark:bg-gray-900">
        <p className="mb-2 text-xs font-bold text-gray-600 dark:text-gray-400">수직선 시각화</p>
        <div className="relative h-12">
          {/* Base line */}
          <div className="absolute left-0 right-0 top-6 h-0.5 bg-gray-300 dark:bg-gray-600" />
          {/* Floor tick */}
          <div className="absolute top-3 h-6 w-0.5 bg-gray-400" style={{ left: `${(roundDown / 5) * 100}%` }}>
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-mono text-gray-500">{roundDown}</span>
          </div>
          {/* Ceil tick */}
          <div className="absolute top-3 h-6 w-0.5 bg-gray-400" style={{ left: `${(roundUp / 5) * 100}%` }}>
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-mono text-gray-500">{roundUp}</span>
          </div>
          {/* Original weight */}
          <div className="absolute top-4 h-4 w-4 -translate-x-2 rounded-full bg-gray-500" style={{ left: `${(weight / 5) * 100}%` }}>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-gray-600 dark:text-gray-300">w={weight.toFixed(2)}</span>
          </div>
          {/* AdaRound position */}
          <div className="absolute top-4 h-4 w-4 -translate-x-2 rounded-full border-2 border-emerald-600 bg-emerald-400" style={{ left: `${(adaRoundValue / 5) * 100}%` }}>
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-emerald-600 dark:text-emerald-400">Ada</span>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
        <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
          <span className="font-bold">핵심 관찰:</span> Nearest rounding은 항상 가장 가까운 정수로 반올림하지만,
          AdaRound는 연속 변수 V를 경사 하강법으로 최적화하여 &ldquo;올림&rdquo; 또는 &ldquo;내림&rdquo;을 태스크 손실 기준으로 결정합니다.
          V를 조절하면서 최종 양자화 값이 어떻게 변하는지 관찰하세요.
          {sigmoid > 0.3 && sigmoid < 0.7 && (
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {' '}현재 h(V)가 0.5 근처로, 아직 올림/내림이 결정되지 않은 상태입니다.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ── Table helper ──────────────────────────────────────────────── */

function DataTable({ headers, rows, caption, highlightCol }: {
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
  highlightCol?: number;
}) {
  return (
    <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-emerald-50 dark:bg-emerald-900/20">
            {headers.map((h, i) => (
              <th key={i} className={`px-3 py-2 font-bold text-emerald-700 dark:text-emerald-300 ${i === 0 ? 'text-left' : 'text-center'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-3 py-2 ${ci === 0 ? 'font-semibold text-gray-700 dark:text-gray-300' : 'text-center font-mono'} ${ci === highlightCol ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {caption && <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
    </div>
  );
}


/* ── Main component ──────────────────────────────────────────── */

export default function AdaRoundStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="adaround-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-emerald-700 via-green-600 to-teal-600 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICML 2020</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Qualcomm AI Research</span>
              <span className="rounded-full bg-emerald-300/90 px-3 py-1 text-xs font-bold text-emerald-900">Post-Training Quantization</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Up or Down? Adaptive Rounding for Post-Training Quantization
            </h2>
            <p className="mt-3 text-sm text-emerald-200">
              Nagel, Amjad, van Baalen, Louizos &amp; Blankevoort &middot; ICML 2020
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              Post-Training Quantization(PTQ)에서 가장 기본적인 연산인 <span className="font-semibold text-emerald-700 dark:text-emerald-300">&ldquo;반올림(rounding)&rdquo;</span>을
              재고한 논문. 기존의 nearest rounding(가장 가까운 정수로 반올림)이 최적이 아님을 이론적/실험적으로 보이고,
              각 가중치를 올림할지 내림할지를 <span className="font-semibold text-emerald-700 dark:text-emerald-300">태스크 손실을 최소화하도록 학습</span>하는
              AdaRound 알고리즘을 제안합니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              핵심 통찰: 개별 가중치의 반올림 오차를 최소화하는 것(nearest rounding)이 전체 레이어 출력의 오차를 최소화하지 않습니다.
              가중치 간의 <span className="font-semibold text-emerald-700 dark:text-emerald-300">상호작용(interaction)</span>을 고려하면,
              일부 가중치를 &ldquo;더 먼 쪽&rdquo;으로 반올림하는 것이 전체 손실을 줄일 수 있습니다.
              논문은 이 문제를 QUBO(Quadratic Unconstrained Binary Optimization)로 공식화하고,
              Hessian의 Kronecker product 분해를 통해 효율적인 레이어별 MSE 최적화로 변환합니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">논문 구조:</span>{' '}
              (1) Rounding-to-nearest가 최적이 아님을 보이는 동기 부여,
              (2) Taylor 전개 &rarr; QUBO &rarr; Kronecker 분해 &rarr; per-row MSE로의 수학적 유도,
              (3) 연속 완화 + rectified sigmoid를 통한 AdaRound 알고리즘,
              (4) ResNet18/50, InceptionV3, MobileNetV2 + DeepLabV3+에서의 실험 검증.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Post-Training Quantization', 'Adaptive Rounding', 'QUBO', 'Hessian Decomposition', 'Rectified Sigmoid', 'Layer-wise Optimization'].map(tag => (
                <span key={tag} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{tag}</span>
              ))}
            </div>

            {/* Hyperparameters summary */}
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-900/10">
              <p className="mb-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">실험 하이퍼파라미터 요약</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-700 dark:text-gray-300 sm:grid-cols-3">
                <span><strong>캘리브레이션 데이터:</strong> 1024장 (최종 비교: 2048)</span>
                <span><strong>옵티마이저:</strong> Adam (기본 설정)</span>
                <span><strong>반복 횟수:</strong> 10k (최종 비교: 20k)</span>
                <span><strong>배치 크기:</strong> 32</span>
                <span><strong>양자화 설정:</strong> 대칭 4비트, per-layer scale</span>
                <span><strong>Scale s 설정:</strong> MSE ||W-Wq||_F^2 최소화</span>
                <span><strong>실험 반복:</strong> 5회, seed 변경, mean +/- std 보고</span>
                <span><strong>GPU:</strong> 단일 GTX 1080 Ti</span>
                <span><strong>ResNet18 소요 시간:</strong> ~10분</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem: Motivation ──────────────────────────────── */}
      <section id="adaround-problem" className="scroll-mt-20">
        <SectionHeading icon={<BookOpen className="h-5 w-5" />} title="동기 부여: 왜 Nearest Rounding이 최적이 아닌가?" collapsed={!!col['adaround-problem']} onToggle={() => toggle('adaround-problem')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['adaround-problem'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="PTQ의 기본 양자화 공식 (Eq. 1)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Post-Training Quantization은 학습된 모델의 가중치를 재학습 없이 저비트 정수로 변환합니다.
              가중치 w를 b비트로 양자화할 때, 연속 값을 이산 격자점(grid point)에 매핑해야 합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\hat{w} = s \cdot \text{clip}\!\left(\left\lfloor \frac{w}{s} \right\rceil,\; n,\; p\right) \qquad \text{(Eq. 1)}`} />
            </div>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              여기서 s는 스케일 팩터, n과 p는 클리핑 범위, ⌊ ⌉는 rounding-to-nearest 연산입니다.
              이 공식에서 rounding은 가장 기본적인 연산이지만, 논문은 이것이 <strong>최적이 아님</strong>을 증명합니다.
            </p>

            <SubSectionHeading number="1.2" title="Example 1: Hessian의 off-diagonal 항" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              논문의 핵심 동기 부여 예제입니다. 2개 가중치에 대한 Hessian이 다음과 같다고 합시다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
              <EquationRenderer latex={String.raw`\mathbf{H} = \begin{pmatrix} 1 & 0.5 \\ 0.5 & 1 \end{pmatrix}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              반올림 오차 벡터 delta 에 대한 2차 비용은:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
              <EquationRenderer latex={String.raw`\boldsymbol{\delta}^T \mathbf{H} \boldsymbol{\delta} = \delta_1^2 + \delta_2^2 + 2 \cdot 0.5 \cdot \delta_1 \delta_2 = \delta_1^2 + \delta_2^2 + \delta_1 \delta_2`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              Nearest rounding은 delta_1^2 + delta_2^2만 최소화합니다(H = I 가정).
              그러나 교차항 delta_1 * delta_2가 존재하므로, delta_1과 delta_2의 <strong>부호 관계</strong>에 따라
              교차항이 양수 또는 음수가 됩니다. 부호가 반대이면 교차항이 음수가 되어 전체 비용이 줄어듭니다.
              따라서 일부 가중치를 의도적으로 &ldquo;더 먼 쪽&rdquo;으로 반올림하여 교차항을 음수로 만드는 것이 유리할 수 있습니다.
            </p>

            <SubSectionHeading number="1.3" title="Stochastic Rounding 실험 (Table 1)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Nearest rounding이 최적이 아님을 실험적으로 확인하기 위해, 논문은 ResNet18의
              <strong> 첫 번째 레이어만</strong> 다양한 rounding 방식으로 4비트 양자화합니다:
            </p>
            <DataTable
              headers={['Rounding 방식', 'Top-1 Accuracy (%)', '비고']}
              rows={[
                ['Nearest', '52.29', '기준선 (가장 가까운 격자점)'],
                ['Ceil (모두 올림)', '0.10', '모델 완전 붕괴'],
                ['Floor (모두 내림)', '0.10', '모델 완전 붕괴'],
                ['Stochastic (평균)', '52.06 +/- 5.52', '100회 랜덤 반올림 평균'],
                ['Stochastic (최고)', '63.06', '100회 중 최고 성능'],
              ]}
              caption="Table 1: ResNet18 첫 번째 레이어만 4비트 양자화. 나머지 레이어는 FP32 유지."
              highlightCol={1}
            />
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">핵심 발견</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                100개의 stochastic rounding 샘플 중 <strong>48개가 nearest rounding(52.29%)보다 높은 정확도</strong>를 달성했습니다.
                최고 성능은 63.06%로 nearest 대비 <strong>+10.77%p</strong> 향상. 이는 nearest가 최적과 거리가 멀다는
                명확한 실험적 증거입니다. 최적 rounding 조합이 존재하며, 이를 찾는 것이 AdaRound의 목표입니다.
              </p>
            </div>

            <SubSectionHeading number="1.4" title="QUBO 비용과 정확도의 상관관계 (Fig. 1)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              논문의 Fig. 1은 Eq. 13의 QUBO 비용(delta^T H delta)과 ImageNet 정확도 사이에
              <strong> 명확한 음의 상관관계</strong>가 있음을 보여줍니다.
              QUBO 비용이 낮은 rounding 조합일수록 ImageNet 정확도가 높습니다.
              이는 2차 Taylor 근사가 rounding 최적화의 유효한 대리 목적 함수임을 실험적으로 검증합니다.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Algorithm ───────────────────────────────────────── */}
      <section id="adaround-algorithm" className="scroll-mt-20">
        <SectionHeading icon={<Cpu className="h-5 w-5" />} title="AdaRound 알고리즘" collapsed={!!col['adaround-algorithm']} onToggle={() => toggle('adaround-algorithm')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['adaround-algorithm'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="인터랙티브: 반올림 비교" />
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              가중치 값과 연속 변수 V를 조절하면서, nearest rounding과 AdaRound의 차이를 확인하세요:
            </p>
            <RoundingComparisonViz />

            <div className="mt-6" />
            <SubSectionHeading number="2.2" title="Step 1: Task Loss 기반 QUBO (Eq. 11-13)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              각 가중치가 floor 또는 ceil로만 갈 수 있으므로 (Eq. 9-10), 반올림 결정은 이진 최적화 문제입니다.
              Taylor 전개를 통해 task loss 변화를 최소화하는 문제로 공식화합니다:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\arg\min_{\Delta\mathbf{w}} \;\mathbb{E}\!\left[L(\mathbf{x}, y, \mathbf{w}+\Delta\mathbf{w}) - L(\mathbf{x}, y, \mathbf{w})\right] \qquad \text{(Eq. 11)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              2차 Taylor 전개 (Eq. 2-4)를 적용하면:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\mathbb{E}\!\left[L(\mathbf{w}+\Delta\mathbf{w}) - L(\mathbf{w})\right] \approx \Delta\mathbf{w}^T \mathbf{g}(\mathbf{w}) + \tfrac{1}{2}\Delta\mathbf{w}^T \mathbf{H}(\mathbf{w}) \Delta\mathbf{w} \qquad \text{(Eq. 2-4)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              레이어별로 분해하고 (Eq. 12), 학습된 모델에서 gradient &asymp; 0이므로 1차항을 무시하면:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\arg\min_{\Delta\mathbf{w}^{(l)}} \;\mathbb{E}\!\left[\Delta\mathbf{w}^{(l)T} \mathbf{H}(\mathbf{w}^{(l)}) \Delta\mathbf{w}^{(l)}\right] \qquad \text{(Eq. 13: QUBO)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              이것은 <strong>Quadratic Unconstrained Binary Optimization (QUBO)</strong> 문제입니다.
              각 delta_i가 두 값(floor residual 또는 ceil residual)만 취할 수 있기 때문입니다.
              QUBO는 NP-hard이며, Hopfield 네트워크/simulated annealing으로 풀 수 있지만 확장성이 떨어집니다.
            </p>

            <SubSectionHeading number="2.3" title="Step 2: Kronecker 분해로 Local MSE로 변환 (Eq. 14-20)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              QUBO를 직접 풀기 어려우므로, Hessian을 분해하여 효율적인 대리 목적 함수를 유도합니다.
              Chain rule을 통해 레이어 l의 Hessian을 다음과 같이 분해합니다 (Eq. 14-16):
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
              <EquationRenderer latex={String.raw`\mathbf{H}(\mathbf{w}^{(l)}) = \mathbb{E}\!\left[\mathbf{x}^{(l-1)}\mathbf{x}^{(l-1)T} \otimes \nabla^2_{\mathbf{z}} L\right] \qquad \text{(Eq. 16)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              여기서 &otimes;는 Kronecker product, x^(l-1)은 l번째 레이어의 입력, nabla^2_z L은
              pre-activation에 대한 loss의 2차 미분입니다. nabla^2_z L을 대각 행렬로 근사하면 (Eq. 17):
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
              <EquationRenderer latex={String.raw`\nabla^2_{\mathbf{z}} L \approx \text{diag}(\mathbf{d}) \qquad \text{(Eq. 17: 대각 근사)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              이 근사를 대입하면, QUBO가 출력 채널별(per-row) 독립적 문제로 분해됩니다 (Eq. 18-20):
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\arg\min \;\mathbb{E}\!\left[\left\|\Delta\mathbf{W}_{k,:} \mathbf{x}^{(l-1)}\right\|^2\right] \qquad \text{(Eq. 18-20: per-row MSE)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              이것이 곧 레이어 출력의 MSE 재구성 오차입니다. 즉, <strong>task loss의 QUBO 최적화가
              local MSE 최적화로 환원</strong>됩니다. 이 유도가 논문의 이론적 핵심입니다.
            </p>

            <SubSectionHeading number="2.4" title="Step 3: 연속 완화와 Rectified Sigmoid (Eq. 21-25)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              MSE 목적 함수에 연속 변수 V를 도입하여 경사 하강법으로 최적화합니다:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\arg\min_{\mathbf{V}} \;\left\|\mathbf{W}\mathbf{x} - \tilde{\mathbf{W}}\mathbf{x}\right\|_F^2 + \lambda f_{\text{reg}}(\mathbf{V}) \qquad \text{(Eq. 21)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              양자화된 가중치는 floor + h(V)로 표현됩니다:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\tilde{\mathbf{W}} = s \cdot \text{clip}\!\left(\left\lfloor \frac{\mathbf{W}}{s} \right\rfloor + h(\mathbf{V}),\; n,\; p\right) \qquad \text{(Eq. 22)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              h(V)는 rectified sigmoid로 정의됩니다 (표준 sigmoid에 stretch를 적용하여 정확히 0과 1에 도달 가능):
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`h(V) = \text{clip}\!\left(\sigma(V)(\zeta - \gamma) + \gamma,\; 0,\; 1\right), \quad \zeta = 1.1,\; \gamma = -0.1 \qquad \text{(Eq. 23)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              정규화 항은 h(V)를 0 또는 1로 밀어냅니다:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`f_{\text{reg}} = \sum_i \left(1 - |2h(V_i) - 1|^\beta\right) \qquad \text{(Eq. 24)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              beta는 annealing 파라미터: 초기에는 작은 값(자유 탐색)에서 점차 증가(이산 수렴 강제).
              높은 beta 초기값은 자유로운 탐색을 허용하고, 낮아지면 h(V)가 0 또는 1로 수렴합니다.
            </p>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              최종적으로, 비대칭(asymmetric) 재구성까지 포함한 전체 목적 함수:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <EquationRenderer latex={String.raw`\arg\min_{\mathbf{V}} \;\left\|f_a(\mathbf{W}\mathbf{x}) - f_a(\tilde{\mathbf{W}}\hat{\mathbf{x}})\right\|_F^2 + \lambda f_{\text{reg}}(\mathbf{V}) \qquad \text{(Eq. 25)}`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              f_a는 활성화 함수(ReLU 등), x_hat은 양자화된 이전 레이어 출력입니다.
              비대칭 재구성은 양자화된 입력을 사용하여 오차 누적을 고려합니다.
            </p>

            <SubSectionHeading number="2.5" title="Fig. 3: 학습된 Rounding이 Nearest와 다름" />
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">핵심 관찰 (Fig. 3)</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                논문의 Fig. 3은 AdaRound가 학습한 h(V) 값의 분포를 보여줍니다.
                많은 가중치가 nearest rounding과 <strong>다른 방향</strong>으로 반올림됩니다.
                즉, nearest에서는 올림이지만 AdaRound에서는 내림, 또는 그 반대인 경우가 상당수 존재합니다.
                이는 가중치 간 상호작용을 고려한 최적 반올림이 개별 오차 최소화와 다름을 직접적으로 보여줍니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Theory ──────────────────────────────────────────── */}
      <section id="adaround-theory" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="이론적 정당화" collapsed={!!col['adaround-theory']} onToggle={() => toggle('adaround-theory')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['adaround-theory'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="Taylor 전개에서 Local Loss로의 유도 경로" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              논문의 이론적 흐름을 정리하면 다음과 같습니다:
            </p>
            <div className="mb-5 space-y-2">
              {[
                { step: '1', title: 'Task loss Taylor 전개', desc: 'E[L(w+delta)] approx L(w) + g^T delta + 1/2 delta^T H delta', eq: 'Eq. 2-4' },
                { step: '2', title: '레이어별 분해 + QUBO', desc: 'Gradient approx 0 가정 하에 레이어별 QUBO로 분해', eq: 'Eq. 11-13' },
                { step: '3', title: 'Hessian Kronecker 분해', desc: 'H(w^l) = E[xx^T (x) nabla^2_z L]', eq: 'Eq. 14-16' },
                { step: '4', title: 'nabla^2_z L 대각 근사', desc: 'Cross-output term 무시로 per-row 독립 문제', eq: 'Eq. 17' },
                { step: '5', title: 'Per-row MSE로 환원', desc: '||delta_W_k x||^2 = 레이어 출력 MSE', eq: 'Eq. 18-20' },
                { step: '6', title: '연속 완화 + 정규화', desc: 'Rectified sigmoid + beta-annealing regularization', eq: 'Eq. 21-25' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">{item.step}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.title} <span className="ml-1 font-normal text-emerald-600 dark:text-emerald-400">({item.eq})</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <SubSectionHeading number="3.2" title="근사의 타당성 검증 (Table 2)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              각 근사 단계가 성능에 미치는 영향을 실험적으로 검증합니다.
              ResNet18에서 각 단계의 목적 함수로 최적화한 결과:
            </p>
            <DataTable
              headers={['방법', '첫 번째 레이어만 (%)', '전체 레이어 (%)']}
              rows={[
                ['Nearest rounding', '52.29', '23.99'],
                ['H(w) task loss (Eq. 13)', '68.62 +/- 0.17', 'N/A (비확장)'],
                ['Local MSE loss (Eq. 20)', '69.39 +/- 0.04', '65.83 +/- 0.14'],
                ['Cont. relaxation (Eq. 21)', '69.58 +/- 0.03', '66.56 +/- 0.12'],
              ]}
              caption="Table 2: ResNet18 4-bit 양자화. 각 근사가 성능을 개선하거나 유지함을 확인."
              highlightCol={2}
            />
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">분석</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                (1) Task loss Hessian(Eq. 13)으로 최적화하면 nearest 대비 +16.33%p (52.29 &rarr; 68.62). 그러나 전체 Hessian 계산이 필요하여 단일 레이어에서만 적용 가능.{' '}
                (2) Local MSE(Eq. 20)로 대체하면 성능이 유사하면서(69.39) 전체 레이어 적용 가능(65.83).{' '}
                (3) 연속 완화(Eq. 21)가 QUBO보다 약간 더 좋은 이유는 경사 하강법이 더 나은 local minimum을 찾기 때문.
              </p>
            </div>

            <SubSectionHeading number="3.3" title="Bias Correction과의 관계 (Eq. 26)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Bias correction은 같은 MSE 재구성 문제를 풀지만, 가중치 자체를 바꾸지 않고
              <strong> 편향(bias)만 조정</strong>하여 기댓값 E[Wx] = E[W_hat x]를 맞춥니다.
              AdaRound는 가중치의 rounding 자체를 최적화하므로 엄밀하게 상위 호환입니다.
            </p>
            <DataTable
              headers={['방법', 'Top-1 Accuracy (%)']}
              rows={[
                ['Nearest', '23.99'],
                ['Bias correction', '38.87'],
                ['AdaRound', '68.60 +/- 0.09'],
              ]}
              caption="Table 8: ResNet18 4-bit 전체 레이어 양자화. AdaRound가 bias correction을 크게 능가."
              highlightCol={1}
            />

            <SubSectionHeading number="3.4" title="STE(Straight-Through Estimator)와의 비교" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              STE는 QAT에서 주로 사용되는 기법으로, rounding의 gradient를 identity로 근사합니다.
              같은 소량의 캘리브레이션 데이터로 STE 기반 fine-tuning과 비교합니다:
            </p>
            <DataTable
              headers={['방법', 'Top-1 Accuracy (%)']}
              rows={[
                ['Nearest', '23.99'],
                ['STE', '66.63 +/- 0.06'],
                ['AdaRound', '68.60 +/- 0.09'],
              ]}
              caption="Table 5: ResNet18 4-bit 전체 레이어 양자화. AdaRound가 STE보다 ~2%p 높음."
              highlightCol={1}
            />
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">STE가 더 낮은 이유</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                STE는 biased gradient를 사용하므로 최적점에서 벗어날 수 있습니다.
                AdaRound는 rectified sigmoid를 통해 정확한 gradient를 사용하며,
                정규화 항이 이산 해로의 수렴을 보장합니다.
                또한 AdaRound는 scale s를 고정하므로 최적화 문제가 더 잘 정의됩니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="adaround-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['adaround-equations']} onToggle={() => toggle('adaround-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['adaround-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="양자화 기본 공식" color="emerald"
                latex={String.raw`\hat{w} = s \cdot \text{clip}\!\left(\left\lfloor \frac{w}{s} \right\rceil,\; n,\; p\right)`}
                description="가중치 w를 스케일 s로 나누고 rounding 후 clip. n, p는 양자화 범위의 최솟값, 최댓값. 대칭 양자화의 경우 n = -2^(b-1), p = 2^(b-1)-1. 이 공식에서 rounding 연산을 nearest에서 adaptive로 바꾸는 것이 AdaRound의 핵심." />

              <EqCard idx={11} name="Task Loss 기반 최적화" color="green"
                latex={String.raw`\arg\min_{\Delta\mathbf{w}} \;\mathbb{E}\!\left[L(\mathbf{x}, y, \mathbf{w}+\Delta\mathbf{w}) - L(\mathbf{x}, y, \mathbf{w})\right]`}
                description="전체 task loss를 최소화하는 rounding 조합 delta_w를 찾는 것이 궁극적 목표. delta_w_i는 floor residual 또는 ceil residual의 두 값만 가능하므로 이진 최적화 문제. 직접 풀기는 2^n 조합으로 비현실적." />

              <EqCard idx={13} name="QUBO (2차 이진 최적화)" color="teal"
                latex={String.raw`\arg\min_{\Delta\mathbf{w}^{(l)}} \;\mathbb{E}\!\left[\Delta\mathbf{w}^{(l)T} \mathbf{H}(\mathbf{w}^{(l)}) \Delta\mathbf{w}^{(l)}\right]`}
                description="Gradient ≈ 0 가정 하에 Taylor 전개의 2차항만 남겨 유도. 레이어별 Hessian H(w^l)에 대한 이차 형식. QUBO는 NP-hard이지만, Hopfield 네트워크나 simulated annealing으로 근사 가능. 논문은 Fig. 1에서 이 비용과 ImageNet 정확도의 강한 상관관계를 실험적으로 검증." />

              <EqCard idx={16} name="Hessian Kronecker 분해" color="blue"
                latex={String.raw`\mathbf{H}(\mathbf{w}^{(l)}) = \mathbb{E}\!\left[\mathbf{x}^{(l-1)}\mathbf{x}^{(l-1)T} \otimes \nabla^2_{\mathbf{z}} L\right]`}
                description="Chain rule을 적용하여 Hessian을 입력 상관 행렬(xx^T)과 출력 Hessian(nabla^2_z L)의 Kronecker product로 분해. 이 구조가 QUBO를 per-row MSE로 변환하는 핵심. KFAC(Kronecker-Factored Approximate Curvature)과 유사한 분해." />

              <EqCard idx={22} name="AdaRound 양자화 공식" color="emerald"
                latex={String.raw`\tilde{\mathbf{W}} = s \cdot \text{clip}\!\left(\left\lfloor \frac{\mathbf{W}}{s} \right\rfloor + h(\mathbf{V}),\; n,\; p\right)`}
                description="Floor를 취한 후 학습된 h(V)를 더함. h(V) = 0이면 내림(floor), h(V) = 1이면 올림(ceil). Nearest rounding은 h = round(w/s) - floor(w/s)로 고정. AdaRound는 V를 경사 하강법으로 최적화하여 각 가중치의 올림/내림을 결정." />

              <EqCard idx={23} name="Rectified Sigmoid" color="green"
                latex={String.raw`h(V) = \text{clip}\!\left(\sigma(V)(\zeta - \gamma) + \gamma,\; 0,\; 1\right), \quad \zeta = 1.1,\; \gamma = -0.1`}
                description="표준 sigmoid σ(V) ∈ (0,1)에 stretch를 적용. ζ=1.1, γ=-0.1이면 σ(V) ∈ (0,1) → σ(V)×1.2 - 0.1 ∈ (-0.1, 1.1). clip으로 [0,1]로 자르면, V가 충분히 크거나 작을 때 정확히 1 또는 0에 도달. 이것이 '학습 종료 시 이산화' 가능한 이유." />

              <EqCard idx={24} name="정규화 항 (이산 수렴 유도)" color="teal"
                latex={String.raw`f_{\text{reg}} = \sum_i \left(1 - |2h(V_i) - 1|^\beta\right)`}
                description="h = 0 또는 1이면 |2h-1| = 1이므로 f_reg = 0 (패널티 없음). h = 0.5이면 |2h-1| = 0이므로 f_reg = 1 (최대 패널티). β는 annealing: 초기에 높은 β로 탐색을 허용(높은 β에서는 0.5 근처에서도 패널티가 낮음), 후반에 낮은 β로 강제 수렴." />

              <EqCard idx={25} name="전체 AdaRound 목적 함수 (비대칭)" color="indigo"
                latex={String.raw`\arg\min_{\mathbf{V}} \;\left\|f_a(\mathbf{W}\mathbf{x}) - f_a(\tilde{\mathbf{W}}\hat{\mathbf{x}})\right\|_F^2 + \lambda f_{\text{reg}}(\mathbf{V})`}
                description="f_a는 활성화 함수(ReLU 등), x_hat은 양자화된 이전 레이어의 출력. 비대칭(asymmetric) 재구성: 양자화 오차가 누적되는 것을 고려하여, 양자화된 입력에 대한 출력을 매칭. 이것이 Table 4에서 layer-wise보다 asymmetric이 +1.8%p 높은 이유." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Ablation Studies ───────────────────────────────────── */}
      <section id="adaround-results" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="Ablation Studies (절제 연구)" collapsed={!!col['adaround-results']} onToggle={() => toggle('adaround-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['adaround-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="설계 선택 비교 (Table 3)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              연속 완화를 위한 다양한 설계 선택의 영향을 비교합니다.
              Sigmoid + temperature annealing vs. sigmoid + f_reg vs. rectified sigmoid + f_reg:
            </p>
            <DataTable
              headers={['방법', '첫 번째 레이어 (%)', '전체 레이어 (%)']}
              rows={[
                ['Sigmoid + T annealing', '69.31 +/- 0.21', '65.22 +/- 0.67'],
                ['Sigmoid + f_reg', '69.58 +/- 0.03', '66.25 +/- 0.15'],
                ['Rect. sigmoid + f_reg', '69.58 +/- 0.03', '66.56 +/- 0.12'],
              ]}
              caption="Table 3: ResNet18 4-bit. Rectified sigmoid + f_reg이 가장 안정적이고 성능이 좋음."
              highlightCol={2}
            />
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">분석</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                Temperature annealing은 분산이 크고(0.67) 전체 레이어 성능이 낮습니다(65.22).
                f_reg 기반 방법이 더 안정적이며, rectified sigmoid가 표준 sigmoid보다 전체 레이어에서 +0.31%p 높습니다.
                Rectified sigmoid는 정확히 0과 1에 도달할 수 있어 이산화 시 정보 손실이 없기 때문입니다.
              </p>
            </div>

            <SubSectionHeading number="5.2" title="비대칭 재구성 (Table 4)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              레이어별(layer-wise) vs. 비대칭(asymmetric) 재구성, 그리고 ReLU fold-in의 효과:
            </p>
            <DataTable
              headers={['방법', 'Top-1 Accuracy (%)']}
              rows={[
                ['Layer-wise', '66.56 +/- 0.12'],
                ['Asymmetric', '68.37 +/- 0.07'],
                ['Asymmetric + ReLU', '68.60 +/- 0.09'],
              ]}
              caption="Table 4: ResNet18 4-bit 전체 레이어. 비대칭 재구성이 큰 폭으로 개선."
              highlightCol={1}
            />
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Asymmetric 재구성 (+1.81%p)</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  이전 레이어의 양자화 오차가 누적되므로, 양자화된 입력 x_hat에 대한 출력을 매칭하는 것이
                  실제 추론 시의 동작에 더 가깝습니다. 특히 깊은 네트워크에서 오차 누적이 심하므로 효과가 큽니다.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">ReLU fold-in (+0.23%p)</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  활성화 함수 f_a(ReLU)를 재구성 목표에 포함시킵니다.
                  양자화 오차가 ReLU에 의해 증폭/감쇄되는 효과를 직접 고려하여 최적화합니다.
                  음수 출력의 양자화 오차는 ReLU에 의해 사라지므로 무시해도 되는 것을 학습합니다.
                </p>
              </div>
            </div>

            <SubSectionHeading number="5.3" title="양자화 그리드 선택 (Table 6)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              스케일 s를 설정하는 방법(양자화 그리드)이 nearest와 AdaRound에 미치는 영향:
            </p>
            <DataTable
              headers={['양자화 그리드', 'Nearest (%)', 'AdaRound (%)']}
              rows={[
                ['Min-Max', '0.23', '61.96 +/- 0.04'],
                ['||W - Wq||^2_F (MSE)', '23.99', '68.60 +/- 0.09'],
                ['||Wx - Wqx||^2_F (Output MSE)', '42.89', '68.62 +/- 0.08'],
              ]}
              caption="Table 6: ResNet18 4-bit. 양자화 그리드에 따른 nearest vs. AdaRound 성능."
              highlightCol={2}
            />
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">핵심 발견</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                Nearest rounding은 그리드 선택에 극도로 민감합니다(0.23% vs. 42.89%).
                반면 AdaRound는 세 가지 그리드에서 모두 높은 성능을 달성하며, MSE와 Output MSE 그리드에서 거의 동일합니다(68.60 vs. 68.62).
                이는 AdaRound가 그리드의 불완전함을 rounding 최적화로 보상할 수 있음을 의미합니다.
              </p>
            </div>

            <SubSectionHeading number="5.4" title="데이터 의존성 (Fig. 4)" />
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">데이터에 대한 강건성 (Fig. 4)</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                논문의 Fig. 4는 캘리브레이션 데이터 양과 도메인에 대한 강건성을 보여줍니다:{' '}
                (1) <strong>256장만으로도</strong> 충분한 성능을 달성합니다.{' '}
                (2) ImageNet 모델에 <strong>Pascal VOC나 MS COCO 데이터</strong>를 캘리브레이션에 사용해도
                성능이 크게 떨어지지 않습니다.{' '}
                이는 AdaRound가 특정 데이터 분포에 과적합하지 않고, 가중치의 구조적 특성을 학습함을 시사합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Main Results ──────────────────────────────────────── */}
      <section id="adaround-impact" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과 및 문헌 비교" collapsed={!!col['adaround-impact']} onToggle={() => toggle('adaround-impact')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['adaround-impact'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="6.1" title="ImageNet 분류 문헌 비교 (Table 7)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              최종 비교는 2048 캘리브레이션 이미지, 20k iterations로 수행됩니다.
              OMSE(Optimal MSE clipping), DFQ, Bias correction과 비교합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-emerald-50 dark:bg-emerald-900/20">
                    <th className="px-3 py-2 text-left font-bold text-emerald-700 dark:text-emerald-300">모델</th>
                    <th className="px-3 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300">FP32</th>
                    <th className="px-3 py-2 text-center font-bold text-gray-500 dark:text-gray-400">Nearest 4/32</th>
                    <th className="px-3 py-2 text-center font-bold text-gray-500 dark:text-gray-400">OMSE 4*/32</th>
                    <th className="px-3 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300">AdaRound 4/32</th>
                    <th className="px-3 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300">AdaRound 4/8</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { model: 'ResNet18', fp: '69.68', near: '23.99', omse: '67.12', ada32: '68.71 +/- 0.06', ada8: '68.55 +/- 0.01' },
                    { model: 'ResNet50', fp: '76.07', near: '35.60', omse: '74.67', ada32: '75.23 +/- 0.04', ada8: '75.01 +/- 0.05' },
                    { model: 'InceptionV3', fp: '77.40', near: '1.67', omse: '73.66', ada32: '75.76 +/- 0.09', ada8: '75.72 +/- 0.09' },
                    { model: 'MobileNetV2', fp: '71.72', near: '8.09', omse: '-', ada32: '69.78 +/- 0.05 *', ada8: '69.25 +/- 0.06 *' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{r.model}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.fp}</td>
                      <td className="px-3 py-2 text-center font-mono text-red-500 dark:text-red-400">{r.near}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.omse}</td>
                      <td className="px-3 py-2 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">{r.ada32}</td>
                      <td className="px-3 py-2 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">{r.ada8}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                Table 7: ImageNet Top-1 Accuracy (%). 4/32 = W4A32, 4/8 = W4A8. * MobileNetV2는 per-channel 양자화 사용.
                DFQ 8/8: ResNet18=69.7, MobileNetV2=71.2. Bias corr. 4*/8: ResNet18=67.4, ResNet50=74.8, InceptionV3=59.5.
              </p>
            </div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">InceptionV3: Nearest 1.67% &rarr; AdaRound 75.76%</p>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  Nearest rounding으로는 모델이 완전히 붕괴하지만(1.67%), AdaRound는 FP32 대비 1.64%p만 하락합니다.
                  이는 74.09%p의 복원으로, AdaRound의 효과가 가장 극적인 사례입니다.
                  OMSE(73.66%) 대비로도 +2.10%p 우위입니다.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">4/32 vs. 4/8: 활성화 양자화 영향 최소</p>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  AdaRound 4/32와 4/8의 차이가 매우 작습니다(ResNet18: 0.16%p, ResNet50: 0.22%p).
                  이는 AdaRound가 가중치 양자화를 충분히 최적화하면, 활성화 양자화의 추가 영향이 제한적임을 시사합니다.
                </p>
              </div>
            </div>

            <SubSectionHeading number="6.2" title="Semantic Segmentation: DeepLabV3+ (Table 9)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              분류 외에도, 논문은 DeepLabV3+ MobileNetV2로 Pascal VOC 세만틱 분할 실험을 수행합니다:
            </p>
            <DataTable
              headers={['방법', 'Bits W/A', 'mIOU (%)']}
              rows={[
                ['FP32', '32/32', '72.94'],
                ['DFQ', '8/8', '72.33'],
                ['Nearest', '4/8', '6.09'],
                ['DFQ', '4/8', '14.45'],
                ['AdaRound', '4/32', '70.89 +/- 0.33'],
                ['AdaRound + act quant', '4/8', '70.86 +/- 0.37'],
              ]}
              caption="Table 9: DeepLabV3+ MobileNetV2, Pascal VOC mIOU. AdaRound가 4비트에서도 FP32에 근접."
              highlightCol={2}
            />
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">세만틱 분할에서의 효과</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                4비트 nearest rounding은 mIOU 6.09%로 완전히 실패합니다. DFQ(14.45%)도 크게 부족합니다.
                반면 AdaRound는 70.89%로 FP32(72.94%) 대비 단 2.05%p 하락에 그칩니다.
                활성화까지 8비트로 양자화해도 70.86%로 거의 차이가 없습니다.
                이는 분류가 아닌 dense prediction 태스크에서도 AdaRound가 유효함을 보여줍니다.
              </p>
            </div>

            <SubSectionHeading number="6.3" title="비용 효율성" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">데이터 효율성</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  1024~2048개 비라벨 이미지만 필요. Fig. 4에서 256개로도 충분히 동작.
                  심지어 다른 도메인(Pascal VOC, MS COCO) 데이터로도 가능.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">시간 효율성</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  ResNet18 전체: 단일 GTX 1080 Ti에서 ~10분.
                  QAT 대비 수십~수백 배 빠름. 10k iterations/layer, Adam optimizer.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">안정성</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  5회 실험에서 표준편차가 매우 작음(ResNet18: +/-0.09, ResNet50: +/-0.04).
                  하이퍼파라미터에 둔감하고 재현성이 높음.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Impact ───────────────────────────────────────────── */}
      <section id="adaround-impact-legacy" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="연구 영향: 이후 PTQ 연구의 핵심 구성 요소" collapsed={!!col['adaround-impact-legacy']} onToggle={() => toggle('adaround-impact-legacy')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['adaround-impact-legacy'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              AdaRound의 &ldquo;반올림을 학습한다&rdquo;는 아이디어와 &ldquo;레이어별 재구성 오차 최소화&rdquo; 프레임워크는
              이후 거의 모든 PTQ 연구의 기본 구성 요소가 되었습니다:
            </p>
            <div className="space-y-3">
              {[
                { paper: 'BRECQ (Li et al., ICLR 2021)', desc: 'AdaRound의 레이어별 최적화를 블록 단위로 확장. 레이어 간 상호작용을 캡처하여 성능 향상. Fisher 정보를 활용한 블록 재구성. AdaRound의 대각 근사(Eq. 17)의 한계를 극복.', color: 'emerald' },
                { paper: 'QDrop (Wei et al., ICLR 2022)', desc: 'AdaRound에 활성화 양자화 드롭아웃 추가. 양자화 노이즈에 대한 강건성 향상. 레이어별 + 블록별 하이브리드 최적화. Flat minima를 찾아 일반화 개선.', color: 'green' },
                { paper: 'HAWQ-V3 (Yao et al., ICML 2021)', desc: 'AdaRound + Hessian 기반 mixed-precision. 레이어별 비트폭을 Hessian 스펙트럼으로 결정하고, 각 레이어 내에서 AdaRound 적용. 정수 전용 하드웨어 지원.', color: 'teal' },
                { paper: 'GPTQ (Frantar et al., ICLR 2023)', desc: 'LLM PTQ에서 AdaRound의 아이디어를 OBQ(Optimal Brain Quantization) 프레임워크에 통합. Row-wise greedy 양자화로 확장. GPT-175B를 3-4비트로 양자화하여 LLM 양자화의 기반.', color: 'blue' },
              ].map((item, i) => (
                <div key={i} className={`rounded-lg border border-${item.color}-200 bg-${item.color}-50 p-4 dark:border-${item.color}-800 dark:bg-${item.color}-900/20`}>
                  <p className={`mb-1 text-xs font-bold text-${item.color}-700 dark:text-${item.color}-300`}>{item.paper}</p>
                  <p className={`text-xs text-${item.color}-600 dark:text-${item.color}-400`}>{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">AdaRound의 세 가지 핵심 유산</p>
              <div className="mt-2 space-y-2">
                <p className="text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                  <strong>1. 반올림은 최적화 대상이다:</strong> AdaRound 이전의 PTQ는 &ldquo;양자화 = 단순 반올림&rdquo;이라는 가정에 묶여 있었습니다.
                  AdaRound는 이 가정을 깨고, 가장 기본적인 연산조차 최적화의 대상이 될 수 있음을 보였습니다.
                </p>
                <p className="text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                  <strong>2. 레이어별 재구성 프레임워크:</strong> Task loss &rarr; QUBO &rarr; local MSE로의 이론적 유도는
                  이후 BRECQ, QDrop 등이 채택한 &ldquo;재구성 기반 PTQ&rdquo; 패러다임의 이론적 기반이 되었습니다.
                </p>
                <p className="text-xs leading-relaxed text-emerald-600 dark:text-emerald-400">
                  <strong>3. 소량의 비라벨 데이터로 충분:</strong> 1024개의 비라벨 이미지로 4비트 양자화가 가능하다는 것은,
                  PTQ를 실제 배포 환경에서 사용 가능하게 만든 실용적 기여입니다.
                  이 &ldquo;calibration data only&rdquo; 설정은 이후 PTQ 연구의 표준이 되었습니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

    </div>
    </GlossaryText>
  );
}
