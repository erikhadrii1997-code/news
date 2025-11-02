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
    <header className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-1.5 text-center text-xs font-bold tracking-wider uppercase">
        Live Updates
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            <span className="text-red-600">NEWS</span>
          </h1>

          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-lg mx-10">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search breaking news..."
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-lg"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className="ml-3 px-7 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30 transition-all duration-200 active:scale-95 text-sm"
            >
              Search
            </button>
          </form>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" 
            aria-label="Toggle menu"
          >
            <div className="w-6 h-0.5 bg-gray-900 mb-1.5 transition-all" />
            <div className="w-6 h-0.5 bg-gray-900 mb-1.5 transition-all" />
            <div className="w-6 h-0.5 bg-gray-900 transition-all" />
          </button>
        </div>

        <nav className={`border-t border-gray-200 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-col md:flex-row md:space-x-1 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoryChange(cat.id);
                  clearSearch();
                  setIsMobileMenuOpen(false);
                }}
                className={`px-5 py-2.5 text-sm font-bold whitespace-nowrap rounded-lg transition-all duration-200 ${
                  currentCategory === cat.id 
                    ? 'text-white bg-red-600 shadow-md' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}
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
