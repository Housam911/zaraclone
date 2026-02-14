const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-display text-2xl tracking-[0.15em] uppercase mb-4">Élégance</h3>
            <p className="font-body text-sm text-primary-foreground/70 leading-relaxed">
              Curated fashion for those who appreciate timeless style and modern sophistication.
            </p>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2 font-body text-sm text-primary-foreground/70">
              <li><a href="/?category=women" className="hover:text-gold transition-colors">Women</a></li>
              <li><a href="/?category=men" className="hover:text-gold transition-colors">Men</a></li>
              <li><a href="/?category=kids" className="hover:text-gold transition-colors">Kids</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase mb-4 text-gold">Contact</h4>
            <ul className="space-y-2 font-body text-sm text-primary-foreground/70">
              <li>
                <a
                  href="https://wa.me/96179357527"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp: +961 79 357 527
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="font-body text-xs text-primary-foreground/40 tracking-wider">
            © 2026 Élégance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
