import type { PaperWithNote } from '@/types';

export interface EvidenceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PaperEvidenceBlock {
  id: string;
  title: string;
  kind: 'abstract' | 'architecture' | 'algorithm' | 'equation' | 'result' | 'ablation';
  page: number;
  label: string;
  summary: string;
  learningGoal?: string;
  keyPoints?: string[];
  formula?: string;
  interpretation?: string;
  watchOut?: string;
  quote?: string;
  rects: EvidenceRect[];
  keywords?: string[];
}

const MOR_EVIDENCE_BLOCKS: PaperEvidenceBlock[] = [
  {
    id: 'mor-abstract-core',
    title: 'MoR의 핵심 문제의식',
    kind: 'abstract',
    page: 1,
    label: 'Abstract',
    summary:
      'MoR은 parameter sharing과 adaptive computation을 하나의 Recursive Transformer 안에서 결합한다. 같은 layer stack을 여러 recursion step에서 재사용해 parameter 수를 줄이고, router가 token마다 필요한 recursion depth를 다르게 배정한다.',
    learningGoal:
      '이 논문을 읽을 때는 “모델을 작게 만드는 축”과 “token별로 계산량을 다르게 쓰는 축”이 어떻게 동시에 결합되는지 먼저 잡아야 한다.',
    keyPoints: [
      'Parameter sharing: 깊이 방향 layer를 모두 독립적으로 저장하지 않고 공유 stack을 반복 사용한다.',
      'Adaptive computation: 모든 token을 같은 깊이로 처리하지 않고 중요한 token만 더 깊은 recursion으로 보낸다.',
      'KV efficiency: 깊은 recursion에서는 active token만 attention/KV cost를 쓰게 만들어 memory access까지 줄인다.',
    ],
    interpretation:
      'MoR의 핵심은 단순히 “layer를 반복한다”가 아니라, 반복 구조 위에 routing을 얹어 depth를 token별 expert처럼 선택하게 만든다는 점이다.',
    quote: 'parameter efficiency, while lightweight routers enable adaptive token-level thinking',
    rects: [{ x: 0.1, y: 0.16, width: 0.82, height: 0.23 }],
    keywords: ['parameter sharing', 'adaptive computation', 'token-level thinking'],
  },
  {
    id: 'mor-three-efficiency-axes',
    title: '세 효율 축: parameter, FLOPs, KV traffic',
    kind: 'architecture',
    page: 2,
    label: 'Intro',
    summary:
      'Introduction 후반부는 MoR의 기여를 세 축으로 압축한다. (i) weight tying으로 parameter를 줄이고, (ii) token routing으로 불필요한 FLOPs를 줄이며, (iii) recursion-wise KV caching으로 memory traffic을 줄인다.',
    learningGoal:
      'MoR을 “작은 모델” 하나로만 보지 말고, parameter 수, token별 계산량, KV cache 이동량을 동시에 줄이는 구조로 이해한다.',
    keyPoints: [
      'Parameter axis: shared parameter block을 recursion step마다 재사용한다.',
      'Computation axis: token-specific recursion depth로 쉬운 token의 추가 block 통과를 막는다.',
      'Memory axis: active token의 KV만 저장하거나 첫 recursion의 KV를 공유해 cache movement를 줄인다.',
    ],
    interpretation:
      '이 단락이 논문 전체의 claim map이다. 뒤의 Fig.2, Table 2, Table 3은 각각 routing/caching 설계와 성능 검증으로 이 세 축을 증명한다.',
    quote: 'MoR simultaneously (i) ties weights ... (ii) routes tokens ... (iii) caches key-values',
    rects: [{ x: 0.1, y: 0.48, width: 0.82, height: 0.08 }],
    keywords: ['weight tying', 'adaptive FLOPs', 'KV traffic'],
  },
  {
    id: 'mor-recursive-transformer',
    title: 'Recursive Transformer 기반',
    kind: 'architecture',
    page: 3,
    label: 'Sec. 2.1',
    summary:
      '기본 Transformer는 L개의 서로 다른 layer를 쌓지만, Recursive Transformer는 공유 parameter pool의 recursion block을 반복 적용한다. 이 구조가 MoR의 parameter efficiency 기반이다.',
    learningGoal:
      'MoR의 출발점인 Recursive Transformer가 왜 parameter 수를 줄이는지, 그리고 단순 layer tying과 무엇이 다른지 이해한다.',
    formula: String.raw`\text{Vanilla: } h_t^{\ell+1}=F_{\Phi_\ell}(h_t^\ell)\quad\Longrightarrow\quad \text{Recursive: } h_t^{r+1}=F_{\Phi'}(h_t^r)`,
    keyPoints: [
      'Vanilla Transformer: 각 layer가 고유 parameter \u03a6_\u2113을 가진다.',
      'Recursive Transformer: 동일한 parameter \u03a6\u2032을 여러 recursion step에서 재사용한다.',
      '효과적인 depth는 유지하면서 non-embedding parameter 수를 크게 줄일 수 있다.',
    ],
    interpretation:
      'ALBERT의 layer tying과 비슷한 방향이지만, MoR에서는 여기에 token별 depth routing과 KV cache 전략이 붙는다.',
    quote: 'reduce parameter count by reusing layers across depth',
    rects: [
      { x: 0.1, y: 0.09, width: 0.82, height: 0.17 },
      { x: 0.1, y: 0.32, width: 0.82, height: 0.13 },
    ],
    keywords: ['recursive transformer', 'layer tying', 'shared parameters'],
  },
  {
    id: 'mor-architecture-figure',
    title: 'MoR 구성요소: routing과 KV caching',
    kind: 'architecture',
    page: 4,
    label: 'Fig. 2',
    summary:
      'Figure 2는 MoR의 세 구성요소를 한 번에 보여준다. expert-choice routing은 recursion step이 token을 고르고, token-choice routing은 token이 자신의 depth를 고른다. caching은 active token의 KV만 저장하거나 첫 recursion의 KV를 공유한다.',
    learningGoal:
      'MoR 아키텍처를 routing 방식과 KV caching 방식의 조합으로 분해한다.',
    keyPoints: [
      'Expert-choice: 각 recursion depth가 top-k token을 선택한다.',
      'Token-choice: 각 token이 처음부터 자신의 recursion depth를 선택한다.',
      'Caching mechanism: recursion step마다 attention 가능한 KV set을 줄이거나 공유한다.',
    ],
    interpretation:
      '그림의 loop는 깊이 방향 expert, router는 token-to-depth allocator, KV matrix는 실제 memory/attention 비용이 어디서 줄어드는지 보여주는 장치로 읽으면 된다.',
    quote: 'Architectural components of Mixture-of-Recursions',
    rects: [{ x: 0.07, y: 0.05, width: 0.86, height: 0.29 }],
    keywords: ['expert-choice', 'token-choice', 'KV caching'],
  },
  {
    id: 'mor-routing-strategies',
    title: 'Expert-choice vs Token-choice routing',
    kind: 'algorithm',
    page: 4,
    label: 'Sec. 2.2.1',
    summary:
      'Expert-choice는 각 recursion depth를 expert처럼 보고 top-k token을 선택한다. 계산 budget을 안정적으로 맞추기 쉽지만 causal language modeling에서는 미래 token 정보가 섞일 수 있다. Token-choice는 각 token이 처음부터 자신의 recursion depth를 정해 leakage를 줄인다.',
    learningGoal:
      '두 routing 방식의 차이가 왜 compute budget, causality, load balance 문제로 갈라지는지 이해한다.',
    formula: String.raw`\text{Expert-choice: } \mathcal{A}_r=\operatorname{TopK}_t(s_{t,r})\qquad \text{Token-choice: } r_t=\operatorname{Select}_r(s_{t,r})`,
    keyPoints: [
      'Expert-choice는 단계별 top-k로 budget control이 쉽고 load balance가 안정적이다.',
      '하지만 sequence 전체 점수 분포를 보고 top-k를 고르면 causal LM에서 미래 token 정보가 라우팅 결정에 새어 들어갈 수 있다.',
      'Token-choice는 token별 입력 결정이라 leakage를 줄이지만 load imbalance와 성능 저하가 생길 수 있다.',
    ],
    watchOut:
      'Expert-choice가 항상 더 좋은 것은 아니다. 논문 실험에서는 강하지만 causal leakage를 어떻게 막거나 완화했는지가 구현과 평가에서 중요하다.',
    quote: 'Routing Strategies: Expert-choice vs. Token-choice',
    rects: [{ x: 0.1, y: 0.54, width: 0.82, height: 0.21 }],
    keywords: ['top-k routing', 'causality', 'load balancing'],
  },
  {
    id: 'mor-expert-routing-equation',
    title: 'Eq.(2.1): expert-choice hidden-state update',
    kind: 'equation',
    page: 4,
    label: 'Eq. (2.1)',
    summary:
      'Eq.(2.1)은 라우터 점수와 percentile threshold로 token을 더 깊은 recursion block에 보낼지 결정한다. 선택된 token은 shared block 출력이 residual로 더해지고, 선택되지 않은 token은 이전 hidden state를 그대로 유지한다.',
    learningGoal:
      'MoR의 “token별 깊이 선택”이 말로만 있는 것이 아니라 hidden-state update 식에 어떻게 들어가는지 확인한다.',
    formula: String.raw`\mathcal{H}_{t}^{r+1}=
\begin{cases}
g_t^r f(\mathcal{H}_t^r,\Phi')+\mathcal{H}_t^r,& g_t^r>P_\beta(G^r),\\
\mathcal{H}_t^r,& \text{otherwise.}
\end{cases}`,
    keyPoints: [
      'g_t^r는 recursion step r에서 token t가 더 계산될 필요가 있는지 나타내는 router score다.',
      'P_beta(G^r)는 같은 step의 score 분포에서 정한 threshold라서 top-k/용량 제어 역할을 한다.',
      '선택되지 않은 token은 drop되는 것이 아니라 hidden state를 유지하며 다음 문맥 계산에는 계속 존재한다.',
    ],
    interpretation:
      '이 식은 MoE의 expert 선택을 depth 방향으로 돌린 형태다. expert는 서로 다른 FFN이 아니라 같은 shared block의 반복 step이다.',
    watchOut:
      'p.4 식은 expert-choice 기준이다. token-choice는 처음에 전체 recursion path를 정하므로 같은 방식의 step-by-step top-k update로만 이해하면 안 된다.',
    quote: 'if g_t^r > P_beta(G^r)',
    rects: [{ x: 0.1, y: 0.61, width: 0.82, height: 0.13 }],
    keywords: ['Eq. 2.1', 'router score', 'percentile threshold'],
  },
  {
    id: 'mor-caching-table',
    title: 'KV cache 전략과 비용 비교',
    kind: 'equation',
    page: 5,
    label: 'Table 2',
    summary:
      'Recursion-wise caching은 현재 recursion에서 살아남은 token의 KV만 저장한다. Recursive sharing은 첫 recursion의 KV를 이후 recursion에서 공유한다. Table 2는 KV memory, cache IO, attention FLOPs를 vanilla 대비 상대 비용으로 정리한다.',
    learningGoal:
      'MoR이 FLOPs만 줄이는 모델이 아니라 KV memory와 cache IO까지 겨냥한다는 점을 이해한다.',
    formula: String.raw`\text{Recursion-wise KV Memory}\approx\frac{N_r+1}{2N_r},\qquad \text{Recursive Sharing KV Memory}\approx\frac{1}{N_r}`,
    keyPoints: [
      'Recursion-wise caching: 각 recursion에서 active token의 KV만 저장한다.',
      'Recursive sharing: 첫 recursion의 KV를 다음 recursion에서 재사용해 memory footprint를 더 줄인다.',
      'Attention FLOPs는 active token subset 크기에 따라 감소한다.',
    ],
    interpretation:
      'Token을 drop한다는 것은 hidden state 계산만 줄이는 것이 아니라 attention의 quadratic cost와 KV cache movement를 같이 줄인다는 뜻이다.',
    quote: 'KV Memory',
    rects: [
      { x: 0.1, y: 0.09, width: 0.82, height: 0.22 },
      { x: 0.1, y: 0.51, width: 0.82, height: 0.18 },
    ],
    keywords: ['KV memory', 'cache IO', 'attention FLOPs'],
  },
  {
    id: 'mor-main-results',
    title: '주요 실험: Vanilla/Recursive/MoR 비교',
    kind: 'result',
    page: 6,
    label: 'Table 3',
    summary:
      'Table 3은 fixed FLOPs와 fixed token 조건에서 Vanilla, Recursive, MoR을 비교한다. MoR은 더 적은 non-embedding parameter를 사용하면서 validation NLL과 few-shot accuracy에서 recursive baseline보다 강한 결과를 보인다.',
    learningGoal:
      '주요 표를 읽을 때 isoFLOP 조건과 fixed-token 조건을 분리해서 해석한다.',
    keyPoints: [
      'Fixed FLOPs: 같은 총 training compute에서 MoR이 더 많은 token을 처리할 수 있는지 본다.',
      'Fixed token: 같은 token 수를 볼 때 실제 소모 FLOPs가 얼마나 줄어드는지 본다.',
      'Recursive baseline과 비교해야 MoR의 routing/caching 추가 이득이 보인다.',
    ],
    interpretation:
      'MoR의 주장은 “무조건 vanilla보다 작고 좋다”가 아니라, parameter-shared recursive baseline에 adaptive routing을 붙였을 때 Pareto frontier가 이동한다는 것이다.',
    quote: 'Comparison of MoR, Recursive, and Vanilla Transformers',
    rects: [
      { x: 0.07, y: 0.08, width: 0.86, height: 0.43 },
      { x: 0.1, y: 0.56, width: 0.82, height: 0.17 },
    ],
    keywords: ['isoFLOP', 'NLL', 'few-shot accuracy'],
  },
  {
    id: 'mor-isoflop',
    title: 'IsoFLOP scaling 해석',
    kind: 'result',
    page: 7,
    label: 'Fig. 3 / Sec. 3.2',
    summary:
      'Figure 3은 여러 model scale과 compute budget에서 validation loss를 비교한다. MoR은 작은 135M scale에서는 bottleneck이 있지만, 360M 이상에서는 vanilla와 비슷하거나 더 낮은 loss를 보이며 recursive baseline을 꾸준히 앞선다.',
    learningGoal:
      'MoR의 효과가 scale에 따라 달라지는 이유를 읽는 법을 익힌다.',
    keyPoints: [
      '135M에서는 공유 layer의 표현 용량 부족 때문에 vanilla보다 불리할 수 있다.',
      '360M 이상에서는 parameter sharing으로 생기는 손실보다 adaptive compute와 추가 token 처리 이득이 커진다.',
      'Recursive baseline보다 꾸준히 좋아지는지가 routing이 실제로 작동하는지 보여주는 핵심 근거다.',
    ],
    watchOut:
      '작은 모델에서의 한계는 명시해야 한다. MoR은 특히 중대형 scale에서 효율 frontier를 개선하는 설계로 읽는 것이 정확하다.',
    quote: 'MoR consistently outperforms recursive baselines',
    rects: [
      { x: 0.07, y: 0.06, width: 0.86, height: 0.23 },
      { x: 0.1, y: 0.35, width: 0.82, height: 0.22 },
    ],
    keywords: ['scaling', 'compute budget', 'validation loss'],
  },
  {
    id: 'mor-ablation',
    title: 'Ablation: Middle-Cycle과 KV sharing',
    kind: 'ablation',
    page: 8,
    label: 'Fig. 4 / Sec. 4',
    summary:
      'Figure 4는 throughput Pareto frontier, parameter sharing strategy, KV sharing ablation을 함께 보여준다. 논문은 Middle-Cycle을 가장 안정적인 sharing 전략으로 보고, KV sharing은 throughput과 memory 측면의 실용성을 보완한다고 해석한다.',
    learningGoal:
      'Ablation을 통해 MoR 성능이 어느 구성요소에서 오는지 분리한다.',
    keyPoints: [
      'Middle-Cycle은 첫 layer와 마지막 layer를 보존하면서 중간 block을 cycle로 재사용해 안정적인 sharing을 만든다.',
      'Throughput frontier는 depth-wise batching과 active token 감소가 실제 추론 속도로 이어지는지를 보여준다.',
      'KV sharing은 memory를 줄이지만 quality와 IO trade-off를 함께 확인해야 한다.',
    ],
    interpretation:
      '이 ablation은 구현 시 어떤 sharing scheme을 기본값으로 할지, 그리고 deployment에서 KV cache 전략을 어떻게 선택할지 결정하는 근거다.',
    quote: 'Middle-Cycle is the most effective',
    rects: [
      { x: 0.07, y: 0.05, width: 0.86, height: 0.32 },
      { x: 0.1, y: 0.44, width: 0.82, height: 0.18 },
    ],
    keywords: ['throughput', 'Middle-Cycle', 'KV sharing'],
  },
];

export function resolvePaperPdfUrl(paper: Pick<PaperWithNote, 'pdf_url' | 'arxiv_id'>): string | null {
  if (paper.pdf_url) return paper.pdf_url;
  if (!paper.arxiv_id) return null;

  if (/^\d{4}\.\d{4,5}(v\d+)?$/.test(paper.arxiv_id) || /^cs\/\d{7}(v\d+)?$/i.test(paper.arxiv_id)) {
    return `https://arxiv.org/pdf/${paper.arxiv_id}`;
  }

  return null;
}

export function getEvidenceBlocksForPaper(paper: PaperWithNote): PaperEvidenceBlock[] {
  if (paper.arxiv_id === '2507.10524') return MOR_EVIDENCE_BLOCKS;

  const fallback: PaperEvidenceBlock[] = [];
  if (paper.abstract) {
    fallback.push({
      id: `${paper.id}-abstract`,
      title: '초록 근거',
      kind: 'abstract',
      page: 1,
      label: 'p.1',
      summary: paper.abstract,
      rects: [{ x: 0.08, y: 0.12, width: 0.84, height: 0.26 }],
    });
  }

  (paper.key_contributions ?? []).slice(0, 4).forEach((contribution, idx) => {
    fallback.push({
      id: `${paper.id}-contribution-${idx}`,
      title: `주요 기여 ${idx + 1}`,
      kind: 'algorithm',
      page: Math.min(idx + 2, 4),
      label: `estimated p.${Math.min(idx + 2, 4)}`,
      summary: contribution,
      rects: [],
    });
  });

  return fallback;
}
