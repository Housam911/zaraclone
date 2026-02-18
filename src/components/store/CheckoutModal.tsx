import { useState } from "react";
import { X, MessageCircle, Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useGlobalDiscount, getEffectivePricing } from "@/hooks/use-global-discount";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

const CheckoutModal = ({ open, onClose }: CheckoutModalProps) => {
  const { items, clearCart, setIsOpen } = useCart();
  const { data: globalDiscount = 0 } = useGlobalDiscount();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: supportPhone } = useQuery({
    queryKey: ["support-phone"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "support_phone")
        .maybeSingle();
      if (error || !data) return null;
      return data.value;
    },
    staleTime: 60_000,
  });

  const effectiveTotal = items.reduce((sum, i) => {
    const { displayPrice } = getEffectivePricing(i.product, globalDiscount);
    return sum + displayPrice * i.quantity;
  }, 0);

  const isValid = name.trim().length > 0 && phone.trim().length > 0;

  const saveOrder = async (method: "email" | "whatsapp") => {
    setLoading(true);
    try {
      // Insert order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: name.trim().slice(0, 100),
          customer_email: email.trim().slice(0, 255) || null,
          customer_phone: phone.trim().slice(0, 30),
          customer_address: address.trim().slice(0, 500) || null,
          customer_note: note.trim().slice(0, 1000) || null,
          order_method: method,
          total: effectiveTotal,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = items.map((item) => {
        const { displayPrice } = getEffectivePricing(item.product, globalDiscount);
        return {
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.image_url,
          selected_size: item.selectedSize || null,
          selected_color: item.selectedColor || null,
          quantity: item.quantity,
          unit_price: displayPrice,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order.id;
    } catch (error: any) {
      toast({ title: "Error placing order", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOrder = async () => {
    const orderId = await saveOrder("email");
    if (orderId) {
      clearCart();
      setIsOpen(false);
      onClose();
      toast({
        title: "Order placed!",
        description: "Your order has been submitted. We'll contact you shortly to confirm.",
      });
    }
  };

  const handleWhatsAppOrder = async () => {
    const orderId = await saveOrder("whatsapp");
    if (orderId) {
      const phoneDigits = (supportPhone || "96171786787").replace(/[^0-9]/g, "");
      const lines = items.map((i) => {
        const { displayPrice } = getEffectivePricing(i.product, globalDiscount);
        return `${i.product.name}${i.selectedSize ? ` | Size: ${i.selectedSize}` : ""}${i.selectedColor ? ` | Color: ${i.selectedColor}` : ""} | $${displayPrice.toFixed(2)}${i.quantity > 1 ? ` x${i.quantity}` : ""}`;
      });
      const text = `Hello, I'd like to place an order:\n\nName: ${name}\nPhone: ${phone}${email ? `\nEmail: ${email}` : ""}${address ? `\nAddress: ${address}` : ""}${note ? `\nNote: ${note}` : ""}\n\nItems:\n${lines.join("\n")}\n\nTotal: $${effectiveTotal.toFixed(2)}\n\nOrder ID: ${orderId}`;
      const url = `https://api.whatsapp.com/send?phone=${phoneDigits}&text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");

      clearCart();
      setIsOpen(false);
      onClose();
      toast({ title: "Order placed!", description: "Complete the order on WhatsApp." });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-background w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-display text-2xl mb-1">Checkout</h2>
        <p className="font-body text-sm text-muted-foreground mb-6">
          Fill in your details and choose how to order
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs tracking-[0.1em] uppercase font-body font-medium mb-1.5">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              maxLength={100}
              className="bg-secondary border-none rounded-none py-5"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.1em] uppercase font-body font-medium mb-1.5">
              Phone <span className="text-destructive">*</span>
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+961 71 786 787"
              maxLength={30}
              className="bg-secondary border-none rounded-none py-5"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.1em] uppercase font-body font-medium mb-1.5">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              maxLength={255}
              className="bg-secondary border-none rounded-none py-5"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.1em] uppercase font-body font-medium mb-1.5">
              Delivery Address
            </label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, area..."
              maxLength={500}
              rows={2}
              className="bg-secondary border-none rounded-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.1em] uppercase font-body font-medium mb-1.5">
              Note
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions..."
              maxLength={1000}
              rows={2}
              className="bg-secondary border-none rounded-none resize-none"
            />
          </div>

          {/* Order summary */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-body text-sm tracking-wider uppercase">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
              <span className="font-display text-lg">${effectiveTotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleWhatsAppOrder}
                disabled={!isValid || loading}
                className="flex items-center justify-center gap-2 py-6 rounded-none text-xs tracking-[0.15em] uppercase font-body font-medium bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                WhatsApp
              </Button>
              <Button
                onClick={handleEmailOrder}
                disabled={!isValid || loading}
                className="flex items-center justify-center gap-2 py-6 rounded-none text-xs tracking-[0.15em] uppercase font-body font-medium"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
