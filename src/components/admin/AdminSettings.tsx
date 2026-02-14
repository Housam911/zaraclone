import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical } from "lucide-react";
import SliderManager from "./SliderManager";
import StoreSettingsManager from "./StoreSettingsManager";

const AdminSettings = () => {
  return (
    <div className="space-y-10">
      <StoreSettingsManager />
      <SliderManager />
      <SubcategoryManager />
      <SizeManager />
      <ColorManager />
    </div>
  );
};

const SubcategoryManager = () => {
  const [newName, setNewName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subcategories, isLoading } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("subcategories").insert({ name });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      setNewName("");
      toast({ title: "Subcategory added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subcategories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      toast({ title: "Subcategory deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) addMutation.mutate(newName.trim());
  };

  return (
    <div>
      <h3 className="font-display text-lg mb-4">Subcategories</h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          placeholder="New subcategory name (e.g. Tops, Shoes)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="bg-secondary border-none rounded-none py-5 flex-1"
        />
        <Button
          type="submit"
          disabled={!newName.trim() || addMutation.isPending}
          className="bg-accent text-accent-foreground rounded-none px-6 tracking-[0.1em] uppercase text-xs hover:bg-gold-dark"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-secondary animate-pulse" />
          ))}
        </div>
      ) : subcategories && subcategories.length > 0 ? (
        <div className="space-y-1">
          {subcategories.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-3 bg-card border border-border hover:border-accent/30 transition-colors"
            >
              <span className="font-body text-sm capitalize">{sub.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteMutation.mutate(sub.id)}
                className="rounded-none text-destructive hover:text-destructive h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-body">No subcategories yet. Add one above.</p>
      )}
    </div>
  );
};

const SizeManager = () => {
  const [newName, setNewName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sizes, isLoading } = useQuery({
    queryKey: ["available-sizes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_sizes")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const maxOrder = sizes?.length ? Math.max(...sizes.map((s) => s.sort_order)) + 1 : 0;
      const { error } = await supabase.from("available_sizes").insert({ name, sort_order: maxOrder });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-sizes"] });
      setNewName("");
      toast({ title: "Size added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("available_sizes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-sizes"] });
      toast({ title: "Size deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) addMutation.mutate(newName.trim());
  };

  return (
    <div>
      <h3 className="font-display text-lg mb-4">Available Sizes</h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          placeholder="New size (e.g. XS, S, M, L, XL, 38, 40)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="bg-secondary border-none rounded-none py-5 flex-1"
        />
        <Button
          type="submit"
          disabled={!newName.trim() || addMutation.isPending}
          className="bg-accent text-accent-foreground rounded-none px-6 tracking-[0.1em] uppercase text-xs hover:bg-gold-dark"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-secondary animate-pulse" />
          ))}
        </div>
      ) : sizes && sizes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <div
              key={size.id}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:border-accent/30 transition-colors"
            >
              <span className="font-body text-sm uppercase tracking-wider">{size.name}</span>
              <button
                onClick={() => deleteMutation.mutate(size.id)}
                className="text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-body">No sizes yet. Add one above.</p>
      )}
    </div>
  );
};

const ColorManager = () => {
  const [newName, setNewName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: colors, isLoading } = useQuery({
    queryKey: ["available-colors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_colors")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const maxOrder = colors?.length ? Math.max(...colors.map((c) => c.sort_order)) + 1 : 0;
      const { error } = await supabase.from("available_colors").insert({ name, sort_order: maxOrder });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-colors"] });
      setNewName("");
      toast({ title: "Color added" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("available_colors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-colors"] });
      toast({ title: "Color deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) addMutation.mutate(newName.trim());
  };

  return (
    <div>
      <h3 className="font-display text-lg mb-4">Available Colors</h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          placeholder="New color (e.g. Black, White, Red, Navy)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="bg-secondary border-none rounded-none py-5 flex-1"
        />
        <Button
          type="submit"
          disabled={!newName.trim() || addMutation.isPending}
          className="bg-accent text-accent-foreground rounded-none px-6 tracking-[0.1em] uppercase text-xs hover:bg-gold-dark"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-secondary animate-pulse" />
          ))}
        </div>
      ) : colors && colors.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <div
              key={color.id}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:border-accent/30 transition-colors"
            >
              <span
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color.name.toLowerCase() }}
              />
              <span className="font-body text-sm capitalize">{color.name}</span>
              <button
                onClick={() => deleteMutation.mutate(color.id)}
                className="text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-body">No colors yet. Add one above.</p>
      )}
    </div>
  );
};

export default AdminSettings;
