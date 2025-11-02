// app/api/news/route.ts
import { NextRequest } from 'next/server';
import axios from 'axios';
import { NewsItem } from '../../../lib/types';

export async function GET(req: NextRequest) {
  // Get query parameters
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'general';
  const query = searchParams.get('q') || '';
  const pageSize = parseInt(searchParams.get('pageSize') || '50');

  // Set headers for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      type SSEPayload = NewsItem[] | { error: string };
      const sendData = (data: SSEPayload) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      const fetchAndSendNews = async () => {
        try {
          const API_KEY = process.env.NEWS_API_KEY;
          if (!API_KEY) {
            // Fallback: serve sample data so the app still launches and shows content
            const sample: NewsItem[] = [
              {
                id: 'entertainment-1',
                title: 'What Is Heidi Klum\'s Halloween Costume In 2025? See The \'Scary\' Transformation',
                description: 'LOS ANGELES, CALIFORNIA - Heidi Klum has once again stunned fans with her elaborate Halloween costume transformation. The supermodel and television host revealed her highly anticipated costume at her annual Halloween party, continuing her tradition of spectacular and creative disguises.',
                url: 'https://www.forbes.com/heidi-klum-halloween-2025',
                imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200&q=80',
                publishedAt: '2025-10-31T20:00:00Z',
                source: 'Forbes',
                category: category,
              },
              {
                id: 'breaking-tech-2',
                title: 'Major Tech Companies Announce Breakthrough in Quantum Computing',
                description: 'Leading technology firms have unveiled a revolutionary quantum processor that could transform industries from healthcare to finance. The new chip demonstrates unprecedented computational power and stability at room temperature.',
                url: 'https://techcrunch.com/quantum-breakthrough',
                imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80',
                publishedAt: new Date().toISOString(),
                source: 'Tech News',
                category: category,
              },
              {
                id: 'business-3',
                title: 'Electric Vehicle Sales Surge to Record Highs in Q4',
                description: 'The automotive industry reports unprecedented demand for electric vehicles, with major manufacturers struggling to keep up with orders. Industry analysts predict EVs will dominate the market within five years.',
                url: 'https://reuters.com/ev-sales-surge',
                imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=80',
                publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                source: 'Business Today',
                category: category,
              },
              {
                id: 'science-4',
                title: 'NASA Confirms Water Ice Discovery on Mars Surface',
                description: 'Scientists at NASA have confirmed the presence of substantial water ice deposits just below the Martian surface, raising new possibilities for future human missions and potential colonization efforts.',
                url: 'https://nasa.gov/mars-water-discovery',
                imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&q=80',
                publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                source: 'Space News',
                category: category,
              },
            ];
            sendData(sample);
            return;
          }

          let response: {
            data: {
              status: string;
              articles: ApiArticle[];
            };
          };
          type ApiArticle = {
            urlToImage?: string;
            description?: string;
            content?: string;
            url?: string;
            title: string;
            publishedAt: string;
            source: { name: string };
          };
          const commonParams = {
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: pageSize,
            apiKey: API_KEY,
          };

          // Fetch based on category or search query
          if (query && query.trim()) {
            // Search mode - using everything endpoint with search query
            response = await axios.get('https://newsapi.org/v2/everything', {
              params: {
                ...commonParams,
                q: query,
                domains: 'bbc.co.uk,reuters.com,cnn.com,theguardian.com,wsj.com,techcrunch.com,bloomberg.com,nytimes.com,theverge.com,engadget.com',
              },
            });
          } else if (category === 'general') {
            // General news from top headlines
            response = await axios.get('https://newsapi.org/v2/top-headlines', {
              params: {
                ...commonParams,
                country: 'us',
              },
            });
          } else if (category === 'breaking' || category === 'headlines') {
            // Top headlines
            response = await axios.get('https://newsapi.org/v2/top-headlines', {
              params: {
                ...commonParams,
                country: 'us',
                category: category === 'breaking' ? 'general' : undefined,
              },
            });
          } else {
            // Category-based news
            const categoryMap: { [key: string]: string } = {
              technology: 'technology',
              business: 'business',
              science: 'science',
              health: 'health',
              sports: 'sports',
              entertainment: 'entertainment',
              general: 'general',
            };

            const apiCategory = categoryMap[category] || 'general';

            response = await axios.get('https://newsapi.org/v2/top-headlines', {
              params: {
                ...commonParams,
                country: 'us',
                category: apiCategory,
              },
            });
          }

          if (response.data.status === 'ok') {
            const newsItems: NewsItem[] = response.data.articles
              .filter((article: ApiArticle) => article.urlToImage && article.urlToImage.trim() !== '') // Only include articles with images
              .map((article: ApiArticle, index: number) => {
                // Combine description and content if available for longer text
                let fullDescription = article.description || '';
                if (article.content) {
                  // Remove [number chars] suffix that NewsAPI adds
                  const cleanContent = article.content.replace(/\s*\[\+\d+\schars\]/i, '').trim();
                  if (cleanContent && cleanContent.length > fullDescription.length) {
                    fullDescription = cleanContent;
                  } else if (cleanContent && fullDescription) {
                    // Combine them if both are available and content adds value
                    fullDescription = fullDescription + ' ' + cleanContent.substring(fullDescription.length);
                  }
                }
                
                return {
                  id: article.url || `${index}-${Date.now()}`,
                  title: article.title,
                  description: fullDescription || 'No description available.',
                  url: article.url ?? '',
                  imageUrl: article.urlToImage ?? '',
                  publishedAt: article.publishedAt,
                  source: article.source.name,
                  category: category,
                };
              });

            // Send the data to the client
            sendData(newsItems);
          } else {
            console.error('Error from NewsAPI:', response.data);
            sendData({ error: 'Failed to fetch news from provider.' });
          }
        } catch (error) {
          console.error('Error in news fetch interval:', error);
          sendData({ error: 'An internal server error occurred.' });
        }
      };

      // Initial fetch immediately when a client connects
      fetchAndSendNews();

      // Set up an interval to fetch news every 5 minutes
      const newsInterval = setInterval(fetchAndSendNews, 300000);

      // Clean up the interval when the client disconnects
      req.signal.addEventListener('abort', () => {
        clearInterval(newsInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
