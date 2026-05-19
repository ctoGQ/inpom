# Onboarding Questionnaire System - Integration Guide

## 📋 Overview

Comprehensive onboarding questionnaire system for collecting user profile information during registration/signin flow. Collects 10 questions across 5 categories:
- **Interests** (2 questions) - Professional interests and current role
- **Motivation** (2 questions) - Reason for joining, community engagement
- **Business Goals** (2 questions) - Business objectives and skill development
- **Personal Goals** (2 questions) - Personal goals and life values
- **Vision** (2 questions) - Impact vision and women's empowerment ideas

## 🗄️ Database Setup

### Step 1: Run SQL Migration

Execute the migration script on your Neon database:

```bash
# Option 1: Using psql CLI
psql $DATABASE_URL < scripts/migration_onboarding_questionnaire.sql

# Option 2: Using Vercel dashboard - copy-paste the SQL from:
# scripts/migration_onboarding_questionnaire.sql
```

### Step 2: Verify Tables Created

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'onboarding_%' OR table_name LIKE 'customer_onboarding%';

-- Should return:
-- - onboarding_questions
-- - customer_onboarding_responses
```

### Step 3: Optional - Add Customer Columns

If you want to track onboarding completion at the customer level:

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- Create index for queries
CREATE INDEX idx_customers_onboarding_completed ON customers(onboarding_completed);
```

## 🔧 Integration Steps

### Step 1: Add Onboarding Page to Registration Flow

Modify your signup completion to redirect to onboarding:

```typescript
// In your signin/signup completion handler
export default async function SignupAction(formData: FormData) {
  // ... existing signup logic ...
  
  // After successful registration
  redirect('/auth/onboarding');
}
```

### Step 2: Optional - Conditionally Show Based on Completion

```typescript
// Modify app/auth/signin/page.tsx or app/auth/signup/page.tsx
const customer = await getSessionCustomer();

if (customer && !customer.onboarding_completed) {
  redirect('/auth/onboarding');
}
```

### Step 3: Add Navigation Link

```typescript
// In cabinet navigation or account menu
<Link href="/auth/onboarding">
  Retake Onboarding Survey
</Link>
```

## 📊 Database Schema

### `onboarding_questions` Table
- **id** - Primary key
- **question_number** - 1-10 (unique)
- **question_text** - Question in Ukrainian
- **answer_option_1, _2, _3** - Answer choices
- **category** - 'interests' | 'motivation' | 'business' | 'personal' | 'vision'

### `customer_onboarding_responses` Table
- **id** - Primary key
- **customer_id** - Foreign key to customers table (unique, one response per customer)
- **question_1_answer through question_10_answer** - Selected answers
- **completed_at** - Timestamp when submitted
- **created_at, updated_at** - Audit timestamps

## 🎯 API Endpoints

### GET /api/onboarding/questions
Fetch all questions and answer options.

**Response:**
```json
[
  {
    "id": 1,
    "question_number": 1,
    "question_text": "Яка сфера вас найбільш цікавить...",
    "answer_option_1": "Технології, IT та інновації",
    "answer_option_2": "Бізнес, менеджмент та лідерство",
    "answer_option_3": "Освіта, соціальна робота та НГО",
    "category": "interests"
  },
  // ... more questions
]
```

### POST /api/onboarding/submit
Save customer's questionnaire responses.

**Request:**
```json
{
  "customerId": 123,
  "answers": {
    "1": "Технології, IT та інновації",
    "2": "Власна справа / підприємство",
    "3": "Розширити мережу контактів...",
    // ... all 10 answers
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Responses saved successfully",
  "customerId": 123
}
```

### GET /api/onboarding/responses
Fetch current user's saved responses.

**Response:**
```json
{
  "completed": true,
  "id": 1,
  "customer_id": 123,
  "question_1_answer": "Технології, IT та інновації",
  "question_2_answer": "Власна справа / підприємство",
  // ... all answers
  "completed_at": "2026-05-19T10:30:00Z",
  "created_at": "2026-05-19T10:30:00Z"
}
```

## 🎨 UI Component

### OnboardingQuestionnaire Component

Located at: `components/cabinet/onboarding-questionnaire.tsx`

**Props:**
- `customerId` (number, required) - Customer ID for saving responses
- `onComplete` (function, optional) - Callback when questionnaire is completed
- `onSkip` (function, optional) - Callback when user skips questionnaire

**Features:**
- Progress bar showing completion percentage
- Category badges for question classification
- Radio button selection interface
- Previous/Next navigation
- Submit and Skip buttons
- Form validation (all questions required)
- Loading and error states
- Toast notifications for feedback

**Usage:**
```tsx
<OnboardingQuestionnaire
  customerId={123}
  onComplete={() => navigate('/mycabinet')}
  onSkip={() => navigate('/mycabinet')}
/>
```

## 📈 Analytics & Querying

### Get Summary of All Responses

```sql
SELECT 
  question_number,
  COUNT(*) as total_responses,
  COUNT(DISTINCT customer_id) as unique_respondents
FROM customer_onboarding_responses
CROSS JOIN LATERAL jsonb_array_elements(
  to_jsonb(ARRAY[
    question_1_answer, question_2_answer, question_3_answer,
    question_4_answer, question_5_answer, question_6_answer,
    question_7_answer, question_8_answer, question_9_answer,
    question_10_answer
  ])
) WITH ORDINALITY AS q(answer, number)
WHERE answer IS NOT NULL
GROUP BY question_number
ORDER BY question_number;
```

### Get Most Popular Answer to Specific Question

```sql
SELECT 
  question_1_answer as answer,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM customer_onboarding_responses
WHERE question_1_answer IS NOT NULL
GROUP BY question_1_answer
ORDER BY count DESC;
```

### Get Completion Rate

```sql
SELECT 
  COUNT(*) as total_customers,
  COUNT(CASE WHEN onboarding_completed THEN 1 END) as completed,
  ROUND(
    COUNT(CASE WHEN onboarding_completed THEN 1 END) * 100.0 / 
    COUNT(*), 1
  ) as completion_rate
FROM customers;
```

## 🔐 Security Considerations

✅ **Implemented:**
- Session-based authentication check
- Customer can only submit their own responses
- SQL injection protection via parameterized queries
- Validation of all inputs
- Error details hidden in production

## 🚀 Deployment Checklist

- [ ] Execute SQL migration on production Neon database
- [ ] Verify tables created and data loaded correctly
- [ ] Test onboarding flow in development environment
- [ ] Verify API endpoints working correctly
- [ ] Test form validation and error handling
- [ ] Set up monitoring for API errors
- [ ] Deploy to production (commit and push changes)
- [ ] Test full flow in production
- [ ] Monitor completion rate and analytics

## 📝 Future Enhancements

- [ ] Add conditional branching based on answers
- [ ] Implement survey results analysis dashboard
- [ ] Add matching algorithm for networking
- [ ] Create downloadable user profile summary
- [ ] Add A/B testing for different question sets
- [ ] Implement multi-language support
- [ ] Add resume/continue functionality for incomplete surveys
- [ ] Integrate with CRM/marketing automation

## 🐛 Troubleshooting

### Questions not loading
- Verify migration was executed successfully
- Check database connection
- Review API logs for errors

### Submit failing
- Ensure all 10 questions are answered
- Check user session is valid
- Verify customer_id matches authenticated user

### UI not rendering
- Clear browser cache
- Verify component imports are correct
- Check for JavaScript errors in console

---

For questions or issues, refer to the conversation context or check the implementation in:
- `scripts/migration_onboarding_questionnaire.sql` - Database schema
- `components/cabinet/onboarding-questionnaire.tsx` - UI Component
- `app/api/onboarding/*` - API endpoints
- `app/auth/onboarding/page.tsx` - Onboarding page
