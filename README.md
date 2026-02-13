# CSI AutoEncoder 연구 시각화 웹

> CSI (Channel State Information) AutoEncoder 관련 연구들을 인터랙티브하게 탐색하고 학습하는 개인용 웹 애플리케이션

![Project Status](https://img.shields.io/badge/status-planning-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![React Flow](https://img.shields.io/badge/React_Flow-visualization-orange)

---

## 📚 프로젝트 개요

본 프로젝트는 CSI AutoEncoder compression 연구와 관련된 다양한 논문들을 시각적으로 탐색하고, 논문 간의 관계를 마인드맵으로 표현하며, 개인 학습 노트를 관리할 수 있는 웹 애플리케이션입니다.

### 주요 기능

- 🗺️ **인터랙티브 마인드맵**: 논문 간 연속성과 영향 관계를 노드/엣지 그래프로 시각화
- 📄 **논문 상세 뷰**: 제목, 저자, 핵심 수식(KaTeX), 알고리즘, 기여도 한눈에 파악
- ✍️ **학습 관리**: 익숙함 레벨 체크, 개인 메모 작성, 즐겨찾기 기능
- 🔍 **검색 및 필터**: 연도, 카테고리, 태그, 익숙함 레벨로 필터링
- 📥 **Import/Export**: CSV/JSON 가져오기, Markdown/PDF 내보내기

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL + Realtime) |
| **시각화** | React Flow, D3.js |
| **수식 렌더링** | KaTeX |
| **상태 관리** | Zustand, SWR |

---

## 🚀 빠른 시작

### 1. Prerequisites

- Node.js 18+
- npm 또는 yarn
- Supabase 계정 (무료)

### 2. 설치

```bash
# 저장소 클론 (또는 프로젝트 생성)
cd CSIAutoEncoder

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 Supabase URL과 Key 입력
```

### 3. Supabase 설정

1. [Supabase Dashboard](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 마이그레이션 파일 순차 실행:
   - `supabase/migrations/001_create_papers_table.sql`
   - `supabase/migrations/002_create_relationships_table.sql`
   - `supabase/migrations/003_create_user_notes_table.sql`
   - `supabase/migrations/004_create_views.sql`

3. `.env.local` 파일 수정:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. 초기 데이터 로드 (선택)

```bash
# 개발 모드 실행 후, 앱에서 Import 기능 사용
# public/data/initial-papers.json 파일 import
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📁 프로젝트 구조

```
CSIAutoEncoder/
├── docs/                    # 프로젝트 문서
│   └── PROJECT_DESIGN.md    # 상세 설계 문서
├── public/
│   └── data/                # 초기 데이터 (JSON)
├── supabase/
│   └── migrations/          # DB 마이그레이션 SQL
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React 컴포넌트
│   │   ├── layout/
│   │   ├── visualization/   # 마인드맵 관련
│   │   ├── papers/          # 논문 관련
│   │   └── notes/           # 메모 관련
│   ├── lib/
│   │   ├── supabase/        # DB 쿼리 함수
│   │   ├── visualization/   # 그래프 레이아웃
│   │   └── utils/           # 유틸리티
│   ├── hooks/               # React 커스텀 훅
│   ├── types/               # TypeScript 타입
│   └── store/               # 상태 관리 (Zustand)
└── README.md
```

---

## 📊 데이터 모델

### Papers (논문)
- 제목, 저자, 연도, venue, 초록
- 핵심 기여도, 알고리즘, 수식 (LaTeX)
- 카테고리, 태그, PDF/코드 링크

### Paper Relationships (관계)
- `extends`: 확장/개선
- `builds_on`: 기반으로 함
- `compares_with`: 비교 대상
- `inspired_by`: 영감
- 기타: `challenges`, `applies`, `related`

### User Notes (학습 노트)
- 익숙함 레벨: not_started, difficult, moderate, familiar, expert
- 개인 메모 (Markdown)
- 중요도 평가 (1-5)
- 즐겨찾기

자세한 내용은 [PROJECT_DESIGN.md](docs/PROJECT_DESIGN.md) 참조

---

## 🗓️ 개발 로드맵

- [x] **Phase 0**: 프로젝트 설계 및 계획 수립
- [ ] **Phase 1**: Next.js + Supabase 초기화
- [ ] **Phase 2**: 데이터 레이어 구축
- [ ] **Phase 3**: 기본 UI 레이아웃
- [ ] **Phase 4**: 마인드맵 시각화
- [ ] **Phase 5**: 논문 상세 모달
- [ ] **Phase 6**: 학습 관리 기능
- [ ] **Phase 7**: Import/Export
- [ ] **Phase 8**: 최적화 및 UX 개선
- [ ] **Phase 9**: 테스트 및 문서화
- [ ] **Phase 10**: 배포

**예상 개발 기간**: 3-4주

---

## 📖 문서

- [프로젝트 상세 설계](docs/PROJECT_DESIGN.md): 전체 아키텍처, 컴포넌트, 개발 로드맵
- ~~아키텍처 문서~~ (개발 중)
- ~~개발 가이드~~ (개발 중)
- ~~데이터 모델 문서~~ (개발 중)

---

## 🤝 기여

개인 프로젝트이지만, 피드백 및 제안은 언제나 환영합니다!

---

## 📄 라이선스

MIT License (또는 선호하는 라이선스)

---

## 👤 작성자

**Your Name**
- 연구 주제: CSI AutoEncoder Compression (Encoder 경량화 + Quantization)
- 관련 논문: CSINet, TransNet, CSI-PPPNet, ACCCINet 등

---

## 🙏 참고 자료

### 주요 논문
1. **CSINet** (2018): 첫 CSI AutoEncoder 프레임워크
2. **TransNet** (2021): Transformer 기반 CSI Feedback
3. **CSI-PPPNet** (2022): Phase-Preserving 압축
4. **ACCCINet** (2023): Attention 기반 적응형 압축

### 기술 스택 문서
- [Next.js 14 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [React Flow 문서](https://reactflow.dev)
- [KaTeX 문서](https://katex.org)

---

**🚧 현재 상태**: 프로젝트 설계 완료, Phase 1 준비 중
