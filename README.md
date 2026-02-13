# CSI AutoEncoder 연구 시각화 웹

> CSI (Channel State Information) AutoEncoder 관련 연구들을 인터랙티브하게 탐색하고 학습하는 개인용 웹 애플리케이션

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![React Flow](https://img.shields.io/badge/React_Flow-visualization-orange)

---

## 주요 기능

- **인터랙티브 마인드맵**: 논문 간 관계를 듀얼뷰(그래프/리스트)로 시각화
- **논문 상세 뷰**: 제목, 저자, 핵심 수식(KaTeX), 알고리즘, 기여도 한눈에 파악
- **핵심 리마인드**: 논문별 one-liner, 체크포인트, 기대 결과 자동 생성
- **2-hop 추천**: 가중치 기반 브리지 논문 추천 알고리즘
- **학습 관리**: 익숙함 5단계, 개인 메모(Markdown), 중요도, 즐겨찾기
- **검색 및 필터**: 연도, 카테고리, 태그, 익숙함 레벨로 필터링
- **키보드 단축키**: Ctrl+K 검색, ? 도움말
- **다크 모드**: Light / Dark / System 3-way 토글
- **Import/Export**: JSON 가져오기, Markdown/JSON 내보내기

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL) |
| **시각화** | React Flow, Dagre |
| **수식 렌더링** | KaTeX |
| **상태 관리** | Zustand, SWR |

---

## 빠른 시작

```bash
# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local에 Supabase URL과 Key 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### Supabase 설정

1. [Supabase Dashboard](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 마이그레이션 파일 순차 실행:
   - `supabase/migrations/001_create_papers_table.sql`
   - `supabase/migrations/002_create_relationships_table.sql`
   - `supabase/migrations/003_create_user_notes_table.sql`
   - `supabase/migrations/004_create_views.sql`
   - `supabase/migrations/005_graph_optimization_and_recommendations.sql`

---

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router (대시보드, Import, 시스템점검)
├── components/
│   ├── layout/          # Header, Sidebar, MainLayout
│   ├── visualization/   # MindMap, CustomNode, CustomEdge
│   ├── papers/          # PaperDetailModal, PaperCard, PaperEquation
│   ├── notes/           # NoteEditor, FamiliaritySelector
│   └── common/          # Toast, Skeleton, CommandPalette, ScrollToTop
├── hooks/               # usePapers, useGraphData, useKeyboardShortcuts
├── lib/                 # Supabase CRUD, insights 엔진, 그래프 레이아웃
├── store/               # Zustand (앱 상태, 토스트)
└── types/               # TypeScript 타입 정의
```

자세한 설계는 [docs/PROJECT_DESIGN.md](docs/PROJECT_DESIGN.md) 참조

---

## 라이선스

MIT License
