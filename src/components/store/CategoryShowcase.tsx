import { Link } from "react-router-dom";
import categoryWomen from "@/assets/category-women.jpg";
import categoryMen from "@/assets/category-men.jpg";
import categoryKids from "@/assets/category-kids.jpg";
import ScrollReveal from "./ScrollReveal";

const categories = [
  { label: "Women", image: categoryWomen, href: "/?category=women" },
  { label: "Men", image: categoryMen, href: "/?category=men" },
  { label: "Kids", image: categoryKids, href: "/?category=kids" },
];

const CategoryShowcase = () => {
  return (
    <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
      <ScrollReveal>
        <div className="text-center mb-12 space-y-4">
          <p className="text-accent font-body text-sm tracking-[0.3em] uppercase">Shop By Category</p>
          <h2 className="font-display text-4xl lg:text-5xl">Find Your Style</h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {categories.map((cat, index) => (
          <ScrollReveal key={cat.label} delay={index * 0.15}>
            <Link
              to={cat.href}
              className="group relative aspect-[3/4] overflow-hidden block"
            >
              <img
                src={cat.image}
                alt={`${cat.label} collection`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <h3 className="font-display text-3xl lg:text-4xl text-primary-foreground mb-2">{cat.label}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-primary-foreground/80 font-body text-sm tracking-[0.15em] uppercase group-hover:text-accent transition-colors">
                    Explore Collection
                  </span>
                  <svg className="w-4 h-4 text-primary-foreground/80 group-hover:text-accent group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

export default CategoryShowcase;
