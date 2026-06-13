import Link from "next/link";
import { 
  Sparkles, 
  Mail, 
  Instagram, 
  Youtube,
  Heart,
  Stethoscope
} from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Consulto AI", href: "#" },
    { label: "Prodotti", href: "#products" },
    { label: "Analisi Pelle", href: "#" },
  ],
  resources: [
    { label: "Guide Skincare", href: "#" },
    { label: "K-Beauty 101", href: "#" },
    { label: "Ingredienti", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Termini di Servizio", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-pink-50 to-rose-50 border-t border-pink-100 mt-auto">
      <div className="container px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-800">
                Glow<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Lab</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 mb-4">
              Il tuo dermatologo AI personale. Consulti professionali 24/7 per skincare e K-Beauty.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-pink-500 hover:bg-pink-100 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-pink-500 hover:bg-pink-100 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-pink-500 hover:bg-pink-100 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Piattaforma</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Risorse</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 mb-3">
              Consigli skincare esclusivi e novità K-Beauty.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="La tua email"
                className="flex-1 px-3 py-2 text-sm border border-pink-200 rounded-lg focus:outline-none focus:border-pink-400 bg-white"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors"
              >
                Iscriviti
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-pink-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} GlowLab. Tutti i diritti riservati.
            </p>
            <ul className="flex gap-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-xs text-gray-500 hover:text-pink-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center flex items-center justify-center gap-1">
            Fatto con <Heart className="h-3 w-3 text-pink-400 fill-pink-400" /> per la community skincare italiana
          </p>
        </div>
      </div>
    </footer>
  );
}
