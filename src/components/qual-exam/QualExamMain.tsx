'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen, BrainCircuit, ChevronLeft, ChevronRight,
  ClipboardList, FileText, GraduationCap, Menu, X,
} from 'lucide-react';
import TopicDetail from './TopicDetail';
import ExamProblemCard from './ExamProblemCard';
import ExamProblemModal from './ExamProblemModal';
import PracticeModal from './PracticeModal';
import PracticeList from './PracticeList';
import { DSA_TOPICS, DSA_EXAM_PROBLEMS, DSA_PRACTICE_QUESTIONS } from '@/data/qual-exam/dsa-data';
import { PROG_TOPICS, PROG_EXAM_PROBLEMS, PROG_PRACTICE_QUESTIONS } from '@/data/qual-exam/prog-data';
import type { StudyTopic } from './TopicStudyCard';
import type { ExamProblem } from './ExamProblemCard';
import type { QuizQuestion } from './PracticeList';

type Subject = 'dsa' | 'prog';
type View = { kind: 'topics' } | { kind: 'exams' };

function semLabel(s: '1' | '2') { return s === '1' ? '1학기' : '2학기'; }

/* ── Section definitions (IDs must match content components) ── */
const CUSTOM_SECTIONS: Record<string, Array<{ id: string; label: string }>> = {
  'asymptotic': [
    { id: 'asymptotic-sec-growth',     label: '성장률 비교'     },
    { id: 'asymptotic-sec-notations',  label: '표기법 5종'      },
    { id: 'asymptotic-sec-properties', label: '핵심 성질'       },
    { id: 'asymptotic-sec-master',     label: '마스터 정리'     },
    { id: 'asymptotic-sec-amortized',  label: '분할 상환 분석'  },
    { id: 'asymptotic-sec-recurrence', label: '점화식 예시'     },
  ],
  'linked-list': [
    { id: 'linked-list-sec-compare',     label: '배열 vs LL'        },
    { id: 'linked-list-sec-array-sim',   label: '배열 시뮬레이터'    },
    { id: 'linked-list-sec-ll-viz',      label: 'LL/스택/큐 시각화' },
    { id: 'linked-list-sec-stack-queue', label: '스택 vs 큐'         },
    { id: 'linked-list-sec-code',        label: '코드 예시'          },
  ],
  'heap': [
    { id: 'heap-sec-concept',    label: '힙 개념'           },
    { id: 'heap-sec-sim',        label: 'Min-Heap 시뮬레이터'},
    { id: 'heap-sec-build',      label: 'Build-Heap 트레이스'},
    { id: 'heap-sec-heapsort',   label: 'HeapSort 추적'     },
    { id: 'heap-sec-complexity', label: '복잡도 & 주의사항'  },
  ],
  'bst': [
    { id: 'bst-sec-property',   label: 'BST 속성'          },
    { id: 'bst-sec-traversal',  label: '순회 4종 시각화'   },
    { id: 'bst-sec-insert',     label: '삽입 시뮬레이터'   },
    { id: 'bst-sec-delete',     label: '삭제 3케이스'       },
    { id: 'bst-sec-rbtree',     label: 'Red-Black Tree'    },
  ],
  'hash': [
    { id: 'hash-sec-concept',  label: '해시 개념 & 부하율' },
    { id: 'hash-sec-chain',    label: '체이닝 시뮬레이터'  },
    { id: 'hash-sec-probe',    label: '선형 프로빙 시뮬레이터'},
    { id: 'hash-sec-compare',  label: '방법 비교표'         },
    { id: 'hash-sec-perfect',  label: '완전 해시 & 유니버설 해싱' },
  ],
  'oop-basics': [
    { id: 'oop-basics-sec-access',   label: '접근 지정자 시뮬레이터' },
    { id: 'oop-basics-sec-initlist', label: '초기화 리스트'          },
    { id: 'oop-basics-sec-ctors',    label: '생성자 종류'            },
    { id: 'oop-basics-sec-statics',  label: 'const·this·static'     },
  ],
  'constructors': [
    { id: 'constructors-sec-order',  label: '생성/소멸 순서'         },
    { id: 'constructors-sec-copy',   label: '얕은/깊은 복사'         },
    { id: 'constructors-sec-r3',     label: 'Rule of Three'          },
    { id: 'constructors-sec-assign', label: '복사 대입 연산자'        },
  ],
  'memory-management': [
    { id: 'memory-sec-layout',   label: '스택 vs 힙 시각화'     },
    { id: 'memory-sec-pointer',  label: '포인터 연산 탐색기'     },
    { id: 'memory-sec-offbyone', label: 'Off-by-One 시뮬레이터'  },
    { id: 'memory-sec-swap',     label: '포인터 Swap 함정'       },
  ],
  'virtual-functions': [
    { id: 'virtual-sec-dispatch', label: '정적 vs 동적 바인딩'   },
    { id: 'virtual-sec-vtable',   label: 'vtable 시각화'         },
    { id: 'virtual-sec-tracer',   label: '함수 호출 추적기'       },
    { id: 'virtual-sec-dtor',     label: '가상 소멸자'            },
  ],
  'polymorphism-abstract': [
    { id: 'abstract-sec-concepts', label: '추상 클래스 체크'      },
    { id: 'abstract-sec-clone',    label: 'clone() 패턴'          },
    { id: 'abstract-sec-exam',     label: '빈칸 채우기'            },
  ],
  'linked-list-impl': [
    { id: 'linked-list-impl-sec-builder', label: 'append 시뮬레이터' },
    { id: 'linked-list-impl-sec-dtor',    label: '소멸자 step player' },
    { id: 'linked-list-impl-sec-reverse', label: '재귀 vs 반복 뒤집기' },
  ],
  'stack-queue-impl': [
    { id: 'stack-queue-sec-stack', label: 'Stack 시뮬레이터'  },
    { id: 'stack-queue-sec-queue', label: 'Queue 시뮬레이터'  },
    { id: 'stack-queue-sec-trace', label: '실행 결과 추적'    },
  ],
  'templates': [
    { id: 'templates-sec-trace',         label: 'Pair<int> 추적'    },
    { id: 'templates-sec-constraints',   label: 'T 타입 제약 체커'   },
    { id: 'templates-sec-instantiation', label: '컴파일 타임 인스턴스화' },
  ],
  'sorting': [
    { id: 'sorting-sec-compare',    label: '알고리즘 비교표'         },
    { id: 'sorting-sec-quicksort',  label: 'QuickSort 파티션 시뮬'  },
    { id: 'sorting-sec-mergesort',  label: 'MergeSort 추적'         },
    { id: 'sorting-sec-lowerbound', label: '정렬 하한 & 선형 정렬'  },
    { id: 'sorting-sec-pitfalls',   label: '주의사항 퀴즈'          },
  ],
  'dp': [
    { id: 'dp-sec-concept',  label: 'DP 핵심 개념'           },
    { id: 'dp-sec-lcs',      label: 'LCS DP 테이블'          },
    { id: 'dp-sec-knapsack', label: 'Knapsack DP 테이블'     },
    { id: 'dp-sec-edit',     label: '편집 거리'              },
    { id: 'dp-sec-greedy',   label: 'Greedy vs DP'           },
  ],
  'graph': [
    { id: 'graph-sec-bfsdfs',    label: 'BFS/DFS 시각화'     },
    { id: 'graph-sec-dijkstra',  label: 'Dijkstra 추적'      },
    { id: 'graph-sec-bellman',   label: 'Bellman-Ford'       },
    { id: 'graph-sec-topo',      label: '위상 정렬'          },
    { id: 'graph-sec-mst',       label: 'MST (Kruskal/Prim)' },
    { id: 'graph-sec-complexity', label: '복잡도 요약'        },
  ],
  'huffman': [
    { id: 'huffman-sec-concept',  label: '허프만 개념'         },
    { id: 'huffman-sec-sim',      label: '트리 빌드 시뮬레이터'},
    { id: 'huffman-sec-codes',    label: '코드 할당 & ABL'    },
    { id: 'huffman-sec-compare',  label: '고정 vs 허프만 비교' },
    { id: 'huffman-sec-pitfalls', label: '주의사항 퀴즈'       },
  ],
};

function getGenericSections(topic: StudyTopic): Array<{ id: string; label: string }> {
  const secs: Array<{ id: string; label: string }> = [
    { id: `${topic.id}-sec-keypoints`, label: '핵심 포인트' },
    { id: `${topic.id}-sec-theory`,    label: '이론 설명'   },
  ];
  if (topic.complexityTable?.length)
    secs.push({ id: `${topic.id}-sec-complexity`, label: '시간 복잡도' });
  if ((topic as { codeExamples?: unknown[] }).codeExamples?.length || topic.codeExample)
    secs.push({ id: `${topic.id}-sec-code`, label: '코드 예시' });
  if (topic.commonPitfalls?.length)
    secs.push({ id: `${topic.id}-sec-pitfalls`, label: '자주 하는 실수' });
  if (topic.visualizerType)
    secs.push({ id: `${topic.id}-sec-viz`, label: '알고리즘 시각화' });
  return secs;
}

function getTopicSections(topic: StudyTopic): Array<{ id: string; label: string }> {
  return CUSTOM_SECTIONS[topic.id] ?? getGenericSections(topic);
}

/* ── Topic nav item (numbered + expandable sub-sections) ── */
function TopicNavItem({ topic, idx, isActive, sections, activeSectionId, onTopicClick, onSectionClick }: {
  topic: StudyTopic; idx: number; isActive: boolean;
  sections: Array<{ id: string; label: string }>; activeSectionId: string | null;
  onTopicClick: () => void; onSectionClick: (id: string) => void;
}) {
  const examCount = ((topic as { relatedExamIds?: string[] }).relatedExamIds ?? []).length;
  return (
    <div>
      <button
        onClick={onTopicClick}
        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition
          ${isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      >
        <span className={`flex-shrink-0 text-[11px] font-black w-4 tabular-nums text-right
          ${isActive ? 'text-white/60' : 'text-slate-400'}`}>{idx + 1}.</span>
        <span className="text-base flex-shrink-0">{topic.icon}</span>
        <span className="flex-1 min-w-0 text-sm font-medium truncate">{topic.title}</span>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {Array.from({ length: Math.min(topic.examFrequency, 5) }).map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white/60' : 'bg-amber-400'}`} />
          ))}
          {examCount > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5
              ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
              {examCount}
            </span>
          )}
        </div>
      </button>
      {isActive && sections.length > 0 && (
        <div className="ml-8 mt-0.5 mb-1 space-y-0.5">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => onSectionClick(sec.id)}
              className={`w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition
                ${activeSectionId === sec.id
                  ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <span className={`leading-none ${activeSectionId === sec.id ? 'text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>›</span>
              {sec.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Exam group nav item (year/semester + expandable problem list) ── */
function ExamGroupNavItem({ groupKey, label, probs, isActive, activeExamId, onGroupClick, onProbClick }: {
  groupKey: string; label: string;
  probs: ExamProblem[]; isActive: boolean; activeExamId: string | null;
  onGroupClick: () => void; onProbClick: (id: string) => void;
}) {
  return (
    <div>
      <button
        onClick={onGroupClick}
        className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition
          ${isActive
            ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      >
        <span className="flex-1 text-sm font-bold truncate">{label}</span>
        <span className={`text-[10px] font-semibold flex-shrink-0 ${isActive ? 'text-white/50 dark:text-slate-500' : 'text-slate-400'}`}>
          {probs.length}문제
        </span>
      </button>
      {isActive && (
        <div className="ml-5 mt-0.5 mb-1 space-y-0.5">
          {probs.map(p => (
            <button
              key={p.id}
              onClick={() => onProbClick(p.id)}
              className={`w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition
                ${activeExamId === p.id
                  ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <span className={`leading-none flex-shrink-0 ${activeExamId === p.id ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>›</span>
              <span className="truncate">{p.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── All exams view ── */
interface ExamGroup { year: string; semester: '1' | '2'; probs: ExamProblem[]; key: string; }

function AllExamsPanel({ groups }: { groups: ExamGroup[] }) {
  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">기출문제 전체</h1>
        <span className="text-sm text-slate-400">{groups.reduce((s, g) => s + g.probs.length, 0)}문제</span>
      </div>
      {groups.map(g => (
        <div key={g.key} id={`exam-group-${g.key}`} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {g.year}년 {semLabel(g.semester)}
            </h2>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-[11px] text-slate-400">{g.probs.length}문제</span>
          </div>
          {g.probs.map(p => (
            <div key={p.id} id={`exam-${p.id}`}>
              <ExamProblemCard problem={p} defaultExpanded={true} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Right exam / practice panel ── */
function RightPanel({ exams, practiceQs, onExamClick, onPracticeClick, collapsed, onToggleCollapse }: {
  exams: ExamProblem[]; practiceQs: QuizQuestion[];
  onExamClick: (e: ExamProblem) => void;
  onPracticeClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <aside className={`flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden transition-all duration-200 ${collapsed ? 'w-10' : 'w-64'}`}>
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        {!collapsed && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">연관 문제</span>
        )}
        <button
          onClick={onToggleCollapse}
          className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          title={collapsed ? '펼치기' : '접기'}
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-0.5 min-h-0">
          {exams.length > 0 && (
            <>
              <p className="px-1 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">기출문제 ({exams.length})</p>
              {exams.map(exam => (
                <button
                  key={exam.id}
                  onClick={() => onExamClick(exam)}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="flex-shrink-0 rounded bg-slate-900 dark:bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-white dark:text-slate-900 whitespace-nowrap">
                    {exam.year}·{semLabel(exam.semester)}
                  </span>
                  <span className="flex-1 min-w-0 text-xs font-medium truncate">{exam.title}</span>
                  <span className="flex-shrink-0 text-[10px] text-slate-400 whitespace-nowrap">{exam.totalPoints}점</span>
                </button>
              ))}
            </>
          )}

          {practiceQs.length > 0 && (
            <div className={exams.length > 0 ? 'pt-2 mt-1 border-t border-slate-100 dark:border-slate-800' : ''}>
              <p className="px-1 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">연습문제</p>
              <button
                onClick={onPracticeClick}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-sm flex-shrink-0">✏️</span>
                <span className="flex-1 min-w-0 text-sm font-medium">연습 문제 전체</span>
                <span className="flex-shrink-0 text-[10px] font-semibold text-violet-500">{practiceQs.length}문제</span>
              </button>
            </div>
          )}

          {exams.length === 0 && practiceQs.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">연관 문제가 없습니다.</p>
          )}
        </div>
      )}
    </aside>
  );
}

/* ─── Main ─── */
export default function QualExamMain() {
  const [subject,           setSubject]           = useState<Subject>('dsa');
  const [view,              setView]              = useState<View>({ kind: 'topics' });
  const [leftCollapsed,     setLeftCollapsed]     = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightCollapsed,    setRightCollapsed]    = useState(false);
  const [modalExam,         setModalExam]         = useState<ExamProblem | null>(null);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);

  // topics scroll spy
  const [activeTopicId,   setActiveTopicId]   = useState<string>('');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  // exams scroll spy
  const [activeExamGroupKey, setActiveExamGroupKey] = useState<string>('');
  const [activeExamId,       setActiveExamId]       = useState<string | null>(null);

  const mainRef = useRef<HTMLDivElement>(null);

  const topics       = subject === 'dsa' ? DSA_TOPICS            : PROG_TOPICS;
  const examProblems = subject === 'dsa' ? DSA_EXAM_PROBLEMS      : PROG_EXAM_PROBLEMS;
  const practiceQs   = subject === 'dsa' ? DSA_PRACTICE_QUESTIONS : PROG_PRACTICE_QUESTIONS;

  const sortedTopics = useMemo(
    () => [...topics].sort((a, b) =>
      ((a as { studyOrder?: number }).studyOrder ?? 99) -
      ((b as { studyOrder?: number }).studyOrder ?? 99)
    ),
    [topics]
  );

  /* exam groups — used by both sidebar and AllExamsPanel */
  const examGroups = useMemo<ExamGroup[]>(() => {
    const map = new Map<string, ExamProblem[]>();
    for (const p of examProblems) {
      const key = `${p.year}-${p.semester}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, probs]) => ({ key, year: probs[0].year, semester: probs[0].semester, probs }));
  }, [examProblems]);

  /* sections map */
  const allSectionsByTopicId = useMemo(() => {
    const map = new Map<string, Array<{ id: string; label: string }>>();
    for (const t of sortedTopics) map.set(t.id, getTopicSections(t));
    return map;
  }, [sortedTopics]);

  /* initialise topics scroll state when subject changes */
  useEffect(() => {
    setActiveTopicId(sortedTopics[0]?.id ?? '');
    setActiveSectionId(null);
    mainRef.current?.scrollTo({ top: 0 });
  }, [sortedTopics]);

  /* initialise exams scroll state when entering exams view or switching subject */
  useEffect(() => {
    if (view.kind !== 'exams') return;
    const first = examGroups[0];
    if (first) {
      setActiveExamGroupKey(first.key);
      setActiveExamId(first.probs[0]?.id ?? null);
    }
    mainRef.current?.scrollTo({ top: 0 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.kind, subject]);

  /* active topic object */
  const activeTopic = useMemo(
    () => sortedTopics.find(t => t.id === activeTopicId) ?? null,
    [sortedTopics, activeTopicId]
  );

  const relatedExams = useMemo(() => {
    const ids: string[] = (activeTopic as { relatedExamIds?: string[] } | null)?.relatedExamIds ?? [];
    return examProblems.filter(p => ids.includes(p.id));
  }, [activeTopic, examProblems]);

  const topicPracticeQs = useMemo(
    () => practiceQs.filter(q => q.topic === activeTopic?.title) as QuizQuestion[],
    [activeTopic, practiceQs]
  );

  /* ── Unified scroll spy ── */
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const onScroll = () => {
      const top = container.getBoundingClientRect().top;

      if (view.kind === 'topics') {
        let newTopicId = sortedTopics[0]?.id ?? '';
        for (const t of sortedTopics) {
          const el = container.querySelector(`#topic-${t.id}`) as HTMLElement | null;
          if (el && el.getBoundingClientRect().top - top < 120) newTopicId = t.id;
        }
        setActiveTopicId(newTopicId);

        const secs = allSectionsByTopicId.get(newTopicId) ?? [];
        let newSecId: string | null = secs[0]?.id ?? null;
        for (const sec of secs) {
          const el = container.querySelector(`#${sec.id}`) as HTMLElement | null;
          if (el && el.getBoundingClientRect().top - top < 120) newSecId = sec.id;
        }
        setActiveSectionId(newSecId);

      } else if (view.kind === 'exams') {
        let newGroupKey = examGroups[0]?.key ?? '';
        for (const g of examGroups) {
          const el = container.querySelector(`#exam-group-${g.key}`) as HTMLElement | null;
          if (el && el.getBoundingClientRect().top - top < 120) newGroupKey = g.key;
        }
        setActiveExamGroupKey(newGroupKey);

        const activeGroup = examGroups.find(g => g.key === newGroupKey);
        if (activeGroup) {
          let newExamId: string | null = activeGroup.probs[0]?.id ?? null;
          for (const p of activeGroup.probs) {
            const el = container.querySelector(`#exam-${p.id}`) as HTMLElement | null;
            if (el && el.getBoundingClientRect().top - top < 120) newExamId = p.id;
          }
          setActiveExamId(newExamId);
        }
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [view.kind, sortedTopics, allSectionsByTopicId, examGroups]);

  /* ── Pending scroll (after view switch) ── */
  useEffect(() => {
    if (!pendingScrollId || view.kind !== 'topics') return;
    const container = mainRef.current;
    if (!container) return;
    const el = container.querySelector(`#topic-${pendingScrollId}`) as HTMLElement | null;
    if (!el) return;
    const diff = el.getBoundingClientRect().top - container.getBoundingClientRect().top - 80;
    container.scrollBy({ top: diff, behavior: 'smooth' });
    setPendingScrollId(null);
  }, [pendingScrollId, view.kind]);

  const scrollToTopic = useCallback((topicId: string) => {
    setView({ kind: 'topics' });
    setPendingScrollId(topicId);
    setMobileSidebarOpen(false);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const container = mainRef.current;
    if (!container) return;
    const el = container.querySelector(`#${id}`) as HTMLElement | null;
    if (!el) return;
    container.scrollBy({ top: el.getBoundingClientRect().top - container.getBoundingClientRect().top - 80, behavior: 'smooth' });
    setMobileSidebarOpen(false);
  }, []);

  const scrollToExamGroup = useCallback((groupKey: string) => {
    const container = mainRef.current;
    if (!container) return;
    const el = container.querySelector(`#exam-group-${groupKey}`) as HTMLElement | null;
    if (!el) return;
    container.scrollBy({ top: el.getBoundingClientRect().top - container.getBoundingClientRect().top - 80, behavior: 'smooth' });
  }, []);

  const scrollToExam = useCallback((examId: string) => {
    const container = mainRef.current;
    if (!container) return;
    const el = container.querySelector(`#exam-${examId}`) as HTMLElement | null;
    if (!el) return;
    container.scrollBy({ top: el.getBoundingClientRect().top - container.getBoundingClientRect().top - 80, behavior: 'smooth' });
  }, []);

  const switchSubject = (s: Subject) => {
    setSubject(s);
    setView({ kind: 'topics' });
    setRightCollapsed(false);
    setMobileSidebarOpen(false);
  };

  const hasPanelContent = relatedExams.length > 0 || topicPracticeQs.length > 0;

  /* ── Sidebar ── */
  const sidebarContent = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        {!leftCollapsed && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">목차</span>
        )}
        <button
          onClick={() => setLeftCollapsed(c => !c)}
          className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          title={leftCollapsed ? '펼치기' : '접기'}
        >
          {leftCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!leftCollapsed && (
        <>
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 space-y-2">
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => switchSubject('dsa')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition
                  ${subject === 'dsa'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <BrainCircuit className="h-3.5 w-3.5" /> 자알
              </button>
              <button
                onClick={() => switchSubject('prog')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border-l border-slate-200 dark:border-slate-700 transition
                  ${subject === 'prog'
                    ? 'bg-violet-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <BookOpen className="h-3.5 w-3.5" /> 프기
              </button>
            </div>

            <button
              onClick={() => {
                if (view.kind === 'exams') { setView({ kind: 'topics' }); }
                else { setView({ kind: 'exams' }); setMobileSidebarOpen(false); }
              }}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition
                ${view.kind === 'exams'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <ClipboardList className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium">기출문제</span>
              <span className={`text-[10px] font-semibold ${view.kind === 'exams' ? 'text-white/60 dark:text-slate-600' : 'text-slate-400'}`}>
                {examProblems.length}문제
              </span>
            </button>
          </div>

          {/* Topic list (topics view) or Exam group list (exams view) */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-0.5 min-h-0">
            {view.kind === 'topics' && sortedTopics.map((t, idx) => (
              <TopicNavItem
                key={t.id}
                topic={t}
                idx={idx}
                isActive={activeTopicId === t.id}
                sections={allSectionsByTopicId.get(t.id) ?? []}
                activeSectionId={activeSectionId}
                onTopicClick={() => scrollToTopic(t.id)}
                onSectionClick={scrollToSection}
              />
            ))}

            {view.kind === 'exams' && examGroups.map(g => (
              <ExamGroupNavItem
                key={g.key}
                groupKey={g.key}
                label={`${g.year}년 ${semLabel(g.semester)}`}
                probs={g.probs}
                isActive={activeExamGroupKey === g.key}
                activeExamId={activeExamId}
                onGroupClick={() => scrollToExamGroup(g.key)}
                onProbClick={scrollToExam}
              />
            ))}
          </div>

          <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 text-center">SNU ECE 논자시 · 2020~2025</p>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <ExamProblemModal problem={modalExam} onClose={() => setModalExam(null)} />
      <PracticeModal
        questions={topicPracticeQs}
        topicTitle={practiceModalOpen ? (activeTopic?.title ?? null) : null}
        onClose={() => setPracticeModalOpen(false)}
      />

      <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sm:hidden flex-shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(o => !o)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileSidebarOpen
              ? <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              : <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />}
          </button>
          <GraduationCap className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">논자시</span>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className={`hidden sm:flex flex-col flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 overflow-hidden
            ${leftCollapsed ? 'w-10' : 'w-64'}`}>
            {sidebarContent}
          </aside>

          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 sm:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
              <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                {sidebarContent}
              </aside>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden">
            <main ref={mainRef} className="flex-1 overflow-y-auto overscroll-contain bg-slate-50 dark:bg-slate-950">
              {view.kind === 'topics' && (
                <div>
                  {sortedTopics.map((t, idx) => (
                    <div key={t.id} id={`topic-${t.id}`}>
                      <TopicDetail topic={t} />
                      {idx < sortedTopics.length - 1 && (
                        <div className="mx-6 border-t-2 border-dashed border-slate-200 dark:border-slate-800 my-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {view.kind === 'exams' && <AllExamsPanel groups={examGroups} />}
            </main>

            {view.kind === 'topics' && hasPanelContent && (
              <RightPanel
                exams={relatedExams}
                practiceQs={topicPracticeQs}
                onExamClick={setModalExam}
                onPracticeClick={() => setPracticeModalOpen(true)}
                collapsed={rightCollapsed}
                onToggleCollapse={() => setRightCollapsed(c => !c)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
