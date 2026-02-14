# CSI AutoEncoder Research Visualization

## Project Overview

CSI(Channel State Information) AutoEncoder 압축 연구 논문들을 인터랙티브하게 탐색·학습하는 **개인용 연구 시각화 웹 애플리케이션**.

- **Version**: v2.1 (진행 중)
- **Language**: Korean (UI/데이터 전체 한국어)
- **Auth**: 없음 (단일 사용자, session_id='default_user')

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS 3.4 (dark mode) |
| State | Zustand 5 (UI) + SWR 2.4 (서버 데이터) |
| Backend | Supabase (PostgreSQL + PostgREST) |
| Visualization | React Flow 11 + Dagre (DAG layout) |
| Math | KaTeX 0.16 (LaTeX 수식 렌더링) |
| Icons | Lucide React |
| Fonts | Noto Sans KR + JetBrains Mono |

## Project Structure

```
src/
├── app/                    # Pages (App Router)
│   ├── page.tsx            # Landing
│   ├── dashboard/          # Main hub (graph + reminders)
│   ├── paper/[id]/         # Paper study page (ToC, learning guide)
│   ├── import/             # JSON import tool
│   ├── glossary/           # Glossary search
│   └── test/               # Supabase connection test
├── components/
│   ├── layout/             # Header, Sidebar, MainLayout
│   ├── visualization/      # MindMap, CustomNode, CustomEdge, Controls, Legend
│   ├── papers/             # PaperCard, PaperDetailModal, PaperEquation, PaperFormModal
│   ├── notes/              # NoteEditor, FamiliaritySelector
│   └── common/             # Toast, Skeleton, CommandPalette, ErrorBoundary, ThemeProvider
├── hooks/                  # usePapers, useGraphData, useNotes, useRelationships, useGlossary, useKeyboardShortcuts
├── lib/
│   ├── supabase/           # client.ts, papers.ts, relationships.ts, notes.ts (CRUD)
│   ├── papers/insights.ts  # Recommendation engine (bridge scoring, review queue)
│   ├── visualization/      # graphLayout.ts (Dagre), graphUtils.ts (styles)
│   └── utils/export.ts     # Markdown/JSON export
├── types/                  # paper.ts, relationship.ts, note.ts, graph.ts, glossary.ts
└── store/                  # useAppStore.ts, useToastStore.ts
```

## Key Files (핵심 파일)

1. `src/components/visualization/MindMap.tsx` - 듀얼뷰 마인드맵 (그래프+리스트)
2. `src/lib/papers/insights.ts` - 추천/스코어링 엔진 (2-hop bridge)
3. `src/components/papers/PaperDetailModal.tsx` - 논문 상세 모달
4. `src/hooks/useGraphData.ts` - 데이터 → React Flow 변환
5. `src/lib/supabase/papers.ts` - Papers CRUD
6. `src/app/paper/[id]/page.tsx` - 논문 학습 페이지

## Database (Supabase)

### Tables
- **papers**: 40+ 논문 (title, authors, year, abstract, key_equations JSONB, category, tags, difficulty, prerequisites, learning_objectives, self_check_questions)
- **paper_relationships**: 86+ 관계 (from/to paper FK, type ENUM, strength 1-10)
- **user_notes**: 학습 메모 (familiarity_level, note_content, importance_rating, personal_tags)

### Views
- `papers_with_notes` - 논문 + 노트 JOIN
- `relationship_graph` - 관계 + 양쪽 논문 정보
- `paper_statistics` - 카테고리별 통계

### Migrations (순차 실행)
`supabase/migrations/001~009_*.sql`

### Category ENUM
`csi_compression | autoencoder | quantization | transformer | cnn | other`

### Relationship Type ENUM
`extends | builds_on | compares_with | inspired_by | inspires | challenges | applies | related`

### Familiarity Level ENUM
`not_started | difficult | moderate | familiar | expert`

## Development

```bash
npm run dev      # localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

### Path Alias
`@/*` → `./src/*`

### Conventions
- Commit prefix: `feat:`, `fix:`, `chore:`, `db:`
- Korean UI text throughout
- Tailwind `dark:` variants for all components
- SWR hooks for all Supabase data fetching
- Zustand for UI-only state (modals, sidebar, toasts)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase anon key>
```

## Scripts (data pipeline)

`scripts/` 폴더에 논문 메타데이터 enrichment 스크립트 (Python + Node.js):
- `enhance_papers.py` - 논문 상세 정보 보강
- `translate-papers.mjs` - 한국어 번역
- `update-descriptions.mjs` - 설명 생성
- `check-missing.mjs` - 누락 필드 검증

## Current Status & Known Issues

### Completed (v2.0~2.1)
- 듀얼뷰 마인드맵 + 2-hop 추천
- 논문 학습 페이지 (ToC, 학습 가이드)
- 용어집 (22 terms)
- 40개 논문 + 86개 관계 한국어 번역
- Toast, Skeleton, 키보드 단축키, 다크모드

### Pending
- Vercel 배포 (Phase 10)
- 논문 데이터 추가 enrichment
- 접근성(a11y) 강화
- 성능 최적화 (pagination, lazy loading)
- 커밋되지 않은 변경사항 정리

### Known Issues
- CRLF/LF 줄바꿈 불일치 (Windows)
- KaTeX dangerouslySetInnerHTML 사용
- 모든 논문 한번에 로드 (pagination 없음)
- 일부 optional 필드 null vs undefined 불일치
