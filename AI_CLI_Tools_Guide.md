# AI CLI Tools Installation & Usage Guide

## 1. Claude Code (Anthropic)
```bash
# Install via npm
npm install -g @anthropic/claude-code

# Or download directly
curl -fsSL https://github.com/anthropics/claude-code/releases/latest/download/install.sh | sh

# Windows (PowerShell)
iwr https://github.com/anthropics/claude-code/releases/latest/download/claude-code-win.exe -OutFile claude.exe

# Usage
claude "Write a Python function to calculate fibonacci"
claude --model opus-4-1 "Explain quantum computing"
claude --resume  # Resume last conversation
```

## 2. ChatGPT CLI (OpenAI)
```bash
# Option 1: chatgpt-cli
pip install chatgpt-cli
chatgpt setup  # Enter your API key
chatgpt "What is the meaning of life?"

# Option 2: OpenAI official CLI
pip install openai
export OPENAI_API_KEY="your-api-key"
openai api chat.completions.create -m gpt-4 -g user "Hello world"

# Option 3: Shell-GPT
pip install shell-gpt
sgpt "Generate a bash script to backup files"
sgpt --code "Write a REST API in FastAPI"
```

## 3. Gemini CLI (Google)
```bash
# Option 1: gemini-cli
npm install -g gemini-cli
export GEMINI_API_KEY="your-api-key"
gemini "Explain machine learning"

# Option 2: Python SDK CLI wrapper
pip install google-generativeai
# Create a simple wrapper script
echo 'python -c "import google.generativeai as genai; genai.configure(api_key=\"$GEMINI_API_KEY\"); model = genai.GenerativeModel(\"gemini-pro\"); print(model.generate_content(\"$1\").text)"' > ~/bin/gemini
chmod +x ~/bin/gemini
gemini "Write a haiku about coding"
```

## 4. Multi-Model CLI Tools

### AIChat (Supports 20+ models)
```bash
# Install via Cargo
cargo install aichat

# Or via Homebrew
brew install aichat

# Or download binary
curl -fsSL https://github.com/sigoden/aichat/releases/latest/download/aichat-linux-amd64.tar.gz | tar xz

# Configure
aichat --init  # Interactive setup

# Usage
aichat "Hello"  # Uses default model
aichat -m claude-3-opus "Complex coding question"
aichat -m gpt-4 "Explain this code"
aichat -m gemini-pro "Write a story"
aichat --list-models  # See all available models
```

### LLM by Simon Willison
```bash
# Install base tool
pip install llm

# Install plugins for different models
llm install llm-claude-3
llm install llm-gpt4all
llm install llm-gemini
llm install llm-mistral

# Set API keys
llm keys set openai
llm keys set claude
llm keys set gemini

# Usage
llm "What is Python?"  # Uses default model
llm -m claude-3-opus "Write a web scraper"
llm -m gpt-4 "Debug this SQL query"
llm -m gemini-pro "Explain quantum entanglement"
llm models  # List all available models
```

### Mods (Pipe-friendly AI)
```bash
# Install
brew install charmbracelet/tap/mods

# Or via Go
go install github.com/charmbracelet/mods@latest

# Configure API keys
mods --settings

# Usage
echo "Explain this error" | mods
cat code.py | mods "Add type hints"
git diff | mods "Write a commit message"
mods -m gpt-4 "Create a README"
mods -m claude "Refactor this function"
```

## 5. Specialized AI CLI Tools

### GitHub Copilot CLI
```bash
# Install
npm install -g @githubnext/github-copilot-cli

# Authenticate
github-copilot-cli auth

# Usage
copilot "How do I uncommit in git?"
copilot explain "git rebase -i HEAD~3"
copilot suggest "Create a Python virtual environment"
```

### Ollama (Local LLMs)
```bash
# Install
curl -fsSL https://ollama.ai/install.sh | sh

# Download models
ollama pull llama2
ollama pull codellama
ollama pull mistral

# Usage
ollama run llama2 "Hello, how are you?"
ollama run codellama "Write a REST API"
echo "Fix this bug" | ollama run mistral
```

### Terminal GPT (tgpt) - No API key needed
```bash
# Install
curl -sSL https://raw.githubusercontent.com/aandrew-me/tgpt/main/install | bash

# Or via Go
go install github.com/aandrew-me/tgpt@latest

# Usage (uses free providers)
tgpt "Write a bash function"
tgpt -p phind "Debug this Python code"  # Use Phind provider
tgpt -p llama "Explain Docker"  # Use Llama provider
```

## 6. Quick Switching Between Models

### Create aliases in ~/.bashrc or ~/.zshrc
```bash
# AI Assistant Aliases
alias ai-claude="claude"
alias ai-gpt="sgpt --model gpt-4"
alias ai-gemini="aichat -m gemini-pro"
alias ai-local="ollama run llama2"

# Quick compare responses
function ai-compare() {
    echo "Claude:" && claude "$1"
    echo "\nGPT-4:" && sgpt --model gpt-4 "$1"
    echo "\nGemini:" && aichat -m gemini-pro "$1"
}

# Model switcher
function ai() {
    case $1 in
        claude) shift; claude "$@";;
        gpt) shift; sgpt --model gpt-4 "$@";;
        gemini) shift; aichat -m gemini-pro "$@";;
        local) shift; ollama run llama2 "$@";;
        *) echo "Usage: ai [claude|gpt|gemini|local] 'prompt'";;
    esac
}
```

## 7. Environment Setup Script

Create a setup script `setup-ai-tools.sh`:
```bash
#!/bin/bash

echo "Installing AI CLI Tools..."

# Claude Code
npm install -g @anthropic/claude-code

# ChatGPT tools
pip install shell-gpt chatgpt-cli openai

# Multi-model tools
pip install llm aichat
cargo install aichat || brew install aichat

# Ollama for local models
curl -fsSL https://ollama.ai/install.sh | sh

# Terminal GPT (no API needed)
curl -sSL https://raw.githubusercontent.com/aandrew-me/tgpt/main/install | bash

echo "Setup complete! Configure your API keys:"
echo "- Claude: claude --api-key YOUR_KEY"
echo "- OpenAI: export OPENAI_API_KEY=YOUR_KEY"
echo "- Gemini: export GEMINI_API_KEY=YOUR_KEY"
echo "- Or use 'aichat --init' for interactive setup"
```

## 8. API Key Management

Create `~/.ai-keys` file:
```bash
# AI API Keys
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
export GEMINI_API_KEY="AIza..."
export MISTRAL_API_KEY="..."
export GROQ_API_KEY="..."

# Source in your shell profile
echo "source ~/.ai-keys" >> ~/.bashrc
```

## Usage Examples

```bash
# Code generation
ai-claude "Write a Python web scraper"
ai-gpt "Create a Docker compose file"
ai-gemini "Build a React component"

# Debugging
cat error.log | mods "Explain this error"
git diff | ai-claude "Review this code"

# Documentation
ai-compare "Explain microservices architecture"

# Local/Offline
ollama run codellama "Optimize this SQL query"
tgpt "Convert this to TypeScript"
```

## Recommended Setup

1. **For general use**: AIChat (supports most models)
2. **For coding**: Claude Code + Shell-GPT
3. **For offline**: Ollama with CodeLlama
4. **For free usage**: tgpt
5. **For comparison**: LLM with multiple plugins

This setup gives you maximum flexibility to switch between models based on your needs, budget, and internet connectivity.