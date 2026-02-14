import promoBanner from "@/assets/promo-banner.jpg";

const PromoBanner = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
        {/* Image side */}
        <div className="relative h-64 lg:h-auto overflow-hidden">
          <img
            src={promoBanner}
            alt="Premium accessories"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Content side */}
        <div className="bg-primary flex items-center p-8 lg:p-16">
          <div className="space-y-6 max-w-md">
            <p className="text-gold font-body text-xs tracking-[0.3em] uppercase">
              Limited Edition
            </p>
            <h2 className="font-display text-3xl lg:text-4xl text-primary-foreground leading-snug">
              Accessories That
              <br />
              <span className="italic text-gold">Define You</span>
            </h2>
            <p className="text-primary-foreground/60 font-body text-sm leading-relaxed">
              Elevate every outfit with our handpicked collection of bags, jewelry, and more — crafted for those who appreciate the finer details.
            </p>
            <a
              href="#products"
              className="inline-block border border-gold text-gold px-8 py-3 text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-gold hover:text-accent-foreground transition-colors"
            >
              Discover More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
