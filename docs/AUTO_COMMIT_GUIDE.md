# Auto-Commit Guide

This guide explains all the auto-commit options available in your FlashFusion project.

## Quick Start

### Simple Auto-Commit (Recommended for beginners)
```bash
# Commit all changes with timestamp
npm run auto-commit

# Commit and push to remote
npm run auto-push
```

### Advanced Auto-Commit
```bash
# One-time commit with intelligent message
npm run auto-commit:advanced

# Commit and push with intelligent message
npm run auto-commit:push

# Watch files and auto-commit on changes
npm run auto-commit:watch

# Auto-commit every 5 minutes
npm run auto-commit:interval
```

## Available Methods

### 1. NPM Scripts (Simplest)

**Basic Commands:**
- `npm run auto-commit` - Stages all changes and commits with timestamp
- `npm run auto-push` - Commits and pushes to remote

**Advanced Commands:**
- `npm run auto-commit:advanced` - One-time commit with smart message
- `npm run auto-commit:push` - Commit with smart message and push
- `npm run auto-commit:watch` - Watch files and auto-commit on changes
- `npm run auto-commit:interval` - Auto-commit every 5 minutes

### 2. Direct Script Usage

The advanced auto-commit script (`scripts/auto-commit.js`) supports many options:

```bash
# Basic usage
node scripts/auto-commit.js

# With push
node scripts/auto-commit.js --push

# Custom message
node scripts/auto-commit.js --message "Work in progress" --push

# Auto-commit every 10 minutes (600 seconds)
node scripts/auto-commit.js --interval 600 --push

# Watch files and auto-commit on changes
node scripts/auto-commit.js --watch --push

# Show help
node scripts/auto-commit.js --help
```

### 3. Git Hooks (Automatic)

A pre-commit hook has been installed that will automatically commit changes when you run `git commit`. This is transparent and works with your existing workflow.

### 4. GitHub Actions (Production)

A GitHub Actions workflow (`.github/workflows/auto-commit.yml`) runs automatically:
- Every hour on schedule
- Can be triggered manually
- Commits any pending changes with timestamps

## Features

### Smart Commit Messages

The advanced script generates intelligent commit messages based on the types of changes:

- **File additions:** "Add 3 file(s)"
- **File modifications:** "Update 5 file(s)"  
- **File deletions:** "Delete 2 file(s)"
- **Mixed changes:** "Add 2 file(s), Update 3 file(s) - 2024-01-15 14:30:22"

### File Watching

When using the watch mode (`--watch` or `npm run auto-commit:watch`):
- Monitors all files except `node_modules`, `.git`, `dist`, `build`
- Debounces commits (waits 5 seconds after last change)
- Graceful shutdown with Ctrl+C

### Interval-Based Commits

When using interval mode (`--interval` or `npm run auto-commit:interval`):
- Commits at regular intervals (default: 5 minutes)
- Only commits if there are actual changes
- Graceful shutdown with Ctrl+C

## Best Practices

### For Development
```bash
# Start file watching during development
npm run auto-commit:watch
```

### For Regular Work Sessions
```bash
# Commit every 10 minutes with push
node scripts/auto-commit.js --interval 600 --push
```

### For Quick Commits
```bash
# Simple commit and push
npm run auto-push
```

### For Custom Messages
```bash
# Commit with specific message
node scripts/auto-commit.js --message "Implement user authentication" --push
```

## Configuration

### Changing Default Interval
Edit the `auto-commit:interval` script in `package.json`:
```json
"auto-commit:interval": "node scripts/auto-commit.js --interval 300 --push"
```
Change `300` to your desired interval in seconds.

### Modifying Watch Patterns
Edit `scripts/auto-commit.js` and modify the `ignored` array in the `watch()` method:
```javascript
ignored: [
    /(^|[\/\\])\../,  // ignore dotfiles
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    'your-custom-pattern/**'  // Add your patterns here
]
```

### GitHub Actions Schedule
Edit `.github/workflows/auto-commit.yml` to change the schedule:
```yaml
schedule:
  - cron: '0 */2 * * *'  # Every 2 hours instead of every hour
```

## Troubleshooting

### Permission Issues
Make sure scripts are executable:
```bash
chmod +x scripts/auto-commit.js
chmod +x .git/hooks/pre-commit
```

### Git Configuration
Ensure git is configured:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Dependencies
If file watching doesn't work, ensure chokidar is installed:
```bash
npm install chokidar
```

## Security Considerations

- Auto-commit should be used carefully in production environments
- Consider using `.gitignore` to exclude sensitive files
- The GitHub Actions workflow uses `GITHUB_TOKEN` which has repository access
- File watching ignores dotfiles and common build directories by default

## Integration with Existing Automation

Your project already has several automation scripts. The auto-commit functionality integrates well with:

- `npm run sync-updates` - Pushes and syncs with Notion
- `npm run automation:start` - Starts the automation machine
- `npm run notion-sync` - Syncs with Notion

You can chain these together:
```bash
# Auto-commit, then sync with Notion
npm run auto-push && npm run notion-sync
```