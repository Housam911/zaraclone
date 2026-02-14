import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  const whatsappOrder = () => {
    const lines = items.map(
      (i) => `• ${i.product.name} (x${i.quantity}) — $${(i.product.price * i.quantity).toFixed(2)}`
    );
    const message = encodeURIComponent(
      `Hello, I'd like to order:\n${lines.join("\n")}\n\nTotal: $${totalPrice.toFixed(2)}`
    );
    window.open(`https://wa.me/96179357527?text=${message}`, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl tracking-wider uppercase">
            Shopping Bag ({totalItems})
          </SheetTitle>
          <SheetDescription className="sr-only">Your shopping cart items</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 stroke-1" />
            <p className="font-body text-sm tracking-wider uppercase">Your bag is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <p className="text-xs text-muted-foreground tracking-wider uppercase font-body">
                        {item.product.category}
                      </p>
                      <h4 className="font-display text-sm capitalize truncate">{item.product.name}</h4>
                      <p className="font-body font-semibold text-sm mt-0.5">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-secondary transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs font-body font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-secondary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-body text-sm tracking-wider uppercase">Total</span>
                <span className="font-display text-lg">${totalPrice.toFixed(2)}</span>
              </div>

              <Button
                onClick={whatsappOrder}
                className="w-full py-6 text-xs tracking-[0.2em] uppercase font-body font-medium"
              >
                Order on WhatsApp
              </Button>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider uppercase font-body py-2"
              >
                Clear bag
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
