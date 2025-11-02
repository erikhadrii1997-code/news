'use client';

import React, { useState } from 'react';

interface NavbarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  currentCategory: string;
}

const categories = [
  { id: 'general', label: 'General' },
  { id: 'breaking', label: 'Breaking' },
  { id: 'technology', label: 'Technology' },
  { id: 'business', label: 'Business' },
  { id: 'science', label: 'Science' },
  { id: 'health', label: 'Health' },
  { id: 'sports', label: 'Sports' },
  { id: 'entertainment', label: 'Entertainment' },
];

const SiteNavbar: React.FC<NavbarProps> = ({ onSearch, onCategoryChange, currentCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b-4 border-black shadow-xl">
      {/* Breaking News Banner */}
      <div className="bg-black text-white py-2 text-center overflow-hidden">
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 animate-pulse px-3">
          <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
          <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">Breaking News • Live Updates • Latest Stories</span>
          <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black flex items-center justify-center">
              <span className="text-white font-black text-lg sm:text-xl">N</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tighter">
              NEWS<span className="text-red-600">.</span>
            </h1>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xl mx-10">
            <div className="relative w-full">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news articles..."
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all text-sm font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black font-bold text-xl transition-colors"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className="ml-3 px-8 py-3 bg-black text-white font-black uppercase tracking-wider hover:bg-red-600 transition-all duration-300 text-sm"
            >
              Search
            </button>
          </form>

          {/* Subscribe Button */}
          <button className="hidden lg:block px-6 py-3 bg-red-600 text-white font-black uppercase tracking-wider hover:bg-black transition-all duration-300 text-sm">
            Subscribe
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-2 hover:bg-gray-100 transition-colors rounded touch-manipulation" 
            aria-label="Toggle menu"
          >
            <div className="w-5 h-0.5 bg-gray-900 mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-gray-900 mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-gray-900 transition-all" />
          </button>
        </div>

        {/* Mobile search - shown when menu is open */}
        {isMobileMenuOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-lg touch-manipulation"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className="w-full mt-2 px-4 py-2.5 bg-red-600 text-white font-bold hover:bg-red-700 active:scale-95 transition-all text-sm touch-manipulation"
            >
              Search
            </button>
          </form>
        )}

        <nav className={`border-t-2 border-black bg-gray-50 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-col md:flex-row md:justify-center md:space-x-1 py-1 sm:py-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoryChange(cat.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap border-b-4 md:border-b-0 md:border-t-4 touch-manipulation
                  ${currentCategory === cat.id 
                    ? 'bg-black text-white border-red-600' 
                    : 'text-gray-800 hover:bg-white hover:text-black border-transparent hover:border-gray-300'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default SiteNavbar;
