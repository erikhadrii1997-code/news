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

      // Helper function to get category-specific sample articles
      const getCategorySampleData = (cat: string): NewsItem[] => {
        const samplesByCategory: { [key: string]: NewsItem[] } = {
          general: [
            {
              id: 'general-1',
              title: 'Global Leaders Gather for Climate Summit in New York',
              description: 'World leaders from over 150 countries are meeting in New York City for the annual climate summit, discussing new initiatives to combat climate change and reduce carbon emissions globally.',
              url: 'https://news.com/climate-summit-2025',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date().toISOString(),
              source: 'World News',
              category: cat,
            },
            {
              id: 'general-2',
              title: 'New Infrastructure Bill Promises Major Investment in Public Transportation',
              description: 'The recently passed infrastructure legislation includes $200 billion for modernizing public transportation systems across major cities, aiming to reduce traffic congestion and emissions.',
              url: 'https://news.com/infrastructure-bill',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'National News',
              category: cat,
            },
            {
              id: 'general-3',
              title: 'Historic Peace Agreement Signed Between Neighboring Nations',
              description: 'After decades of tension, two neighboring countries have signed a comprehensive peace agreement, marking a new era of cooperation and economic partnership in the region.',
              url: 'https://news.com/peace-agreement',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'International Times',
              category: cat,
            },
            {
              id: 'general-4',
              title: 'Record Voter Turnout Expected in Upcoming Elections',
              description: 'Political analysts predict unprecedented voter participation in the upcoming elections, driven by increased civic engagement and expanded early voting access.',
              url: 'https://news.com/elections-2025',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Political Weekly',
              category: cat,
            },
          ],
          breaking: [
            {
              id: 'breaking-1',
              title: 'BREAKING: Major Scientific Discovery Announced at CERN',
              description: 'Scientists at CERN have announced a groundbreaking discovery that could revolutionize our understanding of particle physics and the fundamental forces of nature.',
              url: 'https://news.com/cern-discovery',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date().toISOString(),
              source: 'Science Daily',
              category: cat,
            },
            {
              id: 'breaking-2',
              title: 'Stock Markets Hit All-Time High Amid Economic Recovery',
              description: 'Global stock markets reached record levels today as investors showed confidence in the ongoing economic recovery, with major indices posting significant gains.',
              url: 'https://news.com/markets-high',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
              source: 'Financial News',
              category: cat,
            },
            {
              id: 'breaking-3',
              title: 'Emergency Response Teams Deploy After Natural Disaster',
              description: 'International emergency response teams are being mobilized to provide aid following a major natural disaster, with rescue operations underway to assist affected communities.',
              url: 'https://news.com/emergency-response',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
              source: 'Emergency News Network',
              category: cat,
            },
            {
              id: 'breaking-4',
              title: 'Major Tech Company Announces Surprise Merger',
              description: 'In an unexpected move, two leading technology companies have announced plans to merge, creating one of the largest tech conglomerates in history.',
              url: 'https://news.com/tech-merger',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Tech Business',
              category: cat,
            },
          ],
          technology: [
            {
              id: 'tech-1',
              title: 'Revolutionary Quantum Computer Achieves Computing Milestone',
              description: 'A new quantum computing system has successfully performed calculations that would take traditional supercomputers thousands of years, marking a major breakthrough in computational power.',
              url: 'https://techcrunch.com/quantum-milestone',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date().toISOString(),
              source: 'TechCrunch',
              category: cat,
            },
            {
              id: 'tech-2',
              title: 'AI Language Models Show Unprecedented Understanding Capabilities',
              description: 'Latest artificial intelligence models demonstrate remarkable advances in natural language understanding and generation, raising new possibilities and ethical considerations.',
              url: 'https://techcrunch.com/ai-advances',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'AI Weekly',
              category: cat,
            },
            {
              id: 'tech-3',
              title: '5G Network Expansion Reaches Rural Communities',
              description: 'Telecommunications companies announce major infrastructure investments to bring high-speed 5G connectivity to underserved rural areas, bridging the digital divide.',
              url: 'https://techcrunch.com/5g-expansion',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Network News',
              category: cat,
            },
            {
              id: 'tech-4',
              title: 'Breakthrough in Battery Technology Promises Longer Device Life',
              description: 'Researchers unveil new battery technology that could triple device battery life while reducing charging times, potentially revolutionizing portable electronics.',
              url: 'https://techcrunch.com/battery-tech',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Innovation Today',
              category: cat,
            },
          ],
          business: [
            {
              id: 'business-1',
              title: 'Electric Vehicle Sales Surge to Record Highs in Q4',
              description: 'The automotive industry reports unprecedented demand for electric vehicles, with major manufacturers struggling to keep up with orders. Industry analysts predict EVs will dominate the market within five years.',
              url: 'https://reuters.com/ev-sales-surge',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date().toISOString(),
              source: 'Reuters Business',
              category: cat,
            },
            {
              id: 'business-2',
              title: 'Global Supply Chain Shows Signs of Recovery',
              description: 'International shipping and logistics companies report significant improvements in supply chain efficiency, with reduced delays and increased capacity across major trade routes.',
              url: 'https://bloomberg.com/supply-chain',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'Bloomberg',
              category: cat,
            },
            {
              id: 'business-3',
              title: 'Cryptocurrency Market Experiences Major Regulatory Changes',
              description: 'New financial regulations are reshaping the cryptocurrency landscape as governments worldwide implement comprehensive frameworks for digital assets.',
              url: 'https://wsj.com/crypto-regulations',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Wall Street Journal',
              category: cat,
            },
            {
              id: 'business-4',
              title: 'Startups Attract Record Venture Capital Investment',
              description: 'Venture capital funding reaches new heights as investors pour billions into innovative startups across technology, healthcare, and sustainability sectors.',
              url: 'https://forbes.com/vc-funding',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Forbes',
              category: cat,
            },
          ],
          science: [
            {
              id: 'science-1',
              title: 'NASA Confirms Water Ice Discovery on Mars Surface',
              description: 'Scientists at NASA have confirmed the presence of substantial water ice deposits just below the Martian surface, raising new possibilities for future human missions and potential colonization efforts.',
              url: 'https://nasa.gov/mars-water',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date().toISOString(),
              source: 'NASA News',
              category: cat,
            },
            {
              id: 'science-2',
              title: 'New Cancer Treatment Shows Promising Results in Clinical Trials',
              description: 'Revolutionary immunotherapy approach demonstrates remarkable success rates in treating previously difficult cancers, offering new hope to patients worldwide.',
              url: 'https://nature.com/cancer-treatment',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'Nature Medicine',
              category: cat,
            },
            {
              id: 'science-3',
              title: 'Ancient Fossil Discovery Rewrites Human Evolution Timeline',
              description: 'Paleontologists uncover remarkably preserved fossils that challenge current understanding of human evolution, pushing back the timeline of key developmental stages.',
              url: 'https://science.org/fossil-discovery',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Science Magazine',
              category: cat,
            },
            {
              id: 'science-4',
              title: 'Renewable Energy Efficiency Reaches New Peak',
              description: 'Solar panel technology achieves unprecedented conversion efficiency of 47%, setting new records and making renewable energy more cost-effective than ever.',
              url: 'https://nature.com/solar-efficiency',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Nature Energy',
              category: cat,
            },
          ],
          health: [
            {
              id: 'health-1',
              title: 'New Alzheimer\'s Drug Shows Significant Memory Improvement',
              description: 'Clinical trials for a breakthrough Alzheimer\'s medication demonstrate substantial cognitive improvements in patients, offering hope for millions affected by the disease.',
              url: 'https://healthline.com/alzheimers-drug',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date().toISOString(),
              source: 'Health Journal',
              category: cat,
            },
            {
              id: 'health-2',
              title: 'Study Reveals Benefits of Mediterranean Diet on Longevity',
              description: 'Comprehensive long-term research confirms that Mediterranean diet adherence significantly reduces risk of cardiovascular disease and extends healthy lifespan.',
              url: 'https://healthline.com/mediterranean-diet',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'Nutrition Today',
              category: cat,
            },
            {
              id: 'health-3',
              title: 'Mental Health Apps Show Effectiveness in Treating Anxiety',
              description: 'Digital mental health interventions prove as effective as traditional therapy for mild to moderate anxiety disorders, increasing treatment accessibility.',
              url: 'https://healthline.com/mental-health-apps',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Psychology Today',
              category: cat,
            },
            {
              id: 'health-4',
              title: 'Breakthrough in Diabetes Prevention Through Lifestyle Changes',
              description: 'New research identifies specific lifestyle modifications that can reduce type 2 diabetes risk by up to 70%, emphasizing the power of preventive medicine.',
              url: 'https://healthline.com/diabetes-prevention',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Medical News',
              category: cat,
            },
          ],
          sports: [
            {
              id: 'sports-1',
              title: 'Olympic Champion Sets New World Record in Swimming',
              description: 'At the World Championships, the defending Olympic champion shattered the 100m freestyle world record, swimming faster than ever recorded in history.',
              url: 'https://espn.com/swimming-record',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date().toISOString(),
              source: 'ESPN',
              category: cat,
            },
            {
              id: 'sports-2',
              title: 'Underdog Team Pulls Off Stunning Championship Upset',
              description: 'In one of the biggest surprises of the season, the eighth-seeded underdogs defeated the top-ranked champions to claim their first-ever championship title.',
              url: 'https://espn.com/championship-upset',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'Sports Illustrated',
              category: cat,
            },
            {
              id: 'sports-3',
              title: 'Tennis Star Announces Retirement After Legendary Career',
              description: 'After 20 years of dominance and 25 Grand Slam titles, the tennis legend announces retirement, ending one of the most decorated careers in sports history.',
              url: 'https://espn.com/tennis-retirement',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Tennis Today',
              category: cat,
            },
            {
              id: 'sports-4',
              title: 'Marathon Runner Breaks Two-Hour Barrier in Historic Race',
              description: 'In an unprecedented athletic achievement, a marathon runner completes the 26.2-mile distance in under two hours, pushing the limits of human endurance.',
              url: 'https://espn.com/marathon-record',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Runner\'s World',
              category: cat,
            },
          ],
          entertainment: [
            {
              id: 'entertainment-1',
              title: 'Heidi Klum\'s Halloween Costume 2025: The Scary Transformation Revealed',
              description: 'Supermodel Heidi Klum has once again stunned fans with her elaborate Halloween costume transformation, revealing her highly anticipated look at her annual Halloween party.',
              url: 'https://variety.com/heidi-klum-halloween',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date().toISOString(),
              source: 'Variety',
              category: cat,
            },
            {
              id: 'entertainment-2',
              title: 'Blockbuster Film Breaks Opening Weekend Box Office Records',
              description: 'The highly anticipated superhero sequel has shattered box office records, earning over $500 million globally in its opening weekend.',
              url: 'https://variety.com/box-office-record',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'Hollywood Reporter',
              category: cat,
            },
            {
              id: 'entertainment-3',
              title: 'Grammy Awards: Complete List of Winners and Performances',
              description: 'Music\'s biggest night celebrates excellence with stunning performances and surprise wins across all major categories at the annual Grammy Awards ceremony.',
              url: 'https://billboard.com/grammys-2025',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Billboard',
              category: cat,
            },
            {
              id: 'entertainment-4',
              title: 'Streaming Platform Announces Major Original Series Lineup',
              description: 'Leading streaming service reveals ambitious slate of original productions featuring A-list talent and groundbreaking storytelling for the upcoming season.',
              url: 'https://variety.com/streaming-lineup',
              imageUrl: 'https://picsum.photos/seed/$1/800/480',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Entertainment Weekly',
              category: cat,
            },
          ],
        };

        // Return category-specific articles or general articles as fallback
        return samplesByCategory[cat] || samplesByCategory['general'];
      };

      const fetchAndSendNews = async () => {
        try {
          const API_KEY = process.env.NEWS_API_KEY;
          if (!API_KEY) {
            // Fallback: serve category-specific sample data
            const sample = getCategorySampleData(category);
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
            // Send category-specific sample data instead of error
            const sample = getCategorySampleData(category);
            sendData(sample);
          }
        } catch (error) {
          console.error('Error in news fetch interval:', error);
          // Send category-specific sample data instead of error
          const sample = getCategorySampleData(category);
          sendData(sample);
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
