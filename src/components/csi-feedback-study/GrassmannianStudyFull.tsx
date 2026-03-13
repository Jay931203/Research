'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Circle,
  Globe,
  Hash,
  Layers,
  Signal,
  TrendingDown,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'sky' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    sky:    'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
    blue:   'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };
  const badgeMap: Record<string, string> = {
    sky:    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-sky-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-sky-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.sky}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.sky}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}


/* ── Grassmannian Packing Visualization ─────────────────────── */

function GrassmannianPackingViz() {
  const [numCodewords, setNumCodewords] = useState(4);
  const CX = 180;
  const CY = 160;
  const R = 120;
  const SVG_W = 360;
  const SVG_H = 340;

  const codewords = useMemo(() => {
    const pts: { x: number; y: number; angle: number }[] = [];
    for (let i = 0; i < numCodewords; i++) {
      // Grassmann manifold G(2,1): lines through origin, so we only need [0, pi)
      const angle = (i * Math.PI) / numCodewords;
      pts.push({
        x: CX + R * Math.cos(angle),
        y: CY - R * Math.sin(angle),
        angle,
      });
    }
    return pts;
  }, [numCodewords]);

  const minAngleDeg = useMemo(() => {
    return (180 / numCodewords);
  }, [numCodewords]);

  // Chordal distance for the min-angle pair (adjacent codewords)
  const minChordalDist = useMemo(() => {
    const theta = Math.PI / numCodewords;
    return Math.sin(theta).toFixed(4);
  }, [numCodewords]);

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-4 dark:border-sky-900/40 dark:bg-sky-900/5">
      {/* Codeword count buttons */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">코드워드 수 N:</span>
        {[2, 4, 8, 16].map(n => (
          <button
            key={n}
            onClick={() => setNumCodewords(n)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              numCodewords === n
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-sky-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
            }`}
          >
            N = {n}
          </button>
        ))}
      </div>

      {/* SVG Visualization */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="mx-auto w-full max-w-[400px]" aria-label="Grassmannian 코드북 패킹 시각화">
          {/* Background circle (unit circle) */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 3" />

          {/* Origin point */}
          <circle cx={CX} cy={CY} r={3} fill="#64748b" />
          <text x={CX + 8} y={CY + 14} fontSize={10} fill="#64748b" fontWeight="bold">O</text>

          {/* Lines through origin (representing Grassmannian points = lines, not vectors) */}
          {codewords.map((cw, i) => {
            // Extend line in both directions through origin (since G(t,1) = lines)
            const x1 = CX + R * 1.1 * Math.cos(cw.angle);
            const y1 = CY - R * 1.1 * Math.sin(cw.angle);
            const x2 = CX - R * 1.1 * Math.cos(cw.angle);
            const y2 = CY + R * 1.1 * Math.sin(cw.angle);
            return (
              <line
                key={`line-${i}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={i === 0 ? '#0284c7' : i === 1 ? '#0ea5e9' : '#38bdf8'}
                strokeWidth={1.5}
                opacity={0.4}
              />
            );
          })}

          {/* Codeword points on the circle */}
          {codewords.map((cw, i) => (
            <g key={`cw-${i}`}>
              <circle
                cx={cw.x} cy={cw.y}
                r={6}
                fill={i === 0 ? '#0284c7' : i === 1 ? '#0ea5e9' : '#38bdf8'}
                stroke="white" strokeWidth={2}
              />
              {/* Antipodal point (same line) */}
              <circle
                cx={2 * CX - cw.x} cy={2 * CY - cw.y}
                r={4}
                fill={i === 0 ? '#0284c7' : i === 1 ? '#0ea5e9' : '#38bdf8'}
                opacity={0.35}
              />
              {/* Label */}
              {numCodewords <= 8 && (
                <text
                  x={cw.x + 10 * Math.cos(cw.angle)}
                  y={cw.y - 10 * Math.sin(cw.angle)}
                  fontSize={10}
                  fontWeight="bold"
                  fill="#0369a1"
                  textAnchor="middle"
                >
                  w{i + 1}
                </text>
              )}
            </g>
          ))}

          {/* Highlight minimum angle arc between first two codewords */}
          {numCodewords >= 2 && (() => {
            const a0 = codewords[0].angle;
            const a1 = codewords[1].angle;
            const arcR = R * 0.4;
            const startX = CX + arcR * Math.cos(a0);
            const startY = CY - arcR * Math.sin(a0);
            const endX = CX + arcR * Math.cos(a1);
            const endY = CY - arcR * Math.sin(a1);
            const largeArc = (a1 - a0) > Math.PI ? 1 : 0;
            return (
              <g>
                <path
                  d={`M ${startX} ${startY} A ${arcR} ${arcR} 0 ${largeArc} 0 ${endX} ${endY}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                />
                {/* Angle label */}
                <text
                  x={CX + (arcR + 16) * Math.cos((a0 + a1) / 2)}
                  y={CY - (arcR + 16) * Math.sin((a0 + a1) / 2)}
                  fontSize={11}
                  fontWeight="bold"
                  fill="#d97706"
                  textAnchor="middle"
                >
                  {minAngleDeg.toFixed(0)}°
                </text>
              </g>
            );
          })()}

          {/* Title and info */}
          <text x={SVG_W / 2} y={22} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#0369a1">
            G(2,1) 위의 코드북 패킹 (2D 투영)
          </text>
          <text x={SVG_W / 2} y={SVG_H - 12} textAnchor="middle" fontSize={10} fill="#64748b">
            점선 = 단위 원, 실선 = 코드워드(원점을 지나는 직선 = Grassmann 점)
          </text>
        </svg>
      </div>

      {/* Info panel */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-center dark:border-sky-800 dark:bg-sky-900/20">
          <p className="text-xs font-bold text-sky-700 dark:text-sky-300">코드워드 수 N</p>
          <p className="mt-1 text-lg font-bold text-sky-600 dark:text-sky-400">{numCodewords}</p>
          <p className="text-xs text-sky-500 dark:text-sky-400">= 2^B (B = {Math.log2(numCodewords)} bits)</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">최소 각도</p>
          <p className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">{minAngleDeg.toFixed(1)}°</p>
          <p className="text-xs text-amber-500 dark:text-amber-400">인접 코드워드 간 간격</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-900/20">
          <p className="text-xs font-bold text-green-700 dark:text-green-300">최소 코달 거리</p>
          <p className="mt-1 text-lg font-bold font-mono text-green-600 dark:text-green-400">{minChordalDist}</p>
          <p className="text-xs text-green-500 dark:text-green-400">sin(pi/N)</p>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-800 dark:bg-sky-900/20">
        <p className="text-xs leading-relaxed text-sky-800 dark:text-sky-200">
          <span className="font-bold">핵심 관찰:</span> N이 증가하면 코드워드가 원 위에 더 밀집되어 최소 각도가 줄어들고,
          코달 거리(chordal distance)도 감소합니다. 이는 더 세밀한 양자화(높은 B)가 빔포밍 벡터를 더 정밀하게 근사할 수 있지만,
          코드워드 간 구분력(packing quality)이 떨어짐을 의미합니다.
          Grassmannian 코드북은 이 <span className="font-semibold">최소 거리를 최대화</span>하는 최적 배치를 추구합니다.
        </p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function GrassmannianStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="grass-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-600 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">IEEE Trans. IT 2003</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Love & Heath Jr. & Strohmer</span>
              <span className="rounded-full bg-cyan-300/90 px-3 py-1 text-xs font-bold text-cyan-900">Grassmannian 코드북</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Grassmannian Beamforming for Multiple-Input Multiple-Output Wireless Systems
            </h2>
            <p className="mt-3 text-sm text-sky-200">
              Love, Heath Jr. & Strohmer · IEEE Transactions on Information Theory, 2003
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              MIMO 빔포밍에서 송신기가 채널 정보를 완전히 알 수 없을 때, 수신기가 제한된 피드백 비트로 최적 빔포밍 벡터를 전달하는 문제를 수학적으로 정립한 선구적 논문입니다.
              핵심 통찰: <span className="font-semibold text-sky-700 dark:text-sky-300">빔포밍 벡터의 양자화 코드북 설계 문제는 Grassmann 다양체 위에서의 최적 패킹(packing) 문제와 동치</span>이며,
              코드워드 간 <span className="font-semibold text-sky-700 dark:text-sky-300">최소 코달 거리(chordal distance)를 최대화</span>하는 것이 SNR 손실을 최소화하는 최적 기준임을 증명했습니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              또한 피드백 비트 수 B와 용량 손실 간의 스케일링 법칙 2^{'{-B/(t-1)}'}을 도출하여,
              안테나 수 t가 증가할수록 같은 성능을 유지하기 위해 필요한 피드백 비트가 선형으로 증가함을 정량적으로 보여주었습니다.
              이 결과는 이후 모든 제한 피드백(limited feedback) MIMO 연구의 이론적 기반이 되었습니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Grassmannian', 'Limited Feedback', 'Codebook Design', 'Chordal Distance', 'MIMO Beamforming', 'Packing Problem'].map(tag => (
                <span key={tag} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Background ──────────────────────────────────────── */}
      <section id="grass-background" className="scroll-mt-20">
        <SectionHeading icon={<Signal className="h-5 w-5" />} title="배경: 왜 제한 피드백이 필요한가?" collapsed={!!col['grass-background']} onToggle={() => toggle('grass-background')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['grass-background'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="MIMO 빔포밍 문제" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              t개의 송신 안테나와 r개의 수신 안테나를 가진 MIMO 시스템에서, 송신기는 빔포밍 벡터 w를 사용하여 신호를 특정 방향으로 집중합니다.
              채널 행렬 H가 완벽히 알려져 있다면, 최적 빔포밍 벡터는 H의 최대 특이값에 대응하는 우특이벡터(right singular vector)입니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
              <EquationRenderer latex={String.raw`\mathbf{w}_{\mathrm{opt}} = \mathbf{v}_1(\mathbf{H}) = \arg\max_{\|\mathbf{w}\|=1} \|\mathbf{H}\mathbf{w}\|^2`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              이 경우 수신 SNR이 최대화됩니다. 그러나 실제로 송신기가 H를 완벽히 아는 것은 비현실적입니다.
            </p>

            <SubSectionHeading number="1.2" title="완전 CSI가 비현실적인 이유" />
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">FDD 시스템의 한계</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  주파수 분할 이중화(FDD)에서는 업/다운링크 채널이 다름.
                  채널 상호성(reciprocity)을 활용할 수 없어 수신기가 추정한 CSI를 역방향 링크로 보내야 함.
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/10">
                <p className="mb-1 text-xs font-bold text-orange-700 dark:text-orange-300">피드백 대역폭 제약</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  역방향 링크의 대역폭은 제한적.
                  t x r 복소수 채널 행렬을 무손실로 피드백하면
                  비트 수가 안테나 수에 비례해 폭증.
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">채널 시변성</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  채널은 시간에 따라 변화.
                  피드백 지연이 있으면 완전 CSI를 보내도 송신 시점에는 이미 낡은 정보.
                  소수 비트의 방향 정보만이 실용적.
                </p>
              </div>
            </div>

            <SubSectionHeading number="1.3" title="코드북 기반 양자화의 아이디어" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              해결책: 송신기와 수신기가 사전에 공유하는 <span className="font-semibold text-sky-700 dark:text-sky-300">코드북</span> C = {'{'} c_1, c_2, ..., c_N {'}'} 을 정의합니다.
              수신기는 채널 H를 추정한 뒤, 코드북에서 최적에 가장 가까운 코드워드의 인덱스를 B = log2(N) 비트로 피드백합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
              <EquationRenderer latex={String.raw`\hat{\mathbf{w}} = \arg\max_{\mathbf{c}_i \in \mathcal{C}} \|\mathbf{H}\mathbf{c}_i\|^2`} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이 접근의 핵심 질문: 코드북 C를 어떻게 설계해야 양자화 손실이 최소화되는가?
              이것이 바로 이 논문이 해결하는 문제입니다.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Grassmann Manifold ──────────────────────────────── */}
      <section id="grass-manifold" className="scroll-mt-20">
        <SectionHeading icon={<Globe className="h-5 w-5" />} title="Grassmann 다양체와 코달 거리" collapsed={!!col['grass-manifold']} onToggle={() => toggle('grass-manifold')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['grass-manifold'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="Grassmann 다양체 G(t, 1)란?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              빔포밍 벡터 w는 단위 노름(||w|| = 1)을 가지므로 복소 단위 구 S^{'{2t-1}'}에 놓여 있습니다.
              그러나 빔포밍 성능 ||Hw||^2은 w에 임의의 위상 e^{'{j\\theta}'}를 곱해도 변하지 않습니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
              <EquationRenderer latex={String.raw`\|\mathbf{H}(e^{j\theta}\mathbf{w})\|^2 = \|\mathbf{H}\mathbf{w}\|^2 \quad \forall\, \theta \in [0, 2\pi)`} />
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              즉 빔포밍에서 중요한 것은 벡터의 <span className="font-semibold text-sky-700 dark:text-sky-300">방향(부분공간)</span>이지,
              위상(phase)이 아닙니다. 수학적으로, w와 e^{'{j\\theta}'}w는 같은 1차원 부분공간을 나타냅니다.
              이러한 1차원 부분공간들의 집합이 바로 <span className="font-semibold text-sky-700 dark:text-sky-300">Grassmann 다양체 G(t, 1)</span>입니다.
            </p>
            <div className="mb-5 rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
              <p className="text-xs font-bold text-sky-700 dark:text-sky-300">직관적 이해</p>
              <p className="mt-1 text-xs text-sky-600 dark:text-sky-400">
                실수 공간의 2D 비유: 단위 원 위의 점이 아니라, 원점을 지나는 <strong>직선</strong>이 Grassmann 점입니다.
                벡터 v와 -v는 같은 직선 위에 있으므로 같은 Grassmann 점을 나타냅니다.
                복소 공간에서는 v와 e^{'{j\\theta}'}v가 같은 점입니다.
                따라서 G(t,1)의 실제 차원은 단위 구보다 작습니다.
              </p>
            </div>

            <SubSectionHeading number="2.2" title="코달 거리 (Chordal Distance)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Grassmann 다양체 위에서 두 점(부분공간) 간의 거리를 측정하는 여러 메트릭이 있습니다.
              빔포밍 코드북 설계에서 가장 적합한 것은 <span className="font-semibold text-sky-700 dark:text-sky-300">코달 거리</span>입니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
              <EquationRenderer latex={String.raw`d_c(\mathbf{w}_1, \mathbf{w}_2) = \sqrt{1 - |\mathbf{w}_1^H \mathbf{w}_2|^2}`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              코달 거리는 0(완전히 같은 방향)에서 1(완전히 직교)까지의 값을 가집니다.
              위상 모호성에 불변(phase-invariant)이므로 Grassmann 다양체의 자연스러운 거리 척도입니다.
              |w_1^H w_2|^2는 두 벡터의 상관(correlation)의 제곱이므로,
              코달 거리 최대화 = 최대 상관 최소화와 동치입니다.
            </p>

            <SubSectionHeading number="2.3" title="인터랙티브: 코드북 패킹 시각화" />
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              아래는 G(2, 1)의 2D 투영으로, 원점을 지나는 직선들이 코드워드를 나타냅니다.
              코드워드 수 N을 변경하면서 최소 각도와 코달 거리가 어떻게 변화하는지 관찰하세요:
            </p>
            <GrassmannianPackingViz />
          </Card>
        </div>
      </section>

      {/* ── Codebook Design Criterion ──────────────────────── */}
      <section id="grass-codebook" className="scroll-mt-20">
        <SectionHeading icon={<BookOpen className="h-5 w-5" />} title="코드북 설계 기준" collapsed={!!col['grass-codebook']} onToggle={() => toggle('grass-codebook')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['grass-codebook'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="최적 코드북의 조건: Max-Min 패킹" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              양자화된 빔포밍의 SNR 손실은 선택된 코드워드와 실제 최적 빔포밍 방향 사이의 코달 거리에 비례합니다.
              최악의 경우 손실을 최소화하려면, 코드북의 <span className="font-semibold text-sky-700 dark:text-sky-300">최소 코달 거리를 최대화</span>해야 합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
              <EquationRenderer latex={String.raw`\mathcal{C}^* = \arg\max_{\mathcal{C} \subset G(t,1),\, |\mathcal{C}|=N} \;\min_{i \neq j}\; d_c(\mathbf{c}_i, \mathbf{c}_j)`} />
            </div>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              이것은 코드워드를 Grassmann 다양체 위에 가능한 한 균일하게 분포시키는 문제입니다.
              구면 위의 Tammes 문제(sphere packing)의 Grassmannian 버전으로 이해할 수 있습니다.
            </p>

            <SubSectionHeading number="3.2" title="상관 최소화와의 동치 관계" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              코달 거리의 정의에서, 최소 코달 거리를 최대화하는 것은 최대 상관을 최소화하는 것과 동치입니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
              <EquationRenderer latex={String.raw`\max\; \min_{i \neq j}\; d_c(\mathbf{c}_i, \mathbf{c}_j) \;\Longleftrightarrow\; \min\; \max_{i \neq j}\; |\mathbf{c}_i^H \mathbf{c}_j|^2`} />
            </div>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              즉, 좋은 코드북은 어떤 두 코드워드 쌍도 높은 상관을 갖지 않도록 설계됩니다.
              이는 Welch bound와 직접 연결됩니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-indigo-50 px-4 py-3 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`\max_{i \neq j} |\mathbf{c}_i^H \mathbf{c}_j| \;\geq\; \sqrt{\frac{N - t}{t(N - 1)}} \quad \text{(Welch Bound)}`} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welch bound에 도달하는 코드북이 존재하면 이것이 최적 Grassmannian 코드북입니다.
              일반적으로 이 bound에 도달하기 어렵지만, 일부 (t, N) 조합에서는 달성 가능합니다.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="grass-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['grass-equations']} onToggle={() => toggle('grass-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['grass-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="코달 거리 (Chordal Distance)" color="sky"
                latex={String.raw`d_c(\mathbf{w}_1, \mathbf{w}_2) = \sqrt{1 - |\mathbf{w}_1^H \mathbf{w}_2|^2}`}
                description="Grassmann 다양체 G(t,1) 위에서 두 부분공간(빔포밍 방향) 간의 거리. |w_1^H w_2|^2는 두 벡터 사이의 상관의 제곱으로, 0이면 직교(최대 거리 d_c=1), 1이면 동일 방향(d_c=0). 위상 모호성에 불변이므로 e^{j theta} w와 w의 거리는 0. 빔포밍 SNR 손실이 이 거리의 제곱에 비례하므로 코드북 설계의 핵심 메트릭." />

              <EqCard idx={2} name="코드북 설계 기준 (Max-Min Packing)" color="blue"
                latex={String.raw`\mathcal{C}^* = \arg\max_{\substack{\mathcal{C} \subset G(t,1) \\ |\mathcal{C}| = 2^B}} \;\min_{i \neq j}\; d_c(\mathbf{c}_i, \mathbf{c}_j)`}
                description="B비트 피드백에 대한 최적 코드북 설계 문제. 2^B개의 코드워드를 G(t,1) 위에 배치하되, 가장 가까운 쌍의 코달 거리를 최대화. Grassmann 다양체 위의 sphere packing 문제의 일종. NP-hard로 알려져 있어 일반적으로 수치적 최적화(alternating projection, gradient descent)나 대수적 구성법(algebraic construction)이 사용됨." />

              <EqCard idx={3} name="양자화된 빔포밍 SNR" color="indigo"
                latex={String.raw`\mathrm{SNR}_q = \frac{P}{N_0} \|\mathbf{H}\hat{\mathbf{w}}\|^2, \quad \hat{\mathbf{w}} = \arg\max_{\mathbf{c}_i \in \mathcal{C}} \|\mathbf{H}\mathbf{c}_i\|^2`}
                description="수신기가 코드북 C에서 수신 전력 ||Hc_i||^2를 최대화하는 코드워드를 선택하여 피드백. P는 송신 전력, N_0는 잡음 전력. 완전 CSI 대비 손실은 E[||Hw_opt||^2 - ||H w_hat||^2]이며, 코드북이 잘 설계될수록 이 손실이 작음. 선택은 수신기에서 수행되므로 채널 추정 오차에 강건." />

              <EqCard idx={4} name="용량 손실 상계 (Capacity Loss Bound)" color="green"
                latex={String.raw`\Delta C \leq \log_2\!\left(1 + \frac{P}{N_0}\,\sigma_1^2\right) - \log_2\!\left(1 + \frac{P}{N_0}\,\sigma_1^2(1 - \delta^2)\right)`}
                description="코달 거리 기반 양자화 오차 delta에 의한 용량 손실의 상계. sigma_1은 채널의 최대 특이값. delta = d_c(w_opt, w_hat)는 최적 빔포밍 방향과 양자화된 방향 사이의 코달 거리. 높은 SNR에서 Delta C approx (P/N_0) sigma_1^2 delta^2 / ln(2)로 근사되어 손실이 delta^2에 비례함을 보임. 따라서 코달 거리를 줄이는 것이 용량 손실을 직접 줄임." />

              <EqCard idx={5} name="완전 다이버시티를 위한 최소 코드북 크기" color="purple"
                latex={String.raw`N \geq 2^{B} \quad \text{with}\quad B \geq (t-1) \cdot \left\lceil \log_2\!\frac{1}{\epsilon} \right\rceil`}
                description="t개 송신 안테나에서 다이버시티 차수 t를 유지하면서 양자화 손실을 epsilon 이하로 보장하기 위한 최소 피드백 비트 수. 핵심 스케일링 법칙: 피드백 비트 B가 (t-1)에 비례해 증가해야 함. 즉 안테나 1개 추가 시 피드백 비트도 선형으로 증가. 이 (t-1) 의존성은 G(t,1)의 실수 차원이 2(t-1)인 것에서 기인. 용량 손실은 2^{-B/(t-1)}에 비례하여 지수적으로 감소." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Scaling Law ──────────────────────────────────────── */}
      <section id="grass-scaling" className="scroll-mt-20">
        <SectionHeading icon={<TrendingDown className="h-5 w-5" />} title="스케일링 법칙과 성능 분석" collapsed={!!col['grass-scaling']} onToggle={() => toggle('grass-scaling')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['grass-scaling'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="2^{-B/(t-1)} 스케일링 법칙" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              이 논문의 가장 중요한 이론적 결과 중 하나는 양자화 손실의 스케일링 법칙입니다.
              Grassmannian 코드북을 사용할 때, 평균 용량 손실은 다음과 같이 피드백 비트 수 B에 대해 지수적으로 감소합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
              <EquationRenderer latex={String.raw`\mathbb{E}[\Delta C] \;\propto\; 2^{-\frac{B}{t-1}}`} />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
                <p className="mb-1 text-xs font-bold text-sky-700 dark:text-sky-300">B 증가의 효과</p>
                <p className="text-xs text-sky-600 dark:text-sky-400">
                  피드백 비트 B를 (t-1)만큼 증가시키면 용량 손실이 절반으로 줄어듭니다.
                  예: t=4 안테나에서 B를 3비트 늘리면 손실이 1/2로.
                  이는 비트 추가의 한계수익이 체감함을 의미하며,
                  실용적 시스템에서 적절한 B를 선택하는 기준이 됩니다.
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">t 증가의 영향</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  안테나 수 t가 증가하면 같은 손실 수준을 유지하기 위해 더 많은 비트가 필요합니다.
                  지수의 분모가 (t-1)이므로, t가 크면 비트 추가의 효과가 약화됩니다.
                  이것이 Massive MIMO에서 제한 피드백의 근본적 어려움입니다.
                </p>
              </div>
            </div>

            <SubSectionHeading number="5.2" title="안테나 구성별 필요 피드백 비트 수" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              아래 표는 용량 손실을 약 0.5 bps/Hz 이하로 유지하기 위해 필요한 대략적인 피드백 비트 수를 보여줍니다:
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">안테나 수 (t)</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">G(t,1) 실수 차원</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">필요 비트 B</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">코드북 크기 N = 2^B</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { t: '2', dim: '2', b: '3-4', n: '8-16', note: '코드북 탐색 가능, 해석적 해 존재' },
                    { t: '4', dim: '6', b: '6-8', n: '64-256', note: '3GPP LTE에서 4비트(16개) 코드북 채택' },
                    { t: '8', dim: '14', b: '10-14', n: '1K-16K', note: '탐색 복잡도가 급증, 구조적 코드북 필요' },
                    { t: '16', dim: '30', b: '16-20', n: '64K-1M', note: 'Massive MIMO 영역, DFT 기반 코드북 사용' },
                    { t: '64', dim: '126', b: '50+', n: '> 10^15', note: '전통적 코드북 방식 한계, CS/DL 기반 접근' },
                  ].map((r, i) => (
                    <tr key={i} className={i <= 1 ? 'bg-sky-50 dark:bg-sky-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-mono font-semibold ${i <= 1 ? 'text-sky-700 dark:text-sky-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.t}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.dim}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${i <= 1 ? 'text-sky-700 dark:text-sky-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.b}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.n}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="5.3" title="완전 다이버시티 보장 조건" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              양자화된 빔포밍에서도 채널의 다이버시티 차수(diversity order)를 완전히 활용하려면,
              코드북 크기가 충분히 커야 합니다. 논문은 다음 조건을 도출합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-sky-50 px-4 py-3 dark:bg-sky-900/20">
              <EquationRenderer latex={String.raw`\text{Full diversity} \;\Longleftrightarrow\; \min_{i \neq j} d_c(\mathbf{c}_i, \mathbf{c}_j) > 0`} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              즉, 코드북의 어떤 두 코드워드도 같은 부분공간을 나타내면 안 됩니다(자명한 조건).
              실용적으로는 최소 거리가 충분히 커야 고 SNR에서 다이버시티 이득이 실현됩니다.
              Grassmannian 코드북은 이 최소 거리를 극대화하므로, 주어진 코드북 크기에서 최선의 다이버시티 성능을 보장합니다.
            </p>
          </Card>
        </div>
      </section>

    </div>
    </GlossaryText>
  );
}
