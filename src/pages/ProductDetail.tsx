import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-secondary animate-pulse" />
            <div className="space-y-6">
              <div className="h-4 w-24 bg-secondary animate-pulse" />
              <div className="h-10 w-64 bg-secondary animate-pulse" />
              <div className="h-6 w-20 bg-secondary animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="font-display text-3xl mb-4">Product not found</h1>
          <Link to="/" className="text-accent hover:underline font-body text-sm tracking-wider uppercase">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  // Build image list from image_url + images array
  const allImages: string[] = [];
  if (product.image_url) allImages.push(product.image_url);
  if (product.images) {
    product.images.forEach((img) => {
      if (img && !allImages.includes(img)) allImages.push(img);
    });
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-[3/4] bg-secondary overflow-hidden">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-lg">
                  No Image
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-24 overflow-hidden border-2 transition-colors ${
                      idx === selectedImage ? "border-accent" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Category & Name */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase font-body">
                {product.category}
                {product.subcategory ? ` / ${product.subcategory}` : ""}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl capitalize leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {product.original_price && (
                <span className="text-muted-foreground line-through text-lg font-body">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
              <span className="font-display text-3xl">${product.price.toFixed(2)}</span>
              {discount && (
                <span className="bg-accent text-accent-foreground text-xs font-body font-semibold px-2.5 py-1 tracking-wider">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="font-body text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <p className="font-body text-xs tracking-[0.2em] uppercase font-medium">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                      className={`min-w-[3rem] h-11 px-4 border text-xs tracking-wider uppercase font-body font-medium transition-colors ${
                        size === selectedSize
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <p className="font-body text-xs tracking-[0.2em] uppercase font-medium">
                  Color{selectedColor ? `: ${selectedColor}` : ""}
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                        color === selectedColor
                          ? "border-foreground scale-110"
                          : "border-border hover:border-muted-foreground"
                      }`}
                      title={color}
                    >
                      <span
                        className="absolute inset-1 rounded-full"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-6">
                <p className="font-body text-xs tracking-[0.2em] uppercase font-medium">Qty</p>
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-secondary transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 font-body font-medium text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-secondary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Bag
              </button>
            </div>

            {/* Stock */}
            <p className={`font-body text-xs tracking-wider ${product.in_stock ? "text-green-600" : "text-destructive"}`}>
              {product.in_stock ? "In Stock" : "Out of Stock"}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
