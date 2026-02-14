
-- Fix subcategories policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Admins can insert subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Admins can update subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Admins can delete subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Subcategories viewable by everyone" ON public.subcategories;

CREATE POLICY "Subcategories viewable by everyone" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Admins can insert subcategories" ON public.subcategories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update subcategories" ON public.subcategories FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete subcategories" ON public.subcategories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix available_sizes policies
DROP POLICY IF EXISTS "Admins can insert sizes" ON public.available_sizes;
DROP POLICY IF EXISTS "Admins can update sizes" ON public.available_sizes;
DROP POLICY IF EXISTS "Admins can delete sizes" ON public.available_sizes;
DROP POLICY IF EXISTS "Sizes viewable by everyone" ON public.available_sizes;

CREATE POLICY "Sizes viewable by everyone" ON public.available_sizes FOR SELECT USING (true);
CREATE POLICY "Admins can insert sizes" ON public.available_sizes FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update sizes" ON public.available_sizes FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete sizes" ON public.available_sizes FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix available_colors policies
DROP POLICY IF EXISTS "Admins can insert colors" ON public.available_colors;
DROP POLICY IF EXISTS "Admins can update colors" ON public.available_colors;
DROP POLICY IF EXISTS "Admins can delete colors" ON public.available_colors;
DROP POLICY IF EXISTS "Colors viewable by everyone" ON public.available_colors;

CREATE POLICY "Colors viewable by everyone" ON public.available_colors FOR SELECT USING (true);
CREATE POLICY "Admins can insert colors" ON public.available_colors FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update colors" ON public.available_colors FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete colors" ON public.available_colors FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix products policies
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
