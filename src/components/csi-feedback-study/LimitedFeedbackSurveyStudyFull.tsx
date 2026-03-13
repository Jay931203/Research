'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  ChevronDown,
  Grid3X3,
  Hash,
  Radio,
  Signal,
  TrendingUp,
  Wifi,
  Zap,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'teal' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    teal:   'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    cyan:   'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    sky:    'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
  };
  const badgeMap: Record<string, string> = {
    teal:   'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    cyan:   'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    sky:    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-teal-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.teal}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.teal}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}


/* ── Feedback System Architecture SVG ─────────────────────────── */

function FeedbackArchitectureSVG() {
  const W = 700;
  const H = 200;

  return (
    <div className="overflow-x-auto rounded-xl border border-teal-200 bg-white p-4 dark:border-teal-800 dark:bg-gray-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" aria-label="Limited Feedback System Architecture">
        <rect x={20} y={50} width={100} height={90} rx={12} fill="#ccfbf1" stroke="#14b8a6" strokeWidth={1.5} />
        <text x={70} y={78} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#0f766e">수신기 (UE)</text>
        <text x={70} y={96} textAnchor="middle" fontSize={9} fill="#0d9488">채널 추정</text>
        <text x={70} y={110} textAnchor="middle" fontSize={9} fill="#0d9488">h → 코드북 탐색</text>
        <text x={70} y={124} textAnchor="middle" fontSize={9} fill="#0d9488">최적 인덱스 선택</text>
        <line x1={350} y1={40} x2={130} y2={40} stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#arrowGray)" strokeDasharray="6 3" />
        <text x={240} y={32} textAnchor="middle" fontSize={9} fill="#64748b">순방향 링크: 데이터 + 파일럿</text>
        <line x1={120} y1={95} x2={235} y2={95} stroke="#14b8a6" strokeWidth={2.5} markerEnd="url(#arrowTeal)" />
        <rect x={148} y={78} width={65} height={24} rx={6} fill="#99f6e4" stroke="#14b8a6" strokeWidth={1} />
        <text x={180} y={94} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#0f766e">B bits</text>
        <text x={180} y={115} textAnchor="middle" fontSize={8} fill="#0d9488">역방향 링크 (제한된 대역폭)</text>
        <rect x={240} y={55} width={110} height={80} rx={10} fill="#f0fdfa" stroke="#14b8a6" strokeWidth={1.5} strokeDasharray="4 2" />
        <text x={295} y={78} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#0f766e">공유 코드북</text>
        <text x={295} y={94} textAnchor="middle" fontSize={9} fill="#0d9488">C = {'{'} c₁, ..., c_N {'}'}</text>
        <text x={295} y={110} textAnchor="middle" fontSize={9} fill="#0d9488">N = 2^B 코드워드</text>
        <text x={295} y={126} textAnchor="middle" fontSize={8} fill="#5eead4">사전 공유 (양측 동일)</text>
        <line x1={350} y1={95} x2={410} y2={95} stroke="#14b8a6" strokeWidth={2} markerEnd="url(#arrowTeal)" />
        <rect x={415} y={50} width={120} height={90} rx={12} fill="#ccfbf1" stroke="#14b8a6" strokeWidth={1.5} />
        <text x={475} y={78} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#0f766e">송신기 (BS)</text>
        <text x={475} y={96} textAnchor="middle" fontSize={9} fill="#0d9488">인덱스 수신</text>
        <text x={475} y={110} textAnchor="middle" fontSize={9} fill="#0d9488">ŵ = c_î 적용</text>
        <text x={475} y={124} textAnchor="middle" fontSize={9} fill="#0d9488">빔포밍/프리코딩</text>
        <rect x={555} y={55} width={130} height={80} rx={10} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1.5} />
        <text x={620} y={76} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#92400e">핵심 질문</text>
        <text x={620} y={94} textAnchor="middle" fontSize={9} fill="#b45309">B비트로 충분한가?</text>
        <text x={620} y={110} textAnchor="middle" fontSize={9} fill="#b45309">코드북은 어떻게 설계?</text>
        <text x={620} y={126} textAnchor="middle" fontSize={9} fill="#b45309">성능 손실은 얼마나?</text>
        <line x1={535} y1={95} x2={553} y2={95} stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#arrowAmber)" />
        <defs>
          <marker id="arrowTeal" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#14b8a6" />
          </marker>
          <marker id="arrowGray" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
          </marker>
          <marker id="arrowAmber" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/* ── Feedback Gain Interactive Visualization ──────────────────── */

function FeedbackGainViz() {
  const [numAntennas, setNumAntennas] = useState(4);
  const [numBits, setNumBits] = useState(4);

  const numCodewords = Math.pow(2, numBits);
  const quantLoss = Math.pow(2, -numBits / (numAntennas - 1));
  const capRatio = Math.max(0, 1 - quantLoss);
  const perfectArrayGainDb = (10 * Math.log10(numAntennas)).toFixed(1);
  const quantArrayGainDb = (10 * Math.log10(numAntennas * capRatio)).toFixed(1);
  // MU-MIMO required bits
  const muRequiredBitsPerDb = numAntennas - 1;

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-4 dark:border-teal-900/40 dark:bg-teal-900/5">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            송신 안테나 수 (M<sub>t</sub>): <span className="font-mono text-teal-600 dark:text-teal-400">{numAntennas}</span>
          </label>
          <div className="flex gap-2">
            {[2, 4, 8, 16].map(t => (
              <button key={t} onClick={() => setNumAntennas(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  numAntennas === t ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-teal-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
                }`}>
                t={t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            피드백 비트 수 (B): <span className="font-mono text-teal-600 dark:text-teal-400">{numBits}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 6, 8, 12, 16].map(b => (
              <button key={b} onClick={() => setNumBits(b)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  numBits === b ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-teal-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
                }`}>
                B={b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-center dark:border-teal-800 dark:bg-teal-900/20">
          <p className="text-xs font-bold text-teal-700 dark:text-teal-300">코드북 크기</p>
          <p className="mt-1 font-mono text-lg font-bold text-teal-600 dark:text-teal-400">{numCodewords}</p>
          <p className="text-xs text-teal-500 dark:text-teal-400">N = 2^{numBits}</p>
        </div>
        <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-center dark:border-cyan-800 dark:bg-cyan-900/20">
          <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300">양자화 손실</p>
          <p className="mt-1 font-mono text-lg font-bold text-cyan-600 dark:text-cyan-400">{(quantLoss * 100).toFixed(1)}%</p>
          <p className="text-xs text-cyan-500 dark:text-cyan-400">2^(-B/(t-1))</p>
        </div>
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-center dark:border-sky-800 dark:bg-sky-900/20">
          <p className="text-xs font-bold text-sky-700 dark:text-sky-300">완전 CSI 이득</p>
          <p className="mt-1 font-mono text-lg font-bold text-sky-600 dark:text-sky-400">{perfectArrayGainDb} dB</p>
          <p className="text-xs text-sky-500 dark:text-sky-400">10log₁₀(t)</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-900/20">
          <p className="text-xs font-bold text-green-700 dark:text-green-300">양자화 후 이득</p>
          <p className="mt-1 font-mono text-lg font-bold text-green-600 dark:text-green-400">{Number(quantArrayGainDb) > 0 ? quantArrayGainDb : '0'} dB</p>
          <p className="text-xs text-green-500 dark:text-green-400">유효 배열 이득</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-teal-200 bg-white p-4 dark:border-teal-800 dark:bg-gray-900">
        <p className="mb-2 text-xs font-bold text-gray-600 dark:text-gray-400">용량 달성률 (완전 CSI 대비)</p>
        <div className="relative h-6 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500" style={{ width: `${capRatio * 100}%` }} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800 dark:text-gray-200">{(capRatio * 100).toFixed(1)}%</span>
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0% (피드백 없음)</span>
          <span>100% (완전 CSI)</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800 dark:bg-teal-900/20">
        <p className="text-xs leading-relaxed text-teal-800 dark:text-teal-200">
          <span className="font-bold">SU-MIMO:</span> t={numAntennas} 안테나, B={numBits}비트 → 양자화 손실 {(quantLoss * 100).toFixed(1)}%, 용량 달성률 {(capRatio * 100).toFixed(1)}%. B가 고정이면 SNR 증가해도 손실 상한 일정.
          {' '}<span className="font-bold">MU-MIMO:</span> SNR 20dB에서 B ≥ {muRequiredBitsPerDb} × log₂(100) ≈ {(muRequiredBitsPerDb * Math.log2(100)).toFixed(0)}비트 필요.
          {numBits >= 3 * (numAntennas - 1) && (
            <span className="font-semibold text-green-600 dark:text-green-400">
              {' '}B ≥ 3(t-1)={3 * (numAntennas - 1)} 달성: 소수 비트로 대부분의 이득 확보.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function LimitedFeedbackSurveyStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="lfsurvey-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">IEEE JSAC, Vol.26, No.8, Oct 2008</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">pp.1341-1365 (25 pages)</span>
              <span className="rounded-full bg-teal-300/90 px-3 py-1 text-xs font-bold text-teal-900">서베이 / 튜토리얼</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">373 참고문헌</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">~1235회 인용</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              An Overview of Limited Feedback in Wireless Communication Systems
            </h2>
            <p className="mt-3 text-sm text-teal-200">
              Love, Heath, Lau, Gesbert, Rao &amp; Andrews
            </p>
            <p className="mt-1 text-xs text-teal-300/80">
              MIMO 시스템의 제한된 피드백을 SA/MA × NB/BB × SU/MU의 모든 조합으로 체계화한 결정적 서베이.
              이후 10년간 LTE/NR 코드북 설계와 피드백 이론의 근간이 된 핵심 참고문헌.
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              이 논문의 핵심 질문: <span className="font-semibold text-teal-700 dark:text-teal-300">&ldquo;소수의 피드백 비트만으로도 완전 CSI에 근접하는 성능을 달성할 수 있는가?&rdquo;</span>
              답은 시나리오에 따라 달라집니다. 단일 사용자에서는 <strong>B비트만으로 충분</strong>(SNR 무관)하지만,
              다중 사용자에서는 <strong>B가 SNR에 비례</strong>해야 합니다.
              이 근본적 차이가 논문의 가장 중요한 통찰입니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Limited Feedback', 'Codebook Design', 'Grassmannian Packing', 'MISO Beamforming', 'MIMO Precoding', 'MU-MIMO', 'OFDM', 'Scaling Law', 'CDI/CQI', '3GPP Standards'].map(tag => (
                <span key={tag} className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Paper Coverage Matrix ─────────────────────────────── */}
      <section id="lfsurvey-core" className="scroll-mt-20">
        <SectionHeading icon={<Grid3X3 className="h-5 w-5" />} title="논문 체계: SA/MA × NB/BB × SU/MU 커버리지" collapsed={!!col['lfsurvey-core']} onToggle={() => toggle('lfsurvey-core')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['lfsurvey-core'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="논문의 체계적 분류 매트릭스" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Love et al.은 무선 시스템의 제한된 피드백을 <strong>안테나 구성 × 대역폭 × 사용자 수</strong>의 세 축으로 분류합니다.
              이 매트릭스가 논문 전체의 골격이며, 각 조합마다 핵심 결과와 설계 원칙이 다릅니다.
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-teal-50 dark:bg-teal-900/20">
                    <th className="px-3 py-2 text-left font-bold text-teal-700 dark:text-teal-300">시나리오</th>
                    <th className="px-3 py-2 text-center font-bold text-teal-700 dark:text-teal-300">핵심 기법</th>
                    <th className="px-3 py-2 text-center font-bold text-teal-700 dark:text-teal-300">피드백 내용</th>
                    <th className="px-3 py-2 text-center font-bold text-teal-700 dark:text-teal-300">B 스케일링</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { sc: 'SU-SA-NB', tech: 'SNR 양자화, On/Off, ARQ', fb: 'SNR 또는 Rate', scale: '상수 (소수 비트)' },
                    { sc: 'SU-SA-BB', tech: 'OFDM 서브캐리어 할당', fb: '서브캐리어 On/Off, AMC', scale: '서브밴드 수에 비례' },
                    { sc: 'SU-MA-NB (MISO)', tech: '코드북 빔포밍 (핵심)', fb: 'CDI: h/||h|| → 인덱스', scale: 'SNR 무관 (상수)' },
                    { sc: 'SU-MA-NB (MIMO)', tech: '프리코딩 행렬 (SVD)', fb: 'G(Nt,r) 부분공간', scale: 'SNR 무관, rank에 비례' },
                    { sc: 'SU-MA-BB', tech: 'OFDM+프리코딩, 보간', fb: '파일럿 서브캐리어의 CDI', scale: '서브밴드 수 × CDI 비트' },
                    { sc: 'MU-MA-NB', tech: 'ZF 빔포밍 + CDI/CQI', fb: 'CDI + CQI 분리', scale: 'B ≥ (M-1)log₂(SNR)' },
                  ].map((r, i) => (
                    <tr key={i} className={i === 5 ? 'bg-teal-50/50 dark:bg-teal-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className="px-3 py-2 font-semibold text-teal-700 dark:text-teal-300">{r.sc}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.tech}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.fb}</td>
                      <td className="px-3 py-2 text-center font-mono font-semibold text-gray-700 dark:text-gray-300">{r.scale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="1.2" title="MIMO 시스템의 피드백 딜레마" />
            <FeedbackArchitectureSVG />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">대역폭 제약</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  역방향 링크는 데이터와 제어 신호가 공유하는 제한된 자원.
                  M_t×M_r 복소수 채널을 피드백하면 2M_tM_r × (양자화 비트)가 필요하며, OFDM에서 서브캐리어별 반복 시 비트 수 폭증.
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/10">
                <p className="mb-1 text-xs font-bold text-orange-700 dark:text-orange-300">지연 제약</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  채널 코히런스 시간 T_c 내에 피드백이 도착해야 유효.
                  높은 이동성에서 T_c가 짧아져 무손실 CSI 피드백 불가. 소수 비트는 코히런스 시간 내 전송 가능.
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">에너지 제약</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  UE는 배터리 구동. 피드백 전송 에너지는 데이터 전송 에너지를 잠식.
                  소수 비트 피드백은 에너지 효율도 개선합니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── SU-SA: Single Antenna ──────────────────────────────── */}
      <section id="lfsurvey-beamforming" className="scroll-mt-20">
        <SectionHeading icon={<Signal className="h-5 w-5" />} title="단일 안테나 피드백 (SU-SA-NB / SU-SA-BB)" collapsed={!!col['lfsurvey-beamforming']} onToggle={() => toggle('lfsurvey-beamforming')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['lfsurvey-beamforming'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="SU-SA-NB: 협대역 단일 안테나" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              가장 단순한 시나리오로, 제한된 피드백의 핵심 개념을 보여줍니다.
              완전 CSI에서 최적 전력 적응은 <strong>워터필링(waterfilling)</strong>이지만,
              제한된 피드백에서는 SNR을 양자화합니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-teal-50 px-4 py-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`\gamma[k] = |h[k]|^2 \cdot \frac{P}{N_0}`} />
            </div>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-300">SNR 양자화 (Lloyd 알고리즘)</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  수신 SNR γ = |h[k]|²을 B비트로 양자화. 최적 양자화기는 Lloyd-Max 알고리즘으로 설계하여
                  왜곡을 최소화하는 2^B개의 경계와 대표값을 찾습니다.
                  채널 분포(예: Rayleigh)에 맞춘 비균일 양자화가 핵심.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="mb-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">On/Off 전력 적응 (1비트) 및 ARQ</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  가장 극단적인 제한: 1비트만 피드백. 채널이 임계값 γ_th 이상이면 전송(On), 미만이면 대기(Off).
                  ARQ의 ACK/NACK도 1비트 피드백의 한 형태로, 수신 성공 여부를 알려줍니다.
                  놀랍게도 이 1비트만으로도 평균 처리량이 상당히 개선됩니다.
                  <strong> Rate 양자화</strong>도 가능: 최적 rate 파티션을 설계하여 B비트로 2^B개 rate 레벨 중 선택.
                </p>
              </div>
            </div>

            <SubSectionHeading number="2.2" title="SU-SA-BB: 광대역 OFDM" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              OFDM에서 각 서브캐리어 v의 신호 모델:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-teal-50 px-4 py-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`y_v[k] = H_v[k]\, x_v[k] + n_v[k], \quad v = 1, \ldots, V`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              V개 서브캐리어 각각에 독립적으로 전력/레이트를 할당하면 최적이지만, 피드백 오버헤드가 V에 비례합니다.
              실용적 접근:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">서브캐리어 On/Off</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">V비트로 각 서브캐리어의 사용 여부만 피드백</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">서브채널화</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">인접 서브캐리어를 서브밴드로 그룹핑, 서브밴드 단위 피드백</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">AMC (적응적 변조/코딩)</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">서브밴드별 CQI → MCS 선택으로 rate 적응</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── SU-MA-NB: MISO/MIMO Beamforming (CORE) ──────────────── */}
      <section id="lfsurvey-multiplexing" className="scroll-mt-20">
        <SectionHeading icon={<Radio className="h-5 w-5" />} title="다중 안테나 빔포밍과 코드북 설계 (핵심)" collapsed={!!col['lfsurvey-multiplexing']} onToggle={() => toggle('lfsurvey-multiplexing')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['lfsurvey-multiplexing'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="MISO 빔포밍 시스템 모델 (M_t × 1)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              M_t개 송신 안테나, 1개 수신 안테나(MISO) 시스템. 수신 신호:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-teal-50 px-4 py-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`y[k] = \mathbf{h}^T[k]\, \mathbf{x}[k] + n[k], \quad \mathbf{x}[k] = \sqrt{\rho}\, \mathbf{f}[k]\, s[k], \quad \|\mathbf{f}\| = 1`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              최적 빔포밍 벡터는 <strong>정합 필터(MRT)</strong>: f = h*/||h||. 수신 SNR = ρ|h^T f|².
              이를 정확히 피드백하려면 (M_t - 1)개의 복소수가 필요합니다(위상 모호성 제거 후).
            </p>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              B비트 코드북 기반 빔포밍: 코드북 F = &#123;f₁, ..., f_{'{'}2^B{'}'}&#125;에서 최적 선택:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-teal-50 px-4 py-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`n_{\text{opt}} = \arg\max_{1 \leq i \leq 2^B} |\mathbf{h}^T \mathbf{f}_i|^2, \quad C = \log_2(1 + \rho\, |\mathbf{h}^T \mathbf{f}|^2)`} />
            </div>

            <SubSectionHeading number="3.2" title="코드북 설계의 네 가지 방법" />
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-300">a) 안테나 선택</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  가장 단순: n_opt = argmax |h_m[k]|². 코드북이 표준 기저벡터 e_1,...,e_{'{'}M_t{'}'}.
                  B = log₂(M_t) 비트만 필요하지만, 단일 안테나만 사용하므로 배열 이득 제한적.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="mb-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">b) 채널 벡터 양자화</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  훈련 데이터로 채널 벡터를 직접 양자화. 코드북 H = &#123;h₁,...,h_{'{'}2^B{'}'}&#125;,
                  선택 기준: max |h_n* h[k]|². Lloyd-Max 알고리즘의 벡터 확장.
                  채널 분포에 맞춰 최적화되지만, 분포 변화에 취약.
                </p>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
                <p className="mb-1 text-xs font-bold text-sky-700 dark:text-sky-300">c) K-Phase 양자화 (2×1 MISO)</p>
                <div className="my-2 overflow-x-auto"><EquationRenderer latex={String.raw`\mathbf{f}_i = \frac{1}{\sqrt{2}} \begin{bmatrix} 1 \\ e^{j2\pi i/K} \end{bmatrix}, \quad i = 0, 1, \ldots, K-1`} /></div>
                <p className="text-xs text-sky-600 dark:text-sky-400">
                  2×1 MISO에서 위상만 양자화. K개 위상으로 B = log₂(K) 비트.
                  3GPP WCDMA의 1비트 위상 피드백(0 또는 π)이 이 구조의 특수 경우.
                </p>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">d) Grassmannian Line Packing (최적)</p>
                <div className="my-2 overflow-x-auto"><EquationRenderer latex={String.raw`d(\mathcal{F}) = \min_{i < j} \sin(\theta_{ij}), \quad \theta_{ij} = \arccos(|\mathbf{f}_i^* \mathbf{f}_j|)`} /></div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  코달 거리 d_c = √(1 - |f_i* f_j|²) = sin(θ_{'{'}ij{'}'})를 최대화.
                  위상 모호성에 불변이므로 빔포밍의 자연 거리 척도. Love &amp; Heath (2003)의 핵심 기여.
                </p>
              </div>
            </div>

            <SubSectionHeading number="3.3" title="용량 손실 상한 (핵심 수식)" />
            <div className="mb-4 overflow-x-auto rounded-lg border-2 border-teal-300 bg-teal-50 px-4 py-4 dark:border-teal-700 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`\mathbb{E}[\Delta C] \leq \log_2\!\left(1 + \text{SNR} \cdot (N_t - 1) \cdot 2^{-\frac{B}{N_t - 1}}\right)`} />
            </div>
            <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800 dark:bg-teal-900/20">
              <p className="text-xs leading-relaxed text-teal-800 dark:text-teal-200">
                <span className="font-bold">핵심 통찰:</span> 고 SNR에서 이 상한은 <strong>SNR에 독립적인 상수로 수렴</strong>합니다.
                즉, B비트의 고정된 피드백만으로도 SNR이 아무리 높아도 용량 손실이 bounded됩니다!
                이것이 단일 사용자에서 제한된 피드백이 실용적인 근본 이유입니다.
                (N_t - 1)은 Grassmann 다양체 G(N_t, 1)의 복소 차원으로, 양자화해야 할 자유도를 나타냅니다.
              </p>
            </div>

            <SubSectionHeading number="3.4" title="MIMO 프리코딩 확장 (M_t × M_r)" />
            <div className="mb-3 overflow-x-auto rounded-lg bg-teal-50 px-4 py-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`\mathbf{y}[k] = \sqrt{\rho}\, \mathbf{H}[k]\, \mathbf{F}[k]\, \mathbf{s}[k] + \mathbf{n}[k], \quad \|\mathbf{F}\|_F^2 \leq M`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              최적 프리코더 F[k]는 H의 SVD에서 우측 특이벡터. rank-r 프리코딩의 코드북은 Grassmann 다양체 G(N_t, r) 위의 부분공간 패킹:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-cyan-50 px-4 py-3 dark:bg-cyan-900/20">
              <EquationRenderer latex={String.raw`\hat{\mathbf{F}} = \arg\max_{\mathbf{F}_i \in \mathcal{C}} \log\det\!\left(\mathbf{I} + \frac{\text{SNR}}{r}\, \mathbf{F}_i^H \mathbf{H}^H \mathbf{H}\, \mathbf{F}_i\right)`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              G(N_t, r)의 실수 차원은 2r(N_t - r). 예: N_t=4, r=2이면 dim=8로, rank-1(dim=6)보다 코드북이 훨씬 커야 합니다.
              Rate loss는 선택된 부분공간과 최적 부분공간 사이의 <strong>주각(principal angles)</strong>에 의해 결정됩니다.
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-cyan-50 px-4 py-3 dark:bg-cyan-900/20">
              <EquationRenderer latex={String.raw`\Delta R_{\text{precoding}} \propto 2^{-\frac{B}{r(N_t - r)}}, \quad \dim_{\mathbb{R}} G(N_t, r) = 2r(N_t - r)`} />
            </div>
            <div className="mb-4 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800 dark:bg-cyan-900/20">
              <p className="text-xs leading-relaxed text-cyan-800 dark:text-cyan-200">
                <span className="font-bold">차원의 저주:</span> rank가 높아질수록 필요한 비트 수가 급증합니다.
                N_t=4일 때 rank-1은 dim=6이지만 rank-2는 dim=8, rank-3은 dim=6(대칭).
                N_t=8, rank-4이면 dim=32로, 같은 양자화 정밀도에 필요한 비트 수가 비현실적으로 커집니다.
                이것이 Massive MIMO 시대에 코드북 방식의 근본 한계이며, DL 기반 피드백의 동기입니다.
              </p>
            </div>

            <SubSectionHeading number="3.5" title="인터랙티브: 피드백 이득 계산기" />
            <FeedbackGainViz />
          </Card>
        </div>
      </section>

      {/* ── SU-MA-BB: Broadband MIMO ────────────────────────────── */}
      <section id="lfsurvey-multiuser" className="scroll-mt-20">
        <SectionHeading icon={<Wifi className="h-5 w-5" />} title="광대역 MIMO-OFDM 피드백" collapsed={!!col['lfsurvey-multiuser']} onToggle={() => toggle('lfsurvey-multiuser')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['lfsurvey-multiuser'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="SU-MA-BB: OFDM + 프리코딩" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              OFDM에서 서브캐리어 v마다 독립적인 채널 행렬 H_v[k]가 존재합니다:
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-teal-50 px-4 py-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`\mathbf{y}_v[k] = \mathbf{H}_v[k]\, \mathbf{F}_v[k]\, \mathbf{s}_v[k] + \mathbf{n}_v[k], \quad v = 1, \ldots, V`} />
            </div>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              V개 서브캐리어 각각에 프리코더를 독립 피드백하면 B_total = V × B_per로 비트 수 폭증.
              핵심 해결책: 주파수 상관을 활용한 효율적 피드백.
            </p>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-300">보간 기반 피드백</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  파일럿 서브캐리어에서만 빔포머를 피드백하고, 중간 서브캐리어는 보간:
                </p>
                <div className="mt-2 overflow-x-auto"><EquationRenderer latex={String.raw`\mathbf{f}[k] = \frac{b_i \mathbf{f}_i + b_j \mathbf{f}_j}{\|b_i \mathbf{f}_i + b_j \mathbf{f}_j\|}`} /></div>
                <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                  Grassmann 다양체 위의 측지선(geodesic) 보간으로 위상 회전 θ_l 적용.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="mb-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">변환 도메인 피드백</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  주파수 도메인의 채널을 DFT 등으로 변환하여 지연(delay) 도메인에서 압축적으로 표현.
                  소수의 지배적 탭만 피드백하면 전체 주파수 응답 복원 가능. NR Type II Enhanced의 기초 아이디어.
                </p>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
                <p className="mb-1 text-xs font-bold text-sky-700 dark:text-sky-300">서브밴드 그룹핑</p>
                <p className="text-xs text-sky-600 dark:text-sky-400">
                  인접 서브캐리어를 서브밴드로 묶어 동일 프리코더 적용.
                  3GPP NR의 Wideband + Subband CQI/PMI 구조가 이 접근.
                  채널 변동이 큰 서브밴드에 더 많은 비트 할당 가능.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── MU-MIMO ──────────────────────────────────────────────── */}
      <section id="lfsurvey-equations" className="scroll-mt-20">
        <SectionHeading icon={<TrendingUp className="h-5 w-5" />} title="다중 사용자 MIMO와 스케일링 법칙 (핵심)" collapsed={!!col['lfsurvey-equations']} onToggle={() => toggle('lfsurvey-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['lfsurvey-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="MISO 방송 채널 모델" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              M개 안테나 기지국이 K명의 단일 안테나 사용자에게 동시 전송하는 방송 채널(BC):
            </p>
            <div className="mb-3 overflow-x-auto rounded-lg bg-teal-50 px-4 py-3 dark:bg-teal-900/20">
              <EquationRenderer latex={String.raw`y_i[k] = \mathbf{h}_i^T[k]\, \mathbf{x}[k] + n_i[k], \quad \mathbf{x}[k] = \sqrt{\rho}\, \mathbf{F}[k]\, \mathbf{s}[k]`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              ZF 빔포밍으로 다중 사용자 간섭을 제거하려면, 송신기가 모든 사용자의 채널 방향을 정확히 알아야 합니다.
              양자화 오차가 있으면 <strong>잔여 간섭(residual interference)</strong>이 발생합니다.
            </p>

            <SubSectionHeading number="5.2" title="Jindal (2006) 스케일링 법칙" />
            <div className="mb-4 overflow-x-auto rounded-lg border-2 border-indigo-300 bg-indigo-50 px-4 py-4 dark:border-indigo-700 dark:bg-indigo-900/20">
              <EquationRenderer latex={String.raw`B \geq (M - 1) \cdot \log_2(\text{SNR}) \quad \text{bits per user (MU-MIMO)}`} />
            </div>
            <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-900/20">
              <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-200">
                <span className="font-bold">SU vs MU 근본적 차이:</span> 단일 사용자에서 양자화 오차는 <strong>원하는 신호의 SNR 손실</strong>만 유발하므로 B를 고정해도 multiplexing gain 유지.
                그러나 다중 사용자에서 양자화 오차는 <strong>다른 사용자에 대한 간섭</strong>으로 작용하며,
                잔여 간섭 전력이 SNR × 2^{'{-B/(M-1)}'}에 비례합니다.
                B가 고정이면 SNR 증가 시 간섭이 무한히 커져 sum rate에 상한(ceiling)이 생깁니다.
                B = (M-1)log₂(SNR)으로 스케일링해야 완전 CSI의 multiplexing gain M·log₂(SNR)을 달성합니다.
              </p>
            </div>

            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-teal-50 dark:bg-teal-900/20">
                    <th className="px-3 py-2 text-left font-bold text-teal-700 dark:text-teal-300">특성</th>
                    <th className="px-3 py-2 text-center font-bold text-teal-700 dark:text-teal-300">SU-MIMO</th>
                    <th className="px-3 py-2 text-center font-bold text-teal-700 dark:text-teal-300">MU-MIMO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { feat: '피드백 목적', su: '배열 이득 확보', mu: '간섭 제거 (필수)' },
                    { feat: '피드백 없을 때', su: '다중화 가능, 배열 이득 손실', mu: '다중화 이득 자체 소멸' },
                    { feat: 'B 고정 시 DoF', su: '유지 (min(t,r))', mu: '간섭 floor → DoF 손실' },
                    { feat: 'B 스케일링 (SNR)', su: '상수 (SNR 무관!)', mu: 'B ∝ (M-1)·log₂(SNR)' },
                    { feat: '양자화 오차 영향', su: 'SNR 손실 ∝ 2^{-B/(t-1)}', mu: '잔여 간섭 ∝ SNR·2^{-B/(M-1)}' },
                    { feat: '핵심 논문', su: 'Love & Heath (2003)', mu: 'Jindal (2006)' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-semibold text-teal-700 dark:text-teal-300">{r.feat}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.su}</td>
                      <td className="px-3 py-2 text-center font-semibold text-teal-600 dark:text-teal-400">{r.mu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="5.3" title="스케일링 법칙의 직관적 이해" />
            <div className="mb-4 space-y-3">
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-300">SU-MISO 빔포밍: 왜 B가 상수로 충분한가?</p>
                <div className="my-2 overflow-x-auto"><EquationRenderer latex={String.raw`C_{\text{quantized}} = \log_2(1 + \rho\,\|\mathbf{h}\|^2 \cos^2\theta) \approx C_{\text{perfect}} - \underbrace{\frac{\rho\,\|\mathbf{h}\|^2 \sin^2\theta}{\ln 2 \cdot (1 + \rho\,\|\mathbf{h}\|^2)}}_{\text{bounded as } \rho \to \infty}`} /></div>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  양자화 오차 sin²θ가 원하는 신호만 감소시킵니다. 고 SNR에서 분모의 ρ||h||² 항이 지배하여 비율이 상수에 수렴.
                  따라서 B비트 고정만으로 모든 SNR에서 bounded loss.
                </p>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="mb-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">MU-MIMO ZF: 왜 B가 SNR에 비례해야 하는가?</p>
                <div className="my-2 overflow-x-auto"><EquationRenderer latex={String.raw`\text{SINR}_k = \frac{\rho\,|\hat{\mathbf{h}}_k^T \mathbf{w}_k|^2}{1 + \rho\,\sum_{j \neq k} |\hat{\mathbf{h}}_k^T \mathbf{w}_j|^2} \approx \frac{\rho}{1 + \rho \cdot (M-1) \cdot 2^{-B/(M-1)}}`} /></div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  양자화 오차가 <strong>다른 사용자 방향으로의 간섭</strong>으로 작용.
                  간섭 전력이 ρ·2^{'{-B/(M-1)}'}에 비례하므로, B 고정 시 ρ 증가에 따라 SINR이 상수에 수렴(ceiling).
                  B = (M-1)log₂(ρ)로 스케일링하면 간섭이 상수가 되어 full DoF 달성.
                </p>
              </div>
            </div>

            <SubSectionHeading number="5.4" title="CDI/CQI 분리와 3GPP 매핑" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              실용적 시스템에서 CSI 피드백은 두 가지로 분리됩니다. 이 분리가 3GPP 표준의 PMI/CQI 구조로 직결됩니다:
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-1 text-xs font-bold text-teal-700 dark:text-teal-300">CDI (Channel Direction Information)</p>
                <div className="my-2 overflow-x-auto"><EquationRenderer latex={String.raw`\text{CDI} = \frac{\mathbf{h}}{\|\mathbf{h}\|} \;\xrightarrow{\text{코드북}}\; B_{\text{dir}} \text{ bits}`} /></div>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  채널의 <strong>방향</strong>을 Grassmannian 코드북으로 양자화.
                  빔포밍/프리코딩 벡터를 결정. 3GPP에서 <strong>PMI (Precoding Matrix Indicator)</strong>로 표준화.
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">CQI (Channel Quality Indicator)</p>
                <div className="my-2 overflow-x-auto"><EquationRenderer latex={String.raw`\text{CQI} = \|\mathbf{h}\|^2 \text{ or effective SINR} \;\xrightarrow{\text{스칼라 양자화}}\; B_q \text{ bits}`} /></div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  채널의 <strong>크기</strong> 또는 유효 SINR을 스칼라 양자화.
                  MCS 선택, 스케줄링, 전력 제어에 사용. 3GPP에서 <strong>CQI</strong> (동일 명칭) + <strong>RI (Rank Indicator)</strong>로 표준화.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800 dark:bg-teal-900/20">
              <p className="text-xs font-bold text-teal-700 dark:text-teal-300">3GPP 매핑: RI + PMI + CQI = 완전한 제한된 피드백</p>
              <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">
                RI는 최적 rank 선택(1~2비트), PMI는 CDI의 코드북 인덱스(핵심 비트), CQI는 유효 SINR의 양자화(4비트).
                이 세 가지가 결합되어 LTE/NR의 완전한 피드백 체계를 구성합니다.
                분리 설계가 가능한 이유: CDI와 CQI의 독립 최적화가 근사적으로 최적이기 때문 (Love et al.의 핵심 관찰).
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="lfsurvey-practical" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['lfsurvey-practical']} onToggle={() => toggle('lfsurvey-practical')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['lfsurvey-practical'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="MISO 코드북 빔포밍 선택" color="teal"
                latex={String.raw`\hat{\mathbf{f}} = \arg\max_{\mathbf{f}_i \in \mathcal{F}} |\mathbf{h}^T \mathbf{f}_i|^2 = \arg\min_{\mathbf{f}_i \in \mathcal{F}} \sin^2 \angle(\mathbf{h}, \mathbf{f}_i)`}
                description="수신기는 채널 벡터 h와 코드워드 f_i 사이의 내적 크기를 최대화(= 각도를 최소화)하는 코드워드를 선택합니다. B = log₂|F| 비트의 인덱스를 피드백. 코달 거리 sin²∠(h, f̂)의 기대값이 코드북 품질을 결정합니다." />

              <EqCard idx={2} name="SU-MISO 용량 손실 상한 (Grassmannian)" color="teal"
                latex={String.raw`\mathbb{E}[\Delta C] \leq \log_2\!\left(1 + \text{SNR} \cdot (N_t - 1) \cdot 2^{-\frac{B}{N_t - 1}}\right) \;\xrightarrow{\text{high SNR}}\; \text{constant}`}
                description="B비트 Grassmannian 코드북의 평균 용량 손실 상한. (Nt-1)·2^{-B/(Nt-1)} 항이 핵심: Nt가 커지면 같은 B에서 손실 증가(차원의 저주), B를 (Nt-1)비트 추가하면 절반. 고 SNR에서 log₂(1+x)→x/ln2로 상수에 수렴하여, B비트 고정 피드백이 SNR 무관하게 유효합니다." />

              <EqCard idx={3} name="Grassmannian 최적 코드북 설계" color="green"
                latex={String.raw`\mathcal{F}^* = \arg\max_{\substack{\mathcal{F} \subset \mathbb{C}^{N_t} \\ |\mathcal{F}| = 2^B}} \min_{i \neq j} d_c(\mathbf{f}_i, \mathbf{f}_j), \quad d_c = \sqrt{1 - |\mathbf{f}_i^* \mathbf{f}_j|^2}`}
                description="최적 코드북 = Grassmann 다양체 위의 max-min 거리 패킹. 코달 거리 d_c는 위상 모호성에 불변이므로 빔포밍의 자연 거리 척도. Welch bound가 달성 가능한 (Nt, N) 조합에서는 해석적 해 존재, 불가능한 경우 수치 최적화 필요. Love & Heath (2003)에서 체계화." />

              <EqCard idx={4} name="MIMO 프리코딩 코드북 선택" color="cyan"
                latex={String.raw`\hat{\mathbf{F}} = \arg\max_{\mathbf{F}_i \in \mathcal{C}} \log\det\!\left(\mathbf{I} + \frac{\text{SNR}}{r}\, \mathbf{F}_i^H \mathbf{H}^H \mathbf{H}\, \mathbf{F}_i\right)`}
                description="rank-r 프리코딩에서 코드북 선택 기준. G(Nt,r) 위의 부분공간 코드북에서 용량을 최대화하는 프리코더 선택. Rate loss는 최적 부분공간과의 주각(principal angles)에 의해 결정되며, 2^{-B/[r(Nt-r)]}에 비례하여 감소합니다." />

              <EqCard idx={5} name="MU-MIMO 스케일링 법칙 (Jindal 2006)" color="indigo"
                latex={String.raw`\Delta R_k \leq \log_2\!\left(1 + (M-1) \cdot \text{SNR} \cdot 2^{-\frac{B}{M-1}}\right), \quad B \geq (M-1)\log_2(\text{SNR})`}
                description="다중 사용자 ZF 빔포밍에서 사용자당 rate loss 상한. 결정적 차이: SNR이 2^{-B/(M-1)}에 곱해져 있어, B 고정 시 SNR 증가에 따라 rate loss 무한 증가(간섭 floor). B = (M-1)log₂(SNR)으로 스케일링하면 상수가 되어 full multiplexing gain M·log₂(SNR) 달성." />

              <EqCard idx={6} name="OFDM 보간 피드백" color="sky"
                latex={String.raw`\mathbf{f}[k] = \frac{b_i \mathbf{f}_i + b_j \mathbf{f}_j}{\|b_i \mathbf{f}_i + b_j \mathbf{f}_j\|}, \quad \text{(Grassmann geodesic interpolation)}`}
                description="파일럿 서브캐리어의 빔포머 f_i, f_j를 가중 결합하여 중간 서브캐리어의 빔포머를 보간합니다. Grassmann 다양체 위의 측지선 보간으로 단위 노름 제약을 유지합니다. V개 서브캐리어 전체를 피드백하는 대신 파일럿만 피드백하여 오버헤드를 대폭 절감합니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Standards Comparison ───────────────────────────────── */}
      <section id="lfsurvey-evolution" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="표준별 피드백 구현 비교" collapsed={!!col['lfsurvey-evolution']} onToggle={() => toggle('lfsurvey-evolution')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['lfsurvey-evolution'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="7.1" title="논문에서 다루는 표준들의 피드백 체계" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Love et al. 서베이는 2008년 시점의 주요 무선 표준들이 어떻게 제한된 피드백을 구현했는지 상세히 비교합니다.
              각 표준의 코드북 구조와 비트 할당이 이 논문의 이론적 프레임워크로 설명됩니다.
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-teal-50 dark:bg-teal-900/20">
                    <th className="px-2 py-2 text-left font-bold text-teal-700 dark:text-teal-300">표준</th>
                    <th className="px-2 py-2 text-center font-bold text-teal-700 dark:text-teal-300">안테나</th>
                    <th className="px-2 py-2 text-center font-bold text-teal-700 dark:text-teal-300">코드북 구조</th>
                    <th className="px-2 py-2 text-center font-bold text-teal-700 dark:text-teal-300">피드백 비트</th>
                    <th className="px-2 py-2 text-left font-bold text-teal-700 dark:text-teal-300">이론적 연결</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { std: '3GPP WCDMA', ant: '2×2', cb: 'K-Phase 양자화', bits: '1비트: {0, π} / 4비트: 3상+1진폭', theory: '위상 코드북 {0, π/4, π/2, ...}' },
                    { std: 'LTE (Rel-8)', ant: '4×4', cb: 'Householder 반사 행렬', bits: 'PMI 4비트 + CQI 4비트', theory: 'W_n = I - u_n u_n^H / (u_n^H u_n)' },
                    { std: 'WiMAX (802.16e)', ant: '4×4', cb: 'Householder 반사', bits: '3 또는 6비트 인덱스', theory: 'Grassmannian 근사' },
                    { std: '802.11n (WiFi)', ant: '4×4', cb: '채널 행렬 원소 양자화', bits: '3+2·N_b·M_R·M_T, N_b∈{4,5,6,8}', theory: '직접 양자화 (비코드북)' },
                    { std: '3GPP2 (CDMA)', ant: '4×4', cb: 'Knockdown: I 또는 Q-level Fourier', bits: '64개 프리코딩 행렬', theory: 'DFT 기반 코드북' },
                    { std: 'LTE-A (Rel-10)', ant: '4-8', cb: 'Double codebook W₁·W₂', bits: '4+4비트 (WB+SB)', theory: '장기/단기 분리 설계' },
                    { std: 'NR Type II', ant: '8-32', cb: '선형 결합 + 계수', bits: '11-22/서브밴드', theory: '부분공간 양자화 확장' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-2 py-2 font-semibold text-gray-700 dark:text-gray-300">{r.std}</td>
                      <td className="px-2 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{r.ant}</td>
                      <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{r.cb}</td>
                      <td className="px-2 py-2 text-center font-mono font-semibold text-teal-700 dark:text-teal-300">{r.bits}</td>
                      <td className="px-2 py-2 text-gray-500 dark:text-gray-400">{r.theory}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubSectionHeading number="7.2" title="표준별 상세 분석" />
            <div className="mb-4 space-y-3">
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-2 text-xs font-bold text-teal-700 dark:text-teal-300">3GPP WCDMA: Closed-Loop Tx Diversity</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  2×2 MIMO에서 K-Phase 양자화의 실용적 구현.
                  <strong> 1비트 모드:</strong> 위상을 0 또는 π로만 양자화 (등이득 결합).
                  <strong> 4비트 모드:</strong> 3비트 위상(8단계: 0, π/4, π/2, ..., -π/4) + 1비트 진폭.
                  이 서베이의 K-Phase 이론이 직접 적용된 최초 사례.
                </p>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="mb-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">LTE Release 8: Householder PMI</p>
                <div className="my-2 overflow-x-auto"><EquationRenderer latex={String.raw`\mathbf{W}_n = \mathbf{I} - \frac{\mathbf{u}_n \mathbf{u}_n^H}{\mathbf{u}_n^H \mathbf{u}_n}`} /></div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  Householder 반사 행렬로 코드북 구성. 4비트 PMI(16개 코드워드) + 4비트 CQI + RI.
                  2-layer 차분 CQI: 2 또는 3비트로 두 번째 코드워드 대비 차이만 전송.
                  이 서베이의 CDI/CQI 분리 원칙을 충실히 따른 설계.
                </p>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
                <p className="mb-2 text-xs font-bold text-sky-700 dark:text-sky-300">IEEE 802.11n (WiFi): 직접 양자화</p>
                <p className="text-xs text-sky-600 dark:text-sky-400">
                  코드북 방식이 아닌 채널 행렬 원소를 직접 양자화하는 독특한 접근.
                  3비트 최대값 + 실수/허수 부분 스케일링. 총 비트: 3 + 2·N_b·M_R·M_T, N_b ∈ &#123;4,5,6,8&#125;.
                  코드북 저장 불필요하지만 비트 효율이 낮아 안테나 수 증가 시 불리.
                </p>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                <p className="mb-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">3GPP2 (CDMA): Knockdown 코드북</p>
                <div className="my-2 overflow-x-auto"><EquationRenderer latex={String.raw`\mathbf{E}_M^{(q)} = [f_{nm}^{(q)}], \quad f_{nm}^{(q)} = e^{j2\pi n/M \cdot (m + q/Q)}`} /></div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  단위 행렬 또는 Q-level Fourier 행렬 기반. 64개 사전 정의된 프리코딩 행렬 중 선택.
                  DFT 코드북의 변형으로, 이 서베이의 DFT 기반 코드북 이론과 직결.
                </p>
              </div>
            </div>

            <SubSectionHeading number="7.3" title="고급 피드백 기법" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">시간적 피드백 / 차분 피드백</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  이전 프레임 대비 변화만 피드백. 채널의 시간 상관을 활용하여 비트 수 절감.
                  초기 피드백 후 소수 비트로 추적(tracking) 가능.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">점진적 정밀화(Progressive Refinement)</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  다수 프레임에 걸쳐 점진적으로 정밀도를 높이는 방식.
                  각 프레임마다 B_inc 비트를 추가하여 실효 비트 수 증가.
                  고정 시나리오에서 특히 유효.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">릴레이 보조 피드백</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  릴레이 노드를 활용한 피드백. 1비트로 릴레이 선택(전송 또는 미전송) 결정.
                  협력 통신에서 제한된 피드백의 확장.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
              <p className="text-xs font-bold text-teal-700 dark:text-teal-300">이 서베이의 연구사적 위치</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-200 text-xs font-bold text-teal-800 dark:bg-teal-800 dark:text-teal-200">1</span>
                  <p className="text-xs text-teal-600 dark:text-teal-400">
                    <strong>이론 기초 (2003-2006):</strong> Love &amp; Heath → Grassmannian codebook. Jindal → MU-MIMO scaling.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-200 text-xs font-bold text-teal-800 dark:bg-teal-800 dark:text-teal-200">2</span>
                  <p className="text-xs text-teal-600 dark:text-teal-400">
                    <strong>통합 정리 (2008):</strong> 이 서베이가 SA/MA × NB/BB × SU/MU 전체를 체계화. 373개 참고문헌.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-200 text-xs font-bold text-teal-800 dark:bg-teal-800 dark:text-teal-200">3</span>
                  <p className="text-xs text-teal-600 dark:text-teal-400">
                    <strong>표준 영향 (2008-2020):</strong> LTE/LTE-A/NR 코드북 설계에 직접 반영. Type I/II의 이론 근거.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-200 text-xs font-bold text-teal-800 dark:bg-teal-800 dark:text-teal-200">4</span>
                  <p className="text-xs text-teal-600 dark:text-teal-400">
                    <strong>DL 피드백 동기 (2018+):</strong> 코드북 한계(차원의 저주) → CsiNet(2018), Carpi(2023) 등 DL 접근의 이론적 동기.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Evolution Timeline ─────────────────────────────────── */}
      <section id="lfsurvey-timeline" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="피드백 기법의 진화 계보" collapsed={!!col['lfsurvey-timeline']} onToggle={() => toggle('lfsurvey-timeline')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['lfsurvey-timeline'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              이 서베이에서 정리된 제한된 피드백 프레임워크가 이후 어떻게 발전했는지의 계보.
              각 단계는 이전 단계의 한계를 극복하며, 이 논문이 그 중간 결절점입니다.
            </p>
            <div className="space-y-3">
              {[
                { year: '2003', title: 'Grassmannian Codebook', paper: 'Love & Heath', desc: '코달 거리 기반 최적 코드북 이론 → G(Nt,1) 위의 line packing으로 SU-MISO 피드백 정립' },
                { year: '2006', title: 'MU-MIMO Scaling Law', paper: 'Jindal', desc: 'B ∝ (M-1)log₂(SNR) 스케일링 법칙 → BC 채널에서 제한된 피드백의 근본 한계 발견' },
                { year: '2008', title: 'Limited Feedback Survey', paper: 'Love et al.', desc: '이 논문: SA/MA × NB/BB × SU/MU 통합 서베이. 25페이지, 373 참고문헌으로 분야 전체 체계화' },
                { year: '2009', title: 'LTE Release 8/9 표준화', paper: '3GPP', desc: 'Householder PMI + CQI + RI 구조 표준화. 4Tx PMI 4비트. 이 서베이의 CDI/CQI 분리 원칙 직접 반영' },
                { year: '2013', title: 'LTE-A Double Codebook', paper: '3GPP Rel-10/12', desc: 'W = W₁·W₂ 계층 구조: W₁은 장기(wideband), W₂는 단기(subband). 8Tx 대응' },
                { year: '2018', title: 'CsiNet (DL 기반)', paper: 'Wen et al.', desc: '오토인코더로 CSI 압축: 코드북의 차원의 저주를 DL로 돌파. 이 서베이가 보인 한계의 직접적 동기' },
                { year: '2020', title: 'NR Type II Enhanced', paper: '3GPP Rel-16', desc: 'PCA + 차분 코딩 기반 압축 피드백. Massive MIMO(32-64 안테나) 대응' },
                { year: '2023', title: 'Task-Oriented Feedback', paper: 'Carpi et al.', desc: '채널 복원 불필요, Sum-Rate 직접 최적화. 프리코딩 지향 피드백의 새 패러다임' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-14 items-center justify-center rounded-lg bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                      {item.year}
                    </span>
                    {i < 7 && <div className="h-3 w-0.5 bg-gray-300 dark:bg-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.title} <span className="font-normal text-gray-500 dark:text-gray-400">-- {item.paper}</span></p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800 dark:bg-teal-900/20">
              <p className="text-xs font-bold text-teal-700 dark:text-teal-300">핵심 교훈: 이론 → 표준 → AI의 연결 고리</p>
              <p className="mt-1 text-xs leading-relaxed text-teal-600 dark:text-teal-400">
                Love et al.의 서베이는 (1) Grassmannian packing과 스케일링 법칙이라는 <strong>이론적 기초</strong>를 정립하고,
                (2) 이를 LTE/NR <strong>표준 설계</strong>에 반영하는 가교 역할을 했으며,
                (3) 코드북 방식의 근본 한계(차원의 저주: dim G(Nt,r) = 2r(Nt-r))가
                DL 기반 피드백 연구의 <strong>이론적 동기</strong>를 제공했습니다.
                25페이지의 서베이가 20년간의 연구 방향을 결정한 셈입니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

    </div>
    </GlossaryText>
  );
}
