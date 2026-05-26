# Система магазина INPOM - Документация

## Обзор системы

Система магазина позволяет пользователям:
1. **Создавать и управлять товарами** через `/mycabinet/shop`
2. **Продавать товары** за INPOM баланс
3. **Покупать товары** других пользователей

## Структура БД

### Основные таблицы:

#### `shop_products` - Товары
- `id` (int, PK) - Уникальный ID товара
- `seller_id` (int, FK) - ID продавца (связь с customers.id)
- `category_id` (int, FK) - ID категории
- `title` (varchar) - Название товара
- `price` (decimal) - Цена товара в INPOM
- `stock_quantity` (int) - Количество в наличии
- `status` (varchar) - active/draft/inactive/moderation
- `description`, `short_description` - Описания
- `sale_count` - Количество продаж
- `rating` - Рейтинг товара
- `review_count` - Количество отзывов

#### `shop_product_images` - Фотографии товаров
- `id` (int, PK)
- `product_id` (int, FK) - ID товара
- `image_url` (text) - URL фотографии
- `is_primary` (boolean) - Главная фотография
- `display_order` (int) - Порядок отображения

#### `shop_product_attributes` - Характеристики
- `id` (int, PK)
- `product_id` (int, FK) - ID товара
- `attribute_name` (varchar) - Название характеристики
- `attribute_value` (varchar) - Значение характеристики
- `display_order` (int) - Порядок отображения

#### `shop_transactions` - Транзакции покупок
- `id` (int, PK)
- `product_id` (int, FK) - ID товара
- `buyer_id` (int, FK) - ID покупателя
- `seller_id` (int, FK) - ID продавца
- `quantity` (int) - Количество купленных единиц
- `total_price` (decimal) - Общая сумма покупки в INPOM
- `status` (varchar) - pending/confirmed/shipped/delivered/cancelled
- `transaction_date` (timestamp) - Дата транзакции

## API Endpoints

### Управление товарами (Продавец)

#### GET `/api/shop/products/seller`
Получить товары текущего продавца
```
Query params:
- page: число (по умолчанию 1)
- limit: число (по умолчанию 20)
- status: all|active|draft|inactive (по умолчанию all)

Response:
{
  products: Product[],
  pagination: {
    page, limit, total, totalPages
  }
}
```

#### GET `/api/shop/products/detail`
Получить детали товара с характеристиками и фотографиями
```
Query params:
- id: число (обязательно)

Response:
{
  product: Product,
  attributes: ProductAttribute[],
  images: ProductImage[]
}
```

#### POST `/api/shop/products/create`
Создать новый товар
```
Body:
{
  title: string,
  categoryId: number,
  price: number,
  description: string,
  shortDescription?: string,
  originalPrice?: number,
  stockQuantity?: number,
  sku?: string,
  attributes?: [{name: string, value: string}],
  images?: string[]
}
```

#### PUT `/api/shop/products/[id]/update`
Обновить товар (только для продавца)
```
Body (все поля опциональные):
{
  title?: string,
  description?: string,
  shortDescription?: string,
  price?: number,
  originalPrice?: number,
  stockQuantity?: number,
  status?: 'active'|'draft'|'inactive'
}
```

#### DELETE `/api/shop/products/[id]/delete`
Удалить товар (только для продавца)
```
No body required
```

### Покупка товара

#### POST `/api/shop/products/buy`
Купить товар (автоматически создается транзакция и переводятся средства)
```
Body:
{
  productId: number,
  quantity: number
}

Response:
{
  success: boolean,
  transactionId: number,
  newBalance: number (новый баланс покупателя),
  message: string
}
```

## Страницы

### `/mycabinet/shop` - Магазин продавца
- Список товаров текущего пользователя
- Фильтр по статусу (активные, черновики, неактивные)
- Кнопка "Добавить товар"
- Кнопки редактирования и удаления для каждого товара

### `/mycabinet/shop/create` - Создание нового товара
- Форма для создания товара
- Загрузка фотографий
- Добавление характеристик
- Выбор категории и цены

### `/mycabinet/shop/[id]` - Редактирование товара
- Просмотр деталей товара
- Редактирование информации
- Удаление товара
- Просмотр статистики (продано, рейтинг, отзывы)

### `/shop/[id]` - Детали товара (для покупателя)
- Просмотр товара
- Кнопка "Купить" с вводом количества
- История отзывов

## Процесс покупки

1. **Проверка баланса**: Система проверяет наличие достаточного INPOM баланса
2. **Проверка статуса товара**: Товар должен быть в статусе 'active'
3. **Создание транзакции**: Создается запись в `shop_transactions`
4. **Списание баланса покупателя**: Уменьшается баланс на карте покупателя
5. **Зачисление баланса продавца**: Увеличивается баланс на карте продавца
6. **История**: Создаются записи в таблице `transactions` для истории

## Статусы товаров

- **active** - Товар доступен для покупки
- **draft** - Черновик, не отображается в поиске
- **inactive** - Товар скрыт, но данные сохранены
- **moderation** - Товар ждет одобрения модератора

## Примеры использования

### Создание товара (frontend)
```typescript
const response = await fetch('/api/shop/products/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Консультация по бизнесу',
    categoryId: 1,
    price: 500,
    description: 'Детальная консультация по развитию вашего бизнеса...',
    shortDescription: 'Индивидуальная консультация',
    originalPrice: 700,
    stockQuantity: 999,
    attributes: [
      { name: 'Формат', value: 'Онлайн' },
      { name: 'Длительность', value: '1 час' }
    ]
  })
});
```

### Покупка товара (frontend)
```typescript
const response = await fetch('/api/shop/products/buy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 1,
    quantity: 1
  })
});

const data = await response.json();
console.log(`Покупка успешна! ID транзакции: ${data.transactionId}`);
console.log(`Новый баланс: ${data.newBalance} INPOM`);
```

## Безопасность

- Все операции требуют аутентификации (проверка через `getSessionCustomer()`)
- Продавец может редактировать/удалять только свои товары
- Купить товар не может его продавец
- Все финансовые операции записываются в `transactions` для аудита
