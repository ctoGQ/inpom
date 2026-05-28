# Withdrawal System Setup Guide

## Overview
This guide explains how to set up the withdrawal system for Inpom. The withdrawal system allows users to transfer funds from their cards to external bank accounts via bank transfer (IBAN) or card-to-card transfers.

## Database Migration

### Create Withdrawals Table

Run this SQL script in your Neon PostgreSQL database:

```sql
-- Create withdrawals table for tracking withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawals (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Recipient info
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  
  -- Withdrawal method
  withdrawal_type VARCHAR(50) NOT NULL CHECK (withdrawal_type IN ('card', 'iban')),
  
  -- Bank details (for IBAN method)
  iban VARCHAR(255),
  bank_name VARCHAR(255),
  swift_code VARCHAR(50),
  
  -- Card details (for Card method)
  card_number VARCHAR(255),
  card_expiry VARCHAR(10),
  
  -- Transaction details
  amount DECIMAL(18, 8) NOT NULL CHECK (amount > 0),
  platform_fee DECIMAL(18, 8) NOT NULL DEFAULT 0,
  total_amount DECIMAL(18, 8) NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  error_message TEXT
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_withdrawals_customer_id ON withdrawals(customer_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_card_id ON withdrawals(card_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);
```

### How to Run Migration

#### Option 1: Using Neon Console
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project and database
3. Go to SQL Editor
4. Copy and paste the SQL script above
5. Execute the query

#### Option 2: Using Node.js Script
```bash
node scripts/run-migration-withdrawals.mjs
```

#### Option 3: Using psql CLI
```bash
psql -h [neon-host] -U [user] -d [database] < migrations/004_create_withdrawals_table.sql
```

## Frontend Components

### Pages
- **`/mycabinet/withdraw`** - Main withdrawal form page

### Components
- **`WithdrawForm`** - Client component for withdrawal form
  - Location: `components/cabinet/withdraw-form.tsx`
  - Features:
    - Tabs for selecting withdrawal method (Card/IBAN)
    - Personal information input (first name, last name)
    - Amount input with quick preset buttons
    - Commission calculation (20%)
    - Method-specific fields:
      - **Card**: Card number, expiry date
      - **IBAN**: IBAN, bank name, Swift code
    - Optional notes field
    - Validation and error handling

## API Endpoints

### POST `/api/withdrawals`
Create a new withdrawal request.

**Request Body:**
```json
{
  "cardId": 123,
  "customerId": 456,
  "withdrawType": "card" | "iban",
  "amount": 100.00,
  "commission": 20.00,
  "firstName": "John",
  "lastName": "Doe",
  "cardNumber": "4111111111111111",     // required if withdrawType='card'
  "cardExpiry": "12/25",                // required if withdrawType='card'
  "iban": "DE89370400440532013000",     // required if withdrawType='iban'
  "bankName": "Deutsche Bank",          // required if withdrawType='iban'
  "swiftCode": "DEUTDEDBBER",           // required if withdrawType='iban'
  "notes": "Optional notes"
}
```

**Response:**
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

## Withdrawal Flow

1. **User selects withdrawal method:**
   - Card: User enters card number and expiry date
   - IBAN: User enters IBAN, bank name, and Swift code

2. **Commission calculation:**
   - Platform fee: 20% of withdrawal amount
   - User receives: amount - commission

3. **Balance deduction:**
   - Total amount (withdrawal + commission) is deducted from user's card balance
   - Transaction record is created automatically

4. **Status tracking:**
   - `pending` - Withdrawal request created
   - `processing` - Being processed by payment provider
   - `completed` - Successfully transferred
   - `failed` - Transfer failed
   - `cancelled` - User cancelled the withdrawal

## Configuration

### Commission Percentage
Currently set to 20%. To change:
1. Update `COMMISSION_PERCENT` in `components/cabinet/withdraw-form.tsx`
2. Update documentation

### Validation Rules
- Minimum amount: 0 (configurable per business needs)
- Maximum amount: User's available balance
- Required fields:
  - First name, Last name
  - Withdrawal method-specific fields
  - User agreement checkbox

## Testing

### Local Testing
1. Create a test user with a card
2. Add balance to the card
3. Navigate to `/mycabinet?cardId=<card_id>`
4. Click "ВИВЕСТИ" button
5. Fill in the withdrawal form
6. Submit and check database records

### Database Verification
```sql
-- Check withdrawals
SELECT * FROM withdrawals WHERE customer_id = <customer_id>;

-- Check card balance after withdrawal
SELECT id, card_type, balance FROM user_cards WHERE customer_id = <customer_id>;

-- Check transactions
SELECT * FROM transactions WHERE customer_id = <customer_id> AND type = 'withdraw';
```

## Security Considerations

1. **Card Data Encryption:**
   - In production, card numbers should be encrypted before storage
   - Consider using payment gateway tokens instead of storing card data

2. **IBAN Validation:**
   - Implement IBAN format validation
   - Consider using a third-party IBAN validation service

3. **KYC/AML:**
   - Implement user verification
   - Set withdrawal limits based on user verification level
   - Log all withdrawal attempts

4. **Authentication:**
   - All withdrawal requests must be authenticated
   - Use session tokens to verify user identity

## Troubleshooting

### Common Issues

**Issue:** "Card not found" error
- Check that card belongs to current user
- Verify card_id is correct

**Issue:** "Insufficient balance" error
- User's balance must be >= withdrawal amount + commission (20%)
- Check current balance in database

**Issue:** Migration fails
- Ensure table doesn't already exist
- Check database permissions
- Verify column types are compatible with your schema

## Future Enhancements

1. **Webhook Integration:**
   - Add payment provider webhooks for status updates
   - Automatically update withdrawal status

2. **Email Notifications:**
   - Send confirmation emails
   - Send completion/failure notifications

3. **Admin Panel:**
   - Manual status updates
   - Withdrawal analytics
   - Fraud detection

4. **Rate Limiting:**
   - Daily withdrawal limits
   - Multiple withdrawal attempts throttling

5. **Bank Integration:**
   - Direct integration with banks
   - Automatic fund transfer
   - Real-time balance verification
