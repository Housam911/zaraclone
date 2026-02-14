
CREATE TABLE public.available_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.available_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Colors viewable by everyone" ON public.available_colors FOR SELECT USING (true);
CREATE POLICY "Admins can insert colors" ON public.available_colors FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update colors" ON public.available_colors FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete colors" ON public.available_colors FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
