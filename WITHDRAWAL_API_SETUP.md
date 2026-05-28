# Withdrawals API Fix & Migration Setup

## Issues Fixed

### 1. API Error Handling
- ✅ Added comprehensive logging to `POST /api/withdrawals`
- ✅ Better validation with detailed error messages
- ✅ Proper parsing of numeric values (cardId, customerId)
- ✅ Console logging for debugging

### 2. Transaction Enrichment
- ✅ Added 'withdraw' type handling in `getRecentTransactionsByCard()`
- ✅ Added 'withdraw' type handling in `GET /api/transactions`
- ✅ Withdraw transactions now display as "Вивід" in activity section

### 3. Error Messages
- ✅ Form now logs API errors to console
- ✅ Better error feedback to user via toast notifications
- ✅ Development mode shows detailed error messages

## Database Migration Setup

### Prerequisites
- Access to Neon database console
- .env.local file with DATABASE_URL

### Option 1: Using Neon Console (Recommended)

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Select your project and database
3. Navigate to SQL Editor
4. Copy and paste the content from `migrations/004_create_withdrawals_table.sql`
5. Execute the query

### Option 2: Using Migration Script

```bash
# Make sure .env.local is configured
node scripts/run-migration-withdrawals.mjs
```

### Option 3: Manual with psql

```bash
psql postgresql://[user]:[password]@[host]/[database] < migrations/004_create_withdrawals_table.sql
```

## Verifying the Migration

After migration, verify the table was created:

```sql
-- Check if withdrawals table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'withdrawals';

-- Check table structure
\d withdrawals

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = 'withdrawals';
```

## Testing Withdrawal Flow

1. **Navigate to withdrawal page:**
   - Go to `/mycabinet`
   - Click "ВИВЕСТИ" button on card

2. **Fill form:**
   - Select withdrawal method (Card or IBAN)
   - Enter personal info
   - Enter amount
   - Select recipient details
   - Check agreement
   - Click submit

3. **Verify results:**
   - Check console for API logs: `[Withdrawals API]` messages
   - Verify success toast appears
   - Page should redirect to `/mycabinet/transactions`
   - Balance should be deducted
   - Transaction should appear in activity section

4. **Check database:**
```sql
-- See withdrawals
SELECT * FROM withdrawals ORDER BY created_at DESC LIMIT 5;

-- See related transactions
SELECT * FROM transactions WHERE type = 'withdraw' ORDER BY created_at DESC LIMIT 5;

-- Verify balance deduction
SELECT id, card_type, balance FROM user_cards ORDER BY id;
```

## Common Issues & Solutions

### Issue: "Card not found" error
**Solution:** Ensure card belongs to current user
```sql
SELECT * FROM user_cards WHERE customer_id = [customer_id];
```

### Issue: "Insufficient balance" error
**Solution:** Balance must be >= amount + 20% commission
- Example: To withdraw 100, need 120 balance (100 + 20 commission)

### Issue: API returns 400
**Check:**
1. Console logs for field validation errors
2. Ensure customerId is number (not string)
3. Verify amount is valid float
4. Check withdrawType is 'card' or 'iban'

### Issue: Transaction not appearing
**Check:**
1. Transaction was created: `SELECT * FROM transactions WHERE type = 'withdraw'`
2. Card ID matches: `SELECT * FROM transactions WHERE card_id = [card_id]`
3. Activity enrichment working: Check API response in Network tab

## API Response Examples

### Success Response (200)
```json
{
  "success": true,
  "message": "Withdrawal request created successfully",
  "withdrawal": {
    "id": 1,
    "status": "pending",
    "amount": 100.00,
    "commission": 20.00,
    "totalDeducted": 120.00
  }
}
```

### Error Response (400)
```json
{
  "error": "Missing required fields"
}
```

### Error Response (404)
```json
{
  "error": "Card not found"
}
```

### Error Response (500) - Development
```json
{
  "error": "Error message",
  "details": "Full error stack trace"
}
```

## Environment Variables

Ensure `.env.local` has:
```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
```

## Next Steps

1. ✅ Create database migration
2. ✅ Setup API error handling
3. ✅ Add transaction enrichment
4. ⏳ Execute migration in Neon
5. ⏳ Test withdrawal flow
6. ⏳ Monitor logs for issues

## Debugging

### Enable detailed logging:
```javascript
// In app/api/withdrawals/route.ts
console.log('[Withdrawals API] Request:', body);
console.log('[Withdrawals API] Parsed values:', { cardIdNum, customerIdNum, amountNum });
```

### Check API calls in browser:
1. Open DevTools (F12)
2. Go to Network tab
3. Try withdrawal
4. Click POST request to `/api/withdrawals`
5. Check request/response in Console

### View logs locally:
```bash
npm run dev
# Watch terminal for [Withdrawals API] messages
```
