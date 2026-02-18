
-- Function to decrement stock when order is approved
CREATE OR REPLACE FUNCTION public.decrement_stock_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only run when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    UPDATE public.products p
    SET stock_quantity = GREATEST(p.stock_quantity - oi.quantity, 0)
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND p.id = oi.product_id;
  END IF;

  -- Restore stock if status changes FROM 'approved' to something else
  IF OLD.status = 'approved' AND NEW.status IS DISTINCT FROM 'approved' THEN
    UPDATE public.products p
    SET stock_quantity = p.stock_quantity + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND p.id = oi.product_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_decrement_stock_on_approval
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.decrement_stock_on_approval();
