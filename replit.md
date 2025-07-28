# FlashFusion - AI Business Idea Generator

## Overview

FlashFusion is a comprehensive web application that combines AI-powered business idea generation with automated content creation tools. The platform allows users to create business ideas and then leverage specialized AI agents to generate brand kits, content, SEO landing pages, and product mockups. Built with a modern tech stack featuring React, Express, and Anthropic's Claude AI, the application provides a seamless experience for entrepreneurs and content creators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with a clear separation between client and server components:

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Authentication**: Firebase Auth integration

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Anthropic Claude API for content generation
- **Session Management**: Express sessions with PostgreSQL storage
- **Development**: Hot reload with Vite integration in development mode

## Key Components

### Database Schema
The application uses four main database tables:
- **Users**: Stores user profiles with Firebase integration and subscription data
- **Ideas**: Business ideas created by users with metadata like title, description, and tone
- **Agents**: Available AI agents with their capabilities and usage statistics
- **Agent Tasks**: Queue system for AI processing with input/output tracking

### AI Agent System
The platform features specialized AI agents:
- **Brand Kit Agent**: Generates brand guidelines, logos, and visual identity
- **Content Kit Agent**: Creates marketing copy and content strategies
- **SEO Site Generator**: Builds landing pages optimized for search engines
- **Product Mockup Agent**: Designs product visualizations and mockups

### Queue Management
A sophisticated task queue system handles AI agent processing:
- Tasks are queued when users request AI generation
- Background processing ensures responsive user experience
- Status tracking with real-time updates
- Failure handling and retry mechanisms

## Data Flow

1. **User Authentication**: Firebase handles user registration and login
2. **Idea Creation**: Users create business ideas stored in PostgreSQL
3. **AI Agent Selection**: Users choose specific agents for content generation
4. **Task Queuing**: Requests are queued with input parameters
5. **AI Processing**: Claude API generates content based on agent specialization
6. **Result Storage**: Generated content is stored and linked to ideas
7. **Real-time Updates**: UI reflects processing status and completed results

## External Dependencies

### Third-Party Services
- **Anthropic Claude**: AI content generation using claude-sonnet-4-20250514 model
- **Firebase**: User authentication and potentially Firestore for real-time features
- **Neon Database**: PostgreSQL database hosting
- **Stripe**: Payment processing for subscription management

### Development Tools
- **Replit**: Development environment with integrated deployment
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Production bundling for server-side code

## Deployment Strategy

The application is designed for Replit deployment with the following approach:

### Development Mode
- Vite dev server serves the React frontend
- Express server handles API routes and AI processing
- Hot reload for rapid development iteration

### Production Build
- Vite builds optimized client bundles to `dist/public`
- ESBuild compiles server code to `dist/index.js`
- Single Node.js process serves both static files and API endpoints

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Anthropic API key for AI functionality
- Firebase configuration for authentication
- Stripe keys for payment processing

### Key Architectural Decisions

**Queue-based AI Processing**: Instead of blocking HTTP requests, AI tasks are queued for background processing. This prevents timeouts and provides better user experience with status updates.

**Shared Schema**: The `shared/schema.ts` file contains Drizzle schema definitions used by both client and server, ensuring type safety across the full stack.

**Database Integration**: The application now uses PostgreSQL with Neon for all data persistence, replacing the previous in-memory storage implementation.

**Modular Agent System**: Each AI agent is designed as a separate module with specialized prompts and processing logic, making it easy to add new agent types.

**Real-time Updates**: Using TanStack Query with polling intervals, the UI stays synchronized with background processing status without WebSocket complexity.

## Recent Changes

### January 28, 2025 - Zapier Integration Wizard & Automation
- **Major**: Integrated comprehensive Zapier webhook system with step-by-step guidance wizards
- **Wizards**: Full Integration Wizard (5 steps) and Quick Setup Wizard (2 minutes) for seamless onboarding
- **Features**: Complete webhook management UI with registration, testing, and monitoring capabilities
- **Events**: 7 webhook events covering ideas, agent tasks, and content generation
- **Guidance**: Interactive tutorials with copy-paste instructions and external link integration
- **Use Cases**: Popular automation examples (ideas to tasks, AI content to social media, team notifications)
- **API**: Complete REST API for webhook management with proper error handling
- **Triggers**: Automatic webhook firing on idea creation/updates and AI agent completions
- **Documentation**: Comprehensive integration guide with examples and use cases
- **Navigation**: Added Zapier Integration page to tools section with webhook icon
- **Status**: ✅ Successfully integrated - Zapier webhooks working with guided wizard experience

### January 28, 2025 - Landing Page Integration & Vercel Deployment Setup
- **Major**: Integrated beautiful marketing landing page as homepage (/) with gradient backgrounds and animations
- **Restructured**: Moved all app functionality to /app routes for clear separation of marketing vs functional areas
- **Enhanced**: Added CSS animations (slideIn, fadeUp, bounce, float effects) and smooth page transitions
- **Improved**: Dashboard cards with hover effects and enhanced visual hierarchy
- **Navigation**: Added seamless navigation between landing page and app via logo clicks and "Launch App" button
- **Deployment**: Created Vercel configuration files (vercel.json, .vercelignore) and comprehensive deployment guide
- **Architecture**: Landing page serves as marketing front-end, dashboard as authenticated user workspace
- **Status**: ✅ Successfully integrated - landing page and app functionality working seamlessly

### January 28, 2025 - Database Integration
- **Major**: Migrated from in-memory storage (MemStorage) to PostgreSQL database (DatabaseStorage)
- **Added**: Database relations using Drizzle ORM relations operator for proper data modeling
- **Updated**: All CRUD operations now use database queries instead of in-memory maps
- **Created**: Database schema with 5 tables: users, ideas, agents, agent_tasks, queue_status
- **Implemented**: Lazy initialization for agents to prevent issues during application startup
- **Status**: ✅ Successfully tested - all database operations working properly