# Vercel Blob Configuration

## Environment Variables Required

### Local Development (.env.local)
```
BLOB_READ_WRITE_TOKEN=your_token_here
```

### Production (Vercel Dashboard)
1. Go to your Vercel project settings
2. Navigate to Settings → Environment Variables
3. Add new variable: `BLOB_READ_WRITE_TOKEN`
4. Get token from: https://vercel.com/account/stores/blob

## Setup Steps

1. **Create Vercel Blob Store**
   - Visit https://vercel.com/account/stores/blob
   - Create a new Blob store for your project
   - Copy the auth token

2. **Local Development**
   - Add `BLOB_READ_WRITE_TOKEN` to `.env.local` file
   - Restart dev server: `npm run dev`

3. **Production Deployment**
   - Add `BLOB_READ_WRITE_TOKEN` to Vercel dashboard
   - Redeploy your project

## Avatar Upload Endpoint

- **POST** `/api/auth/avatar`
  - Upload avatar image for authenticated user
  - Request: FormData with `file` field (image only, max 5MB)
  - Response: `{ success: true, avatar_url: string }`

- **DELETE** `/api/auth/avatar`
  - Delete user's avatar
  - Response: `{ success: true, message: string }`

## Troubleshooting

### 500 Error on Upload
- Check if `BLOB_READ_WRITE_TOKEN` is set
- Check browser console for detailed error message (development only)
- Verify image file type and size

### Avatar Not Saving
- Check that `avatar_url` column exists in `customers` table
- Run migration: `scripts/migration_add_avatar_pincode.sql`

### Blob URL Not Accessible
- Ensure Blob access is set to 'public'
- Wait a few seconds for CDN propagation
