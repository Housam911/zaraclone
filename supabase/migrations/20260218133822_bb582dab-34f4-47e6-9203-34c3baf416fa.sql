
-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'approved', 'rejected');

-- Create orders table (no auth required for customers)
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  customer_address text,
  customer_note text,
  order_method text NOT NULL DEFAULT 'email', -- 'email' or 'whatsapp'
  status public.order_status NOT NULL DEFAULT 'pending',
  total numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  product_image text,
  selected_size text,
  selected_color text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Anyone can place an order (no auth needed)
CREATE POLICY "Anyone can insert orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

-- Only admins can view/update/delete orders
CREATE POLICY "Admins can view orders"
ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete orders"
ON public.orders FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view order items"
ON public.order_items FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete order items"
ON public.order_items FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
