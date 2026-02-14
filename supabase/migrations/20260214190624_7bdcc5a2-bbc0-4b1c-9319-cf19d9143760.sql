
-- Create hero_slides table
CREATE TABLE public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subtitle TEXT NOT NULL DEFAULT '',
  title_line1 TEXT NOT NULL DEFAULT '',
  title_line2 TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Everyone can view slides
CREATE POLICY "Hero slides viewable by everyone"
ON public.hero_slides FOR SELECT
USING (true);

-- Only admins can manage slides
CREATE POLICY "Admins can insert hero slides"
ON public.hero_slides FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update hero slides"
ON public.hero_slides FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete hero slides"
ON public.hero_slides FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger
CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with current hardcoded slides
INSERT INTO public.hero_slides (subtitle, title_line1, title_line2, description, sort_order) VALUES
('New Collection 2026', 'MY', 'SHOP', 'Discover curated pieces that define modern sophistication. Where luxury meets everyday wearability.', 0),
('Men''s Essentials', 'TAILORED', 'ELEGANCE', 'Refined silhouettes and impeccable craftsmanship for the modern gentleman.', 1),
('Luxury Accessories', 'TIMELESS', 'DETAILS', 'Statement pieces that elevate every outfit. Curated leather goods and accessories.', 2);
