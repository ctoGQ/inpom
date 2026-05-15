# Система авторизації та потоків інвойсів

## 📋 Структура авторизації

### Сесійна система
- **Сховище**: `customer_sessions` таблиця у базі даних
- **Механізм**: Cookie-based `session_token` з 30-денним терміном
- **Перевірка**: Middleware (`middleware.ts`) перевіряє всі `/mycabinet` маршрути
- **Функція**: `getSessionCustomer()` з `lib/auth.ts` повертає поточного користувача

### Захищені маршрути
```
/mycabinet/**      → Вимагає валідну сесію (middleware редиректує на /auth/signin)
/auth/signin       → Відкрито (для входу)
/auth/signup       → Відкрито (для реєстрації)
/api/invoices/pay  → Вимагає сесію (перевіряється в обробнику)
```

## 🔄 Потоки користувача

### 1️⃣ Потік創ання інвойса (Автор)

```
1. Користувач A (автор) заходить в /mycabinet/invoices (захищено)
   ↓ middleware перевіряє session_token
   ↓ getSessionCustomer() повертає користувача A

2. Користувач A створює інвойс через форму
   POST /api/invoices {amount, description, expiryMinutes}
   ↓ API генерує QR код та paymentUrl
   ↓ paymentUrl = `/mycabinet/pay-invoice/[id]`
   
3. Користувач A бачить інвойс з QR кодом
   ↓ Може скопіювати URL
   ↓ Може завантажити QR як PNG
```

### 2️⃣ Потік оплати (Платник)

```
1. Користувач B отримує посилання на оплату або QR код
   https://app.url/mycabinet/pay-invoice/[invoiceId]

2. Користувач B переходить на посилання
   ↓ Якщо не авторизирован → редирект на /auth/signin
   ↓ Якщо авторизирован → перевірка інвойса

3. На сторінці /mycabinet/pay-invoice/[id] відбувається:
   ✓ Перевірка що інвойс існує
   ✓ Перевірка що користувач B ≠ автор (не може платити свій)
   ✓ Перевірка що інвойс не минув строк дії
   ✓ Перевірка що інвойс не оплачено

4. PaymentConfirm компонент завантажує баланс користувача B
   GET /api/balance?customerId=B
   ↓ Показує достатні або недостатні кошти
   ↓ Кнопка неактивна якщо недостатньо коштів

5. Користувач B підтверджує оплату
   POST /api/invoices/pay {invoiceId, payerCustomerId: B}
   ↓ Перевірка в API всі умови
   ↓ Зменшення балансу B
   ↓ Збільшення балансу A
   ↓ Створення 2 транзакцій (payment_sent для B, payment_received для A)

6. Редирект на /mycabinet/transactions
   ↓ Користувач B бачить нову транзакцію payment_sent
```

### 3️⃣ Потік огляду транзакцій

```
Користувач A (автор):
- Транзакція payment_received
- Кнопка "Переглянути інвойс" → /mycabinet/invoices/[id]
- На сторінці інвойса (захищено тільки для A):
  * Переглядає деталі інвойса
  * Видит QR код та URL для платника
  * Кнопка "Переглянути сторінку оплати" → показує як бачить B

Користувач B (платник):
- Транзакція payment_sent
- Кнопка "Переглянути статус оплати" → /mycabinet/pay-invoice/[id]
- На сторінці оплати (захищено для B):
  * Видит що інвойс "Оплачено"
  * Видит деталі кому був відправлений платіж
```

## 🔐 Механізми безпеки

### На рівні middleware
- Всі `/mycabinet` маршрути мають сесію
- Перевірка `expires_at > NOW()` для кожного запиту

### На рівні сторінок
- `getSessionCustomer()` для перевірки користувача
- Перевірка `creator_customer_id` для захисту інвойсів автора
- Перевірка що `payer_id ≠ creator_id` на pay-invoice

### На рівні API
- Перевірка чи інвойс не оплачено
- Перевірка чи баланс достатній
- Перевірка чи інвойс не закінчився
- Перевірка чи платник ≠ автор

### Помилки та відповіді

```javascript
// Недостатньо коштів
{
  error: "Insufficient balance. You need 100.00 inpom but have only 50.00 inpom"
}

// Неправильна оплата
{
  error: "You cannot pay your own invoice"
}

// Інвойс закінчився
{
  error: "Invoice has expired"
}

// Вже оплачено
{
  error: "Invoice already paid"
}
```

## 📊 Таблиці та зв'язки

```
customers
├── id (PK)
├── name
├── email
├── password_hash
└── ...

customer_sessions
├── id (PK)
├── customer_id (FK → customers.id)
├── session_token (унікальний)
└── expires_at (30 днів від створення)

invoices
├── id (PK)
├── creator_customer_id (FK → customers.id)
├── amount
├── description
├── status (pending/paid)
├── expires_at
└── ...

user_cards
├── id (PK)
├── customer_id (FK → customers.id)
├── balance
├── card_type
└── ...

transactions
├── id (PK)
├── customer_id (FK → customers.id)
├── invoice_id (FK → invoices.id, может быть NULL)
├── type (deposit/payment_sent/payment_received)
├── amount
├── description
├── created_at
└── ...
```

## ✅ Тестовий сценарій

1. **Користувач A (автор)**
   - Заходить в систему
   - Переходить на /mycabinet
   - Створює інвойс на 100 inpom
   - Отримує QR код та URL
   - Копіює URL в буфер обміну

2. **Користувач B (платник)**
   - Реєструється або заходить в систему
   - Переходить на посилання інвойса (у брузері)
   - Видит деталі та баланс
   - Підтверджує оплату
   - Видит "Оплата успішна"
   - Редиректиться на /mycabinet/transactions
   - Видит нову транзакцію payment_sent за -100 inpom

3. **Користувач A знову**
   - Переходить на /mycabinet/transactions
   - Видит нову транзакцію payment_received за +100 inpom
   - Натискає кнопку для перегляду інвойса
   - Видит що інвойс статус "paid"
   - Баланс збільшився на 100 inpom

## 🚀 Розповсюджена інформація про URL

Коли користувач A хоче поділитися з B:
- **Для платника**: URL вигляду `https://app.url/mycabinet/pay-invoice/123`
- **QR код**: Кодує те ж саме посилання
- **Буфер обміну**: Кнопка "Копіювати" копіює посилання оплати

## 📝 Прикладрепозиторіїторіїторіїторіїторіїторії

Див. також:
- [INVOICE_SYSTEM.md](./INVOICE_SYSTEM.md) - Детальна документація API та системи інвойсів
- [lib/auth.ts](./lib/auth.ts) - Функції авторизації
- [middleware.ts](./middleware.ts) - Захист маршрутів
- [app/api/invoices/route.ts](./app/api/invoices/route.ts) - API створення інвойса
- [app/api/invoices/pay/route.ts](./app/api/invoices/pay/route.ts) - API оплати
