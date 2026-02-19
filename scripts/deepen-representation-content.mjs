#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'public', 'data', 'initial-papers.json');

function eq(name, latex, description) {
  return { name, latex, description };
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function buildDetail(f) {
  return [
    '## 1) 문제 설정',
    f.problem,
    '',
    '## 2) 핵심 아이디어',
    f.core,
    '',
    '## 3) 방법 흐름',
    ...f.steps.map((s, i) => `${i + 1}. ${s}`),
    '',
    '## 4) 수식 해석 흐름',
    ...f.equationPoints.map((s) => `- ${s}`),
    '',
    '## 5) 핵심 수식 (원문 기준)',
    ...f.equations.flatMap((e) => [`- **${e.name}**`, '$$', e.latex, '$$', e.description, '']),
    '',
    '## 6) 구현 체크리스트',
    ...f.impl.map((s) => `- ${s}`),
    '',
    '## 7) 한계와 후속',
    f.limitations,
  ].join('\n');
}

const F = {
  siamese: {
    summary:
      '검증 문제를 쌍 유사도 학습으로 재정의해 분류기 대신 표현 공간의 거리를 직접 학습한다.',
    contributions: [
      'Siamese 공유가중치 구조 정립',
      '검증 과제를 거리 학습으로 정식화',
      '양성/음성 쌍 기반 손실 설계',
      '임계값 기반 운영 절차 제시',
      '대규모 클래스 환경의 확장성 확보',
      '후속 contrastive/few-shot 흐름 기반 제공',
    ],
    steps: [
      'pair 샘플 구성(동일/상이)',
      '공유 인코더 임베딩 생성',
      '거리/유사도 계산',
      '대조 손실 최적화',
      '임계값 캘리브레이션',
      '검증 지표(ROC/EER) 평가',
    ],
    equations: [
      eq('Distance', 'd=\\|f_\\theta(x_1)-f_\\theta(x_2)\\|_2', '두 샘플 임베딩 거리를 측정한다.'),
      eq('Contrastive Loss', 'L=yd^2+(1-y)\\max(0,m-d)^2', '양성은 밀집, 음성은 margin 분리한다.'),
    ],
    problem:
      '클래스 수가 계속 늘어나는 검증 문제에서 다중분류 방식은 비효율적이고 재학습 비용이 크다.',
    core:
      '같은 인코더를 두 입력에 적용해 비교 가능한 임베딩을 만들고, 거리 기반 의사결정을 수행한다.',
    equationPoints: [
      'distance 식은 표현 품질을 직접 최적화 대상으로 만든다.',
      'contrastive loss의 음성항은 margin 바깥 분리를 강제한다.',
    ],
    impl: [
      'pair sampling 균형이 무너지면 학습 붕괴 위험이 커진다.',
      'hard negative mining이 분리도를 빠르게 높인다.',
      'threshold는 운영 정책(FAR/FRR)과 함께 관리한다.',
      '도메인 이동 시 calibration 세트로 재보정한다.',
    ],
    limitations:
      'pair 라벨 비용이 크고 negative 설계 민감성이 높다. 이를 완화하려는 흐름이 CPC/MoCo/SimCLR로 이어졌다.',
  },
  cpc: {
    summary:
      '미래 잠재표현 예측과 InfoNCE를 결합해 라벨 없이 정보량 높은 표현을 학습한다.',
    contributions: [
      '미래예측 기반 SSL 정립',
      'InfoNCE와 MI 하한 연결',
      'context encoder 분리 설계',
      '모달리티 범용성 실증',
      'negative sampling 중요성 체계화',
      '현대 contrastive SSL 기반 제공',
    ],
    steps: [
      'local encoder로 z_t 추출',
      'context model로 c_t 생성',
      '미래 z_{t+k} score 계산',
      'positive/negative set 구성',
      'InfoNCE 최소화',
      '전이 성능 평가',
    ],
    equations: [
      eq('InfoNCE', 'L=-\\log\\frac{e^{s(c,z^+)}}{e^{s(c,z^+)}+\\sum_j e^{s(c,z_j^-)}}', '양성 상대확률을 높인다.'),
      eq('MI Lower Bound', 'I(x;c)\\ge\\log N - L_{NCE}', 'loss 감소가 MI 하한 상승으로 해석된다.'),
    ],
    problem: '라벨 없이도 의미 구조를 보존하는 표현학습 목표가 필요하다.',
    core: '현재 문맥이 미래 잠재를 맞추도록 강제해 예측 가능한 구조를 내재화한다.',
    equationPoints: ['InfoNCE 분모는 음성 대비 경쟁을 만든다.', 'MI 하한 식은 목적함수의 정보이론적 의미를 제공한다.'],
    impl: [
      'negative pool 다양성이 낮으면 shortcut 학습이 발생한다.',
      'temperature/normalization 설정이 학습 안정성에 민감하다.',
      'k-step 예측 범위가 장단기 정보 균형을 좌우한다.',
      'score 함수 파라미터화(내적/MLP)가 성능에 영향을 준다.',
    ],
    limitations:
      'negative 품질 의존성이 존재한다. MoCo는 queue, SimCLR은 large-batch로 이를 보완했다.',
  },
  moco: {
    summary:
      '모멘텀 인코더와 큐 기반 dictionary로 large-batch 없이도 강한 contrastive 학습을 달성한다.',
    contributions: [
      'EMA key encoder 도입',
      'queue dictionary로 대규모 음성 유지',
      '대배치 의존 완화',
      'target drift 안정화',
      '실용적 학습 파이프라인 제시',
      'teacher-student SSL 확장 기반 제공',
    ],
    steps: [
      '두 뷰에서 q/k 생성',
      'key encoder EMA 업데이트',
      'queue 음성 조회',
      'InfoNCE 계산',
      'enqueue/dequeue 수행',
      'query encoder 전이 사용',
    ],
    equations: [
      eq('MoCo Loss', 'L=-\\log\\frac{e^{q\\cdot k^+/\\tau}}{e^{q\\cdot k^+/\\tau}+\\sum_i e^{q\\cdot k_i^-/\\tau}}', '양성 정렬과 음성 분리를 동시에 수행한다.'),
      eq('EMA Update', '\\theta_k\\leftarrow m\\theta_k+(1-m)\\theta_q', 'key 분포를 안정화한다.'),
    ],
    problem: 'contrastive는 음성 샘플이 많이 필요해 메모리/연산 비용이 높다.',
    core: '큐를 활용해 큰 음성 집합을 유지하고 EMA 타깃으로 학습 목표를 안정화한다.',
    equationPoints: ['분모의 K개 음성이 queue에서 제공된다.', 'EMA 식이 key representation drift를 줄인다.'],
    impl: [
      'queue 크기와 temperature를 함께 튜닝해야 한다.',
      'BN 동기화/셔플 구현이 분산학습 성능에 중요하다.',
      '초기 warm-up 구간에서 불안정성을 모니터링한다.',
      'augmentation 강도가 부족하면 분별력이 낮아진다.',
    ],
    limitations:
      'queue가 과거 분포를 포함해 편향될 수 있다. SimCLR/BYOL/SimSiam이 다른 해법을 제시한다.',
  },
  simclr: {
    summary:
      '강한 증강, projection head, NT-Xent 손실의 조합으로 단순하면서도 강력한 SSL 기준선을 제시한다.',
    contributions: [
      'memory bank 없는 단순 contrastive 프레임워크',
      'NT-Xent 안정화',
      'projection head 효과 규명',
      '증강 조합 중요성 실증',
      'large-batch의 역할 분석',
      'SSL 공통 베이스라인 정립',
    ],
    steps: [
      '두 증강 뷰 생성',
      'encoder+projector 통과',
      '양성/음성 쌍 구성',
      'NT-Xent 최적화',
      'projector 제거',
      'linear/fine-tune 전이',
    ],
    equations: [
      eq('NT-Xent', '\\ell_{i,j}=-\\log\\frac{e^{sim(z_i,z_j)/\\tau}}{\\sum_{k\\neq i}e^{sim(z_i,z_k)/\\tau}}', '양성 상대확률을 최대화한다.'),
      eq('Batch Loss', 'L=\\frac{1}{2N}\\sum_i(\\ell_{2i-1,2i}+\\ell_{2i,2i-1})', '양방향 정렬을 수행한다.'),
    ],
    problem: '복잡한 메모리 구조 없이도 재현 가능한 고성능 SSL이 필요했다.',
    core: '단순한 구조 위에 데이터 증강과 손실 설계를 집중 최적화한다.',
    equationPoints: ['분모는 배치 전체를 경쟁 집합으로 사용한다.', 'temperature는 분포 sharpness를 제어한다.'],
    impl: [
      '배치 크기 부족 시 gradient accumulation으로 보완한다.',
      'color jitter/blur 조합이 핵심이다.',
      'projector 차원과 깊이가 전이 성능에 영향 준다.',
      'linear eval 프로토콜을 고정해야 공정 비교가 된다.',
    ],
    limitations:
      'large-batch 의존이 크다. MoCo의 queue 기반, BYOL의 negative-free 접근이 이를 보완한다.',
  },
  byol: {
    summary:
      'negative sample 없이도 EMA teacher-student와 predictor, stop-gradient 조합으로 강한 SSL을 달성한다.',
    contributions: [
      'negative-free SSL 가능성 입증',
      'EMA teacher 구조 정립',
      'predictor/stop-gradient 역할 제시',
      '대규모 벤치마크 성능 확보',
      'negative mining 의존도 감소',
      'SimSiam/DINO 계열 기반 제공',
    ],
    steps: ['두 뷰 생성', 'online prediction 계산', 'target representation 계산', 'stop-gradient 정렬', 'EMA 업데이트', '전이 평가'],
    equations: [
      eq('BYOL Loss', 'L=2-2\\frac{p_\\theta(v)\\cdot z_\\xi(v\\\')}{\\|p_\\theta(v)\\|\\|z_\\xi(v\\\')\\|}', 'online과 target 표현을 정렬한다.'),
      eq('Teacher EMA', '\\xi\\leftarrow\\tau\\xi+(1-\\tau)\\theta', 'target 파라미터를 느리게 추적한다.'),
    ],
    problem: 'negative quality와 대규모 음성 집합 의존성이 학습 비용을 높였다.',
    core: '비대칭 teacher-student와 stop-gradient로 positive-only 정렬 학습을 수행한다.',
    equationPoints: ['alignment loss는 cosine 정렬 신호를 제공한다.', 'EMA teacher가 학습 목표를 저주파화한다.'],
    impl: [
      'augmentation 약하면 identity shortcut 위험이 커진다.',
      'tau 스케줄이 안정성에 중요하다.',
      'predictor 차원/깊이 튜닝이 필요하다.',
      'BN 모드 설정 불일치가 재현성 문제를 만든다.',
    ],
    limitations:
      'collapse 방지 원리의 이론적 해석이 완전히 정립되진 않았다. SimSiam/VICReg가 이를 단순화/분석했다.',
  },
  swav: {
    summary:
      '클러스터 할당을 뷰 간 교차 예측하고 Sinkhorn 균형화로 collapse를 억제하는 online clustering SSL.',
    contributions: [
      'swapped assignment objective 제안',
      'prototype 기반 학습 도입',
      'Sinkhorn balanced assignment 적용',
      'negative 의존 감소',
      'multi-crop 효율 학습',
      'DINO 등 후속 ViT SSL에 영향',
    ],
    steps: ['다중 뷰 특징 추출', 'prototype logits 계산', 'Sinkhorn 균형 할당', '교차 예측 손실', 'prototype/backbone 공동 업데이트', '전이 평가'],
    equations: [
      eq('Swapped Loss', 'L=\\sum_{(s,t)}\\ell(q_s,p_t)', '뷰 간 assignment 일관성을 학습한다.'),
      eq('Balanced Assignment', 'Q^*=\\arg\\max_Q Tr(Q^\\top C^\\top Z)+\\epsilon H(Q)', '엔트로피 정규화 균형 할당을 구한다.'),
    ],
    problem: 'instance-level contrastive는 계산비용과 노이즈 민감성이 크다.',
    core: '샘플이 아닌 클러스터 할당 일관성을 학습 신호로 사용한다.',
    equationPoints: ['assignment 최적화는 OT 관점으로 해석된다.', 'swapped loss는 뷰 불변성을 강화한다.'],
    impl: [
      'prototype 수 K가 성능/안정성을 크게 좌우한다.',
      'Sinkhorn epsilon과 반복 횟수 튜닝이 중요하다.',
      'multi-crop 구성은 효율성과 성능 trade-off를 만든다.',
      'assignment entropy 모니터링으로 collapse를 조기 탐지한다.',
    ],
    limitations:
      '하이퍼파라미터 민감성이 높다. DINO는 teacher distribution 정렬로 보다 단순한 경로를 제공한다.',
  },
  sinkhorn: {
    summary:
      '행/열 교대 정규화와 엔트로피 정규화 OT를 통해 분포 할당 문제를 고속으로 근사 계산한다.',
    contributions: [
      '행렬 교대 정규화 반복 정식화',
      'doubly-stochastic 제약 해결',
      '엔트로피 정규화 OT 실용화',
      '고속 반복 계산 경로 제시',
      'OT 기반 ML 응용 확대',
      'SwAV assignment 계산 기반 제공',
    ],
    steps: ['비음수 행렬/비용행렬 구성', 'row scaling', 'column scaling', '교대 반복', '수렴 판정', '거리/할당 계산'],
    equations: [
      eq('Row Scaling', 'K\\leftarrow diag(1/(K\\mathbf{1}))K', '행합을 1로 맞춘다.'),
      eq('Entropic OT', '\\min_{P\\in U(a,b)}\\langle P,C\\rangle-\\epsilon H(P)', '정규화 OT 목적을 정의한다.'),
    ],
    problem: '정확한 OT는 계산량이 커 대규모 학습에 바로 쓰기 어렵다.',
    core: '엔트로피 정규화 + Sinkhorn 반복으로 속도와 안정성을 확보한다.',
    equationPoints: ['row/col scaling이 제약을 교대로 만족시킨다.', 'epsilon이 속도-정밀도 균형을 결정한다.'],
    impl: [
      '로그 도메인 구현으로 수치불안정을 줄인다.',
      'epsilon annealing이 초기 안정성에 유리하다.',
      '수렴 기준은 primal/dual 잔차를 함께 본다.',
      '배치 OT에서는 메모리 블록화가 필요하다.',
    ],
    limitations:
      '정규화 편향이 존재하며 epsilon 튜닝이 민감하다. 그래도 대규모 ML 응용에서는 실용성이 매우 높다.',
  },
  simsiam: {
    summary:
      'momentum encoder 없이 predictor+stop-gradient만으로 non-contrastive SSL을 단순화한 방법.',
    contributions: [
      'negative/momentum 제거한 최소 구조',
      'stop-gradient 중요성 실증',
      '구현 단순화와 고성능 균형',
      'BYOL 메커니즘 해석 촉진',
      '강력한 baseline 제공',
      '이론 연구 촉발',
    ],
    steps: ['두 뷰 생성', '공유 인코더+projector', 'predictor 적용', 'stop-gradient target', '대칭 정렬 손실', '전이 평가'],
    equations: [
      eq('SimSiam Loss', 'L=-\\frac{1}{2}(\\frac{p_1\\cdot sg(z_2)}{\\|p_1\\|\\|z_2\\|}+\\frac{p_2\\cdot sg(z_1)}{\\|p_2\\|\\|z_1\\|})', '대칭 정렬 objective.'),
      eq('Stop-Gradient', '\\partial sg(z)/\\partial z=0', 'target 경로의 역전파를 차단한다.'),
    ],
    problem: 'SSL 구조 복잡도가 커져 핵심 안정화 원리 파악이 어려웠다.',
    core: '필수 요소만 남긴 단순 구조로도 학습이 가능한지 검증한다.',
    equationPoints: ['sg가 one-side fixed target 역할을 한다.', '대칭 손실이 양쪽 분기 신호를 균형화한다.'],
    impl: [
      'BN/augmentation 설정에 매우 민감하다.',
      'predictor 차원이 너무 작으면 표현력이 떨어진다.',
      '초기 learning rate 과대 설정 시 collapse 가능성이 커진다.',
      '재현성 확보를 위해 protocol 고정이 중요하다.',
    ],
    limitations:
      '왜 collapse가 억제되는지 이론적 설명이 완전하지 않다. 후속 이론/규제 기반 연구가 이를 보완한다.',
  },
  barlow: {
    summary:
      '교차상관 행렬을 단위행렬로 유도해 invariance와 redundancy reduction을 동시에 달성하는 non-contrastive SSL.',
    contributions: [
      'redundancy reduction objective 제안',
      '대각 정렬/비대각 억제 결합',
      'negative-free 성능 입증',
      '단순 배치통계 구현',
      'VICReg 계열 기반 제공',
      'SSL 목적 해석 확장',
    ],
    steps: ['두 뷰 특징 추출', '정규화', '교차상관 C 계산', '대각 항 손실', '비대각 항 손실', '합성 objective 최적화'],
    equations: [
      eq('Cross-Correlation', 'C_{ij}=\\frac{\\sum_b z_{b,i}^A z_{b,j}^B}{\\sqrt{\\sum_b(z_{b,i}^A)^2}\\sqrt{\\sum_b(z_{b,j}^B)^2}}', '채널 상관을 측정한다.'),
      eq('Barlow Loss', 'L=\\sum_i(1-C_{ii})^2+\\lambda\\sum_{i\\ne j}C_{ij}^2', '대각 정렬과 중복 억제를 동시에 수행한다.'),
    ],
    problem: 'negative 없이도 collapse를 피하고 정보량을 유지해야 한다.',
    core: '상관 구조를 직접 제어해 표현 중복을 줄이고 불변성을 확보한다.',
    equationPoints: ['C_ii는 뷰 정렬, C_ij는 채널 중복을 나타낸다.', 'lambda가 두 목표의 균형을 조절한다.'],
    impl: [
      '배치 크기가 작으면 C 추정 노이즈가 커진다.',
      '출력 차원과 정규화 방식이 성능에 영향 준다.',
      'lambda 스케줄링이 안정화에 도움될 수 있다.',
      '평가 시 linear protocol 고정이 중요하다.',
    ],
    limitations:
      '배치 통계 의존성이 크다. VICReg는 variance/covariance 분리 규제로 이를 보완한다.',
  },
  dino: {
    summary:
      'ViT 기반 self-distillation과 centering/sharpening으로 라벨 없이 강한 표현 및 의미적 attention 특성을 획득한다.',
    contributions: [
      'ViT self-distillation SSL 정립',
      'teacher centering/sharpening 도입',
      'multi-crop 학습 효율화',
      'emergent attention 현상 보고',
      'ViT SSL 전환 가속',
      '세그멘테이션 전이 기반 제공',
    ],
    steps: ['multi-crop 생성', 'teacher/student forward', 'teacher 분포 보정', 'cross-view distillation', 'EMA teacher 업데이트', '전이 평가'],
    equations: [
      eq('Distillation Loss', 'L=\\sum_{v\\in V_s}\\sum_{u\\in V_t}H(sg(p_t^u),p_s^v)', 'teacher 분포를 student가 모방한다.'),
      eq('Teacher Prob', 'p_t=softmax((g_t(x)-c)/T_t)', 'center/temperature로 분포를 안정화한다.'),
    ],
    problem: 'ViT에서 안정적인 자기지도 사전학습과 의미 있는 시각표현이 필요했다.',
    core: 'EMA teacher 분포를 여러 student 뷰가 정렬하도록 학습한다.',
    equationPoints: ['distillation은 라벨 대신 teacher soft target을 사용한다.', 'centering/sharpening이 collapse를 억제한다.'],
    impl: [
      'teacher temperature warm-up이 중요하다.',
      'center 업데이트 모멘텀 튜닝이 필요하다.',
      'multi-crop 구성은 계산량/성능 균형 핵심이다.',
      'ViT patch size가 전이 및 attention 해석에 영향 준다.',
    ],
    limitations:
      'attention map 해석은 보조 지표이지 완전한 분할 감독이 아니다. MAE와의 보완적 결합 연구가 많다.',
  },
  transformer: {
    summary:
      'Self-attention 중심 Transformer 구조로 순환 없이 전역 의존성을 병렬 학습한다.',
    contributions: [
      'attention-only encoder-decoder 제안',
      'scaled dot-product 정식화',
      'multi-head 병렬 학습',
      '위치 인코딩 도입',
      '대규모 병렬학습 기반 제공',
      'GPT/BERT/ViT/MAE 공통 백본 구축',
    ],
    steps: ['임베딩+위치정보', 'MHA+FFN 반복', '잔차+정규화', '인코더-디코더 attention', 'masked decoding', '스케줄드 최적화'],
    equations: [
      eq('Attention', 'Attention(Q,K,V)=softmax(QK^T/\\sqrt{d_k})V', '전역 토큰 관계를 계산한다.'),
      eq('MHA', 'MHA=Concat(head_1,...,head_h)W^O', '다양한 관계를 병렬 학습한다.'),
    ],
    problem: 'RNN의 순차 병목과 장기 의존성 한계를 동시에 해결해야 했다.',
    core: '모든 토큰 간 관계를 attention으로 병렬 계산한다.',
    equationPoints: ['sqrt(d_k)는 로짓 스케일 폭주를 완화한다.', 'MHA는 표현 하위공간 다양성을 높인다.'],
    impl: [
      '긴 시퀀스에서 O(n^2) 비용이 병목이다.',
      'warm-up 스케줄이 초기 안정성에 필수다.',
      'mask 구현 오류는 생성 품질을 크게 망친다.',
      'pre/post-norm 선택이 깊은 모델 안정성을 좌우한다.',
    ],
    limitations:
      '긴 시퀀스 계산비용이 높다. sparse/linear attention 계열이 이를 보완하려고 등장했다.',
  },
  gpt: {
    summary:
      '생성형 언어모델 사전학습 후 태스크 미세조정하는 pretrain-finetune 패러다임을 정립한다.',
    contributions: [
      'causal LM 사전학습 정립',
      '전이 가능한 표현 확보',
      '다목적 NLP 태스크 적용',
      '입력 포맷 기반 적응',
      '저자원 태스크 성능 개선',
      '현대 GPT 계열 기반 제공',
    ],
    steps: ['LM 사전학습', '태스크 포맷 구성', '가중치 전이', '미세조정', '보조 LM 유지', '성능 평가'],
    equations: [
      eq('Causal LM', '\\max_\\theta\\sum_t\\log p_\\theta(x_t|x_{<t})', '다음 토큰 예측으로 언어 통계를 학습한다.'),
      eq('Fine-tune Objective', 'L=L_{task}+\\lambda L_{LM}', '태스크 적합성과 일반성을 함께 유지한다.'),
    ],
    problem: '라벨 데이터가 적은 태스크에서 일반화 가능한 언어표현이 필요하다.',
    core: '비지도 대규모 pretraining으로 일반 표현을 먼저 학습하고 태스크별로 적응한다.',
    equationPoints: ['causal objective는 생성 능력을 직접 학습한다.', 'joint objective는 forgetting 완화에 도움된다.'],
    impl: [
      'pretraining 코퍼스 품질/규모가 전이 성능을 좌우한다.',
      '미세조정 학습률은 작게 시작하는 것이 안정적이다.',
      '태스크 입력 포맷이 성능 병목이 될 수 있다.',
      'head 초기화 방식이 초반 수렴에 영향 준다.',
    ],
    limitations:
      '단방향 문맥 한계가 있다. 이를 보완하는 양방향 pretraining 축이 BERT로 전개되었다.',
  },
  bert: {
    summary:
      'MLM과 NSP를 결합한 양방향 Transformer 사전학습으로 NLP 전반 성능을 크게 끌어올린다.',
    contributions: [
      '양방향 encoder pretraining 정립',
      'MLM 대중화',
      'NSP 결합',
      '벤치마크 대폭 향상',
      '사전학습-미세조정 표준화',
      '후속 BERT 계열 기반 제공',
    ],
    steps: ['토큰화/세그먼트 구성', '마스킹 샘플 생성', 'MLM+NSP 학습', '태스크 헤드 추가', '미세조정', '전이 평가'],
    equations: [
      eq('MLM', '\\max_\\theta\\sum_{i\\in M}\\log p_\\theta(x_i|x_{\\setminus M})', '마스크 토큰 복원으로 양방향 문맥을 학습한다.'),
      eq('Joint Loss', 'L=L_{MLM}+L_{NSP}', '토큰/문장 수준 목표를 동시에 학습한다.'),
    ],
    problem: '단방향 LM은 양방향 문맥 정보를 충분히 활용하지 못한다.',
    core: '복원형 목표로 양방향 표현을 학습해 태스크 전이를 강화한다.',
    equationPoints: ['MLM은 reconstruction SSL의 언어 버전이다.', 'NSP는 문장 관계 신호를 추가한다.'],
    impl: [
      '마스킹 규칙 구현 정확성이 중요하다.',
      '코퍼스 구성과 시퀀스 길이 설정이 성능에 큰 영향 준다.',
      'layer-wise lr decay가 미세조정 안정성에 도움될 수 있다.',
      '도메인 적응 pretraining으로 성능 향상이 가능하다.',
    ],
    limitations:
      '사전학습 비용이 크고 NSP 유효성 논쟁이 있다. RoBERTa 계열이 이를 재설계했다.',
  },
  mae: {
    summary:
      '높은 마스킹 비율과 비대칭 encoder-decoder로 비전 복원형 SSL을 효율적으로 확장한다.',
    contributions: [
      'visible-only encoder 구조',
      '고마스킹 전략',
      '복원형 objective로 강한 전이',
      '학습 효율 개선',
      'decoder 분리 설계',
      'ViT SSL 핵심 축 형성',
    ],
    steps: ['패치 분할/마스킹', 'visible patch 인코딩', '경량 디코더 복원', '마스크 영역 손실', '인코더 추출', '전이 평가'],
    equations: [
      eq('MAE Loss', 'L=\\frac{1}{|M|}\\sum_{i\\in M}\\|\\hat{x}_i-x_i\\|_2^2', '마스크 영역 복원 손실만 계산한다.'),
      eq('Mask Ratio', 'r=|M|/N_{patch}', '정보 병목 강도를 결정한다.'),
    ],
    problem: '비전 마스킹 학습은 계산비용이 크고 효율이 낮았다.',
    core: '인코더 계산을 visible 영역에 집중하고 복원은 경량 디코더가 담당한다.',
    equationPoints: ['손실을 마스크 영역에 집중해 신호 효율을 높인다.', 'r 값이 난이도와 표현 품질 균형을 좌우한다.'],
    impl: [
      'mask sampling 균일성이 중요하다.',
      'decoder 용량이 과도하면 encoder 표현 품질이 떨어질 수 있다.',
      'pixel normalization 여부를 점검한다.',
      'fine-tune 시 lr decay 전략이 유효하다.',
    ],
    limitations:
      '복원 objective가 항상 semantic 정렬을 보장하지 않는다. DINO류 distillation과 상보적이다.',
  },
  vit: {
    summary:
      '이미지를 패치 토큰으로 변환해 Transformer를 비전에 직접 적용하고 대규모 데이터에서 경쟁력 있는 성능을 입증한다.',
    contributions: [
      '패치 토큰화 기반 비전 모델 정립',
      '순수 Transformer 비전 적용',
      'CLS 토큰 분류 체계 도입',
      '대규모 사전학습 성능 검증',
      'ViT 생태계 기반 제공',
      '비전-언어 구조 통합 가능성 제시',
    ],
    steps: ['이미지 패치화', '선형 임베딩', 'CLS/위치 임베딩 추가', 'Transformer encoder', '분류 헤드', '전이 미세조정'],
    equations: [
      eq('Patch Input', 'z_0=[x_{cls};x_p^1E;...;x_p^NE]+E_{pos}', '이미지를 토큰 시퀀스로 변환한다.'),
      eq('Encoder Block', 'z_l^\\prime=MSA(LN(z_{l-1}))+z_{l-1},\\ z_l=MLP(LN(z_l^\\prime))+z_l^\\prime', '표준 Transformer 블록을 반복한다.'),
    ],
    problem: '비전 모델이 CNN bias에 크게 의존해 아키텍처 통합성이 낮았다.',
    core: '이미지를 토큰 시퀀스로 재해석해 NLP Transformer를 재사용한다.',
    equationPoints: ['패치 임베딩이 비전 입력을 시퀀스 공간으로 매핑한다.', '반복 블록이 전역 관계를 심층적으로 학습한다.'],
    impl: [
      '패치 크기와 해상도 조합이 계산량을 좌우한다.',
      '소규모 데이터에서는 정규화/증강/증류가 필요하다.',
      'position embedding 보간이 해상도 전환에 필요하다.',
      '사전학습 규모가 충분해야 CNN 대비 장점이 나온다.',
    ],
    limitations:
      '초기엔 데이터 효율이 낮았다. DeiT/MAE/DINO가 이를 개선하며 실용성을 높였다.',
  },
};

const PAPER_TO_FAMILY = {
  'Signature Verification using a "Siamese" Time Delay Neural Network': 'siamese',
  'Learning a Similarity Metric Discriminatively, with Application to Face Verification': 'siamese',
  'Siamese Neural Networks for One-shot Image Recognition': 'siamese',
  'Representation Learning with Contrastive Predictive Coding': 'cpc',
  'Momentum Contrast for Unsupervised Visual Representation Learning': 'moco',
  'A Simple Framework for Contrastive Learning of Visual Representations': 'simclr',
  'Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning': 'byol',
  'Unsupervised Learning of Visual Features by Contrasting Cluster Assignments': 'swav',
  'Concerning Nonnegative Matrices and Doubly Stochastic Matrices': 'sinkhorn',
  'Sinkhorn Distances: Lightspeed Computation of Optimal Transport': 'sinkhorn',
  'Exploring Simple Siamese Representation Learning': 'simsiam',
  'Barlow Twins: Self-Supervised Learning via Redundancy Reduction': 'barlow',
  'Emerging Properties in Self-Supervised Vision Transformers': 'dino',
  'Attention Is All You Need': 'transformer',
  'Improving Language Understanding by Generative Pre-Training': 'gpt',
  'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding': 'bert',
  'Masked Autoencoders Are Scalable Vision Learners': 'mae',
  'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale': 'vit',
};

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let updated = 0;

data.papers = data.papers.map((paper) => {
  const familyKey = PAPER_TO_FAMILY[paper.title];
  if (!familyKey) return paper;
  const family = F[familyKey];
  if (!family) return paper;

  updated += 1;
  return {
    ...paper,
    abstract: `${family.summary} 이 논문은 특히 "${paper.title}" 맥락에서 해당 방법의 설계 선택과 학습 안정화 포인트를 실험적으로 보여준다.`,
    key_contributions: family.contributions,
    algorithms: family.steps,
    key_equations: family.equations,
    architecture_detail: buildDetail(family),
    prerequisites: ['기본 선형대수/확률', '딥러닝 최적화', '자기지도학습 기초', 'Transformer 또는 Metric learning 기초'],
    learning_objectives: [
      '핵심 목적함수와 변수 의미를 수식으로 설명할 수 있다.',
      '학습 안정화 장치(정규화/EMA/마스킹)의 역할을 설명할 수 있다.',
      '후속 연구가 개선한 병목을 연결 그래프로 설명할 수 있다.',
      '재현 시 필요한 구현 체크리스트를 말할 수 있다.',
    ],
    self_check_questions: [
      '핵심 손실이 줄어들 때 어떤 표현 특성이 강화되는가?',
      '하이퍼파라미터 중 성능 민감도가 높은 항목은 무엇인가?',
      '이 논문의 한계를 보완한 후속 논문은 무엇인가?',
      '실제 재현 시 가장 먼저 점검할 디버깅 포인트는 무엇인가?',
    ],
    category: 'representation_learning',
    tags: uniq(['representation_learning', ...(paper.tags ?? [])]),
  };
});

fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ updated, total: data.papers.length }, null, 2));
