import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, X, Upload, GripVertical } from "lucide-react";

interface HeroSlide {
  id: string;
  subtitle: string;
  title_line1: string;
  title_line2: string;
  description: string;
  image_url: string | null;
  sort_order: number;
}

const SliderManager = () => {
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: slides, isLoading } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as HeroSlide[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      toast({ title: "Slide deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reordered: HeroSlide[]) => {
      const updates = reordered.map((s, i) =>
        supabase.from("hero_slides").update({ sort_order: i }).eq("id", s.id)
      );
      const results = await Promise.all(updates);
      const err = results.find((r) => r.error);
      if (err?.error) throw err.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      toast({ title: "Order updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleDragEnd = useCallback(() => {
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex && slides) {
      const reordered = [...slides];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(overIndex, 0, moved);
      reorderMutation.mutate(reordered);
    }
    setDragIndex(null);
    setOverIndex(null);
  }, [dragIndex, overIndex, slides, reorderMutation]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Hero Slider</h3>
        {!isAdding && !editingSlide && (
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-accent text-accent-foreground rounded-none px-6 tracking-[0.1em] uppercase text-xs hover:bg-gold-dark"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Slide
          </Button>
        )}
      </div>

      {(isAdding || editingSlide) && (
        <SlideForm
          slide={editingSlide}
          totalSlides={slides?.length || 0}
          onClose={() => {
            setIsAdding(false);
            setEditingSlide(null);
          }}
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-secondary animate-pulse" />
          ))}
        </div>
      ) : slides && slides.length > 0 ? (
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => { e.preventDefault(); setOverIndex(index); }}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-4 p-3 bg-card border transition-colors cursor-grab active:cursor-grabbing ${
                overIndex === index && dragIndex !== null && dragIndex !== index
                  ? "border-accent"
                  : "border-border hover:border-accent/30"
              } ${dragIndex === index ? "opacity-50" : ""}`}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="w-24 h-16 bg-secondary flex-shrink-0 overflow-hidden">
                {slide.image_url ? (
                  <img src={slide.image_url} alt={slide.subtitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm truncate">
                  {slide.title_line1} <span className="italic">{slide.title_line2}</span>
                </p>
                <p className="text-xs text-muted-foreground font-body">{slide.subtitle}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingSlide(slide)}
                  className="rounded-none h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(slide.id)}
                  className="rounded-none text-destructive hover:text-destructive h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-body">No slides yet. Add one above.</p>
      )}
    </div>
  );
};

const SlideForm = ({
  slide,
  totalSlides,
  onClose,
}: {
  slide: HeroSlide | null;
  totalSlides: number;
  onClose: () => void;
}) => {
  const [subtitle, setSubtitle] = useState(slide?.subtitle || "");
  const [titleLine1, setTitleLine1] = useState(slide?.title_line1 || "");
  const [titleLine2, setTitleLine2] = useState(slide?.title_line2 || "");
  const [description, setDescription] = useState(slide?.description || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(slide?.image_url || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = slide?.image_url || "";

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `hero-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const slideData = {
        subtitle,
        title_line1: titleLine1,
        title_line2: titleLine2,
        description,
        image_url: imageUrl || null,
      };

      if (slide) {
        const { error } = await supabase
          .from("hero_slides")
          .update(slideData)
          .eq("id", slide.id);
        if (error) throw error;
        toast({ title: "Slide updated" });
      } else {
        const { error } = await supabase
          .from("hero_slides")
          .insert({ ...slideData, sort_order: totalSlides });
        if (error) throw error;
        toast({ title: "Slide added" });
      }

      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display text-sm">{slide ? "Edit Slide" : "New Slide"}</h4>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Image upload */}
        <div
          className="border-2 border-dashed border-border hover:border-accent/50 transition-colors p-4 text-center cursor-pointer"
          onClick={() => document.getElementById("slide-image-upload")?.click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto object-contain" />
          ) : (
            <div className="text-muted-foreground">
              <Upload className="h-6 w-6 mx-auto mb-1" />
              <p className="text-xs font-body">Click to upload slide image</p>
            </div>
          )}
          <input
            id="slide-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <Input
          placeholder="Subtitle (e.g. New Collection 2026)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="bg-secondary border-none rounded-none py-5"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Title Line 1 (e.g. MY)"
            value={titleLine1}
            onChange={(e) => setTitleLine1(e.target.value)}
            className="bg-secondary border-none rounded-none py-5"
          />
          <Input
            placeholder="Title Line 2 (e.g. SHOP)"
            value={titleLine2}
            onChange={(e) => setTitleLine2(e.target.value)}
            className="bg-secondary border-none rounded-none py-5"
          />
        </div>
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-secondary border-none rounded-none resize-none"
          rows={2}
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-accent-foreground rounded-none py-5 tracking-[0.1em] uppercase text-xs hover:bg-gold-dark"
        >
          {loading ? "Saving..." : slide ? "Update Slide" : "Add Slide"}
        </Button>
      </form>
    </div>
  );
};

export default SliderManager;
