import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const useGlobalDiscount = () => {
  return useQuery({
    queryKey: ["global-discount"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "discount_percentage")
        .single();
      if (error) return 0;
      return parseFloat(data.value) || 0;
    },
    staleTime: 60_000,
  });
};

/**
 * Get effective pricing for a product considering global discount.
 * Product-specific discount takes priority over global discount.
 */
export function getEffectivePricing(
  product: Tables<"products">,
  globalDiscount: number
) {
  const hasProductDiscount = product.original_price && product.original_price > product.price;

  if (hasProductDiscount) {
    // Product has its own discount — use it
    const discount = Math.round(
      ((product.original_price! - product.price) / product.original_price!) * 100
    );
    return {
      displayPrice: product.price,
      originalPrice: product.original_price,
      discountPercent: discount,
    };
  }

  if (globalDiscount > 0) {
    // Apply global discount
    const originalPrice = product.price;
    const displayPrice = +(originalPrice * (1 - globalDiscount / 100)).toFixed(2);
    return {
      displayPrice,
      originalPrice,
      discountPercent: globalDiscount,
    };
  }

  // No discount at all
  return {
    displayPrice: product.price,
    originalPrice: null as number | null,
    discountPercent: null as number | null,
  };
}
