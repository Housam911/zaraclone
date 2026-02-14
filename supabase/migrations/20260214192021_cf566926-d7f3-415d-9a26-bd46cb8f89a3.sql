
-- Create a key-value store settings table
CREATE TABLE public.store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Settings viewable by everyone"
ON public.store_settings FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert settings"
ON public.store_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
ON public.store_settings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings"
ON public.store_settings FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed the free shipping threshold
INSERT INTO public.store_settings (key, value, label) VALUES
('free_shipping_threshold', '100', 'Free Shipping Threshold ($)');
