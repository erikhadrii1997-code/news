// hooks/useNews.ts
'use client';

import { useState, useEffect } from 'react';
import { NewsItem } from '../lib/types';

interface UseNewsOptions {
  category?: string;
  query?: string;
  pageSize?: number;
}

export const useNews = (options: UseNewsOptions = {}) => {
  const { category = 'general', query = '', pageSize = 50 } = options;
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let abortController: AbortController;

    const connectSSE = () => {
      setLoading(true);
      setError(null);
      
      // Create new AbortController for this connection
      abortController = new AbortController();
      
      // Build query string with parameters
      const params = new URLSearchParams({
        category: category || 'general',
        pageSize: pageSize.toString(),
      });
      
      if (query && query.trim()) {
        params.append('q', query);
      }
      
      // Connect to our API endpoint
      fetch(`/api/news?${params.toString()}`, {
        signal: abortController.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Failed to connect to news feed');
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error('No reader available');
          }

          setLoading(false);

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                try {
                  type SSEMessage = NewsItem[] | { error: string };
                  const parsed: SSEMessage = JSON.parse(data);
                  if (Array.isArray(parsed)) {
                    setNews(parsed);
                  } else if (parsed && 'error' in parsed) {
                    setError(parsed.error);
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                  setError('Failed to process news data.');
                }
              }
            }
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('SSE Error:', err);
            setError('Failed to connect to the news feed. Retrying...');
            // Retry after 5 seconds
            setTimeout(connectSSE, 5000);
          }
        });
    };

    connectSSE();

    // Cleanup function to close the connection when the component unmounts
    return () => {
      if (abortController) {
        abortController.abort();
        console.log('SSE connection closed.');
      }
    };
  }, [category, query, pageSize]);

  return { news, loading, error };
};
