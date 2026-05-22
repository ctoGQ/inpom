# Invoice Card ID Linking - May 2025

## Overview
Complete refactoring of the invoice and transaction system to properly link each invoice and transaction to specific user cards (Black/Gold/Business Plus).

## Database Changes

### Migration Script
File: `scripts/add-creator-card-id-column.sql`
- Adds `creator_card_id` column to `invoices` table
- Links invoice to the specific card on which it was created
- Supports card-specific transaction filtering

## Code Changes

### 1. Invoice Creation (`app/api/invoices/actions.ts`)
- **Function**: `createInvoice(customerId, amount, description, expiryMinutes, cardId)`
- **Changes**: Added optional `cardId` parameter
- **Database**: INSERT now includes `creator_card_id` field
- **RETURNING**: Added `creator_card_id` to returned fields

### 2. Invoice Payment (`app/api/invoices/actions.ts`)
- **Function**: `payInvoice(invoiceId, payerCustomerId)`
- **Changes**: 
  - Queries SELECT now retrieves `creator_card_id`
  - Uses `creator_card_id` when available for creator's transaction
  - Falls back to first card if `creator_card_id` is not set
  - Both payment_sent (payer) and payment_received (creator) transactions now include card_id

### 3. API Endpoints

#### POST /api/invoices (`app/api/invoices/route.ts`)
- **New requirement**: `cardId` is now required (added to validation)
- **INSERT statement**: Now includes `creator_card_id` field
- **Returns**: Includes `creator_card_id` in response

#### GET /api/transactions (`app/api/transactions/route.ts`)
- **Query filter**: Changed from `WHERE t.customer_id = ${customerId}` to `WHERE t.card_id = ${parseInt(cardId)}`
- **Purpose**: Only show transactions related to the selected card
- **Verification**: Card ownership validated before querying transactions

### 4. Component Changes

#### InvoiceForm (`components/cabinet/invoice-form.tsx`)
- **Props**: Added `cardId` to InvoiceFormProps interface
- **Parameter**: Now accepts `cardId` in component function
- **Request body**: Includes `cardId` in fetch request to /api/invoices

#### Create Invoice Page (`app/mycabinet/create-invoice/page.tsx`)
- **Card Query**: Fetches first user card from database
- **Props**: Passes both `customerId` and `cardId` to InvoiceForm
- **Fallback**: Redirects if no card found

### 5. Transaction Display

#### Main Cabinet Page (`app/mycabinet/page.tsx`)
- **Query**: Restored `WHERE t.card_id = ${cardId}` filter
- **Purpose**: Shows only transactions for the selected card
- **Result**: Activity section now displays only card-specific transactions

## Features Implemented

### Card-Specific Invoices
- Each invoice is now tied to the creator's specific card
- When paying an invoice, both payer and creator transactions are linked to their respective cards

### Card-Specific Transaction Display
- Activity section on /mycabinet shows only transactions for the selected card
- When switching cards, only that card's transactions are displayed
- Deposits and payments are properly attributed to specific cards

### Data Consistency
- All new transactions automatically include card_id
- Invoice payments create card-linked transactions for both parties
- Deposits are linked to the deposit card

## Running the Migration

Execute the migration script on Neon database:
```sql
-- From scripts/add-creator-card-id-column.sql
ALTER TABLE invoices ADD COLUMN creator_card_id INTEGER;
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_creator_card_id FOREIGN KEY (creator_card_id) REFERENCES user_cards(id);
```

## Testing Checklist

- [ ] Create new invoice from /mycabinet/create-invoice
- [ ] Verify invoice has creator_card_id set
- [ ] Pay invoice from another account
- [ ] Check both payer and creator transactions have card_id
- [ ] Switch cards on /mycabinet
- [ ] Verify Activity section shows only card-specific transactions
- [ ] Test on each card type (black, gold, business_plus)
