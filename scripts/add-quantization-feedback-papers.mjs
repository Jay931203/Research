#!/usr/bin/env node
/**
 * Add 3 foundational CSI quantization/feedback papers to the Supabase database
 * and create relationships between them and existing papers.
 *
 * Papers:
 *   1. Love & Heath 2003 — Grassmannian Beamforming
 *   2. Jindal 2006 — MIMO BC Finite-Rate Feedback
 *   3. Carpi et al. 2023 — Precoding-oriented CSI Feedback
 *
 * Run: node scripts/add-quantization-feedback-papers.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env.local');

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnv(ENV_PATH);
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase URL/Key in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── 3 New Papers ────────────────────────────────────────────────────────────

const PAPERS = [
  // ──────────────────────────── 1. Love & Heath 2003 ────────────────────────
  {
    title: 'Grassmannian Beamforming for Multiple-Input Multiple-Output Wireless Systems',
    authors: ['David J. Love', 'Robert W. Heath Jr.', 'Thomas Strohmer'],
    year: 2003,
    venue: 'IEEE Transactions on Information Theory, vol. 49, no. 10, pp. 2735-2747',
    arxiv_id: null,
    abstract: 'MIMO 무선 시스템에서 제한된 피드백 빔포밍의 기초를 정립한 논문. 수신기가 미리 정해진 코드북에서 최적 빔포밍 벡터의 인덱스(B 비트)만을 송신기에 피드백하는 양자화 빔포밍 기법을 제안한다. i.i.d. 레일리 페이딩 채널에서 최적 빔포밍 벡터의 분포가 Grassmann 다양체 위에서 균일 분포임을 이용하여, 코드북 설계 문제를 Grassmann 다양체 G(t,1) 위의 최대-최소 현 거리(chordal distance) 패킹 문제와 동치로 환원한다. 피드백 비트 수 B에 따른 용량 손실이 (t-1)·2^{-B/(t-1)}에 비례하여 감소하는 스케일링 법칙을 유도하고, 완전 다이버시티 차수를 보장하기 위한 최소 코드북 크기 경계를 제시한다. 이 논문은 LTE/5G NR의 코드북 기반 CSI 피드백 표준의 이론적 기반이 되었으며, 이후 모든 제한된 피드백 MIMO 연구의 출발점이다.',
    key_contributions: [
      '양자화 빔포밍 프레임워크 제안: 수신기가 코드북 내 최적 빔포밍 벡터의 인덱스(B 비트)만을 피드백하는 체계적 시스템 정립',
      'Grassmann 다양체 선 패킹과의 연결: 코드북 설계 문제를 G(t,1) 위의 최대-최소 현 거리 패킹 문제와 동치임을 증명',
      '최적 빔포밍 벡터 분포 유도: i.i.d. 레일리 페이딩에서 최적 빔포밍 벡터가 Grassmann 다양체 위에서 균일 분포임을 해석적으로 도출',
      '용량 손실 스케일링 법칙: 피드백 비트 B 증가에 따라 용량 손실이 2^{-B/(t-1)}로 지수적 감소함을 증명',
      '완전 다이버시티 차수 보장 조건: 코드북 크기 N >= t이면 t×r 완전 다이버시티 달성 가능',
      'LTE/5G NR 표준의 이론적 기반: Grassmannian 코드북 원리가 3GPP Type I/II 코드북의 근거',
    ],
    algorithms: ['Grassmannian Line Packing', 'Chordal Distance Codebook Design', 'Max-Min Distance Packing'],
    key_equations: [
      {
        name: '현 거리 (Chordal Distance)',
        latex: 'd_c(\\mathbf{w}_i, \\mathbf{w}_j) = \\sqrt{1 - |\\mathbf{w}_i^H \\mathbf{w}_j|^2}',
        description: 'Grassmann 다양체 G(t,1) 위 두 단위 벡터(1차원 부분공간) 사이의 현 거리. 빔포밍 코드북 설계에서 코드워드 간 분리도를 측정하는 핵심 메트릭.',
      },
      {
        name: 'Grassmann 코드북 설계 기준',
        latex: '\\mathcal{C}^* = \\arg\\max_{\\mathcal{C}} \\min_{i \\neq j} d_c(\\mathbf{w}_i, \\mathbf{w}_j) = \\arg\\min_{\\mathcal{C}} \\max_{i \\neq j} |\\mathbf{w}_i^H \\mathbf{w}_j|^2',
        description: '최적 코드북은 코드워드 쌍 간의 최소 현 거리를 최대화하는 것. Grassmann 다양체 위의 선 패킹 문제와 동치이며, 최대 상관을 최소화하는 것과 같다.',
      },
      {
        name: '양자화 빔포밍 수신 SNR',
        latex: '\\text{SNR} = \\frac{\\rho}{t} |\\mathbf{h}^H \\mathbf{w}_{\\hat{k}}|^2, \\quad \\hat{k} = \\arg\\max_{k} |\\mathbf{h}^H \\mathbf{w}_k|^2',
        description: '수신기는 N=2^B개 코드워드 중 채널 벡터 h와의 내적을 최대화하는 코드워드를 선택하여 인덱스를 B비트로 피드백한다.',
      },
      {
        name: '유한율 피드백 용량 손실 상한',
        latex: '\\Delta C \\leq \\log_2\\!\\left(1 + \\frac{\\rho}{t} \\cdot (t-1) \\cdot 2^{-\\frac{B}{t-1}}\\right)',
        description: '완전 채널 정보 대비 B비트 피드백 시 용량 손실의 상한. 피드백 비트 B 증가 시 손실이 지수적으로 감소하며, 감소율은 Grassmann 다양체의 실수 차원 2(t-1)에 결정된다.',
      },
      {
        name: '완전 다이버시티 최소 코드북 크기',
        latex: 'N \\geq t \\quad \\Longleftrightarrow \\quad B \\geq \\lceil \\log_2 t \\rceil',
        description: 't×r MIMO에서 완전 다이버시티 차수 t·r 달성을 위한 최소 코드북 크기는 송신 안테나 수 t 이상.',
      },
    ],
    architecture_detail: 'Grassmannian 빔포밍 코드북 설계의 핵심 방법론: (1) t개 송신, r개 수신 안테나 MIMO에서 수신기는 채널 H를 완전히 알지만, 송신기는 B비트 피드백만 수신. (2) N=2^B개의 단위 노름 벡터로 구성된 코드북을 사전에 공유. (3) i.i.d. 레일리 페이딩에서 최적 빔포밍 벡터의 분포가 Grassmann 다양체 위에서 균일 분포임을 이용. (4) 코드북 설계를 현 거리 기반 최대-최소 패킹 문제로 환원: 코드워드 간 최소 현 거리를 최대화. (5) Grassmann 다양체의 체적과 볼 패킹 밀도로부터 용량 손실 및 SNR 열화 경계 유도. 이 프레임워크는 유클리드 공간이 아닌 Grassmann 다양체의 기하학적 구조를 활용하여 방향 정보(direction)를 양자화하는 것이 핵심이다.',
    category: 'quantization',
    tags: ['limited_feedback', 'grassmannian', 'codebook_design', 'chordal_distance', 'MIMO_beamforming', 'line_packing', 'diversity', 'quantization_bounds', 'csi_quantization'],
    pdf_url: 'https://ieeexplore.ieee.org/document/1237152',
    code_url: null,
    color_hex: '#0ea5e9',
    difficulty_level: 'advanced',
    prerequisites: [
      'MIMO 무선 통신 기본 이론 (채널 모델, 다이버시티, 어레이 이득)',
      '선형대수학 (유니터리 행렬, 고유값 분해, 특이값 분해)',
      '미분기하학 기초 (다양체, 거리 메트릭, Grassmann 다양체)',
      '정보이론 기본 (채널 용량, 상호정보량)',
      '벡터 양자화 이론 기초',
    ],
    learning_objectives: [
      '제한된 피드백 환경에서 MIMO 빔포밍 문제가 왜 Grassmann 다양체 위의 양자화 문제로 귀결되는지 설명할 수 있다',
      '현 거리(chordal distance)의 정의와 이것이 빔포밍 코드북 설계에서 핵심 메트릭인 이유를 수학적으로 이해한다',
      '최대-최소 현 거리 패킹 기준으로 코드북을 설계하는 방법과 이것이 Grassmannian 선 패킹 문제와 동치임을 증명할 수 있다',
      '피드백 비트 수 B와 용량 손실 사이의 2^{-B/(t-1)} 스케일링 법칙을 유도할 수 있다',
      '완전 다이버시티 차수 보장을 위한 최소 코드북 크기 조건과 실제 LTE/5G 시스템에의 시사점을 논할 수 있다',
    ],
    self_check_questions: [
      'i.i.d. 레일리 페이딩에서 최적 빔포밍 벡터의 분포가 Grassmann 다양체 위에서 균일 분포인 이유와 이것이 코드북 설계에 어떻게 활용되는지 설명하라.',
      '현 거리(chordal distance)와 코드워드 간 상관(inner product)의 관계를 수식으로 쓰고, 최대-최소 패킹 기준이 최소-최대 상관 기준과 동치임을 보여라.',
      '피드백 비트 수 B를 1비트 증가시키면 용량 손실이 얼마나 감소하는가? 송신 안테나 수 t가 증가하면 동일 성능을 위한 피드백 비트 수는 어떻게 변하는가?',
      'Grassmannian 코드북과 랜덤 벡터 양자화(RVQ) 코드북의 성능 차이와, 실제 LTE/5G NR에서 코드북 기반 피드백이 어떻게 표준화되었는지 설명하라.',
    ],
  },

  // ──────────────────────────── 2. Jindal 2006 ──────────────────────────────
  {
    title: 'MIMO Broadcast Channels With Finite-Rate Feedback',
    authors: ['Nihar Jindal'],
    year: 2006,
    venue: 'IEEE Transactions on Information Theory, vol. 52, no. 11, pp. 5045-5060',
    arxiv_id: 'cs/0603065',
    abstract: '다중 송신 안테나를 갖는 하향링크(브로드캐스트) 채널에서 유한 레이트 피드백의 영향을 분석한 핵심 논문. 각 수신기가 자신의 채널 벡터를 B비트로 양자화하여 송신기에 피드백할 때, 제로포싱(ZF) 빔포밍 하에서 사용자당 레이트 손실이 log₂(1 + P·2^{-B/(M-1)})로 상한됨을 유도한다. 여기서 핵심 결과는 피드백 비트 수 B가 (M-1)log₂(SNR)에 비례하여 증가해야 완전한 다중화 이득을 달성할 수 있다는 스케일링 법칙이다. 이는 피드백을 SNR과 함께 증가시킬 필요가 없는 점대점(point-to-point) MIMO와 극명하게 대조된다. 랜덤 벡터 양자화(RVQ)를 분석 도구로 활용하여 양자화 오차 E[sin²θ] ≤ 2^{-B/(M-1)} 바운드를 도출하며, 고SNR에서 양자화 오차에 의한 잔류 다중사용자 간섭이 시스템의 성능 병목이 됨을 보인다. 이 논문은 Massive MIMO에서 CSI 피드백 오버헤드가 핵심 병목으로 작용하는 이유를 이론적으로 설명하며, CsiNet 등 딥러닝 기반 CSI 압축 연구의 근본적 동기를 제공한다.',
    key_contributions: [
      '유한 레이트 피드백 모델 정립: 각 수신기가 채널 벡터를 B비트로 양자화하여 피드백하는 다중사용자 MIMO 하향링크 시스템 모델 체계화',
      '레이트 손실 상한 유도: ZF 빔포밍 하에서 유한 레이트 피드백으로 인한 사용자당 레이트 손실의 닫힌 형태 상한 도출',
      '랜덤 벡터 양자화(RVQ) 분석 기법 도입: 고정 코드북 분석의 난해함을 극복하기 위해 RVQ를 바운딩 도구로 활용',
      '양자화 오차 상한 E[sin²θ] ≤ 2^{-B/(M-1)} 도출',
      '핵심 스케일링 법칙 발견: B = (M-1)log₂(SNR)으로 스케일링해야 제한된 레이트 갭 유지',
      '점대점 MIMO와의 근본적 차이 규명: 브로드캐스트 채널에서는 피드백 비트를 SNR과 함께 반드시 증가시켜야 함',
    ],
    algorithms: ['Random Vector Quantization (RVQ)', 'Zero-Forcing Beamforming', 'Quantization Error Analysis'],
    key_equations: [
      {
        name: '양자화 오차 상한 (RVQ 바운드)',
        latex: '\\mathbb{E}[\\sin^2\\theta] \\leq 2^{-\\frac{B}{M-1}}',
        description: '채널 방향 벡터와 양자화된 코드워드 사이의 각도 오차 기댓값 상한. B는 피드백 비트 수, M은 송신 안테나 수. 피드백 비트 증가 시 양자화 오차가 지수적으로 감소.',
      },
      {
        name: '사용자당 레이트 손실 상한',
        latex: '\\Delta R \\leq \\log_2\\!\\left(1 + P \\cdot 2^{-\\frac{B}{M-1}}\\right)',
        description: '유한 레이트 피드백으로 인한 사용자당 레이트 손실의 상한. P는 총 송신 전력(SNR). 완벽한 CSIT 대비 양자화 CSIT로 인한 레이트 저하를 정량화.',
      },
      {
        name: '피드백 비트 스케일링 법칙',
        latex: 'B = (M-1) \\log_2(P)',
        description: '제한된 레이트 갭 유지를 위한 피드백 비트 수의 스케일링 법칙. SNR P 증가 시 B를 (M-1)log₂(P)로 스케일링하면 레이트 손실이 유한 상수로 바운드. 이것이 본 논문의 가장 핵심적인 결과.',
      },
      {
        name: '양자화된 ZF 빔포밍의 SINR',
        latex: '\\text{SINR}_k = \\frac{\\frac{P}{M}|\\mathbf{h}_k^H \\mathbf{w}_k|^2}{1 + \\frac{P}{M}\\sum_{j \\neq k}|\\mathbf{h}_k^H \\mathbf{w}_j|^2}',
        description: '양자화된 채널 정보 기반 ZF 빔포밍 시 k번째 사용자의 SINR. 분모의 합은 불완전한 양자화로 인해 완전히 제거되지 않는 잔류 다중사용자 간섭.',
      },
    ],
    architecture_detail: '본 논문의 핵심 분석 도구는 랜덤 벡터 양자화(RVQ)이다. RVQ에서는 코드북의 2^B개 코드워드를 M차원 복소 단위 구 상에서 등방적으로 독립 생성한다. 각 수신기는 자신의 채널 벡터 h_k의 방향을 코드북 C = {w_1, ..., w_{2^B}} 중 내적이 최대인 코드워드로 양자화하고, 송신기는 양자화된 방향으로 ZF 빔포밍 벡터를 계산한다. 양자화 오차로 인해 다중사용자 간섭이 완전히 제거되지 않아 잔류 간섭이 발생하며, 이 잔류 간섭의 크기는 sin²θ(채널 방향과 양자화 방향 사이 각도)에 비례한다. 고SNR에서 잔류 간섭이 SNR에 비례하여 증가하므로(interference-limited), 양자화 정밀도를 SNR과 함께 높여야 하며, 이로부터 B = (M-1)log₂(P) 스케일링 법칙이 도출된다.',
    category: 'quantization',
    tags: ['limited_feedback', 'MIMO_broadcast', 'zero_forcing', 'random_vector_quantization', 'scaling_law', 'rate_loss', 'multiuser_MIMO', 'csi_quantization', 'feedback_bits'],
    pdf_url: 'https://arxiv.org/pdf/cs/0603065',
    code_url: null,
    color_hex: '#8b5cf6',
    difficulty_level: 'advanced',
    prerequisites: [
      'MIMO 시스템 기초 (채널 모델, 빔포밍)',
      '다중사용자 MIMO 하향링크 (브로드캐스트 채널) 개념',
      '제로포싱 빔포밍 (Zero-Forcing Beamforming)',
      '벡터 양자화 (Vector Quantization) 기초',
      '정보이론 기본 (채널 용량, 상호정보량)',
    ],
    learning_objectives: [
      'MIMO 브로드캐스트 채널에서 유한 레이트 피드백이 시스템 성능에 미치는 영향을 정량적으로 분석할 수 있다',
      '랜덤 벡터 양자화(RVQ) 기법의 원리와 양자화 오차 바운드 유도 과정을 설명할 수 있다',
      '피드백 비트 수 B가 (M-1)log₂(SNR)로 스케일링되어야 하는 이유를 수학적으로 증명할 수 있다',
      '점대점 MIMO와 다중사용자 MIMO에서 피드백 요구사항이 근본적으로 다른 이유를 이해하고 설명할 수 있다',
      '제로포싱 빔포밍에서 양자화 오차가 잔류 간섭으로 변환되는 메커니즘을 분석할 수 있다',
    ],
    self_check_questions: [
      '점대점 MIMO에서는 피드백 비트를 SNR과 함께 증가시킬 필요가 없는데, 브로드캐스트 채널에서는 반드시 증가시켜야 하는 근본적 차이점은 무엇인가?',
      '레이트 손실 상한 ΔR ≤ log₂(1 + P·2^{-B/(M-1)})에서 B = (M-1)log₂(P)를 대입하면 어떤 결과를 얻는가? 이것이 왜 중요한가?',
      '랜덤 벡터 양자화(RVQ)는 실제 시스템의 코드북과 어떻게 다르며, 왜 분석 도구로 유용한가?',
      '송신 안테나 수 M이 증가하면 필요한 피드백 비트 수는 어떻게 변하는가? 이것이 Massive MIMO에 주는 시사점은?',
    ],
  },

  // ──────────────────────────── 3. Carpi et al. 2023 ────────────────────────
  {
    title: 'Precoding-oriented Massive MIMO CSI Feedback Design',
    authors: ['Fabrizio Carpi', 'Sivarama Venkatesan', 'Jinfeng Du', 'Harish Viswanathan', 'Siddharth Garg', 'Elza Erkip'],
    year: 2023,
    venue: 'ICC 2023 — IEEE International Conference on Communications, pp. 4973-4978',
    arxiv_id: '2302.11526',
    abstract: '다운링크 대규모 MIMO에서 CSI 피드백의 패러다임을 전환한 논문. 기존 CsiNet 계열이 채널 행렬 복원(MSE 최소화)에 초점을 맞춘 반면, 본 논문은 최종 목표인 프리코딩 성능(합산 달성 전송률)을 직접 최적화하는 프리코딩 지향(precoding-oriented) 피드백 프레임워크를 제안한다. 학습된 다운링크 파일럿, 사용자 측 DNN 압축기, 양자화기, 신경 엔트로피 코더, 기지국 측 디코더를 포함하는 종단간(end-to-end) 아키텍처를 설계하고, 합산 전송률에서 피드백 오버헤드를 뺀 형태의 손실 함수를 제안한다. 핵심 통찰은 기지국 디코더가 채널 행렬을 명시적으로 복원하지 않고 피드백 코드워드에서 직접 프리코딩 행렬을 출력한다는 점이다. 특히 낮은 피드백 오버헤드 영역에서 CSI 복원과 프리코딩을 분리하는 기존 방법보다 높은 합산 전송률을 달성하며, 이는 제한된 피드백 자원 하에서 채널의 "프리코딩에 관련된 정보"만 선택적으로 전달하는 것이 최적임을 실증한다.',
    key_contributions: [
      '태스크 지향 CSI 피드백 패러다임: 채널 복원(MSE) 대신 프리코딩 성능(합산 전송률)을 직접 최적화하는 프레임워크 제안',
      '종단간 딥러닝 아키텍처: 학습된 파일럿 → 사용자 DNN 압축기 → 양자화 → 엔트로피 코딩 → BS 디코더의 완전한 end-to-end 시스템',
      '프리코딩 지향 손실 함수: 합산 달성 전송률 - 피드백 오버헤드 비용의 미분 가능한 손실 함수로 성능-오버헤드 트레이드오프를 학습에 반영',
      '채널 복원 없는 직접 프리코딩: 기지국 디코더가 Ĥ를 거치지 않고 피드백에서 직접 V를 출력',
      '학습된 파일럿 시퀀스: DFT 파일럿 대비 적은 수의 파일럿으로 프리코딩에 필요한 핵심 채널 정보를 추출',
      '낮은 오버헤드에서의 우월성: 제한된 피드백 비트에서 분리 설계(CsiNet 계열) 대비 높은 합산 전송률 달성',
    ],
    algorithms: ['End-to-End Precoding-Oriented Feedback', 'Learned Pilot Design', 'Neural Entropy Coding', 'DNN-based Precoder Generation'],
    key_equations: [
      {
        name: '사용자별 달성 가능 전송률',
        latex: 'R_k = \\log_2\\!\\left(1 + \\frac{|\\mathbf{h}_k^H \\mathbf{v}_k|^2}{\\sum_{j \\neq k} |\\mathbf{h}_k^H \\mathbf{v}_j|^2 + \\sigma_w^2}\\right)',
        description: '사용자 k의 SINR 기반 달성 가능 전송률. 분자는 원하는 신호 전력, 분모는 다중사용자 간섭 전력과 잡음의 합. 이 전송률의 합이 시스템 합산 전송률.',
      },
      {
        name: '프리코딩 지향 손실 함수',
        latex: '\\mathcal{L} = -\\sum_{k=1}^{K} R_k + \\lambda \\cdot \\text{Overhead}(\\{b_k\\}_{k=1}^K)',
        description: '핵심 손실 함수. 합산 전송률의 음수(최대화) + 피드백 오버헤드 페널티. 기존 CsiNet의 MSE 손실 대신 최종 태스크(프리코딩) 성능을 직접 최적화.',
      },
      {
        name: '신경망 기반 직접 프리코딩',
        latex: '\\mathbf{V} = f_\\phi^{\\text{dec}}(\\{\\mathbf{q}_k\\}_{k=1}^K) \\in \\mathbb{C}^{M \\times K}, \\quad \\text{s.t. } \\text{Tr}(\\mathbf{V}\\mathbf{V}^H) \\leq P',
        description: '기지국 디코더 DNN이 모든 사용자의 양자화된 피드백 q_k로부터 직접 프리코딩 행렬 V를 출력. 채널을 명시적으로 복원하지 않는 것이 핵심.',
      },
      {
        name: 'mmWave 채널 모델',
        latex: '\\mathbf{h}_k = \\frac{1}{\\sqrt{L_p}} \\sum_{l=1}^{L_p} \\alpha_{l,k}\\, \\mathbf{a}_t(\\theta_{l,k})',
        description: 'mmWave 채널: L_p개의 경로에 대해 복소 이득 α와 ULA 어레이 응답 벡터의 가중합. 시뮬레이션에서 M=64, K=2, L_p=2 사용.',
      },
    ],
    architecture_detail: '종단간 프리코딩 지향 CSI 피드백 시스템: [사용자 측] 기지국이 전송한 학습된 파일럿 시퀀스 X̃를 통해 다운링크 파일럿 관측값 y_k 수신 → DNN 인코더 f_enc가 y_k를 연속 잠재 벡터 z_k로 변환 (차원 D=256) → 양자화기가 z_k를 이산 코드워드로 양자화 → 엔트로피 코더가 가변 길이 비트스트림으로 압축하여 업링크 피드백. [기지국 측] 엔트로피 디코더가 비트스트림 복원 → DNN 디코더 f_dec가 모든 사용자의 양자화된 피드백을 입력받아 직접 프리코딩 행렬 V 출력. 기존 방법(CsiNet 등)과의 핵심 차이: CsiNet은 인코더→디코더로 H를 복원 → 복원된 Ĥ로 ZF/MMSE 프리코딩 계산(2단계 분리), 본 논문은 피드백에서 직접 프리코더 생성(종단간 1단계).',
    category: 'csi_compression',
    tags: ['precoding_oriented', 'task_oriented', 'end_to_end_learning', 'FDD_massive_MIMO', 'sum_rate_optimization', 'learned_pilots', 'neural_entropy_coding', 'deep_learning_csi_feedback', 'csi_compression'],
    pdf_url: 'https://arxiv.org/pdf/2302.11526',
    code_url: null,
    color_hex: '#f59e0b',
    difficulty_level: 'advanced',
    prerequisites: [
      '대규모 MIMO 시스템 기초 (안테나 배열, 빔포밍, 프리코딩)',
      'FDD 시스템에서의 CSI 피드백 문제',
      '선형 프리코딩 기법 (MRT, ZF, MMSE/RZF)',
      '딥러닝 오토인코더 구조 및 종단간 학습',
      'CsiNet (Wen et al., 2018) — DL 기반 CSI 피드백의 시초',
    ],
    learning_objectives: [
      'CSI 피드백에서 채널 복원(reconstruction-oriented)과 프리코딩 지향(precoding-oriented) 접근법의 근본적 차이를 설명할 수 있다',
      '프리코딩 지향 손실 함수가 합산 전송률을 직접 최적화하는 원리와 기존 MSE 손실 대비 장단점을 분석할 수 있다',
      '종단간 학습 아키텍처의 각 구성 요소(학습된 파일럿 → 압축기 → 양자화/엔트로피 코딩 → BS 디코더) 역할을 설명할 수 있다',
      '피드백 오버헤드와 합산 전송률 간 트레이드오프를 분석하고, 낮은 오버헤드에서 프리코딩 지향 접근이 유리한 이유를 논증할 수 있다',
      '고전적 코드북 기반 양자화(Love & Heath, Jindal)에서 DL 기반 압축(CsiNet), 태스크 지향 피드백(본 논문)으로의 연구 발전 흐름을 조망할 수 있다',
    ],
    self_check_questions: [
      'CsiNet 계열이 MSE를 최소화하는 반면, 본 논문이 합산 전송률을 직접 최적화하는 이유는? 채널 복원 정확도가 높다고 해서 반드시 프리코딩 성능이 좋아지지 않는 이유를 설명하라.',
      '기지국 디코더가 왜 채널 Ĥ를 복원하지 않고 직접 프리코딩 행렬 V를 출력하는가? 정보 이론적 관점에서의 이점을 논의하라.',
      '학습된 파일럿 시퀀스가 DFT 파일럿보다 적은 수로도 효과적인 이유와 전체 오버헤드에 미치는 영향을 분석하라.',
      '낮은 피드백 비트에서 프리코딩 지향이 분리 설계보다 우수하지만, 높은 비트에서는 차이가 줄어드는 이유를 직관적으로 설명하라.',
    ],
  },
];

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('CSI Quantization/Feedback 논문 3개 추가 시작...\n');

  // 1. Find existing related paper IDs
  const { data: allPapers } = await supabase
    .from('papers')
    .select('id, title')
    .order('title');

  if (!allPapers) {
    console.error('기존 논문 목록 조회 실패');
    process.exit(1);
  }

  // Helper to find paper ID by partial title match
  const findPaper = (keyword) => {
    const found = allPapers.find(p => p.title.toLowerCase().includes(keyword.toLowerCase()));
    return found ? found.id : null;
  };

  const EXISTING = {
    CSINET:       findPaper('CsiNet') || findPaper('csinet'),
    CSINET_LSTM:  findPaper('CsiNet-LSTM') || findPaper('LSTM'),
    TRANSNET:     findPaper('TransNet'),
    DEEPCMC:      findPaper('DeepCMC'),
    VQ_VAE:       findPaper('VQ-VAE') || findPaper('Vector Quantized'),
    DLCSI:        findPaper('Deep Learning') && findPaper('CSI'),
  };

  console.log('기존 논문 ID:', JSON.stringify(EXISTING, null, 2), '\n');

  // 2. Insert papers
  const insertedIds = {};
  for (const paper of PAPERS) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('papers')
      .select('id, title')
      .ilike('title', `%${paper.title.substring(0, 30)}%`);

    if (existing && existing.length > 0) {
      console.log(`  이미 존재: ${existing[0].title.substring(0, 60)}... (id: ${existing[0].id})`);
      insertedIds[paper.title.substring(0, 20)] = existing[0].id;
      continue;
    }

    const { data, error } = await supabase
      .from('papers')
      .insert(paper)
      .select('id, title')
      .single();

    if (error) {
      console.error(`삽입 실패: ${paper.title.substring(0, 50)}...`, error.message);
      continue;
    }

    console.log(`추가: ${data.title.substring(0, 60)}... (id: ${data.id})`);
    insertedIds[paper.title.substring(0, 20)] = data.id;
  }

  const LOVE_ID   = insertedIds['Grassmannian Beamfo'];
  const JINDAL_ID = insertedIds['MIMO Broadcast Chan'];
  const CARPI_ID  = insertedIds['Precoding-oriented '];

  if (!LOVE_ID || !JINDAL_ID || !CARPI_ID) {
    console.error('일부 논문 ID를 얻지 못했습니다. 관계 추가를 건너뜁니다.');
    console.log('IDs:', { LOVE_ID, JINDAL_ID, CARPI_ID });
    return;
  }

  console.log('\n관계 추가 시작...\n');

  // 3. Insert relationships
  const RELATIONSHIPS = [
    // Love & Heath → Jindal (inspires)
    {
      from_paper_id: LOVE_ID,
      to_paper_id: JINDAL_ID,
      relationship_type: 'inspires',
      description: 'Jindal의 MIMO BC 유한 피드백 분석은 Love & Heath의 Grassmannian 코드북 설계를 다중사용자 시나리오로 확장한다. 코드북 기반 채널 방향 양자화의 오차 모델을 브로드캐스트 채널의 레이트 손실 분석에 활용.',
      strength: 9,
    },
    // Jindal → Carpi (inspires)
    {
      from_paper_id: JINDAL_ID,
      to_paper_id: CARPI_ID,
      relationship_type: 'inspires',
      description: 'Carpi의 프리코딩 지향 피드백은 Jindal이 밝힌 "피드백 비트 대비 레이트 손실" 트레이드오프를 딥러닝으로 최적화하려는 시도. Jindal의 스케일링 법칙은 DL 기반 피드백의 성능 기준선으로 활용된다.',
      strength: 8,
    },
    // Love & Heath → Carpi (inspires)
    {
      from_paper_id: LOVE_ID,
      to_paper_id: CARPI_ID,
      relationship_type: 'inspires',
      description: 'Carpi의 연구는 Love & Heath의 코드북 기반 고정 구조 양자화를 학습 기반 적응적 양자화로 대체한다. Grassmannian 코드북이 고정된 구조적 코드북이라면, DNN 인코더는 채널 통계에 적응하는 학습된 코드북에 해당.',
      strength: 7,
    },
    // Carpi → CsiNet (challenges: MSE is suboptimal)
    ...(EXISTING.CSINET ? [{
      from_paper_id: CARPI_ID,
      to_paper_id: EXISTING.CSINET,
      relationship_type: 'challenges',
      description: 'Carpi는 CsiNet의 MSE 기반 채널 복원이 프리코딩 최적이 아님을 보인다. 채널 복원 정확도가 높아도 프리코딩 성능은 반드시 좋아지지 않으며, 합산 전송률을 직접 최적화하는 종단간 접근이 특히 낮은 피드백에서 우수.',
      strength: 8,
    }] : []),
    // Love & Heath ↔ existing quantization papers
    ...(EXISTING.VQ_VAE ? [{
      from_paper_id: LOVE_ID,
      to_paper_id: EXISTING.VQ_VAE,
      relationship_type: 'related',
      description: 'Love & Heath의 Grassmannian 코드북은 고전적 구조적 양자화이고, VQ-VAE는 학습 기반 벡터 양자화이다. 둘 다 채널 정보를 이산 코드워드로 양자화하는 문제를 다루며, Grassmann 다양체 vs 학습된 잠재 공간에서의 양자화를 비교할 수 있다.',
      strength: 6,
    }] : []),
  ];

  let relOk = 0;
  for (const rel of RELATIONSHIPS) {
    const { error } = await supabase
      .from('paper_relationships')
      .insert(rel);

    if (error) {
      if (error.message?.includes('duplicate') || error.code === '23505') {
        console.log(`  이미 존재하는 관계: ${rel.description.substring(0, 50)}...`);
      } else {
        console.error(`관계 삽입 실패:`, error.message);
      }
    } else {
      relOk++;
      console.log(`관계: ${rel.relationship_type} (strength ${rel.strength})`);
    }
  }

  console.log(`\n완료! 논문 3개, 관계 ${relOk}/${RELATIONSHIPS.length}개 추가.`);
  console.log('\n추가된 논문 ID:');
  console.log(`   Love & Heath 2003: ${LOVE_ID}`);
  console.log(`   Jindal 2006:       ${JINDAL_ID}`);
  console.log(`   Carpi 2023:        ${CARPI_ID}`);
}

main().catch(console.error);
