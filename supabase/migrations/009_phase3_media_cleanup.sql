-- Phase 3: replace a known broken Unsplash tour image URL.
-- The replacement comes from the same tour gallery seed record.

UPDATE tours
SET cover_image = 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&q=80&auto=format'
WHERE cover_image = 'https://images.unsplash.com/photo-1538485399081-7a48eb296a40?w=1200&q=80&auto=format';

UPDATE tours
SET images = array_replace(
  images,
  'https://images.unsplash.com/photo-1538485399081-7a48eb296a40?w=800&q=75&auto=format',
  'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=75&auto=format'
)
WHERE images @> ARRAY['https://images.unsplash.com/photo-1538485399081-7a48eb296a40?w=800&q=75&auto=format'];
