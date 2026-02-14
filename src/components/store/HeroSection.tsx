import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroBanner1 from "@/assets/hero-banner.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";

const fallbackSlides = [
  {
    image_url: heroBanner1,
    subtitle: "New Collection 2026",
    title_line1: "MY",
    title_line2: "SHOP",
    description: "Discover curated pieces that define modern sophistication. Where luxury meets everyday wearability.",
  },
  {
    image_url: heroBanner2,
    subtitle: "Men's Essentials",
    title_line1: "TAILORED",
    title_line2: "ELEGANCE",
    description: "Refined silhouettes and impeccable craftsmanship for the modern gentleman.",
  },
  {
    image_url: heroBanner3,
    subtitle: "Luxury Accessories",
    title_line1: "TIMELESS",
    title_line2: "DETAILS",
    description: "Statement pieces that elevate every outfit. Curated leather goods and accessories.",
  },
];

const fallbackImages = [heroBanner1, heroBanner2, heroBanner3];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { data: dbSlides } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const slides = dbSlides && dbSlides.length > 0
    ? dbSlides.map((s, i) => ({
        image_url: s.image_url || fallbackImages[i % fallbackImages.length],
        subtitle: s.subtitle,
        title_line1: s.title_line1,
        title_line2: s.title_line2,
        description: s.description,
      }))
    : fallbackSlides;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning]
  );

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo, slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img
            src={slide.image_url}
            alt={slide.subtitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/20" />
        </div>
      ))}

      <div className="relative z-10 h-full container mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-xl space-y-8">
          <div className="space-y-2">
            <p
              key={`sub-${current}`}
              className="text-gold font-body text-xs tracking-[0.4em] uppercase animate-fade-in"
            >
              {slides[current].subtitle}
            </p>
            <div className="w-12 h-px bg-gold animate-fade-in" style={{ animationDelay: "0.1s" }} />
          </div>

          <h1
            key={`title-${current}`}
            className="font-display text-5xl sm:text-6xl lg:text-8xl text-primary-foreground leading-[0.95] animate-fade-in"
            style={{ animationDelay: "0.15s" }}
          >
            {slides[current].title_line1}
            <br />
            <span className="italic font-normal">{slides[current].title_line2}</span>
          </h1>

          <p
            key={`desc-${current}`}
            className="text-primary-foreground/70 font-body text-base sm:text-lg max-w-md leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            {slides[current].description}
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

      <button
        onClick={prev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center border border-primary-foreground/30 text-primary-foreground/70 hover:border-gold hover:text-gold transition-colors backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center border border-primary-foreground/30 text-primary-foreground/70 hover:border-gold hover:text-gold transition-colors backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-0.5 transition-all duration-500 ${
              i === current ? "w-8 bg-gold" : "w-4 bg-primary-foreground/40 hover:bg-primary-foreground/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
