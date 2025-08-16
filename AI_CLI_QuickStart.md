# 🤖 Unified AI CLI - Quick Start Guide

## Installation & Setup

### 1. Run Setup Script
```cmd
setup-ai-cli.bat
```

### 2. Install AI Tools (Optional - tools install automatically when needed)
```cmd
ai install
```

### 3. Configure API Keys
```cmd
ai setup
```
Or manually set environment variables:
```cmd
set ANTHROPIC_API_KEY=your-claude-key
set OPENAI_API_KEY=your-openai-key  
set GEMINI_API_KEY=your-gemini-key
```

### 4. Load Environment (Optional shortcuts)
```cmd
call .ai-env.bat
```

## Basic Usage

### Simple Commands
```cmd
ai claude "Write a Python function to sort a list"
ai gpt "Explain quantum computing"
ai gemini "Create a marketing plan"
ai local "What is machine learning?"  
ai free "Write a haiku about coding"
```

### Shortcuts (after loading .ai-env.bat)
```cmd
c "write python code"           # claude
g "explain this concept"        # gpt  
gem "creative writing task"     # gemini
l "offline question"            # local llama
f "quick question"              # free AI
```

### Development Helpers
```cmd
fix "my broken code here"
explain "complex algorithm"
optimize "slow function"
debug "error message"
refactor "messy code"
```

### File Processing
```cmd
aifix myfile.py                 # Fix code in file
aiexplain script.js             # Explain code in file  
aidoc component.tsx             # Add documentation
aitest utils.py                 # Generate tests
```

### Pipe Operations
```cmd
type error.log | ai claude "Fix this error"
echo "sort array" | ai code "Write this function"
git diff | ai gpt "Write commit message"
```

### Compare Responses
```cmd
ai compare "Best practices for REST APIs"
```

## Configuration Commands

```cmd
ai config      # Check installation status
ai install     # Install all AI tools  
ai setup       # Interactive API key setup
ai list        # Show available models
ai help        # Detailed help
```

## Examples by Use Case

### 🔧 Debugging
```cmd
# Analyze error logs
type error.log | ai claude "What's causing this error?"

# Debug code
ai gpt "Debug this Python function: def calc(x): return x/0"

# Fix broken code  
fix "function broken() { console.log(missing_var) }"
```

### 💻 Code Generation  
```cmd
# Generate functions
ai code "Write a REST API endpoint for user authentication"

# Create components
ai claude "Create a React component for a todo list"

# Write scripts
ai gpt "Write a PowerShell script to backup files"
```

### 📚 Learning & Explanation
```cmd
# Explain concepts
explain "microservices architecture"

# Code explanations
aiexplain complex_algorithm.py

# Compare explanations
ai compare "Explain machine learning"
```

### 🚀 Productivity Workflows
```cmd
# Git workflow
git diff | ai claude "Write a commit message"
git log --oneline -10 | ai gpt "Summarize recent changes"

# Documentation  
aidoc main.py
ai claude "Write README for this project: $(ls)"

# Code review
type pull_request.diff | ai code "Review this code"
```

## Model Selection Guide

| Model | Best For | Cost | Speed |
|-------|----------|------|-------|
| `claude` | Coding, analysis, conversations | Paid | Fast |
| `gpt` | General tasks, creative writing | Paid | Fast |  
| `gemini` | Multimodal, research | Paid | Medium |
| `local` | Privacy, offline work | Free | Slow |
| `free` | Quick questions, no API key | Free | Medium |
| `code` | Programming tasks | Paid | Fast |

## Troubleshooting

### Check Status
```cmd
ai config
```

### Reinstall Tools
```cmd
ai install
```

### Reset Environment
```cmd
del %USERPROFILE%\.ai-cli-config.json
ai setup
```

### Common Issues

**"Command not found"**
- Run `setup-ai-cli.bat` 
- Restart command prompt
- Check PATH: `echo %PATH%`

**"API key not set"**  
- Run `ai setup`
- Or set manually: `set ANTHROPIC_API_KEY=your-key`

**"Tool not installed"**
- Run `ai install`
- Or install individually: `npm install -g @anthropic/claude-code`

## Advanced Usage

### Custom Aliases
Add to your batch files:
```cmd
doskey myai=ai claude $*
doskey quickfix=type $1 ^| ai code "Fix this"
```

### Configuration File
Edit `%USERPROFILE%\.ai-cli-config.json` for custom settings.

### Scripting
```cmd
REM Batch script example
for %%f in (*.py) do (
    echo Processing %%f...
    type "%%f" | ai code "Add type hints" > "%%f.typed"
)
```

## Integration with Claude Code

The AI CLI works alongside Claude Code:
- Use `claude` for interactive sessions
- Use `ai claude` for quick commands
- Both share the same API key
- Switch seamlessly between tools

**Example workflow:**
```cmd
# Quick fix with AI CLI
ai code "Fix this function: $(type broken.py)"

# Then switch to Claude Code for deeper work  
claude "Let's refactor this entire module"
```

This gives you the best of both worlds - quick AI access and deep interactive sessions!