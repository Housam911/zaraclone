import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { useCart } from "@/contexts/CartContext";
import { useGlobalDiscount, getEffectivePricing } from "@/hooks/use-global-discount";

interface ProductCardProps {
  product: Tables<"products">;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { data: globalDiscount = 0 } = useGlobalDiscount();
  const { displayPrice, originalPrice, discountPercent } = getEffectivePricing(product, globalDiscount);

  return (
    <div className="group animate-fade-in">
      <Link to={`/product/${product.id}`} className="cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-lg">
            No Image
          </div>
        )}

        {/* Discount badge */}
        {discountPercent && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-body font-semibold px-2.5 py-1 tracking-wider">
            -{discountPercent}%
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />

        {/* Quick actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product); }}
            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground text-center py-3 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Bag
          </button>
        </div>
      </div>
      </Link>

      {/* Info */}
      <div className="space-y-1 mt-4">
        <p className="text-xs text-muted-foreground tracking-[0.1em] uppercase font-body">
          {product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-lg capitalize hover:text-accent transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          {originalPrice && (
            <span className="text-muted-foreground line-through text-sm font-body">
              ${originalPrice.toFixed(2)}
            </span>
          )}
          <span className="font-body font-semibold text-base">
            ${displayPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
