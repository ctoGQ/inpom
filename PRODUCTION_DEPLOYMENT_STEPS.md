# Production Deployment Steps for Shop Marketplace

## Current Status
- ✅ Code fixes committed and pushed to GitHub (commit acc856b)
- ✅ Local build passes (39 routes)
- ⏳ Waiting for Vercel auto-redeploy from GitHub
- ❌ Database not initialized on production
- ❌ Shop functionality blocked by missing database tables

## Required Steps for Production

### Step 1: Verify Vercel Deployment
**Timeline**: Automatic (usually 2-5 minutes after git push)

1. Check Vercel Dashboard: https://vercel.com/ctoGQ/inpom
2. Wait for deployment to complete
3. Verify: https://www.lummetra.com/api/shop/products now returns 503 with helpful message (not 500)
4. Browser console: Verify "Filter is not defined" error is gone

### Step 2: Initialize Database on Production Neon
**Timeline**: ~5-10 minutes

1. Open Neon Dashboard: https://console.neon.tech
2. Select production database for www.lummetra.com
3. Open SQL Editor
4. Execute migration script: Copy entire content from `/scripts/migration_shop_marketplace.sql`
   - Paste into Neon SQL Editor
   - Run all queries
5. Wait for completion (watch for errors)

**Expected Output**:
- 9 tables created: shop_categories, shop_products, shop_product_images, etc.
- 10 categories pre-loaded (Ukrainian)
- Indexes created
- Trigger functions created

### Step 3: Verify Database Migration Success
**Timeline**: ~2 minutes

In Neon SQL Editor, run verification queries:

```sql
-- Check tables exist
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'shop_%';

-- Should return: 9

-- Check categories loaded
SELECT COUNT(*) as category_count FROM shop_categories;

-- Should return: 10

-- Verify indexes
SELECT COUNT(*) as index_count FROM pg_indexes 
WHERE tablename LIKE 'shop_%' AND schemaname = 'public';

-- Should return: 20+
```

### Step 4: Test Shop API Endpoints
**Timeline**: ~5 minutes

1. Open browser console (F12)
2. Navigate to: https://www.lummetra.com/api/shop/categories
   - Should return JSON array with 10 categories
3. Navigate to: https://www.lummetra.com/api/shop/products?page=1&limit=12&sortBy=newest
   - Should return JSON with empty products array (no products yet) and pagination info
   - Should NOT return 500 error

### Step 5: Test Shop UI
**Timeline**: ~5 minutes

1. Visit: https://www.lummetra.com/shop
   - Page should load without console errors
   - Should show "Товари не знайдені" (Products not found) message
   - Category dropdown should work
   - Search bar should work (even if no results)

### Step 6: Test Product Creation (Optional)
**Timeline**: ~10 minutes

1. Login to: https://www.lummetra.com/auth/signin
2. Navigate to: https://www.lummetra.com/mycabinet/shop
   - Should show empty state
3. Click "Додати товар" (Add Product) button
4. Navigate to: https://www.lummetra.com/mycabinet/shop/create
5. Fill in form:
   - Title: "Test Product"
   - Category: Select any category
   - Price: "99.99"
   - Description: "Test"
   - Stock: "10"
6. Click "Створити товар" (Create Product)
7. Verify: Product appears in seller dashboard and public shop page

## Troubleshooting

### Problem: Still getting 500 error on /api/shop/products

**Solution**:
1. Check Vercel deployment completed (acc856b is deployed)
2. Check DATABASE_URL is set in Vercel environment variables
3. Check migration was executed on Neon database
4. Check Vercel function logs for detailed error

### Problem: Products appear but missing images

**Solution**:
1. Ensure BLOB_READ_WRITE_TOKEN is set in Vercel environment variables
2. Value should be from: https://vercel.com/account/storage

### Problem: Categories not loading

**Solution**:
1. Run verification query in Neon: `SELECT COUNT(*) FROM shop_categories;`
2. If 0, re-run migration script
3. If error when inserting: check unique constraint on category slug

## Environment Variables Needed on Vercel

```
DATABASE_URL=postgresql://user:password@...  # Neon connection string
BLOB_READ_WRITE_TOKEN=...                    # For image uploads
```

Both should be set in Vercel project settings:
https://vercel.com/ctoGQ/inpom/settings/environment-variables

## Files Reference

- Migration script: `/scripts/migration_shop_marketplace.sql` (402 lines)
- API endpoint: `/app/api/shop/products/route.ts`
- Shop page: `/app/shop/page.tsx`
- Seller dashboard: `/app/mycabinet/shop/page.tsx`
- Product creation: `/app/mycabinet/shop/create/page.tsx`

## Success Criteria

- [ ] /api/shop/categories returns 10 categories (no error)
- [ ] /api/shop/products returns empty array (no 500 error)
- [ ] /shop page loads and displays empty state
- [ ] Category filter works
- [ ] Search bar works
- [ ] /mycabinet/shop/create page accessible when logged in
- [ ] Can create test product
- [ ] Product appears in both seller dashboard and public shop
- [ ] Product detail page (/shop/[id]) loads correctly
- [ ] Wishlist button works
- [ ] Review submission works

## Estimated Total Time: 30-45 minutes

1. Vercel deploy: 5 min
2. Database migration: 5 min
3. Verification: 5 min
4. Testing: 15-20 min
5. Troubleshooting (if needed): 0-10 min

---

**Last Updated**: Session when fixing Filter error and API handling
**Next Update**: After verifying production deployment
