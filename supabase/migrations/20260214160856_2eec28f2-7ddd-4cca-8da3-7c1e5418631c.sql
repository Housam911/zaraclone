
-- Subcategories table
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories viewable by everyone" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Admins can insert subcategories" ON public.subcategories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update subcategories" ON public.subcategories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete subcategories" ON public.subcategories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Available sizes table
CREATE TABLE public.available_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.available_sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sizes viewable by everyone" ON public.available_sizes FOR SELECT USING (true);
CREATE POLICY "Admins can insert sizes" ON public.available_sizes FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update sizes" ON public.available_sizes FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete sizes" ON public.available_sizes FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
