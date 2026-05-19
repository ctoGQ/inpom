-- Onboarding Questionnaire System for Women's Parliament
-- Created: 2026-05-19
-- Purpose: Collect onboarding survey data during user registration flow

-- Table: Onboarding Questions and Answer Options
CREATE TABLE IF NOT EXISTS onboarding_questions (
    id SERIAL PRIMARY KEY,
    question_number INT NOT NULL UNIQUE,
    question_text VARCHAR(500) NOT NULL,
    answer_option_1 VARCHAR(200) NOT NULL,
    answer_option_2 VARCHAR(200) NOT NULL,
    answer_option_3 VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'interests', 'motivation', 'business', 'personal', 'vision'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Customer Onboarding Responses (stores survey answers)
CREATE TABLE IF NOT EXISTS customer_onboarding_responses (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL UNIQUE,
    question_1_answer VARCHAR(200),
    question_2_answer VARCHAR(200),
    question_3_answer VARCHAR(200),
    question_4_answer VARCHAR(200),
    question_5_answer VARCHAR(200),
    question_6_answer VARCHAR(200),
    question_7_answer VARCHAR(200),
    question_8_answer VARCHAR(200),
    question_9_answer VARCHAR(200),
    question_10_answer VARCHAR(200),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX idx_customer_onboarding_responses_customer_id 
    ON customer_onboarding_responses(customer_id);
CREATE INDEX idx_customer_onboarding_responses_completed_at 
    ON customer_onboarding_responses(completed_at);

-- Insert Onboarding Questions with Answer Options
-- These questions are designed to collect information about:
-- - Professional interests and background
-- - Motivation for joining Women's Parliament
-- - Business goals and entrepreneurship
-- - Personal goals and values
-- - Vision for women's empowerment

INSERT INTO onboarding_questions 
(question_number, question_text, answer_option_1, answer_option_2, answer_option_3, category) 
VALUES

-- Questions 1-2: Professional & Business Interests
(1, 
'Яка сфера вас найбільш цікавить для професійного розвитку?',
'Технології, IT та інновації',
'Бізнес, менеджмент та лідерство',
'Освіта, соціальна робота та НГО',
'interests'),

(2, 
'Яке ваше основне заняття на даний момент?',
'Повний робочий день на найманій роботі',
'Власна справа / підприємство',
'Фріланс, дистанційна робота або пошук роботи',
'interests'),

-- Questions 3-4: Motivation & Community Engagement
(3, 
'Чому ви вирішили приєднатися до Парламенту Жінок?',
'Розширити мережу контактів і знайти однодумців',
'Отримати нові знання й компетенції',
'Внести вклад в розвиток жінок-лідерів в Україні',
'motivation'),

(4, 
'Наскільки активно ви беруть участь у громадській діяльності?',
'Вперше беру участь в організованому русі',
'Час від часу беру участь в суспільних ініціативах',
'Постійно залучена до громадської роботи',
'motivation'),

-- Questions 5-6: Business Goals & Entrepreneurship
(5, 
'Які ваші основні бізнес-цілі на найближчі 2-3 роки?',
'Засновувати стартап або власну справу',
'Розширити існуючий бізнес / масштабувати',
'Отримати просування по кар''єрній драбині',
'business'),

(6, 
'Якими навичками ви хотіли б удосконалитися?',
'Фінансовий аналіз, інвестування та управління капіталом',
'Продажі, маркетинг та побудова бренду',
'Стратегічне планування та операційний менеджмент',
'business'),

-- Questions 7-8: Personal Goals & Values
(7, 
'Які особисті цілі вас мотивують найбільше?',
'Фінансова незалежність та матеріальний успіх',
'Баланс між сім''єю, здоров''ям та кар''єрою',
'Самовиразення, творчість та особистісний розвиток',
'personal'),

(8, 
'Які цінності найважливіші для вас у житті?',
'Сімейні стосунки, родина та близькі люди',
'Справедливість, рівність та соціальна відповідальність',
'Автономія, свобода вибору та самовизначення',
'personal'),

-- Questions 9-10: Vision & Impact
(9, 
'Яким ви бачите свій внесок у розвиток жіночого лідерства?',
'Стати успішним прикладом і надихати інших жінок',
'Допомогти молодим жінкам розвивати свої навички',
'Змінювати системні проблеми і впливати на законодавство',
'vision'),

(10, 
'Яка ваша мрія щодо розвитку економіки для жінок в Україні?',
'Більше можливостей для жіночого підприємництва',
'Рівна оплата праці та однакові перспективи кар''єри',
'Побудова сильної спільноти жінок-лідерів та наставниць',
'vision');

-- Optional: Add column to customers table to track onboarding completion
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;
