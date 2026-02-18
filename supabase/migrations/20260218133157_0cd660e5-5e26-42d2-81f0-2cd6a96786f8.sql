
ALTER TABLE public.products ADD COLUMN stock_quantity integer NOT NULL DEFAULT 0;

-- Update existing products: set quantity based on in_stock
UPDATE public.products SET stock_quantity = CASE WHEN in_stock THEN 10 ELSE 0 END;

-- Create trigger to auto-sync in_stock based on quantity
CREATE OR REPLACE FUNCTION public.sync_in_stock_from_quantity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.in_stock = NEW.stock_quantity > 0;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_stock_status
BEFORE INSERT OR UPDATE OF stock_quantity ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.sync_in_stock_from_quantity();
