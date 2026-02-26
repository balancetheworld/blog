# @blog/servers

Koa backend API server for the blog application.

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

Create a `.env` file in the servers directory:

```env
NODE_ENV=development
PORT=3001
DATABASE_PATH=./database/blog.db
SESSION_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000
COOKIE_DOMAIN=localhost
```

## Architecture

### Directory Structure

```
servers/
├── src/
│   ├── server.ts              # Entry point
│   ├── config/                # Configuration
│   ├── routes/                # API routes
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── models/                # Data models
│   ├── middleware/            # Koa middleware
│   ├── database/              # Database connection & migrations
│   └── utils/                 # Utility functions
├── database/                  # SQLite database files
└── dist/                      # Compiled output
```

### Layer Architecture

```
Request → Router → Controller → Service → Model → Database
          ↓         ↓           ↓          ↓
      Middleware   Response   Business   Data
                                Logic
```

## API Routes

See the main README.md for complete API documentation.

## Database

Uses SQLite with better-sqlite3 for persistent storage.

- Database file: `database/blog.db`
- Tables are auto-created on first run
- Seed data is automatically populated

## Middleware

- `errorHandler` - Global error handling
- `logger` - Request logging
- `corsMiddleware` - CORS configuration
- `authMiddleware` - Authentication check
- `adminMiddleware` - Admin-only access check

## Services

All business logic is encapsulated in service classes:
- `AuthService` - Authentication and session management
- `ArticleService` - Article CRUD
- `NoteService` - Note CRUD
- `CommentService` - Comment management
- `LikeService` - Like functionality
- `RecentlyService` - Thought management
- `CategoryService` - Category management
- `ProfileService` - Profile management
- `I18nService` - i18n labels management
