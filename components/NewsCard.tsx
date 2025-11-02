// components/NewsCard.tsx
import React from 'react';
import { NewsItem } from '../lib/types';

interface NewsCardProps {
  article: NewsItem;
  onClick?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const title = article.title.replace(/\s*-\s*[^-]+$/, '');

  const handleOpen = () => {
    if (onClick) {
      onClick();
    } else if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  const onKeyActivate: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <article className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 touch-manipulation">
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={onKeyActivate}
        className="w-full text-left cursor-pointer"
      >
        {article.imageUrl && (
          <div className="relative w-full h-48 sm:h-52 md:h-48 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
            <img 
              src={article.imageUrl} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.dataset.fallbackApplied !== 'true') {
                  img.src = 'https://placehold.co/800x480?text=News';
                  img.dataset.fallbackApplied = 'true';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        <div className="p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-2.5 line-clamp-2 group-hover:text-red-600 transition-colors duration-200 leading-snug">
            {title}
          </h3>
          {article.description && (
            <p className="text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3 leading-relaxed">{article.description}</p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 flex items-center font-medium">
              <span className="text-gray-700 font-semibold">{article.source}</span>
              <span className="mx-2 text-gray-300">•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <a
              href={`/read?u=${encodeURIComponent(article.url)}&t=${encodeURIComponent(title)}&d=${encodeURIComponent(article.description || '')}&i=${encodeURIComponent(article.imageUrl || '')}&p=${encodeURIComponent(article.publishedAt)}&s=${encodeURIComponent(article.source)}`}
              className="w-full sm:w-auto text-center px-4 py-2 sm:py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30 transition-all duration-200 active:scale-95 touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
              }}
              aria-label="Open article"
            >
              Open
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
