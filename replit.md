# Orelha PetShop

## Overview

Orelha is a full-stack pet shop e-commerce application built in Portuguese (Brazilian). It provides product browsing/purchasing, service booking (grooming, baths, consultations), user authentication, a shopping cart, and an admin panel for managing products and orders. The app follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses a three-directory monorepo pattern:
- **`client/`** — React SPA frontend
- **`server/`** — Express API backend
- **`shared/`** — Shared types, schemas, and route definitions used by both client and server

### Frontend (`client/src/`)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: `wouter` (lightweight client-side router)
- **State Management**: 
  - `@tanstack/react-query` for server state (products, services, orders, auth)
  - React Context for auth (`useAuth`) and cart (`useCart`)
  - Cart persisted to `localStorage`
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives, styled with Tailwind CSS
- **Animations**: `framer-motion` for page transitions and micro-interactions
- **Theming**: Light/dark mode via CSS variables and a custom ThemeProvider; violet/purple color scheme
- **Forms**: `react-hook-form` with `zod` validation via `@hookform/resolvers`
- **Key Pages**: Home, Products (with category filters & search), Services (with appointment booking), Cart (with checkout), Auth (login/register), Contact, Admin (role-protected)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (`server/`)
- **Framework**: Express 5 running on Node.js with TypeScript (via `tsx`)
- **Authentication**: Passport.js with local strategy (email/password), express-session with PostgreSQL session store (`connect-pg-simple`), scrypt password hashing
- **API Pattern**: RESTful JSON API under `/api/` prefix. Route definitions are shared between client and server via `shared/routes.ts`
- **Dev Server**: Vite dev server integrated as Express middleware (HMR via `server/vite.ts`)
- **Production Build**: Client built with Vite, server bundled with esbuild into `dist/` directory. Static files served from `dist/public/`

### Database
- **Database**: PostgreSQL (required, via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema** (`shared/schema.ts`): 
  - `users` — id, email, password, name, role (admin/user)
  - `products` — id, name, description, price, category, image, stock
  - `services` — id, name, description, price, duration, image
  - `appointments` — id, userId, customerName, customerPhone, petName, serviceId, serviceName, date, status
  - `orders` — id, userId, customerName, total, status, createdAt
  - `orderItems` — id, orderId, productId, quantity, price
  - `contacts` — id, name, email, message, createdAt
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, not migration files)
- **Storage Layer**: `server/storage.ts` implements a `DatabaseStorage` class with an `IStorage` interface for all CRUD operations

### Shared Layer (`shared/`)
- `schema.ts` — Drizzle table definitions and Zod insert schemas
- `routes.ts` — API route definitions (paths, methods, input/output schemas) used by both frontend hooks and backend handlers, ensuring type safety across the stack

### Build & Scripts
- `npm run dev` — Development mode with Vite HMR
- `npm run build` — Production build (Vite for client, esbuild for server)
- `npm start` — Run production build
- `npm run db:push` — Push schema changes to database

### Admin Access
- Admin routes are protected by checking `user.role === 'admin'`
- Admin panel manages products (CRUD) and views orders

## External Dependencies

### Required Services
- **PostgreSQL Database** — Required. Connection via `DATABASE_URL` environment variable. Used for all application data and session storage.

### Key NPM Packages
- **Drizzle ORM** + **drizzle-zod** + **drizzle-kit** — Database ORM and schema management
- **Express 5** — HTTP server
- **Passport.js** + **passport-local** — Authentication
- **connect-pg-simple** — PostgreSQL session store
- **@tanstack/react-query** — Server state management
- **shadcn/ui** + **Radix UI** — UI component library
- **Tailwind CSS** — Utility-first CSS
- **framer-motion** — Animations
- **react-hook-form** + **zod** — Form handling and validation
- **wouter** — Client-side routing
- **date-fns** — Date formatting (with `ptBR` locale)
- **Vite** — Frontend build tool and dev server

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Session encryption secret (falls back to `dev_secret` in development)