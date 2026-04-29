'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDown,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  Layers3,
  Lightbulb,
  Network,
  Radio,
  Route,
  Sigma,
  Sparkles,
  Target,
  Waves,
} from 'lucide-react';
import katex from 'katex';
import Header from '@/components/layout/Header';
import CommandPalette from '@/components/common/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useGlossary } from '@/hooks/useGlossary';
import { GlossaryTermsContext } from '@/components/glossary/GlossaryContext';

const TOC_SECTIONS = [
  { id: 'section-overview', label: '초록·기여', icon: BookOpen },
  { id: 'section-problem', label: '문제 설정', icon: Radio },
  { id: 'section-architecture', label: '전체 구조', icon: Layers3 },
  { id: 'section-ss2dw', label: 'SS2D-W 인코더', icon: Waves },
  { id: 'section-memory', label: '구조 메모리 디코더', icon: Network },
  { id: 'section-algorithm', label: '알고리즘 흐름', icon: Route },
  { id: 'section-experiments', label: '실험·비교', icon: BarChart3 },
  { id: 'section-equations', label: '핵심 수식', icon: Sigma },
  { id: 'section-checklist', label: '남은 검증', icon: CheckCircle2 },
] as const;

type ResearchTask = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
};

const DEFAULT_TASKS: ResearchTask[] = [
  {
    id: 'converged-checkpoint',
    label: 'SS2D-W+SSMC 수렴 checkpoint 확보',
    detail: '현재 약 -15.84 dB는 epoch 30 스냅샷이므로, 최종 수렴 NMSE를 별도 표기해야 한다.',
    done: false,
  },
  {
    id: 'matched-flops',
    label: '동일 profiler 기준 FLOPs 재측정',
    detail: 'ME-AE, TransNet, 제안 모델을 같은 입력 크기와 같은 FLOPs 카운터로 다시 측정한다.',
    done: false,
  },
  {
    id: 'no-dwconv',
    label: 'no-DWConv ablation',
    detail: 'SS2D-W가 local convolution 없이도 장거리 delay-angular 구조를 유지하는지 분리 검증한다.',
    done: false,
  },
  {
    id: 'no-adapter',
    label: 'gate adapter ablation',
    detail: 'encoder coefficient와 decoder channel을 잇는 adapter가 실제로 필요한지 제거 실험으로 확인한다.',
    done: false,
  },
  {
    id: 'decoder-baselines',
    label: 'TransNet-style memory와 SSMC 비교',
    detail: 'D(Y,Y), A-aware pre-refinement, SS2D-guided memory를 같은 encoder 아래에서 비교한다.',
    done: false,
  },
];

const CONTRIBUTIONS = [
  {
    title: '비대칭 배치 가정',
    tag: 'UE-light / BS-heavy',
    body:
      'CSI feedback은 UE에서 압축하고 BS에서 복원한다. 따라서 encoder FLOPs가 deployment 병목이고, decoder는 더 강해도 된다.',
  },
  {
    title: 'SS2D-W wavefront recurrence',
    tag: 'propagation-aware SSM',
    body:
      '일반 visual SS2D scan 대신 좌/우/상/하 방향 전파 계수를 갖는 정적 2D wavefront recurrence를 사용한다.',
  },
  {
    title: 'encoder coefficient 재사용',
    tag: 'structural memory',
    body:
      '인코더가 학습한 전파 계수를 버리지 않고, BS decoder의 cross-attention memory를 만드는 구조 prior로 재사용한다.',
  },
  {
    title: 'TransNet-style decoder 재해석',
    tag: 'Y,Y memory 문제',
    body:
      'latent-expanded token grid를 target과 memory로 동시에 쓰는 방식에서 벗어나, memory token 자체를 전파 법칙으로 구성한다.',
  },
];

const SYSTEM_PARAMS = [
  ['채널 모델', 'COST 2100 outdoor'],
  ['Carrier frequency', '300 MHz'],
  ['BS / UE antennas', String.raw`N_t=32,\ N_r=1`],
  ['OFDM subcarriers', String.raw`N_f=1024`],
  ['Retained delay taps', String.raw`N_a=32`],
  ['Input size', String.raw`32\times 32\times 2`],
  ['Compression ratio', String.raw`\mathrm{CR}=1/4`],
  ['Train / Val / Test', '100k / 30k / 20k'],
  ['Optimizer', 'AdamW'],
  ['Learning rate', String.raw`10^{-3}`],
  ['Batch / Epochs', '1000 / 200'],
  ['Metric', 'NMSE (dB)'],
];

const BASELINE_ROWS = [
  { model: 'CsiNet', nmse: '-8.75', enc: '1.09', total: '5.41', note: 'CNN autoencoder baseline' },
  { model: 'CsiNet+', nmse: '-12.40', enc: '1.45', total: '24.57', note: 'multi-rate CNN feedback' },
  { model: 'CRNet', nmse: '-12.71', enc: '1.20', total: '5.12', note: 'multi-resolution CNN' },
  { model: 'CLNet', nmse: '-12.87', enc: '1.35', total: '4.05', note: 'complex-input lightweight CNN' },
  { model: 'TransNet', nmse: '-14.86', enc: '17.83', total: '35.72', note: 'full attention encoder-decoder' },
  { model: 'ME-AE baseline', nmse: '-15.37', enc: '4.70', total: '22.53', note: 'Mamba encoder reference' },
  {
    model: 'ME-AE SS2D-W+SSMC',
    nmse: '≈ -15.84',
    enc: 'pending',
    total: 'pending',
    note: 'epoch 30 structural-memory snapshot',
  },
];

const ALGORITHM_STEPS = [
  {
    step: 'STEP 1',
    title: 'delay-angular CSI 구성',
    type: 'system model',
    body:
      '주파수 영역 downlink CSI를 delay-angular domain으로 변환하고, 에너지가 집중된 첫 delay tap만 남겨 실수/허수 2채널 입력을 만든다.',
  },
  {
    step: 'STEP 2',
    title: 'UE patch embedding',
    type: 'encoder',
    body:
      '입력 텐서를 낮은 해상도 feature grid로 임베딩한다. 이후 압축 전까지의 핵심 목표는 작은 UE 비용으로 전파 구조를 보존하는 것이다.',
  },
  {
    step: 'STEP 3',
    title: 'SS2D-W wavefront recurrence',
    type: 'encoder',
    body:
      'TL, TR, BL, BR 네 quadrant scan에서 horizontal/vertical 계수를 따로 학습한다. 각 위치는 자기 token과 방향별 이웃 상태의 누적합으로 갱신된다.',
  },
  {
    step: 'STEP 4',
    title: 'latent vector feedback',
    type: 'feedback',
    body:
      '마지막 encoder feature grid를 flatten하고 FC downsampling으로 latent vector z를 만든다. CR=1/4에서 feedback dimension은 원 CSI 실수 차원의 1/4이다.',
  },
  {
    step: 'STEP 5',
    title: 'BS latent expansion',
    type: 'decoder',
    body:
      'BS는 z를 다시 decoder token grid Y로 확장한다. 이 grid는 content stream의 시작점이고, 구조 memory의 재료이기도 하다.',
  },
  {
    step: 'STEP 6',
    title: 'encoder coefficient reverse pairing',
    type: 'bridge',
    body:
      'decoder layer m은 encoder block r(m)=max(1,L_e-m+1)의 coefficient와 연결된다. 깊은 encoder 전파 정보가 초기 decoder 복원에 먼저 들어간다.',
  },
  {
    step: 'STEP 7',
    title: 'SS2D-guided structural memory',
    type: 'decoder',
    body:
      'left/right/top/bottom coefficient descriptor를 decoder-channel gate로 투영하고, Y의 방향 이웃들을 gate power로 누적해 memory token M_A를 만든다.',
  },
  {
    step: 'STEP 8',
    title: 'self-attention + cross-attention 복원',
    type: 'decoder',
    body:
      'content token은 self-attention으로 섞이고, cross-attention은 K,V로 구조 memory를 사용한다. 따라서 decoder memory는 단순한 Y 복사본이 아니다.',
  },
];

const EQUATIONS = [
  {
    name: '입력 CSI 표현',
    latex: String.raw`\mathbf{X}_a\in\mathbb{R}^{H\times W\times 2}`,
    meaning:
      'delay-angular domain에서 남긴 CSI를 실수부와 허수부 2채널 이미지처럼 다룬다. COST 2100 설정에서는 H=W=32이다.',
    read:
      '마지막 차원 2는 complex channel을 real-valued network에 넣기 위한 실수/허수 채널이다.',
  },
  {
    name: 'encoder-decoder mapping',
    latex: String.raw`\mathbf{z}=f_{\theta}(\mathbf{X}_a)\in\mathbb{R}^{D},\qquad \hat{\mathbf{X}}_a=g_{\phi}(\mathbf{z})`,
    meaning:
      'UE encoder가 CSI를 D차원 latent vector로 압축하고, BS decoder가 원 CSI tensor를 복원한다.',
    read:
      '이 논문에서 novelty는 f와 g를 대칭으로 만들지 않는다는 점이다. f는 가볍고, g는 구조 memory를 가진다.',
  },
  {
    name: 'compression ratio',
    latex: String.raw`\mathrm{CR}=\frac{D}{2HW}`,
    meaning:
      'feedback latent dimension D가 원 입력 실수 차원 2HW에 비해 얼마나 작은지 나타낸다.',
    read:
      'CR=1/4이면 원 CSI tensor의 실수 차원 대비 25%만 UE가 feedback한다.',
  },
  {
    name: 'training loss',
    latex: String.raw`\mathcal{L}(\theta,\phi)=\mathbb{E}_{\mathbf{X}_a}\left[\frac{\left\lVert\mathbf{X}_a-\hat{\mathbf{X}}_a\right\rVert_2^2}{\left\lVert\mathbf{X}_a\right\rVert_2^2}\right]`,
    meaning:
      '정규화된 reconstruction error를 최소화한다. sample energy가 큰 CSI가 loss를 과도하게 지배하지 않도록 분모로 normalize한다.',
    read:
      '분자는 복원 오차 에너지, 분모는 원 CSI 에너지다. NMSE와 같은 방향의 학습 목적이다.',
  },
  {
    name: 'NMSE in dB',
    latex: String.raw`\operatorname{NMSE}_{\mathrm{dB}}=10\log_{10}\left(\frac{\mathbb{E}\left[\left\lVert\mathbf{X}_a-\hat{\mathbf{X}}_a\right\rVert_2^2\right]}{\mathbb{E}\left[\left\lVert\mathbf{X}_a\right\rVert_2^2\right]}\right)`,
    meaning:
      '복원 오차를 dB scale로 보고한다. 더 낮은 값이 더 좋은 reconstruction quality를 의미한다.',
    read:
      '-15 dB 부근에서는 작은 dB 개선도 실제 오차 비율 관점에서 의미가 크다.',
  },
  {
    name: 'patch embedding',
    latex: String.raw`\mathbf{X}^{(0)}=\mathrm{Patch}(\mathbf{X}_a)\in\mathbb{R}^{H_e\times W_e\times C_e}`,
    meaning:
      '32x32x2 입력을 encoder feature grid로 바꾼다. 이후 SS2D-W는 이 grid 위에서 방향성 전파를 수행한다.',
    read:
      'H_e, W_e는 downsampled spatial resolution이고 C_e는 encoder channel 수다.',
  },
  {
    name: 'SS2D-W recurrence',
    latex: String.raw`\begin{aligned}
\mathbf{s}^{\mathrm{TL}}_{i,j}&=\mathbf{u}_{i,j}+\mathbf{a}^{\mathrm{TL}}_{h}\odot\mathbf{s}^{\mathrm{TL}}_{i,j-1}+\mathbf{a}^{\mathrm{TL}}_{v}\odot\mathbf{s}^{\mathrm{TL}}_{i-1,j}\\
\mathbf{s}^{\mathrm{TR}}_{i,j}&=\mathbf{u}_{i,j}+\mathbf{a}^{\mathrm{TR}}_{h}\odot\mathbf{s}^{\mathrm{TR}}_{i,j+1}+\mathbf{a}^{\mathrm{TR}}_{v}\odot\mathbf{s}^{\mathrm{TR}}_{i-1,j}\\
\mathbf{s}^{\mathrm{BL}}_{i,j}&=\mathbf{u}_{i,j}+\mathbf{a}^{\mathrm{BL}}_{h}\odot\mathbf{s}^{\mathrm{BL}}_{i,j-1}+\mathbf{a}^{\mathrm{BL}}_{v}\odot\mathbf{s}^{\mathrm{BL}}_{i+1,j}\\
\mathbf{s}^{\mathrm{BR}}_{i,j}&=\mathbf{u}_{i,j}+\mathbf{a}^{\mathrm{BR}}_{h}\odot\mathbf{s}^{\mathrm{BR}}_{i,j+1}+\mathbf{a}^{\mathrm{BR}}_{v}\odot\mathbf{s}^{\mathrm{BR}}_{i+1,j}
\end{aligned}`,
    meaning:
      '각 위치의 state는 자기 feature와 방향별 이웃 state의 감쇠 누적으로 만들어진다. 네 quadrant가 서로 다른 방향 전파를 학습한다.',
    read:
      'a_h와 a_v는 0과 1 사이의 learned static coefficient로 보면 된다. 1에 가까울수록 해당 방향의 이전 state가 오래 유지된다.',
  },
  {
    name: 'directional state fusion',
    latex: String.raw`\bar{\mathbf{u}}_{i,j}=\frac{1}{4}\sum_{q\in\{\mathrm{TL},\mathrm{TR},\mathrm{BL},\mathrm{BR}\}}\mathbf{s}^{q}_{i,j}`,
    meaning:
      '네 방향 wavefront state를 평균해 encoder output feature를 만든다.',
    read:
      '현재 버전은 UE 부담을 줄이기 위해 learned fusion보다 단순 평균을 사용한다. decoder는 평균값뿐 아니라 원 coefficient도 활용한다.',
  },
  {
    name: 'latent expansion at BS',
    latex: String.raw`\mathbf{Y}=\mathrm{FC}_{\mathrm{dec}}(\mathbf{z})\in\mathbb{R}^{H_d\times W_d\times C_d}`,
    meaning:
      'BS decoder는 feedback latent vector를 token grid Y로 확장한다.',
    read:
      'Y는 decoder content stream의 시작점이자 structural memory를 만드는 base grid다.',
  },
  {
    name: 'TransNet-style memory baseline',
    latex: String.raw`\hat{\mathbf{X}}_a=D_{\mathrm{Trans}}(\mathbf{Y},\mathbf{Y})`,
    meaning:
      '기존 Transformer autoencoder decoder는 같은 Y를 target과 memory로 모두 사용한다.',
    read:
      '이 방식은 generic token mixer로는 유효하지만, encoder가 학습한 propagation law와 memory가 직접 연결되지 않는다.',
  },
  {
    name: 'reverse layer pairing',
    latex: String.raw`r(m)=\max(1,L_e-m+1),\qquad m=1,\ldots,L_d`,
    meaning:
      'decoder layer m을 encoder block r(m)의 coefficient와 연결한다. 뒤쪽 encoder block을 앞쪽 decoder layer에 먼저 사용한다.',
    read:
      '깊은 encoder representation은 더 압축된 구조 정보를 담으므로, decoder 초기 복원에 먼저 주입한다는 설계다.',
  },
  {
    name: 'direction descriptors',
    latex: String.raw`\begin{aligned}
\mathbf{a}_{L}^{(m)}&=[\mathbf{a}_{h}^{\mathrm{TL},r(m)};\mathbf{a}_{h}^{\mathrm{BL},r(m)}],&
\mathbf{a}_{R}^{(m)}&=[\mathbf{a}_{h}^{\mathrm{TR},r(m)};\mathbf{a}_{h}^{\mathrm{BR},r(m)}]\\
\mathbf{a}_{T}^{(m)}&=[\mathbf{a}_{v}^{\mathrm{TL},r(m)};\mathbf{a}_{v}^{\mathrm{TR},r(m)}],&
\mathbf{a}_{B}^{(m)}&=[\mathbf{a}_{v}^{\mathrm{BL},r(m)};\mathbf{a}_{v}^{\mathrm{BR},r(m)}]
\end{aligned}`,
    meaning:
      'quadrant coefficient를 물리적 방향 left, right, top, bottom 관점으로 다시 묶는다.',
    read:
      '예를 들어 left memory에는 TL과 BL의 horizontal coefficient가 모두 필요하다. 그래서 concat으로 비대칭성을 보존한다.',
  },
  {
    name: 'decoder-channel direction gates',
    latex: String.raw`\mathbf{g}_{d}^{(m)}=\sigma\!\left(\mathbf{W}_{d}^{(m)}\mathbf{a}_{d}^{(m)}+\mathbf{b}_{d}^{(m)}\right)\in(0,1)^{C_d},\qquad d\in\{L,R,T,B\}`,
    meaning:
      'encoder coefficient dimension과 decoder channel dimension이 다르기 때문에 작은 adapter로 방향 gate를 만든다.',
    read:
      'gate는 memory 누적에서 방향별 감쇠율 역할을 한다. channel마다 다른 propagation strength를 허용한다.',
  },
  {
    name: 'SS2D-guided structural memory',
    latex: String.raw`\begin{aligned}
\mathbf{m}_{i,j}^{(m)}
&=\mathbf{y}_{i,j}
+\sum_{k=1}^{j-1}(\mathbf{g}_{L}^{(m)})^k\odot\mathbf{y}_{i,j-k}
+\sum_{k=1}^{W_d-j}(\mathbf{g}_{R}^{(m)})^k\odot\mathbf{y}_{i,j+k}\\
&\quad+\sum_{k=1}^{i-1}(\mathbf{g}_{T}^{(m)})^k\odot\mathbf{y}_{i-k,j}
+\sum_{k=1}^{H_d-i}(\mathbf{g}_{B}^{(m)})^k\odot\mathbf{y}_{i+k,j}
\end{aligned}`,
    meaning:
      '현재 위치 token에 left/right/top/bottom 이웃 token들을 방향 gate의 거듭제곱 감쇠로 누적해 memory token을 만든다.',
    read:
      '이 수식이 decoder novelty의 핵심이다. attention logit에 bias를 더하는 것이 아니라, K,V로 들어갈 memory token 자체를 바꾼다.',
  },
  {
    name: 'layer-wise decoder operation',
    latex: String.raw`\begin{aligned}
\tilde{\mathbf{H}}^{(m)}&=\mathrm{SelfAttn}_{m}(\mathbf{H}^{(m-1)},\mathbf{H}^{(m-1)},\mathbf{H}^{(m-1)})\\
\mathbf{H}^{(m)}&=\mathrm{FFN}_{m}\!\left(\mathrm{CrossAttn}_{m}(Q=\tilde{\mathbf{H}}^{(m)},K=\mathbf{M}_{A}^{(m)},V=\mathbf{M}_{A}^{(m)})\right)
\end{aligned}`,
    meaning:
      'content stream은 self-attention으로 갱신하고, cross-attention은 SS2D-guided memory를 key/value로 사용한다.',
    read:
      'residual과 normalization은 표기에서 생략했다. 구현에서는 일반 Transformer decoder layer처럼 들어간다.',
  },
];

const REFERENCES = [
  ['CsiNet', 'Deep learning for massive MIMO CSI feedback, IEEE WCL 2018'],
  ['CsiNet+', 'CNN-based multiple-rate compressive sensing for massive MIMO CSI feedback, IEEE TWC 2020'],
  ['CRNet', 'Multi-resolution CSI feedback with deep learning in massive MIMO system, IEEE JSAC 2022'],
  ['CLNet', 'Complex input lightweight neural network designed for massive MIMO CSI feedback, IEEE WCL 2021'],
  ['ACCsiNet', 'Asymmetric convolution-based autoencoder framework for massive MIMO CSI feedback, IEEE CL 2021'],
  ['TransNet', 'Full attention network for CSI feedback in FDD massive MIMO system, IEEE WCL 2022'],
  ['Mamba', 'Linear-time sequence modeling with selective state spaces, arXiv 2023'],
  ['VMamba', 'Visual state space model, arXiv 2024'],
  ['COST2100', 'The COST 2100 MIMO channel model, IEEE Wireless Communications 2012'],
  ['Jindal', 'MIMO broadcast channels with finite-rate feedback, IEEE TIT 2006'],
];

function EquationRenderer({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
        strict: false,
      });
    } catch {
      return null;
    }
  }, [latex]);

  if (!html) {
    return <code className="block whitespace-pre-wrap text-center text-sm text-red-600 dark:text-red-300">{latex}</code>;
  }

  return <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
}

function InlineEquation({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
        strict: false,
      });
    } catch {
      return null;
    }
  }, [latex]);

  if (!html) return <code>{latex}</code>;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function SectionHeading({
  eyebrow,
  title,
  body,
  icon,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  icon: ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
        <span className="rounded-full bg-teal-100 p-1.5 text-teal-700 dark:bg-teal-950 dark:text-teal-200">{icon}</span>
        {eyebrow}
      </div>
      <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white md:text-3xl">{title}</h2>
      {body && <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>}
    </div>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-xs leading-5 text-cyan-50/80">{hint}</div>
    </div>
  );
}

function FlowNode({
  title,
  subtitle,
  tone,
}: {
  title: string;
  subtitle: string;
  tone: 'ue' | 'bridge' | 'bs';
}) {
  const toneClass =
    tone === 'ue'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-50'
      : tone === 'bridge'
        ? 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50'
        : 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-50';

  return (
    <div className={`min-h-[112px] rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-sm font-black">{title}</div>
      <p className="mt-2 text-xs leading-5 opacity-80">{subtitle}</p>
    </div>
  );
}

function ArchitectureFlow() {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
      <FlowNode title="CSI tensor" subtitle="delay-angular input, real/imag 2 channels" tone="ue" />
      <div className="hidden items-center text-slate-400 lg:flex">
        <ChevronRight className="h-5 w-5" />
      </div>
      <FlowNode title="UE SS2D-W encoder" subtitle="static wavefront recurrence with TL/TR/BL/BR coefficients" tone="ue" />
      <div className="hidden items-center text-slate-400 lg:flex">
        <ChevronRight className="h-5 w-5" />
      </div>
      <FlowNode title="feedback latent z" subtitle="FC compression, CR=1/4 in the current experiment" tone="bridge" />
      <div className="hidden items-center text-slate-400 lg:flex">
        <ChevronRight className="h-5 w-5" />
      </div>
      <FlowNode title="BS SSMC decoder" subtitle="Transformer decoder with SS2D-guided structural memory" tone="bs" />
    </div>
  );
}

function DirectionMemorySketch() {
  const cells = Array.from({ length: 25 }, (_, index) => index);
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">left gate</span>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700 dark:bg-sky-950 dark:text-sky-200">right gate</span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-950 dark:text-amber-200">top gate</span>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 dark:bg-rose-950 dark:text-rose-200">bottom gate</span>
      </div>
      <div className="mx-auto grid max-w-[300px] grid-cols-5 gap-2">
        {cells.map((cell) => {
          const row = Math.floor(cell / 5);
          const col = cell % 5;
          const isCenter = row === 2 && col === 2;
          const isAxis = row === 2 || col === 2;
          const className = isCenter
            ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
            : isAxis
              ? 'bg-white text-slate-800 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-700'
              : 'bg-slate-200/60 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500';
          return (
            <div key={cell} className={`flex aspect-square items-center justify-center rounded-xl text-xs font-black ${className}`}>
              {isCenter ? 'm' : isAxis ? 'y' : ''}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
        중앙 memory token은 자기 token과 네 축 방향 이웃 token의 감쇠 누적으로 만들어진다.
      </p>
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<ReactNode>>;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-black">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white odd:bg-slate-50/60 dark:bg-slate-950 dark:odd:bg-slate-900/40">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top text-slate-700 dark:text-slate-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MyResearchPage() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useKeyboardShortcuts();
  const { terms: glossaryTerms } = useGlossary();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>(TOC_SECTIONS[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [notes, setNotes] = useState('');
  const [tasks, setTasks] = useState<ResearchTask[]>(DEFAULT_TASKS);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: '-90px 0px -62% 0px', threshold: 0.1 },
    );

    for (const section of TOC_SECTIONS) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }

    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    try {
      const savedNotes = window.localStorage.getItem('my-research-propagation-notes');
      const savedTasks = window.localStorage.getItem('my-research-propagation-tasks');
      if (savedNotes !== null) setNotes(savedNotes);
      if (savedTasks) setTasks(JSON.parse(savedTasks) as ResearchTask[]);
    } catch {
      // Local notes are optional; ignore storage failures.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem('my-research-propagation-notes', notes);
  }, [notes, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem('my-research-propagation-tasks', JSON.stringify(tasks));
  }, [tasks, storageReady]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleTask = (id: string) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  return (
    <GlossaryTermsContext.Provider value={glossaryTerms}>
      <div className="min-h-screen bg-[#f4f7f5] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Header onSearchClick={openCommandPalette} />
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />

        <div className="fixed left-0 top-0 z-50 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500" style={{ width: `${scrollProgress}%` }} />

        <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-6">
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-2xl bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-black">My Research</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">CSI feedback architecture</div>
                </div>
              </div>

              <nav className="space-y-1">
                {TOC_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const active = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition ${
                        active
                          ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-bold">{section.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-5 rounded-2xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                핵심 기준: 제안점은 &quot;더 큰 decoder&quot;가 아니라 encoder propagation coefficient를 decoder memory로 재사용한다는 연결 구조다.
              </div>
            </div>
          </aside>

          <main className="space-y-8">
            <section id="section-overview" className="scroll-mt-24">
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-xl dark:border-slate-800">
                <div className="relative p-6 md:p-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(45,212,191,0.35),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.3),transparent_30%),linear-gradient(135deg,#06251f,#0f172a_55%,#082f49)]" />
                  <div className="relative">
                    <div className="mb-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-cyan-50 ring-1 ring-white/20">CSI feedback</span>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-cyan-50 ring-1 ring-white/20">SS2D-W</span>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-cyan-50 ring-1 ring-white/20">Mamba-Transformer AE</span>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-cyan-50 ring-1 ring-white/20">Structural Memory</span>
                    </div>

                    <h1 className="max-w-5xl text-3xl font-black tracking-tight text-white md:text-5xl">
                      Propagation-Consistent Asymmetric Mamba-Transformer Autoencoder for CSI Feedback
                    </h1>
                    <p className="mt-4 max-w-4xl text-base leading-8 text-cyan-50/85">
                      이 페이지는 현재 논문 초안의 연구 설명을 학습용으로 재구성한 버전이다. 핵심은 UE에는 가벼운 propagation-aware state-space
                      encoder를 두고, BS에는 encoder가 학습한 방향 전파 계수를 memory prior로 재사용하는 Transformer decoder를 둔다는 점이다.
                    </p>

                    <div className="mt-6 grid gap-3 md:grid-cols-4">
                      <StatCard label="Dataset" value="COST 2100" hint="outdoor, 32x32x2 CSI" />
                      <StatCard label="Compression" value="CR 1/4" hint="feedback latent dimension ratio" />
                      <StatCard label="Snapshot" value="≈ -15.84 dB" hint="SS2D-W+SSMC epoch 30" />
                      <StatCard label="Main cost" value="Encoder FLOPs" hint="UE-side feasibility first" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {CONTRIBUTIONS.map((item) => (
                  <Card key={item.title} className="bg-white/90">
                    <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      {item.tag}
                    </div>
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section id="section-problem" className="scroll-mt-24">
              <SectionHeading
                eyebrow="Problem Setup"
                title="FDD massive MIMO CSI feedback에서 무엇을 최적화하는가"
                icon={<Target className="h-4 w-4" />}
                body="UE는 downlink CSI를 관측하지만 BS가 precoding을 하려면 feedback이 필요하다. 따라서 CSI를 작게 압축하면서도 복원 distortion을 낮춰야 한다."
              />
              <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <Card>
                  <h3 className="text-lg font-black">핵심 deployment 비대칭성</h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    <p>
                      CSI feedback autoencoder는 일반 image autoencoder와 제약이 다르다. encoder는 UE에서 동작하므로 latency, energy, memory budget이
                      작다. 반면 decoder는 BS에서 동작하므로 상대적으로 더 많은 attention과 reconstruction computation을 사용할 수 있다.
                    </p>
                    <p>
                      이 논문은 이 비대칭성을 architecture 자체에 반영한다. encoder에는 full attention 대신 linear-complexity state-space style recurrence를
                      사용하고, decoder에는 더 강한 Transformer를 두되 memory를 encoder propagation law와 연결한다.
                    </p>
                    <p>
                      성능 지표는 NMSE이며, 모델 비용은 encoder FLOPs와 total FLOPs를 함께 본다. 논문에서 가장 중요한 비교축은 단순 NMSE가 아니라
                      <span className="font-black text-slate-900 dark:text-white"> NMSE 대비 UE-side encoder complexity</span>이다.
                    </p>
                  </div>
                </Card>
                <Card>
                  <h3 className="mb-4 text-lg font-black">Simulation Parameters</h3>
                  <div className="space-y-2">
                    {SYSTEM_PARAMS.map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-900">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{key}</span>
                        <span className="text-right text-sm font-black text-slate-800 dark:text-slate-100">
                          {value.includes('\\') ? <InlineEquation latex={value} /> : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>

            <section id="section-architecture" className="scroll-mt-24">
              <SectionHeading
                eyebrow="Architecture"
                title="가벼운 UE encoder와 구조 prior를 쓰는 BS decoder"
                icon={<Layers3 className="h-4 w-4" />}
                body="전체 구조는 encoder와 decoder를 일부러 비대칭으로 설계한다. 두 모듈을 연결하는 핵심 정보는 SS2D-W coefficient set A이다."
              />
              <Card>
                <ArchitectureFlow />
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                    <h3 className="font-black text-emerald-950 dark:text-emerald-100">UE side</h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/80">
                      Patch embedding 뒤 SS2D-W blocks로 propagation-aware feature를 만들고 FC로 latent vector를 생성한다.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30">
                    <h3 className="font-black text-amber-950 dark:text-amber-100">Shared model parameter</h3>
                    <p className="mt-2 text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">
                      feedback에 추가 side information을 보내지 않는다. SS2D-W coefficient는 배포된 model parameter로 encoder와 decoder가 공유한다.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-4 dark:bg-sky-950/30">
                    <h3 className="font-black text-sky-950 dark:text-sky-100">BS side</h3>
                    <p className="mt-2 text-sm leading-6 text-sky-900/80 dark:text-sky-100/80">
                      latent-expanded grid Y를 content stream으로 쓰고, coefficient-guided memory M_A를 cross-attention의 K,V로 사용한다.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            <section id="section-ss2dw" className="scroll-mt-24">
              <SectionHeading
                eyebrow="SS2D-W Encoder"
                title="generic SS2D scan을 CSI propagation에 맞게 바꾼다"
                icon={<Waves className="h-4 w-4" />}
                body="SS2D-W는 selective scan을 그대로 가져오는 대신, delay-angular grid에서 좌우상하 방향으로 누적되는 전파 구조를 정적 coefficient recurrence로 모델링한다."
              />
              <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <Card>
                  <h3 className="text-lg font-black">왜 wavefront recurrence인가</h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    <p>
                      CNN은 local receptive field를 쌓아야 먼 delay-angular 위치까지 정보를 전달한다. Transformer는 전역 의존성을 잘 보지만 UE encoder에서
                      full attention은 비용이 크다. SS2D-W는 scan-like linear path로 장거리 정보를 누적해 이 중간 지점을 노린다.
                    </p>
                    <p>
                      핵심은 coefficient를 방향별로 분리했다는 점이다. TL, TR, BL, BR quadrant마다 horizontal coefficient와 vertical coefficient가 별도로 존재하므로,
                      좌우 또는 상하 leakage가 비대칭인 CSI 구조를 표현할 수 있다.
                    </p>
                    <p>
                      현재 초안은 learned fusion 대신 네 방향 state 평균을 사용한다. 이는 UE branch control과 추가 projection을 줄이는 선택이며, decoder는 평균된
                      feature 외에도 coefficient 자체를 structural memory에 사용한다.
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <EquationRenderer latex={EQUATIONS[6].latex} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{EQUATIONS[6].meaning}</p>
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                    <span className="font-black">읽는 법: </span>
                    {EQUATIONS[6].read}
                  </div>
                </Card>
              </div>
            </section>

            <section id="section-memory" className="scroll-mt-24">
              <SectionHeading
                eyebrow="Structural Memory Decoder"
                title="decoder memory를 Y 복사본이 아니라 전파 누적 token으로 만든다"
                icon={<Network className="h-4 w-4" />}
                body="이 부분이 TransNet-style decoder와 가장 분명하게 갈라지는 지점이다. cross-attention은 표준 연산이지만 K,V로 들어가는 memory token이 다르다."
              />
              <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                <DirectionMemorySketch />
                <Card>
                  <h3 className="text-lg font-black">memory construction의 해석</h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    <p>
                      Decoder layer m은 encoder block r(m)의 coefficient를 가져온다. 이 coefficient를 left, right, top, bottom descriptor로 재조합하고,
                      작은 projection adapter를 통해 decoder channel gate로 바꾼다.
                    </p>
                    <p>
                      그 다음 각 위치의 memory token은 자기 token과 네 방향 이웃 token의 감쇠 누적으로 만들어진다. 방향 gate의 k제곱은 거리가 멀수록 contribution을
                      줄이는 propagation decay 역할을 한다.
                    </p>
                    <p>
                      따라서 제안 decoder는 &quot;attention에 위치 bias를 넣었다&quot;가 아니다. attention의 key/value memory를 encoder가 학습한 propagation law로
                      재구성한다. 이 차이가 논문의 architectural contribution이다.
                    </p>
                  </div>
                </Card>
              </div>
              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Card>
                  <h3 className="mb-3 text-lg font-black">TransNet-style baseline</h3>
                  <EquationRenderer latex={EQUATIONS[10].latex} />
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{EQUATIONS[10].meaning}</p>
                </Card>
                <Card>
                  <h3 className="mb-3 text-lg font-black">SS2D-guided memory</h3>
                  <EquationRenderer latex={EQUATIONS[14].latex} />
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{EQUATIONS[14].meaning}</p>
                </Card>
              </div>
            </section>

            <section id="section-algorithm" className="scroll-mt-24">
              <SectionHeading
                eyebrow="Algorithm Flow"
                title="학습자가 따라갈 수 있는 8단계 연구 흐름"
                icon={<Route className="h-4 w-4" />}
                body="아래 흐름은 논문 implementation을 읽기 위한 순서다. 특히 STEP 6-8이 decoder novelty를 구성한다."
              />
              <div className="grid gap-4 md:grid-cols-2">
                {ALGORITHM_STEPS.map((item, index) => (
                  <Card key={item.step} className={index >= 5 ? 'border-sky-200 dark:border-sky-900' : ''}>
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-950">{item.step}</div>
                      <div>
                        <div className="mb-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                          {item.type}
                        </div>
                        <h3 className="text-base font-black text-slate-950 dark:text-white">{item.title}</h3>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section id="section-experiments" className="scroll-mt-24">
              <SectionHeading
                eyebrow="Experiments"
                title="현재 숫자는 snapshot claim과 pending measurement를 분리해서 관리"
                icon={<BarChart3 className="h-4 w-4" />}
                body="제안 모델의 -15.84 dB는 현재 구조 메모리 학습 snapshot이므로, 최종 논문 표에서는 수렴 checkpoint와 FLOPs profiling을 반드시 분리 표기해야 한다."
              />
              <Card>
                <DataTable
                  headers={['Model', 'NMSE (dB)', 'Enc. FLOPs (M)', 'Total FLOPs (M)', '해석']}
                  rows={BASELINE_ROWS.map((row) => [
                    <span key={`${row.model}-model`} className="font-black text-slate-950 dark:text-white">{row.model}</span>,
                    row.nmse,
                    row.enc,
                    row.total,
                    row.note,
                  ])}
                />
                <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
                  <span className="font-black">주의: </span>
                  현재 proposed row는 architectural direction을 보여주는 training snapshot이다. 최종 claim은 converged NMSE, encoder FLOPs, total FLOPs,
                  그리고 ablation 결과가 채워진 뒤 확정해야 한다.
                </div>
              </Card>
            </section>

            <section id="section-equations" className="scroll-mt-24">
              <SectionHeading
                eyebrow="Key Equations"
                title="논문을 읽지 않아도 핵심 수식 흐름을 따라가도록 분리"
                icon={<Sigma className="h-4 w-4" />}
                body="각 수식은 의미와 읽는 법을 같이 붙였다. implementation에서 어느 모듈과 연결되는지도 파악할 수 있게 구성했다."
              />
              <div className="space-y-4">
                {EQUATIONS.map((equation, index) => (
                  <Card key={equation.name}>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                        Eq. {index + 1}
                      </span>
                      <h3 className="text-lg font-black text-slate-950 dark:text-white">{equation.name}</h3>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <EquationRenderer latex={equation.latex} />
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                        <div className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">의미</div>
                        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{equation.meaning}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100 dark:bg-emerald-950/30 dark:ring-emerald-900">
                        <div className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">읽는 법</div>
                        <p className="text-sm leading-7 text-emerald-950 dark:text-emerald-100">{equation.read}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section id="section-checklist" className="scroll-mt-24 pb-12">
              <SectionHeading
                eyebrow="Research Notes"
                title="최종 논문화 전에 채워야 할 검증 항목"
                icon={<CheckCircle2 className="h-4 w-4" />}
                body="이 섹션은 local browser storage에 저장된다. 논문 실험을 진행하면서 완료 상태와 메모를 바로 갱신할 수 있다."
              />
              <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
                <Card>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          task.done
                            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            task.done
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 text-transparent dark:border-slate-700'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block font-black text-slate-950 dark:text-white">{task.label}</span>
                          <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">{task.detail}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </Card>

                <div className="space-y-5">
                  <Card>
                    <h3 className="flex items-center gap-2 text-lg font-black">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      연구 메모
                    </h3>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="예: no-DWConv run에서 early epoch 회복 속도, SSMC gate 분포, FLOPs profiler 조건 등을 기록"
                      className="mt-4 min-h-[220px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 outline-none ring-0 transition focus:border-emerald-400 dark:border-slate-800 dark:bg-slate-900"
                    />
                  </Card>
                  <Card>
                    <h3 className="flex items-center gap-2 text-lg font-black">
                      <Sparkles className="h-5 w-5 text-cyan-500" />
                      참고문헌 앵커
                    </h3>
                    <div className="mt-4 space-y-2">
                      {REFERENCES.map(([key, value]) => (
                        <div key={key} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{key}</div>
                          <div className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">{value}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </section>
          </main>
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 rounded-full bg-slate-950 p-3 text-white shadow-lg transition hover:-translate-y-1 dark:bg-white dark:text-slate-950"
          aria-label="맨 위로 이동"
        >
          <ArrowDown className="h-5 w-5 rotate-180" />
        </button>
      </div>
    </GlossaryTermsContext.Provider>
  );
}
