-- Create Events Database Schema
-- Complete system for online events management

-- 1. Events table - основная таблица событий
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  banner_image_url VARCHAR(500),
  thumbnail_image_url VARCHAR(500),
  
  -- Event details
  event_type VARCHAR(50) NOT NULL, -- 'webinar', 'conference', 'workshop', 'masterclass', 'concert', 'exhibition'
  category_id INTEGER,
  
  -- Dates and time
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  registration_deadline TIMESTAMP,
  
  -- Location
  region VARCHAR(100), -- 'Київ', 'Львів', 'Харків', 'Одеса', 'Online'
  city VARCHAR(100),
  venue_name VARCHAR(255),
  address VARCHAR(500),
  is_online BOOLEAN DEFAULT true,
  stream_url VARCHAR(500),
  
  -- Capacity and pricing
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  ticket_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INPOM',
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  
  -- Status and visibility
  status VARCHAR(50) NOT NULL, -- 'draft', 'published', 'ongoing', 'completed', 'cancelled'
  is_featured BOOLEAN DEFAULT false,
  visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'private', 'members_only'
  
  -- Organizer
  organizer_id INTEGER NOT NULL,
  organizer_name VARCHAR(255),
  organizer_description TEXT,
  organizer_avatar_url VARCHAR(500),
  organizer_contact_email VARCHAR(255),
  organizer_contact_phone VARCHAR(20),
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  
  CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) REFERENCES customers(id)
);

-- 2. Event sessions table - для нескольких сессій одного события
CREATE TABLE IF NOT EXISTS event_sessions (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  title VARCHAR(255),
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  speaker_name VARCHAR(255),
  speaker_bio TEXT,
  speaker_avatar_url VARCHAR(500),
  room_name VARCHAR(100),
  max_capacity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 3. Event tickets table - типи квитків
CREATE TABLE IF NOT EXISTS event_tickets (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  ticket_type VARCHAR(100) NOT NULL, -- 'standard', 'vip', 'early_bird', 'student', 'group'
  ticket_name VARCHAR(255),
  description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  quantity_available INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Date restrictions
  sale_start_date TIMESTAMP,
  sale_end_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_tickets FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 4. Event registrations/purchases table
CREATE TABLE IF NOT EXISTS event_registrations (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  ticket_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  registration_status VARCHAR(50) NOT NULL, -- 'registered', 'confirmed', 'attended', 'cancelled', 'no_show'
  
  -- Payment info
  payment_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- 'card_balance', 'wallet', 'crypto'
  payment_status VARCHAR(50), -- 'pending', 'completed', 'failed', 'refunded'
  transaction_id INTEGER,
  
  -- Registration details
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone_number VARCHAR(20),
  company_name VARCHAR(255),
  job_title VARCHAR(255),
  special_requirements TEXT,
  
  -- QR code for check-in
  qr_code_url VARCHAR(500),
  check_in_time TIMESTAMP,
  is_attended BOOLEAN DEFAULT false,
  
  -- Timestamps
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_reg FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_ticket_reg FOREIGN KEY (ticket_id) REFERENCES event_tickets(id),
  CONSTRAINT fk_customer_reg FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 5. Event categories table
CREATE TABLE IF NOT EXISTS event_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(500),
  icon_url VARCHAR(500),
  color_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Event reviews/ratings table
CREATE TABLE IF NOT EXISTS event_reviews (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(255),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_review FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_customer_review FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 7. Event speakers table
CREATE TABLE IF NOT EXISTS event_speakers (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  speaker_name VARCHAR(255) NOT NULL,
  speaker_bio TEXT,
  avatar_url VARCHAR(500),
  email VARCHAR(255),
  social_links TEXT, -- JSON with social profiles
  expertise VARCHAR(500),
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_speaker FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 8. Event sponsors table
CREATE TABLE IF NOT EXISTS event_sponsors (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  sponsor_name VARCHAR(255) NOT NULL,
  sponsor_type VARCHAR(50), -- 'gold', 'silver', 'bronze', 'partner'
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  description TEXT,
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_sponsor FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 9. Event agenda items table
CREATE TABLE IF NOT EXISTS event_agenda (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  session_id INTEGER,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  speaker_id INTEGER,
  room_name VARCHAR(100),
  item_type VARCHAR(50), -- 'session', 'break', 'networking', 'keynote'
  order_position INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_agenda FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_session_agenda FOREIGN KEY (session_id) REFERENCES event_sessions(id),
  CONSTRAINT fk_speaker_agenda FOREIGN KEY (speaker_id) REFERENCES event_speakers(id)
);

-- 10. Event notifications/reminders
CREATE TABLE IF NOT EXISTS event_notifications (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  registration_id INTEGER,
  customer_id INTEGER NOT NULL,
  notification_type VARCHAR(50), -- 'event_starts_soon', 'session_starts', 'reminder', 'thank_you'
  message TEXT,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_notif FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_reg_notif FOREIGN KEY (registration_id) REFERENCES event_registrations(id),
  CONSTRAINT fk_customer_notif FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 11. Event images/gallery
CREATE TABLE IF NOT EXISTS event_images (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_type VARCHAR(50), -- 'banner', 'thumbnail', 'gallery', 'speaker'
  alt_text VARCHAR(255),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_event_images FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_region ON events(region);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_event_registrations_customer ON event_registrations(customer_id);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(registration_status);

-- Insert sample event categories
INSERT INTO event_categories (name, slug, description, color_code) VALUES
('Webinar', 'webinar', 'Online training and presentations', '#3B82F6'),
('Conference', 'conference', 'Large scale professional conferences', '#8B5CF6'),
('Workshop', 'workshop', 'Hands-on learning sessions', '#EC4899'),
('Masterclass', 'masterclass', 'Expert-led advanced training', '#F59E0B'),
('Concert', 'concert', 'Musical performances and events', '#EF4444'),
('Exhibition', 'exhibition', 'Art and product exhibitions', '#10B981'),
('Networking', 'networking', 'Professional networking events', '#06B6D4')
ON CONFLICT DO NOTHING;
