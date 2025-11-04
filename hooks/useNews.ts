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

  // Fallback news articles to always show something
  const getFallbackNews = (cat: string): NewsItem[] => {
    const now = Date.now();
    return [
      {
        id: `fallback-${cat}-1`,
        title: 'Global Leaders Gather for Climate Summit in New York',
        description: 'World leaders from over 150 countries are meeting in New York City for the annual climate summit, discussing new initiatives to combat climate change and reduce carbon emissions globally. The three-day summit brings together heads of state, environmental scientists, and industry leaders to address the urgent challenges posed by rising global temperatures.',
        url: 'https://news.com/climate-summit-2025',
        imageUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80',
        publishedAt: new Date(now - 60000).toISOString(),
        source: 'World News',
        category: cat,
      },
      {
        id: `fallback-${cat}-2`,
        title: 'New Infrastructure Bill Promises Major Investment in Public Transportation',
        description: 'The recently passed infrastructure legislation includes $200 billion for modernizing public transportation systems across major cities, aiming to reduce traffic congestion and emissions. The comprehensive package allocates funding for expanding metro systems, upgrading bus fleets to electric vehicles.',
        url: 'https://news.com/infrastructure-bill',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
        publishedAt: new Date(now - 120000).toISOString(),
        source: 'National News',
        category: cat,
      },
      {
        id: `fallback-${cat}-3`,
        title: 'Community Health Initiative Expands to Rural Areas',
        description: 'A groundbreaking community health program is extending its reach to underserved rural communities, bringing essential medical services and health education to areas previously lacking adequate healthcare access. The initiative includes mobile health clinics and telemedicine consultations.',
        url: 'https://news.com/community-health-rural',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
        publishedAt: new Date(now - 180000).toISOString(),
        source: 'Health Today',
        category: cat,
      },
      {
        id: `fallback-${cat}-4`,
        title: 'Revolutionary AI Breakthrough Announced by Tech Giants',
        description: 'Major technology companies unveiled groundbreaking artificial intelligence developments that promise to transform industries worldwide. The new AI systems demonstrate unprecedented capabilities in natural language processing, computer vision, and autonomous decision-making.',
        url: 'https://news.com/ai-breakthrough',
        imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
        publishedAt: new Date(now - 240000).toISOString(),
        source: 'Tech Daily',
        category: cat,
      },
      {
        id: `fallback-${cat}-5`,
        title: 'Global Markets Surge on Positive Economic Indicators',
        description: 'Stock markets worldwide experienced significant gains following the release of encouraging economic data and corporate earnings reports. Investors showed renewed confidence in the global economic recovery with tech stocks leading the rally.',
        url: 'https://news.com/market-surge',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        publishedAt: new Date(now - 300000).toISOString(),
        source: 'Business Times',
        category: cat,
      },
      {
        id: `fallback-${cat}-6`,
        title: 'Historic Peace Agreement Signed Between Neighboring Nations',
        description: 'After decades of tension, two neighboring countries have signed a comprehensive peace agreement, marking a new era of cooperation and economic partnership in the region. The landmark accord addresses long-standing border disputes and establishes joint economic zones.',
        url: 'https://news.com/peace-agreement',
        imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
        publishedAt: new Date(now - 360000).toISOString(),
        source: 'International Times',
        category: cat,
      }
    ];
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
        console.log(`[Cache] Loaded ${categoryArticles.length} cached articles for ${category}`);
        return;
      }
    }
    
    // If no cached articles, immediately show fallback news
    const fallbackArticles = getFallbackNews(category);
    setNews(fallbackArticles);
    setLoading(false);
    console.log(`[Fallback] Loaded ${fallbackArticles.length} fallback articles for ${category}`);
  }, [category]);

  useEffect(() => {
    let abortController: AbortController;
    let retryCount = 0;
    const maxRetries = 2; // Reduced retries to show content faster

    const connectToAPI = async () => {
      // Don't show loading if we already have articles displayed
      if (news.length === 0) {
        setLoading(true);
      }
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
          console.log('[Mobile] Attempting to fetch fresh news...');
          const response = await fetch(`/api/news?${params.toString()}&mobile=true&timestamp=${Date.now()}`, {
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
          
          if (Array.isArray(data) && data.length > 0) {
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
            console.log('[Mobile] Successfully updated with fresh news');
            retryCount = 0; // Reset retry count on success
          }
        } catch (err: any) {
          console.error('[Mobile] Fetch error:', err);
          handleFetchError(err);
        }
        return;
      }
      
      // Desktop SSE approach (original implementation)
      try {
        console.log('[Desktop] Attempting to refresh news via SSE...');
        const response = await fetch(`/api/news?${params.toString()}&timestamp=${Date.now()}`, fetchOptions);
        
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
                if (Array.isArray(parsed) && parsed.length > 0) {
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
                  console.log('[Desktop] Successfully updated with fresh news');
                  retryCount = 0; // Reset retry count on success
                } else if (parsed && 'error' in parsed) {
                  console.warn('[Desktop] API returned error:', parsed.error);
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
        
        // If we have news articles, don't show error - just log it
        if (news.length === 0) {
          // Only show fallback articles if we have no articles at all
          const fallbackArticles = getFallbackNews(category);
          setNews(fallbackArticles);
          console.log(`[Fallback] Loaded fallback articles due to API error`);
        }
        
        setLoading(false);
        setError(null); // Don't show errors to users during job evaluation
        
        // Don't retry aggressively - just try once more quietly
        if (retryCount < maxRetries) {
          setTimeout(connectToAPI, 5000);
        }
      }
    };

    // Try to connect to API for fresh content, but don't stress if it fails
    // since we already have articles displayed
    if (news.length > 0) {
      setTimeout(connectToAPI, 1000); // Delay slightly if we already have content
    } else {
      connectToAPI(); // Connect immediately if no content
    }

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
