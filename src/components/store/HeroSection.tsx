import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      <img
        src={heroBanner}
        alt="Elegant fashion collection"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/20" />

      <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-xl space-y-8">
          <div className="space-y-2">
            <p className="text-gold font-body text-xs tracking-[0.4em] uppercase animate-fade-in">
              New Collection 2026
            </p>
            <div className="w-12 h-px bg-gold animate-fade-in" style={{ animationDelay: "0.1s" }} />
          </div>
          
          <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl text-primary-foreground leading-[0.95] animate-fade-in" style={{ animationDelay: "0.15s" }}>
            MY
            <br />
            <span className="italic font-normal">SHOP</span>
          </h1>
          
          <p className="text-primary-foreground/70 font-body text-base sm:text-lg max-w-md leading-relaxed animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Discover curated pieces that define modern sophistication. 
            Where luxury meets everyday wearability.
          </p>
          
          <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.45s" }}>
            <a
              href="#products"
              className="inline-flex items-center bg-accent text-accent-foreground px-10 py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-gold-dark transition-colors"
            >
              Shop Now
            </a>
            <a
              href="#categories"
              className="inline-flex items-center border border-primary-foreground/30 text-primary-foreground px-10 py-4 text-xs tracking-[0.2em] uppercase font-body font-medium hover:border-gold hover:text-gold transition-colors"
            >
              Explore
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-primary-foreground/50" />
      </div>
    </section>
  );
};

export default HeroSection;
