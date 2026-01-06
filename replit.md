# Phantom Thieves Shop

## Overview

A Persona 5-themed e-commerce web application for virtual Robux products. The project features a bold, dramatic visual design inspired by the Phantom Thieves aesthetic with angular layouts, red/black color schemes, and animated UI elements. Users can browse products, make purchases ("heists"), and view their order history.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with custom design tokens following a Persona 5 "Phantom Thieves" aesthetic (red/black theme with angular, dramatic elements)
- **UI Components**: shadcn/ui component library (Radix primitives) customized with the theme
- **Animations**: Framer Motion for dramatic page transitions and micro-interactions

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful JSON API with Zod validation for request/response schemas
- **Build**: esbuild for server bundling, Vite for client bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**: users, products, orders, globalStats, sessions
- **Migrations**: Drizzle Kit handles schema migrations (`drizzle-kit push`)

### Authentication
- **Method**: Replit Auth (OpenID Connect)
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **Implementation**: Passport.js with custom OIDC strategy in `server/replit_integrations/auth/`

### API Structure
Routes are defined with typed schemas in `shared/routes.ts`:
- `GET /api/user` - Current authenticated user
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `GET /api/orders` - User's order history
- `POST /api/orders` - Create new order
- `GET /api/stats/robux` - Global Robux counter

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (PhantomButton, PhantomCard, etc.)
    hooks/        # React Query hooks for API calls
    pages/        # Route pages (Home, Shop, Orders, Login)
    lib/          # Utilities and query client
server/           # Express backend
  replit_integrations/auth/  # Replit Auth implementation
shared/           # Shared types, schemas, and route definitions
  models/         # Database models (auth.ts)
  schema.ts       # Drizzle table definitions
  routes.ts       # API route contracts with Zod
```

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit Auth**: OAuth/OIDC provider using `ISSUER_URL` (defaults to replit.com/oidc)
- **Required Secrets**: `DATABASE_URL`, `SESSION_SECRET`, `REPL_ID`

### Third-Party Services
- **Google Fonts**: Playfair Display and Inter typefaces loaded via CDN
- **Unsplash**: Background imagery referenced in components

### Key npm Dependencies
- `@tanstack/react-query` - Server state management
- `drizzle-orm` / `drizzle-zod` - Database ORM and validation
- `framer-motion` - Animations
- `react-icons` - Icon library
- `passport` / `openid-client` - Authentication
- `express-session` / `connect-pg-simple` - Session management