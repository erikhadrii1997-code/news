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

  // Get a fallback image based on category or article content
  const getFallbackImage = () => {
    const category = article.category?.toLowerCase() || '';
    const titleLower = title.toLowerCase();
    
    // Category-based fallbacks with relevant photos
    if (category.includes('tech') || titleLower.includes('tech') || titleLower.includes('ai') || titleLower.includes('computer')) {
      return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80';
    } else if (category.includes('business') || titleLower.includes('business') || titleLower.includes('market') || titleLower.includes('economy')) {
      return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';
    } else if (category.includes('sport') || titleLower.includes('sport') || titleLower.includes('football') || titleLower.includes('soccer')) {
      return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80';
    } else if (category.includes('health') || titleLower.includes('health') || titleLower.includes('medical')) {
      return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80';
    } else if (category.includes('entertainment') || titleLower.includes('entertainment') || titleLower.includes('movie') || titleLower.includes('music')) {
      return 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80';
    } else if (category.includes('science') || titleLower.includes('science') || titleLower.includes('research')) {
      return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80';
    } else if (titleLower.includes('climate') || titleLower.includes('environment') || titleLower.includes('summit')) {
      return 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&q=80';
    } else if (titleLower.includes('politics') || titleLower.includes('election') || titleLower.includes('government')) {
      return 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80';
    } else {
      // Default news/world image
      return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
    }
  };

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
    <a
      href={`/read?u=${encodeURIComponent(article.url)}&t=${encodeURIComponent(title)}&d=${encodeURIComponent(article.description || '')}&i=${encodeURIComponent(article.imageUrl || '')}&p=${encodeURIComponent(article.publishedAt)}&s=${encodeURIComponent(article.source)}`}
      className="group bg-white border-2 border-gray-200 overflow-hidden hover:border-black transition-all duration-300 hover:shadow-2xl touch-manipulation block w-full"
    >
      <div className="w-full">
        <div className="relative w-full h-44 sm:h-48 md:h-52 bg-gray-200 overflow-hidden">
          <img 
            src={article.imageUrl || getFallbackImage()} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.dataset.fallbackApplied !== 'true') {
                img.src = getFallbackImage();
                img.dataset.fallbackApplied = 'true';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Category Badge */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <span className={`${getCategoryColor(article.category)} text-white px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black tracking-widest uppercase`}>
              {article.category || 'NEWS'}
            </span>
          </div>
        </div>
        <div className="p-3 sm:p-4 lg:p-5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
            <time className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide">
              {formatDate(article.publishedAt)}
            </time>
            <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-400 rounded-full"></span>
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide truncate max-w-[120px] sm:max-w-none">
              {article.source}
            </span>
          </div>
          <h3 className="text-sm sm:text-base lg:text-lg font-black text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight break-words">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
            {article.description}
          </p>
        </div>
      </div>
    </a>
  );

  function getCategoryColor(category?: string) {
    const colors: { [key: string]: string } = {
      general: 'bg-gray-800',
      breaking: 'bg-red-700',
      technology: 'bg-blue-700',
      business: 'bg-green-700',
      science: 'bg-purple-700',
      health: 'bg-pink-700',
      sports: 'bg-orange-700',
      entertainment: 'bg-yellow-600',
    };
    return colors[category?.toLowerCase() || 'general'] || colors.general;
  }
};

export default NewsCard;
