# FlashFusion-Unified on Replit

## Quick Setup

1. **Import Repository**: 
   - Go to https://replit.com/new/github
   - Import: `https://github.com/Krosebrook/FlashFusion-Unified`

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   - Copy `.env.example` to `.env`
   - Fill in your API keys (OpenAI, Anthropic, Supabase, etc.)

4. **Start the Application**:
   ```bash
   npm start
   ```

## Environment Variables Required

### Core Services
- `OPENAI_API_KEY`: Your OpenAI API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Optional Services
- `GEMINI_API_KEY`: Google Gemini API key
- `GITHUB_TOKEN`: GitHub personal access token
- `STRIPE_SECRET_KEY`: Stripe API key for payments

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm test` - Run tests
- `npm run health` - Check system health

## Replit Features

### Deployment
- Auto-deploys to Google Cloud Run
- Custom domain support available
- SSL certificates automatically managed

### Development
- Real-time collaboration
- Integrated terminal and editor
- Version control with Git integration
- Package manager integration

### Monitoring
- Built-in uptime monitoring
- Resource usage analytics
- Error tracking and logging

## FlashFusion Features Available

✅ **AI Agents**: 6 Universal Agents (Researcher, Creator, Optimizer, etc.)
✅ **Workflows**: Development, Commerce, Content, Hybrid workflows
✅ **Integrations**: 30+ service integrations via MCP
✅ **Real-time**: WebSocket connections for live updates
✅ **Security**: JWT authentication and API rate limiting

## Support

- **Documentation**: Check `/docs` folder
- **Health Check**: Visit `/health` endpoint
- **API Docs**: Visit `/api/docs` for Swagger documentation
- **WebSocket**: Connect to `/socket.io` for real-time features

## Production Deployment

1. **Configure Environment**: Set all required environment variables
2. **Build Application**: Run `npm run build`
3. **Deploy**: Use Replit's built-in deployment or manual deploy
4. **Monitor**: Check logs and health endpoints

Happy coding with FlashFusion! 🚀