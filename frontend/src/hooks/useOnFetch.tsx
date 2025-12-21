import { useState, useCallback } from 'react';
import { ApiResponse } from '@/types';

export default function useOnFetch<T = any>() {
  const [result, setResult] = useState<T | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onFetch = useCallback(async (callback: Promise<ApiResponse<T>>): Promise<void> => {
    setIsLoading(true);

    const data = await callback;
    setResult(data.result || null);
    if (data.success === true) {
      setIsSuccess(true);
    } else {
      setIsSuccess(false);
    }
    setIsLoading(false);
  }, []); // Empty deps - function doesn't depend on any props/state

  return { onFetch, result, isSuccess, isLoading };
}

