# Dash.ai

## Overview

Dash.ai is a personal dashboard application with AI chat capabilities. Users can create customizable shortcut tiles to their favorite websites and interact with an AI assistant powered by OpenAI. The application features a modern, responsive design with dark mode support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for page transitions and interactive elements
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe request/response validation
- **Build Process**: Custom build script using esbuild for server bundling and Vite for client

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains table definitions for tiles and messages
- **Migrations**: Drizzle Kit manages database migrations via `db:push` command

### Key Data Models
- **Tiles**: Shortcut tiles with title, URL, icon (Lucide icon name), and color
- **Messages**: Chat messages with role (user/assistant) and content
- **Conversations**: Chat conversation groupings (defined in `shared/models/chat.ts`)

### Shared Code Pattern
The `shared/` directory contains code used by both client and server:
- `schema.ts`: Drizzle table definitions and Zod insert schemas
- `routes.ts`: API route definitions with input/output schemas for type safety

### Replit AI Integrations
Pre-built modules in `server/replit_integrations/` provide:
- **Chat**: Conversation management with OpenAI integration
- **Image**: Image generation using gpt-image-1 model
- **Batch**: Rate-limited batch processing utilities for LLM operations

## External Dependencies

### AI Services
- **OpenAI API**: Used for AI chat responses and image generation
- Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Database
- **PostgreSQL**: Primary data store
- Environment variable: `DATABASE_URL`
- Connection pooling via `pg` package

### UI Component Libraries
- **Radix UI**: Accessible primitives for dialogs, menus, tooltips, etc.
- **shadcn/ui**: Pre-styled component collection built on Radix
- **Lucide React**: Icon library used for tile icons and UI elements

### Development Tools
- **Vite**: Development server with HMR and production bundling
- **Drizzle Kit**: Database migration management
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment