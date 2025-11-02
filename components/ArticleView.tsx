// components/ArticleView.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NewsItem } from '../lib/types';
import Image from 'next/image';

interface ArticleViewProps {
  article: NewsItem;
  onClose: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onClose }) => {
  const [fullContent, setFullContent] = useState<string>(article.description);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [textToSpeechActive, setTextToSpeechActive] = useState(false);
  const [fitToScreen, setFitToScreen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFullContent = async () => {
      try {
        const response = await fetch(`/api/article?url=${encodeURIComponent(article.url)}&description=${encodeURIComponent(article.description)}`);
        const data = await response.json();
        if (data.content && data.content.length > article.description.length) {
          setFullContent(data.content);
        }
      } catch (error) {
        console.error('Error fetching full content:', error);
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchFullContent();
  }, [article.url, article.description]);

  // Calculate reading time and progress
  useEffect(() => {
    const words = fullContent.split(' ').length;
    const readTime = Math.ceil(words / 200); // Average reading speed
    setEstimatedReadTime(readTime);

    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    if (contentRef.current) {
      contentRef.current.addEventListener('scroll', handleScroll);
      return () => contentRef.current?.removeEventListener('scroll', handleScroll);
    }
  }, [fullContent]);

  // Fit content to available space by adjusting font size (binary search)
  useEffect(() => {
    if (!fitToScreen) return;
    let raf = 0;
    const container = contentRef.current;
    if (!container) return;

    const fit = () => {
      if (!contentRef.current) return;
      const minSize = 12;
      const maxSize = 24;
      let lo = minSize;
      let hi = maxSize;
      let best = minSize;

      const measure = () => {
        if (!contentRef.current) return { fits: true };
        const { scrollHeight, clientHeight } = contentRef.current;
        return { fits: scrollHeight <= clientHeight };
      };

      // Try current size first
      const current = measure();
      if (current.fits) {
        // Try to increase font size as much as possible
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          setFontSize(mid);
          // Force layout before measuring again
          // eslint-disable-next-line no-loop-func
          raf = window.requestAnimationFrame(() => {
            const { fits } = measure();
            if (fits) {
              best = mid;
              lo = mid + 1;
            } else {
              hi = mid - 1;
            }
          });
        }
        setFontSize(best);
      } else {
        // Decrease font size until it fits
        lo = minSize;
        hi = fontSize;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          setFontSize(mid);
          // eslint-disable-next-line no-loop-func
          raf = window.requestAnimationFrame(() => {
            const { fits } = measure();
            if (fits) {
              best = mid;
              lo = mid + 1;
            } else {
              hi = mid - 1;
            }
          });
        }
        setFontSize(best);
      }
    };

    // initial fit and on resize
    fit();
    const onResize = () => fit();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fitToScreen, fullContent]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async (platform: string) => {
    const shareData = {
      title: cleanTitle,
      text: article.description,
      url: article.url
    };

    switch (platform) {
      case 'native':
        if (navigator.share) {
          await navigator.share(shareData);
        }
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(cleanTitle)}&url=${encodeURIComponent(article.url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.url)}`);
        break;
      case 'copy':
        await navigator.clipboard.writeText(article.url);
        break;
    }
    setShowShareMenu(false);
  };

  const toggleTextToSpeech = () => {
    if (textToSpeechActive) {
      speechSynthesis.cancel();
      setTextToSpeechActive(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(fullContent);
      utterance.rate = 0.8;
      utterance.onend = () => setTextToSpeechActive(false);
      speechSynthesis.speak(utterance);
      setTextToSpeechActive(true);
    }
  };

  // Remove source names from title
  const cleanTitle = article.title.replace(/\s*-\s*[^-]+$/, '');

  // Get category info
  const getCategoryInfo = () => {
    const title = cleanTitle.toLowerCase();
    const description = article.description.toLowerCase();
    
    if (title.includes('breaking') || title.includes('urgent')) {
      return { color: 'from-red-500 to-red-600', label: 'Breaking', icon: '🚨' };
    }
    if (title.includes('tech') || description.includes('technology')) {
      return { color: 'from-purple-500 to-purple-600', label: 'Technology', icon: '💻' };
    }
    if (title.includes('business') || title.includes('market')) {
      return { color: 'from-green-500 to-green-600', label: 'Business', icon: '💼' };
    }
    if (title.includes('health') || title.includes('medical')) {
      return { color: 'from-pink-500 to-pink-600', label: 'Health', icon: '🏥' };
    }
    if (title.includes('sport') || title.includes('game')) {
      return { color: 'from-orange-500 to-orange-600', label: 'Sports', icon: '⚽' };
    }
    if (title.includes('science') || title.includes('research')) {
      return { color: 'from-cyan-500 to-cyan-600', label: 'Science', icon: '🔬' };
    }
    if (title.includes('entertainment') || title.includes('movie')) {
      return { color: 'from-indigo-500 to-indigo-600', label: 'Entertainment', icon: '🎬' };
    }
    return { color: 'from-blue-500 to-blue-600', label: 'General', icon: '📰' };
  };

  const categoryInfo = getCategoryInfo();

  return (
  <div className="fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-sm animate-fade-in">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200/20 z-60">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

  {/* Modal Container */}
  <div ref={modalRef} className="min-h-screen flex items-center justify-center p-4">
        {/* Background Overlay */}
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
          onClick={onClose}
        ></div>

        {/* Article Container */}
        <div className="relative bg-white rounded-xl shadow-md max-w-5xl w-full h-[90vh] my-4 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative h-56 w-full bg-gradient-to-br from-gray-900 to-gray-700 overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={cleanTitle}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            
            {/* Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
            
            {/* Premium Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
              {/* Category Badge */}
              <div className={`flex items-center space-x-2 bg-gradient-to-r ${categoryInfo.color} text-white px-4 py-2 rounded-full shadow-lg`}>
                <span className="text-lg">{categoryInfo.icon}</span>
                <span className="font-black text-sm uppercase tracking-widest">{categoryInfo.label}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {/* Reading Time */}
                <div className="glass text-white px-4 py-2 rounded-full border border-white/20">
                  <span className="text-sm font-bold">{estimatedReadTime} min read</span>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-12 h-12 glass hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-white/20"
                  aria-label="Close article"
                >
                  <svg className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Article Meta Info */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between text-white/90 mb-4">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-bold uppercase tracking-widest">Live Article</span>
                </div>
                <span className="text-sm font-medium">{formatDate(article.publishedAt)}</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                {cleanTitle}
              </h1>
            </div>
          </div>

          {/* Content Area */}
          <div 
            ref={contentRef}
            className={`flex-1 ${fitToScreen ? 'overflow-hidden' : 'overflow-y-auto'} bg-white`}
          >
            <div className="p-8 md:p-12">
              {/* Article Tools */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200/50">
                {/* Reading Controls */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => { setFitToScreen(false); setFontSize(Math.max(12, fontSize - 2)); }}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <span className="font-bold text-gray-700">A⁻</span>
                    </button>
                    <span className="px-3 text-sm font-medium text-gray-600">{fontSize}px</span>
                    <button
                      onClick={() => { setFitToScreen(false); setFontSize(Math.min(26, fontSize + 2)); }}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <span className="font-bold text-gray-700">A⁺</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setFitToScreen((v) => !v)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold ${fitToScreen ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {fitToScreen ? 'Fit to screen: ON' : 'Fit to screen: OFF'}
                  </button>
                  
                  {/* Text to Speech */}
                  <button
                    onClick={toggleTextToSpeech}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                      textToSpeechActive 
                        ? 'bg-red-100 text-red-600 border-2 border-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6 7H4a1 1 0 00-1 1v8a1 1 0 001 1h2l5.5 5.5V1.5L6 7z" />
                    </svg>
                    <span className="text-sm font-bold">{textToSpeechActive ? 'Stop' : 'Listen'}</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  {/* Bookmark */}
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                      isBookmarked 
                        ? 'bg-red-100 text-red-600 border-2 border-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  
                  {/* Share Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-2 min-w-48 z-30 animate-slide-up">
                        <div className="space-y-1">
                          {[
                            { name: 'Twitter', icon: '🐦', action: () => handleShare('twitter') },
                            { name: 'Facebook', icon: '📘', action: () => handleShare('facebook') },
                            { name: 'LinkedIn', icon: '💼', action: () => handleShare('linkedin') },
                            { name: 'Copy Link', icon: '🔗', action: () => handleShare('copy') },
                          ].map((item) => (
                            <button
                              key={item.name}
                              onClick={item.action}
                              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left"
                            >
                              <span className="text-lg">{item.icon}</span>
                              <span className="font-medium text-gray-700">{item.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Loading State */}
              {isLoadingContent && (
                <div className="mb-12">
                  <div className="flex items-center space-x-3 text-gray-500 mb-6">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                    <span className="text-sm font-bold">Fetching full article content...</span>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-shimmer"></div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Article Content */}
              {!isLoadingContent && (
                <div className="prose prose-xl max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed space-y-5"
                    style={{ fontSize: `${fontSize}px`, lineHeight: fitToScreen ? '1.5' : '1.7' }}
                  >
                    {fullContent.split('\n\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="text-gray-700 leading-relaxed mb-6 text-body">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Source Link */}
              <div className="mt-12 pt-8 border-t border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Source:</span>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-red-600 hover:text-red-700 font-medium hover:underline transition-colors duration-200"
                    >
                      Read original article
                    </a>
                  </div>
                  
                  {!fitToScreen && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>Reading progress:</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                          style={{ width: `${readingProgress}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{Math.round(readingProgress)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
