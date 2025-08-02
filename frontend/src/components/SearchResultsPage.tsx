import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight, FileText, Users, Settings, BarChart3, Zap, Calendar, Tag } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

interface SearchResult {
  id: string;
  contentType: string;
  name: string;
  description?: string;
  relevance: number;
  created_at?: string;
  updated_at?: string;
  metadata?: any;
  tags?: string[];
  status?: string;
}

interface SearchFilters {
  contentTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  tags?: string[];
}

interface SearchResultsPageProps {
  initialQuery?: string;
  onResultSelect?: (result: SearchResult) => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  initialQuery = '',
  onResultSelect
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  // Available content types with icons and colors
  const contentTypeConfig = {
    workflows: { icon: Zap, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    agents: { icon: Users, color: 'text-green-600', bgColor: 'bg-green-50' },
    projects: { icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    integrations: { icon: Settings, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    analytics: { icon: BarChart3, color: 'text-red-600', bgColor: 'bg-red-50' },
    content: { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-50' }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
    fetchContentTypes();
  }, [initialQuery]);

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

  const performSearch = async (searchQuery: string, page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        limit: resultsPerPage.toString(),
        sortBy,
        sortOrder
      });

      if (filters.contentTypes?.length) {
        params.append('types', filters.contentTypes.join(','));
      }

      if (filters.dateRange?.start) {
        params.append('dateStart', filters.dateRange.start);
      }

      if (filters.dateRange?.end) {
        params.append('dateEnd', filters.dateRange.end);
      }

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setTotalResults(data.data.total);
        setCurrentPage(page);
        
        // Extract available tags and statuses from results
        const tags = new Set<string>();
        const statuses = new Set<string>();
        
        data.data.results.forEach((result: SearchResult) => {
          if (result.tags) {
            result.tags.forEach(tag => tags.add(tag));
          }
          if (result.status) {
            statuses.add(result.status);
          }
        });
        
        setAvailableTags(Array.from(tags));
        setAvailableStatuses(Array.from(statuses));
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    performSearch(searchQuery, 1);
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handlePageChange = (page: number) => {
    performSearch(query, page);
  };

  const getContentTypeIcon = (type: string) => {
    const config = contentTypeConfig[type as keyof typeof contentTypeConfig];
    if (!config) return <FileText className="w-4 h-4" />;
    
    const IconComponent = config.icon;
    return <IconComponent className={`w-4 h-4 ${config.color}`} />;
  };

  const getContentTypeBadge = (type: string) => {
    const config = contentTypeConfig[type as keyof typeof contentTypeConfig];
    if (!config) return null;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        {getContentTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance > 0.8) return 'text-green-600 bg-green-50';
    if (relevance > 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-500 bg-gray-50';
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <GlobalSearch
                onResultSelect={onResultSelect}
                placeholder="Search workflows, agents, projects..."
              />
            </div>
            
            <div className="ml-4 flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Search Query Display */}
          {query && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Search results for <span className="font-medium text-gray-900">"{query}"</span>
                {totalResults > 0 && (
                  <span className="ml-2 text-gray-500">
                    ({totalResults} result{totalResults !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                </div>

                {/* Content Type Filters */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Content Types</h4>
                  <div className="space-y-2">
                    {contentTypes.map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.contentTypes?.includes(type) || false}
                          onChange={(e) => {
                            const current = filters.contentTypes || [];
                            const updated = e.target.checked
                              ? [...current, type]
                              : current.filter(t => t !== type);
                            handleFilterChange('contentTypes', updated);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Date Range</h4>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.dateRange?.start || ''}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        start: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Start date"
                    />
                    <input
                      type="date"
                      value={filters.dateRange?.end || ''}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        end: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="End date"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                {availableStatuses.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Status</h4>
                    <div className="space-y-2">
                      {availableStatuses.map(status => (
                        <label key={status} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.status?.includes(status) || false}
                            onChange={(e) => {
                              const current = filters.status || [];
                              const updated = e.target.checked
                                ? [...current, status]
                                : current.filter(s => s !== status);
                              handleFilterChange('status', updated);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags Filter */}
                {availableTags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Tags</h4>
                    <div className="space-y-2">
                      {availableTags.map(tag => (
                        <label key={tag} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.tags?.includes(tag) || false}
                            onChange={(e) => {
                              const current = filters.tags || [];
                              const updated = e.target.checked
                                ? [...current, tag]
                                : current.filter(t => t !== tag);
                              handleFilterChange('tags', updated);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">Sort by:</span>
                  <div className="flex space-x-2">
                    {[
                      { key: 'relevance', label: 'Relevance' },
                      { key: 'date', label: 'Date' },
                      { key: 'name', label: 'Name' }
                    ].map(sortOption => (
                      <button
                        key={sortOption.key}
                        onClick={() => handleSortChange(sortOption.key)}
                        className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                          sortBy === sortOption.key
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {sortOption.label}
                        {sortBy === sortOption.key && (
                          sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
                </div>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Searching...</span>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={`${result.contentType}-${result.id}`}
                    onClick={() => onResultSelect?.(result)}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getContentTypeIcon(result.contentType)}
                          <h3 className="text-lg font-medium text-gray-900">{result.name}</h3>
                          {getContentTypeBadge(result.contentType)}
                        </div>
                        
                        {result.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">{result.description}</p>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {result.updated_at && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Updated {formatDate(result.updated_at)}
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(result.relevance)}`}>
                              {Math.round(result.relevance * 100)}% match
                            </span>
                          </div>

                          {result.status && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize">
                              {result.status}
                            </span>
                          )}
                        </div>

                        {result.tags && result.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3">
                            <Tag className="w-4 h-4 text-gray-400" />
                            {result.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage; 