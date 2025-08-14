# FlashFusion Notion Integration Setup

## Overview
FlashFusion now includes comprehensive Notion integration, allowing you to connect your AI agents with Notion databases, pages, and workspaces for enhanced productivity workflows.

## Quick Setup

### 1. Create a Notion Integration
1. Go to [Notion Integrations](https://www.notion.com/my-integrations)
2. Click "**+ New integration**"
3. Fill in the details:
   - **Name**: `FlashFusion AI`
   - **Logo**: Upload your logo (optional)
   - **Associated workspace**: Select your workspace
4. Under **Content Capabilities**, check:
   - ✅ Read content
   - ✅ Update content  
   - ✅ Insert content
5. Click **Submit**

### 2. Get Your Integration Token
1. After creating the integration, you'll see your **Internal Integration Token**
2. Click **Show** and copy the token (starts with `secret_`)
3. Keep this token secure - never commit it to version control

### 3. Configure FlashFusion
Add your Notion token to your environment variables:

**Option A: .env file (recommended)**
```env
NOTION_TOKEN=secret_your_notion_token_here
```

**Option B: System environment variable**
```bash
export NOTION_TOKEN=secret_your_notion_token_here
```

### 4. Connect Integration to Your Notion Pages
For each Notion page/database you want FlashFusion to access:

1. Open the page in Notion
2. Click the **three dots (⋯)** in the top right
3. Hover over **"+ Add connections"** 
4. Search for **"FlashFusion AI"** (or your integration name)
5. Click to connect
6. Confirm the connection

### 5. Test the Connection
Start FlashFusion and check the logs:
```bash
npm start
```

You should see:
```
✅ Notion service initialized
```

## Available Features

### 🔌 API Endpoints
- `GET /api/notion/status` - Connection status
- `GET /api/notion/databases` - List accessible databases
- `GET /api/notion/databases/:id/pages` - Get pages from database
- `POST /api/notion/databases/:id/pages` - Create new page
- `PATCH /api/notion/pages/:id` - Update existing page
- `GET /api/notion/search` - Search across Notion content

### 🤖 Agent Integration
Agents can now:
- **Create task pages** in your project databases
- **Update page status** and properties
- **Search** across your Notion workspace
- **Extract information** from your knowledge base

### 📊 Workflow Integration
- **Auto-create** project pages when workflows start
- **Update progress** as workflows execute  
- **Generate reports** in Notion databases
- **Sync data** between FlashFusion and Notion

## Example Usage

### Create a Task Database Page
```javascript
// Via API
POST /api/notion/databases/your-database-id/pages
{
  "properties": {
    "Title": { "title": [{ "text": { "content": "New Task" } }] },
    "Status": { "select": { "name": "In Progress" } },
    "Priority": { "select": { "name": "High" } }
  }
}
```

### Agent Task Creation
```javascript
// Via Agent Integration
POST /api/notion/agent-integration
{
  "agentId": "universal-creator",
  "action": "create_task_page",
  "parameters": {
    "databaseId": "your-database-id",
    "taskData": {
      "title": "Generate blog content",
      "description": "Create engaging blog post about AI automation",
      "status": "To Do"
    }
  }
}
```

## Integration Hub
The Notion integration appears in the **Productivity** section of the Integration Hub at `/integrations`. You can:

- View connection status
- Test the connection
- Monitor usage statistics
- Configure workflow automations

## Common Database Structures

### Project Management
```
Properties:
- Title (Title)
- Status (Select: To Do, In Progress, Done)
- Priority (Select: Low, Medium, High, Critical)
- Assignee (Person)
- Due Date (Date)
- Description (Rich Text)
```

### Knowledge Base
```
Properties:
- Title (Title)
- Category (Select: AI, Development, Business)
- Tags (Multi-select)
- Created (Created Time)
- Content (Rich Text)
```

### Meeting Notes
```
Properties:
- Meeting Title (Title)
- Date (Date)
- Attendees (Person)
- Action Items (Rich Text)
- Follow Up (Checkbox)
```

## Troubleshooting

### Connection Issues
- **Invalid token**: Ensure your `NOTION_TOKEN` is correct
- **Access denied**: Make sure the integration is connected to your pages
- **Pages not found**: Verify the integration has access to the specific workspace

### Common Errors
```
API token is invalid
→ Check your NOTION_TOKEN environment variable

Access denied
→ Connect the integration to your Notion pages

Database not found  
→ Ensure the database ID is correct and accessible
```

## Security Best Practices

1. **Never commit tokens** to version control
2. **Use environment variables** for configuration
3. **Limit integration permissions** to only what's needed
4. **Regularly rotate tokens** for security
5. **Monitor integration usage** in Notion's settings

## Next Steps

1. Set up your Notion token following the steps above
2. Connect the integration to your Notion pages
3. Restart FlashFusion to activate the integration
4. Explore the Integration Hub at `/integrations`
5. Test agent-driven Notion interactions

Your AI agents can now seamlessly work with your Notion workspace! 🚀