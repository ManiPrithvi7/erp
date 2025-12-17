import { useEffect, useState } from 'react';

function useFetchData(fetchFunction) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isSuccess, setSuccess] = useState(false);
  const [error, setError] = useState(null);

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

export default function useFetch(fetchFunction) {
  const { data, isLoading, isSuccess, error } = useFetchData(fetchFunction);

  return { result: data, isLoading, isSuccess, error };
}
