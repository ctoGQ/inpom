# Database Migration Guide - Card Slider Implementation

## Overview

The Card Slider UI now supports multiple cards per user with separate transaction histories. To enable this feature, the `transactions` table must be updated to track which card each transaction belongs to.

## Migration Steps

### Step 1: Add card_id Column

```sql
ALTER TABLE transactions 
ADD COLUMN card_id INTEGER REFERENCES user_cards(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
```

### Step 2: Populate Existing Data

For existing transactions, link them to the user's primary (first) card:

```sql
-- For each transaction, find the customer and link to their first card
UPDATE transactions 
SET card_id = (
  SELECT u.id 
  FROM user_cards u 
  WHERE u.customer_id = (
    SELECT i.creator_customer_id 
    FROM invoices i 
    WHERE i.id = transactions.invoice_id 
    LIMIT 1
  )
  ORDER BY u.created_at ASC
  LIMIT 1
);

-- Alternative: If transactions have direct customer_id reference
UPDATE transactions 
SET card_id = (
  SELECT id 
  FROM user_cards 
  WHERE customer_id = transactions.customer_id
  ORDER BY created_at ASC
  LIMIT 1
);
```

### Step 3: Add NOT NULL Constraint (Optional)

Once all transactions have card_id values:

```sql
ALTER TABLE transactions 
ALTER COLUMN card_id SET NOT NULL;
```

## Testing

### Verify Migration

```sql
-- Check if card_id is populated
SELECT COUNT(*) as total_transactions, 
       COUNT(card_id) as with_card_id,
       COUNT(*) - COUNT(card_id) as without_card_id
FROM transactions;

-- Sample data
SELECT id, card_id, amount, description, created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 10;
```

### Test Transactions API

```bash
# Get transactions for a specific card
curl "http://localhost:3000/api/transactions?cardId=1&limit=5"

# Expected response:
{
  "transactions": [
    {
      "id": 123,
      "type": "deposit",
      "amount": 100.00,
      "description": "Deposit",
      "created_at": "2024-05-22T10:30:00Z",
      "invoice_id": null
    }
  ],
  "count": 1
}
```

## Rollback Plan

If you need to revert the migration:

```sql
-- Drop the index
DROP INDEX IF EXISTS idx_transactions_card_id;

-- Remove the column
ALTER TABLE transactions DROP COLUMN card_id;
```

## Important Notes

1. **Foreign Key Constraint**: The `card_id` has `ON DELETE CASCADE`, which means if a card is deleted, all its transactions will also be deleted. Be careful with card deletion operations.

2. **Backward Compatibility**: The current code handles NULL `card_id` values gracefully in case the migration is incomplete.

3. **Performance**: The new index on `card_id` will improve query performance for transaction filtering.

4. **Multi-card Support**: Once this migration is complete, users can have multiple cards (Black, Gold, Business Plus) with separate transaction histories.

## Schema After Migration

```sql
-- Transactions table structure
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE,
  type VARCHAR(50),
  amount DECIMAL(10, 2),
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  invoice_id INTEGER,
  customer_id INTEGER, -- May still exist for legacy reasons
  INDEX idx_transactions_card_id (card_id),
  INDEX idx_transactions_created_at (created_at DESC)
);
```

## Next Steps

1. Run the SQL migration scripts in your database
2. Verify data integrity with the testing queries
3. Deploy the updated application code
4. Test the card slider UI with live transaction data

## Support

If you encounter issues during migration:

1. Check `/CARD_SLIDER_IMPLEMENTATION.md` for component documentation
2. Review `/app/api/transactions/route.ts` for API implementation
3. Check database logs for constraint violations
4. Verify card relationships: `SELECT * FROM user_cards;`
