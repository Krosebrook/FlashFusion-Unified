# FlashFusion-United 🚀

A modern, responsive React web application with integrated development environment, Docker support, Supabase backend, and Replit deployment capabilities.

## 🎯 Quick Start

### Desktop Shortcut (Recommended)
1. **Double-click** the desktop shortcut: `FlashFusion-United`
2. Choose your setup:
   - **Option 1**: Full Development (Local + Docker + Supabase)
   - **Option 2**: Local Development Only
   - **Option 3**: Docker Development
   - **Option 4**: Deploy to Replit

### Manual Start
```bash
cd "C:\Users\kyler\Downloads\flashfusion-united"
npm install
npm run dev
```

## 🌟 Features

- **Modern UI**: Glass morphism design with gradient backgrounds
- **Responsive**: Mobile-first design with collapsible navigation
- **Interactive**: Smooth animations and hover effects
- **Multi-Page**: Home, Dashboard, Team, Settings with navigation
- **Floating Actions**: Quick access contact buttons

## 🛠️ Development Environments

### 1. Local Development
- **React + Vite**: Fast development server
- **Cursor IDE Integration**: Automatic AI-powered IDE opening
- **Hot Reload**: Instant updates on file changes

### 2. Docker Development  
- **Containerized**: Consistent environment across machines
- **Supabase Integration**: Local database with Studio
- **Production-like**: Test in production environment

### 3. Replit Deployment
- **Cloud-based**: No local setup required
- **Collaborative**: Share with team members
- **Auto-deploy**: Push to deploy instantly

## 🗄️ Database (Supabase)

### Schema
- **Users**: User profiles and authentication
- **Analytics**: Event tracking and metrics
- **Settings**: User preferences and configurations
- **Team Members**: Staff profiles and information
- **Dashboard Metrics**: Real-time analytics data

### Local Setup
```bash
# Start local Supabase
docker-compose up -d supabase-db supabase-studio

# Access Supabase Studio
# http://localhost:54323
```

## 🐳 Docker Commands

```bash
# Development with hot reload
docker-compose up flashfusion-dev

# Production build
docker-compose up flashfusion-app

# Full stack (App + Supabase)
docker-compose up

# Build images
docker-compose build
```

## 🌐 Deployment Options

### Replit (Recommended)
1. Run desktop shortcut → Option 4
2. Follow replit-setup.md guide
3. Deploy at [replit.com](https://replit.com)

### Vercel
```bash
npm run build
# Upload dist folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist folder
```

## 📁 Project Structure

```
flashfusion-united/
├── src/
│   ├── FlashFusionUnited.jsx    # Main component
│   ├── App.jsx                  # App wrapper  
│   ├── supabase.js             # Database helpers
│   └── assets/
├── supabase/
│   └── migrations/             # Database schema
├── docker-compose.yml          # Multi-service setup
├── Dockerfile                  # Production container
├── .replit                     # Replit configuration
├── start-flashfusion.bat       # Master startup script
└── CHECKPOINT.md              # Project documentation
```

## 🔧 Configuration

### Environment Variables
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_ENV=development
```

### Package Scripts
```json
{
  "dev": "vite",                    # Development server
  "build": "vite build",            # Production build
  "preview": "vite preview",        # Preview production build
  "lint": "eslint . --ext js,jsx"   # Code linting
}
```

## 🚀 Getting Started

### For Developers
1. **Click desktop shortcut** → Option 2 (Local Development)
2. **Edit code** in Cursor IDE (opens automatically)
3. **View changes** at http://localhost:5173

### For Full-Stack Development  
1. **Click desktop shortcut** → Option 1 (Full Development)
2. **Access Supabase Studio** at http://localhost:54323
3. **Develop with database** integration

### For Deployment
1. **Click desktop shortcut** → Option 4 (Replit)
2. **Follow the guide** that opens
3. **Deploy to cloud** in minutes

## 🎨 Customization

### Adding New Pages
1. Create new component in `FlashFusionUnited.jsx`
2. Add navigation item to `navigationItems` array
3. Add route in `renderCurrentPage()` function

### Styling
- All styles embedded in component
- Modify CSS variables for theme changes
- Add new animations in keyframes section

### Database Integration
- Use `supabaseHelpers` for database operations
- Add new functions in `src/supabase.js`
- Update schema in `supabase/migrations/`

## 📊 Analytics & Monitoring

- **User tracking**: Built-in analytics system
- **Performance metrics**: Dashboard with real-time data
- **Error monitoring**: Console logging and error tracking

## 🔒 Security

- **Row Level Security**: Enabled on all user data
- **Environment variables**: Secure configuration management
- **HTTPS ready**: Production-ready security headers

## 📖 Documentation

- **CHECKPOINT.md**: Complete project overview
- **CURSOR_SETUP.md**: AI-powered development with Cursor IDE
- **replit-setup.md**: Deployment guide
- **This README**: Getting started guide

## 🆘 Support

### Quick Help
- **Desktop shortcut** opens with menu options
- **Cursor IDE** opens automatically with AI assistance
- **Browser** opens to running application

### Troubleshooting
- **Port conflicts**: App uses 5173 (dev), 4173 (prod)
- **Docker issues**: Check Docker Desktop is running
- **Build errors**: Run `npm install` to update dependencies

---

**Ready to build something amazing!** 🎉

**Current Status**: ✅ Fully operational  
**Last Updated**: 2025-01-30  
**Version**: 1.0.0
