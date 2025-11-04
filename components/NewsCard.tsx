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

  // Get multiple fallback images based on category or article content
  const getFallbackImages = () => {
    const category = article.category?.toLowerCase() || '';
    const titleLower = title.toLowerCase();
    
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
        'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&q=80',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80'
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
      className="group bg-white border-2 border-gray-200 overflow-hidden hover:border-black transition-all duration-300 hover:shadow-2xl touch-manipulation block"
    >
      <div className="w-full">
        <div className="relative w-full h-48 sm:h-52 md:h-48 bg-gray-200 overflow-hidden">
          <img 
            src={article.imageUrl || getFallbackImages()[0]} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              const fallbacks = getFallbackImages();
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className={`${getCategoryColor(article.category)} text-white px-3 py-1 text-[10px] font-black tracking-widest uppercase`}>
              {article.category || 'NEWS'}
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center space-x-2 mb-2">
            <time className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {formatDate(article.publishedAt)}
            </time>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span className="text-xs text-red-600 font-black uppercase tracking-wide">
              BREAKING NEWS
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
            {title}
          </h3>
          
          {/* Read Button */}
          <div className="flex justify-between items-center">
            <button 
              className="bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-all duration-300 group-hover:bg-red-600"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/read?u=${encodeURIComponent(article.url)}&t=${encodeURIComponent(title)}&d=${encodeURIComponent(article.description || '')}&i=${encodeURIComponent(article.imageUrl || '')}&p=${encodeURIComponent(article.publishedAt)}&s=${encodeURIComponent(article.source)}`;
              }}
            >
              Read Article
            </button>
            <span className="text-xs text-gray-400 font-medium">
              {Math.ceil(article.description?.length / 100) || 1} min read
            </span>
          </div>
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
