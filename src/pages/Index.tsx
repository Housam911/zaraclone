import Navbar from "@/components/store/Navbar";
import HeroSection from "@/components/store/HeroSection";
import FeaturesBar from "@/components/store/FeaturesBar";
import CategoryShowcase from "@/components/store/CategoryShowcase";
import PromoBanner from "@/components/store/PromoBanner";
import ProductGrid from "@/components/store/ProductGrid";
import Footer from "@/components/store/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesBar />
      <div id="categories">
        <CategoryShowcase />
      </div>
      <PromoBanner />
      <ProductGrid />
      <Footer />
    </div>
  );
};

export default Index;
