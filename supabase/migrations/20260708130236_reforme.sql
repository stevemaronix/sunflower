ALTER TABLE public.songs ADD COLUMN groupe bigint;
ALTER TABLE public.songs ADD COLUMN artist_id bigint;
UPDATE public.songs s 
SET artist_id = a.id
FROM artists a
WHERE s.artiste = a.name;
ALTER TABLE public.songs RENAME COLUMN artiste TO artist;