# @blog/web

Next.js frontend application for the blog.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Start Production Server

```bash
npm start
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Architecture

### Directory Structure

```
web/
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities and contexts
│   ├── services/           # API service layer
│   └── types/              # TypeScript types
├── public/                 # Static assets
└── styles/                 # Global styles
```

## Services Layer

All API calls are encapsulated in service classes in `src/services/`:

- `api` - Axios instance configuration
- `authService` - Authentication API calls
- `articleService` - Article API calls
- `noteService` - Note API calls
- `commentService` - Comment API calls
- `likeService` - Like API calls
- `recentlyService` - Thought API calls
- `categoryService` - Category API calls
- `profileService` - Profile API calls
- `i18nService` - i18n API calls

## Context Providers

- `AuthProvider` - Authentication state and methods
- `I18nProvider` - Internationalization state
- `ThemeProvider` - Theme (dark/light mode) state

## Features

- Server-side rendering with Next.js App Router
- Client-side data fetching with SWR
- Type-safe API calls with TypeScript
- Responsive design with Tailwind CSS
- Dark mode support
- Internationalization (en/zh)
- Form validation with react-hook-form and Zod
