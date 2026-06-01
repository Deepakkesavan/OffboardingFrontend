import { useState, useEffect, useCallback, useRef } from 'react';

// ─── useFetch ─────────────────────────────────────────────────────────────────

interface UseFetchOptions {
  enabled?: boolean;
  refetchInterval?: number | null;
}

interface UseFetchResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = [],
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const { enabled = true, refetchInterval = null } = options;

  const [data,      setData]      = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError,   setIsError]   = useState<boolean>(false);
  const [error,     setError]     = useState<Error | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const run = useCallback(async (): Promise<void> => {
    if (!enabled) return;
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    run();
  }, [run]);

  useEffect(() => {
    if (!refetchInterval) return;
    intervalRef.current = setInterval(run, refetchInterval);
    return () => {
      if (intervalRef.current !== undefined) clearInterval(intervalRef.current);
    };
  }, [run, refetchInterval]);

  return { data, isLoading, isError, error, refetch: run };
}

// ─── useMutation ─────────────────────────────────────────────────────────────

interface UseMutationCallbacks<TData, TVariables> {
  onSuccess?: (result: TData, variables: TVariables) => void;
  onError?: (error: Error) => void;
}

interface UseMutationResult<TVariables> {
  mutate: (variables?: TVariables) => Promise<void>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

export function useMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  { onSuccess, onError }: UseMutationCallbacks<TData, TVariables> = {},
): UseMutationResult<TVariables> {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isError,   setIsError]   = useState<boolean>(false);
  const [error,     setError]     = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables?: TVariables): Promise<void> => {
      setIsPending(true);
      setIsError(false);
      setError(null);
      try {
        const result = await mutationFn(variables as TVariables);
        onSuccess?.(result, variables as TVariables);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setIsError(true);
        setError(e);
        onError?.(e);
      } finally {
        setIsPending(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutationFn, onSuccess, onError],
  );

  return { mutate, isPending, isError, error };
}