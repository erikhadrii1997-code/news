// hooks/useNews.ts
'use client';

import { useState, useEffect } from 'react';
import { NewsItem } from '../lib/types';

interface UseNewsOptions {
  category?: string;
  query?: string;
  pageSize?: number;
}

const STORAGE_KEY_PREFIX = 'pulse_news_cache_';
const MAX_CACHED_ARTICLES_PER_CATEGORY = 5000; // Increased limit to keep all articles for a very long time

// Helper function to get cached articles from localStorage for a specific category
// All articles are kept indefinitely - no time-based filtering
const getCachedArticles = (category: string): NewsItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${category}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Return all cached articles - no time-based filtering
      // Old articles are kept so users can read them
      return parsed;
    }
  } catch (error) {
    console.error('Error reading cached articles:', error);
  }
  return [];
};

// Helper function to cache articles in localStorage per category
// Automatically adds new articles while keeping all old articles indefinitely
const cacheArticles = (articles: NewsItem[], category: string) => {
  if (typeof window === 'undefined') return;
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${category}`;
    const cached = getCachedArticles(category);
    
    // Merge new articles with existing cached articles, avoiding duplicates by URL
    // This ensures old articles are kept and new ones are automatically added
    const merged = [...cached];
    articles.forEach(newArticle => {
      const exists = merged.some(cachedArticle => cachedArticle.url === newArticle.url);
      if (!exists) {
        merged.push(newArticle);
      }
    });
    
    // Sort by published date (newest first) for better user experience
    merged.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });
    
    // Keep articles up to the maximum limit (increased to store more old articles)
    // All articles within this limit are kept indefinitely for users to read
    const limited = merged.slice(0, MAX_CACHED_ARTICLES_PER_CATEGORY);
    
    localStorage.setItem(storageKey, JSON.stringify(limited));
    
    // Log successful caching
    console.log(`[Cache] Saved ${limited.length} articles for category: ${category}`);
  } catch (error) {
    // Handle localStorage quota exceeded or other errors gracefully
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(`[Cache] Storage quota exceeded for category: ${category}. Some articles may not be saved.`);
      // Try to save a smaller subset if quota is exceeded
      try {
        const storageKey = `${STORAGE_KEY_PREFIX}${category}`;
        const cached = getCachedArticles(category);
        // Keep only the most recent articles if we hit the quota
        const recentArticles = [...cached, ...articles]
          .filter((article, index, self) => 
            index === self.findIndex(a => a.url === article.url)
          )
          .sort((a, b) => {
            const dateA = new Date(a.publishedAt).getTime();
            const dateB = new Date(b.publishedAt).getTime();
            return dateB - dateA;
          })
          .slice(0, Math.floor(MAX_CACHED_ARTICLES_PER_CATEGORY * 0.9)); // Use 90% of limit
        
        localStorage.setItem(storageKey, JSON.stringify(recentArticles));
        console.log(`[Cache] Saved ${recentArticles.length} articles after quota adjustment`);
      } catch (retryError) {
        console.error('[Cache] Failed to save articles even after quota adjustment:', retryError);
      }
    } else {
      console.error('[Cache] Error caching articles:', error);
    }
  }
};

export const useNews = (options: UseNewsOptions = {}) => {
  const { category = 'general', query = '', pageSize = 50 } = options;
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect if we're on mobile
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  };

  // Load cached articles on mount for the current category
  useEffect(() => {
    const cached = getCachedArticles(category);
    if (cached.length > 0) {
      // Filter by category to ensure only category-specific articles are shown
      const categoryArticles = cached.filter(article => 
        article.category === category || (!article.category && category === 'general')
      );
      if (categoryArticles.length > 0) {
        setNews(categoryArticles);
        setLoading(false);
      }
    }
  }, [category]);

  useEffect(() => {
    let abortController: AbortController;
    let retryCount = 0;
    const maxRetries = 3;

    const connectToAPI = async () => {
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

      // Add mobile-specific headers and options
      const fetchOptions: RequestInit = {
        signal: abortController.signal,
        headers: {
          'Accept': 'text/plain, text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'User-Agent': isMobile() ? 'NewsApp-Mobile/1.0' : 'NewsApp-Desktop/1.0'
        },
      };

      // For mobile, use a simpler fetch approach instead of SSE streaming
      if (isMobile()) {
        try {
          console.log('[Mobile] Using optimized fetch for mobile device');
          const response = await fetch(`/api/news?${params.toString()}&mobile=true`, {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              'Accept': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (Array.isArray(data)) {
            // Ensure all articles have the correct category
            const categoryArticles = data.map(article => ({
              ...article,
              category: article.category || category
            }));
            
            // Get cached articles for this specific category
            const cached = getCachedArticles(category);
            
            // Filter cached articles by category to ensure they match
            const cachedForCategory = cached.filter(article => 
              article.category === category || (!article.category && category === 'general')
            );
            
            // Merge new articles with cached ones, avoiding duplicates by URL
            const merged = [...cachedForCategory];
            categoryArticles.forEach(newArticle => {
              const exists = merged.some(cachedArticle => cachedArticle.url === newArticle.url);
              if (!exists) {
                merged.push(newArticle);
              }
            });
            
            // Sort by published date (newest first)
            merged.sort((a, b) => {
              const dateA = new Date(a.publishedAt).getTime();
              const dateB = new Date(b.publishedAt).getTime();
              return dateB - dateA;
            });
            
            // Update state with merged articles (only for this category)
            setNews(merged);
            setError(null);
            setLoading(false);
            
            // Cache the new articles for this specific category
            cacheArticles(categoryArticles, category);
            console.log('[Mobile] Successfully loaded news articles');
          }
        } catch (err: any) {
          console.error('[Mobile] Fetch error:', err);
          handleFetchError(err);
        }
        return;
      }
      
      // Desktop SSE approach (original implementation)
      try {
        console.log('[Desktop] Using SSE streaming for desktop');
        const response = await fetch(`/api/news?${params.toString()}`, fetchOptions);
        
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
              if (!data.trim()) continue; // Skip empty data
              
              try {
                type SSEMessage = NewsItem[] | { error: string };
                const parsed: SSEMessage = JSON.parse(data);
                if (Array.isArray(parsed)) {
                  // Ensure all articles have the correct category
                  const categoryArticles = parsed.map(article => ({
                    ...article,
                    category: article.category || category
                  }));
                  
                  // Get cached articles for this specific category
                  const cached = getCachedArticles(category);
                  
                  // Filter cached articles by category to ensure they match
                  const cachedForCategory = cached.filter(article => 
                    article.category === category || (!article.category && category === 'general')
                  );
                  
                  // Merge new articles with cached ones, avoiding duplicates by URL
                  const merged = [...cachedForCategory];
                  categoryArticles.forEach(newArticle => {
                    const exists = merged.some(cachedArticle => cachedArticle.url === newArticle.url);
                    if (!exists) {
                      merged.push(newArticle);
                    }
                  });
                  
                  // Sort by published date (newest first)
                  merged.sort((a, b) => {
                    const dateA = new Date(a.publishedAt).getTime();
                    const dateB = new Date(b.publishedAt).getTime();
                    return dateB - dateA;
                  });
                  
                  // Update state with merged articles (only for this category)
                  setNews(merged);
                  setError(null); // Clear any previous errors
                  
                  // Cache the new articles for this specific category
                  cacheArticles(categoryArticles, category);
                } else if (parsed && 'error' in parsed) {
                  setError(parsed.error);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, 'Raw data:', data);
                // Don't set error for parsing issues, just log them
              }
            }
          }
        }
      } catch (err: any) {
        console.error('[Desktop] SSE Error:', err);
        handleFetchError(err);
      }
    };

    const handleFetchError = (err: any) => {
      if (err.name !== 'AbortError') {
        retryCount++;
        console.error(`API Error (attempt ${retryCount}/${maxRetries}):`, err);
        
        // Only show error if we don't already have news data loaded
        if (news.length === 0) {
          setError(`Failed to connect to the news feed. ${retryCount < maxRetries ? 'Retrying...' : 'Please check your connection.'}`);
        }
        setLoading(false);
        
        // Retry with exponential backoff, but only if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
          setTimeout(connectToAPI, retryDelay);
        }
      }
    };

    connectToAPI();

    // Cleanup function to close the connection when the component unmounts
    return () => {
      if (abortController) {
        abortController.abort();
        console.log('API connection closed.');
      }
    };
  }, [category, query, pageSize]);

  return { news, loading, error };
};
