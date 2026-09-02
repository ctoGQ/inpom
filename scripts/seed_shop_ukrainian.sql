-- INPOM marketplace demo seed
-- Creates demo shop sellers and Ukrainian products without product images.
-- Demo password for all seeded users: InpømDemo2026!
-- The hash uses the same PBKDF2-SHA512 settings as lib/auth.ts with the default salt.
-- Run scripts/migration_shop_marketplace.sql first if the shop tables do not exist.

BEGIN;

-- Categories used by this seed. Existing categories are reused by slug.
INSERT INTO shop_categories (name, slug, description, color, display_order, is_active)
VALUES
  ('Консультації', 'konsultatsii', 'Експертні консультації для розвитку та роботи.', '#111111', 1, TRUE),
  ('Онлайн Курси', 'online-kursy', 'Навчальні програми, вебінари та практичні матеріали.', '#2F6FED', 2, TRUE),
  ('Коворкинг', 'kovorking', 'Робочі місця та простори для спільної роботи.', '#2F9E74', 3, TRUE),
  ('Менторство', 'mentorstvo', 'Індивідуальна підтримка, супровід і розвиток навичок.', '#D18B22', 4, TRUE),
  ('Технології & IT', 'tekhnolohii-it', 'Цифрові продукти, автоматизація та IT-послуги.', '#7C5CFC', 8, TRUE),
  ('Дизайн & Креатив', 'dizajn-kreatyv', 'Дизайн, брендинг і творчі послуги для проєктів.', '#D85C87', 7, TRUE),
  ('Маркетинг & PR', 'marketynh-pr', 'Комунікації, просування та стратегія бренду.', '#E36B2C', 9, TRUE),
  ('Здоров''я & Краса', 'zdorov''ya-krasa', 'Послуги для добробуту, здоров''я та балансу.', '#2D9D9A', 10, TRUE)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

-- All demo accounts use the same password for easy local testing.
WITH demo_users(email, name) AS (
  VALUES
    ('olena.koval@demo.inpom.ua', 'Олена Коваль'),
    ('marta.bondar@demo.inpom.ua', 'Марта Бондар'),
    ('sofia.melnyk@demo.inpom.ua', 'Софія Мельник')
)
INSERT INTO customers (email, name, password_hash, is_active, created_at, updated_at)
SELECT
  email,
  name,
  'd29d3ccc20ceee5cc7ffaa9032e9bd4510f499488b848402a4b2ca6784681b7c8092f7918f93bf7bd892d5ae885b96d0bec4d670e13d2bbb348c1ef3b4879370',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM demo_users
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

-- Products are linked to sellers and categories by stable email/slug lookups.
-- No rows are inserted into shop_product_images.
WITH seed_products(seller_email, category_slug, title, slug, description, short_description, price, original_price, stock_quantity, sku, is_featured) AS (
  VALUES
    ('olena.koval@demo.inpom.ua', 'konsultatsii', 'Стратегічна консультація для бізнесу', 'stratehichna-konsultatsiya-dlya-biznesu', 'Індивідуальна зустріч для аналізу бізнес-моделі, визначення пріоритетів і створення зрозумілого плану наступних кроків.', 'Персональна консультація для підприємиць.', 1200.00, 1500.00, 25, 'DEMO-CONSULT-001', TRUE),
    ('olena.koval@demo.inpom.ua', 'mentorstvo', 'Менторський супровід на 4 тижні', 'mentorskyi-suprovid-na-4-tyzhni', 'Чотири онлайн-зустрічі, підтримка між сесіями та спільний розбір викликів, що виникають під час розвитку проєкту.', 'Місяць практичного менторства.', 3200.00, NULL, 10, 'DEMO-MENTOR-001', TRUE),
    ('olena.koval@demo.inpom.ua', 'online-kursy', 'Курс «Фінансова впевненість»', 'kurs-finansova-vpevnenist', 'Практичний курс про бюджетування, ціну послуг, фінансові цілі та щоденні рішення без зайвої складності.', 'Онлайн-курс про фінансову грамотність.', 890.00, 1100.00, 100, 'DEMO-COURSE-001', FALSE),
    ('marta.bondar@demo.inpom.ua', 'dizajn-kreatyv', 'Фірмовий стиль для малого проєкту', 'firmovyi-styl-dlya-maloho-proektu', 'Створення базової візуальної системи: логотип, кольорова палітра, типографіка та короткі правила використання.', 'Айдентика для старту або оновлення бренду.', 4600.00, 5200.00, 8, 'DEMO-DESIGN-001', TRUE),
    ('marta.bondar@demo.inpom.ua', 'marketynh-pr', 'Контент-план на місяць', 'kontent-plan-na-misyats', 'Дослідження аудиторії та контент-план із темами, форматами, закликами до дії й рекомендаціями для регулярної комунікації.', 'Готовий план комунікацій на 30 днів.', 1800.00, NULL, 20, 'DEMO-MARKETING-001', FALSE),
    ('marta.bondar@demo.inpom.ua', 'tekhnolohii-it', 'Налаштування цифрового робочого простору', 'nalashtuvannya-tsyfrovoho-robochoho-prostoru', 'Допомога з організацією командних процесів, документів, доступів і простих автоматизацій для щоденної роботи.', 'Цифровий порядок для команди.', 2500.00, 3000.00, 12, 'DEMO-IT-001', TRUE),
    ('marta.bondar@demo.inpom.ua', 'kovorking', 'Робоче місце на 5 днів', 'roboche-mistse-na-5-dniv', 'Тихе робоче місце з доступом до спільної зони, Wi-Fi та кавової точки для зосередженої роботи.', 'П’ять днів у партнерському просторі.', 750.00, NULL, 30, 'DEMO-COWORK-001', FALSE),
    ('sofia.melnyk@demo.inpom.ua', 'zdorov''ya-krasa', 'Консультація з турботи про себе', 'konsultatsiya-z-turboty-pro-sebe', 'Делікатна онлайн-зустріч для формування реалістичного плану відновлення, балансу та щоденних практик турботи про себе.', 'Персональна консультація про добробут.', 950.00, 1200.00, 15, 'DEMO-WELLNESS-001', FALSE),
    ('sofia.melnyk@demo.inpom.ua', 'online-kursy', 'Вебінар «Презентація ідеї»', 'vebinar-prezentatsiya-ideyi', 'Живий практичний вебінар про структуру презентації, сильне формулювання ідеї та впевнений виступ перед партнерами.', 'Практичний вебінар для авторок ідей.', 350.00, NULL, 200, 'DEMO-WEBINAR-001', FALSE),
    ('sofia.melnyk@demo.inpom.ua', 'tekhnolohii-it', 'Аудит доступності цифрового продукту', 'audyt-dostupnosti-tsyfrovoho-produktu', 'Перевірка базових сценаріїв користувача, навігації, контрасту й зрозумілості інтерфейсу з рекомендаціями для покращення.', 'Рекомендації для зручнішого цифрового сервісу.', 2800.00, 3400.00, 10, 'DEMO-A11Y-001', TRUE)
)
INSERT INTO shop_products (
  seller_id, category_id, title, slug, description, short_description,
  price, original_price, currency, stock_quantity, sku, status, is_featured,
  meta_title, meta_description, meta_keywords
)
SELECT
  seller.id,
  category.id,
  product.title,
  product.slug,
  product.description,
  product.short_description,
  product.price,
  product.original_price,
  'UAH',
  product.stock_quantity,
  product.sku,
  'active',
  product.is_featured,
  product.title,
  product.short_description,
  'INPOM, жінки, можливості, розвиток'
FROM seed_products product
JOIN customers seller ON seller.email = product.seller_email
JOIN shop_categories category ON category.slug = product.category_slug
ON CONFLICT (sku) DO UPDATE
SET seller_id = EXCLUDED.seller_id,
    category_id = EXCLUDED.category_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    stock_quantity = EXCLUDED.stock_quantity,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    updated_at = CURRENT_TIMESTAMP;

COMMIT;

-- Test accounts:
-- olena.koval@demo.inpom.ua / InpømDemo2026!
-- marta.bondar@demo.inpom.ua / InpømDemo2026!
-- sofia.melnyk@demo.inpom.ua / InpømDemo2026!
