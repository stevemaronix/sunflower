ALTER TABLE public.songs 
ADD CONSTRAINT fk_artist 
FOREIGN KEY (artist_id)
REFERENCES artists(id);
ALTER TABLE public.songs
DROP COLUMN artist;