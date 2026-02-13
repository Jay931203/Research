# CSI AutoEncoder 연구 시각화 인터랙티브 웹 애플리케이션 설계

**프로젝트 버전**: v1.0
**작성일**: 2026-02-13
**설계자**: Claude Code Plan Agent

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 디렉토리 구조](#프로젝트-디렉토리-구조)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [주요 컴포넌트](#주요-컴포넌트)
6. [개발 로드맵](#개발-로드맵)
7. [기술적 결정사항](#기술적-결정사항)
8. [핵심 파일](#핵심-파일)

---

## 프로젝트 개요

### 목적
CSI AutoEncoder compression 연구(encoder 경량화 + quantization)와 관련된 유관 연구들을 한눈에 파악하고 관리할 수 있는 개인용 웹 애플리케이션

### 핵심 기능
1. **연구 시각화**
   - 각 논문의 기술, 원리, 핵심 수식, 알고리즘, 기여도를 카드/상세 뷰로 표시
   - LaTeX 수식을 KaTeX로 렌더링

2. **관계 시각화**
   - 연구들 간의 연속성과 영향 관계를 마인드맵/그래프로 표현
   - 인터랙티브한 노드 탐색 (줌, 드래그, 클릭 상세보기)

3. **개인 학습 관리**
   - 각 논문/개념에 대한 익숙함 체크 (5단계)
   - 개인 메모 작성 및 저장
   - DB에 영구 저장되어 세션 간 유지

4. **로그인 불필요**
   - 개인용이므로 로컬/단일 사용자 환경
   - Supabase에 데이터는 저장하되 간단한 로컬 세션

---

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (UI 상태) + SWR (서버 상태)

### Backend
- **BaaS**: Supabase (PostgreSQL + Realtime)
- **Database**: PostgreSQL (Supabase 제공)

### Visualization
- **Graph Library**: React Flow
- **Layout**: Dagre + Force-Directed (선택 가능)
- **Math Rendering**: KaTeX

### Development
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest + React Testing Library (선택적)

---

## 프로젝트 디렉토리 구조

```
c:\Users\hyunj\CSIAutoEncoder\
├── .env.local                          # Supabase 환경 변수
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── README.md
│
├── public/
│   ├── data/                          # 초기 논문 데이터 (JSON/CSV)
│   │   └── initial-papers.json
│   └── images/                        # 논문 관련 이미지/다이어그램
│
├── supabase/                          # Supabase 관련 설정
│   ├── migrations/
│   │   ├── 001_create_papers_table.sql
│   │   ├── 002_create_relationships_table.sql
│   │   ├── 003_create_user_notes_table.sql
│   │   └── 004_create_views.sql
│   └── seed.sql                       # 초기 데이터 삽입
│
├── docs/                              # 프로젝트 문서
│   ├── PROJECT_DESIGN.md              # 이 문서
│   ├── ARCHITECTURE.md                # 아키텍처 문서
│   ├── DEVELOPMENT.md                 # 개발 가이드
│   └── DATA_MODEL.md                  # 데이터 모델 설명
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # 메인 페이지 (대시보드)
│   │   ├── globals.css                # Global styles + Tailwind
│   │   └── api/                       # API routes (필요시)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx             # 앱 헤더
│   │   │   ├── Sidebar.tsx            # 논문 리스트 사이드바
│   │   │   └── MainLayout.tsx         # 전체 레이아웃
│   │   │
│   │   ├── visualization/
│   │   │   ├── MindMap.tsx            # React Flow 마인드맵 ⭐
│   │   │   ├── CustomNode.tsx         # 커스텀 노드
│   │   │   ├── CustomEdge.tsx         # 커스텀 엣지
│   │   │   ├── MindMapControls.tsx    # 줌/필터 컨트롤
│   │   │   └── GraphLegend.tsx        # 그래프 범례
│   │   │
│   │   ├── papers/
│   │   │   ├── PaperCard.tsx          # 논문 카드
│   │   │   ├── PaperDetailModal.tsx   # 논문 상세 모달 ⭐
│   │   │   ├── PaperList.tsx          # 논문 리스트
│   │   │   ├── PaperSearch.tsx        # 검색/필터
│   │   │   └── PaperEquation.tsx      # 수식 렌더링
│   │   │
│   │   ├── notes/
│   │   │   ├── NoteEditor.tsx         # 메모 작성
│   │   │   ├── FamiliaritySelector.tsx # 익숙함 레벨
│   │   │   └── NotesList.tsx          # 메모 히스토리
│   │   │
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Supabase 클라이언트
│   │   │   ├── papers.ts              # Papers 쿼리 ⭐
│   │   │   ├── relationships.ts       # Relationships 쿼리
│   │   │   └── notes.ts               # Notes 쿼리
│   │   │
│   │   ├── visualization/
│   │   │   ├── graphLayout.ts         # 레이아웃 알고리즘
│   │   │   └── graphUtils.ts          # 유틸리티
│   │   │
│   │   └── utils/
│   │       ├── latex.ts               # KaTeX 헬퍼
│   │       ├── dataParser.ts          # CSV/JSON 파싱
│   │       └── export.ts              # Export 기능
│   │
│   ├── hooks/
│   │   ├── usePapers.ts               # Papers 훅
│   │   ├── useRelationships.ts        # Relationships 훅
│   │   ├── useNotes.ts                # Notes 훅
│   │   ├── useGraphData.ts            # 그래프 데이터 변환 ⭐
│   │   └── useSession.ts              # 로컬 세션
│   │
│   ├── types/
│   │   ├── paper.ts                   # Paper 타입
│   │   ├── relationship.ts            # Relationship 타입
│   │   ├── note.ts                    # Note 타입
│   │   └── graph.ts                   # Graph/Node/Edge 타입
│   │
│   └── store/
│       └── useAppStore.ts             # Zustand 스토어
│
└── scripts/
    ├── seed-data.ts                   # 초기 데이터 삽입
    └── export-markdown.ts             # Export 스크립트
```

**⭐ = 핵심 파일**

---

## 데이터베이스 스키마

### 1. Papers 테이블

**목적**: 논문 정보 저장

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | Primary Key |
| title | TEXT | 논문 제목 |
| authors | TEXT[] | 저자 배열 |
| year | INTEGER | 발표 연도 |
| venue | TEXT | 학회/저널명 |
| doi | TEXT | DOI |
| arxiv_id | TEXT | arXiv ID |
| abstract | TEXT | 초록 |
| key_contributions | TEXT[] | 주요 기여도 |
| algorithms | TEXT[] | 알고리즘명 |
| key_equations | JSONB | 수식 배열 (name, latex, description) |
| category | ENUM | 카테고리 (csi_compression, autoencoder 등) |
| tags | TEXT[] | 태그 |
| pdf_url | TEXT | PDF 링크 |
| code_url | TEXT | 코드 링크 |
| color_hex | TEXT | 노드 색상 |
| created_at | TIMESTAMPTZ | 생성 시각 |
| updated_at | TIMESTAMPTZ | 수정 시각 |

**인덱스**:
- year, category, tags (검색 최적화)
- title (전문 검색)

### 2. Paper Relationships 테이블

**목적**: 논문 간 관계 저장

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | Primary Key |
| from_paper_id | UUID | 출발 논문 (FK) |
| to_paper_id | UUID | 도착 논문 (FK) |
| relationship_type | ENUM | 관계 타입 (extends, builds_on 등) |
| description | TEXT | 관계 설명 |
| strength | INTEGER | 관계 강도 (1-10) |
| created_at | TIMESTAMPTZ | 생성 시각 |

**관계 타입**:
- `extends`: 확장/개선
- `builds_on`: 기반으로 함
- `compares_with`: 비교 대상
- `inspired_by`: 영감을 받음
- `challenges`: 도전/반박
- `applies`: 적용
- `related`: 관련

**제약조건**:
- UNIQUE(from_paper_id, to_paper_id, relationship_type)
- 자기 참조 방지

### 3. User Notes 테이블

**목적**: 사용자 학습 데이터 저장

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | Primary Key |
| paper_id | UUID | 논문 ID (FK) |
| session_id | TEXT | 세션 ID (기본값: 'default_user') |
| familiarity_level | ENUM | 익숙함 레벨 |
| is_favorite | BOOLEAN | 즐겨찾기 여부 |
| last_read_at | TIMESTAMPTZ | 마지막 읽은 시각 |
| note_content | TEXT | 메모 내용 (Markdown) |
| importance_rating | INTEGER | 중요도 (1-5) |
| personal_tags | TEXT[] | 개인 태그 |
| created_at | TIMESTAMPTZ | 생성 시각 |
| updated_at | TIMESTAMPTZ | 수정 시각 |

**익숙함 레벨**:
- `not_started`: 아직 읽지 않음
- `difficult`: 어려움
- `moderate`: 보통
- `familiar`: 익숙함
- `expert`: 전문가 수준

**제약조건**:
- UNIQUE(paper_id, session_id)

### 4. Views

#### papers_with_notes
논문 + 노트 통합 뷰 (JOIN)

#### relationship_graph
관계 + 논문 정보 통합 뷰

---

## 주요 컴포넌트

### Layout Components

#### MainLayout.tsx
- **역할**: 전체 앱 레이아웃
- **구조**: Header + Sidebar + Main Content
- **상태**: 사이드바 열림/닫힘

#### Header.tsx
- **기능**: 로고, 제목, Import/Export 버튼, 검색

#### Sidebar.tsx
- **기능**: 논문 리스트, 검색/필터, 정렬

### Visualization Components

#### MindMap.tsx ⭐
- **역할**: React Flow 기반 마인드맵 핵심
- **기능**:
  - useGraphData로 데이터 변환
  - 노드 클릭 → 상세 모달
  - 줌/팬 컨트롤
  - 레이아웃 알고리즘 적용

#### CustomNode.tsx
- **표시**: 논문 제목, 연도, 익숙함 배지
- **스타일**: 카테고리별 색상

#### CustomEdge.tsx
- **표시**: 관계 타입별 스타일
- **기능**: 호버 시 툴팁

### Paper Components

#### PaperDetailModal.tsx ⭐
- **섹션**:
  - 기본 정보 (제목, 저자, 연도, venue)
  - 초록 및 기여도
  - 수식 (KaTeX)
  - 관련 논문
  - 메모 에디터
  - 익숙함 선택기

#### PaperEquation.tsx
- **기능**: KaTeX로 LaTeX 수식 렌더링

### Notes Components

#### NoteEditor.tsx
- **기능**: Markdown 입력, 자동 저장, 태그 입력

#### FamiliaritySelector.tsx
- **UI**: 5단계 아이콘 선택

---

## 개발 로드맵

### Phase 1: 프로젝트 기반 설정 (1-2일)

**Tasks**:
1. Next.js 14 프로젝트 초기화
   ```bash
   npx create-next-app@latest csi-autoencoder-viz --typescript --tailwind --app
   ```

2. 필수 패키지 설치
   ```bash
   npm install @supabase/supabase-js reactflow katex zustand dagre
   npm install @types/katex @types/dagre date-fns lucide-react
   npm install swr react-markdown
   ```

3. Supabase 프로젝트 생성 및 환경 변수 설정

4. 데이터베이스 스키마 생성 (SQL 마이그레이션 실행)

5. 디렉토리 구조 생성

**Deliverables**: 실행 가능한 Next.js 앱, Supabase 연결

---

### Phase 2: 데이터 레이어 구축 (2-3일)

**Tasks**:
1. Supabase 클라이언트 초기화
2. TypeScript 타입 정의
3. 데이터베이스 쿼리 함수 (CRUD)
4. React 훅 구현 (usePapers, useRelationships, useNotes)
5. 초기 시드 데이터 준비

**Deliverables**: 완전한 데이터 레이어, 타입 안전성

---

### Phase 3: 기본 UI 레이아웃 (3-4일)

**Tasks**:
1. MainLayout, Header, Sidebar 구현
2. PaperCard, PaperList 구현
3. 검색/필터 UI
4. 상태 관리 통합 (Zustand)

**Deliverables**: 기능하는 사이드바 + 논문 리스트

---

### Phase 4: 마인드맵 시각화 (4-5일)

**Tasks**:
1. React Flow 기본 설정
2. CustomNode, CustomEdge 구현
3. 그래프 레이아웃 알고리즘 (Dagre)
4. 인터랙션 (클릭, 호버, 줌/팬)
5. 컨트롤 및 범례

**Deliverables**: 완전한 인터랙티브 마인드맵

---

### Phase 5: 논문 상세 모달 (2-3일)

**Tasks**:
1. PaperDetailModal 구현
2. PaperEquation (KaTeX) 구현
3. 관련 논문 섹션
4. 외부 링크

**Deliverables**: 완전한 논문 상세 뷰

---

### Phase 6: 개인 학습 관리 (2-3일)

**Tasks**:
1. FamiliaritySelector 구현
2. NoteEditor (Markdown, 자동 저장)
3. 즐겨찾기 기능
4. 로컬 세션 관리

**Deliverables**: 완전한 학습 관리 시스템

---

### Phase 7: Import/Export (2-3일)

**Tasks**:
1. CSV/JSON Import
2. JSON/Markdown/PDF Export
3. 데이터 검증

**Deliverables**: Import/Export 기능

---

### Phase 8: 최적화 및 UX (2-3일)

**Tasks**:
1. 성능 최적화 (React.memo, useMemo)
2. 로딩/에러 상태
3. 애니메이션
4. 접근성

**Deliverables**: 부드러운 UX

---

### Phase 9: 테스트 및 문서화 (2일)

**Tasks**:
1. 단위/E2E 테스트 (선택적)
2. 문서 작성 (README, ARCHITECTURE 등)

**Deliverables**: 프로젝트 문서

---

### Phase 10: 배포 (1-2일)

**Tasks**:
1. Vercel 배포
2. Supabase 프로덕션 설정
3. 성능 모니터링

**Deliverables**: 배포된 앱

---

## 기술적 결정사항

### 1. 상태 관리: Zustand (선택)

**이유**:
- 전역 상태 복잡도 낮음
- 보일러플레이트 적음
- SWR과 조합 용이

**트레이드오프**:
- Context API는 의존성 없지만 리렌더링 이슈

### 2. 데이터 페칭: SWR (선택)

**이유**:
- Next.js와 자연스러운 통합
- 캐싱, 재검증 기본 제공
- Supabase Realtime 조합 가능

### 3. 그래프 레이아웃: Dagre + Force-Directed

**이유**:
- Dagre: 계층적 구조에 적합
- Force-Directed: 자연스러운 클러스터링
- 사용자 전환 가능

### 4. 인증: 로그인 없음 (로컬 세션)

**이유**:
- 개인용 앱
- 로컬 스토리지 UUID 세션 ID
- 향후 Supabase Auth 마이그레이션 용이

### 5. 수식 렌더링: KaTeX

**이유**:
- 빠르고 가벼움
- Next.js SSR 지원
- 대부분 LaTeX 수식 지원

---

## 핵심 파일

개발 시 가장 중요한 5개 파일:

1. **src/components/visualization/MindMap.tsx**
   - React Flow 통합 중심점

2. **src/hooks/useGraphData.ts**
   - 데이터 → 노드/엣지 변환 핵심 로직

3. **src/lib/supabase/papers.ts**
   - 모든 논문 CRUD 기반

4. **src/components/papers/PaperDetailModal.tsx**
   - 주요 사용자 인터페이스

5. **supabase/migrations/001_create_papers_table.sql**
   - 데이터베이스 스키마 기초

---

## 다음 단계

1. Phase 1부터 순차적 진행
2. 각 Phase 완료 후 테스트
3. 필요시 우선순위 조정

**예상 총 개발 기간**: 3-4주

---

**문서 종료**
