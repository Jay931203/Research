#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const initialPath = path.join(root, 'public', 'data', 'initial-papers.json');
const glossaryPath = path.join(root, 'public', 'data', 'glossary.json');

const COLOR = '#0f766e';

function eq(name, latex, description) {
  return { name, latex, description };
}

const FAMILY = {
  siamese: {
    motivation: '쌍의 유사도를 직접 학습해 검증/소량학습 문제를 풀려는 접근.',
    contributions: [
      '공유 인코더 기반 pairwise metric 학습',
      '거리 임계값 검증 프레임워크 정립',
      '후속 contrastive 계열 기반 제공',
    ],
    steps: ['입력 쌍 생성', '공유 인코더 임베딩', '거리 계산', 'contrastive 목적 최적화', '임계값 판정'],
    equations: [
      eq('거리', 'd=\\|f(x_1)-f(x_2)\\|_2', '임베딩 공간 유사도'),
      eq('Contrastive Loss', 'L=yd^2+(1-y)\\max(0,m-d)^2', '양성/음성 분리'),
    ],
  },
  cpc: {
    motivation: '미래 예측 가능한 표현을 자기지도로 학습.',
    contributions: ['InfoNCE 제안', 'MI 하한 연결', '모달리티 전반 실증'],
    steps: ['z_t 추출', 'context c_t 구성', '미래 샘플 점수화', 'InfoNCE 학습', '전이 평가'],
    equations: [
      eq('InfoNCE', 'L=-\\log\\frac{e^{s(c,z^+)}}{e^{s(c,z^+)}+\\sum_j e^{s(c,z_j^-)}}', '양성 상대확률 최대화'),
      eq('MI Bound', 'I(x;c)\\ge\\log N-L_{NCE}', '정보량 하한'),
    ],
  },
  moco: {
    motivation: '대배치 없이도 큰 음성 집합을 유지하는 contrastive 학습.',
    contributions: ['EMA key encoder', 'queue dictionary', '실용 하드웨어 효율'],
    steps: ['q/k 생성', 'EMA 업데이트', 'queue 음성 조회', 'InfoNCE 학습', 'FIFO 갱신'],
    equations: [
      eq('MoCo Loss', 'L=-\\log\\frac{e^{q\\cdot k^+/\\tau}}{e^{q\\cdot k^+/\\tau}+\\sum_i e^{q\\cdot k_i^-/\\tau}}', 'contrastive objective'),
      eq('EMA', '\\theta_k\\leftarrow m\\theta_k+(1-m)\\theta_q', 'target 안정화'),
    ],
  },
  simclr: {
    motivation: '단순한 구조로 강력한 contrastive 성능 확보.',
    contributions: ['강한 증강 조합', 'projection head 효과', 'NT-Xent 표준화'],
    steps: ['두 뷰 생성', '공유 인코더+projector', '양성/음성 구성', 'NT-Xent 최적화', '전이 평가'],
    equations: [
      eq('NT-Xent', '\\ell_{i,j}=-\\log\\frac{e^{sim(z_i,z_j)/\\tau}}{\\sum_{k\\neq i}e^{sim(z_i,z_k)/\\tau}}', '양성 정렬'),
      eq('Batch Loss', 'L=\\frac{1}{2N}\\sum_i(\\ell_{2i-1,2i}+\\ell_{2i,2i-1})', '양방향 학습'),
    ],
  },
  byol: {
    motivation: 'negative-free SSL에서 collapse를 막는 구조 탐색.',
    contributions: ['EMA teacher-student', 'predictor+stop-gradient', 'non-contrastive 성능 입증'],
    steps: ['두 뷰 생성', 'online prediction', 'target representation', 'cosine 정렬', 'EMA teacher 갱신'],
    equations: [
      eq('BYOL Loss', 'L=2-2\\frac{p_\\theta(v)\\cdot z_\\xi(v\\\')}{\\|p_\\theta(v)\\|\\|z_\\xi(v\\\')\\|}', '정렬 손실'),
      eq('Teacher EMA', '\\xi\\leftarrow\\tau\\xi+(1-\\tau)\\theta', '느린 타깃 갱신'),
    ],
  },
  swav: {
    motivation: '음성 샘플 의존을 줄인 클러스터 할당 기반 SSL.',
    contributions: ['swapped prediction', 'Sinkhorn balanced assignment', '고효율 학습'],
    steps: ['다중 뷰 특징', '프로토타입 점수', 'Sinkhorn 할당', '뷰 간 교차 예측', '공동 갱신'],
    equations: [
      eq('Swapped Loss', 'L=\\sum_{(s,t)}\\ell(q_s,p_t)', '할당 일관성'),
      eq('Balanced Assignment', 'Q^*=\\arg\\max_Q Tr(Q^\\top C^\\top Z)+\\epsilon H(Q)', '균형 제약'),
    ],
  },
  sinkhorn: {
    motivation: '행/열 제약이 있는 확률 할당의 빠른 계산.',
    contributions: ['행/열 교대 정규화', '수렴 성질 정리', 'OT/SSL 기반 제공'],
    steps: ['행렬 초기화', '행 정규화', '열 정규화', '교대 반복', '수렴 판정'],
    equations: [
      eq('Row Normalize', 'K\\leftarrow diag(1/(K\\mathbf{1}))K', '행 합 제약'),
      eq('Col Normalize', 'K\\leftarrow Kdiag(1/(K^\\top\\mathbf{1}))', '열 합 제약'),
    ],
  },
  simsiam: {
    motivation: '구조를 극단적으로 단순화한 non-contrastive SSL 검증.',
    contributions: ['momentum 제거', 'stop-gradient 핵심성', '간단한 고성능 기준선'],
    steps: ['두 뷰 생성', '공유 인코더', 'predictor 한쪽만 적용', 'stop-gradient', '대칭 정렬'],
    equations: [
      eq('SimSiam Loss', 'L=-\\frac{1}{2}(\\frac{p_1\\cdot sg(z_2)}{\\|p_1\\|\\|z_2\\|}+\\frac{p_2\\cdot sg(z_1)}{\\|p_2\\|\\|z_1\\|})', '대칭 정렬'),
      eq('Stop-Gradient', '\\partial sg(z)/\\partial z=0', '역전파 차단'),
    ],
  },
  barlow: {
    motivation: '음성 없이도 중복 억제로 collapse를 막는 목적 설계.',
    contributions: ['교차상관 기반 objective', 'invariance+redundancy reduction', 'non-contrastive 축 강화'],
    steps: ['두 뷰 특징', '교차상관 계산', '대각=1 유도', '비대각=0 페널티', '공동 학습'],
    equations: [
      eq('Correlation', 'C_{ij}=\\frac{\\sum_b z_{b,i}^A z_{b,j}^B}{\\sqrt{\\sum_b(z_{b,i}^A)^2}\\sqrt{\\sum_b(z_{b,j}^B)^2}}', '특징 상관'),
      eq('Barlow Loss', 'L=\\sum_i(1-C_{ii})^2+\\lambda\\sum_{i\\neq j}C_{ij}^2', '중복 억제'),
    ],
  },
  dino: {
    motivation: 'ViT에서 self-distillation으로 강한 표현과 attention 특성 확보.',
    contributions: ['EMA teacher-student ViT SSL', 'centering/sharpening 안정화', 'emergent attention 분석'],
    steps: ['multi-crop 뷰', 'student/teacher forward', 'teacher 분포 안정화', 'cross-entropy distillation', 'EMA 업데이트'],
    equations: [
      eq('DINO Loss', 'L=\\sum_{v\\in V_s}\\sum_{u\\in V_t}H(sg(p_t^u),p_s^v)', 'teacher 분포 모방'),
      eq('Teacher Prob', 'p_t=softmax((g_t(x)-c)/T_t)', 'temperature/center 조절'),
    ],
  },
  transformer: {
    motivation: 'RNN 병목 없이 전역 의존성 학습.',
    contributions: ['self-attention 중심 구조', 'multi-head attention', '병렬성/장기의존성 향상'],
    steps: ['토큰+위치 임베딩', 'MHA+FFN 블록 반복', '잔차/정규화', '인코더-디코더 연결', '오토리그레시브 디코딩'],
    equations: [
      eq('Attention', 'Attention(Q,K,V)=softmax(QK^T/\\sqrt{d_k})V', '전역 관계 추출'),
      eq('MHA', 'MHA=Concat(head_1,...,head_h)W^O', '다중 서브공간'),
    ],
  },
  gpt: {
    motivation: '생성형 사전학습 후 전이학습으로 저라벨 문제 해결.',
    contributions: ['causal LM 사전학습', '범용 미세조정 패턴', '현대 LLM 계보 시작'],
    steps: ['LM 사전학습', '태스크 포맷팅', '가중치 전이', '미세조정', '전이 평가'],
    equations: [
      eq('Causal LM', '\\max_\\theta\\sum_t\\log p_\\theta(x_t|x_{<t})', '다음 토큰 예측'),
      eq('Fine-tune', 'L=L_{task}+\\lambda L_{LM}', '전이 안정화'),
    ],
  },
  bert: {
    motivation: '양방향 문맥 표현을 사전학습으로 확보.',
    contributions: ['MLM+NSP 도입', '양방향 Transformer 사전학습', 'NLP 성능 대폭 향상'],
    steps: ['토큰화/마스킹', 'MLM/NSP 동시 학습', '사전학습 가중치 전이', '태스크 헤드 미세조정', '벤치마크 평가'],
    equations: [
      eq('MLM', '\\max_\\theta\\sum_{i\\in M}\\log p_\\theta(x_i|x_{\\setminus M})', '마스크 복원'),
      eq('Joint Loss', 'L=L_{MLM}+L_{NSP}', '복합 목표'),
    ],
  },
  mae: {
    motivation: '비전에서 고마스킹 복원형 SSL을 효율적으로 확장.',
    contributions: ['비대칭 encoder-decoder', '고마스킹 비율', '강한 ViT 전이성능'],
    steps: ['패치 마스킹', 'visible patch encoder', 'decoder 복원', '마스크 영역 손실', '전이 미세조정'],
    equations: [
      eq('MAE Loss', 'L=\\frac{1}{|M|}\\sum_{i\\in M}\\|\\hat{x}_i-x_i\\|_2^2', '마스크 영역 복원'),
      eq('Mask Ratio', 'r=|M|/N_{patch}', '마스킹 강도'),
    ],
  },
  vit: {
    motivation: '이미지를 토큰 시퀀스로 바꿔 Transformer를 비전에 직접 적용.',
    contributions: ['patch embedding 정립', '순수 Transformer 비전 적용', '후속 ViT-SSL 기반 제공'],
    steps: ['이미지 패치화', '선형 임베딩', 'CLS+위치 임베딩', 'Transformer encoder', '분류 헤드'],
    equations: [
      eq('Patch Tokens', 'z_0=[x_{cls};x_p^1E;...;x_p^NE]+E_{pos}', '패치 토큰 입력'),
      eq('Block', 'z_l^\\prime=MSA(LN(z_{l-1}))+z_{l-1},\\ z_l=MLP(LN(z_l^\\prime))+z_l^\\prime', '표준 블록'),
    ],
  },
};

const entries = [
  ['Signature Verification using a "Siamese" Time Delay Neural Network', 1993, 'NeurIPS 1993', ['Jane Bromley', 'Yann LeCun', 'et al.'], 'https://proceedings.neurips.cc/paper_files/paper/1993/file/288cc0ff022877bd3df94bc9360b9c5d-Paper.pdf', '', 'siamese', ['siamese']],
  ['Learning a Similarity Metric Discriminatively, with Application to Face Verification', 2005, 'CVPR 2005', ['Sumit Chopra', 'Raia Hadsell', 'Yann LeCun'], 'https://yann.lecun.com/exdb/publis/pdf/chopra-05.pdf', '', 'siamese', ['face-verification']],
  ['Siamese Neural Networks for One-shot Image Recognition', 2015, 'ICML Deep Learning Workshop 2015', ['Gregory Koch', 'Richard Zemel', 'Ruslan Salakhutdinov'], 'https://www.cs.toronto.edu/~rsalakhu/papers/oneshot1.pdf', '', 'siamese', ['few-shot']],
  ['Representation Learning with Contrastive Predictive Coding', 2018, 'arXiv', ['Aaron van den Oord', 'Yazhe Li', 'Oriol Vinyals'], 'https://arxiv.org/pdf/1807.03748.pdf', '', 'cpc', ['cpc', 'infonce']],
  ['Momentum Contrast for Unsupervised Visual Representation Learning', 2020, 'CVPR 2020', ['Kaiming He', 'Haoqi Fan', 'Yuxin Wu', 'Saining Xie', 'Ross Girshick'], 'https://arxiv.org/pdf/1911.05722.pdf', 'https://github.com/facebookresearch/moco', 'moco', ['moco']],
  ['A Simple Framework for Contrastive Learning of Visual Representations', 2020, 'ICML 2020', ['Ting Chen', 'Simon Kornblith', 'Mohammad Norouzi', 'Geoffrey Hinton'], 'https://arxiv.org/pdf/2002.05709.pdf', 'https://github.com/google-research/simclr', 'simclr', ['simclr']],
  ['Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning', 2020, 'NeurIPS 2020', ['Jean-Bastien Grill', 'et al.'], 'https://arxiv.org/pdf/2006.07733.pdf', 'https://github.com/deepmind/deepmind-research/tree/master/byol', 'byol', ['byol']],
  ['Unsupervised Learning of Visual Features by Contrasting Cluster Assignments', 2020, 'NeurIPS 2020', ['Mathilde Caron', 'et al.'], 'https://arxiv.org/pdf/2006.09882.pdf', 'https://github.com/facebookresearch/swav', 'swav', ['swav', 'sinkhorn']],
  ['Concerning Nonnegative Matrices and Doubly Stochastic Matrices', 1967, 'Pacific Journal of Mathematics', ['Richard Sinkhorn', 'Paul Knopp'], 'https://projecteuclid.org/journals/pacific-journal-of-mathematics/volume-21/issue-2/Concerning-nonnegative-matrices-and-doubly-stochastic-matrices/pjm/1102992505.pdf', '', 'sinkhorn', ['sinkhorn']],
  ['Sinkhorn Distances: Lightspeed Computation of Optimal Transport', 2013, 'NeurIPS 2013', ['Marco Cuturi'], 'https://arxiv.org/pdf/1306.0895.pdf', '', 'sinkhorn', ['optimal-transport']],
  ['Exploring Simple Siamese Representation Learning', 2021, 'CVPR 2021', ['Xinlei Chen', 'Kaiming He'], 'https://arxiv.org/pdf/2011.10566.pdf', 'https://github.com/facebookresearch/simsiam', 'simsiam', ['simsiam']],
  ['Barlow Twins: Self-Supervised Learning via Redundancy Reduction', 2021, 'ICML 2021', ['Jure Zbontar', 'et al.'], 'https://arxiv.org/pdf/2103.03230.pdf', '', 'barlow', ['barlow-twins']],
  ['Emerging Properties in Self-Supervised Vision Transformers', 2021, 'ICCV 2021', ['Mathilde Caron', 'et al.'], 'https://arxiv.org/pdf/2104.14294.pdf', 'https://github.com/facebookresearch/dino', 'dino', ['dino']],
  ['Attention Is All You Need', 2017, 'NeurIPS 2017', ['Ashish Vaswani', 'et al.'], 'https://arxiv.org/pdf/1706.03762.pdf', '', 'transformer', ['transformer']],
  ['Improving Language Understanding by Generative Pre-Training', 2018, 'OpenAI Technical Report', ['Alec Radford', 'Karthik Narasimhan', 'Tim Salimans', 'Ilya Sutskever'], 'https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf', 'https://github.com/openai/finetune-transformer-lm', 'gpt', ['gpt']],
  ['BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', 2019, 'NAACL 2019', ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'], 'https://arxiv.org/pdf/1810.04805.pdf', 'https://github.com/google-research/bert', 'bert', ['bert', 'mlm']],
  ['Masked Autoencoders Are Scalable Vision Learners', 2022, 'CVPR 2022', ['Kaiming He', 'Xinlei Chen', 'Saining Xie', 'Yanghao Li', 'Piotr Dollár', 'Ross Girshick'], 'https://arxiv.org/pdf/2111.06377.pdf', 'https://github.com/facebookresearch/mae', 'mae', ['mae']],
  ['An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale', 2021, 'ICLR 2021', ['Alexey Dosovitskiy', 'et al.'], 'https://arxiv.org/pdf/2010.11929.pdf', 'https://github.com/google-research/vision_transformer', 'vit', ['vit']],
];

function buildPaper(entry) {
  const [title, year, venue, authors, pdf_url, code_url, familyKey, tags] = entry;
  const family = FAMILY[familyKey];
  const abstract = `${title}는 ${family.motivation} 문제를 중심으로 ${family.contributions[0]}를 제시하고, ${family.contributions[1]}를 통해 성능/안정성을 개선했다.`;
  return {
    title,
    authors,
    year,
    venue,
    abstract,
    key_contributions: family.contributions,
    algorithms: family.steps,
    key_equations: family.equations,
    category: 'representation_learning',
    tags: ['representation_learning', ...tags],
    pdf_url,
    code_url: code_url || undefined,
    color_hex: COLOR,
    architecture_detail: [
      '## 1) Motivation',
      family.motivation,
      '',
      '## 2) 학습 흐름',
      ...family.steps.map((step, idx) => `${idx + 1}. ${step}`),
      '',
      '## 3) 핵심 수식',
      ...family.equations.flatMap((item) => ['- **' + item.name + '**', '$$', item.latex, '$$', item.description, '']),
      '## 4) 리마인드',
      family.contributions[2],
    ].join('\n'),
    difficulty_level: 'intermediate',
  };
}

const linkRows = [
  ['Learning a Similarity Metric Discriminatively, with Application to Face Verification', 'Signature Verification using a "Siamese" Time Delay Neural Network', 'builds_on', 9],
  ['Siamese Neural Networks for One-shot Image Recognition', 'Learning a Similarity Metric Discriminatively, with Application to Face Verification', 'builds_on', 8],
  ['Representation Learning with Contrastive Predictive Coding', 'Siamese Neural Networks for One-shot Image Recognition', 'related', 6],
  ['Momentum Contrast for Unsupervised Visual Representation Learning', 'Representation Learning with Contrastive Predictive Coding', 'builds_on', 10],
  ['A Simple Framework for Contrastive Learning of Visual Representations', 'Representation Learning with Contrastive Predictive Coding', 'builds_on', 10],
  ['Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning', 'Momentum Contrast for Unsupervised Visual Representation Learning', 'challenges', 8],
  ['Exploring Simple Siamese Representation Learning', 'Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning', 'builds_on', 9],
  ['Barlow Twins: Self-Supervised Learning via Redundancy Reduction', 'Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning', 'related', 8],
  ['Unsupervised Learning of Visual Features by Contrasting Cluster Assignments', 'Concerning Nonnegative Matrices and Doubly Stochastic Matrices', 'applies', 9],
  ['Unsupervised Learning of Visual Features by Contrasting Cluster Assignments', 'Sinkhorn Distances: Lightspeed Computation of Optimal Transport', 'builds_on', 8],
  ['Emerging Properties in Self-Supervised Vision Transformers', 'Unsupervised Learning of Visual Features by Contrasting Cluster Assignments', 'builds_on', 8],
  ['Improving Language Understanding by Generative Pre-Training', 'Attention Is All You Need', 'builds_on', 10],
  ['BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', 'Attention Is All You Need', 'builds_on', 10],
  ['An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale', 'Attention Is All You Need', 'builds_on', 10],
  ['Masked Autoencoders Are Scalable Vision Learners', 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale', 'builds_on', 10],
  ['Masked Autoencoders Are Scalable Vision Learners', 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', 'inspired_by', 9],
  ['Emerging Properties in Self-Supervised Vision Transformers', 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale', 'builds_on', 9],
];

const glossaryAdds = [
  ['self-supervised-learning', 'Self-Supervised Learning', ['SSL', '자기지도학습'], 'training', 'representation_learning', '라벨 없이 데이터 자체에서 감독 신호를 만들어 표현을 학습하는 방법.', ['Representation Learning', 'Self-Supervised Learning'], ['Representation Learning with Contrastive Predictive Coding', 'Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning', 'Masked Autoencoders Are Scalable Vision Learners']],
  ['contrastive-learning', 'Contrastive Learning', ['대조학습'], 'technique', 'contrastive_ssl', '양성은 가깝게, 음성은 멀게 학습하는 표현학습 기법.', ['Representation Learning', 'Contrastive SSL'], ['A Simple Framework for Contrastive Learning of Visual Representations', 'Momentum Contrast for Unsupervised Visual Representation Learning']],
  ['infonce', 'InfoNCE', ['NCE Loss'], 'metric', 'contrastive_ssl', '양성 상대확률을 최대화하는 contrastive 목적함수.', ['Representation Learning', 'Contrastive SSL', 'Objective'], ['Representation Learning with Contrastive Predictive Coding', 'A Simple Framework for Contrastive Learning of Visual Representations', 'Momentum Contrast for Unsupervised Visual Representation Learning']],
  ['momentum-encoder', 'Momentum Encoder', ['EMA Teacher'], 'architecture', 'contrastive_ssl', 'EMA로 타깃 인코더를 느리게 갱신해 목표 분포를 안정화하는 구조.', ['Representation Learning', 'Teacher-Student'], ['Momentum Contrast for Unsupervised Visual Representation Learning', 'Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning', 'Emerging Properties in Self-Supervised Vision Transformers']],
  ['stop-gradient', 'Stop-Gradient', ['sg'], 'training', 'contrastive_ssl', '특정 분기의 역전파를 차단해 collapse를 완화하는 연산.', ['Representation Learning', 'Optimization Tricks'], ['Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning', 'Exploring Simple Siamese Representation Learning']],
  ['swav', 'SwAV', ['Swapped Assignments'], 'technique', 'contrastive_ssl', '클러스터 할당을 뷰 간 교차 예측하는 SSL.', ['Representation Learning', 'Contrastive SSL', 'Clustering'], ['Unsupervised Learning of Visual Features by Contrasting Cluster Assignments']],
  ['sinkhorn-knopp', 'Sinkhorn-Knopp', ['Sinkhorn Iteration'], 'technique', 'optimization_foundation', '행/열 정규화를 교대로 반복해 doubly-stochastic 행렬을 구하는 알고리즘.', ['Optimization', 'Matrix Scaling'], ['Concerning Nonnegative Matrices and Doubly Stochastic Matrices', 'Unsupervised Learning of Visual Features by Contrasting Cluster Assignments']],
  ['optimal-transport', 'Optimal Transport', ['OT'], 'metric', 'optimization_foundation', '두 분포 사이 질량 이동 비용을 최소화하는 최적화 프레임워크.', ['Optimization', 'Distribution Matching'], ['Sinkhorn Distances: Lightspeed Computation of Optimal Transport', 'Unsupervised Learning of Visual Features by Contrasting Cluster Assignments']],
  ['masked-language-modeling', 'Masked Language Modeling', ['MLM'], 'training', 'reconstruction_ssl', '일부 토큰을 가리고 복원하도록 학습하는 자기지도 목표.', ['Representation Learning', 'Reconstruction SSL'], ['BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding']],
  ['masked-autoencoding', 'Masked Autoencoding', ['MAE pretraining'], 'training', 'reconstruction_ssl', '입력 패치를 마스킹하고 복원하는 비전 자기지도 기법.', ['Representation Learning', 'Reconstruction SSL'], ['Masked Autoencoders Are Scalable Vision Learners']],
  ['autoregressive-pretraining', 'Autoregressive Pretraining', ['causal LM'], 'training', 'transformer_pretraining', '이전 토큰만 보고 다음 토큰을 예측하는 생성형 사전학습.', ['Representation Learning', 'Transformer Pretraining'], ['Improving Language Understanding by Generative Pre-Training']],
  ['vision-transformer', 'Vision Transformer', ['ViT'], 'architecture', 'transformer_pretraining', '이미지를 패치 토큰으로 변환해 Transformer encoder로 처리하는 구조.', ['Architecture', 'Transformer Family'], ['An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale', 'Masked Autoencoders Are Scalable Vision Learners', 'Emerging Properties in Self-Supervised Vision Transformers']],
];

function ensureTermSet(term) {
  if (term.term_set) return term.term_set;
  const text = `${term.id} ${term.name} ${(term.hierarchy ?? []).join(' ')} ${(term.related_paper_titles ?? []).join(' ')}`.toLowerCase();
  if (/quant|bit|vq|awq|gptq|int8/.test(text)) return 'csi_quantization';
  if (/optimization|lagrangian|kkt|monotone/.test(text)) return 'optimization_foundation';
  return 'csi_core';
}

function updateInitialData() {
  const data = JSON.parse(fs.readFileSync(initialPath, 'utf8'));
  const paperKeys = new Set(data.papers.map((p) => `${p.title.toLowerCase()}::${p.year}`));
  let addedPapers = 0;

  for (const entry of entries) {
    const paper = buildPaper(entry);
    const key = `${paper.title.toLowerCase()}::${paper.year}`;
    if (paperKeys.has(key)) continue;
    data.papers.push(paper);
    paperKeys.add(key);
    addedPapers += 1;
  }

  const relKey = (r) => `${r.from_title.toLowerCase()}::${r.to_title.toLowerCase()}::${r.relationship_type}`;
  const relKeys = new Set(data.relationships.map(relKey));
  let addedRelationships = 0;
  for (const [from_title, to_title, relationship_type, strength] of linkRows) {
    const row = {
      from_title,
      to_title,
      relationship_type,
      description: 'representation learning 계열 핵심 연결',
      strength,
    };
    const key = relKey(row);
    if (relKeys.has(key)) continue;
    data.relationships.push(row);
    relKeys.add(key);
    addedRelationships += 1;
  }

  fs.writeFileSync(initialPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return { addedPapers, addedRelationships, totalPapers: data.papers.length, totalRelationships: data.relationships.length };
}

function updateGlossary() {
  const data = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
  const normalized = data.map((term) => ({ ...term, term_set: ensureTermSet(term) }));
  const map = new Map(normalized.map((term) => [term.id, term]));

  for (const [id, name, aliases, category, term_set, description, hierarchy, related] of glossaryAdds) {
    map.set(id, {
      id,
      name,
      aliases,
      category,
      term_set,
      description,
      related_paper_titles: related,
      hierarchy,
      study_classification: {},
    });
  }

  const merged = Array.from(map.values());
  fs.writeFileSync(glossaryPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  return { addedTerms: merged.length - data.length, totalTerms: merged.length };
}

const papersSummary = updateInitialData();
const glossarySummary = updateGlossary();
console.log(JSON.stringify({ papersSummary, glossarySummary }, null, 2));
