'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { TableOfContents, type TocItem } from '@/components/tse/navigation';

const tocItems: TocItem[] = [
  { id: 'intro', label: '1. PIML 개요', level: 1 },
  { id: 'intro-motivation', label: '왜 physics를 넣나', level: 2 },
  { id: 'taxonomy', label: '2. PINN / PIDON / PINO', level: 1 },
  { id: 'pinn', label: '3. Physics-informed Neural Networks', level: 1 },
  { id: 'pinn-forward', label: 'Forward problem', level: 2 },
  { id: 'pinn-inverse', label: 'Inverse problem', level: 2 },
  { id: 'pidon', label: '4. Physics-informed DeepONet', level: 1 },
  { id: 'pino', label: '5. Physics-informed Neural Operator', level: 1 },
  { id: 'operator-compare', label: 'Operator learning 비교', level: 2 },
  { id: 'wireless', label: '6. Wireless 관점 적용', level: 1 },
  { id: 'references', label: 'References', level: 1 },
];

const methodCards = [
  {
    id: 'PINN',
    title: 'PINN',
    subtitle: '한 PDE instance를 직접 푼다',
    color: 'from-cyan-500 to-blue-600',
    core: '신경망 u_theta(t, x)를 solution 자체로 두고, PDE residual과 IBC residual을 loss에 넣는다.',
    bestFor: '데이터가 적고 governing equation이 명확한 forward/inverse PDE 문제',
    limitation: '새 PDE instance마다 재최적화가 필요하고, stiff/multi-scale PDE에서는 학습이 불안정할 수 있다.',
    formula: String.raw`\mathcal L_{\mathrm{PINN}}=\mathcal L_u+\mathcal L_f`,
  },
  {
    id: 'PIDON',
    title: 'PIDON',
    subtitle: '입력 함수에서 해 함수로 가는 operator를 학습한다',
    color: 'from-emerald-500 to-teal-600',
    core: 'DeepONet의 branch/trunk 구조에 PDE residual을 더해 parametric PDE solution operator를 physics-aware하게 학습한다.',
    bestFor: '여러 boundary/initial/input function에 대해 빠르게 solution을 query해야 하는 문제',
    limitation: 'branch input sensor grid와 architecture 가정에 묶이고, 충분한 operator coverage가 필요하다.',
    formula: String.raw`G_\theta(u)(y)=\sum_{k=1}^{q} b_k(u(x_1),\ldots,u(x_m))\,t_k(y)`,
  },
  {
    id: 'PINO',
    title: 'PINO',
    subtitle: 'Neural operator에 PDE loss와 fine-tuning을 결합한다',
    color: 'from-violet-500 to-fuchsia-600',
    core: 'FNO 같은 neural operator를 data loss와 PDE loss로 pretrain하고, 특정 instance에서는 PDE residual로 fine-tuning한다.',
    bestFor: '반복 simulation, resolution-independent surrogate, inverse operator learning',
    limitation: '저해상도 학습 데이터만 있으면 ground-truth operator를 완전히 복원하기 어렵고 derivative 계산 설계가 중요하다.',
    formula: String.raw`\mathcal J(\mathcal G_\theta)=\mathcal J_{\mathrm{data}}(\mathcal G_\theta)+\lambda\mathcal J_{\mathrm{pde}}(\mathcal G_\theta)`,
  },
];

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">{eyebrow}</p>
      <h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
      {children && <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{children}</p>}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200">
      {children}
    </span>
  );
}

export default function PIMLSeminarPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMethod, setActiveMethod] = useState('PINN');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-4');
      setTimeout(() => el.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-4'), 1800);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const active = useMemo(
    () => methodCards.find((item) => item.id === activeMethod) ?? methodCards[0],
    [activeMethod],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="fixed left-0 right-0 top-0 z-[60] h-1 bg-slate-200/50 dark:bg-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-violet-500 transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {!sidebarOpen && (
        <div className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-r-lg border border-l-0 border-slate-200 bg-white px-1 py-4 text-slate-400 shadow-md transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700"
            aria-label="사이드바 보기"
            title="사이드바 보기"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {sidebarOpen && (
        <aside className="fixed left-0 top-[4rem] z-30 hidden h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900 lg:block">
          <div className="px-4 pb-8 pt-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Contents
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded p-1 text-slate-400 transition hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700"
                aria-label="사이드바 숨기기"
                title="사이드바 숨기기"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            <TableOfContents items={tocItems} onNavigate={handleNavigate} />
            <a
              href="/seminar/piml/20260430-piml.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs font-black text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-900 dark:bg-slate-800 dark:text-cyan-200 dark:hover:bg-cyan-950/40"
            >
              원본 PDF 열기
            </a>
            <div className="mt-4">
              <div className="mb-1 text-xs text-slate-400 dark:text-slate-500">{Math.round(scrollProgress)}% complete</div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-cyan-500 transition-[width] duration-150" style={{ width: `${scrollProgress}%` }} />
              </div>
            </div>
          </div>
        </aside>
      )}

      <main className={`tse-content min-h-screen px-4 py-8 lg:px-8 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="mx-auto max-w-6xl">
          <section
            id="intro"
            className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-900 p-8 text-white shadow-xl"
          >
            <div className="mb-3 text-sm font-bold text-cyan-200">Paper Seminar · 2026.04.30</div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-5xl">
              Physics-informed Machine Learning
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-cyan-50/90">
              PDE가 지배하는 물리 시스템에 deep learning을 적용할 때, 데이터를 단순히 fitting하지 않고
              governing equation, boundary/initial condition, operator structure를 loss와 architecture에 직접 넣는 방법을 정리합니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">PINN</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">Physics-informed DeepONet</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">PINO</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">Wireless PDE surrogate</span>
            </div>
          </section>

          <section id="intro-motivation" className="mb-8">
            <SectionTitle eyebrow="Motivation" title="PIML은 data fitting이 아니라 physical consistency를 학습 목표에 넣는다">
              Classical solver는 정확하지만 반복 simulation 비용이 크고, 순수 DNN은 데이터가 부족하거나 distribution shift가 생기면 물리 법칙을 깨기 쉽습니다.
              PIML은 PDE residual과 관측 data loss를 같이 최적화해 data efficiency, physical consistency, fast inference를 동시에 노립니다.
            </SectionTitle>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <div className="text-sm font-black text-slate-950 dark:text-white">데이터가 적은 경우</div>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  PDE residual이 implicit regularizer 역할을 해서 적은 IBC/measurement data로도 plausible solution을 찾게 합니다.
                </p>
              </Card>
              <Card>
                <div className="text-sm font-black text-slate-950 dark:text-white">해석 가능한 제약</div>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  loss 항이 물리 방정식과 직접 연결되므로 모델 오류를 data mismatch와 physics violation으로 분해해 볼 수 있습니다.
                </p>
              </Card>
              <Card>
                <div className="text-sm font-black text-slate-950 dark:text-white">반복 추론 비용 절감</div>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  operator surrogate를 학습하면 새로운 parameter/function input에 대해 solver를 매번 돌리지 않고 빠르게 solution을 query할 수 있습니다.
                </p>
              </Card>
            </div>
          </section>

          <section id="taxonomy" className="mb-8">
            <SectionTitle eyebrow="Taxonomy" title="PINN, PIDON, PINO를 구분하는 가장 빠른 기준">
              어떤 대상을 neural network가 표현하는지 먼저 봐야 합니다. PINN은 solution, DeepONet/PINO는 solution operator를 학습합니다.
            </SectionTitle>
            <Card>
              <div className="mb-4 flex flex-wrap gap-2">
                {methodCards.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMethod(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-black transition ${
                      item.id === activeMethod
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              <div className={`rounded-2xl bg-gradient-to-br ${active.color} p-5 text-white`}>
                <div className="text-sm font-bold opacity-80">{active.subtitle}</div>
                <h3 className="mt-1 text-2xl font-black">{active.title}</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                  <div className="rounded-xl bg-white/15 p-4">
                    <div className="text-xs font-black uppercase tracking-wider opacity-80">핵심 구조</div>
                    <p className="mt-2 text-sm leading-7">{active.core}</p>
                  </div>
                  <div className="rounded-xl bg-white/15 p-4">
                    <div className="text-xs font-black uppercase tracking-wider opacity-80">대표 수식</div>
                    <div className="mt-2 rounded-lg bg-slate-950/50 px-2 py-3">
                      <BlockMath math={active.formula} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-white/15 p-4">
                    <div className="text-xs font-black uppercase tracking-wider opacity-80">잘 맞는 문제</div>
                    <p className="mt-2 text-sm leading-7">{active.bestFor}</p>
                  </div>
                  <div className="rounded-xl bg-white/15 p-4">
                    <div className="text-xs font-black uppercase tracking-wider opacity-80">주의할 한계</div>
                    <p className="mt-2 text-sm leading-7">{active.limitation}</p>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section id="pinn" className="mb-8">
            <SectionTitle eyebrow="PINN" title="PDE residual을 neural network loss로 만든다">
              PINN의 핵심은 solution <InlineMath math="u(t,x)" />를 neural network <InlineMath math="u_\theta(t,x)" />로 근사하고,
              automatic differentiation으로 PDE residual을 계산해 loss에 넣는 것입니다.
            </SectionTitle>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <h3 id="pinn-forward" className="text-lg font-black text-slate-950 dark:text-white">Forward problem</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  PDE parameter <InlineMath math="\lambda" />가 주어져 있을 때 hidden solution state를 찾습니다.
                  data loss는 initial/boundary condition을 맞추고, residual loss는 collocation point에서 PDE를 만족하게 합니다.
                </p>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                  <BlockMath math={String.raw`u_t+\mathcal N(u)=0,\qquad f_\theta:=\partial_t u_\theta+\mathcal N(u_\theta)`} />
                  <BlockMath math={String.raw`\mathrm{MSE}=\mathrm{MSE}_u+\mathrm{MSE}_f`} />
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  슬라이드의 nonlinear Schrodinger 예시는 <InlineMath math="f:=ih_t+0.5h_{xx}+|h|^2h" />를
                  residual network로 두고, initial condition과 periodic boundary condition을 함께 학습합니다.
                </p>
              </Card>
              <Card>
                <h3 id="pinn-inverse" className="text-lg font-black text-slate-950 dark:text-white">Inverse problem</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  관측 data에서 PDE parameter <InlineMath math="\lambda" />를 추정합니다. Navier-Stokes 예시에서는
                  stream function으로 incompressibility를 만족시키고, velocity와 residual을 동시에 맞춰 unknown coefficient를 찾습니다.
                </p>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                  <BlockMath math={String.raw`\begin{aligned}
u_t+\lambda_1(uu_x+vu_y)&=-p_x+\lambda_2(u_{xx}+u_{yy}),\\
v_t+\lambda_1(uv_x+vv_y)&=-p_y+\lambda_2(v_{xx}+v_{yy})
\end{aligned}`} />
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  pressure training data가 없어도 physics residual이 pressure field를 간접적으로 제약할 수 있다는 점이 PINN inverse problem의 강점입니다.
                </p>
              </Card>
            </div>
          </section>

          <section id="pidon" className="mb-8">
            <SectionTitle eyebrow="PIDON" title="DeepONet은 function-to-function mapping을 학습한다">
              DeepONet은 input function을 branch net이 읽고, output coordinate를 trunk net이 읽은 뒤 두 latent를 dot product로 결합합니다.
              PIDON은 여기에 PDE residual을 더해 paired input-output data 없이도 operator surrogate를 학습합니다.
            </SectionTitle>
            <Card>
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">Branch / Trunk decomposition</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Branch network는 sensor locations에서 평가된 input function 값을 받고, trunk network는 query coordinate
                    <InlineMath math="y" />를 받습니다. 따라서 같은 input function에 대해 임의 좌표의 output value를 query할 수 있습니다.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill>function input</Pill>
                    <Pill>coordinate query</Pill>
                    <Pill>basis expansion</Pill>
                    <Pill>physics residual</Pill>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                  <BlockMath math={String.raw`\mathcal L(\theta)=\mathcal L_{\mathrm{operator}}(\theta)+\mathcal L_{\mathrm{physics}}(\theta)`} />
                  <BlockMath math={String.raw`\mathcal N(u_i(x_k),G_\theta(u_i)(y_j))\approx 0`} />
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="text-sm font-black text-emerald-950 dark:text-emerald-100">Eikonal example 해석</div>
                <p className="mt-2 text-sm leading-7 text-emerald-900/80 dark:text-emerald-100/80">
                  2D Eikonal equation <InlineMath math="\|\nabla s(x)\|^2=1" />은 boundary에서의 signed distance function을 학습하는 예시입니다.
                  boundary curve <InlineMath math="\Gamma_i" />를 input function으로 보고, PIDON은 <InlineMath math="G:\partial\Omega\mapsto s(x,y)" />를 근사합니다.
                </p>
              </div>
            </Card>
          </section>

          <section id="pino" className="mb-8">
            <SectionTitle eyebrow="PINO" title="PINO는 neural operator와 PDE residual fine-tuning을 결합한다">
              FNO는 Fourier domain에서 global integral kernel을 효율적으로 계산합니다. PINO는 이 operator architecture에 physics loss를 더하고,
              필요하면 특정 instance에 대해 PDE residual로 fine-tuning합니다.
            </SectionTitle>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">FNO layer</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  convolution-like operator가 Fourier transform 아래에서는 multiplication으로 바뀐다는 점을 사용합니다.
                  이를 통해 전역 integral operation을 frequency domain에서 효율적으로 구현합니다.
                </p>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                  <BlockMath math={String.raw`v_{\ell+1}(x)=\sigma\!\left(Wv_\ell(x)+\mathcal F^{-1}(R\cdot\mathcal F(v_\ell))(x)\right)`} />
                </div>
              </Card>
              <Card>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">2-phase framework</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  첫 단계는 solution operator <InlineMath math="\mathcal G_\theta" />를 data/PDE loss로 학습하는 것입니다.
                  두 번째 단계는 특정 input <InlineMath math="a" />에 대해 <InlineMath math="\mathcal G_\theta(a)" />를 ansatz로 두고 PDE loss로 fine-tuning합니다.
                </p>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                  <BlockMath math={String.raw`\mathcal J_{\mathrm{data}}=\mathbb E_{a\sim\mu}\|\mathcal G^\dagger(a)-\mathcal G_\theta(a)\|_{\mathcal U}^2`} />
                  <BlockMath math={String.raw`\mathcal J_{\mathrm{pde}}=\mathbb E_{a\sim\mu}\mathcal L_{\mathrm{pde}}(a,\mathcal G_\theta(a))`} />
                </div>
              </Card>
            </div>
          </section>

          <section id="operator-compare" className="mb-8">
            <SectionTitle eyebrow="Comparison" title="세 방법을 한 줄로 구분하면">
              학습자가 헷갈리기 쉬운 지점은 solution approximation과 operator approximation의 차이입니다.
            </SectionTitle>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="grid grid-cols-4 bg-slate-100 text-xs font-black uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <div className="p-3">Method</div>
                <div className="p-3">Learns</div>
                <div className="p-3">Physics enters as</div>
                <div className="p-3">Main cost</div>
              </div>
              {[
                ['PINN', 'single solution u_theta', 'PDE residual + IBC loss', 're-optimization per instance'],
                ['PIDON', 'solution operator G_theta', 'operator residual across function samples', 'sensor grid / operator coverage'],
                ['PINO', 'neural operator + instance ansatz', 'data loss + PDE loss + fine-tuning', 'operator derivative and spectral design'],
              ].map((row) => (
                <div key={row[0]} className="grid grid-cols-4 border-t border-slate-200 text-sm dark:border-slate-700">
                  {row.map((cell, idx) => (
                    <div key={cell} className={`p-3 ${idx === 0 ? 'font-black text-slate-950 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section id="wireless" className="mb-8">
            <SectionTitle eyebrow="Wireless" title="Wireless 연구로 가져올 때의 핵심 질문">
              슬라이드 결론은 HMIMO, Helmholtz/Maxwell equation, quantum communication으로의 확장을 제안합니다.
              통신 연구에서는 channel surrogate와 physical-layer inverse problem을 PIML 관점에서 다시 설계할 수 있습니다.
            </SectionTitle>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <h3 className="text-base font-black text-slate-950 dark:text-white">Channel PDE surrogate</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Helmholtz/Maxwell residual을 loss에 넣으면 적은 channel samples로도 geometry-aware field prediction을 학습할 수 있습니다.
                </p>
              </Card>
              <Card>
                <h3 className="text-base font-black text-slate-950 dark:text-white">Inverse scattering</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  관측된 field 또는 pilot response에서 material parameter, obstacle, boundary condition을 추정하는 inverse problem으로 연결됩니다.
                </p>
              </Card>
              <Card>
                <h3 className="text-base font-black text-slate-950 dark:text-white">Neural operator for deployment</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  여러 topology와 carrier frequency를 아우르는 operator를 학습하면 반복 ray tracing/FDTD simulation을 줄이는 surrogate가 됩니다.
                </p>
              </Card>
            </div>
          </section>

          <section id="references" className="mb-20">
            <SectionTitle eyebrow="References" title="세미나 원문 기준 문헌" />
            <Card>
              <ol className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                <li>
                  <strong>[1]</strong> Karniadakis et al., &ldquo;Physics-informed machine learning,&rdquo;
                  <span className="italic"> Nature Reviews Physics</span>, 2021.
                </li>
                <li>
                  <strong>[2]</strong> Raissi, Perdikaris, and Karniadakis, &ldquo;Physics-informed neural networks,&rdquo;
                  <span className="italic"> Journal of Computational Physics</span>, 2019.
                </li>
                <li>
                  <strong>[3]</strong> Wang, Wang, and Perdikaris, &ldquo;Learning the solution operator of parametric partial differential equations with physics-informed DeepONets,&rdquo;
                  <span className="italic"> Science Advances</span>, 2021.
                </li>
                <li>
                  <strong>[4]</strong> Li et al., &ldquo;Physics-informed neural operator for learning partial differential equations,&rdquo;
                  <span className="italic"> ACM/IMS Journal of Data Science</span>, 2024.
                </li>
              </ol>
            </Card>
          </section>
        </div>
      </main>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 rounded-full bg-cyan-600 p-3 text-white shadow-lg transition hover:bg-cyan-700"
          aria-label="맨 위로"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}
