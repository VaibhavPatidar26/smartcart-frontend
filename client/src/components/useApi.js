import { useEffect, useState } from "react";

export function useApi(loader) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    loader()
      .then((result) => {
        if (isMounted) setData(result);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loader]);

  return { data, error, loading, setData };
}
