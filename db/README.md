# Database Setup - Fit Booth

This directory contains the complete Drizzle ORM setup for the Fit Booth application.

## Structure

```
db/
├── client.ts           # Database client configuration
├── config.ts           # Database configuration and utilities
└── schema/
    ├── index.ts        # Main schema exports
    ├── users.ts        # User table schema
    ├── sessions.ts     # Session table schema
    ├── views.ts        # Views table schema
    └── reactions.ts    # Reactions table schema
```

## Setup Instructions

1. **Environment Variables**
   Copy `.env.example` to `.env` and update with your database credentials:
   ```bash
   cp .env.example .env
   ```

2. **Generate Migration Files**
   ```bash
   npm run db:generate
   ```

3. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

4. **Open Drizzle Studio**
   ```bash
   npm run db:studio
   ```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (Text, Optional)
- `created_at` (Timestamp with timezone)

### Sessions Table
- `id` (UUID, Primary Key)
- `anonymous_id` (UUID, Optional)
- `user_id` (UUID, Foreign Key to users)
- `media_url` (Text, Required)
- `media_type` (Text, Required)
- `theme` (Text, Optional)
- `caption` (Text, Optional)
- `duration_seconds` (Integer, Default: 180)
- `expires_at` (Timestamp with timezone, Required)
- `created_at` (Timestamp with timezone)
- `is_public` (Boolean, Default: true)
- `is_active` (Boolean, Default: true)

### Views Table
- `id` (Bigserial, Primary Key)
- `session_id` (UUID, Foreign Key to sessions)
- `anonymous_id` (UUID, Optional)
- `user_id` (UUID, Foreign Key to users)
- `ip_address` (Inet)
- `user_agent` (Text)
- `viewed_at` (Timestamp with timezone)

### Reactions Table
- `id` (Bigserial, Primary Key)
- `session_id` (UUID, Foreign Key to sessions)
- `anonymous_id` (UUID, Optional)
- `user_id` (UUID, Foreign Key to users)
- `emoji` (Text, Required)
- `ip_address` (Inet)
- `created_at` (Timestamp with timezone)

## Usage Examples

### Import the database client
```typescript
import { db } from './db/client';
```

### Raw queries
```typescript
import { db } from './db/client';
import { sessions } from './db/schema';
import { eq } from 'drizzle-orm';

const session = await db.select().from(sessions).where(eq(sessions.id, sessionId));
```

## Available Scripts

- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:push` - Push schema changes directly to database
- `npm run db:seed` - Seed database with sample data

## Performance Optimizations

The schema includes several indexes for optimal query performance:

- **Sessions**: User ID, Anonymous ID, Expires At, Created At, Active/Public composite
- **Views**: Session ID, Anonymous ID, User ID, Viewed At
- **Reactions**: Session ID with Created At composite
- **Users**: Username, Created At