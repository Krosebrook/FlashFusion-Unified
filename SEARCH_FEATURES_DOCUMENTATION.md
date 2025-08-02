# 🔍 FlashFusion Search Features Documentation

## Overview

FlashFusion's comprehensive search system provides unified search capabilities across all platform content including workflows, agents, projects, integrations, analytics, and user-generated content. The system features advanced filtering, real-time suggestions, search analytics, and intelligent ranking.

## 🏗️ Architecture

### Core Components

1. **Search Service** (`src/services/searchService.js`)
   - Unified search engine
   - Multi-index support
   - Relevance scoring
   - Search history tracking

2. **Search API** (`src/api/routes/search.js`)
   - RESTful search endpoints
   - Advanced filtering
   - Pagination support
   - Analytics endpoints

3. **Frontend Components**
   - `GlobalSearch.tsx` - Global search bar with autocomplete
   - `SearchResultsPage.tsx` - Full search results page
   - `SearchAnalytics.tsx` - Search analytics dashboard

4. **Database Schema** (`search-schema.sql`)
   - Search indices for each content type
   - Search history and analytics tables
   - Full-text search with PostgreSQL

## 🚀 Quick Start

### 1. Database Setup

```sql
-- Run the search schema
\i search-schema.sql
```

### 2. Initialize Search Service

```javascript
const SearchService = require('./src/services/searchService');
const searchService = new SearchService();

// Initialize the service
await searchService.initialize();
```

### 3. Add Search to Your App

```jsx
import GlobalSearch from './components/GlobalSearch';

function App() {
  const handleSearchResult = (result) => {
    console.log('Selected result:', result);
    // Navigate to the result or show details
  };

  return (
    <div>
      <GlobalSearch onResultSelect={handleSearchResult} />
      {/* Your app content */}
    </div>
  );
}
```

## 📊 Search Features

### 1. Global Search Bar

The `GlobalSearch` component provides:

- **Real-time search** with debounced input
- **Autocomplete suggestions** from popular searches
- **Recent searches** history
- **Content type filtering**
- **Keyboard navigation** (arrow keys, enter, escape)
- **Search suggestions** with relevance scoring

```jsx
<GlobalSearch
  onResultSelect={(result) => handleResultSelect(result)}
  placeholder="Search workflows, agents, projects..."
  className="max-w-2xl"
/>
```

### 2. Search Results Page

The `SearchResultsPage` component provides:

- **Advanced filtering** by content type, date range, status, tags
- **Multiple sorting options** (relevance, date, name)
- **Pagination** with configurable results per page
- **Search analytics** integration
- **Responsive design** with sidebar filters

```jsx
<SearchResultsPage
  initialQuery="workflow automation"
  onResultSelect={(result) => handleResultSelect(result)}
/>
```

### 3. Search Analytics Dashboard

The `SearchAnalytics` component provides:

- **Key metrics** (total searches, unique queries, success rate)
- **Popular searches** with usage counts
- **Recent search activity**
- **Content type distribution**
- **Search trends** over time
- **Performance insights**

```jsx
<SearchAnalytics className="p-6" />
```

## 🔧 API Reference

### Search Endpoints

#### GET `/api/search`
Perform unified search across all content types.

**Query Parameters:**
- `q` - Search query
- `types` - Content types to search (comma-separated)
- `filters` - JSON string of filters
- `sortBy` - Sort field (relevance, date, name)
- `sortOrder` - Sort direction (asc, desc)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Example:**
```bash
GET /api/search?q=workflow&types=workflows,agents&page=1&limit=10
```

#### POST `/api/search`
Perform search with complex filters in request body.

**Request Body:**
```json
{
  "query": "workflow automation",
  "contentTypes": ["workflows", "agents"],
  "filters": {
    "workflows": {
      "status": ["active"],
      "type": ["commerce"]
    }
  },
  "sortBy": "relevance",
  "sortOrder": "desc",
  "page": 1,
  "limit": 20
}
```

#### GET `/api/search/suggestions`
Get search suggestions based on query.

**Query Parameters:**
- `q` - Search query

**Example:**
```bash
GET /api/search/suggestions?q=workflow
```

#### GET `/api/search/analytics`
Get search analytics and insights.

**Query Parameters:**
- `timeRange` - Time range (7d, 30d, 90d)

**Example:**
```bash
GET /api/search/analytics?timeRange=30d
```

#### POST `/api/search/index`
Index content for search.

**Request Body:**
```json
{
  "contentType": "workflows",
  "content": {
    "id": "uuid",
    "name": "E-commerce Automation",
    "description": "Automated product research workflow",
    "type": "commerce",
    "status": "active",
    "tags": ["ecommerce", "automation"]
  }
}
```

### Response Format

All search endpoints return a consistent response format:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "contentType": "workflows",
        "name": "E-commerce Automation",
        "description": "Automated product research workflow",
        "relevance": 0.95,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "metadata": {}
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "hasMore": true,
    "query": "workflow",
    "filters": {},
    "suggestions": ["workflow automation", "workflow templates"]
  },
  "message": "Search completed successfully"
}
```

## 🗄️ Database Schema

### Core Tables

#### `search_history`
Tracks all search queries for analytics and suggestions.

```sql
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    options JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    count INTEGER DEFAULT 1,
    user_id UUID,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Search Indices
Separate tables for each content type with full-text search:

- `search_workflows` - Workflow content
- `search_agents` - Agent content
- `search_projects` - Project content
- `search_integrations` - Integration content
- `search_analytics` - Analytics content
- `search_content` - General content

Each table includes:
- Full-text search vector (tsvector)
- GIN indexes for fast searching
- Metadata fields for filtering

#### `search_analytics_aggregated`
Daily aggregated search metrics.

```sql
CREATE TABLE search_analytics_aggregated (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_searches INTEGER DEFAULT 0,
    unique_queries INTEGER DEFAULT 0,
    average_search_time DECIMAL(5,2),
    search_success_rate DECIMAL(5,2),
    content_type_distribution JSONB,
    popular_queries JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);
```

## 🎯 Content Indexing

### Automatic Indexing

Content is automatically indexed when created or updated:

```javascript
// Index a new workflow
await searchService.indexContent('workflows', {
  id: workflow.id,
  name: workflow.name,
  description: workflow.description,
  type: workflow.type,
  status: workflow.status,
  tags: workflow.tags,
  configuration: workflow.configuration
});
```

### Bulk Indexing

Index multiple items at once:

```javascript
const items = [
  {
    contentType: 'workflows',
    content: workflow1
  },
  {
    contentType: 'agents',
    content: agent1
  }
];

await fetch('/api/search/bulk-index', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items })
});
```

### Manual Indexing

Index content manually when needed:

```javascript
// Index existing content
const result = await searchService.indexContent('workflows', workflowData);
if (result.success) {
  console.log('Content indexed successfully');
}
```

## 🔍 Search Configuration

### Search Indices Configuration

Configure search indices in `searchService.js`:

```javascript
this.searchIndices.set('workflows', {
  fields: ['name', 'description', 'type', 'status', 'tags', 'configuration'],
  weight: 1.0  // Higher weight = higher relevance
});

this.searchIndices.set('agents', {
  fields: ['name', 'role', 'capabilities', 'description', 'performance'],
  weight: 0.9
});
```

### Relevance Scoring

The system uses weighted relevance scoring:

1. **Field weights** - Different fields have different importance
2. **Content type weights** - Different content types have different base relevance
3. **Text matching** - Exact matches score higher than partial matches
4. **Recency** - Newer content gets slight relevance boost

### Search Filters

Available filter types:

- **Content Types** - Filter by specific content types
- **Date Range** - Filter by creation/update date
- **Status** - Filter by content status
- **Tags** - Filter by content tags
- **Custom Fields** - Filter by any indexed field

## 📈 Analytics & Insights

### Search Analytics

The system tracks comprehensive search analytics:

- **Total searches** and unique queries
- **Search success rate** and average response time
- **Popular searches** and trending queries
- **Content type distribution**
- **User search patterns**

### Performance Metrics

Track search performance:

- **Response times** for optimization
- **Cache hit rates** for efficiency
- **Error rates** for reliability
- **User engagement** metrics

### Custom Analytics

Create custom analytics queries:

```sql
-- Get search trends by content type
SELECT 
    DATE(timestamp) as search_date,
    COUNT(*) as total_searches,
    COUNT(DISTINCT query) as unique_queries
FROM search_history
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY search_date;
```

## 🛠️ Integration Examples

### 1. Add Search to Navigation

```jsx
import GlobalSearch from './components/GlobalSearch';

function Navigation() {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1 max-w-2xl">
            <GlobalSearch
              onResultSelect={(result) => {
                // Navigate to result
                router.push(`/${result.contentType}/${result.id}`);
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### 2. Search Results Page

```jsx
import SearchResultsPage from './components/SearchResultsPage';

function SearchPage() {
  const router = useRouter();
  const { q } = router.query;

  return (
    <SearchResultsPage
      initialQuery={q as string}
      onResultSelect={(result) => {
        router.push(`/${result.contentType}/${result.id}`);
      }}
    />
  );
}
```

### 3. Search Analytics Dashboard

```jsx
import SearchAnalytics from './components/SearchAnalytics';

function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Search Analytics</h1>
      <SearchAnalytics />
    </div>
  );
}
```

### 4. Content Indexing Integration

```javascript
// In your content creation/update handlers
async function createWorkflow(workflowData) {
  // Create workflow
  const workflow = await workflowService.create(workflowData);
  
  // Index for search
  await searchService.indexContent('workflows', {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    type: workflow.type,
    status: workflow.status,
    tags: workflow.tags,
    configuration: workflow.configuration
  });
  
  return workflow;
}
```

## 🔧 Advanced Configuration

### Custom Search Weights

Configure custom search weights for different content types:

```javascript
// In searchService.js
this.searchIndices.set('workflows', {
  fields: ['name', 'description', 'type', 'status', 'tags', 'configuration'],
  weight: 1.0  // High priority
});

this.searchIndices.set('content', {
  fields: ['title', 'content', 'type', 'tags', 'metadata'],
  weight: 0.5  // Lower priority
});
```

### Custom Filters

Add custom filter logic:

```javascript
// In search API route
const customFilters = {
  workflows: {
    status: ['active', 'draft'],
    type: ['commerce', 'marketing']
  },
  agents: {
    role: ['researcher', 'creator']
  }
};

const searchOptions = {
  ...defaultOptions,
  filters: { ...defaultOptions.filters, ...customFilters }
};
```

### Search Suggestions

Configure AI-powered search suggestions:

```javascript
// Add custom suggestions
await searchService.addSuggestion({
  query: 'workflow',
  suggestion: 'workflow automation',
  type: 'ai_generated',
  relevance_score: 0.95
});
```

## 🚀 Performance Optimization

### Database Optimization

1. **Use GIN indexes** for full-text search
2. **Partition large tables** by date
3. **Regular maintenance** with VACUUM and ANALYZE
4. **Connection pooling** for high concurrency

### Caching Strategy

1. **Redis caching** for popular searches
2. **CDN caching** for static search results
3. **Browser caching** for search suggestions
4. **Application-level caching** for analytics

### Search Optimization

1. **Debounced search** to reduce API calls
2. **Pagination** to limit result sets
3. **Lazy loading** for large result sets
4. **Search result caching** for repeated queries

## 🔒 Security Considerations

### Input Validation

- **Sanitize search queries** to prevent injection
- **Validate filter parameters** before database queries
- **Rate limiting** on search endpoints
- **Input length limits** to prevent abuse

### Access Control

- **User-based filtering** for sensitive content
- **Role-based search** permissions
- **Audit logging** for search activity
- **Data privacy** compliance

### Performance Security

- **Query timeout** limits
- **Result size limits** to prevent DoS
- **Database connection limits**
- **Resource monitoring** and alerts

## 🧪 Testing

### Unit Tests

```javascript
// Test search service
describe('SearchService', () => {
  it('should perform search across content types', async () => {
    const result = await searchService.search('workflow');
    expect(result.success).toBe(true);
    expect(result.data.results).toBeDefined();
  });
});
```

### Integration Tests

```javascript
// Test search API
describe('Search API', () => {
  it('should return search results', async () => {
    const response = await request(app)
      .get('/api/search')
      .query({ q: 'workflow' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### Performance Tests

```javascript
// Test search performance
describe('Search Performance', () => {
  it('should complete search within 500ms', async () => {
    const start = Date.now();
    await searchService.search('workflow');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(500);
  });
});
```

## 📚 Best Practices

### Search UX

1. **Provide clear feedback** during search
2. **Show search suggestions** to guide users
3. **Highlight search terms** in results
4. **Offer advanced filters** for power users
5. **Maintain search history** for convenience

### Performance

1. **Debounce search input** to reduce API calls
2. **Use pagination** for large result sets
3. **Cache popular searches** and results
4. **Optimize database queries** with proper indexes
5. **Monitor search performance** metrics

### Content Management

1. **Index content immediately** when created/updated
2. **Remove content from index** when deleted
3. **Update search metadata** when content changes
4. **Maintain content quality** for better search results
5. **Use descriptive tags** and metadata

### Analytics

1. **Track search patterns** to improve relevance
2. **Monitor search performance** for optimization
3. **Analyze user behavior** to enhance UX
4. **Generate insights** from search data
5. **A/B test search improvements**

## 🔄 Maintenance

### Regular Tasks

1. **Clean old search data** (90 days retention)
2. **Update search suggestions** based on usage
3. **Optimize database indexes** for performance
4. **Monitor search analytics** for trends
5. **Update search weights** based on user feedback

### Monitoring

1. **Search response times** should be < 500ms
2. **Search success rate** should be > 95%
3. **Database query performance** should be monitored
4. **User search satisfaction** should be tracked
5. **System resource usage** should be monitored

## 🆘 Troubleshooting

### Common Issues

1. **Slow search performance**
   - Check database indexes
   - Monitor query execution plans
   - Consider caching strategies

2. **Missing search results**
   - Verify content indexing
   - Check search permissions
   - Validate search filters

3. **Search suggestions not working**
   - Check suggestion data
   - Verify suggestion relevance scores
   - Monitor suggestion generation

4. **High memory usage**
   - Optimize search queries
   - Implement result pagination
   - Consider search result caching

### Debug Tools

1. **Search query logging** for debugging
2. **Performance monitoring** dashboards
3. **Database query analysis** tools
4. **Search analytics** for insights
5. **Error tracking** and alerting

## 📞 Support

For questions or issues with the search system:

1. **Check the logs** for error messages
2. **Review search analytics** for patterns
3. **Test with sample data** to isolate issues
4. **Consult the API documentation** for endpoint details
5. **Contact the development team** for complex issues

---

**FlashFusion Search System** - Comprehensive search capabilities for the AI-powered business automation platform. 