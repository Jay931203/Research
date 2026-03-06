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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{number}</span>
      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
    </div>
  );
}

function EqCard({ idx, name, latex, description, color = 'blue' }: {
  idx: number; name: string; latex: string; description: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };
  const badgeMap: Record<string, string> = {
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700" onClick={() => setOpen(v => !v)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${badgeMap[color] ?? badgeMap.blue}`}>Eq. {idx}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{name}</span>
        <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="overflow-x-auto py-2 text-gray-900 dark:text-gray-100"><EquationRenderer latex={latex} /></div>
      {open ? (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${colorMap[color] ?? colorMap.blue}`}>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{description}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">클릭하여 상세 설명 보기</p>
      )}
    </div>
  );
}

function QuizSection({ questions, color = 'blue' }: { questions: { q: string; a: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const bgMap: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
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
            <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 ${bgMap[color] ?? bgMap.blue}`}>
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
  const H = 360;

  const csinet = { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', arrow: '#d97706' };
  const fbnet  = { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a', arrow: '#2563eb' };
  const wall   = { bg: '#fecaca', border: '#ef4444', text: '#991b1b' };

  return (
    <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white p-4 dark:border-blue-800 dark:bg-gray-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[500px]" aria-label="CsiNet vs CsiFBNet 아키텍처 비교">
        {/* ── Title labels ── */}
        <text x={10} y={24} fontSize={13} fontWeight="bold" fill="#92400e">CsiNet (기존): CSI 복원 후 빔포밍</text>
        <text x={10} y={204} fontSize={13} fontWeight="bold" fill="#1e3a8a">CsiFBNet (제안): 빔포밍 벡터 직접 출력</text>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* CsiNet Row (y=40..150) */}
        {/* ══════════════════════════════════════════════════════════ */}

        {/* H (Channel) */}
        <rect x={20} y={55} width={70} height={50} rx={8} fill={csinet.bg} stroke={csinet.border} strokeWidth={1.5} />
        <text x={55} y={76} textAnchor="middle" fontSize={12} fontWeight="bold" fill={csinet.text}>H</text>
        <text x={55} y={92} textAnchor="middle" fontSize={9} fill={csinet.text}>채널 행렬</text>

        {/* Arrow */}
        <line x1={90} y1={80} x2={118} y2={80} stroke={csinet.arrow} strokeWidth={2} markerEnd="url(#arrowAmberFB)" />

        {/* Encoder */}
        <rect x={120} y={55} width={80} height={50} rx={8} fill={csinet.bg} stroke={csinet.border} strokeWidth={1.5} />
        <text x={160} y={76} textAnchor="middle" fontSize={11} fontWeight="bold" fill={csinet.text}>Encoder</text>
        <text x={160} y={92} textAnchor="middle" fontSize={9} fill={csinet.text}>CSI 압축</text>

        {/* Arrow */}
        <line x1={200} y1={80} x2={228} y2={80} stroke={csinet.arrow} strokeWidth={2} markerEnd="url(#arrowAmberFB)" />

        {/* Codeword */}
        <rect x={230} y={60} width={55} height={40} rx={6} fill="#fde68a" stroke={csinet.border} strokeWidth={1.5} />
        <text x={257} y={84} textAnchor="middle" fontSize={10} fontWeight="bold" fill={csinet.text}>s (bits)</text>

        {/* Arrow */}
        <line x1={285} y1={80} x2={313} y2={80} stroke={csinet.arrow} strokeWidth={2} markerEnd="url(#arrowAmberFB)" />

        {/* Decoder */}
        <rect x={315} y={55} width={80} height={50} rx={8} fill={csinet.bg} stroke={csinet.border} strokeWidth={1.5} />
        <text x={355} y={76} textAnchor="middle" fontSize={11} fontWeight="bold" fill={csinet.text}>Decoder</text>
        <text x={355} y={92} textAnchor="middle" fontSize={9} fill={csinet.text}>CSI 복원</text>

        {/* Arrow */}
        <line x1={395} y1={80} x2={423} y2={80} stroke={csinet.arrow} strokeWidth={2} markerEnd="url(#arrowAmberFB)" />

        {/* H-hat */}
        <rect x={425} y={55} width={60} height={50} rx={8} fill={csinet.bg} stroke={csinet.border} strokeWidth={1.5} />
        <text x={455} y={76} textAnchor="middle" fontSize={12} fontWeight="bold" fill={csinet.text}>&#x0124;</text>
        <text x={455} y={92} textAnchor="middle" fontSize={9} fill={csinet.text}>복원 채널</text>

        {/* THE WALL */}
        <rect x={493} y={40} width={8} height={75} rx={2} fill={wall.bg} stroke={wall.border} strokeWidth={1.5} />
        <text x={497} y={132} textAnchor="middle" fontSize={9} fontWeight="bold" fill={wall.text}>단절!</text>

        {/* Arrow across wall */}
        <line x1={485} y1={80} x2={509} y2={80} stroke={wall.border} strokeWidth={2} strokeDasharray="4 3" markerEnd="url(#arrowRedFB)" />

        {/* BF Compute */}
        <rect x={511} y={55} width={90} height={50} rx={8} fill="#fee2e2" stroke={wall.border} strokeWidth={1.5} />
        <text x={556} y={76} textAnchor="middle" fontSize={10} fontWeight="bold" fill={wall.text}>BF 계산</text>
        <text x={556} y={92} textAnchor="middle" fontSize={9} fill={wall.text}>w=&#x0124;/||&#x0124;||</text>

        {/* Arrow */}
        <line x1={601} y1={80} x2={629} y2={80} stroke={csinet.arrow} strokeWidth={2} markerEnd="url(#arrowAmberFB)" />

        {/* w output */}
        <rect x={631} y={55} width={55} height={50} rx={8} fill={csinet.bg} stroke={csinet.border} strokeWidth={1.5} />
        <text x={658} y={76} textAnchor="middle" fontSize={13} fontWeight="bold" fill={csinet.text}>w</text>
        <text x={658} y={92} textAnchor="middle" fontSize={9} fill={csinet.text}>BF 벡터</text>

        {/* CsiNet annotation */}
        <text x={355} y={128} textAnchor="middle" fontSize={10} fill="#b45309" fontStyle="italic">손실: MSE(H, &#x0124;) -- NMSE 복원 품질만 최적화</text>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* CsiFBNet Row (y=220..330) */}
        {/* ══════════════════════════════════════════════════════════ */}

        {/* H (Channel) */}
        <rect x={20} y={235} width={70} height={50} rx={8} fill={fbnet.bg} stroke={fbnet.border} strokeWidth={1.5} />
        <text x={55} y={256} textAnchor="middle" fontSize={12} fontWeight="bold" fill={fbnet.text}>H</text>
        <text x={55} y={272} textAnchor="middle" fontSize={9} fill={fbnet.text}>채널 행렬</text>

        {/* Arrow */}
        <line x1={90} y1={260} x2={118} y2={260} stroke={fbnet.arrow} strokeWidth={2} markerEnd="url(#arrowBlueFB)" />

        {/* Encoder */}
        <rect x={120} y={235} width={85} height={50} rx={8} fill={fbnet.bg} stroke={fbnet.border} strokeWidth={1.5} />
        <text x={162} y={256} textAnchor="middle" fontSize={11} fontWeight="bold" fill={fbnet.text}>Encoder</text>
        <text x={162} y={272} textAnchor="middle" fontSize={9} fill={fbnet.text}>CSI 압축</text>

        {/* Arrow */}
        <line x1={205} y1={260} x2={233} y2={260} stroke={fbnet.arrow} strokeWidth={2} markerEnd="url(#arrowBlueFB)" />

        {/* Codeword */}
        <rect x={235} y={240} width={55} height={40} rx={6} fill="#93c5fd" stroke={fbnet.border} strokeWidth={1.5} />
        <text x={262} y={264} textAnchor="middle" fontSize={10} fontWeight="bold" fill={fbnet.text}>s (bits)</text>

        {/* Arrow */}
        <line x1={290} y1={260} x2={318} y2={260} stroke={fbnet.arrow} strokeWidth={2} markerEnd="url(#arrowBlueFB)" />

        {/* Decoder → w directly */}
        <rect x={320} y={235} width={120} height={50} rx={8} fill={fbnet.bg} stroke={fbnet.border} strokeWidth={2} />
        <text x={380} y={256} textAnchor="middle" fontSize={11} fontWeight="bold" fill={fbnet.text}>Decoder</text>
        <text x={380} y={272} textAnchor="middle" fontSize={9} fill={fbnet.text}>BF 벡터 직접 출력</text>

        {/* Arrow - seamless */}
        <line x1={440} y1={260} x2={500} y2={260} stroke={fbnet.arrow} strokeWidth={2.5} markerEnd="url(#arrowBlueFB)" />
        <text x={470} y={252} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#2563eb">직접!</text>

        {/* w output (direct) */}
        <rect x={502} y={235} width={80} height={50} rx={8} fill={fbnet.bg} stroke={fbnet.border} strokeWidth={2} />
        <text x={542} y={256} textAnchor="middle" fontSize={14} fontWeight="bold" fill={fbnet.text}>w</text>
        <text x={542} y={272} textAnchor="middle" fontSize={9} fill={fbnet.text}>BF 벡터</text>

        {/* CsiFBNet annotation */}
        <text x={350} y={308} textAnchor="middle" fontSize={10} fill="#1d4ed8" fontStyle="italic">손실: -E[BF Gain] -- 빔포밍 성능을 직접 최적화</text>

        {/* Key difference callout */}
        <rect x={600} y={225} width={110} height={70} rx={10} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 2" />
        <text x={655} y={250} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#1e3a8a">CSI 복원 불필요!</text>
        <text x={655} y={266} textAnchor="middle" fontSize={9} fill="#1e3a8a">NMSE가 나빠도</text>
        <text x={655} y={282} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#1e3a8a">BF gain이 높음</text>

        {/* ── Defs (arrowheads) ── */}
        <defs>
          <marker id="arrowAmberFB" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={csinet.arrow} />
          </marker>
          <marker id="arrowRedFB" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={wall.border} />
          </marker>
          <marker id="arrowBlueFB" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={fbnet.arrow} />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/* ── Multi-cell Architecture SVG ─────────────────────────────── */

function MultiCellDiagramSVG() {
  const W = 700;
  const H = 260;

  return (
    <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white p-4 dark:border-blue-800 dark:bg-gray-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" aria-label="CsiFBnet-s vs CsiFBnet-m 비교">
        {/* ── Single-cell (CsiFBnet-s) ── */}
        <rect x={10} y={10} width={330} height={230} rx={12} fill="#eff6ff" stroke="#3b82f6" strokeWidth={1.5} />
        <text x={175} y={35} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#1e3a8a">CsiFBnet-s (Single-cell)</text>

        <rect x={30} y={55} width={80} height={35} rx={6} fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1} />
        <text x={70} y={77} textAnchor="middle" fontSize={10} fill="#1e3a8a">h (채널)</text>

        <line x1={110} y1={72} x2={138} y2={72} stroke="#2563eb" strokeWidth={1.5} markerEnd="url(#arrowBlueMC)" />

        <rect x={140} y={55} width={80} height={35} rx={6} fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1} />
        <text x={180} y={77} textAnchor="middle" fontSize={10} fill="#1e3a8a">Encoder</text>

        <line x1={220} y1={72} x2={248} y2={72} stroke="#2563eb" strokeWidth={1.5} markerEnd="url(#arrowBlueMC)" />

        <rect x={250} y={55} width={70} height={35} rx={6} fill="#93c5fd" stroke="#3b82f6" strokeWidth={1.5} />
        <text x={285} y={77} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#1e3a8a">s (bits)</text>

        <line x1={175} y1={90} x2={175} y2={110} stroke="#2563eb" strokeWidth={1.5} markerEnd="url(#arrowBlueMC)" />

        <rect x={80} y={112} width={190} height={40} rx={8} fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1.5} />
        <text x={175} y={133} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#1e3a8a">Decoder</text>
        <text x={175} y={147} textAnchor="middle" fontSize={9} fill="#1e3a8a">BF 벡터 w 직접 출력</text>

        <line x1={175} y1={152} x2={175} y2={172} stroke="#2563eb" strokeWidth={1.5} markerEnd="url(#arrowBlueMC)" />

        <rect x={120} y={174} width={110} height={35} rx={6} fill="#60a5fa" stroke="#2563eb" strokeWidth={1.5} />
        <text x={175} y={196} textAnchor="middle" fontSize={11} fontWeight="bold" fill="white">w (BF 벡터)</text>

        <text x={175} y={225} textAnchor="middle" fontSize={9} fill="#1d4ed8" fontStyle="italic">입력: h (자기 셀 채널만)</text>

        {/* ── Multi-cell (CsiFBnet-m) ── */}
        <rect x={360} y={10} width={330} height={230} rx={12} fill="#faf5ff" stroke="#7c3aed" strokeWidth={1.5} />
        <text x={525} y={35} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#581c87">CsiFBnet-m (Multi-cell)</text>

        <rect x={380} y={50} width={70} height={32} rx={6} fill="#e9d5ff" stroke="#7c3aed" strokeWidth={1} />
        <text x={415} y={70} textAnchor="middle" fontSize={9} fill="#581c87">h_d (desired)</text>

        <rect x={460} y={50} width={70} height={32} rx={6} fill="#e9d5ff" stroke="#7c3aed" strokeWidth={1} />
        <text x={495} y={70} textAnchor="middle" fontSize={9} fill="#581c87">h_i (interf.)</text>

        <rect x={540} y={50} width={50} height={32} rx={6} fill="#e9d5ff" stroke="#7c3aed" strokeWidth={1} />
        <text x={565} y={70} textAnchor="middle" fontSize={9} fill="#581c87">...</text>

        <line x1={490} y1={82} x2={490} y2={100} stroke="#7c3aed" strokeWidth={1.5} markerEnd="url(#arrowPurpleMC)" />

        <rect x={405} y={102} width={170} height={35} rx={6} fill="#e9d5ff" stroke="#7c3aed" strokeWidth={1} />
        <text x={490} y={124} textAnchor="middle" fontSize={10} fill="#581c87">Encoder (multi-CSI 입력)</text>

        <line x1={490} y1={137} x2={490} y2={155} stroke="#7c3aed" strokeWidth={1.5} markerEnd="url(#arrowPurpleMC)" />

        <rect x={405} y={157} width={170} height={40} rx={8} fill="#e9d5ff" stroke="#7c3aed" strokeWidth={1.5} />
        <text x={490} y={178} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#581c87">Decoder (Coordinated)</text>
        <text x={490} y={192} textAnchor="middle" fontSize={9} fill="#581c87">조정된 BF 벡터 출력</text>

        <line x1={490} y1={197} x2={490} y2={215} stroke="#7c3aed" strokeWidth={1.5} markerEnd="url(#arrowPurpleMC)" />

        <text x={525} y={230} textAnchor="middle" fontSize={9} fill="#6b21a8" fontStyle="italic">입력: desired + interfering CSI</text>

        {/* ── Defs ── */}
        <defs>
          <marker id="arrowBlueMC" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
          </marker>
          <marker id="arrowPurpleMC" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#7c3aed" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function CsiFBNetStudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="csifbnet-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">IEEE JSAC 2020</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">arXiv:2011.06099</span>
              <span className="rounded-full bg-sky-300/90 px-3 py-1 text-xs font-bold text-blue-900">Beamforming-Oriented</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              Deep Learning-Based CSI Feedback for Beamforming in Single- and Multi-cell Massive MIMO Systems
            </h2>
            <p className="mt-3 text-sm text-blue-200">
              Jiajia Guo, Chao-Kai Wen, Shi Jin, Geoffrey Ye Li &middot; IEEE JSAC 2020
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              기존 딥러닝 CSI 피드백 연구(CsiNet 등)는 채널 행렬 H를 <span className="font-semibold text-blue-700 dark:text-blue-300">정확하게 복원</span>하는 것(NMSE 최소화)을 목표로 합니다.
              그러나 기지국이 실제로 필요한 것은 복원된 채널이 아니라 <span className="font-semibold text-blue-700 dark:text-blue-300">빔포밍 성능(beamforming gain)</span>입니다.
              NMSE를 최적화하는 것이 반드시 빔포밍 이득을 최적화하는 것은 아닙니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              CsiFBNet은 <span className="font-semibold text-blue-700 dark:text-blue-300">태스크 지향(task-oriented)</span> 접근을 제안합니다:
              디코더가 CSI를 복원하는 대신 <span className="font-semibold text-blue-700 dark:text-blue-300">빔포밍 벡터 w를 직접 출력</span>하며,
              손실 함수도 NMSE가 아닌 <span className="font-semibold text-blue-700 dark:text-blue-300">빔포밍 이득(beamforming gain)</span>을 직접 최대화합니다.
              이를 통해 동일한 피드백 비트로 더 높은 빔포밍 성능을 달성합니다.
              나아가 다중 셀(multi-cell) 시나리오까지 확장하여 조정된 빔포밍을 학습합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Task-Oriented Feedback', 'Beamforming Gain', 'Single-cell & Multi-cell', 'Unsupervised Training', 'CsiFBnet-s / CsiFBnet-m', 'Massive MIMO'].map(tag => (
                <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture ───────────────────────────────────────── */}
      <section id="csifbnet-architecture" className="scroll-mt-20">
        <SectionHeading icon={<Network className="h-5 w-5" />} title="아키텍처: CsiFBnet-s와 CsiFBnet-m" collapsed={!!col['csifbnet-architecture']} onToggle={() => toggle('csifbnet-architecture')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['csifbnet-architecture'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="CsiNet vs CsiFBNet 파이프라인 비교" />
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              아래 다이어그램은 기존 CsiNet(복원 기반)과 CsiFBNet(빔포밍 지향) 접근의 핵심 차이를 보여줍니다.
              CsiNet에서는 복원된 CSI(&#x0124;)로 별도의 빔포밍 계산을 수행하지만,
              CsiFBNet에서는 디코더가 <span className="font-semibold text-blue-600 dark:text-blue-400">빔포밍 벡터 w를 직접 출력</span>합니다:
            </p>

            <ArchitectureDiagramSVG />

            <SubSectionHeading number="2.2" title="Single-cell vs Multi-cell 아키텍처" />
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              CsiFBNet은 두 가지 변형을 제안합니다. <span className="font-semibold text-blue-600 dark:text-blue-400">CsiFBnet-s</span>는 단일 셀 시나리오에서
              자기 셀의 채널 h만 입력받아 빔포밍 벡터를 출력합니다.
              <span className="font-semibold text-purple-600 dark:text-purple-400">CsiFBnet-m</span>은 다중 셀 시나리오에서
              원하는 채널과 간섭 채널을 모두 입력받아 셀 간 간섭을 고려한 조정된 빔포밍을 출력합니다.
            </p>

            <MultiCellDiagramSVG />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">CsiFBnet-s (Single-cell)</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  인코더가 채널 벡터 h를 압축하여 코드워드 s를 생성합니다. 디코더는 s를 받아 빔포밍 벡터 w를 직접 출력합니다.
                  기존처럼 H&#770;를 복원한 뒤 w = H&#770;/||H&#770;|| 를 계산하는 것이 아니라, DNN이 압축된 정보에서 최적 빔포밍 방향을 직접 학습합니다.
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">CsiFBnet-m (Multi-cell)</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  사용자가 여러 기지국의 CSI(desired h_d + interfering h_i)를 인코더에 입력합니다.
                  디코더는 셀 간 간섭(inter-cell interference)을 고려한 조정된 빔포밍 벡터를 출력합니다.
                  기존 방법에서는 다중 셀 조정이 별도의 최적화 문제였으나, 여기서는 E2E 학습으로 통합됩니다.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">비지도(Unsupervised) 학습 전략</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                CsiFBNet의 학습은 레이블이 필요 없는 비지도 방식입니다. 최적의 빔포밍 벡터 w*를 미리 계산할 필요 없이,
                채널 H 샘플만으로 빔포밍 이득을 손실 함수로 사용하여 네트워크가 스스로 최적 압축 전략과 빔포밍 출력을 학습합니다.
                이는 기존 지도학습 기반 DL-CSI 방법과의 중요한 차이점입니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Loss Function ──────────────────────────────────────── */}
      <section id="csifbnet-loss" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="손실 함수 설계: NMSE vs. Beamforming Gain" collapsed={!!col['csifbnet-loss']} onToggle={() => toggle('csifbnet-loss')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['csifbnet-loss'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="기존 접근: MSE/NMSE 최소화" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              기존 DL 기반 CSI 피드백(CsiNet 등)은 다음과 같은 NMSE를 손실 함수로 사용합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <EquationRenderer latex={String.raw`\mathcal{L}_{\text{NMSE}} = \mathbb{E}\!\left[\frac{\|\mathbf{H} - \hat{\mathbf{H}}\|^2}{\|\mathbf{H}\|^2}\right]`} />
            </div>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              이 손실 함수의 핵심 한계:
            </p>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">목표 불일치 (Objective Mismatch)</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  NMSE는 채널 복원의 정확도를 측정하지만, 실제 시스템의 목표는 빔포밍 성능입니다.
                  같은 NMSE 값이라도 오차의 방향에 따라 빔포밍 이득이 크게 달라질 수 있습니다.
                  채널의 주요 방향(dominant direction)에서의 오차가 빔포밍에 치명적입니다.
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                <p className="mb-1 text-xs font-bold text-red-700 dark:text-red-300">비트 낭비</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  NMSE를 최소화하면 인코더가 채널의 모든 성분을 균등하게 복원하려 합니다.
                  그러나 빔포밍에 중요한 것은 채널의 방향(direction) 정보이지, 진폭(magnitude) 세부사항이 아닙니다.
                  제한된 비트를 방향 정보에 집중하면 더 높은 빔포밍 이득을 얻을 수 있습니다.
                </p>
              </div>
            </div>

            <SubSectionHeading number="3.2" title="CsiFBNet 접근: Beamforming Gain 최대화" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              CsiFBNet은 NMSE 대신 빔포밍 이득(Beamforming Gain)을 직접 손실 함수로 사용합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <EquationRenderer latex={String.raw`\mathcal{L} = -\mathbb{E}\!\left[\frac{|\mathbf{h}^H \mathbf{w}|^2}{\|\mathbf{h}\|^2}\right] = -\mathbb{E}\!\left[\frac{|\mathbf{h}^H f_\theta(\mathbf{s})|^2}{\|\mathbf{h}\|^2}\right]`} />
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              여기서 w = f_theta(s)는 디코더가 출력하는 빔포밍 벡터이고, s = g_phi(h)는 인코더의 출력(코드워드)입니다.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">왜 이것이 더 나은가?</p>
                <p className="mt-1 text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                  빔포밍 이득 |h^H w|^2 / ||h||^2 는 w가 h의 방향과 얼마나 잘 정렬되어 있는지를 측정합니다.
                  이 손실 함수는 인코더에게 &quot;채널을 충실히 복원하라&quot;가 아니라
                  &quot;디코더가 좋은 빔포밍 벡터를 만들 수 있는 정보를 전달하라&quot;고 요구합니다.
                  결과적으로 인코더는 방향 정보에 비트를 집중하게 됩니다.
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-900/20">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">핵심 관찰: NMSE가 나빠도 BF gain은 높을 수 있다</p>
                <p className="mt-1 text-xs leading-relaxed text-orange-600 dark:text-orange-400">
                  CsiFBNet은 종종 CsiNet보다 더 높은 NMSE(더 나쁜 복원 품질)를 보이면서도
                  더 높은 빔포밍 이득을 달성합니다. 이는 인코더가 복원 품질을 의도적으로 희생하고
                  빔포밍에 중요한 정보(방향)에 비트를 집중했기 때문입니다.
                  이것이 태스크 지향 설계의 핵심 효과입니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="csifbnet-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['csifbnet-equations']} onToggle={() => toggle('csifbnet-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['csifbnet-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="빔포밍 이득 (Beamforming Gain)" color="blue"
                latex={String.raw`G = \frac{|\mathbf{h}^H \mathbf{w}|^2}{\|\mathbf{h}\|^2}`}
                description="빔포밍 벡터 w가 채널 h에 대해 얼마나 효과적인지를 나타내는 지표. 분자 |h^H w|^2는 빔 정렬도(beam alignment)이고, 분모 ||h||^2는 채널 전력 정규화. G의 범위는 0 <= G <= 1이며, w가 h의 방향과 완벽히 정렬되면(w = h/||h||) G = 1 (최대). 기존 CSI 피드백 연구들이 NMSE를 최적화한 반면, CsiFBNet은 이 G를 직접 최대화하는 것이 핵심 아이디어입니다." />

              <EqCard idx={2} name="CsiFBNet 손실 함수" color="blue"
                latex={String.raw`\mathcal{L}(\phi,\theta) = -\mathbb{E}\!\left[\frac{|\mathbf{h}^H f_\theta(g_\phi(\mathbf{h}))|^2}{\|\mathbf{h}\|^2}\right]`}
                description="인코더 g_phi와 디코더 f_theta의 공동 학습을 위한 손실 함수. g_phi(h)는 인코더가 채널 h를 압축한 코드워드 s, f_theta(s)는 디코더가 코드워드로부터 출력한 빔포밍 벡터 w. 기대값은 채널 분포에 대해 취합니다. 음의 부호는 빔포밍 이득을 최대화하기 위해 손실을 최소화하는 형태로 변환한 것입니다. 레이블(최적 w*)이 필요 없는 비지도 학습 방식입니다." />

              <EqCard idx={3} name="단일 셀 최적 빔포밍 벡터" color="green"
                latex={String.raw`\mathbf{w}^* = \frac{\mathbf{h}}{\|\mathbf{h}\|} \quad \Rightarrow \quad G^* = \frac{|\mathbf{h}^H \mathbf{w}^*|^2}{\|\mathbf{h}\|^2} = 1`}
                description="완전한 CSI가 주어진 경우, 단일 사용자 빔포밍의 최적 해는 채널 방향의 단위 벡터(MRT: Maximum Ratio Transmission)입니다. 이 경우 빔포밍 이득 G = 1로 최대값을 달성합니다. CsiFBNet의 목표는 제한된 피드백 비트로도 G를 1에 가깝게 만드는 것입니다. 피드백 비트가 무한하면 채널을 완벽히 전달할 수 있어 G = 1이지만, 유한 비트에서는 G < 1이 됩니다." />

              <EqCard idx={4} name="다중 셀 SINR" color="purple"
                latex={String.raw`\text{SINR}_k = \frac{|\mathbf{h}_{k,k}^H \mathbf{w}_k|^2}{\sum_{j \neq k} |\mathbf{h}_{k,j}^H \mathbf{w}_j|^2 + \sigma^2}`}
                description="다중 셀 시나리오에서 사용자 k의 SINR(Signal-to-Interference-plus-Noise Ratio). 분자 |h_{k,k}^H w_k|^2는 k번째 기지국이 사용자 k에게 보내는 원하는 신호 전력(desired signal power). 분모의 합 |h_{k,j}^H w_j|^2는 다른 기지국 j의 빔포밍 벡터가 사용자 k에게 일으키는 셀 간 간섭(inter-cell interference), sigma^2는 잡음 전력. CsiFBnet-m은 이 SINR을 최대화하기 위해 모든 셀의 빔포밍 벡터를 조정(coordinated beamforming)합니다." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="csifbnet-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과: BF Gain 성능 비교" collapsed={!!col['csifbnet-results']} onToggle={() => toggle('csifbnet-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['csifbnet-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="5.1" title="압축률에 따른 빔포밍 이득 비교" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              다양한 압축률(compression ratio)에서 CsiFBNet vs. CsiNet + BF 계산 vs. 전통적 코드북 방법의 빔포밍 이득 비교:
            </p>
            <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">압축률 (CR)</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">코드북 기반</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">CsiNet + BF</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">CsiFBNet</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">NMSE (CsiFBNet)</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">핵심 관찰</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { cr: '1/4',  codebook: '~0.65', csinet: '~0.88', fbnet: '~0.95', nmse: '더 높음', obs: 'NMSE 나쁘지만 BF gain 우수', hi: true },
                    { cr: '1/8',  codebook: '~0.52', csinet: '~0.78', fbnet: '~0.90', nmse: '더 높음', obs: '낮은 CR에서 격차 증가', hi: true },
                    { cr: '1/16', codebook: '~0.38', csinet: '~0.62', fbnet: '~0.82', nmse: '더 높음', obs: '극저 CR에서 가장 큰 이득', hi: true },
                    { cr: '1/32', codebook: '~0.25', csinet: '~0.45', fbnet: '~0.70', nmse: '더 높음', obs: '태스크 지향의 힘', hi: false },
                    { cr: 'Perfect CSI', codebook: '—', csinet: '—', fbnet: '—', nmse: '—', obs: 'G = 1.0 (상한)', hi: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.cr}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.codebook}</td>
                      <td className="px-3 py-2 text-center font-mono text-amber-600 dark:text-amber-400">{r.csinet}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-blue-700 dark:text-blue-300' : 'text-green-600 dark:text-green-400'}`}>{r.fbnet}</td>
                      <td className="px-3 py-2 text-center text-xs text-orange-600 dark:text-orange-400">{r.nmse}</td>
                      <td className="px-3 py-2 text-center text-xs text-gray-600 dark:text-gray-400">{r.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              * BF Gain 범위: 0~1. N_t=32 안테나, COST2100 채널 모델 기준. 수치는 논문의 대표적 시뮬레이션 결과를 근사적으로 표현.
            </p>

            <SubSectionHeading number="5.2" title="다중 셀 조정 빔포밍 결과" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              CsiFBnet-m은 다중 셀 시나리오에서 셀 간 간섭을 고려한 조정된 빔포밍을 학습합니다:
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">셀 간 간섭 억제</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  CsiFBnet-m은 간섭 채널 정보를 활용하여 인접 셀 사용자에게 간섭을 최소화하는 빔포밍 방향을 학습합니다.
                  기존 방법(각 셀 독립 최적화)에 비해 셀 경계 사용자의 SINR이 크게 향상됩니다.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">추가 피드백 오버헤드</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  다중 셀 조정을 위해 간섭 채널의 CSI도 피드백해야 하므로 총 피드백 비트가 증가하지만,
                  CsiFBnet-m의 태스크 지향 압축 덕분에 기존 복원 기반 방법보다 훨씬 적은 비트로도
                  우수한 조정 빔포밍 성능을 달성합니다.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">핵심 발견: NMSE가 나빠도 BF gain은 높다</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  CsiFBNet의 가장 중요한 실험적 발견은 CsiNet보다 NMSE가 더 높음(복원 품질이 더 나쁨)에도 불구하고
                  빔포밍 이득은 일관되게 더 높다는 것입니다. 이는 네트워크가 복원 정확도를 의도적으로 포기하고
                  빔포밍에 필요한 방향 정보에 피드백 비트를 집중하기 때문입니다.
                  특히 낮은 압축률(1/16, 1/32)에서 이 효과가 극대화됩니다.
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-900/20">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">비트 효율성</p>
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                  동일한 BF gain을 달성하기 위해 CsiFBNet은 CsiNet 대비 약 50%~75% 적은 피드백 비트만 필요합니다.
                  예를 들어, CsiNet이 CR=1/4에서 달성하는 BF gain을 CsiFBNet은 CR=1/16에서 달성할 수 있습니다.
                  이는 실제 시스템에서 피드백 오버헤드를 대폭 줄일 수 있음을 의미합니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────── */}
      <section id="csifbnet-quiz" className="scroll-mt-20">
        <SectionHeading icon={<FlaskConical className="h-5 w-5" />} title="자기 점검 (연구자 수준)" />
        <Card>
          <QuizSection color="blue" questions={[
            {
              q: 'CsiFBNet의 디코더 출력은 무엇이며, 이것이 기존 CsiNet 디코더와 어떻게 다른가?',
              a: 'CsiFBNet의 디코더는 CSI 복원값(H-hat)이 아니라 빔포밍 벡터 w를 직접 출력합니다. CsiNet에서는 디코더가 H-hat을 출력하고, 이를 별도의 빔포밍 알고리즘(예: MRT에서는 w = H-hat/||H-hat||)에 입력하여 w를 계산하는 2단계 과정이 필요합니다. CsiFBNet은 이 2단계를 하나의 DNN으로 통합하여 압축된 코드워드에서 빔포밍 벡터를 직접 추론합니다. 이렇게 하면 복원 오차가 빔포밍 계산으로 전파되는 문제를 근본적으로 제거합니다.',
            },
            {
              q: 'NMSE가 더 나쁘면서 BF gain이 더 좋을 수 있는 이유는 무엇인가?',
              a: '제한된 피드백 비트로 채널을 압축할 때, NMSE 최적화와 BF gain 최적화는 서로 다른 정보에 비트를 할당합니다. NMSE는 채널의 모든 성분을 균등하게 복원하려 하지만, BF gain은 채널의 방향(direction) 정보만 정확하면 됩니다. CsiFBNet의 인코더는 채널의 진폭 세부사항이나 작은 성분의 복원을 포기하고, 빔포밍에 가장 중요한 주요 방향 정보에 비트를 집중합니다. 결과적으로 전체 복원 오차(NMSE)는 커지지만, 빔포밍 벡터의 방향 정렬도는 더 높아집니다. 이는 MSE와 태스크 성능 사이의 비선형 관계를 보여주는 핵심 사례입니다.',
            },
            {
              q: 'Single-cell에서 최적 빔포밍 벡터는 무엇이며, 이때의 BF gain은?',
              a: 'w* = h/||h||, 즉 채널 방향의 단위벡터(MRT: Maximum Ratio Transmission)입니다. 이때 BF gain G = |h^H w*|^2 / ||h||^2 = |h^H h / ||h|| |^2 / ||h||^2 = ||h||^4 / (||h||^2 * ||h||^2) = 1로 최대값을 달성합니다. 즉 빔을 채널 방향에 완벽히 정렬시키면 모든 채널 에너지를 활용할 수 있습니다. CsiFBNet의 목표는 제한된 피드백 비트로도 w를 w*에 최대한 가깝게 만드는 것이며, 이는 결국 h의 방향 정보를 효율적으로 전달하는 문제로 귀결됩니다.',
            },
            {
              q: 'CsiFBnet-m이 CsiFBnet-s보다 우수한 이유와, 추가로 필요한 정보는 무엇인가?',
              a: 'CsiFBnet-m은 desired 채널(h_d)뿐만 아니라 interfering 채널(h_i)도 인코더에 입력으로 받아, 셀 간 간섭을 고려한 조정된 빔포밍 벡터를 출력합니다. CsiFBnet-s는 자기 셀의 채널만 보고 빔포밍을 결정하므로 인접 셀 간섭을 무시합니다. CsiFBnet-m에서는 사용자가 인접 기지국의 채널도 추정하여 피드백해야 하므로 추가 피드백 오버헤드가 필요하지만, 태스크 지향 압축 덕분에 간섭 채널의 핵심 정보(간섭 방향)만 효율적으로 전달하여 적은 추가 비트로도 큰 성능 이득을 얻습니다. 이는 조정 빔포밍(coordinated beamforming)을 E2E 학습으로 구현한 것입니다.',
            },
          ]} />
        </Card>
      </section>

    </div>
    </GlossaryText>
  );
}
