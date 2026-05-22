# Card Slider - Database Migration Steps

## Overview
This migration adds `card_id` column to the `transactions` table to link each transaction to a specific user card (Black, Gold, or Business Plus).

## Prerequisites
- Database access (Neon)
- All users have at least one card in `user_cards` table
- No running transactions during migration

## Step-by-Step Instructions

### Step 1: Add Column
```sql
ALTER TABLE transactions 
ADD COLUMN card_id INTEGER REFERENCES user_cards(id);
```
**What it does**: Adds a new nullable column that references user_cards.id

**Expected**: No error or "column already exists" message

---

### Step 2: Populate Existing Transactions
```sql
UPDATE transactions t
SET card_id = (
  SELECT uc.id 
  FROM user_cards uc 
  WHERE uc.customer_id = (
    SELECT customer_id FROM transactions WHERE id = t.id LIMIT 1
  )
  ORDER BY uc.created_at ASC
  LIMIT 1
)
WHERE card_id IS NULL;
```
**What it does**: Assigns each existing transaction to the user's first (primary) card

**Expected**: Updates N rows (where N = total transactions)

---

### Step 3: Make Card ID Required
```sql
ALTER TABLE transactions 
ALTER COLUMN card_id SET NOT NULL;
```
**What it does**: Prevents future NULL values - all new transactions must have a card_id

**Expected**: No error (all rows should have card_id from Step 2)

---

### Step 4: Create Performance Indexes
```sql
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_card_id_created ON transactions(card_id, created_at DESC);
```
**What it does**: Speeds up queries filtering by card_id

**Expected**: No error or "already exists" message

---

## Verification (Run After Migration)

### Check Total Transactions
```sql
SELECT COUNT(*) as total_transactions FROM transactions;
```
Expected: Should match your existing transaction count

---

### Check All Have card_id
```sql
SELECT COUNT(*) as with_card_id, COUNT(CASE WHEN card_id IS NULL THEN 1 END) as without_card_id 
FROM transactions;
```
Expected: with_card_id = total, without_card_id = 0

---

### Check Distribution
```sql
SELECT 
  uc.card_type,
  COUNT(t.id) as transaction_count
FROM transactions t
JOIN user_cards uc ON t.card_id = uc.id
GROUP BY uc.card_type
ORDER BY transaction_count DESC;
```
Expected: See distribution of transactions across card types

---

### Check Indexes Created
```sql
SELECT * FROM pg_indexes 
WHERE tablename = 'transactions' 
AND indexname LIKE '%card_id%';
```
Expected: 2 indexes (idx_transactions_card_id, idx_transactions_card_id_created)

---

## Rollback (If Needed)

If something goes wrong, revert with:

```sql
-- Drop indexes
DROP INDEX IF EXISTS idx_transactions_card_id_created;
DROP INDEX IF EXISTS idx_transactions_card_id;

-- Remove NOT NULL constraint
ALTER TABLE transactions 
ALTER COLUMN card_id DROP NOT NULL;

-- Remove column
ALTER TABLE transactions 
DROP COLUMN card_id;
```

---

## Testing After Migration

1. Visit `/mycabinet` page
2. You should see a card slider (if you had at least one card)
3. Click dots to switch between cards (if user has multiple cards)
4. Transaction list updates when you switch cards
5. All transactions show on the appropriate card

---

## Common Issues & Solutions

### Issue: "column 'card_id' already exists"
**Solution**: The column was already added. Skip to Step 3.

### Issue: Update query runs very long
**Solution**: It's normal for large transaction tables. Wait for completion.

### Issue: "violates foreign key constraint"
**Solution**: Some transactions don't have valid customer_id. Check data integrity first.

### Issue: Page still shows no transactions after migration
**Solution**: 
- Clear browser cache
- Restart dev server
- Check that DATABASE_URL is set correctly

---

## Timeline

| Step | Approx Time | Risk |
|------|-------------|------|
| 1. Add column | < 1s | Low |
| 2. Populate | 10-30s | Medium |
| 3. NOT NULL | < 1s | Medium |
| 4. Create indexes | 5-10s | Low |
| **Total** | **< 1 min** | **Medium** |

**Recommendation**: Run during low-traffic time or maintenance window.

---

## After Successful Migration

- Frontend code is already deployed ✅
- Card Slider component ready to use ✅
- Transaction API endpoint ready ✅
- New transaction creation will auto-assign to current card ✅

The application is now fully functional!
