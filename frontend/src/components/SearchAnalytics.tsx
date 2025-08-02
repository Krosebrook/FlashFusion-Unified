import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Clock, Users, BarChart3, Calendar, Filter, RefreshCw } from 'lucide-react';

interface SearchAnalyticsData {
  popularSearches: Array<{
    query: string;
    count: number;
  }>;
  recentSearches: Array<{
    query: string;
    timestamp: string;
  }>;
  totalSearches: number;
  searchTrends?: Array<{
    date: string;
    count: number;
  }>;
  contentTypeDistribution?: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  averageSearchTime?: number;
  searchSuccessRate?: number;
}

interface SearchAnalyticsProps {
  className?: string;
}

const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({ className = "" }) => {
  const [analytics, setAnalytics] = useState<SearchAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      setError('Failed to fetch analytics');
      console.error('Analytics fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSearchTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSearchTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingUp className="w-4 h-4 transform rotate-180" />;
    return <BarChart3 className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
          <p className="text-gray-600">Search analytics will appear here once users start searching.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Search Analytics</h2>
            <p className="text-gray-600">Insights into search behavior and performance</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <button
              onClick={fetchAnalytics}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Refresh analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Searches</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.totalSearches.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Unique Queries</p>
                <p className="text-2xl font-bold text-green-900">{analytics.popularSearches.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Avg Search Time</p>
                <p className="text-2xl font-bold text-purple-900">
                  {analytics.averageSearchTime ? `${analytics.averageSearchTime.toFixed(1)}s` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Success Rate</p>
                <p className="text-2xl font-bold text-orange-900">
                  {analytics.searchSuccessRate ? `${analytics.searchSuccessRate}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Searches */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Popular Searches</h3>
            <span className="text-sm text-gray-500">{analytics.popularSearches.length} queries</span>
          </div>
          
          <div className="space-y-3">
            {analytics.popularSearches.slice(0, 10).map((search, index) => (
              <div key={search.query} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">{search.query}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{search.count} searches</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(search.count / analytics.popularSearches[0]?.count) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Searches</h3>
            <span className="text-sm text-gray-500">Last 24 hours</span>
          </div>
          
          <div className="space-y-3">
            {analytics.recentSearches.slice(0, 10).map((search, index) => (
              <div key={`${search.query}-${search.timestamp}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 truncate">{search.query}</span>
                </div>
                <span className="text-sm text-gray-500">{formatTimeAgo(search.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Type Distribution */}
      {analytics.contentTypeDistribution && analytics.contentTypeDistribution.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Type Distribution</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.contentTypeDistribution.map((item) => (
              <div key={item.type} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">{item.type}</span>
                  <span className="text-sm text-gray-500">{item.count} searches</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">{item.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Trends */}
      {analytics.searchTrends && analytics.searchTrends.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Trends</h3>
          
          <div className="space-y-3">
            {analytics.searchTrends.slice(-7).map((trend, index) => {
              const previousDay = analytics.searchTrends[index - 1];
              const change = previousDay ? trend.count - previousDay.count : 0;
              const changePercent = previousDay ? (change / previousDay.count) * 100 : 0;
              
              return (
                <div key={trend.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{formatDate(trend.date)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{trend.count} searches</span>
                    <div className={`flex items-center space-x-1 ${getSearchTrendColor(changePercent)}`}>
                      {getSearchTrendIcon(changePercent)}
                      <span className="text-xs">
                        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Most Popular Search</h4>
              <p className="text-lg font-bold text-blue-700">
                {analytics.popularSearches[0]?.query || 'No searches yet'}
              </p>
              <p className="text-sm text-blue-600">
                {analytics.popularSearches[0]?.count || 0} searches
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Search Growth</h4>
              <p className="text-lg font-bold text-green-700">
                {analytics.totalSearches > 0 ? 'Active' : 'No activity'}
              </p>
              <p className="text-sm text-green-600">
                {analytics.popularSearches.length} unique queries
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="text-sm font-medium text-purple-900 mb-2">Average Search Time</h4>
              <p className="text-lg font-bold text-purple-700">
                {analytics.averageSearchTime ? `${analytics.averageSearchTime.toFixed(1)} seconds` : 'N/A'}
              </p>
              <p className="text-sm text-purple-600">
                {analytics.averageSearchTime && analytics.averageSearchTime < 2 ? 'Fast searches' : 'Standard performance'}
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="text-sm font-medium text-orange-900 mb-2">Search Success Rate</h4>
              <p className="text-lg font-bold text-orange-700">
                {analytics.searchSuccessRate ? `${analytics.searchSuccessRate}%` : 'N/A'}
              </p>
              <p className="text-sm text-orange-600">
                {analytics.searchSuccessRate && analytics.searchSuccessRate > 80 ? 'Excellent' : 'Good'} performance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics; 