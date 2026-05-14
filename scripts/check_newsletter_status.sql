-- Verify and fix newsletter articles data
SELECT id, title, status, published_at FROM newsletter_articles LIMIT 5;

-- If needed, update status to 'published'
UPDATE newsletter_articles 
SET status = 'published' 
WHERE status IS NULL OR status != 'published';

-- Verify categories
SELECT id, name FROM newsletter_categories LIMIT 5;

-- Check article count
SELECT COUNT(*) as total_articles FROM newsletter_articles WHERE status = 'published';
