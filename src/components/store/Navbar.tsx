import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { data: headerText } = useQuery({
    queryKey: ["header-announcement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "header_announcement")
        .maybeSingle();
      if (error || !data) return null;
      return data.value;
    },
    staleTime: 60_000,
  });

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-[0.2em] uppercase font-body">
        {headerText || "Free shipping on orders over $100"}
      </div>

      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="font-display text-2xl tracking-[0.15em] uppercase font-semibold">
            MY SHOP
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            <NavItem to="/?category=women" label="Women" />
            <NavItem to="/?category=men" label="Men" />
            <NavItem to="/?category=kids" label="Kids" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 hover:text-accent transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button onClick={() => setIsOpen(true)} className="relative p-2 hover:text-accent transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-body font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
            <Link to="/admin" className="p-2 hover:text-accent transition-colors">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="pb-4 animate-fade-in">
            <Input
              placeholder="Search products..."
              className="max-w-md mx-auto bg-secondary border-none"
              autoFocus
            />
          </div>
        )}

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2 animate-fade-in">
            <MobileNavItem to="/?category=women" label="Women" onClick={() => setIsMenuOpen(false)} />
            <MobileNavItem to="/?category=men" label="Men" onClick={() => setIsMenuOpen(false)} />
            <MobileNavItem to="/?category=kids" label="Kids" onClick={() => setIsMenuOpen(false)} />
          </div>
        )}
      </nav>
    </header>
  );
};

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="text-sm tracking-[0.15em] uppercase font-body font-medium hover:text-accent transition-colors"
  >
    {label}
  </Link>
);

const MobileNavItem = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block py-2 text-sm tracking-[0.15em] uppercase font-body font-medium hover:text-accent transition-colors"
  >
    {label}
  </Link>
);

export default Navbar;
