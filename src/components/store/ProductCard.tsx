import { Heart } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface ProductCardProps {
  product: Tables<"products">;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const whatsappMessage = encodeURIComponent(
    `Hello, I want to order: ${product.name} | ${product.category}${product.subcategory ? ` / ${product.subcategory}` : ''} | Price: $${product.price}`
  );

  return (
    <div className="group cursor-pointer animate-fade-in">
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
        {discount && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-body font-semibold px-2.5 py-1 tracking-wider">
            -{discount}%
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />

        {/* Quick actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <a
            href={`https://wa.me/96179357527?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-primary text-primary-foreground text-center py-3 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Order on WhatsApp
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground tracking-[0.1em] uppercase font-body">
          {product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}
        </p>
        <h3 className="font-display text-lg capitalize">{product.name}</h3>
        <div className="flex items-center gap-2">
          {product.original_price && (
            <span className="text-muted-foreground line-through text-sm font-body">
              ${product.original_price.toFixed(2)}
            </span>
          )}
          <span className="font-body font-semibold text-base">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
