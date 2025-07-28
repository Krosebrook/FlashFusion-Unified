# FlashFusion Zapier Integration Guide

## Overview

FlashFusion now supports Zapier webhooks, allowing you to automate workflows and connect your business ideas to thousands of apps. When events happen in FlashFusion (like creating ideas or generating AI content), webhooks can trigger actions in other applications.

## Available Webhook Events

### Business Ideas
- **`idea.created`** - Triggered when a new business idea is created
- **`idea.updated`** - Triggered when a business idea is modified

### AI Agent Tasks
- **`agent.task.completed`** - Triggered when any AI agent completes a task
- **`brandkit.generated`** - Triggered when the Brand Kit Agent generates content
- **`contentkit.generated`** - Triggered when the Content Kit Agent generates content
- **`seosite.generated`** - Triggered when the SEO Site Generator creates a page
- **`mockup.generated`** - Triggered when the Product Mockup Agent creates mockups

## Webhook Data Format

Each webhook sends a JSON payload with this structure:

```json
{
  "event": "idea.created",
  "data": {
    // Event-specific data (see examples below)
  },
  "timestamp": "2025-01-28T19:20:00.000Z",
  "userId": 123
}
```

## Event Data Examples

### Idea Created
```json
{
  "event": "idea.created",
  "data": {
    "ideaId": "abc123",
    "title": "AI-Powered Fitness App",
    "description": "A personalized workout app using AI recommendations",
    "category": "health",
    "tone": "professional",
    "createdAt": "2025-01-28T19:20:00.000Z",
    "userId": "user123"
  }
}
```

### Brand Kit Generated
```json
{
  "event": "brandkit.generated",
  "data": {
    "taskId": "task456",
    "agentName": "Brand Kit Agent",
    "content": "# Brand Guidelines\n\n## Logo Design\n...",
    "generatedAt": "2025-01-28T19:25:00.000Z",
    "metadata": {
      "idea": "AI-Powered Fitness App",
      "tone": "professional"
    }
  }
}
```

### Agent Task Completed
```json
{
  "event": "agent.task.completed",
  "data": {
    "taskId": "task789",
    "agentName": "Content Kit Agent",
    "agentType": "content",
    "input": {
      "idea": "AI-Powered Fitness App",
      "requirements": "Social media content"
    },
    "output": "Generated marketing content...",
    "completedAt": "2025-01-28T19:30:00.000Z"
  }
}
```

## Setting Up Zapier Integration

### Step 1: Create a Zap in Zapier
1. Go to [zapier.com](https://zapier.com) and create a new Zap
2. Choose "Webhooks by Zapier" as the trigger app
3. Select "Catch Hook" as the trigger event
4. Zapier will provide you with a webhook URL

### Step 2: Register the Webhook in FlashFusion
1. Navigate to the Zapier Integration page in FlashFusion (`/app/zapier`)
2. Paste the webhook URL from Zapier
3. Select the event type you want to trigger on
4. Click "Add Webhook"

### Step 3: Test the Integration
1. Use the "Test Webhook" feature to send a test payload
2. Verify that Zapier receives the data correctly
3. Continue setting up your Zap's action steps

### Step 4: Configure Zap Actions
Set up what happens when FlashFusion triggers the webhook:
- Send emails with idea details
- Create tasks in project management tools
- Post to social media
- Save to Google Sheets/Airtable
- Send Slack notifications
- And thousands of other possibilities!

## Popular Use Cases

### 1. Idea Management Automation
- **Trigger**: `idea.created`
- **Actions**: 
  - Create Trello/Asana card
  - Send email notification to team
  - Add to Google Sheets for tracking

### 2. Content Distribution
- **Trigger**: `contentkit.generated`
- **Actions**:
  - Post to social media platforms
  - Send to content approval workflow
  - Save to content management system

### 3. Brand Asset Management
- **Trigger**: `brandkit.generated`
- **Actions**:
  - Save to Google Drive/Dropbox
  - Send to design team via Slack
  - Create approval task in project management tool

### 4. SEO Campaign Automation
- **Trigger**: `seosite.generated`
- **Actions**:
  - Update SEO tracking spreadsheet
  - Notify marketing team
  - Schedule social media posts about new landing page

### 5. Product Development Pipeline
- **Trigger**: `mockup.generated`
- **Actions**:
  - Send to development team
  - Create GitHub issue
  - Update product roadmap

## API Endpoints

FlashFusion provides these API endpoints for webhook management:

- `POST /api/zapier/webhooks` - Register a new webhook
- `GET /api/zapier/webhooks` - List user's webhooks
- `DELETE /api/zapier/webhooks` - Remove a webhook
- `GET /api/zapier/events` - Get available event types
- `POST /api/zapier/test` - Send test webhook

## Security

- Webhooks are user-specific and isolated by user session
- All webhook URLs are validated before registration
- Test functionality allows verification without affecting live workflows
- Webhook failures are logged but don't interrupt FlashFusion operations

## Troubleshooting

### Webhook Not Firing
1. Check that the webhook is registered correctly in FlashFusion
2. Verify the event type matches what you expect to trigger
3. Use the test function to verify the webhook URL works

### Data Not Appearing in Zapier
1. Ensure your Zap is turned on
2. Check the Zapier Task History for errors
3. Verify your webhook URL is correct

### Integration Issues
1. Test the webhook manually using the test feature
2. Check that your Zapier app permissions are correct
3. Contact support if webhooks consistently fail

## Next Steps

With Zapier integration, FlashFusion becomes part of your larger business automation ecosystem. You can:

- Build complex multi-step workflows
- Connect to CRM systems
- Automate reporting and analytics
- Create approval processes
- Integrate with team communication tools

The possibilities are endless - unleash the power of automation with your business ideas!