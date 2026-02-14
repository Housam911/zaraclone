import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[80vh] min-h-[500px] overflow-hidden">
      <img
        src={heroBanner}
        alt="Elegant fashion collection"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />

      <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-lg space-y-6">
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase animate-fade-in">
            New Collection 2026
          </p>
          <h1 className="font-display text-5xl lg:text-7xl text-primary-foreground leading-tight animate-fade-in" style={{ animationDelay: "0.15s" }}>
            Timeless
            <br />
            <span className="italic">Elegance</span>
          </h1>
          <p className="text-primary-foreground/80 font-body text-lg max-w-sm animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Discover curated pieces that define modern sophistication.
          </p>
          <div className="animate-fade-in" style={{ animationDelay: "0.45s" }}>
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-gold-dark tracking-[0.15em] uppercase text-sm px-10 py-6 rounded-none"
            >
              <a href="#products">Shop Now</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
