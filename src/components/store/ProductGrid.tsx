import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";
import type { Tables } from "@/integrations/supabase/types";

const categories = [
  { value: "all", label: "All" },
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "kids", label: "Kids" },
] as const;

const ProductGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const activeSubcategory = searchParams.get("subcategory") || "all";

  // Fetch distinct subcategories for the selected category
  const { data: subcategories } = useQuery({
    queryKey: ["product-subcategories", activeCategory],
    queryFn: async () => {
      if (activeCategory === "all") return [];
      const { data, error } = await supabase
        .from("products")
        .select("subcategory")
        .eq("category", activeCategory as Tables<"products">["category"])
        .not("subcategory", "is", null);
      if (error) throw error;
      const unique = [...new Set(data.map((p) => p.subcategory).filter(Boolean))] as string[];
      return unique.sort();
    },
    enabled: activeCategory !== "all",
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", activeCategory, activeSubcategory],
    queryFn: async () => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory as Tables<"products">["category"]);
      }
      if (activeSubcategory !== "all") {
        query = query.eq("subcategory", activeSubcategory);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="products" className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
      <ScrollReveal>
        <div className="text-center mb-12 space-y-4">
          <p className="text-accent font-body text-sm tracking-[0.3em] uppercase">Curated For You</p>
          <h2 className="font-display text-4xl lg:text-5xl">Our Collection</h2>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="flex justify-center gap-1 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                if (cat.value === "all") {
                  searchParams.delete("category");
                } else {
                  searchParams.set("category", cat.value);
                }
                searchParams.delete("subcategory");
                setSearchParams(searchParams);
              }}
              className={`px-6 py-2.5 text-xs tracking-[0.2em] uppercase font-body font-medium transition-all ${
                activeCategory === cat.value || (cat.value === "all" && !searchParams.get("category"))
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {subcategories && subcategories.length > 0 && (
        <ScrollReveal>
          <div className="flex justify-center flex-wrap gap-1 mb-12 -mt-6">
            <button
              onClick={() => {
                searchParams.delete("subcategory");
                setSearchParams(searchParams);
              }}
              className={`px-5 py-2 text-[11px] tracking-[0.15em] uppercase font-body font-medium transition-all rounded-full ${
                activeSubcategory === "all"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  searchParams.set("subcategory", sub);
                  setSearchParams(searchParams);
                }}
                className={`px-5 py-2 text-[11px] tracking-[0.15em] uppercase font-body font-medium transition-all rounded-full ${
                  activeSubcategory === sub
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </ScrollReveal>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-[3/4] bg-secondary rounded" />
              <div className="h-3 bg-secondary rounded w-1/3" />
              <div className="h-4 bg-secondary rounded w-2/3" />
              <div className="h-3 bg-secondary rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 0.06}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-muted-foreground mb-2">No products yet</p>
          <p className="font-body text-muted-foreground text-sm">Products will appear here once added by the admin.</p>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
