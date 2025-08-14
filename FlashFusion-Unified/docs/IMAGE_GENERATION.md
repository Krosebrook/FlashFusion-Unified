# Image Generation API

A comprehensive Deno-based serverless function for AI image generation using the Runware API, with built-in rate limiting, content moderation, and user activity tracking.

## Features

- 🎨 **AI Image Generation** - Generate high-quality images using state-of-the-art models
- 🛡️ **Content Moderation** - Automatic filtering of inappropriate content
- ⚡ **Rate Limiting** - Per-user rate limiting (50 requests/hour)
- 📊 **Usage Analytics** - Track generation stats and costs
- 🔒 **Authentication** - JWT-based user authentication
- 🗄️ **Database Integration** - Full Supabase integration with RLS
- 🚀 **TypeScript Support** - Fully typed APIs and client libraries
- ⏱️ **Timeout Handling** - 30-second timeout with proper error handling
- 🔄 **Retry Logic** - Built-in retry mechanism for failed requests

## Quick Start

### 1. Environment Setup

Set the following environment variables in your Supabase project:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RUNWARE_API_KEY=your_runware_api_key
```

### 2. Database Setup

Run the SQL schema from `database/image-generation-schema.sql` in your Supabase SQL editor:

```sql
-- This creates all necessary tables with RLS policies
-- See the file for complete schema
```

### 3. Deploy Function

Deploy the Deno function to Supabase Edge Functions:

```bash
supabase functions deploy generate-image --project-ref your-project-ref
```

### 4. Client Integration

```typescript
import { ImageGenerationClient } from './types/imageGeneration';

const client = new ImageGenerationClient(
  'https://your-project.supabase.co',
  userAuthToken
);

const result = await client.generateImage({
  positivePrompt: 'A beautiful sunset over mountains',
  model: 'runware:100@1',
  width: 1024,
  height: 1024,
  steps: 4
});
```

## API Reference

### Generate Image Endpoint

**POST** `/functions/v1/generate-image`

#### Request Body

```typescript
interface ImageGenerationRequest {
  positivePrompt: string;        // Required: Description of desired image
  model?: string;                // Optional: Model to use (default: "runware:100@1")
  width?: number;                // Optional: Image width 256-2048 (default: 1024)
  height?: number;               // Optional: Image height 256-2048 (default: 1024)
  numberResults?: number;        // Optional: Number of images 1-4 (default: 1)
  negativePrompt?: string;       // Optional: What to avoid in the image
  steps?: number;                // Optional: Generation steps 1-50 (default: 4)
  cfgScale?: number;             // Optional: CFG scale 0.1-20 (default: 1)
}
```

#### Response

```typescript
interface ImageGenerationResponse {
  success: boolean;
  data?: {
    imageURL: string;            // Generated image URL
    imageUUID: string;           // Unique image identifier
    prompt: string;              // Original prompt
    seed: number;                // Random seed used
    NSFWContent: boolean;        // NSFW detection result
    cost: number;                // Generation cost
    model: string;               // Model used
    dimensions: {
      width: number;
      height: number;
    };
    parameters: {
      steps: number;
      cfgScale: number;
    };
  };
  metadata?: {
    generatedAt: string;         // Generation timestamp
    userId: string;              // User ID
    requestsRemaining: number;   // Remaining rate limit
  };
}
```

### Available Models

| Model ID | Description | Speed | Quality |
|----------|-------------|-------|---------|
| `runware:100@1` | Base Model | Fast | Good |
| `runware:101@1` | Enhanced Model | Medium | Better |
| `runware:500@1` | Premium Model | Slow | Best |

### Dimension Presets

```typescript
const PRESET_DIMENSIONS = {
  square: { width: 1024, height: 1024 },     // 1:1 ratio
  portrait: { width: 768, height: 1024 },    // 3:4 ratio
  landscape: { width: 1024, height: 768 },   // 4:3 ratio
  widescreen: { width: 1344, height: 768 },  // 16:9 ratio
};
```

### Quality Presets

```typescript
const QUALITY_PRESETS = {
  fast: { steps: 4, cfgScale: 1 },      // ~5-10 seconds
  balanced: { steps: 8, cfgScale: 2 },  // ~10-20 seconds
  quality: { steps: 16, cfgScale: 3 },  // ~20-40 seconds
  premium: { steps: 32, cfgScale: 4 },  // ~40-80 seconds
};
```

## React Integration

### Using the Hook

```typescript
import { useImageGeneration } from './hooks/useImageGeneration';

function ImageGenerator() {
  const {
    isGenerating,
    progress,
    error,
    result,
    generateImage,
    cancelGeneration,
  } = useImageGeneration({
    baseUrl: 'https://your-project.supabase.co',
    authToken: userToken,
    onProgress: (progress) => console.log(`Progress: ${progress}%`),
    onSuccess: (result) => console.log('Generated:', result),
    onError: (error) => console.error('Error:', error),
  });

  const handleGenerate = async () => {
    try {
      await generateImage({
        positivePrompt: 'A serene lake at dawn',
        model: 'runware:100@1',
        width: 1024,
        height: 1024,
      });
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? `Generating... ${progress}%` : 'Generate Image'}
      </button>
      
      {isGenerating && (
        <button onClick={cancelGeneration}>Cancel</button>
      )}
      
      {error && <div className="error">{error}</div>}
      
      {result?.data && (
        <img src={result.data.imageURL} alt={result.data.prompt} />
      )}
    </div>
  );
}
```

### Form Management

```typescript
import { useImageGenerationForm } from './hooks/useImageGeneration';

function ImageGeneratorForm() {
  const {
    formData,
    validationErrors,
    updateField,
    validateForm,
    resetForm,
    isValid
  } = useImageGenerationForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Generate image with formData
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={formData.positivePrompt}
        onChange={(e) => updateField('positivePrompt', e.target.value)}
        placeholder="Describe the image you want to generate..."
      />
      {validationErrors.positivePrompt && (
        <div className="error">{validationErrors.positivePrompt[0]}</div>
      )}
      
      <select
        value={formData.model}
        onChange={(e) => updateField('model', e.target.value)}
      >
        <option value="runware:100@1">Base Model (Fast)</option>
        <option value="runware:101@1">Enhanced Model</option>
        <option value="runware:500@1">Premium Model</option>
      </select>
      
      <button type="submit" disabled={!isValid}>
        Generate Image
      </button>
    </form>
  );
}
```

## Rate Limiting

- **Limit**: 50 requests per user per hour
- **Window**: Rolling 1-hour window
- **Headers**: Response includes rate limit headers
- **Exceeded**: Returns 429 status with reset time

```typescript
// Check rate limit before generating
const rateLimit = await client.getRateLimitInfo();
console.log(`Remaining: ${rateLimit.remaining}/${rateLimit.limit}`);
```

## Content Moderation

The system automatically filters inappropriate content using a comprehensive blocklist:

```typescript
const blockedTerms = [
  'nude', 'nsfw', 'explicit', 'pornographic', 'sexual',
  'naked', 'erotic', 'adult', 'xxx', 'porn',
  'violence', 'blood', 'gore', 'death', 'killing',
  'hate', 'racist', 'terrorism', 'drugs', 'illegal'
];
```

Violations are logged to the `content_violations` table for admin review.

## Analytics & Monitoring

### User Stats

```typescript
const stats = await client.getGenerationStats();
// Returns: total_images, images_today, images_this_week, total_cost, avg_generation_time
```

### Database Tables

- `api_rate_limits` - Rate limiting data
- `user_activity` - User generation history
- `content_violations` - Content policy violations
- `api_failures` - Failed API requests
- `generated_images` - Image metadata (optional)

### Monitoring Queries

```sql
-- Daily generation volume
SELECT DATE(created_at), COUNT(*) 
FROM user_activity 
WHERE activity_type = 'image_generated' 
GROUP BY DATE(created_at) 
ORDER BY DATE(created_at) DESC;

-- Top users by generation count
SELECT user_id, COUNT(*) as generations
FROM user_activity 
WHERE activity_type = 'image_generated'
GROUP BY user_id 
ORDER BY generations DESC 
LIMIT 10;

-- Content violations summary
SELECT violation_terms, COUNT(*) as count
FROM content_violations 
GROUP BY violation_terms 
ORDER BY count DESC;
```

## Error Handling

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `Invalid JSON` | Malformed request body |
| 400 | `Valid positivePrompt is required` | Missing or empty prompt |
| 400 | `Content policy violation` | Blocked content detected |
| 401 | `Unauthorized` | Invalid or missing auth token |
| 429 | `Rate limit exceeded` | Too many requests |
| 500 | `API key not configured` | Missing Runware API key |
| 500 | `Image generation failed` | Runware API error |
| 504 | `Request timeout` | Generation took too long |

### Retry Logic

```typescript
async function generateWithRetry(request: ImageGenerationRequest, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.generateImage(request);
    } catch (error) {
      if (error.status === 429) {
        // Rate limited - wait and retry
        const waitTime = error.retryAfter || 60;
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        continue;
      }
      
      if (error.status >= 500 && attempt < maxRetries) {
        // Server error - retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      
      throw error; // Don't retry client errors
    }
  }
}
```

## Security Considerations

- **Authentication**: All requests require valid JWT tokens
- **Rate Limiting**: Prevents abuse with per-user limits
- **Content Filtering**: Blocks inappropriate content generation
- **Input Validation**: Strict validation of all parameters
- **CORS**: Properly configured CORS headers
- **RLS**: Database access controlled by Row Level Security
- **Audit Logging**: All activities and violations logged

## Performance Optimization

- **Connection Pooling**: Efficient database connections
- **Timeout Handling**: 30-second timeout prevents hanging requests
- **Progress Updates**: Real-time generation progress feedback
- **Caching**: Client-side caching of generation results
- **Compression**: WEBP format for smaller file sizes

## Deployment

### Supabase Edge Functions

```bash
# Deploy to Supabase
supabase functions deploy generate-image

# Set environment variables
supabase secrets set RUNWARE_API_KEY=your_key
```

### Local Development

```bash
# Start local development server
cd functions
deno task dev

# Run tests
deno task test

# Type checking
deno task check
```

## Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Ensure `RUNWARE_API_KEY` is set in Supabase secrets

2. **"Rate limit exceeded"**
   - User has hit the 50 requests/hour limit
   - Check rate limit reset time

3. **"Content policy violation"**
   - Prompt contains blocked terms
   - Review and modify the prompt

4. **"Request timeout"**
   - Generation took longer than 30 seconds
   - Try reducing steps or image size

5. **Database connection errors**
   - Verify Supabase URL and service role key
   - Check RLS policies are correctly configured

### Debug Mode

Enable debug logging by setting log level:

```typescript
console.log('Debug mode enabled');
// Add detailed logging throughout the function
```

## Support

For issues or questions:
1. Check the error message and status code
2. Review the troubleshooting section
3. Check Supabase function logs
4. Verify environment variables are set correctly