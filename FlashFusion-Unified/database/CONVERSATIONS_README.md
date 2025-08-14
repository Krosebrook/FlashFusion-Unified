# FlashFusion Conversations System

This document describes the conversation/messaging system for FlashFusion, including database schema, API services, and React components.

## Database Schema

### Tables

#### `conversations`
Stores message threads/conversations.

```sql
CREATE TABLE public.conversations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    summary TEXT
);
```

#### `conversation_participants`
Tracks users participating in conversations.

```sql
CREATE TABLE public.conversation_participants (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(conversation_id, user_id)
);
```

### Security Features

- **Row Level Security (RLS)** enabled on both tables
- Users can only see conversations they participate in
- Users can only modify conversations they created
- Automatic creator participation when creating conversations
- Secure indexes for performance optimization

### Triggers & Functions

1. **Auto-update timestamps**: `conversations.updated_at` is automatically updated
2. **Auto-add creator**: Conversation creators are automatically added as participants
3. **Security functions**: All functions use secure `search_path` settings

## Frontend Implementation

### Service Layer (`conversationService.ts`)

Provides complete CRUD operations:
- Create, read, update, delete conversations
- Manage participants (add, remove, join, leave)
- Mark conversations as read
- Real-time subscriptions

### React Hooks (`useConversations.ts`)

Custom hooks for state management:
- `useConversations()` - Manage all user conversations
- `useConversation(id)` - Manage specific conversation
- `useConversationSubscription()` - Real-time updates

### UI Components

- **ConversationsPage**: Main conversation management interface
- **Real-time updates**: Live connection status and automatic updates
- **Search & filtering**: Find conversations by title or summary
- **CRUD operations**: Create, update, delete with proper loading states

## Setup Instructions

### 1. Database Setup

Run the SQL migration:
```bash
psql -h your-db-host -d your-database -f database/conversations-schema.sql
```

### 2. Environment Variables

Add to your `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Navigation

The conversations page is accessible at `/conversations` and included in the main sidebar navigation.

## API Usage Examples

### Create a Conversation
```typescript
import { conversationService } from '@/services/conversationService';

const conversation = await conversationService.createConversation({
  title: "Project Planning",
  summary: "Discussion about Q1 project goals",
  participant_ids: ["user-id-1", "user-id-2"]
});
```

### Join a Conversation
```typescript
await conversationService.joinConversation("conversation-id");
```

### Real-time Updates
```typescript
import { useConversationSubscription } from '@/hooks/useConversations';

function MyComponent() {
  const { isConnected } = useConversationSubscription();
  // Component automatically receives real-time updates
}
```

## Security Considerations

1. **Row Level Security**: All database access is secured through RLS policies
2. **User Authentication**: All operations require valid authentication
3. **Participant Validation**: Users can only access conversations they're part of
4. **Secure Functions**: Database functions use restricted search paths

## Performance Features

- **Optimized Queries**: Indexed fields for fast lookups
- **React Query**: Automatic caching and background updates
- **Real-time Subscriptions**: Efficient WebSocket connections
- **Pagination Ready**: Schema supports future pagination implementation

## Future Enhancements

1. **Message System**: Add messages table linked to conversations
2. **File Attachments**: Support for file sharing in conversations
3. **Typing Indicators**: Real-time typing status
4. **Push Notifications**: Browser and mobile notifications
5. **Conversation Types**: Support for different conversation types (direct, group, channel)

## Troubleshooting

### Common Issues

1. **RLS Policies**: Ensure user is authenticated and policies are correctly applied
2. **Subscription Errors**: Check Supabase connection and real-time enabled
3. **Permission Issues**: Verify user has proper access to conversations

### Debug Commands

```typescript
// Check current user
const { data: { user } } = await supabase.auth.getUser();

// Test basic query
const { data, error } = await supabase
  .from('conversations')
  .select('*')
  .limit(1);
```

## Dependencies

- `@supabase/supabase-js`: Database client
- `@tanstack/react-query`: State management
- `react-router-dom`: Navigation
- `lucide-react`: Icons
- Custom UI components (shadcn/ui)