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

type EvidenceSeed = Omit<PaperEvidenceBlock, 'rects'> & {
  rects?: EvidenceRect[];
};

const evidence = (blocks: EvidenceSeed[]): PaperEvidenceBlock[] =>
  blocks.map((block) => ({
    ...block,
    rects: block.rects ?? [],
  }));

const EVIDENCE_BY_ARXIV: Record<string, PaperEvidenceBlock[]> = {
  '2507.10524': MOR_EVIDENCE_BLOCKS,
  '2307.13304': evidence([
    {
      id: 'quip-incoherence-problem',
      title: 'QuIP의 출발점: 2-bit PTQ 실패와 incoherence',
      kind: 'abstract',
      page: 1,
      label: 'Abstract / Intro',
      summary:
        'QuIP은 LLM 2-bit PTQ가 무너지는 원인을 단순 bit 부족이 아니라 좌표계와 중요한 Hessian 방향의 정렬 문제로 해석한다. 랜덤 직교 변환으로 weight와 Hessian을 incoherent하게 만든 뒤, Hessian-aware sequential quantization을 적용한다.',
      formula: String.raw`H=X^\top X,\qquad W' = Q_L^\top W Q_R,\qquad \min_{\hat W}\operatorname{tr}\big((W-\hat W)H(W-\hat W)^\top\big)`,
      keyPoints: [
        '중요 방향이 특정 좌표에 몰리면 2-bit rounding 오차가 치명적으로 커진다.',
        '랜덤 직교 변환은 에너지를 좌표 전반에 퍼뜨려 스칼라 양자화가 다루기 쉬운 형태를 만든다.',
        'LDLQ는 이전 좌표 양자화 오차를 다음 좌표에 보정하는 GPTQ 계열의 순차 알고리즘이다.',
      ],
      keywords: ['QuIP', 'incoherence', '2-bit PTQ', 'LDLQ', 'Hessian'],
    },
    {
      id: 'quip-ldlq-flow',
      title: 'LDLQ 알고리즘 흐름',
      kind: 'algorithm',
      page: 5,
      label: 'Algorithm / LDLQ',
      summary:
        'Hessian을 LDL 분해한 뒤 좌표를 순서대로 양자화한다. 핵심은 현재 좌표를 그냥 round하지 않고, 앞에서 발생한 quantization residual이 현재 좌표에 미치는 영향을 보정한 후 codepoint를 선택한다는 점이다.',
      formula: String.raw`H=LDL^\top,\qquad \hat w_i = Q\!\left(w_i-\frac{1}{d_{ii}}\sum_{j<i}L_{ij}(\hat w_j-w_j)\right)`,
      interpretation:
        'QuIP을 읽을 때 LDLQ는 “양자화 오차를 뒤 좌표로 밀어 넣는 error feedback”으로 이해하면 빠르다.',
      keywords: ['LDL decomposition', 'error feedback', 'sequential quantization'],
    },
  ]),
  '2402.04396': evidence([
    {
      id: 'quipsharp-hadamard-e8',
      title: 'QuIP#의 두 개선: Hadamard incoherence와 E8 lattice',
      kind: 'architecture',
      page: 1,
      label: 'Abstract',
      summary:
        'QuIP#은 QuIP의 랜덤 직교 변환 비용과 스칼라 codebook 한계를 동시에 줄인다. Walsh-Hadamard 변환으로 빠른 incoherence를 만들고, E8 lattice vector codebook으로 8차원 블록을 더 낮은 distortion으로 양자화한다.',
      formula: String.raw`\tilde W=H_n W H_m,\qquad \hat{\mathbf w}=\arg\min_{\mathbf c\in\Lambda_{E_8}}\|\mathbf w-\mathbf c\|_2`,
      keyPoints: [
        'Hadamard transform은 구조화되어 있어 O(n log n) 수준으로 적용 가능하다.',
        'E8 lattice는 ball-shaped 분포에 잘 맞는 8차원 vector quantizer다.',
        'BlockLDLQ와 optional fine-tuning으로 2-4bit 영역의 실전 성능을 개선한다.',
      ],
      keywords: ['QuIP#', 'Hadamard', 'E8 lattice', 'vector quantization'],
    },
  ]),
  '2401.06118': evidence([
    {
      id: 'aqlm-additive-codebook',
      title: 'AQLM: 여러 codebook의 합으로 초저비트 표현력 확장',
      kind: 'architecture',
      page: 1,
      label: 'Abstract / Method',
      summary:
        'AQLM은 하나의 codeword로 weight group을 표현하지 않고 여러 codebook에서 선택한 codeword를 더해 표현한다. 같은 bit budget에서도 가능한 조합 수가 크게 늘어나 <3bit 영역의 표현력이 올라간다.',
      formula: String.raw`\hat W_i=\sum_{m=1}^{M} C_m b_{i,m},\qquad \min_{\hat W}\|WX-\hat W X\|_2^2`,
      keyPoints: [
        '목표는 weight MSE가 아니라 calibration activation을 통과한 output error다.',
        'Residual K-means, beam search, codebook update, block fine-tuning을 교대로 사용한다.',
        '단일 lattice/codebook보다 표현력은 강하지만 lookup과 최적화 절차가 더 복잡하다.',
      ],
      keywords: ['AQLM', 'additive quantization', 'multi-codebook', 'beam search'],
    },
  ]),
  '2306.00978': evidence([
    {
      id: 'awq-activation-aware-scaling',
      title: 'AWQ: activation이 큰 채널을 보호하는 weight-only PTQ',
      kind: 'algorithm',
      page: 1,
      label: 'Abstract / Method',
      summary:
        'AWQ는 LLM weight channel의 중요도가 activation 크기에 의해 달라진다는 관찰에서 출발한다. 중요한 채널의 weight를 scale up하고 activation을 scale down해 수학적 출력은 유지하면서 quantization grid에서 중요한 weight가 덜 손상되게 만든다.',
      formula: String.raw`\min_s\|Q(W\operatorname{diag}(s))\operatorname{diag}(s)^{-1}X-WX\|`,
      keyPoints: [
        '일부 salient channel만 FP16으로 남기는 대신 scaling transform으로 hardware-friendly하게 보호한다.',
        'calibration activation statistics를 사용하므로 purely weight-only heuristic보다 안정적이다.',
        'LLM.int8()의 outlier 관찰과 이어지지만 목표는 weight-only 저비트 압축이다.',
      ],
      keywords: ['AWQ', 'activation-aware', 'salient channel', 'scaling'],
    },
  ]),
  '1902.05690': evidence([
    {
      id: 'autoq-kernel-wise-search',
      title: 'AutoQ: kernel-wise mixed precision search',
      kind: 'algorithm',
      page: 1,
      label: 'Abstract / Search',
      summary:
        'AutoQ는 layer-wise보다 세밀한 kernel 단위 bit-width를 자동 선택해 accuracy-resource trade-off를 개선한다. 강화학습 기반 controller가 bit-width를 고르고, 정확도와 압축/연산 제약을 reward에 반영한다.',
      formula: String.raw`\text{Reward}=\text{accuracy term}-\lambda\cdot\text{resource penalty}`,
      keyPoints: [
        'mixed precision을 수동 규칙이 아니라 탐색 문제로 만든 초기 계열이다.',
        'kernel-wise search space는 성능 잠재력이 크지만 탐색 비용과 deployment 복잡도가 증가한다.',
      ],
      keywords: ['AutoQ', 'kernel-wise quantization', 'mixed precision', 'reinforcement learning'],
    },
  ]),
  '1811.08886': evidence([
    {
      id: 'haq-hardware-aware-rl',
      title: 'HAQ: 하드웨어 피드백 기반 mixed precision',
      kind: 'algorithm',
      page: 1,
      label: 'Abstract / RL',
      summary:
        'HAQ는 FLOPs나 parameter count 같은 proxy 대신 실제 하드웨어 simulator가 반환하는 latency/energy를 bit allocation reward로 사용한다. 같은 모델이라도 edge, cloud, accelerator에 따라 최적 bit-width가 달라진다는 점이 핵심이다.',
      formula: String.raw`b_k=\operatorname{round}\{b_{\min}-0.5+a_k(b_{\max}-b_{\min}+1)\}`,
      keyPoints: [
        'state에는 layer index, channel 수, kernel size, feature map size, 이전 action 등이 들어간다.',
        'action은 layer별 weight/activation bit-width다.',
        'KL clipping과 선형 양자화는 탐색된 bit-width를 실제 quantizer로 바꾸는 후처리다.',
      ],
      keywords: ['HAQ', 'hardware-aware', 'DDPG', 'latency', 'energy'],
    },
  ]),
  '2405.14917': evidence([
    {
      id: 'slimllm-salience-framework',
      title: 'SliM-LLM: salience 기반 group-wise mixed precision',
      kind: 'abstract',
      page: 1,
      label: 'Abstract / Fig. 2',
      summary:
        'SliM-LLM은 LLM 저비트 PTQ에서 uniform precision이 품질을 무너뜨리고, unstructured mixed precision은 배포가 어렵다는 문제를 함께 다룬다. 중요한 weight가 채널/그룹 단위로 구조적으로 몰린다는 관찰을 이용해 group-wise bit allocation을 설계한다.',
      formula: String.raw`\Delta\mathcal L\approx \operatorname{tr}\{(W_f-\hat W)H(W_f-\hat W)^\top\}`,
      keyPoints: [
        'SBA는 그룹 평균 salience 순위를 이용해 더 중요한 그룹에 높은 bit를 배정한다.',
        'SQC는 그룹 내부의 locally salient weight를 더 민감하게 보정한다.',
        'structured group-wise mixed precision이라 bitmap 기반 element-wise 방식보다 배포 친화적이다.',
      ],
      keywords: ['SliM-LLM', 'salience', 'SBA', 'SQC', 'group-wise mixed precision'],
    },
    {
      id: 'slimllm-hessian-sba-sqc',
      title: 'Hessian salience에서 SBA/SQC까지의 알고리즘 흐름',
      kind: 'algorithm',
      page: 3,
      label: 'Definition 3.1 / Sec. 3',
      summary:
        '보정 activation으로 proxy Hessian을 만들고, element 제거가 output loss에 주는 영향을 salience로 정의한다. 이후 salience가 높은 그룹은 N+1 bit, 낮은 그룹은 N-1 bit로 보내 평균 bit-width를 유지하며 KL divergence가 가장 작은 mixed ratio를 찾는다.',
      formula: String.raw`\delta_{i,j}=\frac{w_{i,j}^2}{[H^{-1}]_{j,j}^2},\qquad \arg\min D_{\mathrm{KL}}\!\left(xW_f\,\|\,xW_{\mathrm{sba}}\right)`,
      interpretation:
        'SliM-LLM의 “중요도”는 attention score가 아니라 Hessian/activation 기반 quantization sensitivity다.',
      keywords: ['proxy Hessian', 'Cholesky', 'KL divergence', 'bit allocation'],
    },
  ]),
  '1712.08919': evidence([
    {
      id: 'csinet-autoencoder-baseline',
      title: 'CsiNet: CSI 피드백을 autoencoder 문제로 재정의',
      kind: 'architecture',
      page: 3,
      label: 'Fig. 1',
      summary:
        'CsiNet은 FDD massive MIMO CSI 피드백을 압축센싱 복원 문제가 아니라 UE encoder와 BS decoder가 함께 학습하는 autoencoder 문제로 바꾼 기준선이다. angle-delay domain의 sparse CSI를 잘라 실수/허수 2채널 입력으로 사용한다.',
      formula: String.raw`\mathrm{NMSE}=\mathbb E\left[\frac{\|\mathbf H_a-\hat{\mathbf H}_a\|_2^2}{\|\mathbf H_a\|_2^2}\right]`,
      keywords: ['CsiNet', 'autoencoder', 'CSI feedback', 'RefineNet'],
    },
  ]),
  '2102.07507': evidence([
    {
      id: 'clnet-complex-input',
      title: 'CLNet: 복소 CSI 구조를 보존하는 경량 네트워크',
      kind: 'architecture',
      page: 3,
      label: 'Complex input / Attention',
      summary:
        'CLNet은 복소 CSI를 단순 이미지처럼 처리하는 대신 real/imag 관계를 보존하는 complex-input layer와 channel/spatial attention을 사용한다. 목표는 CsiNet 계열보다 가볍게 복소 채널의 진폭/위상 구조를 복원하는 것이다.',
      keyPoints: [
        'forged complex-valued input layer로 복소 입력의 결합 구조를 반영한다.',
        'SE/CBAM 계열 attention으로 중요한 channel/path 위치를 강조한다.',
        'UE-side complexity를 낮추면서 복원 NMSE를 유지하는 lightweight CSI feedback 방향이다.',
      ],
      keywords: ['CLNet', 'complex input', 'SE', 'CBAM', 'lightweight CSI feedback'],
    },
  ]),
  '2503.08125': evidence([
    {
      id: 'csi-quant-design-bit-allocation',
      title: '원소별 비트 할당 기반 CSI 양자화 설계',
      kind: 'algorithm',
      page: 2,
      label: 'Bit Allocation',
      summary:
        '이 논문은 encoder 출력 원소마다 동적 범위와 중요도가 다르므로 동일 bit-width를 주는 uniform quantization이 손해라고 본다. 각 원소의 codebook과 bit 수를 따로 두고, 총 bit budget 아래에서 1비트 재분배를 반복한다.',
      formula: String.raw`z_m^q=w_{m,j},\quad j=\arg\min_i(w_{m,i}-z_m)^2,\qquad \sum_{m=1}^{M}B_m=MB`,
      keyPoints: [
        '비트 감소 손실 증가가 가장 작은 차원에서 1bit를 회수한다.',
        '비트 증가 손실 감소가 가장 큰 차원에 1bit를 준다.',
        '인코더/디코더/코드북/비트 할당을 Alternating Training으로 함께 최적화한다.',
      ],
      keywords: ['CSI quantization', 'bit allocation', 'codebook', 'alternating training'],
    },
  ]),
  '2403.07355': evidence([
    {
      id: 'shape-gain-vq-csi',
      title: 'Shape-Gain VQ: 크기와 방향을 분리한 CSI latent 양자화',
      kind: 'architecture',
      page: 5,
      label: 'Shape-Gain decomposition',
      summary:
        'latent vector를 magnitude(gain)와 normalized direction(shape)으로 분해해 각각 다른 quantizer를 적용한다. gain은 clipped μ-law 계열로, shape는 Grassmannian/nested codebook으로 처리해 일반 VQ보다 feedback overhead와 codebook 탐색 부담을 줄인다.',
      formula: String.raw`\mathbf z_i^q=Q_{\mathrm{gain}}(\|\mathbf z_i\|)\cdot Q_{\mathrm{shape}}\!\left(\frac{\mathbf z_i}{\|\mathbf z_i\|}\right)`,
      keywords: ['Shape-Gain', 'VQ', 'Grassmannian', 'mu-law', 'CSI feedback'],
    },
  ]),
  '1711.00937': evidence([
    {
      id: 'vqvae-codebook-commitment',
      title: 'VQ-VAE: discrete latent와 commitment loss',
      kind: 'equation',
      page: 4,
      label: 'VQ layer',
      summary:
        'VQ-VAE는 encoder 출력과 가장 가까운 codebook embedding을 decoder 입력으로 사용한다. codebook loss와 commitment loss를 분리하고, argmin 양자화의 backward는 straight-through estimator로 처리한다.',
      formula: String.raw`k=\arg\min_j\|z_e(x)-e_j\|_2,\quad L=\log p(x|z_q)+\|{\rm sg}[z_e]-e\|_2^2+\beta\|z_e-{\rm sg}[e]\|_2^2`,
      keywords: ['VQ-VAE', 'codebook', 'commitment loss', 'straight-through estimator'],
    },
  ]),
  '2602.02508': evidence([
    {
      id: 'mi-vqvae-precoding-csi',
      title: 'Precoding-oriented VQ-VAE: NMSE가 아니라 rate를 직접 겨냥',
      kind: 'algorithm',
      page: 4,
      label: 'MI-regularized objective',
      summary:
        '이 CSI feedback 논문은 VQ-VAE codebook index가 최종 precoder와 achievable rate에 도움이 되도록 학습한다. Mutual information regularization은 codebook collapse를 막고 index가 CSI/precoding 정보를 충분히 담도록 유도한다.',
      formula: String.raw`R_k=\log_2\!\left(1+\frac{|\mathbf h_k^H\mathbf v_k|^2}{\sum_{j\ne k}|\mathbf h_k^H\mathbf v_j|^2+\sigma_w^2}\right)`,
      keywords: ['VQ-VAE', 'mutual information', 'precoding', 'achievable rate'],
    },
  ]),
  '2008.07669': evidence([
    {
      id: 'hippo-polynomial-memory',
      title: 'HiPPO: 연속 이력을 고정 크기 다항식 계수로 압축',
      kind: 'equation',
      page: 3,
      label: 'HiPPO operator',
      summary:
        'HiPPO는 지금까지의 입력 함수 이력을 직교 다항식 기저에 투영하고, 그 계수 벡터를 recurrent memory state로 유지한다. S4/Mamba 계열의 state-space initialization을 이해하기 위한 수학적 기반이다.',
      formula: String.raw`\frac{d\mathbf c(t)}{dt}=A(t)\mathbf c(t)+B(t)f(t)`,
      keywords: ['HiPPO', 'polynomial projection', 'Legendre', 'continuous memory'],
    },
  ]),
  '2111.00396': evidence([
    {
      id: 's4-three-views',
      title: 'S4: continuous SSM, recurrent update, convolution kernel의 동치',
      kind: 'architecture',
      page: 3,
      label: 'S4 layer',
      summary:
        'S4는 하나의 state-space model을 연속 시간, 이산 recurrent update, 긴 convolution kernel로 변환한다. 학습은 convolution/FFT로 병렬화하고, 추론은 recurrent form으로 빠르게 실행할 수 있다.',
      formula: String.raw`x'(t)=Ax(t)+Bu(t),\quad y(t)=Cx(t)+Du(t),\qquad \bar K=(C\bar B,C\bar A\bar B,\ldots)`,
      keywords: ['S4', 'structured state space', 'convolution kernel', 'FFT', 'NPLR'],
    },
  ]),
  '2312.00752': evidence([
    {
      id: 'mamba-selective-ssm',
      title: 'Mamba: 입력 의존 selective state space',
      kind: 'algorithm',
      page: 2,
      label: 'Selection mechanism',
      summary:
        'Mamba는 S4의 LTI 제약이 selective copying과 induction 같은 과제에서 약점이라고 보고, B, C, Δ를 입력 token의 함수로 만든다. 이 때문에 convolution shortcut은 사라지지만 selective scan으로 선형 시간 구현을 만든다.',
      formula: String.raw`B_t=S_B(x_t),\quad C_t=S_C(x_t),\quad \Delta_t=\mathrm{softplus}(S_\Delta(x_t))`,
      keywords: ['Mamba', 'selective SSM', 'selective scan', 'linear time'],
    },
    {
      id: 'mamba-hardware-aware-scan',
      title: 'Selective scan의 하드웨어 관점',
      kind: 'algorithm',
      page: 4,
      label: 'Hardware-aware scan',
      summary:
        '입력 의존 SSM은 S4처럼 한 번에 convolution kernel로 계산하기 어렵다. Mamba는 associative scan, kernel fusion, SRAM/HBM traffic 절감을 결합해 GPU에서 긴 sequence를 선형 시간으로 처리한다.',
      formula: String.raw`h_t=\bar A_t h_{t-1}+\bar B_t x_t,\quad y_t=C_t h_t`,
      keywords: ['associative scan', 'kernel fusion', 'SRAM', 'HBM'],
    },
  ]),
  '2502.13842': evidence([
    {
      id: 'itt-dynamic-depth',
      title: 'Inner Thinking Transformer: 입력별 thinking depth 조절',
      kind: 'algorithm',
      page: 1,
      label: 'Abstract / Method',
      summary:
        '고정 깊이 Transformer는 쉬운 입력에는 과계산, 어려운 입력에는 부족한 계산을 쓴다. ITT는 입력 조건부 depth를 선택해 내부 reasoning compute를 동적으로 배분한다.',
      formula: String.raw`h^{\ell+1}=F_\ell(h^\ell),\quad \ell=1,\ldots,d(x)`,
      keywords: ['adaptive depth', 'dynamic depth scaling', 'internal thinking'],
    },
  ]),
  '2510.12773': evidence([
    {
      id: 'drllm-layer-routing',
      title: 'Dr.LLM: skip/execute/repeat layer routing',
      kind: 'algorithm',
      page: 2,
      label: 'Dynamic routing',
      summary:
        'Dr.LLM은 모든 layer를 한 번씩 실행하지 않고 layer-level action으로 skip, execute, repeat를 선택한다. MoR이 token별 recursive depth라면, Dr.LLM은 layer graph 위에서 어떤 layer 연산을 쓸지 고른다.',
      formula: String.raw`a_\ell\in\{\mathrm{skip},\mathrm{execute},\mathrm{repeat}\},\qquad h_{\ell+1}=\operatorname{Route}(h_\ell,a_\ell,F_\ell)`,
      keywords: ['dynamic layer routing', 'skip', 'repeat', 'adaptive inference'],
    },
  ]),
  '2603.08391': evidence([
    {
      id: 'adaptive-loops-memory',
      title: 'Adaptive Loops and Memory: 더 생각할 것인가, 더 기억할 것인가',
      kind: 'architecture',
      page: 2,
      label: 'Problem setup',
      summary:
        'Adaptive Loops는 반복 계산(loop depth)과 memory access를 같은 자원 배분 문제로 본다. 모델이 더 많이 반복해서 reasoning할지, memory를 더 사용할지의 trade-off를 분석한다.',
      formula: String.raw`\min_{r,m}\mathcal L(x;r,m)\quad\text{s.t.}\quad C_{\mathrm{loop}}(r)+C_{\mathrm{mem}}(m)\le B`,
      keywords: ['adaptive loops', 'memory', 'compute allocation', 'resource budget'],
    },
  ]),
  '1807.03748': evidence([
    {
      id: 'cpc-infonce',
      title: 'CPC: 미래 latent 예측과 InfoNCE',
      kind: 'equation',
      page: 3,
      label: 'InfoNCE',
      summary:
        'CPC는 현재 context가 미래 latent를 negatives 사이에서 맞히도록 학습한다. InfoNCE는 contrastive classification loss이면서 mutual information lower bound로 해석된다.',
      formula: String.raw`\mathcal L_N=-\log\frac{\exp(s(c_t,z^+)/\tau)}{\sum_j\exp(s(c_t,z_j)/\tau)},\qquad I(x;c)\ge\log N-\mathcal L_N`,
      keywords: ['CPC', 'InfoNCE', 'mutual information', 'contrastive learning'],
    },
  ]),
  '1911.05722': evidence([
    {
      id: 'moco-queue-momentum',
      title: 'MoCo: queue와 momentum encoder로 큰 negative dictionary 유지',
      kind: 'architecture',
      page: 3,
      label: 'MoCo dictionary',
      summary:
        'MoCo는 large batch 없이도 많은 negatives를 쓰기 위해 FIFO queue를 dictionary로 사용한다. key encoder는 query encoder의 EMA로 천천히 갱신해 queue 안 key 표현의 일관성을 유지한다.',
      formula: String.raw`\mathcal L=-\log\frac{\exp(q\cdot k^+/\tau)}{\exp(q\cdot k^+/\tau)+\sum_i\exp(q\cdot k_i^-/\tau)},\qquad \theta_k\leftarrow m\theta_k+(1-m)\theta_q`,
      keywords: ['MoCo', 'queue', 'momentum encoder', 'InfoNCE'],
    },
  ]),
  '2002.05709': evidence([
    {
      id: 'simclr-ntxent',
      title: 'SimCLR: augmentation, projection head, NT-Xent',
      kind: 'equation',
      page: 3,
      label: 'NT-Xent',
      summary:
        'SimCLR은 memory bank 없이 batch 내부 augmented views를 positive/negative로 구성한다. 강한 augmentation과 projection head가 contrastive representation 품질을 크게 좌우한다.',
      formula: String.raw`\ell(i,j)=-\log\frac{\exp(\operatorname{sim}(z_i,z_j)/\tau)}{\sum_{k\ne i}\exp(\operatorname{sim}(z_i,z_k)/\tau)}`,
      keywords: ['SimCLR', 'NT-Xent', 'augmentation', 'projection head'],
    },
  ]),
  '2006.07733': evidence([
    {
      id: 'byol-negative-free',
      title: 'BYOL: negative 없이 online-target 정렬',
      kind: 'architecture',
      page: 3,
      label: 'BYOL objective',
      summary:
        'BYOL은 online network가 EMA target network의 representation을 예측하게 한다. negative sample 없이도 predictor와 stop-gradient, EMA target의 조합으로 collapse를 피한다.',
      formula: String.raw`\mathcal L=2-2\cdot\frac{\langle p_\theta(v),z_\xi(v')\rangle}{\|p_\theta(v)\|\|z_\xi(v')\|},\qquad \xi\leftarrow\tau\xi+(1-\tau)\theta`,
      keywords: ['BYOL', 'negative-free', 'EMA', 'stop-gradient'],
    },
  ]),
  '2006.09882': evidence([
    {
      id: 'swav-swapped-assignment',
      title: 'SwAV: cluster assignment를 view 간 교차 예측',
      kind: 'algorithm',
      page: 3,
      label: 'Swapped prediction',
      summary:
        'SwAV는 각 augmented view를 prototype에 할당하고, 한 view의 balanced assignment를 다른 view가 예측하게 한다. instance-level negatives 대신 online clustering과 Sinkhorn balancing을 사용한다.',
      formula: String.raw`\mathcal L_{\mathrm{swap}}=\sum_{s,t}\ell(q_s,p_t),\qquad q=\operatorname{Sinkhorn}(\exp(Cz/\epsilon))`,
      keywords: ['SwAV', 'prototype', 'Sinkhorn', 'online clustering'],
    },
  ]),
  '2011.10566': evidence([
    {
      id: 'simsiam-stop-gradient',
      title: 'SimSiam: stop-gradient만으로 단순화한 Siamese SSL',
      kind: 'algorithm',
      page: 3,
      label: 'Stop-gradient',
      summary:
        'SimSiam은 BYOL 구조에서 momentum encoder와 negative queue를 제거한다. predictor와 stop-gradient가 collapse를 막는 핵심 요소라는 점을 실험적으로 보여준다.',
      formula: String.raw`\mathcal L=-\frac12\left[\cos(p_1,\operatorname{sg}(z_2))+\cos(p_2,\operatorname{sg}(z_1))\right]`,
      keywords: ['SimSiam', 'stop-gradient', 'predictor', 'collapse'],
    },
  ]),
  '2103.03230': evidence([
    {
      id: 'barlow-cross-correlation',
      title: 'Barlow Twins: redundancy reduction objective',
      kind: 'equation',
      page: 3,
      label: 'Cross-correlation',
      summary:
        '두 augmented view의 cross-correlation matrix를 identity에 가깝게 만든다. 대각 성분은 invariance를, 비대각 성분은 redundancy reduction을 담당한다.',
      formula: String.raw`\mathcal L=\sum_i(1-C_{ii})^2+\lambda\sum_{i\ne j}C_{ij}^2`,
      keywords: ['Barlow Twins', 'cross-correlation', 'redundancy reduction'],
    },
  ]),
  '2104.14294': evidence([
    {
      id: 'dino-self-distillation',
      title: 'DINO: ViT self-distillation과 emergent attention',
      kind: 'architecture',
      page: 3,
      label: 'Teacher-student',
      summary:
        'DINO는 EMA teacher와 student가 서로 다른 crop의 output distribution을 맞추도록 학습한다. centering과 sharpening으로 collapse를 제어하고, ViT attention에서 object-like segmentation 성질이 나타난다.',
      formula: String.raw`\mathcal L=\sum_{v\in V_s}\sum_{u\in V_t}H(\operatorname{sg}(p_t^u),p_s^v)`,
      keywords: ['DINO', 'self-distillation', 'ViT', 'teacher-student'],
    },
  ]),
  '1706.03762': evidence([
    {
      id: 'transformer-attention',
      title: 'Transformer: scaled dot-product attention',
      kind: 'equation',
      page: 4,
      label: 'Attention',
      summary:
        'Transformer는 recurrence 없이 query-key 유사도로 모든 token 사이의 전역 정보 흐름을 계산한다. Multi-head attention은 여러 관계 subspace를 병렬로 학습한다.',
      formula: String.raw`\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V`,
      keywords: ['Transformer', 'self-attention', 'multi-head attention'],
    },
  ]),
  '1810.04805': evidence([
    {
      id: 'bert-mlm-nsp',
      title: 'BERT: masked language modeling 기반 bidirectional pretraining',
      kind: 'algorithm',
      page: 3,
      label: 'MLM / NSP',
      summary:
        'BERT는 일부 token을 가리고 양방향 문맥으로 복원하는 MLM을 사용한다. GPT 계열 causal LM과 달리 encoder representation 자체를 downstream task에 맞게 fine-tuning하는 것이 핵심이다.',
      formula: String.raw`\max_\theta\sum_{i\in M}\log p_\theta(x_i\mid x_{\setminus M}),\qquad \mathcal L=\mathcal L_{\mathrm{MLM}}+\mathcal L_{\mathrm{NSP}}`,
      keywords: ['BERT', 'MLM', 'bidirectional Transformer', 'pretraining'],
    },
  ]),
  '2010.11929': evidence([
    {
      id: 'vit-patch-tokenization',
      title: 'ViT: 이미지를 patch token sequence로 변환',
      kind: 'architecture',
      page: 3,
      label: 'Patch embedding',
      summary:
        'ViT는 이미지를 고정 크기 patch로 나누고 linear embedding, CLS token, positional embedding을 더해 표준 Transformer encoder에 입력한다. CNN inductive bias를 줄이고 대규모 pretraining으로 성능을 확보한다.',
      formula: String.raw`z_0=[x_{\mathrm{cls}};x_p^1E;\cdots;x_p^NE]+E_{\mathrm{pos}}`,
      keywords: ['ViT', 'patch embedding', 'CLS token', 'positional embedding'],
    },
  ]),
  '2111.06377': evidence([
    {
      id: 'mae-asymmetric-autoencoder',
      title: 'MAE: visible patch만 encoding하는 비대칭 masked autoencoder',
      kind: 'architecture',
      page: 3,
      label: 'MAE architecture',
      summary:
        'MAE는 높은 비율의 image patch를 mask하고 visible patch만 encoder에 넣는다. lightweight decoder가 masked patch pixel을 복원하므로 pretraining 계산량을 크게 줄일 수 있다.',
      formula: String.raw`\mathcal L=\frac1{|M|}\sum_{i\in M}\|x_i-\hat x_i\|_2^2`,
      keywords: ['MAE', 'masked autoencoder', 'asymmetric encoder-decoder'],
    },
  ]),
  '2103.14030': evidence([
    {
      id: 'swin-shifted-window',
      title: 'Swin Transformer: shifted window attention',
      kind: 'architecture',
      page: 3,
      label: 'Shifted windows',
      summary:
        'Swin은 global attention 비용을 줄이기 위해 local window 안에서 attention을 계산하고, 다음 block에서 window를 shift해 cross-window 연결을 만든다. patch merging으로 hierarchical feature map을 구성한다.',
      formula: String.raw`\operatorname{Attention}(Q,K,V)=\operatorname{Softmax}(QK^\top/\sqrt d+B)V`,
      keywords: ['Swin Transformer', 'window attention', 'shifted window', 'relative position bias'],
    },
  ]),
};

const EVIDENCE_BY_TITLE: Array<{ pattern: RegExp; blocks: PaperEvidenceBlock[] }> = [
  {
    pattern: /Signature Verification.*Siamese.*Time Delay Neural Network/i,
    blocks: evidence([
      {
        id: 'siamese-tdnn-metric-learning',
        title: 'Siamese shared-weight metric learning의 원형',
        kind: 'architecture',
        page: 2,
        label: 'Siamese setup',
        summary:
          '두 입력을 동일한 TDNN encoder에 통과시켜 같은 representation space에 놓고, 서명 검증을 embedding distance 기반 판정 문제로 바꾼다.',
        formula: String.raw`d=\|f_\theta(x_1)-f_\theta(x_2)\|_2`,
        keywords: ['Siamese', 'shared weights', 'metric learning', 'verification'],
      },
    ]),
  },
  {
    pattern: /Learning a Similarity Metric Discriminatively/i,
    blocks: evidence([
      {
        id: 'chopra-contrastive-loss',
        title: 'Contrastive loss로 유사도 공간을 직접 학습',
        kind: 'equation',
        page: 3,
        label: 'Contrastive loss',
        summary:
          'positive pair는 embedding distance를 줄이고, negative pair는 margin 밖으로 밀어내는 방식으로 verification에 필요한 metric space를 직접 학습한다.',
        formula: String.raw`L=yD^2+(1-y)\max(0,m-D)^2`,
        keywords: ['contrastive loss', 'margin', 'metric learning'],
      },
    ]),
  },
  {
    pattern: /Siamese Neural Networks for One-shot Image Recognition/i,
    blocks: evidence([
      {
        id: 'koch-one-shot-siamese',
        title: 'Few-shot recognition을 pairwise similarity로 재정식화',
        kind: 'algorithm',
        page: 2,
        label: 'One-shot protocol',
        summary:
          '새 class classifier를 다시 학습하지 않고 support image와 query image의 similarity score를 비교해 one-shot classification을 수행한다.',
        formula: String.raw`\operatorname{score}(x,x_i)=\sigma(g(|f_\theta(x)-f_\theta(x_i)|))`,
        keywords: ['one-shot learning', 'Siamese network', 'support set'],
      },
    ]),
  },
  {
    pattern: /Improving Language Understanding by Generative Pre-Training|Generative Pre-Training/i,
    blocks: evidence([
      {
        id: 'gpt-generative-pretraining',
        title: 'GPT: causal LM pretraining 후 task fine-tuning',
        kind: 'algorithm',
        page: 2,
        label: 'Pretrain-finetune',
        summary:
          '대규모 unlabeled text에서 다음 token 예측으로 일반 언어 표현을 먼저 학습하고, downstream task supervised objective와 결합해 fine-tuning한다.',
        formula: String.raw`\max_\theta\sum_t\log p_\theta(x_t\mid x_{<t}),\qquad \mathcal L=\mathcal L_{\mathrm{task}}+\lambda\mathcal L_{\mathrm{LM}}`,
        keywords: ['GPT', 'causal language modeling', 'pretraining', 'fine-tuning'],
      },
    ]),
  },
  {
    pattern: /Sinkhorn.*Doubly Stochastic|nonnegative matrices and doubly stochastic/i,
    blocks: evidence([
      {
        id: 'sinkhorn-knopp-scaling',
        title: 'Sinkhorn-Knopp: 행/열 정규화 반복',
        kind: 'algorithm',
        page: 1,
        label: 'Matrix scaling',
        summary:
          '양의 행렬을 행 합과 열 합이 정해진 doubly-stochastic 형태로 만들기 위해 row scaling과 column scaling을 반복한다. SwAV balanced assignment의 수학적 기반이다.',
        formula: String.raw`K\leftarrow \operatorname{diag}(1/(K\mathbf 1))K,\qquad K\leftarrow K\operatorname{diag}(1/(K^\top\mathbf 1))`,
        keywords: ['Sinkhorn-Knopp', 'matrix scaling', 'doubly stochastic'],
      },
    ]),
  },
  {
    pattern: /Sinkhorn Distances|Optimal Transport/i,
    blocks: evidence([
      {
        id: 'cuturi-entropic-ot',
        title: 'Entropic OT와 Sinkhorn distance',
        kind: 'equation',
        page: 3,
        label: 'Entropic OT',
        summary:
          'Optimal transport 목적에 entropy regularization을 더하면 Sinkhorn 반복으로 빠르게 transport plan을 근사할 수 있다. SSL에서는 balanced assignment와 clustering 해석의 기반으로 자주 연결된다.',
        formula: String.raw`\min_{P\in U(a,b)}\langle P,C\rangle-\epsilon H(P),\qquad P=\operatorname{diag}(u)K\operatorname{diag}(v)`,
        keywords: ['optimal transport', 'entropic regularization', 'Sinkhorn distance'],
      },
    ]),
  },
  {
    pattern: /TransNet|Full Attention Network for CSI Feedback/i,
    blocks: evidence([
      {
        id: 'transnet-full-attention-csi',
        title: 'TransNet: CNN 수용영역 한계를 self-attention으로 대체',
        kind: 'architecture',
        page: 3,
        label: 'Full attention',
        summary:
          'CSI 행렬의 멀리 떨어진 안테나/주파수 위치 간 상관관계를 직접 모델링하기 위해 multi-head self-attention을 CSI feedback encoder-decoder에 적용한다.',
        formula: String.raw`\operatorname{Attention}(Q,K,V)=\operatorname{softmax}(QK^\top/\sqrt{d_k})V`,
        keywords: ['TransNet', 'self-attention', 'CSI feedback', 'long-range dependency'],
      },
    ]),
  },
  {
    pattern: /ENet|Lightweight Deep Network for Efficient CSI Feedback/i,
    blocks: evidence([
      {
        id: 'enet-asymmetric-csi-feedback',
        title: 'ENet: UE는 가볍게, BS는 강하게 설계',
        kind: 'architecture',
        page: 2,
        label: 'Efficient CSI feedback',
        summary:
          'ENet은 모바일 UE의 계산 제약을 반영해 encoder를 가볍게 두고, 상대적으로 자원이 많은 BS decoder가 복원 품질을 담당하도록 설계한 효율 중심 CSI feedback 모델이다.',
        keyPoints: [
          '비대칭 encoder-decoder 설계가 deployment 관점의 핵심이다.',
          '성능 비교에서는 NMSE뿐 아니라 UE-side FLOPs와 parameter 수를 함께 봐야 한다.',
        ],
        keywords: ['ENet', 'lightweight encoder', 'asymmetric autoencoder', 'CSI feedback'],
      },
    ]),
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
  const arxivKey = paper.arxiv_id?.replace(/v\d+$/i, '');
  if (arxivKey && EVIDENCE_BY_ARXIV[arxivKey]) return EVIDENCE_BY_ARXIV[arxivKey];

  const titleMatch = EVIDENCE_BY_TITLE.find(({ pattern }) => pattern.test(paper.title));
  if (titleMatch) return titleMatch.blocks;

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
