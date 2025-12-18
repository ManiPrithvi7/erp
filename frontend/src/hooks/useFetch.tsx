import { useEffect, useState } from 'react';
import { ApiResponse } from '@/types';

function useFetchData<T = any>(fetchFunction: () => Promise<ApiResponse<T>>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isSuccess, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        setLoading(true);
        setSuccess(false);
        setError(null);
        const response = await fetchFunction();
        
        if (isMounted) {
          // Handle both success and error responses from request utility
          if (response && response.success === true && response.result) {
            setData(response.result);
            setSuccess(true);
          } else {
            // API returned error response
            setError(response?.message || 'Failed to fetch data');
            setSuccess(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          setError(error);
          setSuccess(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Run only once on mount

  return { data, isLoading, isSuccess, error };
}

export default function useFetch<T = any>(fetchFunction: () => Promise<ApiResponse<T>>) {
  const { data, isLoading, isSuccess, error } = useFetchData(fetchFunction);

  return { result: data, isLoading, isSuccess, error };
}

