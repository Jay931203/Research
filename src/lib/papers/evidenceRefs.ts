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
    quote: 'parameter efficiency, while lightweight routers enable adaptive token-level thinking',
    rects: [{ x: 0.1, y: 0.18, width: 0.8, height: 0.26 }],
    keywords: ['parameter sharing', 'adaptive computation', 'token-level thinking'],
  },
  {
    id: 'mor-recursive-transformer',
    title: 'Recursive Transformer 기반',
    kind: 'architecture',
    page: 3,
    label: 'Sec. 2.1',
    summary:
      '기본 Transformer는 L개의 서로 다른 layer를 쌓지만, Recursive Transformer는 공유 parameter pool을 recursion block으로 반복 적용한다. 이 구조가 MoR의 parameter efficiency 기반이다.',
    quote: 'reduce parameter count by reusing layers across depth',
    rects: [{ x: 0.09, y: 0.32, width: 0.82, height: 0.35 }],
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
    quote: 'Architectural components of Mixture-of-Recursions',
    rects: [{ x: 0.08, y: 0.08, width: 0.84, height: 0.28 }],
    keywords: ['expert-choice', 'token-choice', 'KV caching'],
  },
  {
    id: 'mor-routing-strategies',
    title: 'Expert-choice vs Token-choice routing',
    kind: 'algorithm',
    page: 4,
    label: 'Sec. 2.2.1',
    summary:
      'Expert-choice는 각 recursion depth를 expert처럼 보고 top-k token을 선택한다. 계산 budget을 정적으로 맞추기 쉽지만 causal language modeling에서는 미래 token 정보가 섞일 수 있다. Token-choice는 각 token이 처음부터 자신의 recursion depth를 정해 leakage를 피한다.',
    quote: 'Routing Strategies: Expert-choice vs. Token-choice',
    rects: [{ x: 0.1, y: 0.5, width: 0.82, height: 0.34 }],
    keywords: ['top-k routing', 'causality', 'load balancing'],
  },
  {
    id: 'mor-caching-table',
    title: 'KV cache 전략과 비용 비교',
    kind: 'algorithm',
    page: 5,
    label: 'Table 2',
    summary:
      'Recursion-wise caching은 현재 recursion에서 살아남은 token의 KV만 저장한다. Recursive sharing은 첫 recursion의 KV를 이후 recursion에서 공유한다. Table 2는 KV memory, cache IO, attention FLOPs를 vanilla 대비 상대 비용으로 정리한다.',
    quote: 'KV Memory',
    rects: [{ x: 0.08, y: 0.08, width: 0.84, height: 0.22 }],
    keywords: ['KV memory', 'cache IO', 'attention FLOPs'],
  },
  {
    id: 'mor-main-results',
    title: '주요 실험표: Vanilla/Recursive/MoR 비교',
    kind: 'result',
    page: 6,
    label: 'Table 3',
    summary:
      'Table 3은 fixed FLOPs와 fixed token 조건에서 Vanilla, Recursive, MoR을 비교한다. MoR은 더 작은 non-embedding parameter 수를 사용하면서 validation NLL과 few-shot accuracy에서 recursive baseline보다 강한 결과를 보인다.',
    quote: 'Comparison of MoR, Recursive, and Vanilla Transformers',
    rects: [{ x: 0.07, y: 0.07, width: 0.86, height: 0.72 }],
    keywords: ['isoFLOP', 'NLL', 'few-shot accuracy'],
  },
  {
    id: 'mor-isoflop',
    title: 'IsoFLOP scaling 해석',
    kind: 'result',
    page: 7,
    label: 'Fig. 3 / Sec. 3.2',
    summary:
      'Figure 3은 네 model scale과 세 compute budget에서 validation loss를 비교한다. MoR은 작은 135M scale에서는 bottleneck이 있지만, 360M 이상에서는 vanilla와 비슷하거나 더 나은 loss를 보이며 recursive baseline을 꾸준히 앞선다.',
    quote: 'MoR consistently outperforms recursive baselines',
    rects: [
      { x: 0.07, y: 0.07, width: 0.86, height: 0.29 },
      { x: 0.07, y: 0.44, width: 0.86, height: 0.18 },
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
      'Figure 4는 throughput Pareto frontier, parameter sharing strategy, KV sharing ablation을 함께 보여준다. 논문은 Middle-Cycle이 가장 안정적인 sharing 전략이며, KV sharing은 throughput과 memory 측면의 실용성을 보완한다고 해석한다.',
    quote: 'Middle-Cycle is the most effective',
    rects: [
      { x: 0.07, y: 0.08, width: 0.86, height: 0.32 },
      { x: 0.08, y: 0.45, width: 0.5, height: 0.16 },
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
