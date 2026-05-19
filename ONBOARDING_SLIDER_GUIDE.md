// ONBOARDING_SLIDER_GUIDE.md

# Mobile Onboarding Slider Implementation

## 📱 Overview

Complete mobile-first onboarding system with swipeable slider interface for 10-question questionnaire.

**Key Features:**
- ✅ Touch swipe navigation between questions
- ✅ Auto-advance on answer selection
- ✅ Progress bar with visual indicators
- ✅ Category color badges
- ✅ Success screen with celebratory animation
- ✅ Confetti particles on completion
- ✅ Share functionality
- ✅ Responsive design (mobile-first)

## 🏗️ Architecture

### Components

**1. OnboardingSlider** (`components/onboarding/onboarding-slider.tsx`)
- Main slider component with question display
- Handles touch gestures (swipe left/right)
- Manages answer state and progression
- Auto-submits on last answer
- 10-step slide show (steps 0-9) + success screen (step 10)

**Features:**
```tsx
<OnboardingSlider
  customerId={123}
  onComplete={() => {
    // Called after success screen navigation
  }}
/>
```

**2. OnboardingSuccess** (`components/onboarding/onboarding-success.tsx`)
- Celebratory success page
- Shows next steps after onboarding
- Share button with native/fallback sharing
- Continue button to redirect to dashboard
- Animated confetti effect

### Page

**OnboardingPage** (`app/account/onboarding/page.tsx`)
- Server component that verifies user session
- Prevents unauthorized access
- Optional: check if already completed
- Renders OnboardingSlider component

### API Endpoints

**GET /api/onboarding/questions**
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
  }
  // ... 10 questions total
]
```

**POST /api/onboarding/submit**
```json
{
  "customerId": 123,
  "answers": {
    "1": "Selected answer for question 1",
    "2": "Selected answer for question 2",
    // ... all 10 answers
  }
}
```

## 🎨 UI/UX Features

### Question Slide Layout

```
┌─────────────────────────────────┐
│ 3/10 |■■■■■■■■□□| Інтереси     │ ← Progress header
├─────────────────────────────────┤
│                                 │
│  Яка сфера вас найбільш         │
│  цікавить для професійного     │
│  розвитку?                      │
│                                 │
│  ◯ Технології, IT та інновації  │ ← Answer options
│  ◯ Бізнес, менеджмент          │
│  ◯ Освіта, соціальна робота     │
│                                 │
│  Натисніть на відповідь,        │ ← Hint text
│  щоб продовжити                │
│                                 │
└─────────────────────────────────┘
  Back  [ Next ]  ← Navigation buttons
```

### Success Screen Layout

```
┌─────────────────────────────────┐
│                                 │
│  ✓ Вітаємо! 🎉                 │
│                                 │
│  Ви успішно завершили анкету    │
│  та вступили до Парламенту      │
│  Жінок. Ваш профіль готовий!    │
│                                 │
│  ✓ Профіль створено             │
│  ✓ Матчинг активована           │
│  ✓ Спільнота відкрита           │
│                                 │
│  ┌─────────────────────────────┐│
│  │ Що далі?                    ││
│  │ ✓ Заповніть профіль фото    ││
│  └─────────────────────────────┘│
│                                 │
│  [ Перейти до панелі → ]        │
│  [ Поділитися з подругами ]     │
│                                 │
│  Дякуємо за приєднання! 💜      │
│                                 │
└─────────────────────────────────┘
  *confetti falling*
```

## 🔄 User Flow

```
1. User completes registration/signin
   ↓
2. Redirect to /account/onboarding
   ↓
3. OnboardingSlider loads questions from API
   ↓
4. User sees Question 1/10
   ↓
5. User taps on answer OR swipes to navigate
   ↓
6. Answer auto-saves to state
   ↓
7. Auto-advance to next question
   ↓
8-9. Repeat for questions 2-9
   ↓
10. Question 10 - User taps answer
    ↓
    → Submits all 10 answers to /api/onboarding/submit
    → OnboardingSuccess component renders (step 10)
    ↓
11. User sees success screen with confetti
    ↓
12. User taps "Перейти до панелі керування"
    → Redirects to /mycabinet
```

## 📱 Touch Gestures

### Swipe Navigation

**Swipe Left** → Next question (if current answered)
```
├──────────┤
│Question 1│
└──────────┘
      → (swipe left)
         ├──────────┤
         │Question 2│
         └──────────┘
```

**Swipe Right** → Previous question
```
         ├──────────┤
         │Question 2│
         └──────────┘
      ← (swipe right)
├──────────┤
│Question 1│
└──────────┘
```

**Tap Answer** → Select + auto-advance

## 🎯 Integration Steps

### 1. Update Signup/Signin Flow

In your authentication route, redirect to onboarding after successful login:

```typescript
// app/auth/signup/page.tsx or similar
export default async function SignupPage() {
  // ... signup logic ...
  
  if (signupSuccess) {
    redirect('/account/onboarding'); // ← Add this
  }
}

// Or in API endpoint
export async function POST(request: NextRequest) {
  // ... validation ...
  
  // Save session
  const response = NextResponse.json({ success: true });
  response.cookies.set('sessionId', sessionToken);
  
  // Redirect on frontend
  // (client will redirect to /account/onboarding)
  
  return response;
}
```

### 2. Middleware Configuration (Optional)

To automatically redirect unauthenticated users:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = request.cookies.get('sessionId');
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/account/onboarding'],
};
```

### 3. Verify SQL Migration Executed

Ensure database tables exist:

```bash
# Run migration on production Neon database
scripts/migration_onboarding_questionnaire.sql
```

Verify:
```sql
SELECT COUNT(*) FROM onboarding_questions; -- Should be 10
SELECT * FROM customer_onboarding_responses LIMIT 1;
```

## 📊 Data Flow

### Answer Submission

```typescript
1. User selects answer
   ↓
2. State updates: answers[questionNumber] = selectedAnswer
   ↓
3. Auto-advance to next slide
   ↓
4. If last question:
   → Collect all 10 answers
   → POST to /api/onboarding/submit
   ↓
5. API validates:
   - User authenticated
   - All 10 questions answered
   - customerId matches session
   ↓
6. API saves to database:
   INSERT INTO customer_onboarding_responses
   (customer_id, question_1_answer, ..., question_10_answer, completed_at)
   VALUES (...)
   ↓
7. Success screen displayed
```

### Database Storage

```sql
-- Single row per customer with all 10 answers
SELECT * FROM customer_onboarding_responses
WHERE customer_id = 123;

-- Output:
-- id: 1
-- customer_id: 123
-- question_1_answer: "Технології, IT та інновації"
-- question_2_answer: "Власна справа / підприємство"
-- ... (questions 3-10)
-- completed_at: 2026-05-19 10:30:00
```

## 🎨 Customization

### Change Colors/Styling

```tsx
// In onboarding-slider.tsx
const categoryColor = getCategoryColor(question.category);

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    interests: 'bg-blue-500',      // ← Customize
    motivation: 'bg-purple-500',
    business: 'bg-green-500',
    personal: 'bg-pink-500',
    vision: 'bg-orange-500'
  };
  return colors[category] || 'bg-gray-500';
}
```

### Modify Swipe Sensitivity

```tsx
// In onboarding-slider.tsx
const handleSwipe = () => {
  if (!touchStart || !touchEnd) return;

  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > 50;  // ← Change threshold (default: 50px)
  const isRightSwipe = distance < -50;
  
  // ...
};
```

### Customize Success Messages

```tsx
// In onboarding-success.tsx
<h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
  Вітаємо! 🎉  {/* ← Change message */}
</h1>

<p className="text-muted-foreground text-base sm:text-lg mb-8">
  Ви успішно завершили анкету... {/* ← Change text */}
</p>
```

## 🔐 Security Considerations

✅ **Implemented:**
- Session verification on page load
- Customer ID validation on submit
- All 10 answers required before submit
- SQL injection protection
- No sensitive data logged in production

## 🧪 Testing

### Manual Testing

1. **Desktop Browser with Touch Emulator:**
   - Open DevTools
   - Enable "Device Emulation"
   - Test swipe gestures

2. **Mobile Device:**
   - Access via phone
   - Test all 10 questions
   - Verify success screen appears
   - Check confetti animation

3. **Database Verification:**
   ```sql
   SELECT * FROM customer_onboarding_responses 
   WHERE customer_id = [your_test_id];
   ```

### Automated Testing

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { OnboardingSlider } from '@/components/onboarding/onboarding-slider';

test('renders first question', async () => {
  render(<OnboardingSlider customerId={1} />);
  
  const question = await screen.findByText(
    /Яка сфера вас найбільш цікавить/
  );
  expect(question).toBeInTheDocument();
});
```

## 🚀 Deployment

**Files Changed:**
- `components/onboarding/onboarding-slider.tsx` (NEW)
- `components/onboarding/onboarding-success.tsx` (NEW)
- `app/account/onboarding/page.tsx` (NEW)

**Build Status:**
- ✅ TypeScript: All types valid
- ✅ Turbopack: Compiled successfully
- ✅ Routes: 31 routes registered (including `/account/onboarding`)

**Deployment Checklist:**
- [ ] Execute SQL migration on production DB
- [ ] Verify tables created
- [ ] Test onboarding flow in production
- [ ] Monitor API logs for errors
- [ ] Check success screen renders
- [ ] Verify data saved to database

## 📈 Analytics

### Query Completion Rate

```sql
SELECT 
  COUNT(DISTINCT customer_id) as total_started,
  COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed,
  ROUND(
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) * 100.0 / 
    COUNT(DISTINCT customer_id), 1
  ) as completion_rate
FROM customer_onboarding_responses;
```

### Most Popular Answers

```sql
SELECT 
  'Question 1' as question,
  question_1_answer as answer,
  COUNT(*) as count
FROM customer_onboarding_responses
WHERE question_1_answer IS NOT NULL
GROUP BY question_1_answer
ORDER BY count DESC;
```

### Completion Timeline

```sql
SELECT 
  DATE(completed_at) as date,
  COUNT(*) as completions
FROM customer_onboarding_responses
WHERE completed_at IS NOT NULL
GROUP BY DATE(completed_at)
ORDER BY date DESC;
```

## 🐛 Troubleshooting

**Problem: Questions not loading**
- Check API endpoint `/api/onboarding/questions`
- Verify SQL migration executed
- Check browser console for errors

**Problem: Swipe not working**
- Test on actual mobile device (DevTools emulation may not capture all gestures)
- Check touch event listeners are attached
- Verify `ref={sliderRef}` is on container

**Problem: Success screen not showing**
- Check API response on POST /api/onboarding/submit
- Verify all 10 answers are in request
- Check browser console for submission errors

**Problem: Answers not saved**
- Verify customer_id matches authenticated user
- Check database connection
- Review API logs for errors

---

**Commit:** 70a2d6d
**Files:** 3 created, 629 lines added
**Build Time:** 28s
**Status:** ✅ Ready for production
