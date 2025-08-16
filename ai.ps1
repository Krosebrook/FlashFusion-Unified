#!/usr/bin/env pwsh
# Unified AI CLI - PowerShell Version
# Usage: ai [model] "prompt" or .\ai.ps1 [model] "prompt"

param(
    [Parameter(Position=0)]
    [string]$Model,
    
    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$Prompt
)

# Configuration
$ConfigPath = "$env:USERPROFILE\.ai-cli-config.json"
$DefaultConfig = @{
    default_model = "claude"
    api_keys = @{
        anthropic = $env:ANTHROPIC_API_KEY
        openai = $env:OPENAI_API_KEY
        gemini = $env:GEMINI_API_KEY
    }
    tools = @{
        claude = "claude"
        gpt = "sgpt"
        aichat = "aichat"
        ollama = "ollama"
        tgpt = "tgpt"
    }
    aliases = @{
        c = "claude"
        g = "gpt"
        gem = "gemini"
        l = "local"
        f = "free"
    }
}

function Write-ColorText {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

function Get-Config {
    if (Test-Path $ConfigPath) {
        return Get-Content $ConfigPath | ConvertFrom-Json
    }
    return $DefaultConfig
}

function Save-Config {
    param($Config)
    $Config | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Show-Help {
    Write-ColorText "🤖 Unified AI CLI - Access all AI models from command prompt" "Cyan"
    Write-Host ""
    Write-ColorText "Usage:" "Yellow"
    Write-Host "  ai [model] `"your prompt here`""
    Write-Host ""
    Write-ColorText "Available models:" "Yellow"
    Write-Host "  claude     - Claude (best for coding, conversations)"
    Write-Host "  gpt        - GPT-4 (OpenAI's flagship model)"
    Write-Host "  gemini     - Gemini Pro (Google's multimodal AI)"
    Write-Host "  local      - Local Llama (runs offline, no API key)"
    Write-Host "  free       - Free AI (no API key needed)"
    Write-Host "  code       - Code-focused AI (optimized for programming)"
    Write-Host "  compare    - Compare responses from all models"
    Write-Host ""
    Write-ColorText "Shortcuts:" "Yellow"
    Write-Host "  c          - claude"
    Write-Host "  g          - gpt"
    Write-Host "  gem        - gemini"
    Write-Host "  l          - local"
    Write-Host "  f          - free"
    Write-Host ""
    Write-ColorText "Examples:" "Yellow"
    Write-Host "  ai claude `"Write a Python function to sort a list`""
    Write-Host "  ai g `"Explain quantum computing`""
    Write-Host "  ai compare `"Best practices for REST APIs`""
    Write-Host ""
    Write-ColorText "Configuration:" "Yellow"
    Write-Host "  ai config    - Check what's installed and configured"
    Write-Host "  ai install   - Install all AI tools automatically"
    Write-Host "  ai setup     - Interactive setup wizard"
    Write-Host "  ai list      - List all available models"
    Write-Host ""
    Write-ColorText "Pipe support:" "Yellow"
    Write-Host "  Get-Content file.py | ai code `"Add comments`""
    Write-Host "  `"Fix this code`" | ai claude"
}

function Show-Config {
    $config = Get-Config
    Write-ColorText "🔧 AI CLI Configuration Status" "Cyan"
    Write-Host ""
    
    Write-ColorText "Installed Tools:" "Yellow"
    $tools = @{
        "Claude Code" = "claude"
        "Shell-GPT" = "sgpt"
        "AIChat" = "aichat"
        "Ollama" = "ollama"
        "tgpt" = "tgpt"
    }
    
    foreach ($tool in $tools.GetEnumerator()) {
        if (Test-Command $tool.Value) {
            Write-ColorText "  ✓ $($tool.Key): Installed" "Green"
        } else {
            Write-ColorText "  ✗ $($tool.Key): Not found" "Red"
        }
    }
    
    Write-Host ""
    Write-ColorText "API Keys:" "Yellow"
    if ($env:ANTHROPIC_API_KEY) {
        Write-ColorText "  ✓ Claude API Key: Set" "Green"
    } else {
        Write-ColorText "  ✗ Claude API Key: Not set" "Red"
    }
    
    if ($env:OPENAI_API_KEY) {
        Write-ColorText "  ✓ OpenAI API Key: Set" "Green"
    } else {
        Write-ColorText "  ✗ OpenAI API Key: Not set" "Red"
    }
    
    if ($env:GEMINI_API_KEY) {
        Write-ColorText "  ✓ Gemini API Key: Set" "Green"
    } else {
        Write-ColorText "  ✗ Gemini API Key: Not set" "Red"
    }
    
    Write-Host ""
    Write-ColorText "Config file: $ConfigPath" "Gray"
}

function Install-AITools {
    Write-ColorText "🚀 Installing AI CLI Tools..." "Cyan"
    Write-Host ""
    
    # Node.js tools
    Write-ColorText "Installing Node.js AI tools..." "Yellow"
    try {
        & npm install -g @anthropic/claude-code 2>$null
        & npm install -g aichat-cli 2>$null
        Write-ColorText "  ✓ Node.js tools installed" "Green"
    } catch {
        Write-ColorText "  ✗ Failed to install Node.js tools" "Red"
    }
    
    # Python tools
    Write-ColorText "Installing Python AI tools..." "Yellow"
    try {
        & pip install shell-gpt openai google-generativeai 2>$null
        Write-ColorText "  ✓ Python tools installed" "Green"
    } catch {
        Write-ColorText "  ✗ Failed to install Python tools" "Red"
    }
    
    # Ollama
    Write-ColorText "Installing Ollama..." "Yellow"
    try {
        $ollamaUrl = "https://ollama.ai/download/windows"
        $ollamaPath = "$env:TEMP\OllamaSetup.exe"
        Invoke-WebRequest -Uri $ollamaUrl -OutFile $ollamaPath
        Start-Process $ollamaPath -Wait
        Write-ColorText "  ✓ Ollama installed" "Green"
    } catch {
        Write-ColorText "  ✗ Failed to install Ollama" "Red"
    }
    
    # tgpt
    Write-ColorText "Installing tgpt..." "Yellow"
    try {
        $tgptUrl = "https://github.com/aandrew-me/tgpt/releases/latest/download/tgpt_windows_amd64.zip"
        $tgptZip = "$env:TEMP\tgpt.zip"
        $tgptDir = "$env:USERPROFILE\bin"
        
        Invoke-WebRequest -Uri $tgptUrl -OutFile $tgptZip
        if (!(Test-Path $tgptDir)) { New-Item -ItemType Directory -Path $tgptDir }
        Expand-Archive $tgptZip -DestinationPath $tgptDir -Force
        
        # Add to PATH if not already there
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        if ($currentPath -notlike "*$tgptDir*") {
            [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$tgptDir", "User")
        }
        
        Write-ColorText "  ✓ tgpt installed" "Green"
    } catch {
        Write-ColorText "  ✗ Failed to install tgpt" "Red"
    }
    
    Write-Host ""
    Write-ColorText "Installation complete!" "Green"
    Write-Host "Run 'ai config' to verify installation"
    Write-Host "Run 'ai setup' for interactive configuration"
}

function Invoke-AIModel {
    param([string]$ModelName, [string]$PromptText)
    
    $config = Get-Config()
    
    # Handle aliases
    if ($config.aliases.ContainsKey($ModelName)) {
        $ModelName = $config.aliases[$ModelName]
    }
    
    switch ($ModelName.ToLower()) {
        "claude" {
            Write-ColorText "[Claude]" "Blue"
            if (Test-Command "claude") {
                & claude $PromptText
            } else {
                Write-ColorText "Claude Code not installed. Run: ai install" "Red"
            }
        }
        
        "gpt" {
            Write-ColorText "[GPT-4]" "Green"
            if (Test-Command "sgpt") {
                & sgpt --model gpt-4 $PromptText
            } else {
                Write-ColorText "Shell-GPT not installed. Run: ai install" "Red"
            }
        }
        
        "gemini" {
            Write-ColorText "[Gemini Pro]" "Yellow"
            if (Test-Command "aichat") {
                & aichat -m gemini-pro $PromptText
            } else {
                Write-ColorText "AIChat not installed. Run: ai install" "Red"
            }
        }
        
        "local" {
            Write-ColorText "[Local Llama]" "Magenta"
            if (Test-Command "ollama") {
                & ollama run llama2 $PromptText
            } else {
                Write-ColorText "Ollama not installed. Run: ai install" "Red"
            }
        }
        
        "free" {
            Write-ColorText "[Free AI - No API Key Needed]" "Cyan"
            if (Test-Command "tgpt") {
                & tgpt $PromptText
            } else {
                Write-ColorText "tgpt not installed. Run: ai install" "Red"
            }
        }
        
        "code" {
            Write-ColorText "[Code-focused AI]" "DarkBlue"
            if (Test-Command "aichat") {
                & aichat -m claude-3-sonnet -r code $PromptText
            } elseif (Test-Command "claude") {
                & claude $PromptText
            } else {
                Write-ColorText "No code-focused AI available. Run: ai install" "Red"
            }
        }
        
        "compare" {
            Write-ColorText "====== AI Model Comparison ======" "Cyan"
            Write-Host ""
            
            Write-ColorText "[Claude Response:]" "Blue"
            if (Test-Command "claude") { & claude $PromptText } else { Write-Host "Not available" }
            Write-Host ""
            
            Write-ColorText "[GPT-4 Response:]" "Green"
            if (Test-Command "sgpt") { & sgpt --model gpt-4 $PromptText } else { Write-Host "Not available" }
            Write-Host ""
            
            Write-ColorText "[Gemini Response:]" "Yellow"
            if (Test-Command "aichat") { & aichat -m gemini-pro $PromptText } else { Write-Host "Not available" }
            Write-Host ""
            
            Write-ColorText "====== End Comparison ======" "Cyan"
        }
        
        default {
            Write-ColorText "Unknown model: $ModelName" "Red"
            Write-Host "Use 'ai list' to see available models"
        }
    }
}

# Main logic
if (!$Model -or $Model -eq "help") {
    Show-Help
    exit
}

$PromptText = $Prompt -join " "

# Handle pipe input
if (!$PromptText -and !$([Console]::IsInputRedirected)) {
    $PromptText = ""
} elseif ($([Console]::IsInputRedirected)) {
    $pipeInput = $input | Out-String
    $PromptText = "$pipeInput $PromptText".Trim()
}

switch ($Model.ToLower()) {
    "config" { Show-Config }
    "install" { Install-AITools }
    "list" {
        Write-ColorText "Available AI Models:" "Cyan"
        Write-Host ""
        Write-Host "  ai claude `"prompt`"     - Claude (Anthropic)"
        Write-Host "  ai gpt `"prompt`"        - GPT-4 (OpenAI)"
        Write-Host "  ai gemini `"prompt`"     - Gemini Pro (Google)"
        Write-Host "  ai local `"prompt`"      - Local Llama (Ollama)"
        Write-Host "  ai free `"prompt`"       - Free AI (no API key)"
        Write-Host "  ai code `"prompt`"       - Code-focused AI"
        Write-Host "  ai compare `"prompt`"    - Compare all models"
        Write-Host ""
        Write-ColorText "Shortcuts:" "Yellow"
        Write-Host "  ai c, ai g, ai gem, ai l, ai f"
    }
    "setup" {
        Write-ColorText "🛠️  AI CLI Setup Wizard" "Cyan"
        Write-Host ""
        
        $anthropicKey = Read-Host "Enter your Anthropic API key (optional)"
        if ($anthropicKey) { [Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", $anthropicKey, "User") }
        
        $openaiKey = Read-Host "Enter your OpenAI API key (optional)"
        if ($openaiKey) { [Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $openaiKey, "User") }
        
        $geminiKey = Read-Host "Enter your Gemini API key (optional)"
        if ($geminiKey) { [Environment]::SetEnvironmentVariable("GEMINI_API_KEY", $geminiKey, "User") }
        
        Write-ColorText "Setup complete! Restart your terminal to use the new keys." "Green"
    }
    default {
        if (!$PromptText) {
            Write-ColorText "Error: No prompt provided" "Red"
            Write-Host "Usage: ai $Model `"your prompt here`""
            exit 1
        }
        Invoke-AIModel $Model $PromptText
    }
}