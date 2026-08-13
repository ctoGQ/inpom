-- Seed Events Data - 5 Sample Events
-- Note: organizer_id references customers table which must have at least id=1

-- Event 1: Бізнес-конференція 2025
INSERT INTO events (
  title, slug, description, short_description, banner_image_url, thumbnail_image_url,
  event_type, start_date, end_date, region, city, venue_name, address, is_online,
  max_participants, ticket_price, currency, discount_percent, status, is_featured,
  organizer_id, organizer_name, organizer_description, organizer_contact_email, organizer_contact_phone,
  meta_description, created_at, published_at
) VALUES (
  'Бізнес-конференція 2025',
  'business-conference-2025',
  'Головна конференція року для професіоналів мережевого бізнесу. Спікери з 15 країн поділяться досвідом розвитку, масштабування та інновацій. Три дні інтенсивного навчання, нетворкінгу та можливостей для партнерства.',
  'Головна конференція для мережевих професіоналів зі спікерами з 15 країн',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  'conference',
  '2025-06-15 09:00:00',
  '2025-06-17 18:00:00',
  'Київ',
  'Київ',
  'Палац культури',
  'вул. Охотна, 1, Київ',
  false,
  500,
  350.00,
  'INPOM',
  0,
  'published',
  true,
  1,
  'INPOM Events',
  'Провідна компанія з організації бізнес-подій в Україні',
  'info@inpomevents.com',
  '+380 44 XXX-XX-XX',
  'Бізнес-конференція 2025 - міжнародна конференція для професіоналів',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Event 2: Воркшоп: Лідерство та розвиток навичок
INSERT INTO events (
  title, slug, description, short_description, banner_image_url, thumbnail_image_url,
  event_type, start_date, end_date, region, city, is_online, max_participants,
  ticket_price, currency, discount_percent, status, is_featured,
  organizer_id, organizer_name, organizer_description, organizer_contact_email,
  meta_description, created_at, published_at
) VALUES (
  'Воркшоп: Лідерство та розвиток навичок',
  'workshop-leadership-skills',
  'Інтерактивний воркшоп присвячений розвитку лідерських навичок. Практичні вправи, кейс-стаді та роботи в групах допоможуть вам стати більш ефективним лідером. Для менеджерів середньої та вищої ланки.',
  'Навчальний семінар про розвиток лідерських навичок та управління командою',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  'workshop',
  '2025-06-20 14:00:00',
  '2025-06-20 17:00:00',
  'Online',
  'Online',
  true,
  150,
  120.00,
  'INPOM',
  15,
  'published',
  false,
  1,
  'INPOM Academy',
  'Освітня платформа для професійного розвитку',
  'academy@inpom.com',
  'Воркшоп по розвитку лідерських навичок - онлайн навчання',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Event 3: Мастеркласс: Digital Marketing 2025
INSERT INTO events (
  title, slug, description, short_description, banner_image_url, thumbnail_image_url,
  event_type, start_date, end_date, region, city, venue_name, address, is_online,
  max_participants, ticket_price, currency, discount_percent, status, is_featured,
  organizer_id, organizer_name, organizer_description, organizer_contact_email,
  meta_description, created_at, published_at
) VALUES (
  'Мастеркласс: Digital Marketing 2025',
  'masterclass-digital-marketing',
  'Практичний мастеркласс від експертів найбільших цифрових агенцій. Дізнайтеся про найновіші тренди в контент-маркетингу, SEO, SMM та PPC. Реальні приклади та кейси успіху.',
  'Експертний мастеркласс з цифрового маркетингу та стратегій просування',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  'masterclass',
  '2025-07-05 10:00:00',
  '2025-07-05 13:00:00',
  'Львів',
  'Львів',
  'StartupHub',
  'вул. Лесі Українки, 2, Львів',
  false,
  80,
  180.00,
  'INPOM',
  20,
  'published',
  true,
  1,
  'Digital Pro',
  'Агенція цифрового маркетингу та консультацій',
  'master@digitalpro.ua',
  'Мастеркласс Digital Marketing - навчання від фахівців',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Event 4: Нетворкінг: Харків Tech Community
INSERT INTO events (
  title, slug, description, short_description, banner_image_url, thumbnail_image_url,
  event_type, start_date, end_date, region, city, venue_name, address, is_online,
  max_participants, ticket_price, currency, discount_percent, status, is_featured,
  organizer_id, organizer_name, organizer_description, organizer_contact_email,
  meta_description, created_at, published_at
) VALUES (
  'Нетворкінг: Харків Tech Community',
  'networking-kharkiv-tech',
  'Неформальна зустріч розробників, стартаперів та техноентузіастів. Спілкування в комфортній атмосфері кав''ярні, обмін досвідом та пошук партнерів.',
  'Неформальна зустріч професіоналів IT та технологій для обміну досвідом',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  'networking',
  '2025-06-25 18:30:00',
  '2025-06-25 20:30:00',
  'Харків',
  'Харків',
  'Tech Café Kharkiv',
  'пр. Гагаріна, 12, Харків',
  false,
  120,
  50.00,
  'INPOM',
  0,
  'published',
  false,
  1,
  'Kharkiv Tech Meetup',
  'Спільнота технологічних професіоналів',
  'events@kharkivtech.ua',
  'Нетворкінг evento для IT фахівців та стартаперів',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Event 5: Вебінар: AI для бізнесу
INSERT INTO events (
  title, slug, description, short_description, banner_image_url, thumbnail_image_url,
  event_type, start_date, end_date, region, city, is_online, stream_url,
  max_participants, ticket_price, currency, discount_percent, status, is_featured,
  organizer_id, organizer_name, organizer_description, organizer_contact_email,
  meta_description, created_at, published_at
) VALUES (
  'Вебінар: AI для бізнесу',
  'webinar-ai-for-business',
  'Онлайн вебінар про практичне застосування штучного інтелекту в бізнесі. Як AI може допомогти автоматизувати процеси, підвищити ефективність та скоротити витрати. Кейси успіху від реальних компаній.',
  'Вебінар про впровадження штучного інтелекту в бізнес-процеси',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  'webinar',
  '2025-06-30 16:00:00',
  '2025-06-30 17:00:00',
  'Online',
  'Online',
  true,
  'https://stream.inpom.ua/webinar-ai-2025',
  1000,
  0.00,
  'INPOM',
  0,
  'published',
  true,
  1,
  'AI Innovation Lab',
  'Лабораторія інновацій та штучного інтелекту',
  'webinar@ailab.ua',
  'Безплатний вебінар про AI та його застосування в бізнесі',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Tickets for Event 1 (Business Conference)
INSERT INTO event_tickets (event_id, ticket_type, ticket_name, description, price, quantity_available, is_active, sale_start_date, sale_end_date) VALUES
(1, 'early_bird', 'Early Bird', 'Ранній запис - 30% знижка', 245.00, 100, true, NOW(), '2025-05-20 23:59:59'),
(1, 'standard', 'Стандартна', 'Звичайна реєстрація', 350.00, 300, true, '2025-05-21 00:00:00', '2025-06-14 23:59:59'),
(1, 'vip', 'VIP Пакет', 'VIP включає обід, фото-сесія та усім матеріали', 550.00, 50, true, NOW(), '2025-06-14 23:59:59'),
(1, 'group', 'Групова ціна', 'Для груп від 5 осіб - 20% знижка', 280.00, 50, true, NOW(), '2025-06-14 23:59:59');

-- Tickets for Event 2 (Workshop)
INSERT INTO event_tickets (event_id, ticket_type, ticket_name, description, price, quantity_available, is_active) VALUES
(2, 'standard', 'Учасник', 'Вхід на воркшоп', 120.00, 150, true),
(2, 'student', 'Студент', 'Спеціальна ціна для студентів', 60.00, 30, true);

-- Tickets for Event 3 (Masterclass)
INSERT INTO event_tickets (event_id, ticket_type, ticket_name, description, price, quantity_available, is_active) VALUES
(3, 'early_bird', 'Ранній запис', 'Записатися до 20 червня', 144.00, 30, true),
(3, 'standard', 'Стандартна ціна', 'Звичайна реєстрація', 180.00, 50, true);

-- Tickets for Event 4 (Networking)
INSERT INTO event_tickets (event_id, ticket_type, ticket_name, description, price, quantity_available, is_active) VALUES
(4, 'standard', 'Учасник', 'Вхід на нетворкінг', 50.00, 120, true);

-- Tickets for Event 5 (Webinar - Free)
INSERT INTO event_tickets (event_id, ticket_type, ticket_name, description, price, quantity_available, is_active) VALUES
(5, 'standard', 'Безплатна реєстрація', 'Вхід на вебінар', 0.00, 1000, true);

-- Sessions for Event 1 (Business Conference)
INSERT INTO event_sessions (event_id, session_number, title, description, start_time, end_time, speaker_name, speaker_bio, room_name) VALUES
(1, 1, 'Відкриття: Майбутнє бізнесу', 'Вступна лекція про останні тренди', '2025-06-15 09:00:00', '2025-06-15 10:00:00', 'Олег Петренко', 'CEO великої компанії, експерт з бізнесу', 'Головна сцена'),
(1, 2, 'Масштабування та зростання', 'Як масштабувати бізнес без помилок', '2025-06-15 10:15:00', '2025-06-15 11:45:00', 'Марія Сідоренко', 'Венчурний інвестор, засновниця 3 стартапів', 'Зал А'),
(1, 3, 'Цифрова трансформація', 'Як технологія змінює бізнес', '2025-06-15 12:30:00', '2025-06-15 14:00:00', 'Андрій Коваленко', 'CTO, розробник новітніх рішень', 'Зал Б'),
(1, 4, 'Гала-ужин', 'Неформальне спілкування', '2025-06-15 18:00:00', '2025-06-15 20:00:00', NULL, NULL, 'Банкетний зал');

-- Sessions for Event 3 (Masterclass)
INSERT INTO event_sessions (event_id, session_number, title, description, start_time, end_time, speaker_name, speaker_bio, room_name) VALUES
(3, 1, 'SEO та органічний трафік', 'Отримання максимального трафіку з Google', '2025-07-05 10:00:00', '2025-07-05 10:45:00', 'Ксенія Морозова', 'SEO-експерт з 10 років досвіду', 'Конференц-зал'),
(3, 2, 'Соціальні мережі для бізнесу', 'SMM-стратегія яка працює', '2025-07-05 11:00:00', '2025-07-05 11:45:00', 'Павло Яценко', 'SMM-менеджер, більше ніж 50 успішних кампаній', 'Конференц-зал'),
(3, 3, 'Q&A сесія', 'Прямі питання спікерам', '2025-07-05 12:00:00', '2025-07-05 13:00:00', NULL, NULL, 'Конференц-зал');

-- Speakers for Event 1
INSERT INTO event_speakers (event_id, speaker_name, speaker_bio, email, expertise, order_position) VALUES
(1, 'Олег Петренко', 'CEO компанії, 20 років досвіду в бізнесі, експерт у стратегічному розвитку', 'oleg@business.ua', 'Стратегія, лідерство, бізнес-розвиток', 1),
(1, 'Марія Сідоренко', 'Венчурний інвестор, засновниця 3 успішних стартапів, радниця для численних компаній', 'maria@startup.ua', 'Венчурне інвестування, стартапи, масштабування', 2),
(1, 'Андрій Коваленко', 'CTO лідера індустрії, розробник інноваційних технологічних рішень', 'andrii@tech.ua', 'Технології, інновації, цифрова трансформація', 3);

-- Speakers for Event 3
INSERT INTO event_speakers (event_id, speaker_name, speaker_bio, email, expertise, order_position) VALUES
(3, 'Ксенія Морозова', 'SEO-експерт з 10 років досвіду, проводила сотні успішних кампаній', 'ksenia@seo.ua', 'SEO, органічний трафік, контент-маркетинг', 1),
(3, 'Павло Яценко', 'SMM-менеджер з більше ніж 50 успішних кампаніями, розроблює стратегії для известных брендів', 'pavlo@smm.ua', 'Соціальні мережі, контент, реклама', 2);

-- Sponsors for Event 1
INSERT INTO event_sponsors (event_id, sponsor_name, sponsor_type, logo_url, website_url, description, order_position) VALUES
(1, 'TechCorp Ukraine', 'gold', 'https://via.placeholder.com/150', 'https://techcorp.ua', 'Провідна IT-компанія України', 1),
(1, 'StartUp Boost', 'silver', 'https://via.placeholder.com/150', 'https://startupboost.ua', 'Акселератор для стартапів', 2),
(1, 'Business Media', 'bronze', 'https://via.placeholder.com/150', 'https://businessmedia.ua', 'Ділові новини та аналітика', 3);

-- Event Images/Gallery
INSERT INTO event_images (event_id, image_url, image_type, alt_text, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200', 'banner', 'Бізнес-конференція', 1),
(1, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600', 'gallery', 'Зал конференції', 2),
(1, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600', 'gallery', 'Учасники конференції', 3),
(2, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200', 'banner', 'Воркшоп', 1),
(3, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200', 'banner', 'Мастеркласс', 1),
(4, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200', 'banner', 'Нетворкінг', 1),
(5, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200', 'banner', 'Вебінар про AI', 1);

-- Event Agenda/Schedule for Event 1
INSERT INTO event_agenda (event_id, title, description, start_time, end_time, room_name, item_type, order_position) VALUES
(1, 'Реєстрація учасників', 'Реєстрація, кава, спілкування', '2025-06-15 08:30:00', '2025-06-15 09:00:00', NULL, 'break', 1),
(1, 'Відкриття конференції', 'Вступна лекція', '2025-06-15 09:00:00', '2025-06-15 10:00:00', 'Головна сцена', 'keynote', 2),
(1, 'Чай/Кава', 'Перерва', '2025-06-15 10:00:00', '2025-06-15 10:15:00', NULL, 'break', 3),
(1, 'Панельна дискусія', 'Масштабування та зростання', '2025-06-15 10:15:00', '2025-06-15 11:45:00', 'Зал А', 'session', 4),
(1, 'Обід', 'Буфет', '2025-06-15 11:45:00', '2025-06-15 13:00:00', NULL, 'break', 5),
(1, 'Паралельні сесії', 'Цифрова трансформація', '2025-06-15 13:00:00', '2025-06-15 14:30:00', 'Зал Б', 'session', 6),
(1, 'Перерва', 'Чай/Кава/Спілкування', '2025-06-15 14:30:00', '2025-06-15 14:45:00', NULL, 'break', 7),
(1, 'Закриття першого дня', 'Підсумки і анонси', '2025-06-15 14:45:00', '2025-06-15 15:30:00', 'Головна сцена', 'keynote', 8);

-- Event Reviews for Event 1
INSERT INTO event_reviews (event_id, customer_id, rating, review_title, review_text, is_verified_purchase, created_at) VALUES
(1, NULL, 5, 'Відмінна конференція', 'Відмінна конференція! Дуже цікаві доповіді та корисне спілкування.', false, NOW() - INTERVAL '10 days'),
(1, NULL, 5, 'Буду обов''язково учасником', 'Буду обов''язково учасником наступного року. Спасибі за организацію!', false, NOW() - INTERVAL '8 days'),
(1, NULL, 4, 'Гарна подія', 'Гарна подія, але кавою можна було б краще', false, NOW() - INTERVAL '5 days');

-- Event notifications excluded - customer_id is required in schema
