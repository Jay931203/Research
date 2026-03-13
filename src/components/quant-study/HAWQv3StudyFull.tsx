'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart2,
  BrainCircuit,
  ChevronDown,
  Cpu,
  GraduationCap,
  Hash,
  Layers,
  AlertTriangle,
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
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{number}</span>
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
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };
  const badgeMap: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  };
  return (
    <div className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700" onClick={() => setOpen(v => !v)}>
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


/* ── DyadicViz ───────────────────────────────────────────────── */

function DyadicViz() {
  const [value, setValue] = useState(0.1234);

  const rows = useMemo(() => {
    return Array.from({ length: 8 }, (_, idx) => {
      const c = idx + 1;
      const scale = Math.pow(2, c);
      const b = Math.round(value * scale);
      const approx = b / scale;
      const error = Math.abs(value - approx);
      const good = error < 0.005;
      return { c, b, approx, error, good };
    });
  }, [value]);

  const maxError = rows[0].error || 1;

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-5 dark:border-purple-800 dark:bg-purple-900/10">
      <p className="mb-1 text-sm font-bold text-purple-700 dark:text-purple-300">다이아딕 근사 인터랙티브 시연</p>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        스케일 팩터(S)를 선택하면 각 c에 대해 b/2^c 근사와 오차를 실시간으로 확인합니다.
      </p>

      {/* Slider */}
      <div className="mb-5 flex items-center gap-4">
        <label className="w-28 flex-shrink-0 text-xs font-semibold text-gray-600 dark:text-gray-400">
          스케일 팩터 S
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.0001}
          value={value}
          onChange={e => setValue(parseFloat(e.target.value))}
          className="flex-1 accent-purple-600"
        />
        <span className="w-20 rounded-lg bg-purple-100 px-2 py-1 text-center font-mono text-sm font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
          {value.toFixed(4)}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-purple-100 dark:bg-purple-900/30">
              <th className="px-3 py-2 text-left font-bold text-purple-700 dark:text-purple-300">c (시프트)</th>
              <th className="px-3 py-2 text-center font-bold text-purple-700 dark:text-purple-300">b = round(S·2^c)</th>
              <th className="px-3 py-2 text-center font-bold text-purple-700 dark:text-purple-300">b/2^c (근사값)</th>
              <th className="px-3 py-2 text-center font-bold text-purple-700 dark:text-purple-300">|오차|</th>
              <th className="px-3 py-2 text-center font-bold text-purple-700 dark:text-purple-300">오차 시각화</th>
              <th className="px-3 py-2 text-center font-bold text-purple-700 dark:text-purple-300">충분?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map(({ c, b, approx, error, good }) => {
              const barPct = Math.min(100, (error / (maxError + 1e-9)) * 100);
              return (
                <tr
                  key={c}
                  className={good
                    ? 'bg-green-50 dark:bg-green-900/15'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                >
                  <td className="px-3 py-2 font-mono font-semibold text-gray-700 dark:text-gray-300">c = {c}</td>
                  <td className="px-3 py-2 text-center font-mono text-purple-700 dark:text-purple-300">{b}</td>
                  <td className="px-3 py-2 text-center font-mono text-gray-600 dark:text-gray-400">{approx.toFixed(6)}</td>
                  <td className={`px-3 py-2 text-center font-mono font-semibold ${good ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {error.toFixed(6)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${good ? 'bg-green-500' : 'bg-red-400'}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-base">
                    {good ? '✓' : '✗'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Why it matters */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">왜 중요한가?</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
          정규화 인자 S_w·S_h/S_a를 b/2^c로 근사하면, 행렬 곱 후 재정규화를 <strong>나눗셈 없이 비트 시프트 1회</strong>로 처리할 수 있습니다.
          충분한 c(≥5~6 수준)에서 오차 &lt; 0.005가 되면 정밀도 손실 없이 정수 연산만으로 추론이 완결됩니다.
        </p>
      </div>

      {/* Comparison boxes */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
          <p className="mb-2 text-xs font-bold text-red-700 dark:text-red-300">기존 FP32 재정규화</p>
          <code className="block rounded bg-red-100 px-2 py-1 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-300">
            out = (q_w * q_h) * (Sw*Sh/Sa)
          </code>
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            FP32 나눗셈 필요 → GPU INT 유닛 우회<br/>
            → 실제로는 &ldquo;가짜 양자화&rdquo; 상태
          </p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
          <p className="mb-2 text-xs font-bold text-green-700 dark:text-green-300">다이아딕 재정규화 (시프트만)</p>
          <code className="block rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
            out = (q_w * q_h * b) {'>'}{'>'}  c
          </code>
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            비트 시프트만! FP 연산 0회<br/>
            → 완전한 정수 전용 추론 달성
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export default function HAWQv3StudyFull() {
  const [col, setCol] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => setCol(c => ({ ...c, [id]: !c[id] })), []);

  return (
    <GlossaryText>
    <div className="space-y-6">

      {/* ── Overview ─────────────────────────────────────────── */}
      <section id="hawq-overview" className="scroll-mt-20">
        <div className="overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-br from-purple-700 via-violet-700 to-fuchsia-700 p-6 pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">ICML 2021</span>
              <span className="rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-yellow-900">정수 전용 추론</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">arxiv 2011.10680</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              HAWQ-V3: Dyadic Neural Network Quantization
            </h2>
            <p className="mt-3 text-sm text-purple-200">
              Yao et al. (UC Berkeley / Microsoft Research) · ICML 2021
            </p>
          </div>
          <div className="bg-white p-6 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              기존 양자화 프레임워크들이 INT 연산 이후 <span className="font-semibold text-purple-700 dark:text-purple-300">FP32 재정규화</span>를 숨겨두던 문제를
              해결하는 완전한 정수 전용(integer-only) 추론 프레임워크.
              핵심 아이디어: 재정규화 인자를 <em>다이아딕 수(dyadic number, b/2^c)</em>로 근사하면
              나눗셈을 비트 시프트 한 번으로 대체할 수 있어 FP 연산을 완전히 제거할 수 있습니다.
            </p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
              이에 더해 <span className="font-semibold text-purple-700 dark:text-purple-300">Hessian 기반 ILP</span>로 레이어별 최적 비트폭을 수초 내에 결정하고,
              BatchNorm 흡수(BN fusion)와 다이아딕 잔차 덧셈으로 완전한 파이프라인을 구성합니다.
              ResNet50 INT8에서 77.58% Top-1(당시 정수 전용 SOTA), INT4/8 혼합에서 23% 지연 감소를 달성합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['다이아딕 재정규화', 'Hessian ILP 혼합 정밀도', 'BN Fusion', '정수 전용 추론', 'TVM 컴파일러'].map(tag => (
                <span key={tag} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ───────────────────────────────────────────── */}
      <section id="hawq-problem" className="scroll-mt-20">
        <SectionHeading icon={<AlertTriangle className="h-5 w-5" />} title="숨겨진 오류: 가짜 양자화의 함정" collapsed={!!col['hawq-problem']} onToggle={() => toggle('hawq-problem')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hawq-problem'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="1.1" title="가짜 양자화(Fake Quantization)란?" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              기존 PyTorch, TensorFlow의 양자화 인식 학습(QAT) 및 많은 PTQ 프레임워크는
              INT 연산 후 재정규화를 FP32로 수행합니다. 이를 <strong>가짜 양자화</strong>라 부릅니다.
            </p>
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
              <p className="mb-2 text-xs font-bold text-red-700 dark:text-red-300">가짜 양자화의 실제 연산 흐름</p>
              <code className="block whitespace-pre-wrap rounded bg-red-100 px-3 py-2 font-mono text-xs text-red-800 dark:bg-red-900/30 dark:text-red-300">{`// 보이는 것: INT8 연산
q_out = q_w ⊗ q_h           // INT8 × INT8 = INT32

// 숨겨진 것: FP32 재정규화 (실제 하드웨어에서 FP 유닛 사용!)
out = float(q_out) * (Sw * Sh / Sa)  // FP32 나눗셈/곱셈`}</code>
            </div>

            <SubSectionHeading number="1.2" title="왜 문제인가: 후반 레이어 오차 누적" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              딥 네트워크에서 FP32 재정규화 오차는 레이어를 거칠수록 누적됩니다.
              실험적으로 ResNet50의 경우 전체 추론 오차의 95% 이상이 재정규화 단계에서 발생합니다.
            </p>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: '초반 레이어', pct: '~3%', color: 'green', desc: '재정규화 오차 무시 가능' },
                { label: '중간 레이어', pct: '~15%', color: 'amber', desc: '오차 누적 시작' },
                { label: '후반 레이어', pct: '>95%', color: 'red', desc: '재정규화 오차 지배적' },
              ].map(({ label, pct, color, desc }) => (
                <div key={label} className={`rounded-lg border border-${color}-200 bg-${color}-50 p-3 dark:border-${color}-900/40 dark:bg-${color}-900/10`}>
                  <p className={`text-xs font-bold text-${color}-700 dark:text-${color}-300`}>{label}</p>
                  <p className={`mt-1 text-2xl font-black text-${color}-600 dark:text-${color}-400`}>{pct}</p>
                  <p className={`mt-0.5 text-xs text-${color}-600 dark:text-${color}-400`}>{desc}</p>
                </div>
              ))}
            </div>

            <SubSectionHeading number="1.3" title="정수 전용 추론이 필요한 이유" />
            <div className="space-y-2">
              {[
                { icon: '⚡', title: 'INT 유닛 전용 가속기', desc: 'NVIDIA T4, A100의 INT4/INT8 Tensor Core는 FP 유닛과 분리되어 있어, FP 재정규화가 끼어들면 INT 파이프라인이 중단됩니다.' },
                { icon: '📱', title: '엣지 디바이스 (DSP/NPU)', desc: '모바일 SoC의 DSP나 전용 NPU는 아예 FP 유닛 자체가 없는 경우가 많습니다. 정수 전용 추론만이 배포 가능합니다.' },
                { icon: '🔋', title: '에너지 효율', desc: 'FP32 연산의 에너지 소비는 INT8의 4~7배입니다. 배터리 제한 환경에서 FP 재정규화가 병목이 됩니다.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <span className="text-base">{icon}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{title}</p>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ── Dyadic Numbers ────────────────────────────────────── */}
      <section id="hawq-dyadic" className="scroll-mt-20">
        <SectionHeading icon={<Zap className="h-5 w-5" />} title="다이아딕 수: 나눗셈을 비트 시프트로" collapsed={!!col['hawq-dyadic']} onToggle={() => toggle('hawq-dyadic')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hawq-dyadic'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="2.1" title="다이아딕 수의 정의" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <strong>다이아딕 수(dyadic rational number)</strong>는 분모가 2의 거듭제곱인 유리수입니다.
              즉, 정수 b와 음이 아닌 정수 c에 대해 b/2^c 형태로 표현되는 수입니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`d = \frac{b}{2^c}, \quad b \in \mathbb{Z},\; c \in \mathbb{Z}_{\geq 0}`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              핵심 성질: 다이아딕 수를 곱하는 것은 정수 곱셈(×b) + 오른쪽 비트 시프트(≫c) 두 연산으로 완결됩니다.
              나눗셈과 FP 변환이 전혀 필요하지 않습니다.
            </p>

            <SubSectionHeading number="2.2" title="행렬 곱 재정규화에 적용" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              INT8 행렬 곱에서 재정규화 인자는 S_w·S_h/S_a입니다.
              이 값을 다이아딕 수 b/2^c로 근사하면:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`q_a = \mathrm{Int}\!\left(\frac{S_w \cdot S_h}{S_a}\,(q_w \cdot q_h)\right) \approx \mathrm{Int}\!\left(\frac{b}{2^c}\,(q_w \cdot q_h)\right) = (q_w \cdot q_h \cdot b) \gg c`} />
            </div>
            <div className="mb-5 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">연산 변환 요약</p>
              <p className="mt-1 text-xs leading-relaxed text-purple-600 dark:text-purple-400">
                FP32 나눗셈(S_w·S_h/S_a) → 정수 곱셈(×b) + 비트 시프트(≫c). 완전 정수 연산으로 재정규화 완결.
                b와 c는 오프라인(양자화 시점)에서 계산하여 모델에 저장합니다.
              </p>
            </div>

            <SubSectionHeading number="2.3" title="다이아딕 근사 인터랙티브 시연" />
            <DyadicViz />
          </Card>
        </div>
      </section>

      {/* ── ILP Mixed Precision ───────────────────────────────── */}
      <section id="hawq-ilp" className="scroll-mt-20">
        <SectionHeading icon={<BrainCircuit className="h-5 w-5" />} title="Hessian 기반 ILP 혼합 정밀도 선택" collapsed={!!col['hawq-ilp']} onToggle={() => toggle('hawq-ilp')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hawq-ilp'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="3.1" title="Hessian 트레이스: 레이어 민감도 측정" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              레이어 i의 양자화 민감도를 Hessian 행렬의 트레이스로 정량화합니다.
              트레이스가 클수록 해당 레이어의 가중치 변화가 손실 함수에 크게 영향을 미칩니다.
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`\Omega_i = \mathrm{Tr}(H_i) = \sum_j \lambda_j^{(i)}, \quad H_i = \frac{\partial^2 \mathcal{L}}{\partial W_i^2}`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              트레이스는 Hessian의 모든 고유값의 합으로, 레이어 민감도의 스칼라 요약입니다.
              파워 이터레이션(power iteration)으로 빠르게 추정할 수 있습니다.
              Ω_i가 크면 해당 레이어에 더 높은 비트폭을 할당해야 합니다.
            </p>

            <SubSectionHeading number="3.2" title="ILP 문제 공식화" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              각 레이어 i에 할당할 비트폭 b_i를 결정하는 최적화 문제를 정수 선형 계획법(ILP)으로 공식화합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`\min_{\mathbf{b}}\; \sum_i \Omega_i^{(b_i)} \quad \text{s.t.}\quad \mathrm{Size}(\mathbf{b}) \leq C_s,\; \mathrm{BOPS}(\mathbf{b}) \leq C_b`} />
            </div>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">제약 조건</p>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li><code className="font-mono text-purple-600 dark:text-purple-400">Size(b) ≤ C_s</code>: 모델 크기 제약 (MB)</li>
                  <li><code className="font-mono text-purple-600 dark:text-purple-400">BOPS(b) ≤ C_b</code>: 비트 연산 수(Bit Operations) 제약</li>
                  <li>b_i ∈ {'{2, 4, 8}'}: 각 레이어는 이산 비트폭 선택</li>
                </ul>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">목적 함수</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Ω_i^(b_i): 비트폭 b_i에서 레이어 i의 양자화 오차 (Hessian 트레이스로 가중).
                  낮은 비트 → 높은 오차 → ILP가 민감한 레이어에 높은 비트를 할당.
                </p>
              </div>
            </div>

            <SubSectionHeading number="3.3" title="ILP가 RL보다 우월한 이유" />
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">탐색 시간</th>
                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">최적성</th>
                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">특징</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'RL (HAQ 등)', t: '수 시간~수일', opt: '근사 최적', note: '모델 재훈련 불필요하나 탐색 비용 극심, GPU 수십 개 필요' },
                    { m: 'NAS 기반', t: '수 일', opt: '근사 최적', note: '슈퍼넷 훈련 필요, 자원 집약적' },
                    { m: 'HAWQ ILP ★', t: '수 초', opt: '전역 최적', note: 'ILP 솔버(GLPK 등)로 수초 내 전역 최적해. Hessian 추정 포함해도 수 분' },
                  ].map((r, i) => (
                    <tr key={i} className={i === 2 ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${i === 2 ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${i === 2 ? 'text-purple-700 dark:text-purple-300' : 'text-red-500 dark:text-red-400'}`}>{r.t}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{r.opt}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <SubSectionHeading number="3.4" title="ILP 설정 단계별 가이드" />
              <div className="space-y-2">
                {[
                  { step: '①', text: '보정 데이터(128~512 샘플)로 각 레이어의 Hessian 트레이스 Ω_i 추정 (파워 이터레이션)' },
                  { step: '②', text: '각 레이어·비트폭 조합 (i, b_i)에 대해 Size 기여와 BOPS 기여를 사전 계산' },
                  { step: '③', text: '목표 압축률(C_s) 또는 지연 목표(C_b)를 사용자 지정' },
                  { step: '④', text: 'GLPK/CVXPY 등 오픈소스 ILP 솔버로 수초 내 전역 최적 비트폭 배열 b* 획득' },
                  { step: '⑤', text: '할당된 b_i로 각 레이어를 양자화, 다이아딕 재정규화 상수(b_d, c_d) 계산 및 저장' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">{step}</span>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Integration ───────────────────────────────────────── */}
      <section id="hawq-integration" className="scroll-mt-20">
        <SectionHeading icon={<Layers className="h-5 w-5" />} title="완전한 정수 전용 파이프라인 통합" collapsed={!!col['hawq-integration']} onToggle={() => toggle('hawq-integration')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hawq-integration'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="4.1" title="BatchNorm 흡수 (BN Fusion)" />
            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              BatchNorm은 FP32 통계(μ, σ, γ, β)를 사용하므로 정수 전용 추론의 장애물입니다.
              HAWQ-V3는 BN을 직전 Conv 레이어로 완전히 흡수합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`\bar{W} = \frac{\beta}{\sigma} W, \quad \bar{b} = \gamma - \frac{\beta \mu}{\sigma}`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              γ(스케일), β(시프트), μ(배치 평균), σ(배치 표준편차)를 Conv 가중치 W와 바이어스 b에 직접 곱/합산합니다.
              변환 후 BN 레이어가 사라지므로 추론 시 FP 통계 처리가 필요 없습니다.
            </p>
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">수치 안정성 주의</p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                BN fusion은 추론(eval) 모드에서만 적용 가능합니다. 학습 중 running_mean/var는 계속 갱신되므로
                QAT 완료 후 eval 모드로 전환 → fusion 순서를 지켜야 합니다.
                σ가 매우 작은 레이어에서 수치 불안정이 발생할 수 있어 ε(epsilon) 처리가 필요합니다.
              </p>
            </div>

            <SubSectionHeading number="4.2" title="다이아딕 잔차 덧셈 (Residual Addition)" />
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              ResNet 구조에서 잔차 연결의 두 텐서는 서로 다른 스케일(S_m, S_r)을 가질 수 있습니다.
              이를 정수로 더하려면 공통 스케일 S_a로 재정규화해야 합니다:
            </p>
            <div className="mb-4 overflow-x-auto rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <EquationRenderer latex={String.raw`q_a = \mathrm{DN}\!\left(\frac{S_m}{S_a}\right)\!\cdot q_m + \mathrm{DN}\!\left(\frac{S_r}{S_a}\right)\!\cdot q_r`} />
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              DN(·)은 다이아딕 근사 연산자. S_m/S_a와 S_r/S_a를 각각 다이아딕 수로 근사하면
              두 재정규화 모두 비트 시프트로 처리됩니다. 덧셈 자체도 INT 덧셈이므로 완전 정수 연산.
            </p>

            <SubSectionHeading number="4.3" title="완전한 정수 전용 추론 파이프라인" />
            <div className="relative">
              <div className="space-y-2">
                {[
                  { label: '입력 양자화', desc: 'FP32 입력 → INT8/INT4 (스케일 인수 저장)', color: 'purple' },
                  { label: 'INT 행렬 곱', desc: 'q_w ⊗ q_h → INT32 누산 (INT Tensor Core)', color: 'purple' },
                  { label: '다이아딕 재정규화', desc: '(acc × b) >> c → INT 출력 (FP 0회)', color: 'purple' },
                  { label: 'INT 바이어스 덧셈', desc: 'INT32 바이어스 덧셈 (BN 흡수 후)', color: 'purple' },
                  { label: 'INT 활성화 함수', desc: 'ReLU/클리핑 → INT 그대로 (ReLU는 threshold만)', color: 'purple' },
                  { label: '다이아딕 잔차 덧셈', desc: 'DN(S_m/S_a)×q_m + DN(S_r/S_a)×q_r → INT', color: 'purple' },
                ].map(({ label, desc, color }, i) => (
                  <div key={i} className={`flex gap-3 rounded-lg border border-${color}-200 bg-${color}-50/60 p-3 dark:border-${color}-800 dark:bg-${color}-900/10`}>
                    <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-${color}-600 text-xs font-bold text-white`}>{i + 1}</span>
                    <div>
                      <p className={`text-xs font-bold text-${color}-800 dark:text-${color}-200`}>{label}</p>
                      <p className={`mt-0.5 text-xs text-${color}-700 dark:text-${color}-300`}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300">결과: FP 연산 완전 제거</p>
              <p className="mt-1 text-xs leading-relaxed text-green-600 dark:text-green-400">
                전체 추론 파이프라인에서 FP32/FP16 연산이 단 한 번도 발생하지 않습니다.
                TVM 컴파일러를 통해 NVIDIA T4 GPU의 INT4 Tensor Core를 직접 활용하며,
                INT8 대비 이론적 4배의 처리량 이점을 실제로 달성합니다.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Key Equations ─────────────────────────────────────── */}
      <section id="hawq-equations" className="scroll-mt-20">
        <SectionHeading icon={<Hash className="h-5 w-5" />} title="핵심 수식 모음" collapsed={!!col['hawq-equations']} onToggle={() => toggle('hawq-equations')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hawq-equations'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <div className="space-y-3">
              <EqCard idx={1} name="균일 양자화 (Uniform Quantization)" color="purple"
                latex={String.raw`Q(r) = \mathrm{Int}\!\left(\frac{r}{S}\right) - Z`}
                description="S: 스케일 인수(실수 범위/정수 격자 크기), Z: 영점(zero-point, 비대칭 양자화 지원). Int(·)는 반올림. r은 FP32 입력, Q(r)은 정수 출력. S와 Z는 오프라인에서 min/max 통계로 결정합니다." />

              <EqCard idx={2} name="다이아딕 행렬 곱 재정규화" color="purple"
                latex={String.raw`q_a = \mathrm{Int}\!\left(\frac{S_w S_h}{S_a}(q_w \cdot q_h)\right) = (q_w \cdot q_h \cdot b) \gg c`}
                description="S_w, S_h: 가중치·입력 스케일. S_a: 출력 스케일. S_w*S_h/S_a ≈ b/2^c (다이아딕 근사). 우변의 곱셈은 INT 곱, ≫c는 비트 시프트로 FP 연산이 전혀 없습니다. b와 c는 양자화 시 오프라인 계산 후 모델에 저장됩니다." />

              <EqCard idx={3} name="ILP 혼합 정밀도 최적화" color="indigo"
                latex={String.raw`\min_{\mathbf{b}}\;\sum_i \Omega_i^{(b_i)} \quad \text{s.t.}\;\mathrm{Size}(\mathbf{b})\leq C_s,\;\mathrm{BOPS}(\mathbf{b})\leq C_b`}
                description="Ω_i^(b_i): 비트폭 b_i에서 레이어 i의 Hessian 트레이스 기반 민감도 스코어. b_i가 낮을수록 Ω_i^(b_i)가 커짐 (양자화 오차 증가). ILP 솔버가 수초 내에 전역 최적 비트폭 배열을 찾습니다. RL이나 NAS 대비 수천 배 빠릅니다." />

              <EqCard idx={4} name="BN 가중치 흡수 (BN Fusion)" color="amber"
                latex={String.raw`\bar{W} = \frac{\beta}{\sigma} W, \quad \bar{b} = \gamma - \frac{\beta \mu}{\sigma}`}
                description="γ(BN 스케일), β(BN 시프트), μ(배치 평균), σ(배치 표준편차)를 Conv 가중치와 바이어스에 통합. 변환 후 BatchNorm 레이어가 사라지므로 추론 시 FP 통계 처리 불필요. eval 모드 전환 후 적용해야 합니다." />

              <EqCard idx={5} name="다이아딕 잔차 연결" color="green"
                latex={String.raw`q_a = \mathrm{DN}\!\left(\frac{S_m}{S_a}\right) q_m + \mathrm{DN}\!\left(\frac{S_r}{S_a}\right) q_r`}
                description="ResNet의 잔차 덧셈에서 두 브랜치의 스케일(S_m, S_r)이 다를 때, 공통 스케일 S_a로 재정규화. DN(·)은 다이아딕 근사 연산자 (분수 → b/2^c). 재정규화 두 건 모두 비트 시프트로 처리되어 FP 연산 없이 잔차 연결 완성." />
            </div>
          </Card>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section id="hawq-results" className="scroll-mt-20">
        <SectionHeading icon={<BarChart2 className="h-5 w-5" />} title="실험 결과" collapsed={!!col['hawq-results']} onToggle={() => toggle('hawq-results')} />
        <div className={`overflow-hidden transition-all duration-300 ${col['hawq-results'] ? 'max-h-0' : 'max-h-[9999px]'}`}>
          <Card>
            <SubSectionHeading number="6.1" title="ImageNet Top-1 정확도 비교" />
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              ResNet50 및 InceptionV3 · ImageNet Top-1 Accuracy ↑ (높을수록 좋음)
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">방법</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">비트폭 (W/A)</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">ResNet50</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-gray-400">InceptionV3</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { m: 'FP32 기준',                   b: '32/32',    r50: '76.13%', inc: '78.39%', note: '상한선',                       hi: false, bad: false },
                    { m: 'Integer-only (IBERT)',         b: '8/8',      r50: '74.90%', inc: '74.20%', note: '이전 정수 전용 SOTA',           hi: false, bad: false },
                    { m: 'DSQ',                          b: '8/8',      r50: '75.12%', inc: '75.27%', note: 'Fake quantization',            hi: false, bad: false },
                    { m: 'HAWQ-V3 ★',                   b: '8/8',      r50: '77.58%', inc: '78.76%', note: '정수 전용 SOTA (+2.68%)',       hi: true,  bad: false },
                    { m: 'HAWQ-V3 혼합 (INT4/8) ★',     b: '혼합',     r50: '76.73%', inc: '—',      note: '23% 지연 감소 vs INT8',        hi: true,  bad: false },
                  ].map((r, i) => (
                    <tr key={i} className={r.hi ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                      <td className={`px-3 py-2 font-medium ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>{r.m}</td>
                      <td className="px-3 py-2 text-center font-mono text-gray-500 dark:text-gray-400">{r.b}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-purple-700 dark:text-purple-300' : r.bad ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>{r.r50}</td>
                      <td className={`px-3 py-2 text-center font-mono font-semibold ${r.hi ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>{r.inc}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <SubSectionHeading number="6.2" title="TVM + T4 GPU INT4 실제 속도 측정" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { title: 'INT8 기준', val: '1.00×', color: 'gray', desc: 'TVM 컴파일, T4 GPU INT8 Tensor Core' },
                  { title: 'INT4 (HAWQ-V3)', val: '1.45×', color: 'purple', desc: 'INT4 혼합 정밀도, 실제 하드웨어 속도' },
                  { title: '이론 최대', val: '2.00×', color: 'green', desc: 'INT4는 INT8 대비 이론적 2배 처리량' },
                ].map(({ title, val, color, desc }) => (
                  <div key={title} className={`rounded-lg border border-${color === 'gray' ? 'gray' : color}-200 bg-${color === 'gray' ? 'gray' : color}-50 p-4 dark:border-${color === 'gray' ? 'gray' : color}-800 dark:bg-${color === 'gray' ? 'gray-800' : `${color}-900/20`}`}>
                    <p className={`text-xs font-semibold text-${color === 'gray' ? 'gray-600 dark:text-gray-400' : `${color}-700 dark:text-${color}-300`}`}>{title}</p>
                    <p className={`mt-1 text-3xl font-black text-${color === 'gray' ? 'gray-700 dark:text-gray-300' : `${color}-600 dark:text-${color}-400`}`}>{val}</p>
                    <p className={`mt-1 text-xs text-${color === 'gray' ? 'gray-500 dark:text-gray-400' : `${color}-600 dark:text-${color}-400`}`}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/20">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">핵심 관찰 ①: 정확도 역전</p>
                <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                  HAWQ-V3 INT8(77.58%)이 FP32 기준(76.13%)보다 높습니다.
                  ILP로 최적화된 혼합 정밀도와 다이아딕 재정규화의 낮은 오차가 결합된 결과입니다.
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">핵심 관찰 ②: 실용적 속도</p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  INT4에서 1.45× 실측 가속. 이론 최대(2×)의 72.5% 효율.
                  나머지 손실은 메모리 대역폭 및 비INT4 레이어(입출력 레이어) 비중에 기인합니다.
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
