# Система Транзакцій

## 📋 Структура

### Таблиця: `transactions`

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  invoice_id INTEGER REFERENCES invoices(id),
  type VARCHAR(50) NOT NULL, -- 'deposit', 'payment_sent', 'payment_received', 'withdrawal'
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Типи транзакцій

| Тип | Опис | Сторона | Баланс |
|-----|------|--------|--------|
| `deposit` | Поповнення рахунку | Користувач | +amount |
| `payment_sent` | Відправлено оплату | Платник | -amount |
| `payment_received` | Отримано оплату | Отримувач | +amount |
| `withdrawal` | Виведення коштів | Користувач | -amount |

## 📄 Сторінки

### 1. Список транзакцій: `/mycabinet/transactions`

**Сторінка** (Server Component):
- `app/mycabinet/transactions/page.tsx`

**Функції**:
- Отримує користувача з сесії
- Фетчить транзакції з Neon БД
- Сортує по даті (від нових до старих)
- Показує макс 100 транзакцій

**Кожна строка содержит**:
- Тип операції (капіталізований)
- Опис
- Дата і час
- Сума з правильним кольором (зелень для входящих, красний для исходящих)
- Кнопка для вибору інвойса (якщо є)

**Функції**:
- Кліком на строку → Открить деталь транзакции (`/mycabinet/transactions/[id]`)
- Кнопка з іконкою → Открить інвойс або статус оплаты
  - `payment_sent` → `/mycabinet/pay-invoice/[invoiceId]` (статус оплаты)
  - `payment_received` → `/mycabinet/invoices/[invoiceId]` (деталі інвойса)

### 2. Деталь транзакції: `/mycabinet/transactions/[id]`

**Сторінка** (Server Component):
- `app/mycabinet/transactions/[id]/page.tsx`

**Функції**:
- Перевіряє що користувач poder переглянути цю транзакцію
- Отримує дані транзакції з БД
- Якщо є інвойс - отримує його деталі теж

**Показує**:
1. **Емоджі + Тип операції** - Визуальний індикатор типу
2. **Сума** - з кольором (зелень/красний)
3. **Опис** - опис операції (якщо є)
4. **Дата і час** - форматована дата
5. **ID транзакції** - номер для справки
6. **Деталі інвойса** (якщо пов'язана):
   - Статус інвойса (✓ Оплачено / ⏳ Очікує)
   - Сума інвойса
   - Опис інвойса
   - Автор інвойса
   - Кнопка для открытия інвойса

**Кнопки**:
- "Переглянути статус оплати" (для `payment_sent` з інвойсом)
- "Переглянути інвойс" (для `payment_received` з інвойсом)
- "Повернутись до історії" - назад на список

## 🔐 Безпека

- Обидві сторінки захищені сесією (middleware + `getSessionCustomer()`)
- Користувач може див только його власні транзакції
- На детальній сторінці перевіряється що `customer_id` з БД == поточний користувач

## 💾 Фетчування з БД

### Список транзакцій
```typescript
SELECT id, type, amount, description, created_at, invoice_id
FROM transactions
WHERE customer_id = ${customerId}
ORDER BY created_at DESC
LIMIT 100
```

### Деталь транзакції
```typescript
SELECT id, type, amount, description, created_at, invoice_id
FROM transactions
WHERE id = ${transactionId} AND customer_id = ${customerId}
```

### Деталі інвойса (якщо пов'язана)
```typescript
SELECT 
  i.id, i.creator_customer_id, i.amount, i.description, 
  i.status, i.created_at, i.expires_at, c.name as creator_name
FROM invoices i
JOIN customers c ON i.creator_customer_id = c.id
WHERE i.id = ${invoiceId}
```

## 🎨 UX Особливості

### Типи операцій з емоджі
- 💰 Депозит
- 📤 Відправлено
- 📥 Отримано
- 🔄 Виведення
- 💵 Інші

### Кольорове кодування
- **Зелений** (#22c55e): Входящие кошти (deposit, payment_received)
- **Красний** (#ef4444): Исходящие кошти (payment_sent, withdrawal)

### Інтерактивность
- Hover ефект на строках списку (background change)
- Кнопка для інвойса не закриває ссилку (onClick e.preventDefault)
- Легкий доступ до пов'язаних інвойсів

## 📊 Потоки даних

### Создание інвойса
```
User A: POST /api/invoices
  ↓
API: INSERT into invoices
  ↓
  → QR код + payment URL
```

### Оплата інвойса
```
User B: POST /api/invoices/pay
  ↓
API: 
  1. UPDATE invoices (status = 'paid')
  2. UPDATE user_cards (balance для обоих)
  3. INSERT transaction (payment_sent для User B)
  4. INSERT transaction (payment_received для User A)
```

### Просмотр истории
```
User: GET /mycabinet/transactions
  ↓
Query: SELECT * FROM transactions WHERE customer_id = X
  ↓
  → Список с сортировкой по дате
```

### Просмотр деталей
```
User: GET /mycabinet/transactions/[id]
  ↓
Query 1: SELECT * FROM transactions WHERE id = X AND customer_id = Y
  ↓
(если invoice_id)
  → Query 2: SELECT * FROM invoices WHERE id = Z
  ↓
  → Детали с информацией об инвойсе
```

## ✅ Проверка БД

Для проверки подключения к Neon и структуры таблиц:

```bash
# Используя скрипт проверки
node scripts/check-db.mjs
```

Скрипт проверяет:
- ✅ Подключение к БД
- ✅ Структуру каждой таблицы (поля, типы, ограничения)
- ✅ Количество записей в каждой таблице
- ✅ Индексы в БД

## 🐛 Отладка

Если транзакции не загружаются:

1. **Проверить сессию**
   ```
   Cookie: session_token должна существовать
   getSessionCustomer() должна вернуть customer
   ```

2. **Проверить данные в БД**
   ```sql
   SELECT * FROM transactions WHERE customer_id = X LIMIT 10;
   SELECT * FROM invoices WHERE id = X;
   ```

3. **Посмотреть логи**
   - Browser Console для клиентских ошибок
   - Vercel Logs для серверных ошибок

## 📝 Notes

- Все даты хранятся в UTC в БД
- При отображении форматируются в локальный timezone
- Локаль: `uk-UA` (украинский)
- Максимум 100 транзакций в списке (для производительности)
