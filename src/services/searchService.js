const logger = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');

/**
 * FlashFusion Unified Search Service
 * Provides comprehensive search capabilities across all platform content
 */
class SearchService {
    constructor() {
        this.isInitialized = false;
        this.supabase = null;
        this.searchIndices = new Map();
        this.searchHistory = new Map();
    }

    async initialize() {
        try {
            // Initialize Supabase for search storage
            this.supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );

            // Initialize search indices
            await this.initializeSearchIndices();
            
            this.isInitialized = true;
            logger.info('Search service initialized successfully');
            
            return { success: true };
        } catch (error) {
            logger.error('Failed to initialize search service:', error);
            return { success: false, error: error.message };
        }
    }

    async initializeSearchIndices() {
        // Define search indices for different content types
        this.searchIndices.set('workflows', {
            fields: ['name', 'description', 'type', 'status', 'tags', 'configuration'],
            weight: 1.0
        });

        this.searchIndices.set('agents', {
            fields: ['name', 'role', 'capabilities', 'description', 'performance'],
            weight: 0.9
        });

        this.searchIndices.set('projects', {
            fields: ['name', 'description', 'phase', 'status', 'context', 'metadata'],
            weight: 0.8
        });

        this.searchIndices.set('integrations', {
            fields: ['name', 'type', 'description', 'status', 'configuration'],
            weight: 0.7
        });

        this.searchIndices.set('analytics', {
            fields: ['name', 'type', 'description', 'metrics', 'insights'],
            weight: 0.6
        });

        this.searchIndices.set('content', {
            fields: ['title', 'content', 'type', 'tags', 'metadata'],
            weight: 0.5
        });
    }

    /**
     * Perform unified search across all content types
     */
    async search(query, options = {}) {
        if (!this.isInitialized) {
            return { success: false, error: 'Search service not initialized' };
        }

        try {
            const {
                contentTypes = Object.keys(this.searchIndices),
                filters = {},
                sortBy = 'relevance',
                sortOrder = 'desc',
                page = 1,
                limit = 20,
                includeMetadata = true
            } = options;

            // Store search in history
            this.addToSearchHistory(query, options);

            // Perform search across specified content types
            const searchPromises = contentTypes.map(type => 
                this.searchContentType(type, query, filters, includeMetadata)
            );

            const results = await Promise.all(searchPromises);
            
            // Combine and rank results
            const combinedResults = this.combineAndRankResults(results, query);
            
            // Apply sorting
            const sortedResults = this.sortResults(combinedResults, sortBy, sortOrder);
            
            // Apply pagination
            const paginatedResults = this.paginateResults(sortedResults, page, limit);

            return {
                success: true,
                data: {
                    results: paginatedResults.results,
                    total: paginatedResults.total,
                    page,
                    limit,
                    hasMore: paginatedResults.hasMore,
                    query,
                    filters,
                    suggestions: await this.generateSearchSuggestions(query)
                }
            };

        } catch (error) {
            logger.error('Search failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Search specific content type
     */
    async searchContentType(contentType, query, filters, includeMetadata) {
        const index = this.searchIndices.get(contentType);
        if (!index) {
            return [];
        }

        try {
            let searchQuery = this.supabase
                .from(`search_${contentType}`)
                .select('*');

            // Apply text search
            if (query.trim()) {
                const searchFields = index.fields.join(',');
                searchQuery = searchQuery.textSearch(searchFields, query);
            }

            // Apply filters
            if (filters[contentType]) {
                Object.entries(filters[contentType]).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        searchQuery = searchQuery.in(key, value);
                    } else {
                        searchQuery = searchQuery.eq(key, value);
                    }
                });
            }

            const { data, error } = await searchQuery;

            if (error) {
                logger.error(`Search error for ${contentType}:`, error);
                return [];
            }

            // Process and rank results
            return data.map(item => ({
                ...item,
                contentType,
                relevance: this.calculateRelevance(item, query, index),
                weight: index.weight
            }));

        } catch (error) {
            logger.error(`Failed to search ${contentType}:`, error);
            return [];
        }
    }

    /**
     * Calculate search relevance score
     */
    calculateRelevance(item, query, index) {
        const queryWords = query.toLowerCase().split(' ');
        let relevance = 0;

        index.fields.forEach(field => {
            const fieldValue = String(item[field] || '').toLowerCase();
            queryWords.forEach(word => {
                const matches = (fieldValue.match(new RegExp(word, 'g')) || []).length;
                relevance += matches;
            });
        });

        return relevance * index.weight;
    }

    /**
     * Combine and rank results from multiple content types
     */
    combineAndRankResults(results, query) {
        const combined = results.flat();
        
        // Sort by relevance
        return combined.sort((a, b) => b.relevance - a.relevance);
    }

    /**
     * Sort results by specified criteria
     */
    sortResults(results, sortBy, sortOrder) {
        return results.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'relevance':
                    comparison = b.relevance - a.relevance;
                    break;
                case 'date':
                    comparison = new Date(b.created_at || 0) - new Date(a.created_at || 0);
                    break;
                case 'name':
                    comparison = (a.name || '').localeCompare(b.name || '');
                    break;
                case 'type':
                    comparison = a.contentType.localeCompare(b.contentType);
                    break;
                default:
                    comparison = b.relevance - a.relevance;
            }

            return sortOrder === 'desc' ? comparison : -comparison;
        });
    }

    /**
     * Apply pagination to results
     */
    paginateResults(results, page, limit) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const total = results.length;
        const hasMore = endIndex < total;

        return {
            results: results.slice(startIndex, endIndex),
            total,
            hasMore
        };
    }

    /**
     * Generate search suggestions based on query
     */
    async generateSearchSuggestions(query) {
        if (!query.trim()) {
            return [];
        }

        try {
            // Get popular searches that start with the query
            const { data: popularSearches } = await this.supabase
                .from('search_history')
                .select('query, count')
                .ilike('query', `${query}%`)
                .order('count', { ascending: false })
                .limit(5);

            // Get content type suggestions
            const contentTypeSuggestions = Object.keys(this.searchIndices)
                .filter(type => type.toLowerCase().includes(query.toLowerCase()))
                .map(type => `Search in ${type}`);

            return [
                ...popularSearches.map(item => item.query),
                ...contentTypeSuggestions
            ];

        } catch (error) {
            logger.error('Failed to generate search suggestions:', error);
            return [];
        }
    }

    /**
     * Add search to history
     */
    addToSearchHistory(query, options) {
        const searchKey = JSON.stringify({ query, options });
        const count = this.searchHistory.get(searchKey) || 0;
        this.searchHistory.set(searchKey, count + 1);

        // Store in database for analytics
        this.storeSearchHistory(query, options).catch(error => {
            logger.error('Failed to store search history:', error);
        });
    }

    /**
     * Store search history in database
     */
    async storeSearchHistory(query, options) {
        try {
            await this.supabase
                .from('search_history')
                .upsert({
                    query,
                    options: JSON.stringify(options),
                    timestamp: new Date().toISOString(),
                    count: 1
                }, {
                    onConflict: 'query',
                    count: 'count + 1'
                });
        } catch (error) {
            logger.error('Failed to store search history:', error);
        }
    }

    /**
     * Get search analytics
     */
    async getSearchAnalytics() {
        try {
            const { data: popularSearches } = await this.supabase
                .from('search_history')
                .select('query, count')
                .order('count', { ascending: false })
                .limit(10);

            const { data: recentSearches } = await this.supabase
                .from('search_history')
                .select('query, timestamp')
                .order('timestamp', { ascending: false })
                .limit(10);

            return {
                success: true,
                data: {
                    popularSearches,
                    recentSearches,
                    totalSearches: this.searchHistory.size
                }
            };

        } catch (error) {
            logger.error('Failed to get search analytics:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Index content for search
     */
    async indexContent(contentType, content) {
        if (!this.isInitialized) {
            return { success: false, error: 'Search service not initialized' };
        }

        try {
            const index = this.searchIndices.get(contentType);
            if (!index) {
                return { success: false, error: `Unknown content type: ${contentType}` };
            }

            // Prepare content for indexing
            const indexedContent = this.prepareContentForIndexing(content, index);

            // Store in search index
            const { error } = await this.supabase
                .from(`search_${contentType}`)
                .upsert(indexedContent);

            if (error) {
                throw error;
            }

            return { success: true };

        } catch (error) {
            logger.error(`Failed to index ${contentType} content:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Prepare content for indexing
     */
    prepareContentForIndexing(content, index) {
        const indexed = {
            id: content.id,
            created_at: content.created_at || new Date().toISOString(),
            updated_at: content.updated_at || new Date().toISOString()
        };

        // Add indexed fields
        index.fields.forEach(field => {
            if (content[field] !== undefined) {
                indexed[field] = content[field];
            }
        });

        return indexed;
    }

    /**
     * Remove content from search index
     */
    async removeFromIndex(contentType, contentId) {
        try {
            const { error } = await this.supabase
                .from(`search_${contentType}`)
                .delete()
                .eq('id', contentId);

            if (error) {
                throw error;
            }

            return { success: true };

        } catch (error) {
            logger.error(`Failed to remove ${contentType} from index:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get search service health status
     */
    getHealth() {
        return {
            initialized: this.isInitialized,
            indices: Array.from(this.searchIndices.keys()),
            searchHistorySize: this.searchHistory.size,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Cleanup search service
     */
    async cleanup() {
        this.searchHistory.clear();
        this.searchIndices.clear();
        this.isInitialized = false;
    }
}

module.exports = SearchService; 