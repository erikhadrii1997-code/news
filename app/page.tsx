'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNews } from '../hooks/useNews';
import SiteNavbar from '../components/SiteNavbar';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ArticleView from '../components/ArticleView';
import { NewsItem } from '../lib/types';

function HomePageContent() {
  const params = useSearchParams();
  const [currentCategory, setCurrentCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const { news, loading, error } = useNews({
    category: currentCategory,
    query: searchQuery,
    pageSize: 100,
  });

  // Get multiple fallback images based on category or article content
  const getFallbackImages = (article: NewsItem): string[] => {
    const category = article.category?.toLowerCase() || '';
    const titleLower = (article.title || '').toLowerCase();
    
    // Return array of fallback images for multiple attempts
    if (category.includes('tech') || titleLower.includes('tech') || titleLower.includes('ai') || titleLower.includes('computer')) {
      return [
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80'
      ];
    } else if (category.includes('business') || titleLower.includes('business') || titleLower.includes('market') || titleLower.includes('economy')) {
      return [
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80'
      ];
    } else if (category.includes('sport') || titleLower.includes('sport') || titleLower.includes('football') || titleLower.includes('soccer')) {
      return [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80'
      ];
    } else if (category.includes('health') || titleLower.includes('health') || titleLower.includes('medical')) {
      return [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
        'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80'
      ];
    } else if (category.includes('entertainment') || titleLower.includes('entertainment') || titleLower.includes('movie') || titleLower.includes('music')) {
      return [
        'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80',
        'https://images.unsplash.com/photo-1489641493513-ba4ee84ccea9?w=800&q=80',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'
      ];
    } else if (category.includes('science') || titleLower.includes('science') || titleLower.includes('research')) {
      return [
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
        'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800&q=80'
      ];
    } else if (titleLower.includes('moon') || titleLower.includes('supermoon') || titleLower.includes('space') || titleLower.includes('astronomy') || titleLower.includes('planet') || titleLower.includes('solar') || titleLower.includes('nasa') || titleLower.includes('galaxy') || titleLower.includes('star') || titleLower.includes('astronaut')) {
      return [
        'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&q=80',
        'https://images.unsplash.com/photo-1517976547714-56872799c6fe?w=800&q=80',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
      ];
    } else if (titleLower.includes('climate') || titleLower.includes('environment') || titleLower.includes('summit')) {
      return [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', // World leaders at climate summit
        'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&q=80', // Environmental action
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'  // Climate conference
      ];
    } else if (titleLower.includes('politics') || titleLower.includes('election') || titleLower.includes('government')) {
      return [
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        'https://images.unsplash.com/photo-1545987796-200677ee1011?w=800&q=80'
      ];
    } else {
      return [
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
        'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
        'https://images.unsplash.com/photo-1586880244386-d7d82ad9b13a?w=800&q=80'
      ];
    }
  };

  // Keep original function for backward compatibility
  const getFallbackImage = (article: NewsItem): string => {
    return getFallbackImages(article)[0];
  };

  const filteredNews = news.filter((item) => {
    const t = (item.title || '').toLowerCase();
    const isDodgersBlueJays = t.includes('dodgers') && t.includes('blue jays');
    
    // Filter by category - only show articles for the current category
    const matchesCategory = item.category === currentCategory || 
                           (!item.category && currentCategory === 'general') ||
                           (currentCategory === 'breaking' && (item.category === 'general' || !item.category));
    
    if (!matchesCategory) {
      return false;
    }
    
    // If searching, use ultra-intelligent search with flexible matching
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const title = (item.title || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      const source = (item.source || '').toLowerCase();
      
      // Split search query into individual words for better matching
      const searchWords = query.split(/\s+/).filter(word => word.length > 2); // Filter out very short words
      
      // Function for ultra-flexible matching
      const ultraFlexibleMatch = (text: string, searchWord: string) => {
        // Direct substring match
        if (text.includes(searchWord)) return true;
        
        // Word boundary matching - find if searchWord appears as beginning of any word
        const textWords = text.split(/\s+|[^\w]/);
        for (const textWord of textWords) {
          if (textWord.toLowerCase().startsWith(searchWord.toLowerCase())) return true;
          if (searchWord.toLowerCase().startsWith(textWord.toLowerCase()) && textWord.length > 2) return true;
        }
        
        // Fuzzy matching for similar words (simple character similarity)
        for (const textWord of textWords) {
          if (textWord.length >= 4 && searchWord.length >= 4) {
            const similarity = calculateSimilarity(textWord.toLowerCase(), searchWord.toLowerCase());
            if (similarity > 0.7) return true; // 70% similarity threshold
          }
        }
        
        return false;
      };
      
      // Simple similarity function
      const calculateSimilarity = (str1: string, str2: string) => {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        const editDistance = getEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
      };
      
      // Simple edit distance calculation
      const getEditDistance = (str1: string, str2: string) => {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
          for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
              matrix[j][i - 1] + 1, // deletion
              matrix[j - 1][i] + 1, // insertion
              matrix[j - 1][i - 1] + indicator // substitution
            );
          }
        }
        return matrix[str2.length][str1.length];
      };
      
      // Check for matches in different ways
      let matchesSearch = false;
      
      // For single word searches, be very flexible
      if (searchWords.length === 1) {
        const searchWord = searchWords[0];
        matchesSearch = ultraFlexibleMatch(title, searchWord) || 
                       ultraFlexibleMatch(description, searchWord) || 
                       ultraFlexibleMatch(source, searchWord);
      } else {
        // For multi-word searches, at least one word should match flexibly
        matchesSearch = searchWords.some(word => 
          ultraFlexibleMatch(title, word) || 
          ultraFlexibleMatch(description, word) || 
          ultraFlexibleMatch(source, word)
        );
      }
      
      // Also keep the original direct matching as fallback
      if (!matchesSearch) {
        matchesSearch = title.includes(query) || 
                       description.includes(query) || 
                       source.includes(query);
      }
      
      return !isDodgersBlueJays && matchesSearch;
    }
    
    return !isDodgersBlueJays;
  }).sort((a, b) => {
    // Sort by relevance when searching
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const searchWords = query.split(/\s+/).filter(word => word.length > 0);
      
      const getRelevanceScore = (item: any) => {
        const title = (item.title || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        let score = 0;
        
        // Higher score for title matches
        searchWords.forEach(word => {
          // Exact word matches get highest score
          if (title.split(/\s+/).some((titleWord: string) => titleWord === word)) score += 20;
          // Word starting matches get high score  
          else if (title.split(/\s+/).some((titleWord: string) => titleWord.startsWith(word))) score += 15;
          // Substring matches get medium score
          else if (title.includes(word)) score += word.length * 3;
          // Description matches get lower score
          if (description.includes(word)) score += word.length;
        });
        
        return score;
      };
      
      return getRelevanceScore(b) - getRelevanceScore(a);
    }
    return 0;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setCurrentCategory('general');
    }
  };

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
    setSearchQuery('');
  };

  useEffect(() => {
    const cat = params.get('cat');
    if (cat && cat !== currentCategory) {
      setCurrentCategory(cat);
      setSearchQuery('');
    }
  }, [params, currentCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Split articles for AP-style layout
  const heroArticle = filteredNews[0];
  const topStories = filteredNews.slice(1, 5);
  const latestStories = filteredNews.slice(5, 17);
  const editorsPicks = filteredNews.slice(17, 21);
  const trending = filteredNews.slice(21, 26);
  // Display ALL remaining articles (no limit)
  const moreNews = filteredNews.slice(26);

  const getCategoryBadge = (category: string = 'general') => {
    const badges: { [key: string]: { bg: string; text: string } } = {
      general: { bg: 'bg-gray-700', text: 'BREAKING NEWS' },
      breaking: { bg: 'bg-red-700', text: 'BREAKING' },
      technology: { bg: 'bg-blue-700', text: 'TECHNOLOGY' },
      business: { bg: 'bg-green-700', text: 'BUSINESS' },
      science: { bg: 'bg-purple-700', text: 'SCIENCE' },
      health: { bg: 'bg-pink-700', text: 'HEALTH' },
      sports: { bg: 'bg-orange-700', text: 'SPORTS' },
      entertainment: { bg: 'bg-yellow-700', text: 'ENTERTAINMENT' },
    };
    return badges[category] || badges.general;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar - AP Style */}
      <div className="bg-black text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center space-x-6 text-xs">
            <span className="font-bold tracking-wider">ADVANCING THE POWER OF FACTS</span>
            <time className="text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</time>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <SiteNavbar
        currentCategory={currentCategory}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
      />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-lg">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 font-medium">Loading latest news...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-700 text-red-900 p-6 rounded shadow-md" role="alert">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-bold">Error Loading News: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          </div>
        )}

        {!loading && filteredNews.length > 0 && (
          <>
            {/* Search Results Section */}
            {searchQuery && (
              <section className="mb-12">
                <div className="border-b-4 border-black pb-4 mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-wider">
                    Search Results for "{searchQuery}"
                  </h2>
                  {loading ? (
                    <div className="flex items-center mt-2">
                      <LoadingSpinner />
                      <p className="text-gray-600 ml-2">Searching for articles...</p>
                    </div>
                  ) : (
                    <p className="text-gray-600 mt-2">
                      {filteredNews.length === 0 
                        ? `No articles found for "${searchQuery}". Try different keywords.`
                        : `Found ${filteredNews.length} article${filteredNews.length === 1 ? '' : 's'} - Search completed!`
                      }
                    </p>
                  )}
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : filteredNews.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">No results found</h3>
                    <p className="text-gray-600 mb-6">
                      Try searching with different keywords such as:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['technology', 'business', 'sports', 'health', 'politics', 'entertainment'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSearch(suggestion)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 text-sm font-medium"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map((article) => (
                      <NewsCard
                        key={article.id}
                        article={article}
                        onClick={() => setSelectedArticle(article)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Hero Section - AP Style - Only show when NOT searching */}
            {!searchQuery && heroArticle && (
              <section className="mb-12 border-b-4 border-black pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Hero Image */}
                  <a href={`/read?u=${encodeURIComponent(heroArticle.url)}&t=${encodeURIComponent(heroArticle.title)}&d=${encodeURIComponent(heroArticle.description || '')}&i=${encodeURIComponent(heroArticle.imageUrl || '')}&p=${encodeURIComponent(heroArticle.publishedAt)}&s=${encodeURIComponent(heroArticle.source)}`} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                      <img
                        src={heroArticle.imageUrl || getFallbackImage(heroArticle)}
                        alt={heroArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (img.dataset.fallbackApplied !== 'true') {
                            img.src = getFallbackImage(heroArticle);
                            img.dataset.fallbackApplied = 'true';
                          }
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`${getCategoryBadge(heroArticle.category).bg} text-white px-3 py-1 text-xs font-bold tracking-wider`}>
                          {getCategoryBadge(heroArticle.category).text}
                        </span>
                      </div>
                    </div>
                  </a>

                  {/* Hero Content */}
                  <div className="flex flex-col justify-center">
                    <a href={`/read?u=${encodeURIComponent(heroArticle.url)}&t=${encodeURIComponent(heroArticle.title)}&d=${encodeURIComponent(heroArticle.description || '')}&i=${encodeURIComponent(heroArticle.imageUrl || '')}&p=${encodeURIComponent(heroArticle.publishedAt)}&s=${encodeURIComponent(heroArticle.source)}`} className="group">
                      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                        {heroArticle.title}
                      </h1>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <time>{formatDate(heroArticle.publishedAt)}</time>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="uppercase tracking-wide text-red-600 font-black">BREAKING NEWS</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/read?u=${encodeURIComponent(heroArticle.url)}&t=${encodeURIComponent(heroArticle.title)}&d=${encodeURIComponent(heroArticle.description || '')}&i=${encodeURIComponent(heroArticle.imageUrl || '')}&p=${encodeURIComponent(heroArticle.publishedAt)}&s=${encodeURIComponent(heroArticle.source)}`;
                          }}
                          className="bg-red-600 text-white px-6 py-3 text-sm font-black uppercase tracking-wider hover:bg-black transition-all duration-300"
                        >
                          Read Story
                        </button>
                      </div>
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* Top Stories Grid - AP Style - Only show when NOT searching */}
            {!searchQuery && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                <h2 className="text-2xl font-black text-black uppercase tracking-wide">Top Stories</h2>
                <div className="w-16 h-0.5 bg-red-600"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topStories.map((article) => (
                  <a
                    key={article.id}
                    href={`/read?u=${encodeURIComponent(article.url)}&t=${encodeURIComponent(article.title)}&d=${encodeURIComponent(article.description || '')}&i=${encodeURIComponent(article.imageUrl || '')}&p=${encodeURIComponent(article.publishedAt)}&s=${encodeURIComponent(article.source)}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-3">
                      <img
                        src={article.imageUrl || getFallbackImage(article)}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (img.dataset.fallbackApplied !== 'true') {
                            img.src = getFallbackImage(article);
                            img.dataset.fallbackApplied = 'true';
                          }
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`${getCategoryBadge(article.category).bg} text-white px-2 py-0.5 text-[10px] font-bold tracking-wider`}>
                          {getCategoryBadge(article.category).text}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-3 group-hover:text-blue-600 transition-colors leading-tight">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-red-600 font-black uppercase">BREAKING NEWS</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <time className="text-gray-500">{formatDate(article.publishedAt)}</time>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/read?u=${encodeURIComponent(article.url)}&t=${encodeURIComponent(article.title)}&d=${encodeURIComponent(article.description || '')}&i=${encodeURIComponent(article.imageUrl || '')}&p=${encodeURIComponent(article.publishedAt)}&s=${encodeURIComponent(article.source)}`;
                        }}
                        className="bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-all duration-300"
                      >
                        Read
                      </button>
                    </div>
                  </a>
                ))}
              </div>
            </section>
            )}

            {/* Main Content Area - Only show when NOT searching */}
            {!searchQuery && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Latest Stories - Left/Center Column */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                  <h2 className="text-2xl font-black text-black uppercase tracking-wide">Latest Stories</h2>
                  <div className="w-16 h-0.5 bg-red-600"></div>
                </div>
                <div className="space-y-6">
                  {latestStories.map((article) => (
                    <article key={article.id} className="group border-b border-gray-200 pb-6 last:border-0">
                      <a href={`/read?u=${encodeURIComponent(article.url)}&t=${encodeURIComponent(article.title)}&d=${encodeURIComponent(article.description || '')}&i=${encodeURIComponent(article.imageUrl || '')}&p=${encodeURIComponent(article.publishedAt)}&s=${encodeURIComponent(article.source)}`} className="flex gap-5">
                        <div className="flex-shrink-0 w-48 h-32 bg-gray-100 overflow-hidden">
                          <img
                            src={article.imageUrl || getFallbackImage(article)}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              const fallbacks = getFallbackImages(article);
                              const currentAttempt = parseInt(img.dataset.attempt || '0', 10);
                              
                              if (currentAttempt < fallbacks.length - 1) {
                                img.dataset.attempt = (currentAttempt + 1).toString();
                                img.src = fallbacks[currentAttempt + 1];
                              } else if (!img.dataset.finalFallback) {
                                // Final fallback - reliable news image
                                img.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
                                img.dataset.finalFallback = 'true';
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`${getCategoryBadge(article.category).bg} text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase`}>
                              {getCategoryBadge(article.category).text}
                            </span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="text-xs text-red-600 font-black uppercase">BREAKING NEWS</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <time className="text-xs text-gray-500">{formatDate(article.publishedAt)}</time>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                            {article.title}
                          </h3>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/read?u=${encodeURIComponent(article.url)}&t=${encodeURIComponent(article.title)}&d=${encodeURIComponent(article.description || '')}&i=${encodeURIComponent(article.imageUrl || '')}&p=${encodeURIComponent(article.publishedAt)}&s=${encodeURIComponent(article.source)}`;
                            }}
                            className="bg-red-600 text-white px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-black transition-all duration-300"
                          >
                            Read Full Story
                          </button>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              </div>

              {/* Sidebar - Right Column */}
              <aside className="lg:col-span-1 space-y-8">
                {/* Trending Now */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
                    <h2 className="text-lg font-black text-black uppercase tracking-wide">Trending Now</h2>
                  </div>
                  <div className="space-y-4">
                    {trending.map((article, index) => (
                      <a
                        key={article.id}
                        href={`/read?u=${encodeURIComponent(article.url)}&t=${encodeURIComponent(article.title)}&d=${encodeURIComponent(article.description || '')}&i=${encodeURIComponent(article.imageUrl || '')}&p=${encodeURIComponent(article.publishedAt)}&s=${encodeURIComponent(article.source)}`}
                        className="group flex gap-3"
                      >
                        <span className="flex-shrink-0 text-3xl font-black text-gray-200 group-hover:text-red-600 transition-colors">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-3">
                            {article.title}
                          </h3>
                          <time className="text-xs text-gray-500 mt-1 block">{formatDate(article.publishedAt)}</time>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Editor's Picks */}
                <div className="bg-black text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4 border-b-2 border-white pb-2">
                    <h2 className="text-lg font-black uppercase tracking-wide">Editor's Picks</h2>
                  </div>
                  <div className="space-y-5">
                    {editorsPicks.map((article) => (
                      <a
                        key={article.id}
                        href={`/read?u=${encodeURIComponent(article.url)}&t=${encodeURIComponent(article.title)}&d=${encodeURIComponent(article.description || '')}&i=${encodeURIComponent(article.imageUrl || '')}&p=${encodeURIComponent(article.publishedAt)}&s=${encodeURIComponent(article.source)}`}
                        className="group block"
                      >
                        <div className="relative aspect-[16/9] overflow-hidden mb-2 bg-gray-800">
                          <img
                            src={article.imageUrl || getFallbackImage(article)}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              if (img.dataset.fallbackApplied !== 'true') {
                                img.src = getFallbackImage(article);
                                img.dataset.fallbackApplied = 'true';
                              }
                            }}
                          />
                        </div>
                        <h3 className="text-sm font-bold group-hover:text-red-400 transition-colors leading-tight line-clamp-2">
                          {article.title}
                        </h3>
                        <time className="text-xs text-gray-400 mt-1 block">{formatDate(article.publishedAt)}</time>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Categories Quick Links */}
                <div className="border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-black text-black uppercase tracking-wide mb-4 border-b-2 border-black pb-2">
                    More Topics
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['Technology', 'Business', 'Science', 'Health', 'Sports', 'Entertainment'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat.toLowerCase())}
                        className="text-left px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors border border-gray-300 rounded"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            )}

            {/* All News - Display ALL articles in rows - Only show when NOT searching */}
            {/* This section shows ALL previously loaded articles in addition to the categorized sections above */}
            {!searchQuery && filteredNews.length > 0 && (
              <>
                <section className="border-t-4 border-black pt-12 mt-12">
                  <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                    <h2 className="text-3xl font-black text-black uppercase tracking-wide">
                      All Latest News ({filteredNews.length} total articles)
                    </h2>
                    <div className="w-24 h-1 bg-red-600"></div>
                  </div>
                  {/* Display all articles in rows - 4 columns grid, showing ALL previously loaded articles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredNews.map((article) => (
                      <NewsCard
                        key={article.id}
                        article={article}
                        onClick={() => setSelectedArticle(article)}
                      />
                    ))}
                  </div>
                </section>

                {/* New Section After All Articles - Matching Theme */}
                <section className="border-t-4 border-black pt-12 mt-12">
                  <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                    <h2 className="text-3xl font-black text-black uppercase tracking-wide">
                      Stay Updated
                    </h2>
                    <div className="w-24 h-1 bg-red-600"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Category Quick Access */}
                    <div className="border-2 border-black p-6 bg-white hover:bg-gray-50 transition-colors duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full mr-3 animate-pulse"></div>
                        <h3 className="text-xl font-black text-black uppercase tracking-wide">
                          Explore Categories
                        </h3>
                      </div>
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        Discover news across all categories. Browse through Technology, Business, Science, Health, Sports, and Entertainment to stay informed.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {['Technology', 'Business', 'Science', 'Health', 'Sports', 'Entertainment'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat.toLowerCase())}
                            className="px-4 py-2 text-sm font-black text-black border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-wide"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                                         {/* Latest Updates Info */}
                     <div className="border-2 border-black p-6 bg-white hover:bg-gray-50 transition-colors duration-300">
                       <div className="flex items-center mb-4">
                         <div className="w-2 h-2 bg-red-600 rounded-full mr-3 animate-pulse"></div>
                         <h3 className="text-xl font-black text-black uppercase tracking-wide">
                           Real-Time News
                         </h3>
                       </div>
                                               <p className="text-gray-700 leading-relaxed">
                          Our news feed updates automatically every 5 minutes, bringing you the latest breaking stories and updates worldwide.
                        </p>
                     </div>

                    {/* Breaking News Alert */}
                    <div className="border-2 border-black p-6 bg-black text-white hover:bg-gray-900 transition-colors duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full mr-3 animate-ping"></div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wide">
                          Breaking News
                        </h3>
                      </div>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        Get instant notifications for breaking news and major stories. Stay ahead with real-time updates delivered directly to your feed.
                      </p>
                      <div className="flex items-center space-x-2 text-sm font-black uppercase tracking-wider">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="text-white">LIVE UPDATES</span>
                      </div>
                    </div>
                                      </div>
                 </section>

                                                                           {/* Editor's Picks Section - Clean List Format - Always Shows Latest 8 Articles */}
                    <section className="border-t-4 border-black pt-12 mt-12">
                      <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                        <h2 className="text-3xl font-black text-black uppercase tracking-wide">
                          Editor's Picks
                        </h2>
                        <div className="w-24 h-1 bg-red-600"></div>
                      </div>
                      <div className="space-y-6">
                        {/* Sort by published date (newest first) and take the latest 8 articles */}
                        {[...filteredNews]
                          .sort((a, b) => {
                            const dateA = new Date(a.publishedAt).getTime();
                            const dateB = new Date(b.publishedAt).getTime();
                            return dateB - dateA; // Newest first
                          })
                          .slice(0, 8)
                          .map((article) => {
                          // Get the original title - if it doesn't already have source, add it
                          let displayTitle = article.title;
                          const sourceName = article.source || 'News';
                          
                          // Check if title already ends with source name pattern
                          if (!article.title.includes(` - ${sourceName}`)) {
                            // Remove any existing source suffix first
                            const cleanedTitle = article.title.replace(/\s*-\s*[^-]+$/, '').trim();
                            displayTitle = `${cleanedTitle} - ${sourceName}`;
                          }
                          
                          const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          });

                          return (
                            <div
                              key={article.id}
                              className="group border-b-2 border-gray-200 pb-6 last:border-0 hover:border-black transition-colors duration-300"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-black mb-2 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                                    {displayTitle}
                                  </h3>
                                  <p className="text-sm text-gray-600 font-medium">
                                    {formattedDate}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = `/read?u=${encodeURIComponent(article.url)}&t=${encodeURIComponent(article.title)}&d=${encodeURIComponent(article.description || '')}&i=${encodeURIComponent(article.imageUrl || '')}&p=${encodeURIComponent(article.publishedAt)}&s=${encodeURIComponent(article.source)}`;
                                  }}
                                  className="bg-red-600 text-white px-6 py-2 text-sm font-black uppercase tracking-wider hover:bg-black transition-all duration-300 whitespace-nowrap"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                   </section>
                </>
              )}
            </>
          )}

        {!loading && filteredNews.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No articles found.</p>
          </div>
        )}
      </main>

      {/* Article Modal */}
      {selectedArticle && (
        <ArticleView
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {/* Footer - AP Style */}
      <footer className="bg-black text-white mt-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider mb-4">About</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-red-400 transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Awards</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider mb-4">Content</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-red-400 transition-colors">Latest News</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Archive</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Multimedia</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-red-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Feedback</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-red-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <p className="text-sm text-gray-400 text-center">
              © {new Date().getFullYear()} News Agency. All rights reserved. | Advancing the power of facts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomePageContent />
    </Suspense>
  );
}
