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

  const filteredNews = news.filter((item) => {
    const t = (item.title || '').toLowerCase();
    const isDodgersBlueJays = t.includes('dodgers') && t.includes('blue jays');
    return !isDodgersBlueJays;
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
                  <p className="text-gray-600 mt-2">Found {filteredNews.length} articles</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNews.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      onClick={() => setSelectedArticle(article)}
                    />
                  ))}
                </div>
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
                        src={heroArticle.imageUrl}
                        alt={heroArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                      <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                        {heroArticle.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <time>{formatDate(heroArticle.publishedAt)}</time>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="uppercase tracking-wide">{heroArticle.source}</span>
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
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <p className="text-sm text-gray-600 mb-2">
                      {article.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-700 font-medium uppercase">{article.source}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <time className="text-gray-500">{formatDate(article.publishedAt)}</time>
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
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`${getCategoryBadge(article.category).bg} text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase`}>
                              {getCategoryBadge(article.category).text}
                            </span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="text-xs text-gray-600 font-medium uppercase">{article.source}</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <time className="text-xs text-gray-500">{formatDate(article.publishedAt)}</time>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {article.description}
                          </p>
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
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
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

            {/* More News - Full Width Grid - Only show when NOT searching */}
            {!searchQuery && moreNews.length > 0 && (
              <section className="border-t-2 border-black pt-8">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                  <h2 className="text-2xl font-black text-black uppercase tracking-wide">More News</h2>
                  <div className="w-16 h-0.5 bg-red-600"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {moreNews.slice(0, 12).map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                    />
                  ))}
                </div>
              </section>
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
