import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders over $100",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated customer care",
  },
];

const FeaturesBar = () => {
  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-4 py-8 px-4 lg:px-6">
              <feature.icon className="h-6 w-6 text-accent flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="font-body text-sm font-medium">{feature.title}</p>
                <p className="font-body text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
