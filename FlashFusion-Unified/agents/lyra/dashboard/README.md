# 🧠 LYRA Dashboard - AI Orchestration IDE

A next-generation visual dashboard for the LYRA Strategic Multimodal Agent, designed for system analysis, idea validation, and strategic planning.

## ✨ Features

- **🧭 Systems Mapping**: Visualize complex system architectures with interactive diagrams
- **🧠 Idea Validation**: Challenge assumptions and find logical gaps before implementation
- **📐 Blueprint Generation**: Convert abstract concepts into concrete implementation plans
- **🧪 MVP Design**: Define minimum viable tests and prototypes
- **🪞 Psychology Analysis**: Understand user motivations and emotional drivers
- **🔁 Loop Testing**: Identify feedback loops and recursion issues
- **🧬 Stack Integration**: Seamlessly integrate with existing tech stacks

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 Design System

- **Theme**: Dark-first with futuristic neon accents
- **Colors**: Purple (#8B5CF6), Teal (#14B8A6), Pink (#EC4899)
- **Typography**: Inter font family for maximum readability
- **Layout**: Responsive grid system (1920px, 1440px, 1024px breakpoints)

## 🏗️ Architecture

```
dashboard/
├── app/                    # Next.js 14 App Router
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── mode-selector.tsx # Analysis mode selection
│   ├── context-panel.tsx # Critical info display
│   └── visualization-canvas.tsx # Mermaid diagrams
├── lib/
│   ├── store.ts          # Zustand state management
│   └── utils.ts          # Utility functions
└── styles/               # Global styles
```

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_LYRA_API_URL=http://localhost:3001
NEXT_PUBLIC_CLAUDE_API_KEY=your_claude_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
```

### Analysis Modes

| Mode | Purpose | Token Usage |
|------|---------|-------------|
| SYSTEMS_MAP | Break down complex systems | ~2-3k tokens |
| IDEA_BURNER | Validate and challenge ideas | ~3-4k tokens |
| STRUCTURE | Create implementation blueprints | ~2-3k tokens |
| MVP_RUN | Design minimum viable tests | ~1-2k tokens |
| PSYCH_DEPTH | Analyze psychological drivers | ~2-3k tokens |
| LOOP_TEST | Find feedback loops | ~2-3k tokens |
| STACK_SYNC | Integrate with tech stacks | ~3-4k tokens |

## 🎯 Usage Examples

### System Analysis
```typescript
// Input: Complex microservices architecture
// Output: Component map, bottlenecks, recommendations
```

### Idea Validation
```typescript
// Input: "AI-powered code review for COBOL"
// Output: Feasibility gaps, market analysis, pivot options
```

### MVP Design
```typescript
// Input: Voice-controlled dashboard concept
// Output: 48-hour test plan, success metrics, prototypes
```

## 🔌 Integrations

- **Claude MCP**: Native integration with Claude Code
- **Mermaid.js**: Interactive diagram rendering
- **Export Formats**: JSON, Markdown, YAML, API-ready
- **Version Control**: Git integration for artifact tracking

## 🎨 Customization

### Adding New Modes

1. Update `mode-selector.tsx` with new mode definition
2. Add context data to `context-panel.tsx`
3. Implement analysis logic in `store.ts`
4. Add visualization support in `visualization-canvas.tsx`

### Theming

Modify `tailwind.config.js` for custom color schemes:

```javascript
theme: {
  extend: {
    colors: {
      lyra: {
        primary: "#your-color",
        secondary: "#your-color",
      }
    }
  }
}
```

## 📊 Performance

- **Bundle Size**: ~500KB gzipped
- **First Load**: <2s on 3G
- **Interactive**: <1s time to interactive
- **Accessibility**: WCAG 2.1 AA compliant

## 🛡️ Security

- No PII processing in PSYCH_DEPTH mode
- XSS protection for Mermaid outputs
- Rate limiting: 10 analyses/minute
- Audit logging for compliance

## 📱 Mobile Support

Responsive design with optimized layouts for:
- Desktop: 1920px+ (Full feature set)
- Laptop: 1440px+ (Condensed panels)
- Tablet: 1024px+ (Stacked layout)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with** ❤️ **by the FlashFusion Team**

*Turning chaos into clarity, one analysis at a time.*