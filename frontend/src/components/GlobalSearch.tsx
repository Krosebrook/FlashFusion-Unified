import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Filter, ChevronDown, Clock, TrendingUp, FileText, Users, Settings, BarChart3, Zap } from 'lucide-react';

interface SearchResult {
  id: string;
  contentType: string;
  name: string;
  description?: string;
  relevance: number;
  created_at?: string;
  updated_at?: string;
  metadata?: any;
}

interface SearchSuggestion {
  query: string;
  type: 'suggestion' | 'popular';
}

interface SearchFilters {
  contentTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
}

interface GlobalSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultSelect,
  placeholder = "Search workflows, agents, projects...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Available content types with icons
  const contentTypeIcons = {
    workflows: Zap,
    agents: Users,
    projects: FileText,
    integrations: Settings,
    analytics: BarChart3,
    content: FileText
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flashfusion-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Load available content types
  useEffect(() => {
    fetchContentTypes();
  }, []);

  const fetchContentTypes = async () => {
    try {
      const response = await fetch('/api/search/content-types');
      const data = await response.json();
      if (data.success) {
        setContentTypes(data.data.contentTypes);
      }
    } catch (error) {
      console.error('Failed to fetch content types:', error);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setResults([]);
        setSuggestions([]);
      }
    }, 300);
  }, []);

  // Handle query changes
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  // Handle clicks outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedResultIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '10'
      });

      if (filters.contentTypes?.length) {
        params.append('types', filters.contentTypes.join(','));
      }

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setSuggestions(data.data.suggestions || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.success) {
        const allSuggestions = [
          ...data.data.suggestions.map((s: string) => ({ query: s, type: 'suggestion' as const })),
          ...data.data.popularSearches.map((s: any) => ({ query: s.query, type: 'popular' as const }))
        ];
        setSuggestions(allSuggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
    setSelectedResultIndex(-1);

    if (value.trim()) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + suggestions.length + recentSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResultIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedResultIndex >= 0) {
          handleItemSelect(selectedResultIndex);
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedResultIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleItemSelect = (index: number) => {
    const totalResults = results.length;
    const totalSuggestions = suggestions.length;
    
    if (index < totalResults) {
      // Select search result
      const result = results[index];
      handleResultSelect(result);
    } else if (index < totalResults + totalSuggestions) {
      // Select suggestion
      const suggestion = suggestions[index - totalResults];
      setQuery(suggestion.query);
      handleSearch(suggestion.query);
    } else {
      // Select recent search
      const recentSearch = recentSearches[index - totalResults - totalSuggestions];
      setQuery(recentSearch);
      handleSearch(recentSearch);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('flashfusion-recent-searches', JSON.stringify(updated));
      
      performSearch(searchQuery);
      setShowResults(false);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result);
    setShowResults(false);
    setQuery('');
  };

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      contentTypes: prev.contentTypes?.includes(value)
        ? prev.contentTypes.filter(t => t !== value)
        : [...(prev.contentTypes || []), value]
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getContentTypeIcon = (type: string) => {
    const IconComponent = contentTypeIcons[type as keyof typeof contentTypeIcons] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance > 0.8) return 'text-green-600';
    if (relevance > 0.5) return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     bg-white text-gray-900 placeholder-gray-500"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setSuggestions([]);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-1 p-1 rounded ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Content Types</h4>
              <div className="grid grid-cols-2 gap-2">
                {contentTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.contentTypes?.includes(type) || false}
                      onChange={() => handleFilterChange('contentTypes', type)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && (query || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                Search Results ({results.length})
              </div>
              {results.map((result, index) => (
                <div
                  key={`${result.contentType}-${result.id}`}
                  onClick={() => handleResultSelect(result)}
                  className={`flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                    index === selectedResultIndex ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex-shrink-0 text-gray-400">
                    {getContentTypeIcon(result.contentType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.name}
                      </p>
                      <span className={`text-xs ${getRelevanceColor(result.relevance)}`}>
                        {Math.round(result.relevance * 100)}%
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {result.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-400 capitalize">
                        {result.contentType}
                      </span>
                      {result.updated_at && (
                        <span className="text-xs text-gray-400">
                          Updated {formatDate(result.updated_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-gray-100 p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.query}
                  onClick={() => handleSearch(suggestion.query)}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                    index + results.length === selectedResultIndex ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  {suggestion.type === 'popular' ? (
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Search className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">{suggestion.query}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="border-t border-gray-100 p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={search}
                  onClick={() => handleSearch(search)}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                    index + results.length + suggestions.length === selectedResultIndex ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{search}</span>
                </div>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          )}

          {/* No Results */}
          {!isSearching && results.length === 0 && query && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No results found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords or check your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch; 