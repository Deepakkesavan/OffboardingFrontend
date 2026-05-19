import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFetch — replaces useQuery
 * @param {Function} fetchFn   - async function that returns data
 * @param {Array}    deps      - dependency array (re-fetches when these change)
 * @param {Object}   options   - { enabled, refetchInterval }
 */
export function useFetch(fetchFn, deps = [], options = {}) {
  const { enabled = true, refetchInterval = null } = options;

  const [data,      setData]      = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isError,   setIsError]   = useState(false);
  const [error,     setError]     = useState(null);

  const intervalRef = useRef();

  const run = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setIsError(true);
      setError(err);
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
    return () => clearInterval(intervalRef.current);
  }, [run, refetchInterval]);

  return { data, isLoading, isError, error, refetch: run };
}

/**
 * useMutation — replaces useMutation from react-query
 * @param {Function} mutationFn  - async function that receives variables
 * @param {Object}   callbacks   - { onSuccess, onError }
 */
export function useMutation(mutationFn, { onSuccess, onError } = {}) {
  const [isPending, setIsPending] = useState(false);
  const [isError,   setIsError]   = useState(false);
  const [error,     setError]     = useState(null);

  const mutate = useCallback(async (variables) => {
    setIsPending(true);
    setIsError(false);
    setError(null);
    try {
      const result = await mutationFn(variables);
      onSuccess?.(result);
    } catch (err) {
      setIsError(true);
      setError(err);
      onError?.(err);
    } finally {
      setIsPending(false);
    }
  }, [mutationFn, onSuccess, onError]);

  return { mutate, isPending, isError, error };
}