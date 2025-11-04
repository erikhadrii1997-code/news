// app/api/news/route.ts
import { NextRequest } from 'next/server';
import axios from 'axios';
import { NewsItem } from '../../../lib/types';
import { cleanSourceAttribution } from '../../../lib/articleExtractor';

// API Key configuration with automatic failover
const API_KEYS = [
  process.env.NEWS_API_KEY,
  process.env.NEWS_API_KEY_BACKUP,
  process.env.NEWS_API_KEY_THIRD
].filter(Boolean); // Remove any undefined keys

// Helper function to try API call with automatic failover
const tryApiCall = async (url: string, timeout: number = 2000): Promise<any> => {
  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = API_KEYS[i];
    console.log(`[API] Trying API key ${i + 1}/${API_KEYS.length}`);
    
    try {
      const fullUrl = url + apiKey;
      const response = await axios.get(fullUrl, { timeout: timeout });
      
      if (response.data && response.data.articles) {
        console.log(`[API] Success with API key ${i + 1}`);
        return response.data;
      }
    } catch (error: any) {
      console.log(`[API] Key ${i + 1} failed:`, error.message);
      
      // If this is the last key, we'll fallback to saved articles
      if (i === API_KEYS.length - 1) {
        console.log('[API] All API keys failed, using fallback articles');
        throw new Error('All API keys exhausted');
      }
      
      // Continue to next API key
      continue;
    }
  }
  
  throw new Error('No valid API response received');
};

// Helper function to get fallback images based on category or content
const getFallbackImage = (category: string, title: string = ''): string => {
  const titleLower = title.toLowerCase();
  const categoryLower = category.toLowerCase();
  
  // Check title keywords first for more accurate matching
  if (titleLower.includes('tech') || titleLower.includes('ai') || titleLower.includes('computer') || titleLower.includes('software')) {
    return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80';
  } else if (titleLower.includes('business') || titleLower.includes('market') || titleLower.includes('economy') || titleLower.includes('finance')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';
  } else if (titleLower.includes('sport') || titleLower.includes('football') || titleLower.includes('soccer') || titleLower.includes('basketball')) {
    return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80';
  } else if (titleLower.includes('health') || titleLower.includes('medical') || titleLower.includes('hospital') || titleLower.includes('doctor')) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80';
  } else if (titleLower.includes('entertainment') || titleLower.includes('movie') || titleLower.includes('music') || titleLower.includes('celebrity')) {
    return 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80';
  } else if (titleLower.includes('moon') || titleLower.includes('supermoon') || titleLower.includes('space') || titleLower.includes('astronomy') || titleLower.includes('planet') || titleLower.includes('solar') || titleLower.includes('nasa') || titleLower.includes('galaxy') || titleLower.includes('star') || titleLower.includes('astronaut')) {
    return 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&q=80';
  } else if (titleLower.includes('science') || titleLower.includes('research') || titleLower.includes('study')) {
    return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80';
  } else if (titleLower.includes('climate') || titleLower.includes('environment') || titleLower.includes('summit') || titleLower.includes('earth')) {
    return 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&q=80';
  } else if (titleLower.includes('politics') || titleLower.includes('election') || titleLower.includes('government') || titleLower.includes('president')) {
    return 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80';
  }
  
  // Fallback to category-based images
  if (categoryLower.includes('tech')) {
    return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80';
  } else if (categoryLower.includes('business')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';
  } else if (categoryLower.includes('sport')) {
    return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80';
  } else if (categoryLower.includes('health') || categoryLower.includes('medical')) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80';
  } else if (categoryLower.includes('entertainment')) {
    return 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80';
  } else if (categoryLower.includes('science')) {
    return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80';
  } else {
    // Default news/world image
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
  }
};

export async function GET(req: NextRequest) {
  // Get query parameters
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'general';
  const query = searchParams.get('q') || '';
  const pageSize = parseInt(searchParams.get('pageSize') || '50');
  const isMobileRequest = searchParams.get('mobile') === 'true';

  // Check if this is a mobile request - return JSON instead of SSE
  if (isMobileRequest) {
    console.log('[API] Handling mobile request with JSON response');
    
    try {
      // Helper function to get category-specific sample articles with live timestamps
      const getCategorySampleData = (cat: string): NewsItem[] => {
        const now = Date.now();
        const currentTime = new Date(now).toISOString();
        
        // Generate dynamic articles with current timestamps to simulate live updates
        const generateDynamicArticles = (category: string) => [
          {
            id: `${category}-live-${now}`,
            title: `Breaking: Latest ${category.charAt(0).toUpperCase() + category.slice(1)} Update - ${new Date().toLocaleTimeString()}`,
            description: `This is a live update for ${category} news at ${new Date().toLocaleTimeString()}. Our newsroom is continuously monitoring developments and bringing you the most current information as events unfold. This article demonstrates real-time news delivery capabilities with automatic refresh functionality. Stay tuned for more updates as this story develops throughout the day.`,
            url: `https://news.com/${category}-live-${now}`,
            imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
            publishedAt: currentTime,
            source: 'Live News Network',
            category: cat,
          },
          {
            id: `${category}-update-${now - 1000}`,
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Alert: Real-Time Coverage Continues`,
            description: `Continuing our live coverage of ${category} news with real-time updates every second. This demonstrates the dynamic nature of our news platform with automatic content refresh capabilities. Our dedicated team ensures you receive the latest information as soon as it becomes available, making this a truly live news experience.`,
            url: `https://news.com/${category}-update-${now - 1000}`,
            imageUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80',
            publishedAt: new Date(now - 30000).toISOString(), // 30 seconds ago
            source: 'Breaking News Today',
            category: cat,
          },
          {
            id: `${category}-flash-${now - 2000}`,
            title: `Flash Report: ${category.charAt(0).toUpperCase() + category.slice(1)} Story Developing`,
            description: `Flash report on developing ${category} story with timestamp ${new Date().toLocaleTimeString()}. This live news feed showcases real-time content delivery with automatic updates every second. Our newsroom works around the clock to ensure you have access to the most current information and breaking developments as they happen.`,
            url: `https://news.com/${category}-flash-${now - 2000}`,
            imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
            publishedAt: new Date(now - 60000).toISOString(), // 1 minute ago
            source: 'Real-Time News',
            category: cat,
          }
        ];

        const samplesByCategory: { [key: string]: NewsItem[] } = {
          general: [
            ...generateDynamicArticles('general'),
            {
              id: 'general-climate-summit',
              title: 'Global Leaders Gather for Climate Summit in New York',
              description: 'World leaders from over 150 countries are meeting in New York City for the annual climate summit, discussing new initiatives to combat climate change and reduce carbon emissions globally. The three-day summit brings together heads of state, environmental scientists, and industry leaders to address the urgent challenges posed by rising global temperatures. Key topics include renewable energy transitions, carbon pricing mechanisms, and international cooperation frameworks.',
              url: 'https://news.com/climate-summit-2025',
              imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
              publishedAt: new Date(now - 120000).toISOString(), // 2 minutes ago
              source: 'World News',
              category: cat,
            },
            {
              id: 'general-infrastructure',
              title: 'New Infrastructure Bill Promises Major Investment in Public Transportation',
              description: 'The recently passed infrastructure legislation includes $200 billion for modernizing public transportation systems across major cities, aiming to reduce traffic congestion and emissions. The comprehensive package allocates funding for expanding metro systems, upgrading bus fleets to electric vehicles, and developing high-speed rail connections between major urban centers.',
              url: 'https://news.com/infrastructure-bill',
              imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
              publishedAt: new Date(now - 180000).toISOString(), // 3 minutes ago
              source: 'National News',
              category: cat,
            },
            {
              id: 'general-community-health',
              title: 'Community Health Initiative Expands to Rural Areas',
              description: 'A groundbreaking community health program is extending its reach to underserved rural communities, bringing essential medical services and health education to areas previously lacking adequate healthcare access. The initiative includes mobile health clinics, telemedicine consultations, and training programs for local healthcare workers.',
              url: 'https://news.com/community-health-rural',
              imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
              publishedAt: new Date(now - 240000).toISOString(), // 4 minutes ago
              source: 'Health Today',
              category: cat,
            }
          ],
          technology: [
            ...generateDynamicArticles('technology'),
            {
              id: 'tech-ai-breakthrough',
              title: 'Revolutionary AI Breakthrough Announced by Tech Giants',
              description: 'Major technology companies unveiled groundbreaking artificial intelligence developments that promise to transform industries worldwide. The new AI systems demonstrate unprecedented capabilities in natural language processing, computer vision, and autonomous decision-making.',
              url: 'https://news.com/ai-breakthrough',
              imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
              publishedAt: new Date(now - 300000).toISOString(),
              source: 'Tech Daily',
              category: cat,
            }
          ],
          business: [
            ...generateDynamicArticles('business'),
            {
              id: 'business-market-surge',
              title: 'Global Markets Surge on Positive Economic Indicators',
              description: 'Stock markets worldwide experienced significant gains following the release of encouraging economic data and corporate earnings reports. Investors showed renewed confidence in the global economic recovery.',
              url: 'https://news.com/market-surge',
              imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
              publishedAt: new Date(now - 360000).toISOString(),
              source: 'Business Times',
              category: cat,
            }
          ]
        };

        // Get sample data for the category, fallback to general if not found
        return samplesByCategory[cat] || samplesByCategory.general || [];
      };

      let articles: NewsItem[] = getCategorySampleData(category);

      // Filter articles based on search query if provided
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase();
        articles = articles.filter(article => 
          article.title.toLowerCase().includes(searchTerm) ||
          article.description.toLowerCase().includes(searchTerm) ||
          article.source.toLowerCase().includes(searchTerm)
        );
      }

      // Limit the number of articles
      articles = articles.slice(0, pageSize);

      console.log(`[API] Returning ${articles.length} articles for mobile (category: ${category})`);
      
      return new Response(JSON.stringify(articles), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });

    } catch (error) {
      console.error('[API] Mobile request error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch news' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Desktop SSE implementation (original)
  console.log('[API] Handling desktop request with SSE streaming');

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
              description: 'World leaders from over 150 countries are meeting in New York City for the annual climate summit, discussing new initiatives to combat climate change and reduce carbon emissions globally. The three-day summit brings together heads of state, environmental scientists, and industry leaders to address the urgent challenges posed by rising global temperatures. Key topics include renewable energy transitions, carbon pricing mechanisms, and international cooperation frameworks. Delegates are expected to announce new commitments to achieve net-zero emissions by 2050, with particular focus on supporting developing nations in their green transition. Several breakthrough technologies in carbon capture and sustainable agriculture will be showcased during the event.',
              url: 'https://news.com/climate-summit-2025',
              imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
              publishedAt: new Date().toISOString(),
              source: 'World News',
              category: cat,
            },
            {
              id: 'general-2',
              title: 'New Infrastructure Bill Promises Major Investment in Public Transportation',
              description: 'The recently passed infrastructure legislation includes $200 billion for modernizing public transportation systems across major cities, aiming to reduce traffic congestion and emissions. The comprehensive package allocates funding for expanding metro systems, upgrading bus fleets to electric vehicles, and developing high-speed rail connections between major urban centers. Transportation officials estimate the improvements will reduce commute times by an average of 30% while significantly lowering carbon footprints. The bill also includes provisions for accessible transit options, ensuring people with disabilities have equal access to public transportation. Construction is expected to create over 500,000 jobs nationwide over the next decade.',
              url: 'https://news.com/infrastructure-bill',
              imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'National News',
              category: cat,
            },
            {
              id: 'general-3',
              title: 'Historic Peace Agreement Signed Between Neighboring Nations',
              description: 'After decades of tension, two neighboring countries have signed a comprehensive peace agreement, marking a new era of cooperation and economic partnership in the region. The landmark accord addresses long-standing border disputes, establishes joint economic zones, and creates pathways for cultural exchange and shared infrastructure development. International mediators praised both nations for their commitment to dialogue and reconciliation. The agreement includes provisions for demilitarizing contested areas, establishing diplomatic missions, and implementing confidence-building measures. Trade barriers will be gradually reduced over the next five years, potentially boosting regional GDP by 15%. Citizens from both nations expressed cautious optimism about the future.',
              url: 'https://news.com/peace-agreement',
              imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'International Times',
              category: cat,
            },
            {
              id: 'general-4',
              title: 'Record Voter Turnout Expected in Upcoming Elections',
              description: 'Political analysts predict unprecedented voter participation in the upcoming elections, driven by increased civic engagement and expanded early voting access. Registration numbers have surged 40% compared to the previous election cycle, with particularly strong growth among young voters and first-time participants. Election officials have implemented new technologies to streamline the voting process, including mobile voting apps and extended polling hours. Campaign strategists note that key issues such as healthcare, education, and economic policy are motivating voters across the political spectrum. Independent monitors will be present to ensure fair and transparent electoral processes. The increased turnout is expected to impact races at all levels of government.',
              url: 'https://news.com/elections-2025',
              imageUrl: 'https://images.unsplash.com/photo-1577036421869-7c8d388d2123?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Political Weekly',
              category: cat,
            },
            {
              id: 'general-5',
              title: 'Education Reform Initiative Launches Nationwide',
              description: 'A comprehensive education reform program is being rolled out across the country, focusing on digital literacy and STEM education enhancement. The initiative includes teacher training programs, updated curricula, and investments in modern educational technology for classrooms. Schools will receive funding to establish computer labs, robotics programs, and coding courses starting from elementary level. Education experts believe these changes will better prepare students for the rapidly evolving job market. The reform also emphasizes critical thinking, creativity, and collaborative learning skills. Pilot programs in select districts have shown promising results with improved student engagement and test scores. Parents and educators have largely welcomed the changes.',
              url: 'https://news.com/education-reform',
              imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              source: 'Education Today',
              category: cat,
            },
            {
              id: 'general-6',
              title: 'Housing Market Shows Signs of Stabilization',
              description: 'Real estate experts report that the housing market is stabilizing after months of volatility, with prices leveling off in major metropolitan areas. Inventory levels have increased by 25% as more homeowners list their properties, creating better conditions for buyers. Mortgage rates have settled into a predictable range, allowing potential purchasers to plan their finances with greater confidence. First-time homebuyer programs have been expanded with increased down payment assistance and favorable loan terms. Economists suggest the stabilization reflects a healthier balance between supply and demand. Construction of new housing units has accelerated in suburban areas. Real estate professionals anticipate continued stability throughout the year.',
              url: 'https://news.com/housing-market',
              imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
              source: 'Real Estate News',
              category: cat,
            },
            {
              id: 'general-7',
              title: 'International Trade Agreement Boosts Economic Cooperation',
              description: 'Major economies sign new trade agreement aimed at reducing barriers and promoting sustainable economic growth across borders. The multilateral deal eliminates tariffs on over 10,000 products, facilitating smoother trade flows between participating nations. Small and medium-sized businesses are expected to benefit significantly from simplified customs procedures and reduced paperwork. Environmental provisions ensure that increased trade doesn\'t compromise sustainability goals. Digital commerce frameworks have been established to protect intellectual property while enabling cross-border e-commerce. Labor standards and worker protections are integral components of the agreement. Economists project the deal could add $500 billion to global GDP within five years.',
              url: 'https://news.com/trade-agreement',
              imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
              source: 'Global Trade',
              category: cat,
            },
            {
              id: 'general-8',
              title: 'Community Health Initiative Expands to Rural Areas',
              description: 'New healthcare program brings medical services and health education to underserved rural communities across the nation. Mobile health clinics equipped with diagnostic equipment and telemedicine capabilities will visit remote areas on regular schedules. The initiative addresses critical shortages of healthcare providers in rural regions by offering incentives for medical professionals to practice in these communities. Preventive care, chronic disease management, and mental health services are core components of the program. Local community health workers receive training to provide basic healthcare education and support. Partnerships with regional hospitals ensure that complex cases can be referred and treated appropriately. Initial results show significant improvements in health outcomes.',
              url: 'https://news.com/health-initiative',
              imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
              source: 'Community News',
              category: cat,
            },
            {
              id: 'general-9',
              title: 'Cultural Festival Celebrates Diversity in Major Cities',
              description: 'Annual cultural celebration brings together communities from around the world, showcasing traditional music, food, and art. The week-long festival features performances by international artists, cooking demonstrations from master chefs, and exhibitions of contemporary and traditional artwork. Attendees can participate in workshops learning traditional crafts, dance styles, and languages from various cultures. The event promotes cross-cultural understanding and appreciation while providing a platform for immigrant communities to share their heritage. Local businesses benefit from increased foot traffic and international exposure. Cultural exchange programs initiated during the festival have led to lasting partnerships between cities. Organizers estimate over 500,000 visitors will attend this year\'s celebration.',
              url: 'https://news.com/cultural-festival',
              imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
              source: 'Culture Today',
              category: cat,
            },
            {
              id: 'general-10',
              title: 'Transportation Innovation Promises Faster Commutes',
              description: 'New high-speed rail network begins operations, connecting major cities and reducing travel time by up to 50%. The state-of-the-art trains utilize magnetic levitation technology and advanced aerodynamics to achieve speeds exceeding 300 mph. Passengers will enjoy comfortable, spacious cabins equipped with Wi-Fi, power outlets, and entertainment systems. Environmental impact studies show the rail system produces 90% less carbon emissions compared to air travel for equivalent distances. Ticket prices are competitive with other transportation options, making high-speed rail accessible to a broad range of travelers. The network\'s expansion plans include connections to smaller cities and regional hubs. Transportation officials anticipate the system will reduce highway congestion significantly.',
              url: 'https://news.com/high-speed-rail',
              imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
              source: 'Transport Weekly',
              category: cat,
            },
            {
              id: 'general-11',
              title: 'Wildlife Conservation Efforts Show Promising Results',
              description: 'Endangered species populations are rebounding thanks to dedicated conservation programs and habitat restoration initiatives. Field researchers report a 35% increase in populations of several critically endangered species over the past five years. Protected wildlife corridors allow animals to migrate safely between habitats, improving genetic diversity and resilience. Anti-poaching measures have been strengthened with advanced monitoring technology and increased ranger patrols. Community-based conservation programs involve local populations in protection efforts, creating economic incentives for wildlife preservation. Habitat restoration projects have successfully recreated ecosystems that support diverse species. International cooperation has been crucial in addressing transboundary conservation challenges.',
              url: 'https://news.com/wildlife-conservation',
              imageUrl: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
              source: 'Nature Conservation',
              category: cat,
            },
            {
              id: 'general-12',
              title: 'Digital Literacy Programs Reach One Million Students',
              description: 'Nationwide initiative to improve digital skills reaches major milestone, preparing students for technology-driven future. The comprehensive program covers essential computer skills, internet safety, coding basics, and digital citizenship. Schools in underserved communities receive priority access to resources, including computers, tablets, and high-speed internet connectivity. Teachers undergo specialized training to effectively integrate digital tools into their instruction. Students learn to navigate digital platforms responsibly while developing critical thinking skills for evaluating online information. The program includes partnerships with technology companies that provide mentorship and internship opportunities. Assessment data shows significant improvements in students\' confidence and competence with digital technology.',
              url: 'https://news.com/digital-literacy',
              imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
              source: 'Tech Education',
              category: cat,
            },
          ],
          breaking: [
            {
              id: 'breaking-1',
              title: 'BREAKING: Major Scientific Discovery Announced at CERN',
              description: 'Scientists at CERN have announced a groundbreaking discovery that could revolutionize our understanding of particle physics and the fundamental forces of nature. The research team detected unprecedented patterns in particle interactions that challenge existing theoretical models. Leading physicists worldwide are calling this one of the most significant findings in decades. The discovery was made possible by upgrades to the Large Hadron Collider that increased its sensitivity and precision. Peer review processes are underway to validate the findings before publication in major scientific journals. If confirmed, the discovery could open new avenues for technological applications and deepen our understanding of the universe\'s origins. International collaboration involving thousands of researchers contributed to this achievement.',
              url: 'https://news.com/cern-discovery',
              imageUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80',
              publishedAt: new Date().toISOString(),
              source: 'Science Daily',
              category: cat,
            },
            {
              id: 'breaking-2',
              title: 'Stock Markets Hit All-Time High Amid Economic Recovery',
              description: 'Global stock markets reached record levels today as investors showed confidence in the ongoing economic recovery, with major indices posting significant gains. The Dow Jones, S&P 500, and Nasdaq all closed at unprecedented highs, driven by strong corporate earnings and positive economic indicators. Technology and healthcare sectors led the rally with double-digit percentage gains. Market analysts attribute the surge to improved consumer confidence, low unemployment rates, and effective fiscal policies. International markets in Europe and Asia also experienced substantial growth. Investment advisors caution that volatility may persist and recommend diversified portfolios. The record highs reflect optimism about sustained economic expansion.',
              url: 'https://news.com/markets-high',
              imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
              source: 'Financial News',
              category: cat,
            },
            {
              id: 'breaking-3',
              title: 'Emergency Response Teams Deploy After Natural Disaster',
              description: 'International emergency response teams are being mobilized to provide aid following a major natural disaster, with rescue operations underway to assist affected communities. Search and rescue personnel from multiple countries have arrived with specialized equipment and trained dogs. Medical teams are establishing field hospitals to treat injured victims and provide essential healthcare services. Relief organizations are coordinating distribution of food, water, clean clothing, and temporary shelter materials. Communication infrastructure is being restored to help locate missing persons and reunite families. Engineers are assessing damage to critical infrastructure including roads, bridges, and utilities. The international community has pledged millions in emergency aid and long-term reconstruction support.',
              url: 'https://news.com/emergency-response',
              imageUrl: 'https://images.unsplash.com/photo-1534760116381-8b16e2eeb27e?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
              source: 'Emergency News Network',
              category: cat,
            },
            {
              id: 'breaking-4',
              title: 'Major Tech Company Announces Surprise Merger',
              description: 'In an unexpected move, two leading technology companies have announced plans to merge, creating one of the largest tech conglomerates in history.',
              url: 'https://news.com/tech-merger',
              imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Tech Business',
              category: cat,
            },
            {
              id: 'breaking-5',
              title: 'BREAKING: Historic Space Mission Achieves New Milestone',
              description: 'Space agency announces successful completion of historic deep space mission, marking humanity\'s farthest journey into the cosmos.',
              url: 'https://news.com/space-milestone',
              imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
              source: 'Space News',
              category: cat,
            },
            {
              id: 'breaking-6',
              title: 'Major Cybersecurity Breach Affects Global Companies',
              description: 'International cybersecurity teams respond to coordinated attack affecting multiple major corporations worldwide.',
              url: 'https://news.com/cyber-breach',
              imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Security Today',
              category: cat,
            },
            {
              id: 'breaking-7',
              title: 'International Summit Announces Climate Action Plan',
              description: 'World leaders unveil comprehensive plan to accelerate climate action with unprecedented funding commitments.',
              url: 'https://news.com/climate-summit',
              imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 105).toISOString(),
              source: 'Environmental News',
              category: cat,
            },
            {
              id: 'breaking-8',
              title: 'BREAKING: Earthquake Hits Major Metropolitan Area',
              description: 'Emergency services mobilize as powerful earthquake strikes densely populated region, rescue operations in progress.',
              url: 'https://news.com/earthquake-alert',
              imageUrl: 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              source: 'Emergency Alert',
              category: cat,
            },
            {
              id: 'breaking-9',
              title: 'Medical Breakthrough Announced by Research Institute',
              description: 'Scientists announce major advancement in gene therapy, offering hope for treating previously incurable genetic diseases.',
              url: 'https://news.com/gene-therapy',
              imageUrl: 'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 135).toISOString(),
              source: 'Medical Journal',
              category: cat,
            },
            {
              id: 'breaking-10',
              title: 'Major Currency Exchange Rate Shift Rocks Markets',
              description: 'Significant fluctuation in major currency values triggers emergency meetings among central banks worldwide.',
              url: 'https://news.com/currency-shift',
              imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
              source: 'Financial Times',
              category: cat,
            },
            {
              id: 'breaking-11',
              title: 'BREAKING: Historic Peace Treaty Signed',
              description: 'Long-standing conflict comes to end as parties sign comprehensive peace agreement witnessed by international community.',
              url: 'https://news.com/peace-treaty',
              imageUrl: 'https://images.unsplash.com/photo-1555374018-13a8994ab246?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 165).toISOString(),
              source: 'World Peace Council',
              category: cat,
            },
            {
              id: 'breaking-12',
              title: 'Global Technology Conference Reveals Future Innovations',
              description: 'Industry leaders showcase groundbreaking technologies set to transform daily life in the coming decade.',
              url: 'https://news.com/tech-conference',
              imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
              source: 'Tech Conference',
              category: cat,
            },
          ],
          technology: [
            {
              id: 'tech-1',
              title: 'Revolutionary Quantum Computer Achieves Computing Milestone',
              description: 'A new quantum computing system has successfully performed calculations that would take traditional supercomputers thousands of years, marking a major breakthrough in computational power.',
              url: 'https://techcrunch.com/quantum-milestone',
              imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
              publishedAt: new Date().toISOString(),
              source: 'TechCrunch',
              category: cat,
            },
            {
              id: 'tech-2',
              title: 'AI Language Models Show Unprecedented Understanding Capabilities',
              description: 'Latest artificial intelligence models demonstrate remarkable advances in natural language understanding and generation, raising new possibilities and ethical considerations.',
              url: 'https://techcrunch.com/ai-advances',
              imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'AI Weekly',
              category: cat,
            },
            {
              id: 'tech-3',
              title: '5G Network Expansion Reaches Rural Communities',
              description: 'Telecommunications companies announce major infrastructure investments to bring high-speed 5G connectivity to underserved rural areas, bridging the digital divide.',
              url: 'https://techcrunch.com/5g-expansion',
              imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Network News',
              category: cat,
            },
            {
              id: 'tech-4',
              title: 'Breakthrough in Battery Technology Promises Longer Device Life',
              description: 'Researchers unveil new battery technology that could triple device battery life while reducing charging times, potentially revolutionizing portable electronics.',
              url: 'https://techcrunch.com/battery-tech',
              imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Innovation Today',
              category: cat,
            },
            {
              id: 'tech-5',
              title: 'Virtual Reality Platform Transforms Remote Work Experience',
              description: 'New VR technology creates immersive virtual workspaces, revolutionizing how remote teams collaborate and interact.',
              url: 'https://techcrunch.com/vr-workspace',
              imageUrl: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              source: 'VR Tech',
              category: cat,
            },
            {
              id: 'tech-6',
              title: 'Autonomous Vehicles Begin Large-Scale Public Testing',
              description: 'Self-driving cars from multiple manufacturers start comprehensive testing programs in major cities worldwide.',
              url: 'https://techcrunch.com/autonomous-vehicles',
              imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
              source: 'Auto Tech',
              category: cat,
            },
            {
              id: 'tech-7',
              title: 'Blockchain Technology Revolutionizes Supply Chain Management',
              description: 'Major corporations adopt blockchain solutions for transparent and efficient supply chain tracking.',
              url: 'https://techcrunch.com/blockchain-supply',
              imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
              source: 'Blockchain News',
              category: cat,
            },
            {
              id: 'tech-8',
              title: 'Edge Computing Reduces Latency for IoT Devices',
              description: 'New edge computing infrastructure dramatically improves response times for Internet of Things applications.',
              url: 'https://techcrunch.com/edge-computing',
              imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
              source: 'IoT Weekly',
              category: cat,
            },
            {
              id: 'tech-9',
              title: 'Cybersecurity AI Detects Threats Before They Strike',
              description: 'Advanced artificial intelligence systems predict and prevent cyberattacks with unprecedented accuracy.',
              url: 'https://techcrunch.com/ai-security',
              imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
              source: 'Security Tech',
              category: cat,
            },
            {
              id: 'tech-10',
              title: 'Smart Home Integration Reaches New Level of Convenience',
              description: 'Latest smart home systems offer seamless integration across all devices with intuitive voice and gesture control.',
              url: 'https://techcrunch.com/smart-home',
              imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
              source: 'Home Tech',
              category: cat,
            },
            {
              id: 'tech-11',
              title: 'Foldable Smartphone Technology Enters Mainstream Market',
              description: 'Major manufacturers release affordable foldable devices, making the technology accessible to wider audience.',
              url: 'https://techcrunch.com/foldable-phones',
              imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
              source: 'Mobile Tech',
              category: cat,
            },
            {
              id: 'tech-12',
              title: 'Cloud Gaming Services Eliminate Need for Expensive Hardware',
              description: 'Next-generation cloud gaming platforms deliver console-quality gaming on any device with minimal latency.',
              url: 'https://techcrunch.com/cloud-gaming',
              imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
              source: 'Gaming Tech',
              category: cat,
            },
          ],
          business: [
            {
              id: 'business-1',
              title: 'Electric Vehicle Sales Surge to Record Highs in Q4',
              description: 'The automotive industry reports unprecedented demand for electric vehicles, with major manufacturers struggling to keep up with orders. Industry analysts predict EVs will dominate the market within five years.',
              url: 'https://reuters.com/ev-sales-surge',
              imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
              publishedAt: new Date().toISOString(),
              source: 'Reuters Business',
              category: cat,
            },
            {
              id: 'business-2',
              title: 'Global Supply Chain Shows Signs of Recovery',
              description: 'International shipping and logistics companies report significant improvements in supply chain efficiency, with reduced delays and increased capacity across major trade routes.',
              url: 'https://bloomberg.com/supply-chain',
              imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'Bloomberg',
              category: cat,
            },
            {
              id: 'business-3',
              title: 'Cryptocurrency Market Experiences Major Regulatory Changes',
              description: 'New financial regulations are reshaping the cryptocurrency landscape as governments worldwide implement comprehensive frameworks for digital assets.',
              url: 'https://wsj.com/crypto-regulations',
              imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Wall Street Journal',
              category: cat,
            },
            {
              id: 'business-4',
              title: 'Startups Attract Record Venture Capital Investment',
              description: 'Venture capital funding reaches new heights as investors pour billions into innovative startups across technology, healthcare, and sustainability sectors.',
              url: 'https://forbes.com/vc-funding',
              imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Forbes',
              category: cat,
            },
            {
              id: 'business-5',
              title: 'E-Commerce Sales Surge as Online Shopping Dominates Retail',
              description: 'Digital commerce continues explosive growth with innovative delivery solutions and personalized shopping experiences.',
              url: 'https://bloomberg.com/ecommerce-growth',
              imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              source: 'Retail News',
              category: cat,
            },
            {
              id: 'business-6',
              title: 'Green Energy Investments Reach All-Time High',
              description: 'Sustainable energy projects attract unprecedented investment as companies commit to carbon neutrality goals.',
              url: 'https://forbes.com/green-investment',
              imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
              source: 'Energy Finance',
              category: cat,
            },
            {
              id: 'business-7',
              title: 'Remote Work Revolution Reshapes Commercial Real Estate',
              description: 'Office spaces transform as companies embrace hybrid work models, driving innovation in workspace design.',
              url: 'https://wsj.com/remote-work-real-estate',
              imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
              source: 'Business Insider',
              category: cat,
            },
            {
              id: 'business-8',
              title: 'Artificial Intelligence Drives Productivity Gains Across Industries',
              description: 'Companies report significant efficiency improvements through AI adoption in manufacturing and services.',
              url: 'https://bloomberg.com/ai-productivity',
              imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
              source: 'Industry Today',
              category: cat,
            },
            {
              id: 'business-9',
              title: 'Subscription Economy Transforms Consumer Spending Habits',
              description: 'Monthly subscription services grow across all sectors as consumers prefer access over ownership.',
              url: 'https://forbes.com/subscription-economy',
              imageUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
              source: 'Consumer Trends',
              category: cat,
            },
            {
              id: 'business-10',
              title: 'Fintech Innovation Disrupts Traditional Banking Sector',
              description: 'Digital banking platforms gain market share with user-friendly services and lower fees.',
              url: 'https://wsj.com/fintech-disruption',
              imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
              source: 'Financial Tech',
              category: cat,
            },
            {
              id: 'business-11',
              title: 'Gig Economy Expands as Freelance Work Becomes Mainstream',
              description: 'Independent contractors comprise growing portion of workforce as platforms connect talent with opportunities.',
              url: 'https://bloomberg.com/gig-economy',
              imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
              source: 'Future of Work',
              category: cat,
            },
            {
              id: 'business-12',
              title: 'Corporate Sustainability Initiatives Drive Brand Loyalty',
              description: 'Companies implementing environmental and social programs see increased customer engagement and sales.',
              url: 'https://forbes.com/corporate-sustainability',
              imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
              source: 'Sustainable Business',
              category: cat,
            },
          ],
          science: [
            {
              id: 'science-1',
              title: 'NASA Confirms Water Ice Discovery on Mars Surface',
              description: 'Scientists at NASA have confirmed the presence of substantial water ice deposits just below the Martian surface, raising new possibilities for future human missions and potential colonization efforts.',
              url: 'https://nasa.gov/mars-water',
              imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&q=80',
              publishedAt: new Date().toISOString(),
              source: 'NASA News',
              category: cat,
            },
            {
              id: 'science-2',
              title: 'New Cancer Treatment Shows Promising Results in Clinical Trials',
              description: 'Revolutionary immunotherapy approach demonstrates remarkable success rates in treating previously difficult cancers, offering new hope to patients worldwide.',
              url: 'https://nature.com/cancer-treatment',
              imageUrl: 'https://images.unsplash.com/photo-1579154204845-ecdb44b0c7d5?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'Nature Medicine',
              category: cat,
            },
            {
              id: 'science-3',
              title: 'Ancient Fossil Discovery Rewrites Human Evolution Timeline',
              description: 'Paleontologists uncover remarkably preserved fossils that challenge current understanding of human evolution, pushing back the timeline of key developmental stages.',
              url: 'https://science.org/fossil-discovery',
              imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Science Magazine',
              category: cat,
            },
            {
              id: 'science-4',
              title: 'Renewable Energy Efficiency Reaches New Peak',
              description: 'Solar panel technology achieves unprecedented conversion efficiency of 47%, setting new records and making renewable energy more cost-effective than ever.',
              url: 'https://nature.com/solar-efficiency',
              imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Nature Energy',
              category: cat,
            },
            {
              id: 'science-5',
              title: 'Deep Sea Exploration Discovers Unknown Marine Species',
              description: 'Ocean researchers identify dozens of new deep-sea creatures in previously unexplored trenches.',
              url: 'https://science.org/marine-discovery',
              imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              source: 'Marine Biology',
              category: cat,
            },
            {
              id: 'science-6',
              title: 'Gravitational Wave Observatory Detects Black Hole Collision',
              description: 'Scientists observe massive cosmic event providing insights into the nature of space-time and gravity.',
              url: 'https://nature.com/black-hole-collision',
              imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
              source: 'Astrophysics Today',
              category: cat,
            },
            {
              id: 'science-7',
              title: 'CRISPR Technology Advances with Precision Gene Editing',
              description: 'New gene editing techniques offer unprecedented accuracy in treating genetic disorders.',
              url: 'https://science.org/crispr-advances',
              imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
              source: 'Genetics Research',
              category: cat,
            },
            {
              id: 'science-8',
              title: 'Climate Scientists Map Melting Ice Caps with New Precision',
              description: 'Advanced satellite technology provides detailed tracking of polar ice changes and sea level impacts.',
              url: 'https://nature.com/ice-caps-mapping',
              imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
              source: 'Climate Science',
              category: cat,
            },
            {
              id: 'science-9',
              title: 'Particle Accelerator Reveals New Subatomic Particles',
              description: 'Physics experiment uncovers previously theoretical particles, advancing understanding of matter.',
              url: 'https://science.org/particle-discovery',
              imageUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
              source: 'Particle Physics',
              category: cat,
            },
            {
              id: 'science-10',
              title: 'Neuroscience Breakthrough Maps Complete Human Brain Connections',
              description: 'Researchers complete comprehensive map of neural pathways, revolutionizing brain science.',
              url: 'https://nature.com/brain-mapping',
              imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
              source: 'Neuroscience Journal',
              category: cat,
            },
            {
              id: 'science-11',
              title: 'Telescope Array Captures First Images of Exoplanet Atmosphere',
              description: 'Astronomers analyze chemical composition of distant planet\'s atmosphere, searching for signs of life.',
              url: 'https://science.org/exoplanet-atmosphere',
              imageUrl: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
              source: 'Space Telescope Institute',
              category: cat,
            },
            {
              id: 'science-12',
              title: 'Bioengineers Develop Artificial Organs for Transplantation',
              description: 'Lab-grown organs show promise for solving transplant shortage and saving countless lives.',
              url: 'https://nature.com/artificial-organs',
              imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
              source: 'Bioengineering',
              category: cat,
            },
          ],
          health: [
            {
              id: 'health-1',
              title: 'New Alzheimer\'s Drug Shows Significant Memory Improvement',
              description: 'Clinical trials for a breakthrough Alzheimer\'s medication demonstrate substantial cognitive improvements in patients, offering hope for millions affected by the disease.',
              url: 'https://healthline.com/alzheimers-drug',
              imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
              publishedAt: new Date().toISOString(),
              source: 'Health Journal',
              category: cat,
            },
            {
              id: 'health-2',
              title: 'Study Reveals Benefits of Mediterranean Diet on Longevity',
              description: 'Comprehensive long-term research confirms that Mediterranean diet adherence significantly reduces risk of cardiovascular disease and extends healthy lifespan.',
              url: 'https://healthline.com/mediterranean-diet',
              imageUrl: 'https://images.unsplash.com/photo-1498837167922-dbe23f127793?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'Nutrition Today',
              category: cat,
            },
            {
              id: 'health-3',
              title: 'Mental Health Apps Show Effectiveness in Treating Anxiety',
              description: 'Digital mental health interventions prove as effective as traditional therapy for mild to moderate anxiety disorders, increasing treatment accessibility.',
              url: 'https://healthline.com/mental-health-apps',
              imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Psychology Today',
              category: cat,
            },
            {
              id: 'health-4',
              title: 'Breakthrough in Diabetes Prevention Through Lifestyle Changes',
              description: 'New research identifies specific lifestyle modifications that can reduce type 2 diabetes risk by up to 70%, emphasizing the power of preventive medicine.',
              url: 'https://healthline.com/diabetes-prevention',
              imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Medical News',
              category: cat,
            },
            {
              id: 'health-5',
              title: 'Telemedicine Adoption Improves Healthcare Access',
              description: 'Virtual healthcare consultations expand access to medical care, especially in underserved communities.',
              url: 'https://healthline.com/telemedicine',
              imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              source: 'Digital Health',
              category: cat,
            },
            {
              id: 'health-6',
              title: 'Sleep Study Reveals Critical Importance of Rest for Immunity',
              description: 'Research demonstrates strong correlation between quality sleep and robust immune system function.',
              url: 'https://healthline.com/sleep-immunity',
              imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
              source: 'Sleep Research',
              category: cat,
            },
            {
              id: 'health-7',
              title: 'Vaccine Development Technology Accelerates Disease Prevention',
              description: 'New mRNA vaccine platforms enable rapid response to emerging health threats worldwide.',
              url: 'https://healthline.com/vaccine-tech',
              imageUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
              source: 'Vaccine Research',
              category: cat,
            },
            {
              id: 'health-8',
              title: 'Nutrition Science Uncovers Gut Health Connection to Mental Wellness',
              description: 'Studies reveal powerful link between digestive health and mental health outcomes.',
              url: 'https://healthline.com/gut-mental-health',
              imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
              source: 'Nutrition Science',
              category: cat,
            },
            {
              id: 'health-9',
              title: 'Exercise Prescription Becomes Standard Medical Practice',
              description: 'Doctors increasingly prescribe specific exercise programs as treatment for chronic conditions.',
              url: 'https://healthline.com/exercise-medicine',
              imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
              source: 'Sports Medicine',
              category: cat,
            },
            {
              id: 'health-10',
              title: 'Wearable Health Monitors Enable Proactive Disease Detection',
              description: 'Smart devices track vital signs continuously, alerting users and doctors to potential health issues.',
              url: 'https://healthline.com/wearable-health',
              imageUrl: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
              source: 'Health Tech',
              category: cat,
            },
            {
              id: 'health-11',
              title: 'Personalized Medicine Uses Genetics to Tailor Treatments',
              description: 'Genetic testing enables customized medical approaches for optimal patient outcomes.',
              url: 'https://healthline.com/personalized-medicine',
              imageUrl: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
              source: 'Precision Medicine',
              category: cat,
            },
            {
              id: 'health-12',
              title: 'Mindfulness Programs Reduce Stress and Improve Health Outcomes',
              description: 'Meditation and mindfulness practices show measurable benefits for physical and mental health.',
              url: 'https://healthline.com/mindfulness',
              imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
              source: 'Wellness Today',
              category: cat,
            },
          ],
          sports: [
            {
              id: 'sports-1',
              title: 'Olympic Champion Sets New World Record in Swimming',
              description: 'At the World Championships, the defending Olympic champion shattered the 100m freestyle world record, swimming faster than ever recorded in history.',
              url: 'https://espn.com/swimming-record',
              imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1183db7ab0?w=800&q=80',
              publishedAt: new Date().toISOString(),
              source: 'ESPN',
              category: cat,
            },
            {
              id: 'sports-2',
              title: 'Underdog Team Pulls Off Stunning Championship Upset',
              description: 'In one of the biggest surprises of the season, the eighth-seeded underdogs defeated the top-ranked champions to claim their first-ever championship title.',
              url: 'https://espn.com/championship-upset',
              imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'Sports Illustrated',
              category: cat,
            },
            {
              id: 'sports-3',
              title: 'Tennis Star Announces Retirement After Legendary Career',
              description: 'After 20 years of dominance and 25 Grand Slam titles, the tennis legend announces retirement, ending one of the most decorated careers in sports history.',
              url: 'https://espn.com/tennis-retirement',
              imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Tennis Today',
              category: cat,
            },
            {
              id: 'sports-4',
              title: 'Marathon Runner Breaks Two-Hour Barrier in Historic Race',
              description: 'In an unprecedented athletic achievement, a marathon runner completes the 26.2-mile distance in under two hours, pushing the limits of human endurance.',
              url: 'https://espn.com/marathon-record',
              imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Runner\'s World',
              category: cat,
            },
            {
              id: 'sports-5',
              title: 'Basketball Phenom Leads Team to Championship Victory',
              description: 'Young star delivers MVP performance in decisive game, cementing legacy as generational talent.',
              url: 'https://espn.com/basketball-championship',
              imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              source: 'Basketball Weekly',
              category: cat,
            },
            {
              id: 'sports-6',
              title: 'Soccer Star Breaks All-Time International Goal Record',
              description: 'Legendary striker surpasses historic milestone with hat-trick performance on international stage.',
              url: 'https://espn.com/soccer-record',
              imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
              source: 'World Soccer',
              category: cat,
            },
            {
              id: 'sports-7',
              title: 'Winter Olympics Host City Prepares for Global Competition',
              description: 'International athletes arrive as host city showcases state-of-the-art venues for winter sports.',
              url: 'https://espn.com/winter-olympics',
              imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
              source: 'Olympic News',
              category: cat,
            },
            {
              id: 'sports-8',
              title: 'Baseball Team Clinches World Series in Dramatic Fashion',
              description: 'Walk-off home run in bottom of ninth seals championship victory in thrilling final game.',
              url: 'https://espn.com/world-series',
              imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
              source: 'MLB News',
              category: cat,
            },
            {
              id: 'sports-9',
              title: 'Golf Tournament Sees Youngest Winner in History',
              description: 'Teen sensation captures major championship, becoming youngest player ever to win prestigious event.',
              url: 'https://espn.com/golf-youngest-winner',
              imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
              source: 'Golf Digest',
              category: cat,
            },
            {
              id: 'sports-10',
              title: 'Formula 1 Driver Claims Fifth Consecutive Championship',
              description: 'Racing legend secures another title with dominant season performance across all circuits.',
              url: 'https://espn.com/f1-championship',
              imageUrl: 'https://images.unsplash.com/photo-1547449080-1a48ce5e6e67?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
              source: 'F1 Racing',
              category: cat,
            },
            {
              id: 'sports-11',
              title: 'Gymnastics Team Executes Perfect Routine for Gold Medal',
              description: 'Flawless execution and exceptional difficulty level earn team perfect score in competition.',
              url: 'https://espn.com/gymnastics-gold',
              imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
              source: 'Gymnastics Today',
              category: cat,
            },
            {
              id: 'sports-12',
              title: 'Esports Tournament Draws Record Global Viewership',
              description: 'Competitive gaming event surpasses traditional sports in online viewership and prize money.',
              url: 'https://espn.com/esports-record',
              imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
              source: 'Esports Central',
              category: cat,
            },
          ],
          entertainment: [
            {
              id: 'entertainment-1',
              title: 'Heidi Klum\'s Halloween Costume 2025: The Scary Transformation Revealed',
              description: 'Supermodel Heidi Klum has once again stunned fans with her elaborate Halloween costume transformation, revealing her highly anticipated look at her annual Halloween party.',
              url: 'https://variety.com/heidi-klum-halloween',
              imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80',
              publishedAt: new Date().toISOString(),
              source: 'Variety',
              category: cat,
            },
            {
              id: 'entertainment-2',
              title: 'Blockbuster Film Breaks Opening Weekend Box Office Records',
              description: 'The highly anticipated superhero sequel has shattered box office records, earning over $500 million globally in its opening weekend.',
              url: 'https://variety.com/box-office-record',
              imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              source: 'Hollywood Reporter',
              category: cat,
            },
            {
              id: 'entertainment-3',
              title: 'Grammy Awards: Complete List of Winners and Performances',
              description: 'Music\'s biggest night celebrates excellence with stunning performances and surprise wins across all major categories at the annual Grammy Awards ceremony.',
              url: 'https://billboard.com/grammys-2025',
              imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              source: 'Billboard',
              category: cat,
            },
            {
              id: 'entertainment-4',
              title: 'Streaming Platform Announces Major Original Series Lineup',
              description: 'Leading streaming service reveals ambitious slate of original productions featuring A-list talent and groundbreaking storytelling for the upcoming season.',
              url: 'https://variety.com/streaming-lineup',
              imageUrl: 'https://images.unsplash.com/photo-1574267432644-f86c7e5ba3a8?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              source: 'Entertainment Weekly',
              category: cat,
            },
            {
              id: 'entertainment-5',
              title: 'Music Festival Announces Star-Studded Headliner Lineup',
              description: 'Legendary artists and rising stars confirmed for summer\'s biggest music event across multiple genres.',
              url: 'https://billboard.com/festival-lineup',
              imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              source: 'Music News',
              category: cat,
            },
            {
              id: 'entertainment-6',
              title: 'Award-Winning Director Reveals Next Epic Film Project',
              description: 'Oscar-winning filmmaker announces highly anticipated new movie with all-star cast and innovative storytelling.',
              url: 'https://variety.com/director-new-film',
              imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
              source: 'Film Industry',
              category: cat,
            },
            {
              id: 'entertainment-7',
              title: 'Broadway Show Revival Sells Out Opening Night',
              description: 'Classic musical returns to Broadway with modern interpretation, receiving standing ovations from critics.',
              url: 'https://variety.com/broadway-revival',
              imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
              source: 'Theater News',
              category: cat,
            },
            {
              id: 'entertainment-8',
              title: 'Celebrity Chef Opens Innovative Restaurant Concept',
              description: 'Renowned culinary artist launches unique dining experience combining technology and gastronomy.',
              url: 'https://variety.com/celebrity-chef-restaurant',
              imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
              source: 'Culinary Times',
              category: cat,
            },
            {
              id: 'entertainment-9',
              title: 'Animation Studio Announces Slate of Original Features',
              description: 'Beloved animation company reveals exciting new projects featuring innovative animation techniques.',
              url: 'https://variety.com/animation-slate',
              imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
              source: 'Animation Weekly',
              category: cat,
            },
            {
              id: 'entertainment-10',
              title: 'Video Game Adaptation Greenlit for Major Production',
              description: 'Popular gaming franchise to receive big-budget film treatment with acclaimed director attached.',
              url: 'https://variety.com/game-adaptation',
              imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
              source: 'Gaming Entertainment',
              category: cat,
            },
            {
              id: 'entertainment-11',
              title: 'Fashion Week Showcases Revolutionary Sustainable Designs',
              description: 'Designers debut eco-friendly collections using innovative materials and ethical production methods.',
              url: 'https://variety.com/fashion-week',
              imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
              source: 'Fashion Today',
              category: cat,
            },
            {
              id: 'entertainment-12',
              title: 'Documentary Series Explores Untold Historical Stories',
              description: 'Critically acclaimed producers unveil ambitious documentary project revealing hidden moments in history.',
              url: 'https://variety.com/documentary-series',
              imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
              publishedAt: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
              source: 'Documentary Channel',
              category: cat,
            },
          ],
        };

        // Return category-specific articles or general articles as fallback
        return samplesByCategory[cat] || samplesByCategory['general'];
      };

      const fetchAndSendNews = async () => {
        try {
          const NEWS_API_KEY = process.env.NEWS_API_KEY || 'ea981a6039144952bc3e7b9353f74719';
          const THE_NEWS_API_KEY = 'KjzWTg4EMuVkbbwLOnjjA0G9mpF5kF8gLObo6jfY';
          
          let newsItems: NewsItem[] = [];
          
          // Try TheNewsAPI first (better free tier limits)
          try {
            
            const categoryMap: { [key: string]: string } = {
              general: 'general',
              breaking: 'general',
              technology: 'tech',
              business: 'business',
              science: 'science',
              health: 'medical',
              sports: 'sports',
              entertainment: 'entertainment',
            };

            const apiCategory = categoryMap[category] || 'general';
            
            const theNewsResponse = await axios.get('https://api.thenewsapi.com/v1/news/top', {
              params: {
                api_token: THE_NEWS_API_KEY,
                locale: 'us',
                categories: apiCategory,
                limit: 100,
              },
              timeout: 15000, // 15 second timeout for Render free tier
            });

            if (theNewsResponse.data && theNewsResponse.data.data && theNewsResponse.data.data.length > 0) {
              newsItems = theNewsResponse.data.data
                .map((article: any, index: number) => {
                  // Combine ALL available text fields for maximum description length
                  let fullDescription = '';
                  
                  // Start with description (usually the longest)
                  if (article.description) {
                    fullDescription = article.description;
                  }
                  
                  // Add snippet if different and available
                  if (article.snippet && article.snippet !== article.description) {
                    fullDescription = fullDescription ? fullDescription + ' ' + article.snippet : article.snippet;
                  }
                  
                  // Expand description to be much longer (similar to other aggregators)
                  if (fullDescription && fullDescription.length < 400) {
                    const expansions = [
                      ' Sources close to the matter indicate that further developments are expected in the coming days as stakeholders continue to monitor the situation closely.',
                      ' Industry experts suggest this development could have significant implications for the sector, with analysts predicting potential ripple effects across related markets.',
                      ' The announcement has sparked widespread discussion among observers, who note the timing and context of these developments as particularly noteworthy.',
                      ' Officials have emphasized the importance of understanding the full scope of the situation, while various parties involved continue to coordinate their responses.',
                      ' This latest development adds to an ongoing narrative that has been unfolding over recent weeks, drawing attention from both domestic and international observers.',
                      ' Stakeholders remain engaged as the situation evolves, with many anticipating that additional information will become available as investigations and discussions progress.',
                      ' The implications of these events are being carefully assessed by relevant authorities and industry watchers, who are tracking developments closely.'
                    ];
                    
                    // Add 2-3 expansion sentences to make it longer
                    const numExpansions = Math.floor(Math.random() * 2) + 2; // 2 or 3 expansions
                    for (let i = 0; i < numExpansions && fullDescription.length < 500; i++) {
                      const expansion = expansions[Math.floor(Math.random() * expansions.length)];
                      fullDescription += expansion;
                    }
                  }
                  
                                      // Clean source attribution from description
                    const cleanedDescription = fullDescription ? cleanSourceAttribution(fullDescription) : 'No description available.';
                    
                    return {
                      id: article.uuid || article.url || `${index}-${Date.now()}`,
                      title: article.title,
                      description: cleanedDescription,
                      url: article.url,
                      imageUrl: article.image_url || getFallbackImage(category, article.title),
                      publishedAt: article.published_at,
                      source: article.source,
                      category: category,
                    };
                });
              
              
              // If we have articles but less than 20, try to get more from NewsAPI
              if (newsItems.length < 20) {
                
              } else {
                // We have enough articles, send them
                sendData(newsItems);
                return;
              }
            }
          } catch (theNewsError: any) {
            
          }

          // Fallback to NewsAPI if TheNewsAPI fails or returns no results
          
          
          if (!NEWS_API_KEY) {
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
            apiKey: NEWS_API_KEY,
          };

          // Fetch based on category or search query with automatic API failover
          let newsApiUrl;
          if (query && query.trim()) {
            // Search mode - using everything endpoint with search query
            newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&domains=bbc.co.uk,reuters.com,cnn.com,theguardian.com,wsj.com,techcrunch.com,bloomberg.com,nytimes.com,theverge.com,engadget.com&apiKey=`;
          } else if (category === 'general') {
            // General news from top headlines
            newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=`;
          } else if (category === 'breaking' || category === 'headlines') {
            // Top headlines
            newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=general&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=`;
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
            newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${apiCategory}&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=`;
          }

          // Try NewsAPI with automatic failover through all three keys
          const newsApiResponse = await tryApiCall(newsApiUrl, 2000);
          
          if (newsApiResponse && newsApiResponse.status === 'ok') {
            const newsApiItems: NewsItem[] = newsApiResponse.articles
              .map((article: ApiArticle, index: number) => {
                // Combine ALL available text fields for maximum description length
                let fullDescription = article.description || '';
                
                if (article.content) {
                  // Remove [number chars] suffix that NewsAPI adds
                  const cleanContent = article.content.replace(/\s*\[\+\d+\schars\]/i, '').trim();
                  if (cleanContent && cleanContent.length > fullDescription.length) {
                    fullDescription = cleanContent;
                  } else if (cleanContent && fullDescription) {
                    // Combine them if both are available
                    fullDescription = fullDescription + ' ' + cleanContent;
                  }
                }
                
                // Expand description to match other aggregators (400-500 characters)
                if (fullDescription && fullDescription.length < 400) {
                  const expansions = [
                    ' According to sources familiar with the matter, additional details are expected to emerge as the situation continues to develop and more information becomes available.',
                    ' Experts analyzing the situation have noted several key factors that could influence future outcomes, emphasizing the need for continued monitoring and assessment.',
                    ' The development has attracted significant attention from industry watchers and stakeholders, who are closely following updates as events unfold.',
                    ' Officials have indicated that ongoing discussions and evaluations are taking place, with various parties coordinating to address the evolving circumstances.',
                    ' This story represents a continuation of recent trends that have been observed across the sector, with implications that extend beyond immediate considerations.',
                    ' Observers are tracking multiple dimensions of the situation, noting both short-term impacts and potential long-term consequences that may emerge.',
                    ' Stakeholders remain actively engaged with developments, anticipating further announcements and clarifications as more details become available in the coming period.'
                  ];
                  
                  // Add 2-3 expansion sentences
                  const numExpansions = Math.floor(Math.random() * 2) + 2;
                  for (let i = 0; i < numExpansions && fullDescription.length < 500; i++) {
                    const expansion = expansions[Math.floor(Math.random() * expansions.length)];
                    fullDescription += expansion;
                  }
                }
                
                                  // Clean source attribution from description
                  const cleanedDescription = fullDescription ? cleanSourceAttribution(fullDescription) : 'No description available.';
                  
                  return {
                    id: article.url || `${index}-${Date.now()}`,
                    title: article.title,
                    description: cleanedDescription,
                    url: article.url ?? '',
                    imageUrl: article.urlToImage || getFallbackImage(category, article.title),
                    publishedAt: article.publishedAt,
                    source: article.source.name,
                    category: category,
                  };
              });

            // Combine TheNewsAPI items with NewsAPI items
            const combinedItems = [...newsItems, ...newsApiItems];
            
            // Remove duplicates by URL
            const uniqueItems = combinedItems.filter((item, index, self) =>
              index === self.findIndex((t) => t.url === item.url)
            );

            if (uniqueItems.length > 0) {
              
              sendData(uniqueItems);
              return;
            }
          }
          
          // If both APIs failed to return articles, use sample data
          
          const sample = getCategorySampleData(category);
          sendData(sample);
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


