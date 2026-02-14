import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Search, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
}

const Navbar = ({ cartCount = 0, wishlistCount = 0 }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-[0.2em] uppercase font-body">
        Free shipping on orders over $100
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
            Élégance
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
