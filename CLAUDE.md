# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Server (Backend)
```bash
cd server
npm run dev          # Development with hot reload
npm run build        # Production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run test         # Run unit tests
npm run test:e2e     # Run e2e tests
npm run repl         # Interactive REPL for debugging
```

### Webapp (Frontend)
```bash
cd webapp
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run tsc          # Type check - ALWAYS run this after changes
```

### Database (run from server directory)
```bash
npx prisma migrate dev    # Run migrations in development
npx prisma generate       # Generate Prisma client after schema changes
npx prisma studio         # Open Prisma Studio GUI
```

## Architecture Overview

This is a monorepo with two main packages:
- **server/**: NestJS backend with Prisma ORM, JWT auth, and OpenAI integration
- **webapp/**: React frontend with Vite, MobX state management, and Mantine UI

### Backend Architecture
- **NestJS** modules in `server/src/features/` (chat, users)
- **Prisma** for PostgreSQL database access
- **JWT** authentication with email verification and password reset
- **Services** in `server/src/services/` for shared functionality
- Path aliases: `@services/`, `@features/`

### Frontend Architecture
- **React 18** with TypeScript and Vite
- **MobX** for state management, **React Query** for server state
- **Mantine UI** component library - always use Mantine components
- **SCSS Modules** for styling - use `.module.scss` files
- **API layer** in `webapp/src/api/` for backend communication

## Required Environment Variables

Create a `.env` file in the server directory with:
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
OPENAI_API_KEY=...
SMTP2GO_API_KEY=...
SMTP2GO_BASE_URL=...
FRONTEND_URL=...
```

## Development Guidelines

### Frontend Development
- Always use Mantine components and their Stack/Group for layout
- Create `.module.scss` files for component styling
- Use Mantine CSS variables for colors: `var(--mantine-color-red-5)`
- Use `@mantine/form` hook for all forms
- Use MobxQuery/MobxMutation for data fetching
- Icons from `@tabler/icons-react`

### Fullstack Feature Development
1. Update `server/prisma/schema.prisma` and run migrations
2. Generate/update NestJS module, service, controller
3. Register new modules in `app.module.ts`
4. Create/update frontend API file in `webapp/src/api/`
5. Create UI components using the API

### Code Quality Checks
- Run `npm run tsc` in webapp after making changes
- Run `npm run lint` in both server and webapp
- Test API endpoints with the REPL: `npm run repl` in server