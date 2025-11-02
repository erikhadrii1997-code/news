'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNews } from '../hooks/useNews';
import SiteNavbar from '../components/SiteNavbar';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
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
    pageSize: 50,
  });

  // Filter out any known-bad article (e.g., Dodgers-Blue Jays) and ensure we only show good entries
  const filteredNews = news.filter((item) => {
    const t = (item.title || '').toLowerCase();
    // Remove the Dodgers vs Blue Jays article by title keywords
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

  // Reflect URL cat param into state so footer links like /?cat=technology work
  useEffect(() => {
    const cat = params.get('cat');
    if (cat && cat !== currentCategory) {
      setCurrentCategory(cat);
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const getSectionTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    const categoryLabels: { [key: string]: string } = {
      general: 'Latest News',
      breaking: 'Breaking News',
      technology: 'Technology',
      business: 'Business',
      science: 'Science',
      health: 'Health',
      sports: 'Sports',
      entertainment: 'Entertainment',
    };
    return categoryLabels[currentCategory] || 'Latest News';
  };

  const topArticle = filteredNews[0];
  const otherArticles = filteredNews.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SiteNavbar
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        currentCategory={currentCategory}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

  {!loading && !error && filteredNews.length > 0 && (
          <>
            <div className="mb-10">
              <h1 className="text-5xl font-extrabold text-gray-900 mb-8 relative">
                <span className="relative inline-block">
                  {getSectionTitle()}
                  <span className="absolute -left-4 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 to-red-500 rounded-full"></span>
                </span>
              </h1>

              {topArticle && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 pb-10 border-b border-gray-200">
                  <button
                    onClick={() => setSelectedArticle(topArticle)}
                    className="relative h-[28rem] rounded-2xl overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500"
                  >
                    {topArticle.imageUrl && (
                      <>
                        <img
                          src={topArticle.imageUrl}
                          alt={topArticle.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (img.dataset.fallbackApplied !== 'true') {
                              img.src = 'https://placehold.co/1200x800?text=News';
                              img.dataset.fallbackApplied = 'true';
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </>
                    )}
                  </button>

                  <div className="flex flex-col justify-center">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedArticle(topArticle)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedArticle(topArticle);
                        }
                      }}
                      className="text-left group cursor-pointer"
                    >
                      <h2 className="text-4xl font-extrabold text-gray-900 mb-5 leading-tight group-hover:text-red-600 transition-colors duration-300">
                        {topArticle.title}
                      </h2>
                      <p className="text-lg text-gray-700 mb-6 line-clamp-4 leading-relaxed">
                        {topArticle.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600 font-medium">
                          <span className="text-gray-900 font-bold">{topArticle.source}</span>
                          <span className="mx-3 text-gray-300">•</span>
                          <span>
                            {new Date(topArticle.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <a
                          href={`/read?u=${encodeURIComponent(topArticle.url)}&t=${encodeURIComponent(topArticle.title)}&d=${encodeURIComponent(topArticle.description || '')}&i=${encodeURIComponent(topArticle.imageUrl || '')}&p=${encodeURIComponent(topArticle.publishedAt)}&s=${encodeURIComponent(topArticle.source)}`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="ml-4 px-6 py-2.5 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30 transition-all duration-200 active:scale-95"
                          aria-label="Open top article"
                        >
                          Open
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {otherArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onClick={() => setSelectedArticle(article)}
                />
              ))}
            </div>
          </>
        )}

  {!loading && !error && filteredNews.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No articles found</h3>
            <p className="text-lg text-gray-600">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : 'No articles available in this category'}
            </p>
          </div>
        )}
      </main>

      {selectedArticle && (
        <ArticleView article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center text-gray-600">
            <div className="w-6 h-6 border-3 border-gray-200 border-t-red-600 rounded-full animate-spin mr-4" />
            <span className="text-lg font-medium">Loading news…</span>
          </div>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
