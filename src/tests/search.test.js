const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const SearchService = require('../services/searchService');
const request = require('supertest');
const app = require('../index'); // Adjust path as needed

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  textSearch: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis()
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

describe('SearchService', () => {
  let searchService;

  beforeEach(() => {
    searchService = new SearchService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (searchService) {
      searchService.cleanup();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await searchService.initialize();
      expect(result.success).toBe(true);
      expect(searchService.isInitialized).toBe(true);
    });

    it('should initialize search indices', async () => {
      await searchService.initialize();
      expect(searchService.searchIndices.size).toBeGreaterThan(0);
      expect(searchService.searchIndices.has('workflows')).toBe(true);
      expect(searchService.searchIndices.has('agents')).toBe(true);
    });
  });

  describe('Search Operations', () => {
    beforeEach(async () => {
      await searchService.initialize();
    });

    it('should perform basic search', async () => {
      const mockResults = [
        {
          id: '1',
          name: 'Test Workflow',
          description: 'A test workflow',
          type: 'test',
          status: 'active'
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          textSearch: jest.fn().mockResolvedValue({
            data: mockResults,
            error: null
          })
        })
      });

      const result = await searchService.search('test');
      
      expect(result.success).toBe(true);
      expect(result.data.results).toBeDefined();
      expect(result.data.total).toBeGreaterThan(0);
    });

    it('should handle search with filters', async () => {
      const mockResults = [
        {
          id: '1',
          name: 'Filtered Workflow',
          type: 'commerce',
          status: 'active'
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          textSearch: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockResults,
              error: null
            })
          })
        })
      });

      const filters = {
        workflows: {
          status: ['active'],
          type: ['commerce']
        }
      };

      const result = await searchService.search('workflow', { filters });
      
      expect(result.success).toBe(true);
      expect(result.data.filters).toEqual(filters);
    });

    it('should handle empty search query', async () => {
      const result = await searchService.search('');
      
      expect(result.success).toBe(true);
      expect(result.data.results).toEqual([]);
    });

    it('should handle search errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          textSearch: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await searchService.search('test');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Content Indexing', () => {
    beforeEach(async () => {
      await searchService.initialize();
    });

    it('should index content successfully', async () => {
      const content = {
        id: 'test-id',
        name: 'Test Content',
        description: 'Test description',
        type: 'test',
        status: 'active'
      };

      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({
          error: null
        })
      });

      const result = await searchService.indexContent('workflows', content);
      
      expect(result.success).toBe(true);
    });

    it('should handle indexing errors', async () => {
      const content = {
        id: 'test-id',
        name: 'Test Content'
      };

      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({
          error: new Error('Indexing failed')
        })
      });

      const result = await searchService.indexContent('workflows', content);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject unknown content types', async () => {
      const content = {
        id: 'test-id',
        name: 'Test Content'
      };

      const result = await searchService.indexContent('unknown_type', content);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown content type');
    });
  });

  describe('Search Suggestions', () => {
    beforeEach(async () => {
      await searchService.initialize();
    });

    it('should generate search suggestions', async () => {
      const mockSuggestions = [
        { query: 'workflow automation', count: 10 },
        { query: 'workflow templates', count: 5 }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockSuggestions,
                error: null
              })
            })
          })
        })
      });

      const suggestions = await searchService.generateSearchSuggestions('workflow');
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should handle empty query for suggestions', async () => {
      const suggestions = await searchService.generateSearchSuggestions('');
      
      expect(suggestions).toEqual([]);
    });
  });

  describe('Search Analytics', () => {
    beforeEach(async () => {
      await searchService.initialize();
    });

    it('should get search analytics', async () => {
      const mockAnalytics = {
        popularSearches: [
          { query: 'workflow', count: 15 },
          { query: 'agent', count: 8 }
        ],
        recentSearches: [
          { query: 'test', timestamp: new Date().toISOString() }
        ]
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockAnalytics.popularSearches,
              error: null
            })
          })
        })
      });

      const result = await searchService.getSearchAnalytics();
      
      expect(result.success).toBe(true);
      expect(result.data.popularSearches).toBeDefined();
      expect(result.data.recentSearches).toBeDefined();
    });
  });

  describe('Health Check', () => {
    beforeEach(async () => {
      await searchService.initialize();
    });

    it('should return health status', () => {
      const health = searchService.getHealth();
      
      expect(health.initialized).toBe(true);
      expect(health.indices).toBeDefined();
      expect(health.searchHistorySize).toBeDefined();
      expect(health.timestamp).toBeDefined();
    });
  });
});

describe('Search API Routes', () => {
  describe('GET /api/search', () => {
    it('should return search results', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ q: 'workflow' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.results).toBeDefined();
    });

    it('should handle search with filters', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ 
          q: 'workflow',
          types: 'workflows,agents',
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(10);
    });

    it('should handle invalid filters gracefully', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ 
          q: 'workflow',
          filters: 'invalid-json'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/search', () => {
    it('should perform search with POST method', async () => {
      const searchData = {
        query: 'workflow automation',
        contentTypes: ['workflows'],
        filters: {
          workflows: {
            status: ['active']
          }
        },
        sortBy: 'relevance',
        sortOrder: 'desc',
        page: 1,
        limit: 20
      };

      const response = await request(app)
        .post('/api/search')
        .send(searchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.query).toBe(searchData.query);
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('should return search suggestions', async () => {
      const response = await request(app)
        .get('/api/search/suggestions')
        .query({ q: 'workflow' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toBeDefined();
      expect(response.body.data.popularSearches).toBeDefined();
    });

    it('should handle empty query', async () => {
      const response = await request(app)
        .get('/api/search/suggestions')
        .query({ q: '' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toEqual([]);
    });
  });

  describe('GET /api/search/analytics', () => {
    it('should return search analytics', async () => {
      const response = await request(app)
        .get('/api/search/analytics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /api/search/index', () => {
    it('should index content successfully', async () => {
      const contentData = {
        contentType: 'workflows',
        content: {
          id: 'test-id',
          name: 'Test Workflow',
          description: 'Test description',
          type: 'test',
          status: 'active'
        }
      };

      const response = await request(app)
        .post('/api/search/index')
        .send(contentData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/search/index')
        .send({ contentType: 'workflows' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('DELETE /api/search/index/:contentType/:contentId', () => {
    it('should remove content from index', async () => {
      const response = await request(app)
        .delete('/api/search/index/workflows/test-id')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/search/health', () => {
    it('should return search service health', async () => {
      const response = await request(app)
        .get('/api/search/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/search/content-types', () => {
    it('should return available content types', async () => {
      const response = await request(app)
        .get('/api/search/content-types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contentTypes).toBeDefined();
      expect(response.body.data.totalTypes).toBeDefined();
    });
  });

  describe('POST /api/search/bulk-index', () => {
    it('should bulk index content', async () => {
      const bulkData = {
        items: [
          {
            contentType: 'workflows',
            content: {
              id: 'test-1',
              name: 'Test Workflow 1'
            }
          },
          {
            contentType: 'agents',
            content: {
              id: 'test-2',
              name: 'Test Agent 1'
            }
          }
        ]
      };

      const response = await request(app)
        .post('/api/search/bulk-index')
        .send(bulkData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.successful).toBe(2);
    });

    it('should handle invalid bulk data', async () => {
      const response = await request(app)
        .post('/api/search/bulk-index')
        .send({ items: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid items format');
    });
  });
});

describe('Search Utility Functions', () => {
  describe('Relevance Calculation', () => {
    it('should calculate relevance scores correctly', () => {
      const searchService = new SearchService();
      
      const item = {
        name: 'Test Workflow',
        description: 'A test workflow for automation',
        type: 'workflow',
        status: 'active'
      };

      const index = {
        fields: ['name', 'description', 'type', 'status'],
        weight: 1.0
      };

      const relevance = searchService.calculateRelevance(item, 'test workflow', index);
      
      expect(relevance).toBeGreaterThan(0);
      expect(typeof relevance).toBe('number');
    });

    it('should handle empty query', () => {
      const searchService = new SearchService();
      
      const item = {
        name: 'Test Workflow',
        description: 'A test workflow'
      };

      const index = {
        fields: ['name', 'description'],
        weight: 1.0
      };

      const relevance = searchService.calculateRelevance(item, '', index);
      
      expect(relevance).toBe(0);
    });
  });

  describe('Result Sorting', () => {
    it('should sort results by relevance', () => {
      const searchService = new SearchService();
      
      const results = [
        { relevance: 0.5, name: 'B' },
        { relevance: 0.9, name: 'A' },
        { relevance: 0.3, name: 'C' }
      ];

      const sorted = searchService.sortResults(results, 'relevance', 'desc');
      
      expect(sorted[0].relevance).toBe(0.9);
      expect(sorted[2].relevance).toBe(0.3);
    });

    it('should sort results by name', () => {
      const searchService = new SearchService();
      
      const results = [
        { name: 'Zebra', relevance: 0.5 },
        { name: 'Alpha', relevance: 0.9 },
        { name: 'Beta', relevance: 0.3 }
      ];

      const sorted = searchService.sortResults(results, 'name', 'asc');
      
      expect(sorted[0].name).toBe('Alpha');
      expect(sorted[2].name).toBe('Zebra');
    });
  });

  describe('Pagination', () => {
    it('should paginate results correctly', () => {
      const searchService = new SearchService();
      
      const results = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `Item ${i}`
      }));

      const paginated = searchService.paginateResults(results, 2, 10);
      
      expect(paginated.results.length).toBe(10);
      expect(paginated.total).toBe(25);
      expect(paginated.hasMore).toBe(true);
      expect(paginated.results[0].id).toBe(10);
    });

    it('should handle last page correctly', () => {
      const searchService = new SearchService();
      
      const results = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `Item ${i}`
      }));

      const paginated = searchService.paginateResults(results, 3, 10);
      
      expect(paginated.results.length).toBe(5);
      expect(paginated.hasMore).toBe(false);
    });
  });
});

describe('Search Integration Tests', () => {
  it('should perform end-to-end search workflow', async () => {
    // 1. Initialize search service
    const searchService = new SearchService();
    await searchService.initialize();

    // 2. Index test content
    const testContent = {
      id: 'integration-test',
      name: 'Integration Test Workflow',
      description: 'A workflow for testing search integration',
      type: 'test',
      status: 'active',
      tags: ['test', 'integration']
    };

    const indexResult = await searchService.indexContent('workflows', testContent);
    expect(indexResult.success).toBe(true);

    // 3. Perform search
    const searchResult = await searchService.search('integration test');
    expect(searchResult.success).toBe(true);
    expect(searchResult.data.results.length).toBeGreaterThan(0);

    // 4. Get suggestions
    const suggestions = await searchService.generateSearchSuggestions('integration');
    expect(suggestions).toBeDefined();

    // 5. Get analytics
    const analytics = await searchService.getSearchAnalytics();
    expect(analytics.success).toBe(true);

    // 6. Cleanup
    await searchService.removeFromIndex('workflows', 'integration-test');
    searchService.cleanup();
  });
});

// Performance tests
describe('Search Performance', () => {
  it('should complete search within reasonable time', async () => {
    const searchService = new SearchService();
    await searchService.initialize();

    const startTime = Date.now();
    await searchService.search('test');
    const endTime = Date.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(1000); // Should complete within 1 second

    searchService.cleanup();
  });

  it('should handle large result sets efficiently', async () => {
    const searchService = new SearchService();
    await searchService.initialize();

    // Mock large result set
    const largeResults = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      relevance: Math.random()
    }));

    const startTime = Date.now();
    const paginated = searchService.paginateResults(largeResults, 1, 20);
    const endTime = Date.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100); // Should paginate within 100ms
    expect(paginated.results.length).toBe(20);

    searchService.cleanup();
  });
});

// Error handling tests
describe('Search Error Handling', () => {
  it('should handle database connection errors gracefully', async () => {
    const searchService = new SearchService();
    
    // Mock database error
    mockSupabase.from.mockRejectedValue(new Error('Connection failed'));

    const result = await searchService.search('test');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle malformed search queries', async () => {
    const searchService = new SearchService();
    await searchService.initialize();

    // Test with various malformed queries
    const malformedQueries = [
      null,
      undefined,
      {},
      [],
      '   ', // Only whitespace
      'a'.repeat(10000) // Very long query
    ];

    for (const query of malformedQueries) {
      const result = await searchService.search(query);
      expect(result.success).toBe(true); // Should handle gracefully
    }

    searchService.cleanup();
  });
}); 