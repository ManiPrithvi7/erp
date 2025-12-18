import { useEffect, DependencyList } from 'react';
import useTimeoutFn from './useTimeoutFn';

export default function useDebounce(fn: () => void, ms: number = 0, deps: DependencyList = []): [() => boolean, () => void] {
  const [isReady, cancel, reset] = useTimeoutFn(fn, ms);

  useEffect(() => {
    reset();
  }, deps);

  return [isReady, cancel];
}

