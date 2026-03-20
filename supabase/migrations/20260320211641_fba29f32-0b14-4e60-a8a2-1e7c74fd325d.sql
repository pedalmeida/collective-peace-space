
-- Restrict uploads on the media bucket to image MIME types only
-- This enforces server-side validation that cannot be bypassed by spoofing file.type

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'media';
