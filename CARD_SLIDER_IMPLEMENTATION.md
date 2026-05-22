# Card Slider Implementation

## Overview

Реализован новый дизайн страницы `/mycabinet` с поддержкой множественных карт и интерактивным слайдером с Framer Motion анимациями.

## Components Created

### 1. CardSlider (`card-slider.tsx`)
- **Purpose**: Displays the main card carousel with balance and card type
- **Features**:
  - Framer Motion animations
  - Gradient backgrounds per card type (Black, Gold, Business Plus)
  - Pagination dots for navigation
  - Swipeable interface (ready for gesture support)
  - iOS-style design

### 2. QuickActions (`quick-actions.tsx`)
- **Purpose**: Three dark action buttons below the card
- **Actions**:
  - ДЕПОЗИТ (Deposit) - Arrow Down
  - ІНВОЙС (Invoice) - Banknote
  - ВИВЕСТИ (Withdraw) - Arrow Up
- **Features**:
  - Framer Motion hover effects
  - Staggered animation on mount
  - Links to corresponding pages

### 3. ActivitySection (`activity-section.tsx`)
- **Purpose**: Displays recent transactions for the selected card
- **Features**:
  - Dynamic transaction list filtered by card_id
  - Transaction icons based on type
  - Color-coded amounts (green for incoming, red for outgoing)
  - Date formatting with relative time (e.g., "2 days ago")
  - Empty state when no transactions

### 4. CardSliderWrapper (`card-slider-wrapper.tsx`)
- **Purpose**: Client component managing state for card switching
- **Features**:
  - Manages selected card ID
  - Fetches transactions when card changes
  - Loading skeleton UI
  - Combines all three components

## Database Schema

The implementation assumes the following schema structure:

```sql
-- Cards table
CREATE TABLE user_cards (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  card_type VARCHAR(50), -- 'Black', 'Gold', 'Business Plus'
  balance DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, card_type)
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES user_cards(id),
  type VARCHAR(50),
  amount DECIMAL(10, 2),
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  invoice_id INTEGER
);
```

## Card Type Gradients

- **Black Card**: Coral → Yellow (`from-red-300 via-orange-300 to-yellow-300`)
- **Gold Card**: Orange → Gold (`from-orange-300 via-yellow-300 to-amber-300`)
- **Business Plus**: Purple → Pink (`from-purple-300 via-pink-300 to-rose-300`)

## API Endpoint

### GET `/api/transactions?cardId={id}&limit={count}`
Fetches transactions for a specific card

**Parameters:**
- `cardId` (required): Card ID
- `limit` (optional): Number of transactions (default: 20)

**Response:**
```json
{
  "transactions": [...],
  "count": 0
}
```

## Page Structure

```
MyCabinet Page (Server Component)
├── CabinetLayout
│   ├── MobileTopNav
│   ├── CardSliderWrapper (Client Component)
│   │   ├── CardSlider
│   │   ├── QuickActions
│   │   └── ActivitySection
│   ├── Logout Form
│   └── MobileBottomNav
```

## Animations

All animations use iOS-optimized easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`

- **Card appearance**: 400ms slide-up
- **Pagination dots**: Click to switch cards with dot morphing
- **Transactions list**: Staggered 300ms animations
- **Buttons**: 150ms scale on hover/tap

## State Management

The `CardSliderWrapper` manages:
1. `selectedCardId`: Currently selected card
2. `transactions`: Filtered transactions for current card
3. `isLoading`: Loading state during fetch

Changes to `selectedCardId` trigger an API call to fetch new transactions.

## Responsive Design

- Mobile-first design with iOS-style touch targets
- All components are responsive and mobile-optimized
- Pagination dots help with card navigation on small screens

## Next Steps (If Needed)

1. **Gesture Support**: Add swipe/drag to CardSlider for tablet/mobile
2. **Animations Enhancement**: Add card flip animation for details
3. **Real-time Updates**: Integrate WebSocket for live transaction updates
4. **Card Details Page**: Create detailed view for each card type
5. **Transaction Filters**: Add category/date filtering to ActivitySection
