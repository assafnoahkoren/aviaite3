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
- **NestJS** modules in `server/src/features/` (chat, users, admin)
- **Prisma** for PostgreSQL database access
- **JWT** authentication with email verification and password reset
- **Services** in `server/src/services/` for shared functionality
- Path aliases: `@services/`, `@features/`
- **Server-Sent Events** for real-time chat streaming

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
SMTP2GO_BASE_URL=https://api.smtp2go.com/v3/
FRONTEND_URL=http://localhost:5173
```

For webapp, create `.env.local`:
```
VITE_SERVER_URL=http://localhost:3001
```

## Development Guidelines

### Frontend Development
- **Always use Mantine components** and their Stack/Group for layout
- **Component files**: Name in `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Style files**: Create `.module.scss` files with matching names (e.g., `UserProfile.module.scss`)
- **Colors**: Use Mantine CSS variables: `var(--mantine-color-red-5)`
- **Typography**: Use `Text` component from Mantine for all text content
- **Forms**: Use `@mantine/form` hook for all forms
- **Data fetching**: Use MobxQuery for queries, MobxMutation for mutations
- **Icons**: Use `@tabler/icons-react` package
- **Responsiveness**: Use Mantine's responsive props (`hiddenFrom`/`visibleFrom`) over custom media queries
- **NPM packages**: Install in webapp folder (it's a workspace with its own package.json)

### Backend Development
- Follow NestJS module pattern: module, controller, service
- Use DTOs for request validation with class-validator
- Implement guards for authentication (`@UseGuards(JwtAuthGuard)`)
- Handle errors with proper HTTP exceptions
- Use path aliases: `@services/`, `@features/`

### Fullstack Feature Development
1. **Update schema**: Edit `server/prisma/schema.prisma` and run `npx prisma migrate dev`
2. **Generate backend**: Create/update NestJS module, service, controller
   ```bash
   nest g module <entity>
   nest g service <entity>
   nest g controller <entity>
   ```
3. **Register module**: Add to imports array in `app.module.ts`
4. **Create API layer**: Update/create file in `webapp/src/api/`
   - Use shared `api` instance from `index.ts`
   - Add TypeScript typings matching DTOs
5. **Build UI**: Create components using the API functions
6. **Test**: Run `npm run tsc` in webapp to check for TypeScript errors

### Code Quality Checks
- **Always run** `npm run tsc` in webapp after making changes
- Run `npm run lint` in both server and webapp
- Test API endpoints with the REPL: `npm run repl` in server
- For visual testing, consider using Puppeteer MCP for screenshots and interaction testing

## Key Features & Patterns

### Authentication Flow
- Login/register endpoints in `server/src/features/users/`
- JWT tokens stored in localStorage on frontend
- Auth state managed by `webapp/src/features/auth/auth-store.tsx`
- Protected routes use `ProtectedRoute` component

### Chat System
- OpenAI integration in `server/src/features/chat/chat.service.ts`
- Server-Sent Events for streaming responses
- Thread-based conversations stored in database
- Frontend chat UI in `webapp/src/features/chat-v2/`

### API Communication
- All API calls go through `webapp/src/api/`
- Uses axios with interceptors for auth tokens
- Type-safe API functions matching backend DTOs
- Error handling with MobX mutations

### Database Schema
- User model with roles (USER, ADMIN)
- Organization-based multi-tenancy
- Chat threads and messages
- Subscription and billing models