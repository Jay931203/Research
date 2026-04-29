'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  AlertTriangle,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Highlighter,
  Layers,
  Loader2,
  Minus,
  MousePointerClick,
  Plus,
  RotateCcw,
  Route,
  Sparkles,
  Zap,
} from 'lucide-react';
import katex from 'katex';
import type { PaperEvidenceBlock } from '@/lib/papers/evidenceRefs';

type PdfDocumentProxyLike = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
      transform?: number[];
    }) => { promise: Promise<void>; cancel: () => void };
  }>;
  destroy?: () => Promise<void> | void;
};

interface PdfEvidenceReaderProps {
  title: string;
  pdfUrl: string;
  blocks: PaperEvidenceBlock[];
}

const KIND_LABELS: Record<PaperEvidenceBlock['kind'], string> = {
  abstract: '초록',
  architecture: '구조',
  algorithm: '알고리즘',
  equation: '수식',
  result: '실험',
  ablation: 'Ablation',
};

const KIND_STYLES: Record<PaperEvidenceBlock['kind'], string> = {
  abstract: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
  architecture: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200',
  algorithm: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  equation: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  result: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
  ablation: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200',
};

function normalizeBlocks(blocks: PaperEvidenceBlock[]): PaperEvidenceBlock[] {
  return blocks.length
    ? blocks
    : [
        {
          id: 'empty-evidence',
          title: '아직 연결된 PDF 근거가 없습니다',
          kind: 'abstract',
          page: 1,
          label: 'p.1',
          summary:
            '이 논문은 PDF 원문을 직접 볼 수 있지만, 요약 블록과 PDF 위치를 연결하는 annotation은 아직 준비되지 않았습니다. 우선 MoR 논문부터 근거 연결을 실험 중입니다.',
          rects: [],
        },
      ];
}

function MathBlock({ latex }: { latex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
        trust: true,
        strict: false,
      });
    } catch {
      return null;
    }
  }, [latex]);

  return (
    <div className="overflow-x-auto rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-center dark:border-amber-900 dark:bg-amber-950/30">
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <code className="block whitespace-pre-wrap text-xs text-amber-800 dark:text-amber-200">{latex}</code>
      )}
    </div>
  );
}

function MoRDepthLab() {
  const [budget, setBudget] = useState(58);
  const tokens = useMemo(() => {
    const words = ['The', 'recursive', 'model', 'routes', 'hard', 'tokens', 'deeper'];
    const desiredDepth = [1, 3, 2, 2, 4, 3, 2];
    const cap = Math.max(1, Math.round((budget / 100) * 4));
    return words.map((word, index) => ({
      word,
      desiredDepth: desiredDepth[index],
      activeDepth: Math.min(desiredDepth[index], cap),
    }));
  }, [budget]);

  const totalActive = tokens.reduce((sum, token) => sum + token.activeDepth, 0);
  const totalDense = tokens.length * 4;
  const saving = Math.round((1 - totalActive / totalDense) * 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-950 dark:text-white">Token별 recursion depth 미니 실험</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            MoR의 핵심은 모든 token을 같은 깊이로 보내지 않는 것입니다. 계산 예산을 줄이면 쉬운 token은 얕게 멈추고, 중요한 token만 더 깊은 recursion을 탑니다.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">계산 예산</span>
        <input
          type="range"
          min={25}
          max={100}
          value={budget}
          onChange={(event) => setBudget(Number(event.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600 dark:bg-slate-800"
        />
        <span className="w-10 text-right text-xs font-black text-emerald-700 dark:text-emerald-300">{budget}%</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-7">
        {tokens.map((token) => (
          <div key={token.word} className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-center dark:border-slate-800 dark:bg-slate-950">
            <div className="flex h-20 flex-col-reverse justify-start gap-1">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className={`h-3 rounded-sm transition ${
                    index < token.activeDepth
                      ? 'bg-emerald-500 shadow-sm'
                      : index < token.desiredDepth
                        ? 'bg-emerald-200/60 dark:bg-emerald-900/50'
                        : 'bg-slate-200/60 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <div className="mt-2 truncate text-[11px] font-bold text-slate-700 dark:text-slate-300">{token.word}</div>
            <div className="text-[10px] text-slate-400">r={token.activeDepth}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
          <div className="font-black text-slate-900 dark:text-white">{totalActive}/{totalDense}</div>
          <div className="text-slate-500 dark:text-slate-400">active depth</div>
        </div>
        <div className="rounded-xl bg-emerald-100 p-2 dark:bg-emerald-950">
          <div className="font-black text-emerald-800 dark:text-emerald-200">{saving}%</div>
          <div className="text-emerald-700/70 dark:text-emerald-200/70">dense 대비 절감</div>
        </div>
        <div className="rounded-xl bg-amber-100 p-2 dark:bg-amber-950">
          <div className="font-black text-amber-800 dark:text-amber-200">router</div>
          <div className="text-amber-700/70 dark:text-amber-200/70">token별 선택</div>
        </div>
      </div>
    </div>
  );
}

function MoRStudyRoadmap() {
  const items = [
    {
      icon: <Layers className="h-4 w-4" />,
      title: '1. Layer를 재사용한다',
      text: 'Recursive Transformer는 서로 다른 layer를 많이 쌓는 대신 같은 block을 여러 recursion step에서 반복 사용한다.',
    },
    {
      icon: <Route className="h-4 w-4" />,
      title: '2. Token마다 깊이를 다르게 준다',
      text: 'MoR은 router로 token별 recursion depth를 선택해 쉬운 token과 어려운 token의 계산량을 분리한다.',
    },
    {
      icon: <BrainCircuit className="h-4 w-4" />,
      title: '3. KV cache 비용을 같이 줄인다',
      text: '깊은 recursion에서 active token만 attention/KV를 계산하거나 첫 KV를 공유해 memory IO까지 낮춘다.',
    },
    {
      icon: <CheckCircle2 className="h-4 w-4" />,
      title: '4. Scaling과 ablation으로 검증한다',
      text: 'MoR의 이득은 vanilla가 아니라 recursive baseline과 비교해야 routing/caching의 기여가 분리된다.',
    },
  ];

  return (
    <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-slate-50 p-4 shadow-sm dark:border-cyan-900 dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-950">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-cyan-600 p-2 text-white">
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-950 dark:text-white">MoR 학습 로드맵</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            이 PDF 모드는 일반 상세 페이지를 대체하는 번역본이 아니라, 일반 보기의 학습 흐름을 원문 근거와 같이 보는 모드입니다.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl border border-white/70 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-1 flex items-center gap-2 text-xs font-black text-cyan-700 dark:text-cyan-200">
              {item.icon}
              {item.title}
            </div>
            <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PdfEvidenceReader({ title, pdfUrl, blocks }: PdfEvidenceReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const normalizedBlocks = useMemo(() => normalizeBlocks(blocks), [blocks]);
  const [pdfDoc, setPdfDoc] = useState<PdfDocumentProxyLike | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(normalizedBlocks[0]?.page ?? 1);
  const [scale, setScale] = useState(1.15);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [activeBlockId, setActiveBlockId] = useState(normalizedBlocks[0]?.id ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [splitPercent, setSplitPercent] = useState(56);
  const [isPaneResizing, setIsPaneResizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeBlock = useMemo(
    () => normalizedBlocks.find((block) => block.id === activeBlockId) ?? normalizedBlocks[0],
    [activeBlockId, normalizedBlocks],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem('pdfEvidenceReader.splitPercent');
    if (!saved) return;

    const value = Number(saved);
    if (Number.isFinite(value)) {
      setSplitPercent(Math.min(72, Math.max(36, value)));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('pdfEvidenceReader.splitPercent', String(splitPercent));
  }, [splitPercent]);

  useEffect(() => {
    if (!isPaneResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      const container = splitContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;

      const nextPercent = ((event.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(72, Math.max(36, Number(nextPercent.toFixed(1)))));
    };

    const stopResizing = () => setIsPaneResizing(false);
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResizing);
    window.addEventListener('pointercancel', stopResizing);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResizing);
      window.removeEventListener('pointercancel', stopResizing);
    };
  }, [isPaneResizing]);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: { promise: Promise<PdfDocumentProxyLike>; destroy?: () => Promise<void> } | null = null;

    async function loadPdf() {
      setIsLoading(true);
      setError(null);

      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

        loadingTask = pdfjs.getDocument({ url: pdfUrl, withCredentials: false }) as unknown as {
          promise: Promise<PdfDocumentProxyLike>;
          destroy?: () => Promise<void>;
        };

        const doc = await loadingTask.promise;
        if (cancelled) {
          await doc.destroy?.();
          return;
        }

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNumber((current) => Math.min(Math.max(current, 1), doc.numPages));
      } catch {
        if (!cancelled) {
          setError('PDF를 불러오지 못했습니다. 원문 PDF 링크 또는 네트워크 상태를 확인해야 합니다.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      void loadingTask?.destroy?.();
    };
  }, [pdfUrl]);

  useEffect(() => {
    return () => {
      void pdfDoc?.destroy?.();
    };
  }, [pdfDoc]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;
    const currentPdfDoc = pdfDoc;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    const canvasContext = context;

    async function renderPage() {
      setIsRendering(true);
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;

      try {
        const page = await currentPdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        setPageSize({ width: viewport.width, height: viewport.height });

        canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        const task = page.render({
          canvasContext,
          viewport,
          transform: pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined,
        });
        renderTaskRef.current = task;
        await task.promise;
      } catch (renderError) {
        if (!cancelled && (renderError as { name?: string })?.name !== 'RenderingCancelledException') {
          setError('PDF page 렌더링 중 문제가 발생했습니다.');
        }
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, [pdfDoc, pageNumber, scale]);

  const activateBlock = (block: PaperEvidenceBlock) => {
    setActiveBlockId(block.id);
    setPageNumber(block.page);
  };

  const visibleRects = activeBlock?.page === pageNumber ? activeBlock.rects : [];
  const isMoRStudy = normalizedBlocks.some((block) => block.id.startsWith('mor-'));

  return (
    <div className="flex h-[calc(100vh-6.75rem)] flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className="shrink-0 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
              <Highlighter className="h-4 w-4" />
              PDF Evidence Reader
            </div>
            <h2 className="mt-1 truncate text-sm font-black text-slate-900 dark:text-white md:text-base">{title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              원본 PDF
            </a>
          </div>
        </div>
      </div>

      <div
        ref={splitContainerRef}
        className="mx-auto grid min-h-0 w-full max-w-[1800px] flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,var(--reader-left))_14px_minmax(0,1fr)] lg:gap-2"
        style={{ '--reader-left': `${splitPercent}%` } as CSSProperties}
      >
        <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-slate-900 p-3 shadow-sm dark:border-slate-800">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-950/80 px-3 py-2 text-white">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
                disabled={pageNumber <= 1}
                className="rounded-lg p-2 transition hover:bg-white/10 disabled:opacity-30"
                aria-label="이전 페이지"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[88px] text-center text-xs font-bold">
                {pageNumber} / {numPages || '-'}
              </span>
              <button
                type="button"
                onClick={() => setPageNumber((page) => (numPages ? Math.min(numPages, page + 1) : page + 1))}
                disabled={!!numPages && pageNumber >= numPages}
                className="rounded-lg p-2 transition hover:bg-white/10 disabled:opacity-30"
                aria-label="다음 페이지"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setScale((value) => Math.max(0.75, Number((value - 0.1).toFixed(2))))}
                className="rounded-lg p-2 transition hover:bg-white/10"
                aria-label="축소"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[56px] text-center text-xs font-bold">{Math.round(scale * 100)}%</span>
              <button
                type="button"
                onClick={() => setScale((value) => Math.min(1.8, Number((value + 0.1).toFixed(2))))}
                className="rounded-lg p-2 transition hover:bg-white/10"
                aria-label="확대"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setScale(1.15)}
                className="rounded-lg p-2 transition hover:bg-white/10"
                aria-label="확대 비율 초기화"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-auto rounded-xl bg-slate-800 p-6">
            {isLoading && (
              <div className="flex min-h-[520px] items-center justify-center text-slate-200">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                PDF 로딩 중
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            )}
            {!error && (
              <div className="relative mx-auto w-fit">
                <canvas ref={canvasRef} className="rounded bg-white shadow-2xl" />
                {visibleRects.map((rect, index) => (
                  <div
                    key={`${activeBlock?.id}-${index}`}
                    className="pointer-events-none absolute rounded-md border-2 border-amber-400 bg-amber-300/25 shadow-[0_0_0_9999px_rgba(15,23,42,0.12)]"
                    style={{
                      left: rect.x * pageSize.width,
                      top: rect.y * pageSize.height,
                      width: rect.width * pageSize.width,
                      height: rect.height * pageSize.height,
                    }}
                  />
                ))}
                {isRendering && (
                  <div className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white">
                    렌더링 중
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <div
          role="separator"
          aria-label="PDF와 설명 패널 폭 조절"
          aria-orientation="vertical"
          className="group hidden min-h-0 cursor-col-resize items-center justify-center rounded-full lg:flex"
          onPointerDown={(event) => {
            event.preventDefault();
            setIsPaneResizing(true);
          }}
          onDoubleClick={() => setSplitPercent(56)}
          title="드래그해서 좌우 폭을 조절합니다. 더블클릭하면 기본값으로 돌아갑니다."
        >
          <div
            className={`h-24 w-1.5 rounded-full transition ${
              isPaneResizing
                ? 'bg-emerald-500'
                : 'bg-slate-300 group-hover:bg-emerald-400 dark:bg-slate-700 dark:group-hover:bg-emerald-500'
            }`}
          />
        </div>

        <aside className="min-h-0 space-y-4 overflow-y-auto pr-1">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-600 p-2 text-white">
                <MousePointerClick className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-100">사용 방식</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/80">
                  오른쪽 학습 카드를 hover/click하면 좌측 PDF가 해당 페이지로 이동하고 근거 영역이 표시됩니다. 오른쪽 패널만 따로 스크롤되므로 PDF는 계속 같은 화면에 남습니다.
                </p>
              </div>
            </div>
          </div>

          {isMoRStudy && (
            <>
              <MoRStudyRoadmap />
              <MoRDepthLab />
            </>
          )}

          <div className="space-y-3">
            {normalizedBlocks.map((block) => {
              const active = block.id === activeBlock?.id;
              return (
                <article
                  key={block.id}
                  onMouseEnter={() => activateBlock(block)}
                  onFocus={() => activateBlock(block)}
                  onClick={() => activateBlock(block)}
                  tabIndex={0}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    active
                      ? 'border-amber-300 bg-amber-50 shadow-md dark:border-amber-700 dark:bg-amber-950/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-black text-white dark:bg-white dark:text-slate-950">
                      p.{block.page}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${KIND_STYLES[block.kind]}`}>
                      {KIND_LABELS[block.kind]}
                    </span>
                    <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-bold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
                      {block.label}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-950 dark:text-white">{block.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{block.summary}</p>

                  {block.learningGoal && (
                    <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 dark:border-cyan-900 dark:bg-cyan-950/30">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-black text-cyan-800 dark:text-cyan-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        이 블록에서 잡아야 할 것
                      </div>
                      <p className="text-xs leading-5 text-cyan-900/80 dark:text-cyan-100/80">{block.learningGoal}</p>
                    </div>
                  )}

                  {block.formula && (
                    <div className="mt-3">
                      <div className="mb-1 text-xs font-black text-amber-800 dark:text-amber-200">핵심 수식</div>
                      <MathBlock latex={block.formula} />
                    </div>
                  )}

                  {!!block.keyPoints?.length && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-black text-slate-700 dark:text-slate-200">읽는 순서</div>
                      {block.keyPoints.map((point) => (
                        <div key={point} className="flex gap-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {block.interpretation && (
                    <div className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-xs leading-5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <span className="font-black text-slate-900 dark:text-white">해석: </span>
                      {block.interpretation}
                    </div>
                  )}

                  {block.watchOut && (
                    <div className="mt-3 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{block.watchOut}</span>
                    </div>
                  )}

                  {block.quote && (
                    <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs italic leading-5 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-950/50 dark:text-slate-400 dark:ring-slate-800">
                      근거 키워드: {block.quote}
                    </p>
                  )}

                  {!!block.keywords?.length && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {block.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
