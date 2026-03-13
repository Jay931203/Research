'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Hash,
  Lightbulb,
  Radio,
  Scaling,
  Sigma,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'purple' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    violet: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };
  const badgeMap: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-violet-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-violet-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.purple}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.purple}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}


/* ── Scaling Law Visualization ──────────────────────────────── */

const M_VALUES = [2, 4, 8, 16] as const;
const M_COLORS: Record<number, string> = {
  2:  '#8b5cf6', // violet-500
  4:  '#6d28d9', // violet-700
  8:  '#a78bfa', // violet-400
  16: '#c084fc', // purple-400
};
const M_COLORS_LIGHT: Record<number, string> = {
  2:  '#ede9fe', // violet-100
  4:  '#ddd6fe', // violet-200
  8:  '#c4b5fd', // violet-300
  16: '#e9d5ff', // purple-200
};

const SVG_W = 560;
const SVG_H = 280;
const PAD_L = 48;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 44;
const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;

const SNR_MIN = 0;
const SNR_MAX = 30;
// B_max for M=16: (16-1) * 30 / 3.01 ≈ 149.5
const B_MAX = 160;

function ScalingLawViz() {
  const [activeM, setActiveM] = useState<Set<number>>(new Set([2, 4, 8]));

  const toggleM = (m: number) => {
    setActiveM(prev => {
      const n = new Set(prev);
      n.has(m) ? n.delete(m) : n.add(m);
      return n;
    });
  };

  const xScale = (snr: number) => PAD_L + ((snr - SNR_MIN) / (SNR_MAX - SNR_MIN)) * CHART_W;
  const yScale = (b: number) => PAD_T + CHART_H - (b / B_MAX) * CHART_H;

  const computeB = (m: number, snrDb: number) => (m - 1) * (snrDb / 3.01);

  // Generate line path for a given M
  const linePath = (m: number) => {
    const points: string[] = [];
    for (let snr = SNR_MIN; snr <= SNR_MAX; snr += 0.5) {
      const b = computeB(m, snr);
      const x = xScale(snr);
      const y = yScale(b);
      points.push(`${snr === SNR_MIN ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  // Y-axis ticks
  const yTicks = [0, 20, 40, 60, 80, 100, 120, 140, 160];
  // X-axis ticks
  const xTicks = [0, 5, 10, 15, 20, 25, 30];

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/30 p-4 dark:border-violet-900/40 dark:bg-violet-900/5">
      {/* M toggles */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">안테나 수 (M):</span>
        {M_VALUES.map(m => (
          <label key={m} className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={activeM.has(m)}
              onChange={() => toggleM(m)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <span className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              <span className="inline-block h-2.5 w-4 rounded-sm" style={{ backgroundColor: M_COLORS[m] }} />
              M={m}
              <span className="text-gray-400 dark:text-gray-500">(기울기 {((m - 1) / 3.01).toFixed(2)})</span>
            </span>
          </label>
        ))}
      </div>

      {/* SVG chart */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full min-w-[360px]" aria-label="피드백 비트 스케일링 법칙 차트">
          {/* Background grid */}
          {yTicks.map(b => (
            <g key={`y-${b}`}>
              <line
                x1={PAD_L} y1={yScale(b)}
                x2={SVG_W - PAD_R} y2={yScale(b)}
                stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="4 3"
              />
              <text x={PAD_L - 6} y={yScale(b) + 3.5} textAnchor="end" fontSize={8} fill="#9ca3af">{b}</text>
            </g>
          ))}
          {xTicks.map(snr => (
            <g key={`x-${snr}`}>
              <line
                x1={xScale(snr)} y1={PAD_T}
                x2={xScale(snr)} y2={PAD_T + CHART_H}
                stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="4 3"
              />
              <text x={xScale(snr)} y={SVG_H - 18} textAnchor="middle" fontSize={8} fill="#9ca3af">{snr}</text>
            </g>
          ))}

          {/* Axis labels */}
          <text x={xScale(15)} y={SVG_H - 2} textAnchor="middle" fontSize={10} fill="#6b7280" fontWeight="bold">
            SNR (dB)
          </text>
          <text
            x={12} y={yScale(80)}
            textAnchor="middle" fontSize={10} fill="#6b7280" fontWeight="bold"
            transform={`rotate(-90, 12, ${yScale(80)})`}
          >
            필요 피드백 비트 B
          </text>

          {/* Lines for each active M */}
          {M_VALUES.filter(m => activeM.has(m)).map(m => (
            <path
              key={m}
              d={linePath(m)}
              fill="none"
              stroke={M_COLORS[m]}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          ))}

          {/* Endpoint labels */}
          {M_VALUES.filter(m => activeM.has(m)).map(m => {
            const bEnd = computeB(m, SNR_MAX);
            const labelY = yScale(bEnd);
            const clampedY = Math.max(PAD_T + 10, labelY);
            return (
              <g key={`label-${m}`}>
                <circle cx={xScale(SNR_MAX)} cy={yScale(bEnd)} r={3} fill={M_COLORS[m]} />
                <rect
                  x={xScale(SNR_MAX) - 52}
                  y={clampedY - 18}
                  width={50} height={16} rx={4}
                  fill={M_COLORS_LIGHT[m]} opacity={0.9}
                />
                <text
                  x={xScale(SNR_MAX) - 27}
                  y={clampedY - 7}
                  textAnchor="middle" fontSize={8} fontWeight="bold"
                  fill={M_COLORS[m]}
                >
                  M={m}: {bEnd.toFixed(0)}bit
                </text>
              </g>
            );
          })}

          {/* Slope annotation box */}
          <rect x={PAD_L + 8} y={PAD_T + 4} width={175} height={32} rx={6} fill="white" fillOpacity={0.85} stroke="#ddd6fe" strokeWidth={1} />
          <text x={PAD_L + 16} y={PAD_T + 17} fontSize={9} fill="#6d28d9" fontWeight="bold">
            기울기 = (M-1) / 3.01
          </text>
          <text x={PAD_L + 16} y={PAD_T + 30} fontSize={8} fill="#7c3aed">
            B = (M-1) x SNR_dB / 3.01
          </text>

          {/* Axes */}
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CHART_H} stroke="#d1d5db" strokeWidth={1} />
          <line x1={PAD_L} y1={PAD_T + CHART_H} x2={SVG_W - PAD_R} y2={PAD_T + CHART_H} stroke="#d1d5db" strokeWidth={1} />
        </svg>
      </div>

      {/* Insight box */}
      <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-800 dark:bg-violet-900/20">
        <p className="text-xs leading-relaxed text-violet-800 dark:text-violet-200">
          <span className="font-bold">핵심 관찰:</span> 피드백 비트 B는 SNR(dB)에 <span className="font-semibold">선형으로</span> 증가하며,
          기울기는 (M-1)/3.01입니다. M=16 안테나에서 SNR 30dB이면 약 <span className="font-semibold">150비트</span>가 필요합니다.
          Massive MIMO(M=64, 128)에서는 이 비트 수가 수천 비트로 폭증하여,
          전통적 코드북 피드백이 비현실적임을 의미합니다 -- 이것이 딥러닝 기반 CSI 압축(CsiNet 등)의 핵심 동기입니다.
        </p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function JindalStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="jindal-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">IEEE Trans. IT 2006</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Nihar Jindal</span>
              <span className="rounded-full bg-violet-300/90 px-3 py-1 text-xs font-bold text-violet-900">Limited Feedback Scaling Law</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              MIMO Broadcast Channels With Finite-Rate Feedback
            </h2>
            <p className="mt-3 text-sm text-violet-200">
              Nihar Jindal (University of Minnesota) · IEEE Transactions on Information Theory, 2006
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              MIMO 브로드캐스트 채널에서 유한 비트 피드백의 근본 한계를 분석한 핵심 논문.
              <span className="font-semibold text-violet-700 dark:text-violet-300"> Zero-Forcing 빔포밍</span>과
              <span className="font-semibold text-violet-700 dark:text-violet-300"> Random Vector Quantization(RVQ)</span>을
              분석 도구로 사용하여, 완전 CSI 대비 동일한 다중화 이득(multiplexing gain)을 유지하려면
              피드백 비트 수 B가 SNR에 비례하여 증가해야 함을 증명합니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              핵심 결과: <span className="font-semibold text-violet-700 dark:text-violet-300">B는 최소 (M-1)log₂(SNR)만큼 스케일링</span>해야
              rate loss가 유한하게 유지됩니다. 이는 안테나 수가 많아질수록 피드백 오버헤드가 급증함을 의미하며,
              Massive MIMO 시대의 딥러닝 기반 CSI 압축 연구의 이론적 출발점입니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Limited Feedback', 'MIMO Broadcast', 'Scaling Law', 'Zero-Forcing', 'RVQ', 'Rate Loss Bound'].map(tag => (
                <span key={tag} className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Background ────────────────────────────────────────── */}
      <section id="jindal-background" className="scroll-mt-20">
        <SectionHeading icon={<BookOpen className="h-5 w-5" />} title="배경: Point-to-Point vs. 브로드캐스트 채널" collapsed={!!col['jindal-background']} onToggle={() => toggle('jindal-background')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['jindal-background'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="Point-to-Point MIMO에서의 피드백" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              단일 사용자 MIMO(Point-to-Point)에서는 송신기가 채널 방향 정보(CDI)를 알면 빔포밍 이득을 얻지만,
              CSI 없이도 공간 다중화(spatial multiplexing)는 가능합니다.
              피드백 비트가 부족해도 <span className="font-semibold">다중화 이득(multiplexing gain)은 유지</span>되고,
              단지 배열 이득(array gain)만 일부 손실됩니다.
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                <p className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Point-to-Point MIMO</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  사용자 1명 + 안테나 M개<br/>
                  피드백 없어도 다중화 이득 유지<br/>
                  CSI 피드백 → 배열 이득 추가 확보<br/>
                  B 고정(SNR 무관)으로도 충분
                </p>
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/40 dark:bg-violet-900/10">
                <p className="mb-1 text-xs font-bold text-violet-700 dark:text-violet-300">브로드캐스트 채널 (BC)</p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  사용자 M명 동시 서비스<br/>
                  CSI 없으면 다중 사용자 간섭(MUI) 제거 불가<br/>
                  <span className="font-semibold">다중화 이득 자체가 피드백 품질에 의존</span><br/>
                  B가 SNR과 함께 증가해야 함
                </p>
              </div>
            </div>

            <SubSectionHeading number="1.2" title="브로드캐스트 채널에서 피드백이 더 중요한 이유" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              브로드캐스트 채널에서 기지국은 각 사용자의 채널 방향을 알아야 다른 사용자에게 간섭을 주지 않는 빔을 형성할 수 있습니다.
              Zero-Forcing(ZF) 빔포밍은 각 사용자의 채널 벡터에 직교하는 빔을 만들어 간섭을 완전히 제거합니다.
              그러나 양자화된(불완전한) CSI로 ZF를 수행하면:
            </p>
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
              <p className="mb-2 text-xs font-bold text-orange-700 dark:text-orange-300">잔여 다중 사용자 간섭 (Residual MUI)</p>
              <p className="text-xs leading-relaxed text-orange-600 dark:text-orange-400">
                양자화 오차로 인해 빔 벡터가 실제 채널의 영공간(null space)에서 벗어나면,
                의도하지 않은 에너지가 다른 사용자에게 누출됩니다.
                이 잔여 간섭은 SNR이 증가할수록 더 심각해집니다 -- SNR이 높으면 원하는 신호와 함께
                간섭 신호의 전력도 함께 증가하기 때문입니다.
                따라서 <span className="font-semibold">SNR이 올라갈수록 더 정밀한 CSI 피드백(더 많은 비트)이 필요</span>합니다.
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이것이 Jindal 논문의 핵심 문제 설정입니다: 브로드캐스트 채널에서
              rate loss를 유한하게 유지하려면 피드백 비트 B가 SNR과 어떤 관계로 증가해야 하는가?
            </p>
          </Card>
        </div>
      </section>

      {/* ── RVQ ────────────────────────────────────────────────── */}
      <section id="jindal-rvq" className="scroll-mt-20">
        <SectionHeading icon={<Radio className="h-5 w-5" />} title="Random Vector Quantization (RVQ) 분석" collapsed={!!col['jindal-rvq']} onToggle={() => toggle('jindal-rvq')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['jindal-rvq'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="RVQ란 무엇인가?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              RVQ(Random Vector Quantization)는 코드북의 2^B개 벡터를 M차원 단위 구(unit sphere) 위에
              <span className="font-semibold text-violet-700 dark:text-violet-300"> 등방적(isotropic)으로 무작위 배치</span>하는 양자화 방식입니다.
              각 사용자는 자신의 채널 방향 벡터와 가장 가까운(내적이 최대인) 코드워드를 선택하여 그 인덱스(B비트)를 기지국에 피드백합니다.
            </p>
            <div className="mb-4 rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-900/20">
              <p className="mb-2 text-xs font-bold text-violet-700 dark:text-violet-300">왜 RVQ를 분석 도구로 사용하는가?</p>
              <div className="space-y-2 text-xs text-violet-600 dark:text-violet-400">
                <p>
                  <span className="font-semibold">실용적 코드북이 아닙니다.</span> RVQ는 실제 시스템에 쓰기엔 저장/탐색 비용이 비현실적이지만,
                  등방성 덕분에 양자화 오차의 통계적 분석이 깔끔하게 가능합니다.
                </p>
                <p>
                  <span className="font-semibold">성능 상한으로서의 역할:</span> RVQ는 주어진 B비트에서 달성 가능한 최소 평균 양자화 오차의
                  상한을 제공합니다. 즉, &quot;B비트로 이 정도까지는 반드시 가능하다&quot;는 보장을 줍니다.
                </p>
                <p>
                  <span className="font-semibold">스케일링 법칙 도출:</span> 양자화 오차의 상한이 B와 M에 대해 닫힌 형태(closed-form)로 나오므로,
                  피드백 비트의 스케일링 법칙을 수학적으로 증명할 수 있습니다.
                </p>
              </div>
            </div>

            <SubSectionHeading number="2.2" title="양자화 오차 상한의 직관적 유도" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              채널 방향 벡터 <strong>h</strong>와 양자화된 벡터 <strong>h&#770;</strong> 사이의 각도를 θ라 하면,
              양자화 오차는 sin²θ로 측정됩니다. 2^B개 무작위 코드워드 중 가장 가까운 것을 고르면:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-violet-50 p-3 dark:bg-violet-900/20">
              <EquationRenderer latex={String.raw`\mathbb{E}\!\left[\sin^2\theta\right] \;\leq\; 2^{-\frac{B}{M-1}}`} />
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              직관적 이해: M차원 구의 표면적은 (M-1)차원 매니폴드입니다.
              2^B개 점으로 이 매니폴드를 덮으려면, 각 점이 커버하는 영역의 &quot;반지름&quot;(양자화 오차)은
              2^{'{'}B/(M-1){'}'}에 반비례합니다. 차원(M-1)이 클수록 같은 B에 대해 오차가 커지는 것은
              &quot;차원의 저주&quot;의 직접적 발현입니다.
            </p>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300">핵심 통찰</p>
              <p className="mt-1 text-xs leading-relaxed text-purple-600 dark:text-purple-400">
                양자화 오차를 절반으로 줄이려면 B를 (M-1)비트만큼 추가해야 합니다.
                M=4이면 3비트 추가, M=64이면 63비트 추가입니다.
                이것이 Massive MIMO에서 전통적 코드북 피드백이 비현실적인 근본 이유입니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Scaling Law ───────────────────────────────────────── */}
      <section id="jindal-scaling" className="scroll-mt-20">
        <SectionHeading icon={<Scaling className="h-5 w-5" />} title="스케일링 법칙: 피드백 비트와 SNR의 관계" collapsed={!!col['jindal-scaling']} onToggle={() => toggle('jindal-scaling')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['jindal-scaling'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="THE 핵심 결과" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              ZF 빔포밍 + RVQ 피드백에서, 완전 CSI 대비 사용자당 rate loss ΔR을 유한하게 유지하려면:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 p-4 dark:from-violet-900/20 dark:to-purple-900/20">
              <EquationRenderer latex={String.raw`B \;\geq\; (M-1)\,\log_2(\mathrm{SNR}) \;=\; (M-1)\,\frac{\mathrm{SNR_{dB}}}{3.01}`} />
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              즉, B는 SNR(dB)에 <span className="font-semibold text-violet-700 dark:text-violet-300">선형으로</span> 증가해야 하며,
              기울기는 <span className="font-semibold text-violet-700 dark:text-violet-300">(M-1)/3.01</span>입니다.
              안테나 수 M이 클수록 기울기가 가파릅니다.
            </p>

            <SubSectionHeading number="3.2" title="인터랙티브 시각화" />
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              아래 차트에서 안테나 수를 선택하여 SNR에 따른 필요 피드백 비트 수를 확인하세요.
              기울기 (M-1)/3.01이 M에 따라 얼마나 급격히 증가하는지 주목하세요:
            </p>
            <ScalingLawViz />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-800 dark:bg-violet-900/20">
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">왜 선형인가?</p>
                <p className="mt-1 text-xs text-violet-600 dark:text-violet-400">
                  SNR이 2배(+3dB)가 되면 간섭 전력도 2배가 됩니다.
                  이 추가 간섭을 상쇄하려면 양자화 오차를 절반으로 줄여야 하고,
                  이는 RVQ 상한에서 (M-1)비트 추가에 해당합니다.
                  결과적으로 B는 SNR(dB)에 선형으로 증가합니다.
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">B가 부족하면?</p>
                <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                  B가 (M-1)log₂(SNR)보다 느리게 증가하면,
                  rate loss가 SNR과 함께 무한히 커져서 다중화 이득이 사라집니다.
                  즉, SNR을 높여도 처리량이 포화되는 &quot;간섭 제한(interference-limited)&quot; 상황에 빠집니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="jindal-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['jindal-equations']} onToggle={() => toggle('jindal-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['jindal-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="RVQ 양자화 오차 상한" color="violet"
                latex={String.raw`\mathbb{E}\!\left[\sin^2\theta\right] \;\leq\; 2^{-\frac{B}{M-1}}`}
                description="M차원 단위 구 위에 2^B개 등방 코드워드를 배치했을 때, 채널 방향과 최근접 코드워드 사이 각도의 sin²값의 기대치 상한. (M-1)은 구 표면의 유효 차원(자유도)을 반영합니다. B를 (M-1)만큼 늘려야 오차가 절반으로 줄어드므로, 고차원(많은 안테나)에서 양자화 효율이 급격히 떨어집니다. 이 상한은 Zador의 율-왜곡(rate-distortion) 이론과 연결됩니다." />

              <EqCard idx={2} name="Rate Loss 상한" color="purple"
                latex={String.raw`\Delta R_k \;\leq\; \log_2\!\left(1 + (M-1)\,\mathrm{SNR}\cdot 2^{-\frac{B}{M-1}}\right)`}
                description="k번째 사용자의 rate loss(완전 CSI 대비 처리량 감소)의 상한. (M-1)·SNR·2^{-B/(M-1)} 항은 잔여 MUI의 간섭-대-신호비(ISR)에 해당합니다. B가 충분히 크면 이 항이 작아져 ΔR → 0이 되고, B가 부족하면 SNR 증가와 함께 ΔR이 무한히 커집니다. B = (M-1)log₂(SNR) + c를 대입하면 ΔR ≤ log₂(1 + (M-1)·2^{-c/(M-1)})로 SNR에 무관한 상수가 됩니다." />

              <EqCard idx={3} name="피드백 비트 스케일링 법칙" color="violet"
                latex={String.raw`B \;=\; (M-1)\,\log_2\!\left(\mathrm{SNR}\right) \;=\; (M-1)\,\frac{\mathrm{SNR_{dB}}}{3.01}`}
                description="이 논문의 가장 유명한 결과. 완전 CSI의 다중화 이득(DoF = M)을 유한 피드백으로 유지하기 위한 최소 피드백 비트의 스케일링 조건입니다. 물리적 의미: SNR이 3dB(2배) 증가할 때마다 (M-1)비트를 추가해야 잔여 간섭을 억제할 수 있습니다. M=4에서 SNR 20dB이면 B ≈ 3 × 6.64 ≈ 20비트, M=64이면 B ≈ 63 × 6.64 ≈ 418비트가 필요합니다." />

              <EqCard idx={4} name="양자화된 ZF의 SINR" color="green"
                latex={String.raw`\mathrm{SINR}_k \;=\; \frac{\frac{P}{M}\,|\mathbf{h}_k^H\mathbf{w}_k|^2}{1 + \frac{P}{M}\sum_{j \neq k}|\mathbf{h}_k^H\mathbf{w}_j|^2}`}
                description="k번째 사용자가 경험하는 신호 대 간섭+잡음 비. 분자는 원하는 신호 전력이고, 분모의 합산 항은 잔여 MUI입니다. 완전 CSI에서 ZF는 h_k^H w_j = 0을 만들어 분모의 간섭 항을 제거하지만, 양자화 오차로 인해 |h_k^H w_j|² ≈ sin²θ > 0이 됩니다. SNR(P)이 커질수록 간섭 항도 커져서, 충분한 피드백 없이는 SINR이 포화됩니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Implications ──────────────────────────────────────── */}
      <section id="jindal-implications" className="scroll-mt-20">
        <SectionHeading icon={<Lightbulb className="h-5 w-5" />} title="시사점: Massive MIMO와 딥러닝 CSI 압축" collapsed={!!col['jindal-implications']} onToggle={() => toggle('jindal-implications')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['jindal-implications'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="Massive MIMO에서의 피드백 폭증" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              5G NR에서 기지국 안테나 수는 M=32, 64, 128까지 증가합니다.
              Jindal의 스케일링 법칙에 따르면:
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-violet-50 dark:bg-violet-900/20">
                    <th className="px-3 py-2 text-left font-bold text-violet-700 dark:text-violet-300">안테나 수 M</th>
                    <th className="px-3 py-2 text-center font-bold text-violet-700 dark:text-violet-300">SNR 10dB</th>
                    <th className="px-3 py-2 text-center font-bold text-violet-700 dark:text-violet-300">SNR 20dB</th>
                    <th className="px-3 py-2 text-center font-bold text-violet-700 dark:text-violet-300">SNR 30dB</th>
                    <th className="px-3 py-2 text-left font-bold text-violet-700 dark:text-violet-300">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: '4',   b10: '10',  b20: '20',  b30: '30',  note: 'LTE급 — 전통 코드북 가능' },
                    { m: '16',  b10: '50',  b20: '100', b30: '150', note: 'Sub-6GHz MU-MIMO — 부담 증가' },
                    { m: '64',  b10: '209', b20: '418', b30: '627', note: 'Massive MIMO — 코드북 비현실적' },
                    { m: '128', b10: '422', b20: '843', b30: '1265', note: 'mmWave Massive — DL 압축 필수' },
                  ].map((r, i) => (
                    <tr key={i} className={i >= 2 ? 'bg-violet-50 dark:bg-violet-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-mono font-semibold ${i >= 2 ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300'}`}>M={r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.b10}bit</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.b20}bit</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${i >= 2 ? 'text-violet-700 dark:text-violet-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.b30}bit</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="5.2" title="딥러닝 기반 CSI 압축의 동기" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Jindal의 결과는 &quot;코드북 기반 피드백의 근본 한계&quot;를 보여줍니다.
              이 한계를 극복하기 위해 딥러닝 접근이 등장했습니다:
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-900/20">
                <p className="mb-1 text-xs font-bold text-violet-700 dark:text-violet-300">CsiNet (2018)</p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  채널 행렬을 이미지로 보고 오토인코더로 압축.<br/>
                  Jindal의 RVQ 코드북 대신 학습된 인코더/디코더 사용.<br/>
                  채널의 구조적 상관을 활용하여 비트 효율 대폭 향상.
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">핵심 차이</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Jindal: 채널이 i.i.d. Rayleigh → 구조 없음 → RVQ 최적.<br/>
                  실제 채널: 공간·주파수 상관 존재 → 구조 활용 가능.<br/>
                  DL 접근은 이 구조를 비선형 변환으로 포착.
                </p>
              </div>
              <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-4 dark:border-fuchsia-800 dark:bg-fuchsia-900/20">
                <p className="mb-1 text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">이론적 연결</p>
                <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400">
                  Jindal의 한계는 i.i.d. 채널의 하한(lower bound).<br/>
                  DL 압축은 실제 채널의 상관을 활용한 상한(upper bound).<br/>
                  두 결과의 갭이 DL의 이득 가능 영역.
                </p>
              </div>
            </div>

            <SubSectionHeading number="5.3" title="Point-to-Point vs. BC 피드백: 대조 정리" />
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-900/20">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-violet-200 dark:border-violet-800">
                      <th className="px-3 py-2 text-left text-violet-700 dark:text-violet-300">특성</th>
                      <th className="px-3 py-2 text-center text-violet-700 dark:text-violet-300">Point-to-Point</th>
                      <th className="px-3 py-2 text-center text-violet-700 dark:text-violet-300">Broadcast Channel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-100 dark:divide-violet-900/30">
                    {[
                      { feat: '피드백 역할', p2p: '배열 이득 추가', bc: '간섭 제거 (필수)' },
                      { feat: 'B 고정 시 DoF', p2p: '유지 (M)', bc: '손실 (1 → M)' },
                      { feat: 'B 스케일링', p2p: 'SNR 무관 (상수)', bc: 'B ∝ (M-1)log₂(SNR)' },
                      { feat: '피드백 부재 시', p2p: '다중화 가능', bc: '다중화 불가능' },
                    ].map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-semibold text-violet-700 dark:text-violet-300">{r.feat}</td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.p2p}</td>
                        <td className="px-3 py-2 text-center font-semibold text-violet-600 dark:text-violet-400">{r.bc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </section>

    </div>
    </GlossaryText>
  );
}
