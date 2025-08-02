const express = require('express');
const router = express.Router();
const SearchService = require('../../services/searchService');
const logger = require('../../utils/logger');

// Initialize search service
const searchService = new SearchService();

// Initialize search service on startup
(async () => {
    await searchService.initialize();
})();

/**
 * @route GET /api/search
 * @desc Perform unified search across all content types
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        const {
            q: query = '',
            types: contentTypes,
            filters,
            sortBy = 'relevance',
            sortOrder = 'desc',
            page = 1,
            limit = 20,
            includeMetadata = true
        } = req.query;

        // Parse filters if provided as JSON string
        let parsedFilters = {};
        if (filters) {
            try {
                parsedFilters = JSON.parse(filters);
            } catch (error) {
                logger.warn('Invalid filters format:', error);
            }
        }

        // Parse content types if provided
        let parsedContentTypes;
        if (contentTypes) {
            parsedContentTypes = contentTypes.split(',').map(type => type.trim());
        }

        const searchOptions = {
            contentTypes: parsedContentTypes,
            filters: parsedFilters,
            sortBy,
            sortOrder,
            page: parseInt(page),
            limit: parseInt(limit),
            includeMetadata: includeMetadata === 'true'
        };

        const result = await searchService.search(query, searchOptions);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: 'Search completed successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                message: 'Search failed'
            });
        }

    } catch (error) {
        logger.error('Search API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to perform search'
        });
    }
});

/**
 * @route POST /api/search
 * @desc Perform search with POST method (for complex queries)
 * @access Public
 */
router.post('/', async (req, res) => {
    try {
        const {
            query = '',
            contentTypes,
            filters = {},
            sortBy = 'relevance',
            sortOrder = 'desc',
            page = 1,
            limit = 20,
            includeMetadata = true
        } = req.body;

        const searchOptions = {
            contentTypes,
            filters,
            sortBy,
            sortOrder,
            page: parseInt(page),
            limit: parseInt(limit),
            includeMetadata
        };

        const result = await searchService.search(query, searchOptions);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: 'Search completed successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                message: 'Search failed'
            });
        }

    } catch (error) {
        logger.error('Search POST API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to perform search'
        });
    }
});

/**
 * @route GET /api/search/suggestions
 * @desc Get search suggestions based on query
 * @access Public
 */
router.get('/suggestions', async (req, res) => {
    try {
        const { q: query = '' } = req.query;

        if (!query.trim()) {
            return res.json({
                success: true,
                data: {
                    suggestions: [],
                    popularSearches: []
                }
            });
        }

        const suggestions = await searchService.generateSearchSuggestions(query);
        const analytics = await searchService.getSearchAnalytics();

        res.json({
            success: true,
            data: {
                suggestions,
                popularSearches: analytics.success ? analytics.data.popularSearches : []
            }
        });

    } catch (error) {
        logger.error('Search suggestions API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to get search suggestions'
        });
    }
});

/**
 * @route GET /api/search/analytics
 * @desc Get search analytics and insights
 * @access Public
 */
router.get('/analytics', async (req, res) => {
    try {
        const result = await searchService.getSearchAnalytics();

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: 'Search analytics retrieved successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                message: 'Failed to get search analytics'
            });
        }

    } catch (error) {
        logger.error('Search analytics API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to get search analytics'
        });
    }
});

/**
 * @route POST /api/search/index
 * @desc Index content for search
 * @access Public
 */
router.post('/index', async (req, res) => {
    try {
        const { contentType, content } = req.body;

        if (!contentType || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'contentType and content are required'
            });
        }

        const result = await searchService.indexContent(contentType, content);

        if (result.success) {
            res.json({
                success: true,
                message: 'Content indexed successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                message: 'Failed to index content'
            });
        }

    } catch (error) {
        logger.error('Search index API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to index content'
        });
    }
});

/**
 * @route DELETE /api/search/index/:contentType/:contentId
 * @desc Remove content from search index
 * @access Public
 */
router.delete('/index/:contentType/:contentId', async (req, res) => {
    try {
        const { contentType, contentId } = req.params;

        const result = await searchService.removeFromIndex(contentType, contentId);

        if (result.success) {
            res.json({
                success: true,
                message: 'Content removed from index successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                message: 'Failed to remove content from index'
            });
        }

    } catch (error) {
        logger.error('Search remove index API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to remove content from index'
        });
    }
});

/**
 * @route GET /api/search/health
 * @desc Get search service health status
 * @access Public
 */
router.get('/health', async (req, res) => {
    try {
        const health = searchService.getHealth();
        
        res.json({
            success: true,
            data: health,
            message: 'Search service health check completed'
        });

    } catch (error) {
        logger.error('Search health API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to get search service health'
        });
    }
});

/**
 * @route GET /api/search/content-types
 * @desc Get available content types for search
 * @access Public
 */
router.get('/content-types', async (req, res) => {
    try {
        const health = searchService.getHealth();
        
        res.json({
            success: true,
            data: {
                contentTypes: health.indices,
                totalTypes: health.indices.length
            },
            message: 'Content types retrieved successfully'
        });

    } catch (error) {
        logger.error('Search content types API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to get content types'
        });
    }
});

/**
 * @route POST /api/search/bulk-index
 * @desc Index multiple content items at once
 * @access Public
 */
router.post('/bulk-index', async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid items format',
                message: 'items must be a non-empty array'
            });
        }

        const results = [];
        const errors = [];

        for (const item of items) {
            const { contentType, content } = item;
            
            if (!contentType || !content) {
                errors.push({
                    item,
                    error: 'Missing contentType or content'
                });
                continue;
            }

            const result = await searchService.indexContent(contentType, content);
            
            if (result.success) {
                results.push({
                    contentType,
                    contentId: content.id,
                    status: 'success'
                });
            } else {
                errors.push({
                    contentType,
                    contentId: content.id,
                    error: result.error
                });
            }
        }

        res.json({
            success: true,
            data: {
                total: items.length,
                successful: results.length,
                failed: errors.length,
                results,
                errors
            },
            message: `Bulk indexing completed. ${results.length} successful, ${errors.length} failed.`
        });

    } catch (error) {
        logger.error('Search bulk index API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to perform bulk indexing'
        });
    }
});

module.exports = router; 