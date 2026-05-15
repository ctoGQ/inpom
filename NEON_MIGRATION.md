# Neon Database Migration Guide

## What Changed

This project has been successfully migrated from `@vercel/postgres` to **Neon** (via `@neondatabase/serverless`).

## Files Modified

### Core Database
- **`lib/db.ts`** (NEW) - Custom database client for Neon
  - Lazy-loads connection pool to avoid initialization errors
  - Provides `sql` template literal helper matching `@vercel/postgres` API
  - Exports `query()` function for raw SQL queries

### Authentication
- **`lib/auth.ts`** - Updated to use new db client
- **`app/api/auth/actions.ts`** - Updated signup/signin functions
- **`app/api/auth/signout/route.ts`** - Created signout endpoint
- **`app/auth/signout/page.tsx`** - Created signout page

### Middleware & Newsletter
- **`middleware.ts`** - Updated session verification with direct Pool connection
- **`app/newsletter/page.tsx`** - Updated imports to use new db client
- **`app/newsletter/[id]/page.tsx`** - Updated imports to use new db client

### Package Management
- **`package.json`** - Replaced `@vercel/postgres` with `@neondatabase/serverless`

## Environment Variables

Make sure to set `DATABASE_URL` in your project environment:

```bash
DATABASE_URL=postgresql://user:password@host/database
```

This should be your Neon database connection string from the Neon console.

## Key Differences

### Query API
The `sql` template literal function works the same way as `@vercel/postgres`:

```typescript
import { sql } from '@/lib/db';

const result = await sql`
  SELECT * FROM customers WHERE email = ${email}
`;

// Access rows with .rows
const customer = result.rows?.[0];
```

### Error Handling
All database functions gracefully handle missing DATABASE_URL:
- During build time: returns empty arrays (prevents build failures)
- During runtime with DB: works normally
- During runtime without DB: throws error (expected)

## Testing

To verify authentication works:
1. Visit `/auth/signup` to create an account
2. Visit `/auth/signin` to log in
3. Access `/mycabinet` - should work if logged in
4. Visit `/auth/signout` to log out

## Migration Notes

- Pool is created lazily to support Next.js build optimization
- All database queries use parameterized statements (prevents SQL injection)
- Session tokens are HTTP-only cookies (secure by default)
- Middleware validates sessions on every request to protected routes
