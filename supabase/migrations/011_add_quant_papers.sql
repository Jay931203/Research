-- 011_add_quant_papers.sql
-- LLM 양자화 3대 논문 추가: QuIP, QuIP#, AQLM

DO $$
DECLARE
  quip_id       UUID;
  quipsharp_id  UUID;
  aqlm_id       UUID;
BEGIN

  /* ================================================================
     QuIP: 2-bit Quantization of Large Language Models with Guarantees
     NeurIPS 2023  |  arxiv: 2307.13304
     ================================================================ */
  INSERT INTO papers (
    title, authors, year, venue, arxiv_id, abstract,
    key_contributions, algorithms, key_equations,
    architecture_detail, category, tags, color_hex,
    pdf_url, code_url, difficulty_level,
    prerequisites, learning_objectives, self_check_questions
  ) VALUES (
    'QuIP: 2-bit Quantization of Large Language Models with Guarantees',
    ARRAY['Jerry Chee', 'Yaohui Cai', 'Volodymyr Kuleshov', 'Christopher De Sa'],
    2023,
    'NeurIPS 2023',
    '2307.13304',
    $q1abs$2비트 양자화는 LLM 추론 비용을 획기적으로 낮출 수 있지만, 기존 PTQ(Post-Training Quantization) 방식은 2비트에서 성능이 급격히 저하됩니다. QuIP는 비간섭 처리(Incoherence Processing)와 LDLQ(Lattice Descent LLM Quantization)를 결합하여 최초로 수학적 보장을 제공하는 2비트 LLM 양자화 방법을 제시합니다. 가중치 행렬에 랜덤 직교 변환(Q_L, Q_R)을 적용해 비간섭 조건을 만족시킨 뒤, LDLQ로 순차적 양자화를 수행합니다. 비간섭 조건 하에서 양자화 오차의 수학적 상한이 보장되며, Llama-2-7B @ 2bit에서 PPL ≈ 6.4를 달성하여 당시 2비트 양자화 SOTA를 크게 뛰어넘었습니다.$q1abs$,
    ARRAY[
      '비간섭 조건 하에서 2비트 양자화 오차의 수학적 상한 최초 증명',
      '랜덤 직교 변환(Q_L, Q_R)을 활용한 비간섭 처리(Incoherence Processing) 제안',
      'LDLQ: LDL^T 헤시안 분해 기반 순차 양자화 알고리즘 – 이전 열의 오차를 구조적으로 전파',
      'Llama-2-7B @ 2bit PPL 6.4 달성 (FP16 5.47 대비 약 17% 열화, 당시 SOTA)'
    ],
    ARRAY[
      '1. 비간섭 처리: W'' = Q_L^T W Q_R 적용 (랜덤 직교행렬 Q_L, Q_R 곱하기)',
      '2. 헤시안 분해: 활성화 헤시안 H = X^T X를 LDL^T로 분해',
      '3. LDLQ 양자화: 열 단위 순차 양자화, L의 하삼각 구조로 이전 오차 전파·보정',
      '4. 역변환: W_q = Q_L W''_q Q_R^T 적용하여 원래 공간으로 복원'
    ],
    $q1eq$[
      {
        "name": "근사 프록시 목적함수",
        "latex": "\\hat{W} = \\underset{\\hat{W} \\in \\mathcal{Q}}{\\arg\\min}\\, \\mathbb{E}_{U}\\!\\left[\\left\\|(\\hat{W} - W)U\\right\\|_F^2\\right]",
        "description": "비간섭 처리를 통해 랜덤 직교행렬 U 하에서의 기댓값 Frobenius 노름 오차를 최소화합니다. 비간섭 가중치(μ(W) ≈ 1)는 이 최소화 문제의 수학적 보장을 자연스럽게 만족합니다."
      },
      {
        "name": "비간섭도 측도 μ(W)",
        "latex": "\\mu(W) = \\sqrt{n} \\cdot \\frac{\\max_{i,j}|W_{ij}|}{\\|W\\|_F}",
        "description": "가중치 행렬의 비간섭 정도를 측정합니다. μ(W) ≈ 1이면 비간섭 조건 만족. 랜덤 직교 변환 적용 후 이 값이 크게 감소하여 양자화 오차 상한이 보장됩니다."
      },
      {
        "name": "LDLQ 순차 업데이트 규칙",
        "latex": "\\hat{w}_i = Q\\!\\left(w_i - \\frac{1}{d_{ii}}\\sum_{j < i} L_{ij}(\\hat{w}_j - w_j)\\right)",
        "description": "LDLQ의 핵심 수식. i번째 열을 양자화할 때 j < i인 이전 열의 양자화 오차(ŵ_j − w_j)를 L_ij를 통해 현재 열에 피드백·보정합니다. STE 없이 안정적인 2비트 양자화 가능."
      }
    ]$q1eq$::jsonb,
    $q1arch$## 전체 파이프라인 개요
QuIP는 사전 학습된 LLM의 선형 레이어 가중치를 layer-by-layer로 2비트에 압축하는 PTQ 방법입니다. 핵심은 양자화 전에 가중치를 "비간섭" 상태로 변환하여 오차 상한을 수학적으로 보장하는 것입니다.

## 1) 비간섭 처리 (Incoherence Processing)
- 가중치 행렬 W에 랜덤 직교 행렬 Q_L(좌측), Q_R(우측)을 곱합니다
- 변환된 W'' = Q_L^T W Q_R은 비간섭 조건 μ(W'') ≈ 1을 만족
- 비간섭 행렬은 균등 분포에 가까워져 양자화 오차의 수학적 상한이 성립
- 직관: 특정 원소가 지배하지 않는 "평탄한" 행렬은 양자화 왜곡이 예측 가능

## 2) LDL^T 헤시안 분해
- 활성화 헤시안 H = X^T X를 LDL^T로 분해 (L: 하삼각, D: 대각)
- GPTQ와 유사하지만, QuIP는 L의 구조를 LDLQ의 오차 전파에 활용
- 분해 결과가 LDLQ에서 최적의 순차 양자화 순서와 가중치를 결정

## 3) LDLQ (Lattice Descent LLM Quantization)
- 열 단위로 순차적 양자화 수행 (i = 1, 2, ..., n 순서)
- i번째 열 양자화 시 j < i인 이전 열의 양자화 오차를 L_ij를 통해 현재 열에 전파
- 이를 빼주어 (보정) 누적 오차를 최소화하는 구조
- GPTQ의 greedy 방식보다 체계적인 오차 전파 메커니즘

## 4) 역변환
- 양자화된 W''_q에 역변환 적용: W_q = Q_L W''_q Q_R^T
- 직교 행렬의 역은 전치이므로 추가 계산 비용 없음
- 원래 가중치 공간으로 복원 후 모델에 적재$q1arch$,
    'quantization',
    ARRAY['quantization', 'llm', '2-bit', 'ptq', 'incoherence-processing', 'ldlq', 'neurips-2023', 'mathematical-guarantee'],
    '#4f46e5',
    'https://arxiv.org/pdf/2307.13304',
    'https://github.com/Cornell-RelaxML/quip',
    'advanced',
    ARRAY[
      'Post-Training Quantization(PTQ)의 기본 개념과 GPTQ 알고리즘',
      '행렬 분해: LDL^T 분해, QR 분해',
      '확률론: 랜덤 직교 행렬, 기댓값, Frobenius 노름',
      'LLM 구조: Transformer 선형 레이어(Q, K, V, O, FFN)'
    ],
    ARRAY[
      '비간섭 처리(Incoherence Processing)의 수학적 의미와 동기를 설명할 수 있다',
      'LDLQ 알고리즘의 순차 업데이트 규칙을 수식으로 쓰고 각 항의 역할을 설명할 수 있다',
      'μ(W) 측도가 양자화 오차 보장과 어떻게 연결되는지 이해한다',
      'QuIP의 2비트 성능이 기존 PTQ(GPTQ 2-bit) 대비 어떻게 개선되었는지 설명할 수 있다'
    ],
    ARRAY[
      '비간섭 처리에서 랜덤 직교 행렬 Q_L, Q_R의 역할은 무엇인가? 왜 적용 후 μ(W)가 감소하는가?',
      'LDLQ에서 LDL^T 분해를 사용하는 이유는 무엇인가? L의 하삼각 구조가 어떻게 활용되는가?',
      '비간섭 조건 μ(W) ≈ 1이 만족될 때 양자화 오차에 어떤 수학적 보장이 성립하는가?',
      'QuIP가 기존 GPTQ 대비 2비트에서 더 나은 이유를 아키텍처·수학적 관점에서 설명하라'
    ]
  ) RETURNING id INTO quip_id;


  /* ================================================================
     QuIP#: Even Better LLM Quantization (ICML 2024)
     arxiv: 2402.04396
     ================================================================ */
  INSERT INTO papers (
    title, authors, year, venue, arxiv_id, abstract,
    key_contributions, algorithms, key_equations,
    architecture_detail, category, tags, color_hex,
    pdf_url, code_url, difficulty_level,
    prerequisites, learning_objectives, self_check_questions
  ) VALUES (
    'QuIP#: Even Better LLM Quantization with Hadamard Incoherence and Lattice Codebooks',
    ARRAY['Albert Tseng', 'Jerry Chee', 'Qingyao Sun', 'Volodymyr Kuleshov', 'Christopher De Sa'],
    2024,
    'ICML 2024',
    '2402.04396',
    $q2abs$QuIP의 직접적인 후속 작으로, 두 가지 핵심 개선을 통해 2비트 성능을 FP16에 거의 근접한 수준으로 향상시킵니다. 첫째, 랜덤 직교 행렬을 결정론적 Walsh-Hadamard 변환으로 교체하여 비간섭 처리 속도를 O(n²)에서 O(n log n)으로 대폭 단축합니다. 둘째, 스칼라(1D) 코드북을 8차원 E8 격자 코드북으로 교체하여 동일 비트 수 대비 더 낮은 평균 왜곡을 달성합니다. E8 격자는 8차원에서 최적 구체 패킹(optimal sphere packing)을 실현하며, 스칼라 양자화 대비 약 1.48 dB의 왜곡 감소를 제공합니다. Llama-2-7B @ 2bit에서 PPL ≈ 5.6으로 FP16(5.47)에 거의 손실 없는 수준을 달성합니다.$q2abs$,
    ARRAY[
      'Walsh-Hadamard 변환으로 비간섭 처리 가속화: O(n²) → O(n log n) 연산량 감소',
      'E8 격자 코드북: 8차원 최적 구체 패킹으로 스칼라 양자화 대비 ~1.48 dB 왜곡 감소',
      'Llama-2-7B @ 2bit PPL 5.6 달성 (FP16 5.47에 거의 손실 없는 수준)',
      '빠른 GPU 커널 구현으로 E8 디코딩을 실시간 추론에 실용적으로 적용'
    ],
    ARRAY[
      '1. Hadamard 변환: W'' = H_n W H_m 적용 (결정론적·O(n log n) 비간섭 변환)',
      '2. E8 코드북 준비: 8차원 E8 격자의 코드워드 사전을 GPU 메모리에 로드',
      '3. E8 양자화: 8차원 가중치 벡터 w를 E8 격자의 최근접 코드워드로 매핑',
      '4. 역변환: W_q = H_n^T W''_q H_m^T 적용 (Hadamard는 직교행렬이므로 전치 = 역)'
    ],
    $q2eq$[
      {
        "name": "Walsh-Hadamard 비간섭 처리",
        "latex": "\\tilde{W} = H_n W H_m, \\quad H_{2^k} = H_{2^{k-1}} \\otimes H_2",
        "description": "랜덤 직교 행렬 대신 결정론적 Walsh-Hadamard 행렬을 사용합니다. 크로네커 곱으로 재귀적으로 구성되며 ±1 원소만 가져 O(n log n)에 적용 가능합니다. 비간섭성 보장은 QuIP와 동일하게 유지됩니다."
      },
      {
        "name": "E8 격자 최근접 코드워드 탐색",
        "latex": "\\hat{w} = \\underset{c \\,\\in\\, \\Lambda_{E_8}}{\\arg\\min}\\, \\|w - c\\|_2",
        "description": "8차원 가중치 벡터 w를 E8 격자의 최근접 코드워드 c에 매핑합니다. E8은 8차원에서 최적 구체 패킹 격자로, 스칼라 양자화보다 평균 왜곡이 낮습니다. E8의 특수 구조 덕분에 O(n) 탐색 알고리즘이 존재합니다."
      },
      {
        "name": "격자 양자화 왜곡 이득",
        "latex": "\\frac{D_{\\text{scalar}}}{D_{E_8}} \\approx 1.36 \\quad (\\approx 1.48\\,\\text{dB})",
        "description": "E8 격자는 스칼라 양자화 대비 평균 왜곡을 약 36% 감소시킵니다(1.48 dB 이득). 8개 가중치를 동시에 양자화함으로써 차원 간 상관관계를 활용하고 독립적 스칼라 양자화의 한계를 극복합니다."
      }
    ]$q2eq$::jsonb,
    $q2arch$## 개선 동기: QuIP의 두 가지 실용적 병목
QuIP는 수학적으로 우아하지만 두 가지 실용적 문제가 있었습니다.
1. 랜덤 직교 행렬 생성·적용: O(n²) 연산 → 대형 모델에서 병목
2. 스칼라(1D) 코드북: 각 가중치를 독립적으로 양자화 → 차원 간 상관관계 미활용

## 1) Walsh-Hadamard 비간섭 처리 (속도 개선)
- 랜덤 직교 행렬 Q → 결정론적 Walsh-Hadamard 행렬 H로 교체
- H는 ±1 원소만 갖는 직교 행렬: H^T H = n·I
- Kronecker 곱으로 재귀 구성: H_{2^k} = H_{2^{k-1}} ⊗ H_2
- O(n log n) Fast Walsh-Hadamard Transform (FWHT) 활용
- GPU에서 고도로 최적화된 커널 구현 가능
- 비간섭성 보장: 랜덤 행렬과 통계적으로 동등한 incoherence 효과

## 2) E8 격자 코드북 (정밀도 개선)
- 스칼라(1D) 코드북 → 8차원 E8 격자 코드북으로 교체
- E8 격자: 8차원 공간에서 최밀 구체 패킹(optimal sphere packing)
- 8개의 가중치를 동시에 양자화하여 차원 간 상관관계 활용
- 코드북 크기 256 (8비트 인덱스), 8차원 코드워드
- 스칼라 대비 약 1.48 dB(~36%) 왜곡 감소

## 3) E8 최근접 이웃 탐색 알고리즘
- E8 격자의 특수 대칭 구조 덕분에 O(n) 탐색 알고리즘 존재
- 일반 KD-tree O(n log n) 탐색보다 빠름
- GPU 병렬화로 실시간 추론 중 빠른 코드워드 복호화 가능

## 4) 결합 효과
- Hadamard(속도) + E8 격자(정밀도) 결합으로 두 병목 동시 해결
- PPL 5.6: FP16(5.47) 대비 단 0.13만 열화 — 사실상 손실 없는 2비트 압축$q2arch$,
    'quantization',
    ARRAY['quantization', 'llm', '2-bit', 'ptq', 'hadamard', 'e8-lattice', 'lattice-codebook', 'icml-2024'],
    '#7c3aed',
    'https://arxiv.org/pdf/2402.04396',
    'https://github.com/Cornell-RelaxML/quip-sharp',
    'advanced',
    ARRAY[
      'QuIP 논문의 비간섭 처리 개념과 LDLQ 알고리즘',
      '격자 이론(Lattice Theory) 기초: 격자 코드북, 구체 패킹',
      'Walsh-Hadamard 변환의 수학적 성질 (Fast Hadamard Transform)',
      'Kronecker 곱 연산'
    ],
    ARRAY[
      'Hadamard 변환이 랜덤 직교 행렬보다 계산적으로 효율적인 이유를 설명할 수 있다',
      'E8 격자가 스칼라 양자화 대비 왜곡이 낮은 이유를 직관적으로 설명할 수 있다',
      '8차원 E8 코드워드 탐색 알고리즘의 기본 구조를 이해하고, 왜 O(n) 탐색이 가능한지 설명할 수 있다',
      'QuIP → QuIP# 개선의 두 핵심 기여를 QuIP와 비교하여 정확하게 설명할 수 있다'
    ],
    ARRAY[
      'Walsh-Hadamard 변환이 랜덤 직교 변환과 동일한 비간섭성을 보장하는 이유는 무엇인가?',
      'E8 격자에서 최근접 이웃을 찾는 알고리즘의 복잡도가 O(n)인 이유를 설명하라',
      'QuIP#이 2비트에서 PPL 5.6을 달성할 수 있는 핵심 이유 두 가지를 QuIP와 비교하여 설명하라',
      'E8 코드북의 1.48 dB 왜곡 이득이 실제 PPL 개선(6.4 → 5.6)에 어떻게 반영되는지 설명하라'
    ]
  ) RETURNING id INTO quipsharp_id;


  /* ================================================================
     AQLM: Extreme Compression via Additive Quantization (ICML 2024)
     arxiv: 2401.06118
     ================================================================ */
  INSERT INTO papers (
    title, authors, year, venue, arxiv_id, abstract,
    key_contributions, algorithms, key_equations,
    architecture_detail, category, tags, color_hex,
    pdf_url, code_url, difficulty_level,
    prerequisites, learning_objectives, self_check_questions
  ) VALUES (
    'Extreme Compression of Large Language Models via Additive Quantization',
    ARRAY['Vage Egiazarian', 'Andrei Panferov', 'Denis Kuznedelev', 'Elias Frantar', 'Artem Babenko', 'Dan Alistarh'],
    2024,
    'ICML 2024',
    '2401.06118',
    $q3abs$AQLM(Additive Quantization for Language Models)은 최초로 LLM 가중치에 가산 벡터 양자화(Additive Vector Quantization)를 적용합니다. 각 가중치 그룹을 M개의 코드북에서 선택한 코드워드의 합으로 근사합니다: Ŵ ≈ Σ C_m[b_m]. 이 가산 분해는 벡터 양자화의 지수적 코드북 크기 문제를 피하면서도 높은 표현력을 제공합니다. 빔 서치와 SGD를 결합한 전역 최적화로 코드북과 인덱스를 동시에 학습합니다. Llama-2-7B @ 2bit에서 PPL ≈ 5.07을 달성하며, QuIP#보다도 낮은 perplexity를 기록합니다 (약간의 정규화 효과 포함).$q3abs$,
    ARRAY[
      'LLM에 최초로 가산 양자화(Additive Quantization) 적용: Ŵ ≈ Σ C_m[b_m]',
      '동일 비트 수에서 M개 코드북의 합으로 높은 표현력 확보 (지수적 코드북 크기 문제 회피)',
      '빔 서치 + SGD 교대 최적화로 코드북과 인덱스 동시 전역 최적화',
      'Llama-2-7B @ 2bit PPL 5.07 달성 (FP16 5.47보다 낮은 수치 — 정규화 효과)'
    ],
    ARRAY[
      '1. 초기화: 각 코드북 C_m을 K-means 클러스터링으로 초기화',
      '2. 빔 서치: 각 가중치 그룹에 대해 최적 코드 인덱스 조합 탐색 (빔 폭 B로 조절)',
      '3. SGD 파인튜닝: 캘리브레이션 데이터로 코드북 C_m 업데이트 (인덱스 고정)',
      '4. 반복(BCOO): 2-3단계를 교대 반복하여 코드북-인덱스 공동 최적화'
    ],
    $q3eq$[
      {
        "name": "가산 양자화 분해",
        "latex": "\\hat{W} \\approx \\sum_{m=1}^{M} C_m[\\mathbf{b}_m]",
        "description": "M개의 코드북 C_m에서 선택한 코드워드의 합으로 가중치 행렬을 근사합니다. b_m은 m번째 코드북의 인덱스 벡터, C_m[b_m]은 선택된 코드워드입니다. M=1이면 일반 VQ, M>1이면 잔차 보정 구조."
      },
      {
        "name": "캘리브레이션 손실 함수",
        "latex": "\\mathcal{L}(\\{C_m\\}, \\{\\mathbf{b}_m\\}) = \\left\\|XW - X\\sum_{m=1}^{M}C_m[\\mathbf{b}_m]\\right\\|_F^2",
        "description": "캘리브레이션 데이터 X에서 원본 가중치 W와 근사 가중치 합의 출력 차이를 최소화합니다. 가중치 공간이 아닌 출력 공간에서 오차를 측정하여 실제 모델 성능과의 연관성을 높입니다."
      },
      {
        "name": "유효 비트 수 (bits-per-weight)",
        "latex": "b_{\\text{eff}} = \\frac{M \\cdot \\log_2 |C|}{g}",
        "description": "M개 코드북, 각 코드북 크기 |C|, 그룹 크기 g일 때의 가중치당 유효 비트 수. 예: M=2, |C|=256, g=8이면 b_eff = 2×8/8 = 2 bits/weight."
      }
    ]$q3eq$::jsonb,
    $q3arch$## 핵심 아이디어: 가산 분해의 장점
기존 벡터 양자화(VQ)는 전체 가중치 그룹을 단일 코드북으로 표현합니다. 그룹 크기 g, 비트 수 b라면 코드북 크기가 2^(g·b)로 지수적으로 증가합니다. AQLM은 M개의 작은 코드북의 합으로 분해하여 이 문제를 해결합니다: 코드북 크기 |C|^M이 아닌 M × |C| 공간만 필요합니다.

## 1) 코드북 구조
- M개의 코드북: C_1, C_2, ..., C_M (각 코드북은 256개의 g차원 코드워드 보유)
- 그룹 크기 g: 가중치 열의 g개 원소를 하나의 코드워드로 표현
- 유효 비트 수 = M × log2(|C|) / g (일반적으로 M=2, |C|=256, g=8 → 2 bits/weight)
- 첫 번째 코드북: 거친 근사, 이후 코드북들: 순차 잔차 보정

## 2) 가산 분해 구조
- 가중치 그룹 w를 M개 코드북의 합으로 표현: w ≈ C_1[b_1] + C_2[b_2] + ... + C_M[b_M]
- M=1: 일반 VQ 수준 (GPTQ 2-bit과 유사한 성능)
- M=2: 잔차 보정으로 오차 대폭 감소
- M=3: 사실상 FP16에 근접한 재구성 품질

## 3) 교대 최적화 알고리즘 (BCOO)
- Phase 1: K-means로 각 코드북 C_m 초기화
- Phase 2: 빔 서치(Beam Search)로 각 가중치 그룹의 최적 코드 인덱스 조합 탐색
  * 탐색 공간: |C|^M 개의 조합 (예: 256^2 = 65,536)
  * 빔 폭(beam width) B로 계산량 vs 품질 트레이드오프 조절
- Phase 3: SGD로 코드북 파인튜닝 (인덱스 고정, 코드북 파라미터 갱신)
- Phase 2-3 반복: 교대 최적화로 전역 수렴

## 4) 구현 세부사항
- 캘리브레이션 데이터: C4 데이터셋 2048 샘플
- 레이어별 순차 최적화: layer-by-layer PTQ 방식
- 최종 End-to-End 파인튜닝 옵션으로 추가 성능 향상 가능$q3arch$,
    'quantization',
    ARRAY['quantization', 'llm', '2-bit', 'ptq', 'additive-quantization', 'vector-quantization', 'beam-search', 'icml-2024'],
    '#059669',
    'https://arxiv.org/pdf/2401.06118',
    'https://github.com/Vahe1994/AQLM',
    'advanced',
    ARRAY[
      '벡터 양자화(Vector Quantization) 기초 개념과 코드북 구조',
      'K-means 클러스터링 알고리즘',
      'Beam Search (휴리스틱 탐색 알고리즘)',
      'PTQ의 레이어별 최적화 방식과 캘리브레이션 데이터 활용'
    ],
    ARRAY[
      '가산 양자화(Additive Quantization)가 일반 VQ와 다른 점을 수식으로 설명할 수 있다',
      'M개 코드북을 더했을 때 유효 비트 수가 어떻게 계산되는지 이해하고 계산할 수 있다',
      '빔 서치와 SGD의 교대 최적화(BCOO)가 왜 효과적인지 설명할 수 있다',
      'AQLM과 QuIP# 두 논문의 다른 접근법을 비교하여 각각의 장단점을 설명할 수 있다'
    ],
    ARRAY[
      '가산 양자화 Ŵ ≈ Σ C_m[b_m]에서 각 코드북의 역할은 무엇인가? 잔차 구조와 어떻게 연관되는가?',
      'M=2, |C|=256, g=8일 때 유효 비트 수를 계산하고 왜 2 bits/weight인지 설명하라',
      '빔 서치로 코드 인덱스를 탐색할 때 탐색 공간의 크기는 얼마인가? 빔 폭이 성능에 미치는 영향은?',
      'AQLM이 일부 설정에서 FP16보다 낮은 PPL을 보이는 이유를 정규화 관점에서 설명하라'
    ]
  ) RETURNING id INTO aqlm_id;


  /* ================================================================
     Paper Relationships: QuIP 계보
     ================================================================ */
  INSERT INTO paper_relationships (from_paper_id, to_paper_id, relationship_type, description, strength)
  VALUES
    (
      quipsharp_id,
      quip_id,
      'extends',
      'QuIP#은 QuIP를 직접 확장합니다. 랜덤 직교→Walsh-Hadamard 변환, 스칼라→E8 격자 코드북으로 교체하여 속도와 정밀도를 모두 향상시킵니다. PPL 6.4 → 5.6 달성.',
      9
    ),
    (
      aqlm_id,
      quip_id,
      'compares_with',
      'AQLM은 QuIP와 완전히 다른 접근(가산 VQ vs. 비간섭+LDLQ)으로 2비트 압축 문제에 도전합니다. 두 논문은 동 시기에 2비트 LLM 양자화 SOTA를 경쟁합니다.',
      7
    ),
    (
      aqlm_id,
      quipsharp_id,
      'compares_with',
      'AQLM과 QuIP#은 모두 ICML 2024 논문으로 2비트 LLM 양자화 최고 성능을 두고 경쟁합니다. 서로 다른 수학적 기반(가산 VQ vs. Hadamard+E8 격자)을 활용합니다.',
      8
    );

END $$;
