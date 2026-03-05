'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  FlaskConical,
  Hash,
  Layers,
  Network,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'amber' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };
  const badgeMap: Record<string, string> = {
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-amber-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-amber-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.amber}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.amber}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions, color = 'amber' }: { questions: { q: string; a: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const bgMap: Record<string, string> = {
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
  };
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
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.amber}`}>
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

/* ── Architecture Comparison SVG ─────────────────────────────── */

function ArchitectureDiagramSVG() {
  const W = 720;
  const H = 340;

  // Colors
  const csinet = { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', arrow: '#d97706' };
  const carpi  = { bg: '#d1fae5', border: '#10b981', text: '#065f46', arrow: '#059669' };
  const wall   = { bg: '#fecaca', border: '#ef4444', text: '#991b1b' };

  return (
    <div className="overflow-x-auto rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-gray-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[500px]" aria-label="CsiNet vs Carpi 아키텍처 비교">
        {/* ── Title labels ── */}
        <text x={10} y={24} fontSize={13} fontWeight="bold" fill="#92400e">CsiNet (2-Stage): 복원 후 프리코딩</text>
        <text x={10} y={194} fontSize={13} fontWeight="bold" fill="#065f46">Carpi (End-to-End): 직접 프리코딩 출력</text>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* CsiNet Row (y=40..150) */}
        {/* ══════════════════════════════════════════════════════════ */}

        {/* H (Channel) */}
        <rect x={20} y={55} width={70} height={50} rx={8} fill={csinet.bg} stroke={csinet.border} strokeWidth={1.5} />
        <text x={55} y={76} textAnchor="middle" fontSize={12} fontWeight="bold" fill={csinet.text}>H</text>
        <text x={55} y={92} textAnchor="middle" fontSize={9} fill={csinet.text}>채널 행렬</text>

        {/* Arrow */}
        <line x1={90} y1={80} x2={118} y2={80} stroke={csinet.arrow} strokeWidth={2} markerEnd="url(#arrowAmber)" />

        {/* Encoder */}
        <rect x={120} y={55} width={80} height={50} rx={8} fill={csinet.bg} stroke={csinet.border} strokeWidth={1.5} />
        <text x={160} y={76} textAnchor="middle" fontSize={11} fontWeight="bold" fill={csinet.text}>Encoder</text>
        <text x={160} y={92} textAnchor="middle" fontSize={9} fill={csinet.text}>DNN 압축</text>

        {/* Arrow */}
        <line x1={200} y1={80} x2={228} y2={80} stroke={csinet.arrow} strokeWidth={2} markerEnd="url(#arrowAmber)" />

        {/* B bits */}
        <rect x={230} y={60} width={50} height={40} rx={6} fill="#fde68a" stroke={csinet.border} strokeWidth={1.5} />
        <text x={255} y={84} textAnchor="middle" fontSize={11} fontWeight="bold" fill={csinet.text}>B bits</text>

        {/* Arrow */}
        <line x1={280} y1={80} x2={308} y2={80} stroke={csinet.arrow} strokeWidth={2} markerEnd="url(#arrowAmber)" />

        {/* Decoder */}
        <rect x={310} y={55} width={80} height={50} rx={8} fill={csinet.bg} stroke={csinet.border} strokeWidth={1.5} />
        <text x={350} y={76} textAnchor="middle" fontSize={11} fontWeight="bold" fill={csinet.text}>Decoder</text>
        <text x={350} y={92} textAnchor="middle" fontSize={9} fill={csinet.text}>DNN 복원</text>

        {/* Arrow */}
        <line x1={390} y1={80} x2={418} y2={80} stroke={csinet.arrow} strokeWidth={2} markerEnd="url(#arrowAmber)" />

        {/* H-hat */}
        <rect x={420} y={55} width={60} height={50} rx={8} fill={csinet.bg} stroke={csinet.border} strokeWidth={1.5} />
        <text x={450} y={76} textAnchor="middle" fontSize={12} fontWeight="bold" fill={csinet.text}>H&#770;</text>
        <text x={450} y={92} textAnchor="middle" fontSize={9} fill={csinet.text}>복원 채널</text>

        {/* THE WALL */}
        <rect x={488} y={40} width={8} height={75} rx={2} fill={wall.bg} stroke={wall.border} strokeWidth={1.5} />
        <text x={492} y={130} textAnchor="middle" fontSize={9} fontWeight="bold" fill={wall.text}>단절!</text>

        {/* Arrow across wall */}
        <line x1={480} y1={80} x2={504} y2={80} stroke={wall.border} strokeWidth={2} strokeDasharray="4 3" markerEnd="url(#arrowRed)" />

        {/* ZF Precoder */}
        <rect x={506} y={55} width={90} height={50} rx={8} fill="#fee2e2" stroke={wall.border} strokeWidth={1.5} />
        <text x={551} y={76} textAnchor="middle" fontSize={11} fontWeight="bold" fill={wall.text}>ZF Precoder</text>
        <text x={551} y={92} textAnchor="middle" fontSize={9} fill={wall.text}>고전적 알고리즘</text>

        {/* Arrow */}
        <line x1={596} y1={80} x2={624} y2={80} stroke={csinet.arrow} strokeWidth={2} markerEnd="url(#arrowAmber)" />

        {/* V output */}
        <rect x={626} y={55} width={60} height={50} rx={8} fill={csinet.bg} stroke={csinet.border} strokeWidth={1.5} />
        <text x={656} y={76} textAnchor="middle" fontSize={13} fontWeight="bold" fill={csinet.text}>V</text>
        <text x={656} y={92} textAnchor="middle" fontSize={9} fill={csinet.text}>프리코딩</text>

        {/* CsiNet annotation: MSE loss */}
        <text x={350} y={125} textAnchor="middle" fontSize={10} fill="#b45309" fontStyle="italic">손실: MSE(H, H&#770;) -- 복원 품질만 최적화</text>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* Carpi Row (y=210..320) */}
        {/* ══════════════════════════════════════════════════════════ */}

        {/* Pilots */}
        <rect x={20} y={225} width={70} height={50} rx={8} fill={carpi.bg} stroke={carpi.border} strokeWidth={1.5} />
        <text x={55} y={246} textAnchor="middle" fontSize={11} fontWeight="bold" fill={carpi.text}>Pilots</text>
        <text x={55} y={262} textAnchor="middle" fontSize={9} fill={carpi.text}>학습된 파일럿</text>

        {/* Arrow */}
        <line x1={90} y1={250} x2={118} y2={250} stroke={carpi.arrow} strokeWidth={2} markerEnd="url(#arrowGreen)" />

        {/* y_k */}
        <rect x={120} y={230} width={55} height={40} rx={6} fill="#a7f3d0" stroke={carpi.border} strokeWidth={1.5} />
        <text x={147} y={254} textAnchor="middle" fontSize={11} fontWeight="bold" fill={carpi.text}>y_k</text>

        {/* Arrow */}
        <line x1={175} y1={250} x2={203} y2={250} stroke={carpi.arrow} strokeWidth={2} markerEnd="url(#arrowGreen)" />

        {/* DNN Encoder */}
        <rect x={205} y={225} width={85} height={50} rx={8} fill={carpi.bg} stroke={carpi.border} strokeWidth={1.5} />
        <text x={247} y={246} textAnchor="middle" fontSize={11} fontWeight="bold" fill={carpi.text}>DNN Enc</text>
        <text x={247} y={262} textAnchor="middle" fontSize={9} fill={carpi.text}>UE 인코더</text>

        {/* Arrow */}
        <line x1={290} y1={250} x2={318} y2={250} stroke={carpi.arrow} strokeWidth={2} markerEnd="url(#arrowGreen)" />

        {/* B bits */}
        <rect x={320} y={230} width={50} height={40} rx={6} fill="#a7f3d0" stroke={carpi.border} strokeWidth={1.5} />
        <text x={345} y={254} textAnchor="middle" fontSize={11} fontWeight="bold" fill={carpi.text}>B bits</text>

        {/* Arrow */}
        <line x1={370} y1={250} x2={398} y2={250} stroke={carpi.arrow} strokeWidth={2} markerEnd="url(#arrowGreen)" />

        {/* DNN Decoder */}
        <rect x={400} y={225} width={85} height={50} rx={8} fill={carpi.bg} stroke={carpi.border} strokeWidth={1.5} />
        <text x={442} y={246} textAnchor="middle" fontSize={11} fontWeight="bold" fill={carpi.text}>DNN Dec</text>
        <text x={442} y={262} textAnchor="middle" fontSize={9} fill={carpi.text}>BS 디코더</text>

        {/* Arrow - seamless, no wall */}
        <line x1={485} y1={250} x2={540} y2={250} stroke={carpi.arrow} strokeWidth={2.5} markerEnd="url(#arrowGreen)" />

        {/* "seamless" label on arrow */}
        <text x={512} y={242} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#059669">seamless</text>

        {/* V output (direct) */}
        <rect x={542} y={225} width={80} height={50} rx={8} fill={carpi.bg} stroke={carpi.border} strokeWidth={2} />
        <text x={582} y={246} textAnchor="middle" fontSize={14} fontWeight="bold" fill={carpi.text}>V</text>
        <text x={582} y={262} textAnchor="middle" fontSize={9} fill={carpi.text}>직접 프리코딩</text>

        {/* Carpi annotation: sum-rate loss */}
        <text x={370} y={295} textAnchor="middle" fontSize={10} fill="#047857" fontStyle="italic">손실: Sum-Rate -- 최종 성능(전송률)을 직접 최적화</text>

        {/* ── Defs (arrowheads) ── */}
        <defs>
          <marker id="arrowAmber" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={csinet.arrow} />
          </marker>
          <marker id="arrowRed" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={wall.border} />
          </marker>
          <marker id="arrowGreen" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={carpi.arrow} />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/* ── Paradigm Comparison SVG ─────────────────────────────────── */

function ParadigmDiagramSVG() {
  const W = 700;
  const H = 280;

  return (
    <div className="overflow-x-auto rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-gray-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" aria-label="CSI 피드백 3세대 비교">
        {/* ── Generation 1: Codebook ── */}
        <rect x={10} y={10} width={210} height={250} rx={12} fill="#fef9c3" stroke="#eab308" strokeWidth={1.5} />
        <text x={115} y={35} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#854d0e">1세대: 코드북 기반</text>
        <text x={115} y={52} textAnchor="middle" fontSize={9} fill="#a16207">Love &amp; Heath (2008)</text>

        {/* Flow boxes */}
        <rect x={30} y={70} width={170} height={28} rx={6} fill="#fde68a" stroke="#eab308" strokeWidth={1} />
        <text x={115} y={88} textAnchor="middle" fontSize={10} fill="#854d0e">고정 코드북 W에서 검색</text>

        <line x1={115} y1={98} x2={115} y2={110} stroke="#eab308" strokeWidth={1.5} markerEnd="url(#arrowY)" />

        <rect x={30} y={112} width={170} height={28} rx={6} fill="#fde68a" stroke="#eab308" strokeWidth={1} />
        <text x={115} y={130} textAnchor="middle" fontSize={10} fill="#854d0e">PMI 인덱스 전송 (수 비트)</text>

        <line x1={115} y1={140} x2={115} y2={152} stroke="#eab308" strokeWidth={1.5} markerEnd="url(#arrowY)" />

        <rect x={30} y={154} width={170} height={28} rx={6} fill="#fde68a" stroke="#eab308" strokeWidth={1} />
        <text x={115} y={172} textAnchor="middle" fontSize={10} fill="#854d0e">BS: W에서 프리코더 선택</text>

        <text x={115} y={210} textAnchor="middle" fontSize={9} fill="#a16207" fontStyle="italic">한계: 코드북 크기 ∝ 2^B</text>
        <text x={115} y={224} textAnchor="middle" fontSize={9} fill="#a16207" fontStyle="italic">Massive MIMO에서 비현실적</text>

        {/* ── Generation 2: DL Reconstruction ── */}
        <rect x={245} y={10} width={210} height={250} rx={12} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.5} />
        <text x={350} y={35} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#1e3a8a">2세대: DL 복원 기반</text>
        <text x={350} y={52} textAnchor="middle" fontSize={9} fill="#1d4ed8">CsiNet (Wen, 2018)</text>

        <rect x={265} y={70} width={170} height={28} rx={6} fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1} />
        <text x={350} y={88} textAnchor="middle" fontSize={10} fill="#1e3a8a">H → DNN Encoder → B bits</text>

        <line x1={350} y1={98} x2={350} y2={110} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowB)" />

        <rect x={265} y={112} width={170} height={28} rx={6} fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1} />
        <text x={350} y={130} textAnchor="middle" fontSize={10} fill="#1e3a8a">DNN Decoder → H&#770; 복원</text>

        <line x1={350} y1={140} x2={350} y2={152} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowB)" />

        <rect x={265} y={154} width={170} height={28} rx={6} fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1} />
        <text x={350} y={172} textAnchor="middle" fontSize={10} fill="#1e3a8a">ZF/MMSE Precoder(H&#770;)</text>

        <text x={350} y={210} textAnchor="middle" fontSize={9} fill="#1d4ed8" fontStyle="italic">한계: MSE 최적화 ≠ Rate 최적화</text>
        <text x={350} y={224} textAnchor="middle" fontSize={9} fill="#1d4ed8" fontStyle="italic">복원-프리코딩 단절 (2-stage)</text>

        {/* ── Generation 3: Task-Oriented (Carpi) ── */}
        <rect x={480} y={10} width={210} height={250} rx={12} fill="#d1fae5" stroke="#10b981" strokeWidth={2} />
        <text x={585} y={35} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#065f46">3세대: 태스크 지향</text>
        <text x={585} y={52} textAnchor="middle" fontSize={9} fill="#047857">Carpi et al. (2023)</text>

        <rect x={500} y={70} width={170} height={28} rx={6} fill="#a7f3d0" stroke="#10b981" strokeWidth={1} />
        <text x={585} y={88} textAnchor="middle" fontSize={10} fill="#065f46">학습 파일럿 → y → DNN Enc</text>

        <line x1={585} y1={98} x2={585} y2={110} stroke="#10b981" strokeWidth={1.5} markerEnd="url(#arrowG)" />

        <rect x={500} y={112} width={170} height={28} rx={6} fill="#a7f3d0" stroke="#10b981" strokeWidth={1} />
        <text x={585} y={130} textAnchor="middle" fontSize={10} fill="#065f46">B bits → DNN Dec → V 직접</text>

        <line x1={585} y1={140} x2={585} y2={152} stroke="#10b981" strokeWidth={1.5} markerEnd="url(#arrowG)" />

        <rect x={500} y={154} width={170} height={28} rx={6} fill="#6ee7b7" stroke="#10b981" strokeWidth={1.5} />
        <text x={585} y={172} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#065f46">Sum-Rate Loss로 E2E 학습</text>

        <text x={585} y={210} textAnchor="middle" fontSize={9} fill="#047857" fontWeight="bold">복원 불필요, 태스크 직접 최적화</text>
        <text x={585} y={224} textAnchor="middle" fontSize={9} fill="#047857" fontWeight="bold">낮은 B에서 큰 이득</text>

        {/* Star marker on Gen 3 */}
        <text x={680} y={28} fontSize={16} fill="#10b981">&#9733;</text>

        {/* ── Arrow defs ── */}
        <defs>
          <marker id="arrowY" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#eab308" />
          </marker>
          <marker id="arrowB" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
          </marker>
          <marker id="arrowG" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function CarpiStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="carpi-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-500 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICC 2023</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Nokia Bell Labs / NYU</span>
              <span className="rounded-full bg-yellow-300/90 px-3 py-1 text-xs font-bold text-yellow-900">Precoding-Oriented</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Precoding-oriented Massive MIMO CSI Feedback Design
            </h2>
            <p className="mt-3 text-sm text-amber-200">
              Carpi, Joham, Bj&ouml;rnson, Buzzi &amp; Debbah (Nokia Bell Labs / NYU) &middot; ICC 2023
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              기존 딥러닝 CSI 피드백 연구(CsiNet 등)는 채널 행렬 H를 <span className="font-semibold text-amber-700 dark:text-amber-300">정확하게 복원</span>하는 것을 목표로 합니다.
              그러나 기지국이 실제로 필요한 것은 복원된 채널이 아니라 <span className="font-semibold text-amber-700 dark:text-amber-300">프리코딩 행렬 V</span>입니다.
              복원 품질(MSE)을 최적화하는 것이 반드시 전송률(Sum-Rate)을 최적화하는 것은 아닙니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              이 논문은 <span className="font-semibold text-amber-700 dark:text-amber-300">패러다임 전환</span>을 제안합니다:
              채널 복원이라는 중간 단계를 제거하고, UE가 수신한 파일럿 신호로부터 기지국이 사용할 프리코딩 행렬 V를
              <span className="font-semibold text-amber-700 dark:text-amber-300">End-to-End로 직접 출력</span>합니다.
              손실 함수도 MSE가 아닌 <span className="font-semibold text-amber-700 dark:text-amber-300">Sum-Rate</span>를 사용하여
              시스템의 최종 목표를 직접 최적화합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Precoding-Oriented', 'Task-Oriented', 'End-to-End Learning', 'Sum-Rate Optimization', 'Learned Pilots', 'Massive MIMO'].map(tag => (
                <span key={tag} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Paradigm Shift ─────────────────────────────────────── */}
      <section id="carpi-paradigm" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="패러다임 전환: CSI 피드백의 3세대" collapsed={!!col['carpi-paradigm']} onToggle={() => toggle('carpi-paradigm')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['carpi-paradigm'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="CSI 피드백의 진화" />
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              FDD Massive MIMO에서 다운링크 CSI를 기지국(BS)에 전달하는 피드백 방식은 세 세대에 걸쳐 진화해왔습니다.
              각 세대의 핵심 차이는 <span className="font-semibold text-amber-700 dark:text-amber-300">&quot;무엇을 최적화하는가&quot;</span>입니다:
            </p>

            <ParadigmDiagramSVG />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                <p className="mb-1 text-xs font-bold text-yellow-700 dark:text-yellow-300">1세대: 코드북 기반</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Love &amp; Heath (2008) 등. 유한 크기 코드북에서 최적 프리코딩 벡터의 인덱스(PMI)를 전송.
                  안테나 수 N_t가 커지면 코드북 크기가 2^B로 폭증하여 Massive MIMO에서 비현실적.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">2세대: DL 복원 기반</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  CsiNet (Wen et al., 2018). DNN으로 채널 H를 압축/복원하여 MSE를 최소화.
                  혁신적이지만 복원된 H&#770;로 별도의 프리코더를 계산하는 2단계 접근 — 복원 오차가 프리코딩 성능으로 직접 전파되지 않음.
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">3세대: 태스크 지향 (본 논문)</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Carpi et al. (2023). 채널 복원 없이 파일럿 → 프리코딩 V를 End-to-End로 학습.
                  Sum-Rate를 직접 손실로 사용. 특히 낮은 피드백 비트 B에서 복원 기반 대비 큰 이득.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">핵심 통찰</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                복원 정확도(MSE)가 높다고 해서 프리코딩 성능(Sum-Rate)이 반드시 높은 것은 아닙니다.
                MSE는 채널 행렬의 모든 성분을 동등하게 취급하지만, 프리코딩에 중요한 것은 주요 고유 방향(dominant eigenvectors)입니다.
                MSE가 낮아도 고유 방향이 틀어지면 간섭이 제거되지 않아 전송률이 급감합니다.
                이것이 태스크 지향 접근의 핵심 동기입니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Architecture ───────────────────────────────────────── */}
      <section id="carpi-architecture" className="scroll-mt-20">
        <SectionHeading icon={<Network className="h-5 w-5" />} title="End-to-End 아키텍처" collapsed={!!col['carpi-architecture']} onToggle={() => toggle('carpi-architecture')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['carpi-architecture'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="시스템 구성 비교" />
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              아래 다이어그램은 기존 CsiNet(2-stage)과 Carpi(End-to-End) 접근의 핵심 차이를 보여줍니다.
              CsiNet에서는 복원(H&#770;)과 프리코딩(ZF) 사이에 <span className="font-semibold text-red-600 dark:text-red-400">&quot;단절&quot;</span>이 있지만,
              Carpi에서는 DNN이 프리코딩 행렬 V를 <span className="font-semibold text-green-600 dark:text-green-400">직접 출력</span>합니다:
            </p>

            <ArchitectureDiagramSVG />

            <SubSectionHeading number="2.2" title="각 구성 요소 상세" />
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">학습된 파일럿 (Learned Pilots)</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  기존에는 DFT 기반 고정 파일럿을 사용했으나, 이 논문에서는 파일럿 행렬 P 자체를 End-to-End 학습의 일부로 최적화합니다.
                  UE가 수신하는 신호 y_k = P &middot; h_k + n에서 P를 학습함으로써
                  제한된 파일럿 수로도 프리코딩에 필요한 정보를 효율적으로 포착합니다.
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">UE DNN 인코더</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  수신 신호 y_k를 B비트 피드백 메시지로 압축하는 DNN.
                  CsiNet과 달리 채널 H의 복원을 목표로 하지 않고, 프리코딩에 필요한 정보만 추출합니다.
                  양자화기 + 엔트로피 코더가 포함되어 실제 전송 가능한 비트열을 생성합니다.
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">BS DNN 디코더 → V 직접 출력</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  B비트 피드백을 받아 프리코딩 행렬 V를 직접 출력하는 DNN.
                  기존의 &quot;H&#770; 복원 → ZF/MMSE 계산&quot; 2단계를 하나의 DNN으로 대체합니다.
                  출력 V는 전력 제약(||v_k||&sup2; = P/K)을 만족하도록 정규화됩니다.
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <p className="mb-1 text-xs font-bold text-green-700 dark:text-green-300">End-to-End 학습</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  파일럿 P, 인코더, 양자화기, 디코더 모든 구성 요소가 하나의 손실 함수(Sum-Rate)로 공동 학습됩니다.
                  양자화기는 STE(Straight-Through Estimator) 또는 Gumbel-Softmax로 미분 가능하게 근사하여 역전파를 가능하게 합니다.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-900/20">
              <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">CsiNet과의 핵심 차이</p>
              <p className="mt-1 text-xs leading-relaxed text-orange-600 dark:text-orange-400">
                CsiNet에서는 Decoder가 H&#770;를 출력하고, 별도의 ZF 알고리즘이 V를 계산합니다.
                ZF의 역행렬 연산이 H&#770;의 오차에 매우 민감하여, 작은 복원 오류가 프리코딩 성능을 크게 저하시킵니다.
                Carpi 접근에서는 이 민감한 역행렬 연산이 DNN 내부로 흡수되어,
                네트워크가 오차에 강건한 프리코딩을 학습합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Loss Function ──────────────────────────────────────── */}
      <section id="carpi-loss" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="손실 함수 설계: MSE vs. Sum-Rate" collapsed={!!col['carpi-loss']} onToggle={() => toggle('carpi-loss')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['carpi-loss'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="왜 MSE는 부적합한가?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              기존 DL-based CSI 피드백은 다음과 같은 MSE를 손실 함수로 사용합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <EquationRenderer latex={String.raw`\mathcal{L}_{\text{MSE}} = \mathbb{E}\!\left[\|H - \hat{H}\|_F^2\right]`} />
            </div>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              이 손실 함수의 문제점:
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">등방성 오차 가정</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  MSE는 채널 행렬의 모든 성분에 동등한 가중치를 부여합니다.
                  그러나 프리코딩에서 중요한 것은 주요 고유공간(dominant subspace)이며,
                  작은 고유값에 해당하는 성분의 오차는 프리코딩 성능에 거의 영향을 미치지 않습니다.
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">간섭 민감도 무시</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  ZF 프리코딩에서 다른 사용자에 대한 간섭 제거는 고유 벡터의 방향 정확도에 크게 의존합니다.
                  MSE가 동일해도 오차의 방향에 따라 간섭 크기가 크게 달라질 수 있으며,
                  이는 Sum-Rate에 비선형적으로 영향을 미칩니다.
                </p>
              </div>
            </div>

            <SubSectionHeading number="3.2" title="Sum-Rate 손실 함수" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Carpi et al.은 시스템의 최종 목표인 합산 전송률(Sum-Rate)을 직접 손실 함수로 사용합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <EquationRenderer latex={String.raw`\mathcal{L} = -\sum_{k=1}^{K} \log_2\!\left(1 + \text{SINR}_k\right) + \lambda \cdot B`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              여기서 SINR_k는 k번째 사용자의 신호 대 간섭+잡음비이며, B는 피드백 비트 수입니다.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Lambda 트레이드오프</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                정규화 항 &lambda; &middot; B는 성능(Sum-Rate)과 오버헤드(피드백 비트)의 트레이드오프를 제어합니다.
                &lambda;가 크면 더 적은 비트를 사용하도록 유도되고, 작으면 성능 우선으로 더 많은 비트를 할당합니다.
                이를 통해 단일 학습 프레임워크로 다양한 피드백 예산에 대한 운영점을 탐색할 수 있습니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="carpi-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['carpi-equations']} onToggle={() => toggle('carpi-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['carpi-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="사용자별 달성 가능 전송률 (Per-user Achievable Rate)" color="amber"
                latex={String.raw`R_k = \log_2\!\left(1 + \frac{|\mathbf{h}_k^H \mathbf{v}_k|^2}{\sum_{j \neq k} |\mathbf{h}_k^H \mathbf{v}_j|^2 + \sigma^2}\right)`}
                description="k번째 사용자의 달성 가능 전송률. 분자 |h_k^H v_k|^2는 원하는 신호 전력(빔포밍 이득), 분모의 합 |h_k^H v_j|^2는 다른 사용자 j의 프리코딩 벡터가 k에게 일으키는 간섭(MUI: Multi-User Interference), sigma^2는 잡음 전력. ZF 프리코딩의 목표는 간섭 항을 0으로 만드는 것이지만, 부정확한 CSI에서는 잔여 간섭이 존재합니다. Sum-Rate = 모든 R_k의 합." />

              <EqCard idx={2} name="프리코딩 지향 손실 함수 (Precoding-oriented Loss)" color="orange"
                latex={String.raw`\mathcal{L}(\theta) = -\mathbb{E}\!\left[\sum_{k=1}^{K} \log_2\!\left(1 + \text{SINR}_k(\theta)\right)\right] + \lambda \cdot B(\theta)`}
                description="네트워크 파라미터 theta에 대한 손실 함수. 첫 번째 항은 음의 Sum-Rate(최대화 → 최소화), 두 번째 항은 피드백 비트 수에 대한 정규화. theta는 파일럿 P, 인코더, 양자화기, 디코더의 모든 학습 가능 파라미터를 포함. 기대값은 채널 실현과 잡음에 대해 취함. lambda로 Rate-Overhead 트레이드오프 제어." />

              <EqCard idx={3} name="DNN을 통한 직접 프리코딩 (Direct Precoding from DNN)" color="green"
                latex={String.raw`\mathbf{V} = f_{\text{dec}}(q(f_{\text{enc}}(\mathbf{y};\,\theta_e);\,\theta_q);\,\theta_d), \quad \|\mathbf{v}_k\|^2 = \frac{P}{K}`}
                description="전체 End-to-End 파이프라인을 하나의 수식으로 표현. y는 UE 수신 신호(파일럿 응답), f_enc는 UE 인코더 DNN, q는 양자화기, f_dec는 BS 디코더 DNN. 출력 V는 전력 제약 ||v_k||^2 = P/K를 만족하도록 정규화. 기존 접근의 f_dec → H-hat → ZF(H-hat) 2단계가 하나의 f_dec → V로 통합됨. 양자화기 q는 STE 또는 Gumbel-Softmax로 미분 가능 근사." />

              <EqCard idx={4} name="mmWave 채널 모델" color="indigo"
                latex={String.raw`\mathbf{H} = \sqrt{\frac{N_t}{N_{\text{cl}} N_{\text{ray}}}} \sum_{l=1}^{N_{\text{cl}}} \sum_{r=1}^{N_{\text{ray}}} \alpha_{l,r}\, \mathbf{a}(\phi_{l,r})\, \mathbf{a}^H(\theta_{l,r})`}
                description="mmWave 채널의 기하학적 모델. N_cl은 클러스터 수, N_ray는 클러스터당 레이 수, alpha_{l,r}은 복소 이득, a(phi)는 수신 배열 응답 벡터, a(theta)는 송신 배열 응답 벡터. mmWave 채널은 경로 수가 적어 저랭크 구조를 가지며, 이 희소성(sparsity)이 적은 피드백 비트로도 효과적인 프리코딩을 가능하게 하는 핵심 특성입니다. 앵글 도메인에서 채널이 소수의 방향에 집중되어 있음을 의미합니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="carpi-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과: Sum-Rate 성능 비교" collapsed={!!col['carpi-results']} onToggle={() => toggle('carpi-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['carpi-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="피드백 비트 수에 따른 Sum-Rate 비교" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              다양한 피드백 비트 예산(B)에서 프리코딩 지향(Carpi) vs. 복원 기반(CsiNet + ZF) vs. 전통적 방법(양자화 CSI + ZF)의 Sum-Rate 성능 비교:
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">피드백 비트 (B)</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">양자화 CSI + ZF</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">CsiNet + ZF</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Carpi (E2E)</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">Carpi vs CsiNet 이득</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">완전 CSI 대비</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { bits: '32',  trad: '~4.2',  csinet: '~6.8',  carpi: '~9.5',  gain: '+40%',   pct: '~60%',  hi: true },
                    { bits: '64',  trad: '~6.5',  csinet: '~10.2', carpi: '~12.8', gain: '+25%',   pct: '~80%',  hi: true },
                    { bits: '128', trad: '~9.1',  csinet: '~13.0', carpi: '~14.5', gain: '+12%',   pct: '~90%',  hi: false },
                    { bits: '256', trad: '~11.8', csinet: '~14.8', carpi: '~15.5', gain: '+5%',    pct: '~97%',  hi: false },
                    { bits: 'Perfect CSI', trad: '—', csinet: '—', carpi: '—', gain: '—', pct: '16.0 bps/Hz', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.bits}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.trad}</td>
                      <td className="px-3 py-2 text-center font-mono text-blue-600 dark:text-blue-400">{r.csinet}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-amber-700 dark:text-amber-300' : 'text-green-600 dark:text-green-400'}`}>{r.carpi}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-amber-700 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.gain}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              * Sum-Rate 단위: bps/Hz. K=4 사용자, N_t=64 안테나, SNR=10dB 기준. 수치는 논문의 대표적 시뮬레이션 결과를 근사적으로 표현.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">핵심 관찰 1: 낮은 B에서 가장 큰 이득</p>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  B=32비트(극저 피드백)에서 Carpi가 CsiNet 대비 약 40% Sum-Rate 이득을 보입니다.
                  B가 커질수록 이득이 줄어드는데, 이는 충분한 비트가 있으면 복원이 정확해져 2-stage 접근도 잘 작동하기 때문입니다.
                  즉 태스크 지향 접근은 <span className="font-semibold">비트 예산이 극히 제한된 실용 시나리오</span>에서 가장 빛을 발합니다.
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-900/20">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">핵심 관찰 2: 전통적 방법과의 격차</p>
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                  양자화 CSI + ZF는 DL 기반 방법들에 비해 모든 비트 수준에서 크게 뒤처집니다.
                  이는 고정 코드북 양자화가 채널의 연속적인 변화를 적절히 포착하지 못함을 보여줍니다.
                  DL 기반 비선형 압축의 우월성이 명확합니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────── */}
      <section id="carpi-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection color="amber" questions={[
            {
              q: 'CsiNet이 채널 H를 완벽하게 복원(MSE=0)하더라도 Sum-Rate가 최적이 되지 않을 수 있는 경우가 있는가? 있다면 어떤 상황인가?',
              a: 'MSE=0이면 H = H-hat이므로 ZF 프리코딩은 정확한 간섭 제거를 수행하고 Sum-Rate도 최적이 됩니다. 그러나 핵심은 유한 비트 B에서 MSE=0은 달성 불가능하다는 점입니다. 유한 B에서 MSE를 최소화하는 것은 "모든 성분의 오차를 균등하게 줄이는" 전략인데, 프리코딩에는 고유 벡터 방향의 정확도가 더 중요합니다. 동일한 비트 예산으로 "MSE를 최소화하는 압축"과 "프리코딩 성능을 최대화하는 압축"은 다른 최적해를 가집니다. 예를 들어, 채널의 null-space 방향 오차는 프리코딩에 치명적이지만 MSE 관점에서는 큰 고유값 방향 오차와 동등하게 취급됩니다.',
            },
            {
              q: '파일럿 행렬 P를 End-to-End로 학습하는 것이 고정 DFT 파일럿보다 유리한 이유를 설명하라.',
              a: 'DFT 파일럿은 모든 방향을 균등하게 프로빙하여 채널 추정에 최적화되어 있습니다. 그러나 프리코딩 목적으로는 모든 방향이 동등하게 중요하지 않습니다. 학습된 파일럿은 채널 분포와 프리코딩 태스크에 맞춰 특정 방향(예: 사용자들이 주로 위치하는 각도 범위)에 에너지를 집중할 수 있습니다. 또한 파일럿 수가 안테나 수보다 적은 경우(under-determined), DFT 파일럿은 정보 손실이 불가피하지만 학습된 파일럿은 프리코딩에 필요한 정보를 우선적으로 보존하는 최적의 관측 행렬 역할을 합니다. 이는 압축 센싱의 관측 행렬 최적화와 유사한 효과입니다.',
            },
            {
              q: 'End-to-End 학습에서 양자화기를 미분 가능하게 만드는 기법(STE, Gumbel-Softmax)이 필요한 이유와 각각의 장단점은?',
              a: '양자화(round 함수)는 불연속이므로 기울기가 0(또는 미정의)이며 역전파가 불가능합니다. STE(Straight-Through Estimator): 순전파 시 실제 양자화를 수행하고, 역전파 시 기울기를 그대로 통과시킵니다(기울기=1 근사). 장점은 구현이 간단하고 실제 양자화 값으로 학습한다는 점. 단점은 순전파와 역전파의 불일치로 인한 학습 불안정. Gumbel-Softmax: 카테고리컬 분포를 온도 파라미터 tau로 연속 근사합니다. tau→0이면 실제 양자화에 수렴. 장점은 이론적으로 더 정확한 기울기 추정. 단점은 tau 스케줄링이 필요하고 고차원에서 분산이 증가할 수 있음. 두 방법 모두 학습 시와 추론 시의 양자화 동작 차이(train-test mismatch)가 존재하며, 이를 줄이는 것이 실용적 과제입니다.',
            },
            {
              q: 'Carpi의 태스크 지향 접근이 "낮은 피드백 비트"에서 특히 큰 이득을 보이는 근본 원인을 정보 이론적 관점에서 설명하라.',
              a: '제한된 비트 예산 B에서 인코더는 채널 H의 전체 정보 중 B비트 분량만 선택적으로 전달해야 합니다. MSE 최적화는 채널의 모든 성분을 균등하게 복원하는 데 비트를 분배하지만, 프리코딩에 실제 필요한 정보(주요 고유공간의 방향)는 채널 전체 정보의 일부입니다. B가 작을수록 "어떤 정보를 전달할 것인가"의 선택이 중요해지며, 태스크 지향 인코더는 프리코딩에 불필요한 정보(예: 약한 경로의 진폭 세부사항)를 과감히 버리고 핵심 정보(간섭 방향)에 비트를 집중합니다. 이는 Rate-Distortion 이론에서 왜곡 측도(distortion measure)를 MSE에서 태스크 관련 측도로 바꾸면 동일한 R(D)에서 더 높은 태스크 성능을 달성할 수 있다는 원리와 일맥상통합니다. B가 충분히 크면 모든 정보를 전달할 수 있어 차이가 줄어듭니다.',
            },
          ]} />
        </Card>
      </section>

    </div>
    </GlossaryText>
  );
}
