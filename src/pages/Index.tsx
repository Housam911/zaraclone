import Navbar from "@/components/store/Navbar";
import HeroSection from "@/components/store/HeroSection";
import FeaturesBar from "@/components/store/FeaturesBar";
import CategoryShowcase from "@/components/store/CategoryShowcase";
import PromoBanner from "@/components/store/PromoBanner";
import ProductGrid from "@/components/store/ProductGrid";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import BackToTop from "@/components/store/BackToTop";
import SaleBanner from "@/components/store/SaleBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SaleBanner />
      <Navbar />
      <CartDrawer />
      <HeroSection />
      <FeaturesBar />
      <div id="categories">
        <CategoryShowcase />
      </div>
      <PromoBanner />
      <div id="products">
        <ProductGrid />
      </div>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
