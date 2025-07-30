# Git & Notion Workflow Guide

## 🔄 Overview

FlashFusion uses Git for version control and Notion for project documentation and updates tracking.

## 🚀 Quick Commands

### Push Updates to Git & Sync to Notion
```bash
npm run sync-updates
```
This command:
1. Pushes all commits to GitHub
2. Syncs latest updates to Notion

### Manual Notion Sync
```bash
npm run notion-sync
```

## 📋 Notion Setup

### 1. Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it "FlashFusion Sync"
4. Select your workspace
5. Copy the integration token

### 2. Configure Environment

Add to your `.env`:
```env
NOTION_TOKEN=your_notion_integration_token
NOTION_PROJECT_DB_ID=your_project_database_id
NOTION_UPDATES_DB_ID=your_updates_database_id
```

### 3. Create Notion Databases

Create two databases in Notion:

#### FlashFusion Project Database
Properties:
- Title (text)
- Status (select: Planning, In Progress, Completed)
- Priority (select: High, Medium, Low)
- Date (date)
- Type (select: Feature, Bug Fix, Documentation, Security)

#### FlashFusion Updates Database
Properties:
- Title (text)
- Date (date)
- Status (select: Deployed, In Progress, Testing)
- Changes (text)

### 4. Share with Integration

1. Open each database
2. Click "Share" in top right
3. Invite your integration

### 5. Get Database IDs

1. Open database as full page
2. Copy ID from URL: `notion.so/workspace/[DATABASE_ID]?v=...`

## 🔄 Workflow

### Daily Development Flow

1. **Make Changes**
   ```bash
   # Make your code changes
   git add .
   git commit -m "feat: add new feature"
   ```

2. **Push and Sync**
   ```bash
   npm run sync-updates
   ```

3. **Notion Sync Options**
   - Option 1: Sync latest commits
   - Option 2: Create project update
   - Option 3: Sync documentation
   - Option 4: Setup guide

### Weekly Updates

1. **Create Weekly Summary**
   ```bash
   npm run notion-sync
   # Select option 2: Create project update
   ```

2. **Review in Notion**
   - Check synced commits
   - Update project status
   - Plan next week

## 📊 What Gets Synced

### Automatic Sync Includes:
- Git commit history
- Project status updates
- Documentation changes
- Security updates
- Feature implementations

### Manual Sync Options:
- Specific documentation files
- Custom project updates
- Development milestones
- Bug fixes and issues

## 🎯 Best Practices

### Commit Messages
Use conventional commits for better Notion organization:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `security:` Security updates
- `refactor:` Code refactoring

### Notion Organization
- Keep updates chronological
- Tag with appropriate status
- Link related pages
- Add context in descriptions

### Sync Frequency
- Daily: Push code changes
- Weekly: Create project summaries
- Monthly: Review and archive

## 🛠️ Troubleshooting

### "Notion sync failed"
- Check NOTION_TOKEN is valid
- Verify database IDs are correct
- Ensure databases are shared with integration

### "Git push failed"
- Check git credentials
- Verify remote repository access
- Resolve any merge conflicts

### "Database not found"
- Confirm database is shared with integration
- Check database ID format
- Ensure integration has correct permissions

## 📈 Benefits

1. **Visibility**: Non-technical stakeholders can track progress
2. **Documentation**: Automatic project history
3. **Collaboration**: Comments and discussions in Notion
4. **Planning**: Visual project management
5. **Accountability**: Clear update tracking

## 🔗 Integration with Other Tools

### Zapier Integration
Connect Notion updates to:
- Slack notifications
- Email summaries
- Calendar events
- Task management

### GitHub Actions
Automatic syncs on:
- Pull request merges
- Release creation
- Issue closure

## 📝 Example Notion Page Structure

```
📊 FlashFusion Updates - 2024-01-24
├── 📝 Recent Commits
│   ├── feat: Add MCP integration
│   ├── fix: Resolve logger issues
│   └── docs: Update security guide
├── 🔧 Changes Summary
│   ├── New Features
│   ├── Bug Fixes
│   └── Improvements
└── 📋 Next Steps
    ├── Pending Tasks
    └── Upcoming Features
```

---

Remember: Consistent updates keep everyone aligned! 🎯