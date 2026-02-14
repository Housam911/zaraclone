import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, LogOut, Edit, X, Upload, ArrowLeft, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import AdminSettings from "./AdminSettings";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Tables<"products"> | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "settings">("products");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-display text-xl">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 mr-2">
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-2 text-xs tracking-[0.1em] uppercase font-body font-medium transition-all ${
                  activeTab === "products"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 text-xs tracking-[0.1em] uppercase font-body font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === "settings"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </button>
            </div>
            {activeTab === "products" && (
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }}
                className="bg-accent text-accent-foreground rounded-none text-xs tracking-[0.1em] uppercase hover:bg-gold-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-none text-xs tracking-[0.1em] uppercase"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {activeTab === "settings" ? (
          <AdminSettings />
        ) : (
        <>
        {/* Product form modal */}
        {isFormOpen && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-none rounded-none py-5"
            />
          </div>
          <div className="flex gap-1">
            {["all", "women", "men", "kids"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2.5 text-xs tracking-[0.15em] uppercase font-body font-medium transition-all ${
                  filterCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products table */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-secondary animate-pulse rounded" />
            ))}
          </div>
        ) : (() => {
          const filtered = (products || []).filter((p) => {
            const matchesCategory = filterCategory === "all" || p.category === filterCategory;
            const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
          });

          // Group by category
          const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, p) => {
            const key = p.category;
            if (!acc[key]) acc[key] = [];
            acc[key].push(p);
            return acc;
          }, {});

          const categoryOrder = ["women", "men", "kids"];
          const sortedKeys = categoryOrder.filter((k) => grouped[k]);

          return sortedKeys.length > 0 ? (
            <div className="space-y-8">
              {sortedKeys.map((cat) => (
                <div key={cat}>
                  <h3 className="font-display text-lg capitalize mb-3 flex items-center gap-2">
                    {cat}
                    <span className="text-xs font-body text-muted-foreground tracking-wider">
                      ({grouped[cat].length})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {grouped[cat].map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-card border border-border hover:border-accent/30 transition-colors"
              >
                {/* Image */}
                <div className="w-16 h-20 bg-secondary flex-shrink-0 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No img
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base capitalize truncate">{product.name}</h3>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
                    {product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="font-body font-semibold">${product.price.toFixed(2)}</p>
                  {product.original_price && (
                    <p className="text-xs text-muted-foreground line-through">${product.original_price.toFixed(2)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingProduct(product);
                      setIsFormOpen(true);
                    }}
                    className="rounded-none"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(product.id)}
                    className="rounded-none text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-muted-foreground mb-4">
                {searchQuery || filterCategory !== "all" ? "No matching products" : "No products yet"}
              </p>
              {!searchQuery && filterCategory === "all" && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-accent text-accent-foreground rounded-none tracking-[0.1em] uppercase hover:bg-gold-dark"
                >
                  Add Your First Product
                </Button>
              )}
            </div>
          );
        })()}
        </>
        )}
      </div>
    </div>
  );
};

/* Product Form Component */
const ProductForm = ({
  product,
  onClose,
}: {
  product: Tables<"products"> | null;
  onClose: () => void;
}) => {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [originalPrice, setOriginalPrice] = useState(product?.original_price?.toString() || "");
  const [discountPercent, setDiscountPercent] = useState(() => {
    if (product?.original_price && product?.price) {
      return Math.round(((product.original_price - product.price) / product.original_price) * 100).toString();
    }
    return "";
  });
  const [category, setCategory] = useState<string>(product?.category || "women");
  const [subcategory, setSubcategory] = useState(product?.subcategory || "");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product?.sizes || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(product?.colors || []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product?.image_url || "");
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>(
    product?.images?.filter((img): img is string => !!img && img !== product?.image_url) || []
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subcategories } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subcategories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: availableSizes } = useQuery({
    queryKey: ["available-sizes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("available_sizes").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const toggleSize = (sizeName: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeName) ? prev.filter((s) => s !== sizeName) : [...prev, sizeName]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const { data: availableColors } = useQuery({
    queryKey: ["available-colors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("available_colors").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdditionalFiles((prev) => [...prev, ...files]);
    setAdditionalPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index - (additionalPreviews.length - additionalFiles.length)));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = product?.image_url || "";

      // Upload main image if new one selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-main.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      // Upload additional images
      const existingAdditional = additionalPreviews.filter(
        (p) => p.startsWith("http") && !p.startsWith("blob:")
      );
      const uploadedAdditional: string[] = [...existingAdditional];
      for (const file of additionalFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        uploadedAdditional.push(urlData.publicUrl);
      }

      const allImages = imageUrl
        ? [imageUrl, ...uploadedAdditional.filter((u) => u !== imageUrl)]
        : uploadedAdditional;

      const productData: TablesInsert<"products"> = {
        name,
        description: description || null,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        category: category as TablesInsert<"products">["category"],
        subcategory: subcategory || null,
        image_url: imageUrl || null,
        images: allImages.length > 0 ? allImages : null,
        sizes: selectedSizes.length > 0 ? selectedSizes : null,
        colors: selectedColors.length > 0 ? selectedColors : null,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);
        if (error) throw error;
        toast({ title: "Product updated" });
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        toast({ title: "Product added" });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-display text-2xl mb-6">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-xs tracking-[0.1em] uppercase font-body font-medium mb-2">
              Product Image
            </label>
            <div
              className="border-2 border-dashed border-border hover:border-accent/50 transition-colors p-6 text-center cursor-pointer relative"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto object-contain" />
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-body">Click to upload image</p>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Additional images */}
          <div>
            <label className="block text-xs tracking-[0.1em] uppercase font-body font-medium mb-2">
              Additional Images
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {additionalPreviews.map((preview, idx) => (
                <div key={idx} className="relative w-20 h-20 bg-secondary overflow-hidden">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(idx)}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => document.getElementById("additional-upload")?.click()}
                className="w-20 h-20 border-2 border-dashed border-border hover:border-accent/50 flex items-center justify-center text-muted-foreground transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <input
              id="additional-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImages}
              className="hidden"
            />
          </div>

          <Input
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-secondary border-none py-5 rounded-none"
          />

          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-secondary border-none rounded-none resize-none"
            rows={3}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              type="number"
              step="0.01"
              placeholder="Sale Price"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (discountPercent && e.target.value) {
                  const p = parseFloat(e.target.value);
                  const d = parseFloat(discountPercent);
                  if (d > 0 && d < 100) setOriginalPrice((p / (1 - d / 100)).toFixed(2));
                }
              }}
              required
              className="bg-secondary border-none py-5 rounded-none"
            />
            <Input
              type="number"
              step="1"
              min="0"
              max="99"
              placeholder="Discount %"
              value={discountPercent}
              onChange={(e) => {
                const d = e.target.value;
                setDiscountPercent(d);
                if (d && price) {
                  const p = parseFloat(price);
                  const disc = parseFloat(d);
                  if (disc > 0 && disc < 100) {
                    setOriginalPrice((p / (1 - disc / 100)).toFixed(2));
                  }
                } else if (!d) {
                  setOriginalPrice("");
                }
              }}
              className="bg-secondary border-none py-5 rounded-none"
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Original price"
              value={originalPrice}
              onChange={(e) => {
                setOriginalPrice(e.target.value);
                if (e.target.value && price) {
                  const op = parseFloat(e.target.value);
                  const p = parseFloat(price);
                  if (op > p) setDiscountPercent(Math.round(((op - p) / op) * 100).toString());
                } else if (!e.target.value) {
                  setDiscountPercent("");
                }
              }}
              className="bg-secondary border-none py-5 rounded-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-secondary border-none rounded-none py-5">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="kids">Kids</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subcategory || "none"} onValueChange={(val) => setSubcategory(val === "none" ? "" : val)}>
              <SelectTrigger className="bg-secondary border-none rounded-none py-5">
                <SelectValue placeholder="Subcategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {subcategories?.map((sub) => (
                  <SelectItem key={sub.id} value={sub.name}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sizes checkboxes */}
          <div>
            <label className="block text-xs tracking-[0.1em] uppercase font-body font-medium mb-2">
              Sizes
            </label>
            {availableSizes && availableSizes.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => (
                  <label
                    key={size.id}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedSizes.includes(size.name)}
                      onCheckedChange={() => toggleSize(size.name)}
                    />
                    <span className="text-sm font-body uppercase tracking-wider">{size.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-body">
                No sizes configured. Add them in Settings.
              </p>
            )}
          </div>

          {/* Colors checkboxes */}
          <div>
            <label className="block text-xs tracking-[0.1em] uppercase font-body font-medium mb-2">
              Colors
            </label>
            {availableColors && availableColors.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <label
                    key={color.id}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedColors.includes(color.name)}
                      onCheckedChange={() => toggleColor(color.name)}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-border"
                      style={{ backgroundColor: color.name.toLowerCase() }}
                    />
                    <span className="text-sm font-body capitalize">{color.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-body">
                No colors configured. Add them in Settings.
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground rounded-none py-6 tracking-[0.15em] uppercase text-sm hover:bg-gold-dark"
          >
            {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
