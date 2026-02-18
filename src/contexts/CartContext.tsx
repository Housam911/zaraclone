import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Tables } from "@/integrations/supabase/types";

export interface CartItem {
  product: Tables<"products">;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Tables<"products">, selectedSize?: string | null, selectedColor?: string | null) => boolean;
  removeItem: (productId: string, selectedSize?: string | null, selectedColor?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string | null, selectedColor?: string | null) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, selectedSize?: string | null, selectedColor?: string | null) => number;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Tables<"products">, selectedSize?: string | null, selectedColor?: string | null): boolean => {
    const stockQty = (product as any).stock_quantity ?? Infinity;
    const cartKey = `${product.id}-${selectedSize || ''}-${selectedColor || ''}`;
    
    let success = true;
    setItems((prev) => {
      const existing = prev.find((i) => `${i.product.id}-${i.selectedSize || ''}-${i.selectedColor || ''}` === cartKey);
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty >= stockQty) {
        success = false;
        return prev;
      }
      if (existing) {
        return prev.map((i) =>
          `${i.product.id}-${i.selectedSize || ''}-${i.selectedColor || ''}` === cartKey
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, selectedSize, selectedColor }];
    });
    if (success) setIsOpen(true);
    return success;
  }, []);

  const removeItem = useCallback((productId: string, selectedSize?: string | null, selectedColor?: string | null) => {
    const cartKey = `${productId}-${selectedSize || ''}-${selectedColor || ''}`;
    setItems((prev) => prev.filter((i) => `${i.product.id}-${i.selectedSize || ''}-${i.selectedColor || ''}` !== cartKey));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, selectedSize?: string | null, selectedColor?: string | null) => {
    const cartKey = `${productId}-${selectedSize || ''}-${selectedColor || ''}`;
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => `${i.product.id}-${i.selectedSize || ''}-${i.selectedColor || ''}` !== cartKey));
    } else {
      setItems((prev) =>
        prev.map((i) => {
          if (`${i.product.id}-${i.selectedSize || ''}-${i.selectedColor || ''}` !== cartKey) return i;
          const stockQty = (i.product as any).stock_quantity ?? Infinity;
          return { ...i, quantity: Math.min(quantity, stockQty) };
        })
      );
    }
  }, []);

  const getItemQuantity = useCallback((productId: string, selectedSize?: string | null, selectedColor?: string | null) => {
    const cartKey = `${productId}-${selectedSize || ''}-${selectedColor || ''}`;
    const item = items.find((i) => `${i.product.id}-${i.selectedSize || ''}-${i.selectedColor || ''}` === cartKey);
    return item?.quantity || 0;
  }, [items]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, getItemQuantity, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
