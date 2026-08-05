import { useEffect, useState } from 'react';

import type { LoadingState } from '@/types/domain';

export interface AsyncResource<T> {
  state: LoadingState;
  data: T | null;
  error: string | null;
  reload: () => void;
}

interface UseAsyncOptions {
  /** Skip the artificial first-load to render an empty state for demos. */
  forceEmpty?: boolean;
}

/**
 * Minimal async data hook used by page sections.
 * Keeps loading / empty / error / success handling in one place so
 * components stay declarative.
 */
export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
  options: UseAsyncOptions = {},
): AsyncResource<T> {
  const [state, setState] = useState<LoadingState>('loading');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setError(null);
    fetcher()
      .then((result) => {
        if (cancelled) return;
        if (options.forceEmpty) {
          setState('empty');
          setData(null);
          return;
        }
        setData(result);
        setState('success');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load');
        setState('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return {
    state,
    data,
    error,
    reload: () => setNonce((n) => n + 1),
  };
}
