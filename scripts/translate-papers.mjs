import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = resolve(__dirname, '../public/data/initial-papers.json');
const data = JSON.parse(readFileSync(filePath, 'utf-8'));

// Title translations: English → Korean (keep model name for recognition)
const titleMap = {
  "Deep Learning for Massive MIMO CSI Feedback": "Massive MIMO CSI 피드백을 위한 딥러닝 (CsiNet)",
  "CsiNet-LSTM: A Deep Learning Architecture for Compressive CSI Estimation and Feedback in FDD Massive MIMO": "CsiNet-LSTM: FDD Massive MIMO에서의 압축 CSI 추정 및 피드백을 위한 딥러닝 아키텍처",
  "CRNet: A Deep-Learning Framework for CSI Feedback in Massive MIMO": "CRNet: Massive MIMO CSI 피드백을 위한 다중 해상도 딥러닝 프레임워크",
  "Lightweight and Effective CSI Feedback for Massive MIMO Systems": "Massive MIMO 시스템을 위한 경량 고효율 CSI 피드백 (CLNet)",
  "TransNet: Full Attention Network for CSI Feedback in FDD Massive MIMO": "TransNet: FDD Massive MIMO CSI 피드백을 위한 완전 어텐션 네트워크",
  "ACRNet: Aggregation Cross-Domain Network for CSI Feedback in Massive MIMO": "ACRNet: Massive MIMO CSI 피드백을 위한 집계 교차 도메인 네트워크",
  "DS-NLCsiNet: Exploiting Non-Local Neural Networks for Massive MIMO CSI Feedback": "DS-NLCsiNet: Massive MIMO CSI 피드백을 위한 비국소 신경망 활용",
  "ENet: Efficient CSI Feedback for Massive MIMO Communications": "ENet: Massive MIMO 통신을 위한 효율적 CSI 피드백",
  "Quantization of Deep Neural Networks for Accurate CSI Feedback": "정확한 CSI 피드백을 위한 심층 신경망 양자화",
  "Deep Learning Based CSI Feedback Approach for Time-Varying Massive MIMO Channels": "시변 Massive MIMO 채널을 위한 딥러닝 기반 CSI 피드백 (MarkovNet)",
  "Binarized Neural Network for CSI Feedback in Massive MIMO Systems": "Massive MIMO CSI 피드백을 위한 이진 신경망 (BCsiNet)",
  "Knowledge Distillation-Based DNN for CSI Feedback in Massive MIMO Systems": "Massive MIMO CSI 피드백을 위한 지식 증류 기반 DNN",
  "Attention Mechanism-Based CSI Feedback Network for Massive MIMO Systems": "Massive MIMO 시스템을 위한 어텐션 메커니즘 기반 CSI 피드백 네트워크",
  "CSI-GPT: Integrating Generative Pre-Trained Transformer with Federated Learning for CSI Feedback": "CSI-GPT: CSI 피드백을 위한 생성형 사전학습 트랜스포머와 연합학습 통합",
  "Deep Learning-Based CSI Feedback with Variable Length Codewords for Adaptive MIMO": "적응형 MIMO를 위한 가변 길이 코드워드 딥러닝 기반 CSI 피드백",
  "Lightweight CSI Feedback via Mixed-Precision Quantization": "혼합 정밀도 양자화를 통한 경량 CSI 피드백",
  "Pruning Deep Neural Networks for Efficient CSI Feedback": "효율적 CSI 피드백을 위한 심층 신경망 가지치기",
  "Adaptive Bit Allocation for Deep Learning-Based CSI Feedback": "딥러닝 기반 CSI 피드백을 위한 적응적 비트 할당",
  "ShuffleCsiNet: Lightweight CSI Feedback Network Based on ShuffleNet Architecture": "ShuffleCsiNet: ShuffleNet 아키텍처 기반 경량 CSI 피드백 네트워크",
  "Vector Quantized CSI Feedback with Learned Codebook": "학습된 코드북을 활용한 벡터 양자화 CSI 피드백",
  "Generative Diffusion Model-Enhanced CSI Feedback": "생성 확산 모델 강화 CSI 피드백",
  "Joint Compression and Quantization for Practical CSI Feedback": "실용적 CSI 피드백을 위한 압축-양자화 통합",
  "Ternary Neural Network for Extreme-Efficient CSI Feedback": "극효율 CSI 피드백을 위한 삼진 신경망",
  "AiANet: Attention-Infused Autoencoder for Massive MIMO CSI Compression": "AiANet: Massive MIMO CSI 압축을 위한 어텐션 융합 오토인코더",
  "SLATE: SwinLSTM Autoencoder for Temporal-Spatial-Frequency CSI Compression": "SLATE: 시공간-주파수 CSI 압축을 위한 SwinLSTM 오토인코더",
  "Quantization Design for Deep Learning-Based CSI Feedback": "딥러닝 기반 CSI 피드백을 위한 양자화 설계",
  "InvCSINet: Invertible Networks with Endogenous Quantization for CSI Feedback": "InvCSINet: CSI 피드백을 위한 내생적 양자화 가역 네트워크",
  "SemCSINet: Semantic-Aware CSI Feedback Network in Massive MIMO Systems": "SemCSINet: Massive MIMO 시스템에서의 의미 인식 CSI 피드백 네트워크",
  "RD-JSCC: Residual Diffusion for Variable-Rate Joint Source-Channel Coding of CSI": "RD-JSCC: CSI의 가변 레이트 소스-채널 결합 코딩을 위한 잔차 확산",
  "WiFo-CF: Wireless Foundation Model for CSI Feedback": "WiFo-CF: CSI 피드백을 위한 무선 파운데이션 모델",
  "EG-CsiNet: Generalizable Learning for Massive MIMO CSI Feedback in Unseen Scenarios": "EG-CsiNet: 미지 시나리오 Massive MIMO CSI 피드백을 위한 일반화 학습",
  "LVM4CF: CSI Feedback with Offline Large Vision Models": "LVM4CF: 오프라인 대규모 비전 모델을 활용한 CSI 피드백",
  "Semantic Pilot Design for Channel Estimation Using a Large Language Model": "대규모 언어 모델을 활용한 채널 추정용 의미적 파일럿 설계",
  "Neural Discrete Representation Learning (VQ-VAE)": "신경 이산 표현 학습 (VQ-VAE)",
  "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration": "AWQ: LLM 압축·가속을 위한 활성화 인식 가중치 양자화",
  "HAWQ-V3: Dyadic Neural Network Quantization": "HAWQ-V3: 이진 분할 신경망 양자화",
  "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers": "GPTQ: 생성형 사전학습 트랜스포머의 정확한 사후 학습 양자화",
  "Finite Scalar Quantization: VQ-VAE Made Simple (FSQ)": "유한 스칼라 양자화: 간소화된 VQ-VAE (FSQ)",
  "SoundStream: An End-to-End Neural Audio Codec (Residual Vector Quantization)": "SoundStream: 엔드투엔드 신경 오디오 코덱 (잔차 벡터 양자화)",
  "Vector Quantization for Deep-Learning-Based CSI Feedback with Shape-Gain Decomposition": "형상-이득 분해를 통한 딥러닝 기반 CSI 피드백 벡터 양자화",
};

// Equation name translations
const eqNameMap = {
  "CSI Compression": "CSI 압축",
  "NMSE Loss": "NMSE 손실 함수",
  "Compression Ratio": "압축비",
  "Temporal CSI Feedback": "시간적 CSI 피드백",
  "LSTM Hidden State Update": "LSTM 은닉 상태 갱신",
  "Multi-Resolution Feature Aggregation": "다중 해상도 특징 집계",
  "Channel Attention (SE Block)": "채널 주의 (SE 블록)",
  "Depthwise Separable Convolution": "깊이별 분리 합성곱",
  "CLNet Complexity Reduction": "CLNet 복잡도 감소",
  "Multi-Head Self-Attention": "다중 헤드 셀프 어텐션",
  "Multi-Head Output": "다중 헤드 출력",
  "Cross-Domain Feature Fusion": "교차 도메인 특징 융합",
  "Aggregation Block": "집계 블록",
  "Non-Local Block": "비국소 블록",
  "Embedded Gaussian Similarity": "임베디드 가우시안 유사도",
  "Encoder Complexity": "인코더 복잡도",
  "Asymmetric Design Ratio": "비대칭 설계 비율",
  "Uniform Quantization": "균일 양자화",
  "Straight-Through Estimator": "직통 추정기 (STE)",
  "Total Feedback Bits": "총 피드백 비트 수",
  "Differential CSI": "차분 CSI",
  "Temporal Feedback Reduction": "시간적 피드백 감소",
  "Weight Binarization": "가중치 이진화",
  "XNOR-Bitcount Operation": "XNOR-비트카운트 연산",
  "Knowledge Distillation Loss": "지식 증류 손실",
  "Student Parameter Reduction": "학생 네트워크 파라미터 감소",
  "Spatial Attention": "공간 주의",
  "Channel Attention": "채널 주의",
  "Autoregressive CSI Prediction": "자기회귀 CSI 예측",
  "Federated Aggregation": "연합 집계",
  "Progressive Encoding": "점진적 인코딩",
  "Adaptive Rate Selection": "적응적 레이트 선택",
  "Mixed-Precision Objective": "혼합 정밀도 목적 함수",
  "Layer Sensitivity": "레이어 민감도",
  "Filter Importance Score": "필터 중요도 점수",
  "Pruning Ratio": "가지치기 비율",
  "Rate-Distortion Optimization": "레이트-왜곡 최적화",
  "Adaptive Bit Selection": "적응적 비트 선택",
  "Channel Shuffle": "채널 셔플",
  "Group Conv FLOPs": "그룹 합성곱 FLOPs",
  "Vector Quantization": "벡터 양자화",
  "VQ-VAE Loss": "VQ-VAE 손실 함수",
  "Diffusion Forward Process": "확산 순방향 과정",
  "Conditional Reverse Process": "조건부 역방향 과정",
  "Joint Optimization": "결합 최적화",
  "Rate Estimation": "레이트 추정",
  "Ternary Quantization": "삼진 양자화",
  "Optimal Threshold": "최적 임계값",
  "Local-Aware Attention": "지역 인식 어텐션",
  "SwinLSTM Cell": "SwinLSTM 셀",
  "Adaptive Joint Loss": "적응적 결합 손실",
  "Non-Uniform Bit Allocation": "비균일 비트 할당",
  "Invertible Transform": "가역 변환",
  "DAQ Quantizer": "DAQ 양자화기",
  "Semantic CSI Embedding": "의미적 CSI 임베딩",
  "Residual Diffusion": "잔차 확산",
  "S-R MoE Layer": "S-R 전문가 혼합 레이어",
  "Channel Cluster Decomposition": "채널 클러스터 분해",
  "Vision-CSI Codebook": "비전-CSI 코드북",
  "Semantic Pilot Confidence": "의미적 파일럿 신뢰도",
  "VQ-VAE Loss": "VQ-VAE 손실 함수",
  "AWQ Scaling Transform": "AWQ 스케일링 변환",
  "Hessian Sensitivity": "헤시안 민감도",
  "ILP Bit Allocation": "ILP 비트 할당",
  "OBQ Weight Update": "OBQ 가중치 갱신",
  "FSQ Quantization": "FSQ 양자화",
  "Residual VQ": "잔차 벡터 양자화 (RVQ)",
  "Shape-Gain Decomposition": "형상-이득 분해",
  "Grassmannian Codebook": "그라스만 코드북",
};

// Architecture detail descriptions for each paper (by original title)
const archMap = {
  "Deep Learning for Massive MIMO CSI Feedback":
    "CsiNet은 인코더-디코더 오토인코더 구조로, 인코더는 3×3 Conv2D 레이어와 완전 연결(FC) 레이어로 구성되어 2D CSI 행렬을 저차원 코드워드로 압축한다. 디코더는 FC 레이어로 복원한 후, 잔차 학습(skip connection)을 갖춘 RefineNet 블록 2개를 연속 적용하여 복원 품질을 정제한다. RefineNet 블록은 Conv2D-BN-ReLU-Conv2D 구조의 잔차 블록으로, 이후 거의 모든 CSI 피드백 연구의 기본 아키텍처가 되었다. 입력은 각도-지연 도메인의 2D CSI 행렬이며, 압축비 γ에 따라 코드워드 차원 M이 결정된다.",

  "CsiNet-LSTM: A Deep Learning Architecture for Compressive CSI Estimation and Feedback in FDD Massive MIMO":
    "CsiNet-LSTM은 CsiNet의 CNN 기반 공간 처리에 LSTM 순환 레이어를 결합한 하이브리드 아키텍처이다. 인코더 단계에서 Conv2D로 공간 특징을 추출한 후 LSTM이 시간 축 은닉 상태를 갱신하여 프레임 간 중복성을 제거한다. 디코더도 LSTM을 사용해 이전 복원 상태를 참조하면서 현재 CSI를 복원한다. 이를 통해 단일 프레임 CsiNet 대비 시변 CSI 시나리오에서 피드백 오버헤드를 크게 줄인다.",

  "CRNet: A Deep-Learning Framework for CSI Feedback in Massive MIMO":
    "CRNet은 다중 해상도 합성곱 아키텍처로, 핵심 빌딩 블록인 CRBlock은 서로 다른 커널 크기(3×3, 5×5, 7×7)의 병렬 합성곱 분기를 가진다. 각 분기의 특징 맵은 Squeeze-and-Excitation(SE) 방식의 채널 주의 메커니즘으로 적응적 가중치를 부여받아 결합된다. 인코더는 Conv2D + FC 구조이며, 디코더는 FC로 복원 후 여러 CRBlock을 통과시켜 정제한다. 다중 스케일 특징 추출로 다양한 주파수 패턴을 포착할 수 있다.",

  "Lightweight and Effective CSI Feedback for Massive MIMO Systems":
    "CLNet은 경량화에 초점을 맞춘 인코더-디코더 구조로, 표준 합성곱을 깊이별 분리 합성곱(Depthwise Separable Convolution)으로 대체하여 파라미터와 FLOPs를 대폭 줄인다. 추가로 보조 정제 네트워크(AnciNet)를 디코더 뒤에 배치하여 복원 품질을 향상시킨다. 복소수 CSI의 실수부와 허수부를 별도 경로로 처리한 뒤 결합하는 복소수 처리 경로도 도입되었다. CRNet 대비 약 1/K의 파라미터 감소를 달성하면서 유사한 NMSE를 유지한다.",

  "TransNet: Full Attention Network for CSI Feedback in FDD Massive MIMO":
    "TransNet은 CNN 인코더/디코더를 완전히 Transformer 기반 다중 헤드 셀프 어텐션으로 대체한 구조이다. CSI 행렬을 패치로 분할하고 Positional Encoding을 추가한 후, Multi-Head Self-Attention 레이어를 통해 전역 의존성을 포착한다. 인코더의 어텐션 출력을 FC 레이어로 압축하고, 디코더에서 다시 Multi-Head Attention으로 복원한다. CNN의 제한된 수용 영역을 극복하여 CSI 행렬 내 장거리 공간 의존성을 효과적으로 모델링한다.",

  "ACRNet: Aggregation Cross-Domain Network for CSI Feedback in Massive MIMO":
    "ACRNet은 공간 도메인과 주파수 도메인을 동시에 처리하는 교차 도메인 아키텍처이다. 핵심 빌딩 블록인 AggregationBlock은 3×3, 5×5, 7×7 커널의 다중 스케일 합성곱을 연결(concatenate)하고 1×1 Conv로 통합하며, 잔차 연결을 갖는다. 교차 도메인 주의 모듈이 공간 특징과 주파수 특징 사이의 상호작용을 학습하여, 하다마드 곱으로 특징을 재조정한다. CRNet보다 적은 파라미터로 더 높은 성능을 달성한다.",

  "DS-NLCsiNet: Exploiting Non-Local Neural Networks for Massive MIMO CSI Feedback":
    "DS-NLCsiNet은 깊이별 분리 합성곱(DS Conv)과 비국소(Non-Local) 주의 블록을 결합한 경량 아키텍처이다. 비국소 블록은 모든 공간 위치 간의 쌍별 유사도를 임베디드 가우시안 함수로 계산하여 장거리 의존성을 포착한다. DS Conv로 경량화하면서도 비국소 블록이 전역 문맥을 제공하여, CsiNet 및 CRNet 대비 우수한 NMSE-FLOPs 트레이드오프를 달성한다.",

  "ENet: Efficient CSI Feedback for Massive MIMO Communications":
    "ENet은 모바일 UE(사용자 단말)와 BS(기지국) 간의 비대칭적 계산 능력을 고려한 비대칭 인코더-디코더 구조이다. UE 측 인코더는 최소한의 합성곱 레이어만으로 구성하여 계산량을 극소화하고, BS 측 디코더는 더 깊고 강력한 네트워크를 사용한다. 인코더 대 디코더 복잡도 비율(ρ)이 1보다 훨씬 작게 설계되어, 모바일 단말에 실질적으로 배포 가능한 구조를 제시한다.",

  "Quantization of Deep Neural Networks for Accurate CSI Feedback":
    "양자화 인식 학습(QAT) 프레임워크로, 학습 중에 양자화 효과를 시뮬레이션하여 네트워크가 양자화 노이즈에 강건하도록 한다. 순방향 전파에서는 균일 양자화를 적용하고, 역방향 전파에서는 직통 추정기(STE)로 그래디언트를 근사한다. 양자화 레벨(step size Δ)은 학습 가능한 파라미터로 설정하여 코드워드 분포에 적응한다. 4비트 양자화로 부동소수점 수준에 근접하는 NMSE를 달성한다.",

  "Deep Learning Based CSI Feedback Approach for Time-Varying Massive MIMO Channels":
    "MarkovNet은 차분 인코딩 기반 시간적 CSI 피드백 아키텍처이다. 현재 CSI와 이전 복원 CSI의 차이(ΔH)만을 인코딩하여 피드백 정보량을 줄인다. CSI 시퀀스의 마르코프 체인 특성을 활용하여 시간 예측 네트워크가 이전 상태로부터 현재 상태를 추정하고, 차분 인코더가 예측 잔차만 전송한다. 고이동성 시변 채널에서 효과적이다.",

  "Binarized Neural Network for CSI Feedback in Massive MIMO Systems":
    "BCsiNet은 가중치와 활성화를 모두 +1/-1로 이진화하는 이진 신경망(BNN)을 CSI 피드백에 적용한 아키텍처이다. XNOR-비트카운트 연산으로 합성곱을 근사하여 메모리와 계산량을 극단적으로 줄인다. Sign 함수의 그래디언트를 STE로 근사하여 학습하며, 배치 정규화와 스케일링 팩터로 정보 손실을 완화한다. 하드웨어 제약이 큰 IoT 장치에서의 배포를 목표로 한다.",

  "Knowledge Distillation-Based DNN for CSI Feedback in Massive MIMO Systems":
    "지식 증류 프레임워크로, 대형 교사 네트워크(teacher)의 지식을 소형 학생 네트워크(student)에 전달한다. 교사 네트워크는 큰 CsiNet/CRNet이며, 학생 네트워크는 채널 수와 레이어를 줄인 경량 구조이다. 손실 함수는 원본 CSI와의 NMSE(hard label)와 교사 출력과의 MSE(soft label)를 결합한다. 학생 네트워크가 교사의 중간 특징 분포를 모방하도록 학습하여 파라미터 대비 높은 성능을 달성한다.",

  "Attention Mechanism-Based CSI Feedback Network for Massive MIMO Systems":
    "공간 주의와 채널 주의를 결합한 듀얼 어텐션 기반 CSI 피드백 아키텍처이다. 공간 주의는 CSI 행렬의 각 공간 위치에 가중치를 부여하여 중요 영역을 강조하고, 채널 주의는 특징 맵 채널 간의 상호의존성을 모델링한다. 두 어텐션 모듈이 병렬 또는 직렬로 결합되어 인코더/디코더에 적용되며, 기존 CNN 백본에 플러그인 방식으로 추가할 수 있다.",

  "CSI-GPT: Integrating Generative Pre-Trained Transformer with Federated Learning for CSI Feedback":
    "CSI-GPT는 GPT 스타일의 자기회귀 트랜스포머를 CSI 피드백에 적용한 아키텍처이다. CSI 코드워드를 토큰 시퀀스로 변환하고, 자기회귀적으로 다음 토큰을 예측하는 방식으로 CSI를 압축/복원한다. 연합학습(Federated Learning)을 통해 여러 기지국의 데이터를 프라이버시를 보장하면서 집계하여 모델을 학습한다. 사전학습된 대규모 모델의 일반화 능력을 CSI 도메인에 활용한다.",

  "Deep Learning-Based CSI Feedback with Variable Length Codewords for Adaptive MIMO":
    "점진적 인코딩(Progressive Encoding) 기반의 가변 레이트 CSI 피드백 아키텍처이다. 인코더가 CSI를 여러 단계로 나누어 점진적으로 인코딩하며, 채널 상태에 따라 전송할 코드워드 길이를 적응적으로 선택한다. 각 단계의 인코딩은 이전 단계의 복원 잔차를 입력으로 받아 점진적으로 정밀도를 높인다. 고정 레이트 방식 대비 채널 적응성이 뛰어나다.",

  "Lightweight CSI Feedback via Mixed-Precision Quantization":
    "혼합 정밀도 양자화 프레임워크로, 네트워크의 각 레이어에 서로 다른 비트폭을 할당한다. 레이어 민감도 분석을 통해 출력 변화에 민감한 레이어에는 높은 정밀도를, 둔감한 레이어에는 낮은 정밀도를 부여한다. 전체 모델 크기 제약 하에서 최적의 비트 할당을 탐색하는 최적화 문제로 정식화되어 있다. 균일 양자화 대비 같은 모델 크기에서 더 낮은 NMSE를 달성한다.",

  "Pruning Deep Neural Networks for Efficient CSI Feedback":
    "구조적 가지치기(Structured Pruning) 기반의 CSI 피드백 네트워크 경량화 아키텍처이다. 각 합성곱 필터의 중요도를 L1-norm 기반 점수로 평가하고, 점수가 낮은 필터를 제거한다. 가지치기 후 미세 조정(fine-tuning)을 통해 성능을 회복시킨다. 가지치기 비율에 따라 모델 크기-성능 트레이드오프를 조절할 수 있어, 다양한 하드웨어 제약에 적응 가능하다.",

  "Adaptive Bit Allocation for Deep Learning-Based CSI Feedback":
    "적응적 비트 할당 프레임워크로, 코드워드의 각 원소에 서로 다른 양자화 비트 수를 동적으로 할당한다. 레이트-왜곡 최적화(R-D Optimization) 관점에서, 주어진 총 비트 수 제약 하에 왜곡을 최소화하는 비트 할당을 학습한다. 중요도가 높은 코드워드 원소에 더 많은 비트를 할당하여 균일 양자화 대비 성능을 개선한다.",

  "ShuffleCsiNet: Lightweight CSI Feedback Network Based on ShuffleNet Architecture":
    "ShuffleCsiNet은 ShuffleNet의 채널 셔플 및 그룹 합성곱 기법을 CSI 피드백에 적용한 경량 아키텍처이다. 그룹 합성곱(Group Conv)으로 채널 간 연결을 제한하여 파라미터를 줄이고, 채널 셔플로 그룹 간 정보 교환을 가능하게 한다. 포인트별 그룹 합성곱과 채널 셔플을 반복 적용하는 ShuffleNet 단위를 인코더/디코더에 사용한다.",

  "Vector Quantized CSI Feedback with Learned Codebook":
    "VQ-VAE 기반의 벡터 양자화 CSI 피드백 아키텍처이다. 인코더가 CSI를 연속 잠재 벡터로 인코딩한 후, 학습된 코드북에서 가장 가까운 벡터로 양자화한다. 코드북은 최근접 이웃 할당의 EMA(Exponential Moving Average)로 갱신되며, commitment loss가 인코더 출력을 코드북 벡터 근처로 유도한다. 비트 단위 양자화 대신 벡터 단위 양자화로 코드워드 간 상관관계를 활용한다.",

  "Generative Diffusion Model-Enhanced CSI Feedback":
    "확산 모델(Diffusion Model) 기반 CSI 피드백 아키텍처이다. 순방향 확산 과정에서 CSI에 점진적으로 가우시안 노이즈를 추가하고, 조건부 역방향 과정에서 수신된 코드워드를 조건으로 노이즈를 제거하며 CSI를 복원한다. U-Net 기반의 노이즈 예측 네트워크가 각 확산 단계에서의 노이즈를 추정한다. 생성 모델의 강력한 분포 학습 능력으로 저압축비에서도 고품질 복원이 가능하다.",

  "Joint Compression and Quantization for Practical CSI Feedback":
    "압축과 양자화를 동시에 최적화하는 엔드투엔드 학습 프레임워크이다. 인코더-양자화기-디코더를 하나의 파이프라인으로 구성하여 압축 손실과 양자화 손실을 결합 손실 함수로 동시에 최소화한다. 양자화기의 비트 레이트를 미분 가능한 근사로 추정하여 역전파가 가능하다. 압축과 양자화를 분리하여 최적화하는 기존 방식 대비 전체 시스템 성능이 향상된다.",

  "Ternary Neural Network for Extreme-Efficient CSI Feedback":
    "삼진 신경망(Ternary Neural Network)으로, 가중치를 {-1, 0, +1} 세 값으로 양자화한다. 이진 신경망(BNN)에 0을 추가하여 더 유연한 표현이 가능하며, 최적 임계값(threshold)을 학습하여 삼진화 경계를 결정한다. 곱셈이 덧셈으로 대체되어 이진 신경망에 준하는 계산 효율을 달성하면서, BNN 대비 복원 성능이 개선된다.",

  "AiANet: Attention-Infused Autoencoder for Massive MIMO CSI Compression":
    "AiANet은 지역 인식 어텐션(Local-Aware Attention)을 오토인코더에 통합한 CSI 압축 아키텍처이다. 인코더의 합성곱 블록에 지역 어텐션 모듈이 부착되어, 공간적으로 인접한 CSI 원소들 간의 상관관계를 집중적으로 학습한다. 전역 어텐션의 높은 계산 비용 대신 지역 창(window) 내에서만 어텐션을 계산하여 효율성과 성능을 동시에 추구한다.",

  "SLATE: SwinLSTM Autoencoder for Temporal-Spatial-Frequency CSI Compression":
    "SLATE는 Swin Transformer의 이동 창(Shifted Window) 어텐션과 LSTM의 시간 모델링을 결합한 SwinLSTM 셀을 핵심 블록으로 사용한다. 공간 및 주파수 차원에서는 Swin Transformer의 지역/전역 어텐션으로 특징을 추출하고, 시간 차원에서는 LSTM 게이트로 프레임 간 의존성을 모델링한다. 시간-공간-주파수 3차원을 통합 처리하는 오토인코더 구조이다.",

  "Quantization Design for Deep Learning-Based CSI Feedback":
    "CSI 피드백을 위한 양자화 설계 프레임워크로, 적응적 결합 손실 함수와 비균일 비트 할당을 제안한다. 학습 중 NMSE와 양자화 왜곡을 동시에 최소화하는 적응적 가중치 결합 손실을 사용하며, 코드워드 원소별 중요도에 따라 비균일하게 비트를 할당한다. 균일 양자화와 균등 비트 할당의 한계를 동시에 극복한다.",

  "InvCSINet: Invertible Networks with Endogenous Quantization for CSI Feedback":
    "InvCSINet은 가역 신경망(Invertible Neural Network)을 CSI 피드백에 적용한 아키텍처이다. 가역 변환(Invertible Transform)으로 CSI를 잠재 공간으로 매핑하며, 역변환으로 정확한 복원이 가능하다. 내생적 양자화기(DAQ)가 가역 네트워크 내부에 통합되어 압축-양자화를 일체화한다. 정보 손실 없는 가역 변환의 특성으로 양자화 노이즈에 강건하다.",

  "SemCSINet: Semantic-Aware CSI Feedback Network in Massive MIMO Systems":
    "SemCSINet은 의미 통신(Semantic Communication) 개념을 CSI 피드백에 도입한 아키텍처이다. CSI 행렬에서 통신 성능에 중요한 의미적 특징만을 선별적으로 추출하는 의미적 임베딩 모듈을 갖추고 있다. 불필요한 정보를 제거하고 의미적으로 중요한 특징만 전송하여 피드백 효율을 극대화한다.",

  "RD-JSCC: Residual Diffusion for Variable-Rate Joint Source-Channel Coding of CSI":
    "RD-JSCC는 소스 코딩(CSI 압축)과 채널 코딩을 분리하지 않고 하나의 신경망으로 결합하는 JSCC(Joint Source-Channel Coding) 아키텍처이다. 잔차 확산(Residual Diffusion) 과정을 도입하여 채널 노이즈에 강건한 복원이 가능하며, 확산 단계 수를 조절하여 가변 레이트를 실현한다. 물리적 채널의 노이즈 특성을 학습에 직접 반영한다.",

  "WiFo-CF: Wireless Foundation Model for CSI Feedback":
    "WiFo-CF는 무선 통신 도메인의 파운데이션 모델(Foundation Model) 아키텍처이다. 대규모 CSI 데이터로 사전학습된 기반 모델 위에 S-R MoE(Sparse-to-Regular Mixture of Experts) 레이어를 탑재한다. MoE 레이어가 입력 CSI의 특성에 따라 전문가(expert) 네트워크를 동적으로 선택하여 처리한다. 한 번 사전학습된 모델을 다양한 시나리오에 미세 조정하여 적용할 수 있다.",

  "EG-CsiNet: Generalizable Learning for Massive MIMO CSI Feedback in Unseen Scenarios":
    "EG-CsiNet은 미지의(unseen) 시나리오에 일반화 가능한 CSI 피드백 아키텍처이다. 채널 클러스터 분해(Channel Cluster Decomposition)로 CSI를 클러스터 단위 성분으로 분해하고, 각 클러스터를 독립적으로 처리한 후 재결합한다. 클러스터 단위 처리를 통해 학습 시 보지 못한 새로운 채널 환경에서도 안정적인 복원 성능을 유지한다.",

  "LVM4CF: CSI Feedback with Offline Large Vision Models":
    "LVM4CF는 대규모 비전 모델(Large Vision Model)의 사전학습된 표현을 CSI 피드백에 활용하는 아키텍처이다. CSI 행렬을 이미지처럼 취급하여 비전 모델의 인코더로 특징을 추출하고, 비전-CSI 코드북으로 매핑한다. 오프라인으로 사전학습된 비전 모델의 풍부한 표현 능력을 CSI 도메인에 전이하여, 적은 CSI 학습 데이터로도 높은 성능을 달성한다.",

  "Semantic Pilot Design for Channel Estimation Using a Large Language Model":
    "대규모 언어 모델(LLM)을 채널 추정에 활용하는 의미적 파일럿 설계 아키텍처이다. LLM이 채널 환경의 의미적 설명(텍스트)을 입력받아 최적 파일럿 패턴을 생성하며, 의미적 파일럿 신뢰도를 통해 추정의 불확실성을 정량화한다. 자연어로 표현된 채널 환경 정보를 활용하여 파일럿 오버헤드를 줄이는 새로운 패러다임을 제시한다.",

  "Neural Discrete Representation Learning (VQ-VAE)":
    "VQ-VAE는 VAE(Variational Autoencoder)의 잠재 공간을 이산 코드북으로 대체한 생성 모델 아키텍처이다. 인코더가 입력을 연속 잠재 벡터로 인코딩한 후, 코드북에서 최근접 벡터로 양자화하여 이산 표현을 생성한다. 역전파는 STE로 양자화를 통과시키며, 코드북은 EMA로 갱신된다. commitment loss가 인코더 출력을 코드북 벡터 근처로 유도하여 안정적인 학습을 보장한다.",

  "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration":
    "AWQ는 LLM의 가중치를 활성화 분포에 기반하여 양자화하는 사후 학습(Post-Training) 양자화 기법이다. 활성화 크기에 비례하는 스케일링 변환을 가중치에 적용하여, 중요한 채널의 양자화 오류를 줄인다. 가중치만 양자화하고 활성화는 원래 정밀도를 유지하여, 3-4비트 양자화에서도 LLM의 성능 저하를 최소화한다.",

  "HAWQ-V3: Dyadic Neural Network Quantization":
    "HAWQ-V3는 헤시안(Hessian) 기반 민감도 분석으로 각 레이어의 최적 비트폭을 자동 결정하는 혼합 정밀도 양자화 프레임워크이다. 헤시안 행렬의 고유값으로 레이어 민감도를 측정하고, 정수 선형 프로그래밍(ILP)으로 모델 크기 제약 하 최적 비트 할당을 풀어낸다. '이진 분할(dyadic)' 양자화로 하드웨어 친화적인 2의 거듭제곱 스케일 팩터를 사용한다.",

  "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers":
    "GPTQ는 대규모 트랜스포머의 사후 학습 양자화를 위한 근사 2차(second-order) 방법이다. OBQ(Optimal Brain Quantization)의 열 단위 갱신을 행렬 수준으로 확장하여, 한 가중치를 양자화할 때 나머지 가중치로 오류를 보상한다. 보정(calibration) 데이터 소량만으로 3-4비트 양자화에서 원래 모델에 근접한 perplexity를 달성한다.",

  "Finite Scalar Quantization: VQ-VAE Made Simple (FSQ)":
    "FSQ는 VQ-VAE의 복잡한 코드북 학습을 제거하고, 각 잠재 차원을 유한 개의 정수 레벨로 단순 반올림하는 스칼라 양자화 기법이다. 코드북 갱신이나 commitment loss 없이, 잠재 벡터의 각 차원을 독립적으로 L개 레벨로 양자화한다. 코드북 크기 = L^d (d: 잠재 차원)로 결정되어 하이퍼파라미터 튜닝이 간단하다.",

  "SoundStream: An End-to-End Neural Audio Codec (Residual Vector Quantization)":
    "SoundStream은 잔차 벡터 양자화(RVQ)를 핵심으로 하는 엔드투엔드 신경 오디오 코덱이다. 인코더가 오디오를 잠재 벡터로 변환한 후, 여러 단계의 VQ를 순차 적용하여 각 단계에서 이전 단계의 양자화 잔차를 양자화한다. 각 단계가 이전 오류를 보정하여, 적은 코드북으로도 고품질 재구성이 가능하다. CSI 피드백의 벡터 양자화 연구에 핵심적인 참조 아키텍처이다.",

  "Vector Quantization for Deep-Learning-Based CSI Feedback with Shape-Gain Decomposition":
    "형상-이득 분해(Shape-Gain Decomposition) 기반의 VQ CSI 피드백 아키텍처이다. 코드워드를 단위 노름 방향 벡터(형상)와 스칼라 크기(이득)로 분해하여 각각 양자화한다. 형상 벡터의 양자화에는 그라스만 다양체 위의 코드북(Grassmannian Codebook)을 사용하며, 이를 통해 방향 정보를 효율적으로 표현한다. 벡터의 구조적 특성을 활용하여 일반 VQ 대비 양자화 효율을 개선한다."
};

let translated = 0;
let eqTranslated = 0;
let archAdded = 0;

for (const paper of data.papers) {
  const origTitle = paper.title;

  // Translate title
  if (titleMap[origTitle]) {
    paper.title = titleMap[origTitle];
    translated++;
  }

  // Translate equation names
  if (paper.key_equations) {
    for (const eq of paper.key_equations) {
      if (eqNameMap[eq.name]) {
        eq.name = eqNameMap[eq.name];
        eqTranslated++;
      }
    }
  }

  // Add architecture detail
  if (archMap[origTitle]) {
    paper.architecture_detail = archMap[origTitle];
    archAdded++;
  }
}

writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log(`Titles translated: ${translated}/40`);
console.log(`Equation names translated: ${eqTranslated}`);
console.log(`Architecture details added: ${archAdded}/40`);

// Validate JSON
try {
  JSON.parse(readFileSync(filePath, 'utf-8'));
  console.log('JSON validation: PASSED');
} catch (e) {
  console.error('JSON validation FAILED:', e.message);
}
