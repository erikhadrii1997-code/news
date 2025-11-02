'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function ReadPageContent() {
  const params = useSearchParams();
  const title = params.get('t') || 'Article';
  const url = params.get('u') || '';
  const description = params.get('d') || '';
  const imageUrl = params.get('i') || '';
  const publishedAt = params.get('p') || '';
  const source = params.get('s') || '';

  const [content, setContent] = useState<string>(description);
  const [loading, setLoading] = useState<boolean>(true);

  // Get a fallback image based on title content
  const getFallbackImage = () => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('tech') || titleLower.includes('ai') || titleLower.includes('computer')) {
      return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80';
    } else if (titleLower.includes('business') || titleLower.includes('market') || titleLower.includes('economy')) {
      return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';
    } else if (titleLower.includes('sport') || titleLower.includes('football') || titleLower.includes('soccer')) {
      return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80';
    } else if (titleLower.includes('health') || titleLower.includes('medical')) {
      return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80';
    } else if (titleLower.includes('entertainment') || titleLower.includes('movie') || titleLower.includes('music')) {
      return 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&q=80';
    } else if (titleLower.includes('science') || titleLower.includes('research')) {
      return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80';
    } else if (titleLower.includes('climate') || titleLower.includes('environment') || titleLower.includes('summit')) {
      return 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&q=80';
    } else if (titleLower.includes('politics') || titleLower.includes('election') || titleLower.includes('government')) {
      return 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80';
    } else {
      return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
    }
  };

  const displayImage = imageUrl || getFallbackImage();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        if (url) {
          const res = await fetch(`/api/article?url=${encodeURIComponent(url)}&description=${encodeURIComponent(description)}`);
          const data = await res.json();
          if (data?.content && data.content.length > (description?.length || 0)) {
            setContent(data.content);
          } else {
            setContent(description);
          }
        } else {
          setContent(description);
        }
      } catch (e) {
        setContent(description);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [url, description]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <header className="p-6 sm:p-8 pb-4 sm:pb-6 border-b border-gray-100">
            <a 
              href="/" 
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 mb-4 sm:mb-6 transition-colors touch-manipulation"
            >
              ← Back to News
            </a>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 leading-tight">{title}</h1>
            <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center font-medium gap-2">
              {publishedAt && (
                <span>
                  {new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </header>

          <div className="w-full h-56 sm:h-72 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
            <img src={displayImage} alt={title} className="w-full h-full object-cover" />
          </div>

          <div className="p-6 sm:p-8 lg:p-12">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-600">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-gray-200 border-t-red-600 rounded-full animate-spin mr-3 sm:mr-4" />
                <span className="text-base sm:text-lg font-medium">Loading article content…</span>
              </div>
            ) : (
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800 leading-relaxed">
                {content.split('\n\n').map((p, i) => (
                  p.trim() ? (
                    <p key={i} className="mb-4 sm:mb-5 text-justify">
                      {p.trim()}
                    </p>
                  ) : null
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

export default function ReadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="flex items-center text-gray-600">
          <div className="w-6 h-6 border-3 border-gray-200 border-t-red-600 rounded-full animate-spin mr-4" />
          <span className="text-lg font-medium">Loading article…</span>
        </div>
      </div>
    }>
      <ReadPageContent />
    </Suspense>
  );
}
