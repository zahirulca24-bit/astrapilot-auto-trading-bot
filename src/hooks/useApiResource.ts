import { useCallback, useEffect, useState } from 'react';

import type { ApiState } from '@/lib/api';

type Resource<T> = {
  data: T | null;
  error: string | null;
  state: ApiState;
  refresh: () => void;
};

export function useApiResource<T>(loader: (signal?: AbortSignal) => Promise<T>, configured: boolean): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ApiState>(configured ? 'idle' : 'unconfigured');
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!configured) {
      setState('unconfigured');
      setData(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setState('loading');
    setError(null);

    loader(controller.signal)
      .then((result) => {
        setData(result);
        setState('success');
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(reason instanceof Error ? reason.message : 'Unknown API error');
        setState('error');
      });

    return () => controller.abort();
  }, [configured, loader, revision]);

  return { data, error, state, refresh };
}
