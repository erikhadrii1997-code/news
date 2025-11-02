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
              {source && <span className="text-gray-900 font-bold">{source}</span>}
              {(source && publishedAt) && <span className="text-gray-300">•</span>}
              {publishedAt && (
                <span>
                  {new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </header>

          {imageUrl && (
            <div className="w-full h-56 sm:h-72 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

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

            {url && (
              <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 rounded-xl p-4 sm:p-6 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Read the full story</p>
                    <p className="text-xs text-gray-500">Continue reading on the original source</p>
                  </div>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full sm:w-auto text-center px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30 transition-all duration-200 active:scale-95 text-sm touch-manipulation"
                  >
                    Visit Source →
                  </a>
                </div>
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
