import { useGlobalDiscount } from "@/hooks/use-global-discount";
import { Tag } from "lucide-react";

const SaleBanner = () => {
  const { data: globalDiscount = 0, isLoading } = useGlobalDiscount();

  if (isLoading || globalDiscount <= 0) return null;

  return (
    <div className="bg-accent text-accent-foreground py-2.5 px-4 text-center sticky top-0 z-50">
      <p className="font-body text-xs sm:text-sm tracking-[0.15em] uppercase font-medium flex items-center justify-center gap-2">
        <Tag className="h-3.5 w-3.5" />
        Sale — {globalDiscount}% off sitewide
        <Tag className="h-3.5 w-3.5" />
      </p>
    </div>
  );
};

export default SaleBanner;
