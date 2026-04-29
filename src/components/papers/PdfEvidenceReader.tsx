'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Highlighter,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
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
  onClose: () => void;
}

const KIND_LABELS: Record<PaperEvidenceBlock['kind'], string> = {
  abstract: '초록',
  architecture: '구조',
  algorithm: '알고리즘',
  equation: '수식',
  result: '실험',
  ablation: 'Ablation',
};

function normalizeBlocks(blocks: PaperEvidenceBlock[]): PaperEvidenceBlock[] {
  return blocks.length
    ? blocks
    : [
        {
          id: 'empty-evidence',
          title: '아직 연결된 근거가 없습니다',
          kind: 'abstract',
          page: 1,
          label: 'p.1',
          summary:
            '이 논문은 PDF viewer에서 직접 볼 수 있지만, 요약 블록과 PDF 위치를 연결하는 annotation은 아직 없습니다. 우선 MoR 논문에 기준 annotation을 붙였습니다.',
          rects: [],
        },
      ];
}

export default function PdfEvidenceReader({ title, pdfUrl, blocks, onClose }: PdfEvidenceReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
  const [error, setError] = useState<string | null>(null);

  const activeBlock = useMemo(
    () => normalizedBlocks.find((block) => block.id === activeBlockId) ?? normalizedBlocks[0],
    [activeBlockId, normalizedBlocks],
  );

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
          setError('PDF를 불러오지 못했습니다. 외부 PDF 링크 또는 네트워크 상태를 확인해야 합니다.');
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

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-100 dark:bg-slate-950">
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
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
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <X className="h-3.5 w-3.5" />
              일반 보기
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1800px] gap-4 p-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
        <section className="min-h-[720px] rounded-2xl border border-slate-200 bg-slate-900 p-3 shadow-sm dark:border-slate-800">
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

          <div className="relative max-h-[calc(100vh-15rem)] overflow-auto rounded-xl bg-slate-800 p-6">
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

        <aside className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-100">사용 방식</h3>
            <p className="mt-2 text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/80">
              오른쪽 요약 카드를 hover/click하면 좌측 PDF가 해당 페이지로 이동하고, 연결된 근거 영역을 노란색으로 표시합니다.
              현재는 MoR 기준 수동 annotation MVP입니다.
            </p>
          </div>

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
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {KIND_LABELS[block.kind]}
                    </span>
                    <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-bold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
                      {block.label}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-950 dark:text-white">{block.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{block.summary}</p>
                  {block.quote && (
                    <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs italic leading-5 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-950/50 dark:text-slate-400 dark:ring-slate-800">
                      근거 키워드: {block.quote}
                    </p>
                  )}
                  {!!block.keywords?.length && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {block.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
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
