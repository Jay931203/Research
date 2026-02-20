import { useEffect, useMemo, useRef, useState } from 'react';
import {
  hasMapHiddenTag,
  upsertPaperPersonalTags,
  withMapHiddenTag,
} from '@/lib/supabase/notes';
import { useAppStore } from '@/store/useAppStore';
import type { PaperWithNote } from '@/types';

const MAP_SYNC_DEBOUNCE_MS = 450;

export function useMapSelectionSync(papers: PaperWithNote[]) {
  const mapPaperIds = useAppStore((state) => state.mapPaperIds);
  const mapSelectionHydrated = useAppStore((state) => state.mapSelectionHydrated);
  const mapServerHydrated = useAppStore((state) => state.mapServerHydrated);
  const setMapServerHydrated = useAppStore((state) => state.setMapServerHydrated);
  const setMapPaperIds = useAppStore((state) => state.setMapPaperIds);

  const availablePaperIds = useMemo(() => papers.map((paper) => paper.id), [papers]);
  const availablePaperIdSet = useMemo(
    () => new Set(availablePaperIds),
    [availablePaperIds]
  );
  const papersById = useMemo(
    () => new Map(papers.map((paper) => [paper.id, paper])),
    [papers]
  );

  const serverIncludedRef = useRef<Set<string>>(new Set());
  const seenPaperIdsRef = useRef<Set<string>>(new Set());
  const syncTokenRef = useRef(0);
  const retryTimerRef = useRef<number | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(
    () => () => {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!mapSelectionHydrated || mapServerHydrated) return;
    if (!availablePaperIds.length) return;

    const includedPaperIds = papers
      .filter((paper) => !hasMapHiddenTag(paper.personal_tags))
      .map((paper) => paper.id);

    serverIncludedRef.current = new Set(includedPaperIds);
    seenPaperIdsRef.current = new Set(availablePaperIds);
    setMapPaperIds(includedPaperIds, { recordHistory: false });
    setMapServerHydrated(true);
  }, [
    papers,
    availablePaperIds,
    mapSelectionHydrated,
    mapServerHydrated,
    setMapPaperIds,
    setMapServerHydrated,
  ]);

  useEffect(() => {
    if (!mapSelectionHydrated || !mapServerHydrated) return;
    if (!availablePaperIds.length) return;

    if (mapPaperIds === null) {
      setMapPaperIds(availablePaperIds, { recordHistory: false });
      return;
    }

    const normalizedLocal = mapPaperIds.filter((paperId) => availablePaperIdSet.has(paperId));
    if (normalizedLocal.length !== mapPaperIds.length) {
      setMapPaperIds(normalizedLocal, { recordHistory: false });
      return;
    }

    const seenPaperIds = seenPaperIdsRef.current;
    const newPaperIds = availablePaperIds.filter((paperId) => !seenPaperIds.has(paperId));
    serverIncludedRef.current = new Set(
      Array.from(serverIncludedRef.current).filter((paperId) =>
        availablePaperIdSet.has(paperId)
      )
    );

    if (newPaperIds.length) {
      const autoIncludedPaperIds = newPaperIds.filter(
        (paperId) => !hasMapHiddenTag(papersById.get(paperId)?.personal_tags)
      );
      if (autoIncludedPaperIds.length) {
        const nextLocal = [...normalizedLocal, ...autoIncludedPaperIds];
        setMapPaperIds(nextLocal, { recordHistory: false });
        const nextServerIncluded = new Set(serverIncludedRef.current);
        autoIncludedPaperIds.forEach((paperId) => nextServerIncluded.add(paperId));
        serverIncludedRef.current = nextServerIncluded;
        seenPaperIdsRef.current = new Set(availablePaperIds);
        return;
      }
    }

    seenPaperIdsRef.current = new Set(availablePaperIds);

    const localIncludedSet = new Set(normalizedLocal);
    const serverIncludedSet = serverIncludedRef.current;
    const changedPaperIds: string[] = [];

    for (const paperId of availablePaperIds) {
      if (localIncludedSet.has(paperId) !== serverIncludedSet.has(paperId)) {
        changedPaperIds.push(paperId);
      }
    }

    if (!changedPaperIds.length) return;

    syncTokenRef.current += 1;
    const syncToken = syncTokenRef.current;

    const timeout = window.setTimeout(async () => {
      const updates = changedPaperIds.map((paperId) => {
        const nextHidden = !localIncludedSet.has(paperId);
        return {
          paperId,
          personalTags: withMapHiddenTag(
            papersById.get(paperId)?.personal_tags,
            nextHidden
          ),
        };
      });

      try {
        await upsertPaperPersonalTags(updates);
        if (syncTokenRef.current !== syncToken) return;
        serverIncludedRef.current = new Set(localIncludedSet);
      } catch (error) {
        console.error('Failed to sync map selection to server:', error);
        if (retryTimerRef.current !== null) {
          window.clearTimeout(retryTimerRef.current);
        }
        retryTimerRef.current = window.setTimeout(() => {
          setRetryNonce((current) => current + 1);
        }, 1200);
      }
    }, MAP_SYNC_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [
    availablePaperIdSet,
    availablePaperIds,
    mapPaperIds,
    mapSelectionHydrated,
    mapServerHydrated,
    papersById,
    retryNonce,
    setMapPaperIds,
  ]);
}
