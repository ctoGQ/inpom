# Invoice System - Complete Implementation Guide

## Overview

The invoice system allows users to create payment requests (invoices) with QR codes and share them with other users for payment processing. The system handles balance management, transaction tracking, and full audit trail.

## System Components

### Database Schema

#### invoices table
```sql
- id: SERIAL PRIMARY KEY
- creator_customer_id: INTEGER - User who created the invoice
- amount: DECIMAL(12, 2) - Amount in inpom
- description: TEXT - Invoice description
- status: VARCHAR(50) - 'pending' or 'paid'
- qr_code_data: TEXT - QR code data (optional)
- created_at: TIMESTAMP - Creation timestamp
- updated_at: TIMESTAMP - Last update timestamp
- expires_at: TIMESTAMP - Invoice expiration time
```

#### user_cards table
```sql
- id: SERIAL PRIMARY KEY
- customer_id: INTEGER UNIQUE - Associated customer
- card_type: VARCHAR(50) - 'black', 'gold', 'business_plus'
- balance: DECIMAL(12, 2) - User's balance
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### transactions table
```sql
- id: SERIAL PRIMARY KEY
- customer_id: INTEGER - User making/receiving transaction
- type: VARCHAR(50) - 'payment_sent', 'payment_received', 'deposit'
- amount: DECIMAL(12, 2) - Amount
- invoice_id: INTEGER - Related invoice ID
- related_customer_id: INTEGER - Other party in transaction
- description: TEXT - Transaction description
- status: VARCHAR(50) - 'completed', 'pending'
- created_at: TIMESTAMP
```

## API Endpoints

### 1. Create Invoice
**Endpoint:** `POST /api/invoices`

**Request Body:**
```json
{
  "customerId": 1,
  "amount": 100.50,
  "description": "Payment for services",
  "expiryMinutes": 30
}
```

**Validation Rules:**
- `customerId`: Required, must be integer
- `amount`: Required, must be > 0 and ≤ 999999.99
- `description`: Required, non-empty
- `expiryMinutes`: Optional, 1-43200 (default: 30)

**Response (Success - 200):**
```json
{
  "success": true,
  "invoice": {
    "id": 123,
    "creator_customer_id": 1,
    "amount": 100.50,
    "description": "Payment for services",
    "status": "pending",
    "created_at": "2026-05-15T10:30:00Z",
    "expires_at": "2026-05-15T11:00:00Z",
    "paymentUrl": "https://app.com/mycabinet/pay-invoice/123"
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Amount must be a positive number"
}
```

### 2. Pay Invoice
**Endpoint:** `POST /api/invoices/pay`

**Request Body:**
```json
{
  "invoiceId": 123,
  "payerCustomerId": 2
}
```

**Validation Rules:**
- Both IDs required and must be valid integers
- Payer cannot be invoice creator
- Invoice must not be already paid
- Invoice must not be expired
- Payer must have sufficient balance

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "invoice": {
    "id": 123,
    "status": "paid"
  }
}
```

**Response (Error - 400 - Insufficient Balance):**
```json
{
  "error": "Insufficient balance. You need 100.50 inpom but have only 50.00 inpom",
  "code": "INSUFFICIENT_BALANCE",
  "needed": 100.50,
  "available": 50.00
}
```

**Response (Error - 400 - Expired Invoice):**
```json
{
  "error": "This invoice has expired"
}
```

**Response (Error - 400 - Own Invoice):**
```json
{
  "error": "You cannot pay your own invoice"
}
```

### 3. Get Balance
**Endpoint:** `GET /api/balance?customerId=1`

**Response (Success - 200):**
```json
{
  "balance": 1500.00,
  "cardType": "gold"
}
```

**Response (No Card - 200):**
```json
{
  "balance": 0,
  "cardType": "black"
}
```

## Frontend Components

### InvoiceForm Component
- Creates new invoices
- Validates input (amount, description)
- Shows real-time character count for description
- Displays created invoice with QR code

**Features:**
- Amount validation (positive number, max 999999.99)
- Description required field with character counter
- Expiry time selection (15 min - 1 week)
- Disabled submit button for invalid data

### InvoiceDisplay Component
- Shows invoice details with large amount display
- Renders QR code for payment
- Copy URL to clipboard button
- Download QR code as PNG
- Invoice status indicator
- Link to view in transactions

### PaymentConfirm Component
- Loads and displays payer's balance
- Shows payment confirmation summary
- Displays error messages for:
  - Insufficient funds
  - Expired invoice
  - Already paid invoice
- Loading state during payment processing
- Automatic redirect to transactions on success

## User Flow

### Creating an Invoice

1. User navigates to `/mycabinet/create-invoice`
2. Enters amount (must be > 0)
3. Enters description (required)
4. Selects expiry time
5. Clicks "Create Invoice"
6. System validates inputs
7. Creates invoice in database
8. Returns invoice with QR code and URL
9. User can:
   - Copy URL to clipboard
   - Download QR code
   - Share with payer
   - View in transactions

### Paying an Invoice

1. User receives QR code or payment URL
2. Scans QR code OR clicks payment link
3. System loads invoice details
4. Loads payer's balance
5. Shows payment confirmation with:
   - Invoice amount
   - Creator name
   - Payer's current balance
   - Error if insufficient funds
6. User confirms payment
7. System:
   - Updates invoice status to 'paid'
   - Deducts from payer's balance
   - Adds to creator's balance
   - Creates transactions for both parties
8. Shows success message
9. Redirects to transactions

## Error Handling

### User-Friendly Error Messages

**Amount Validation:**
- "Amount must be a positive number"
- "Amount exceeds maximum limit" (> 999999.99)

**Balance Errors:**
- "Insufficient balance. You need X inpom but have only Y inpom"

**Invoice Status:**
- "This invoice has already been paid"
- "This invoice has expired"
- "You cannot pay your own invoice"

**System Errors:**
- "Your card not found. Please contact support"
- "Internal server error while processing payment"

## Transaction Creation

When payment is successful, TWO transactions are created:

**For Payer:**
- Type: `payment_sent`
- Amount: Invoice amount
- Related customer: Creator ID
- Description: "Payment sent for invoice"
- Status: `completed`

**For Creator:**
- Type: `payment_received`
- Amount: Invoice amount
- Related customer: Payer ID
- Description: "Payment received from invoice"
- Status: `completed`

## Data Integrity

### Atomic Operations
- Invoice status update and balance updates are performed in sequence
- Transaction creation happens after balance updates
- All operations use SQL transactions to prevent partial updates

### Validation Points
1. Input validation (API level)
2. Business logic validation (status, expiry, balance)
3. Authorization validation (not paying own invoice)
4. Card existence check (creates if needed)

## Security Considerations

1. **User Isolation:** Users cannot access other users' invoices they didn't create
2. **Balance Protection:** Balance updates verified before transaction
3. **Expiry Protection:** Expired invoices cannot be paid
4. **Duplicate Prevention:** Paid invoices cannot be paid again
5. **Input Sanitization:** All inputs validated and type-checked

## Testing Checklist

- [ ] Create invoice with valid data
- [ ] Create invoice with invalid amount (0, negative, too large)
- [ ] Create invoice with empty description
- [ ] Pay invoice with sufficient balance
- [ ] Attempt to pay with insufficient balance
- [ ] Attempt to pay expired invoice
- [ ] Attempt to pay own invoice
- [ ] Verify transactions created for both parties
- [ ] Verify balance updates correctly
- [ ] Verify QR code generates correctly
- [ ] Verify invoice URL works for payment
- [ ] Test all error messages display correctly

## Future Enhancements

1. Invoice templates for recurring payments
2. Payment reminders/notifications
3. Invoice analytics and reporting
4. Multi-currency support
5. Batch invoice creation
6. Invoice scheduling
7. Webhook notifications for payments
8. Invoice PDF export
