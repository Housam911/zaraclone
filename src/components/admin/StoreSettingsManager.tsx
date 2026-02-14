import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const StoreSettingsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .order("key");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s) => (map[s.key] = s.value));
      setValues(map);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("store_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      toast({ title: "Setting updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = (key: string) => {
    if (values[key] !== undefined) {
      updateMutation.mutate({ key, value: values[key] });
    }
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="font-display text-lg mb-4">Store Settings</h3>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display text-lg mb-4">Store Settings</h3>
      <div className="space-y-3">
        {settings?.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center gap-3 p-3 bg-card border border-border"
          >
            <label className="font-body text-sm min-w-[200px]">{setting.label || setting.key}</label>
            <Input
              value={values[setting.key] || ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
              }
              className="bg-secondary border-none rounded-none py-5 flex-1"
            />
            <Button
              size="sm"
              onClick={() => handleSave(setting.key)}
              disabled={updateMutation.isPending || values[setting.key] === setting.value}
              className="bg-accent text-accent-foreground rounded-none px-4 tracking-[0.1em] uppercase text-xs hover:bg-gold-dark"
            >
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreSettingsManager;
