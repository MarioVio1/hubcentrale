"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Menu, 
  User, 
  Heart, 
  LogOut,
  Stethoscope,
  ClipboardList,
  Sparkles,
  Scan,
  Sun,
  Droplets,
  Zap,
  X,
  ChevronRight,
  ExternalLink
} from "lucide-react";

interface HeaderProps {
  user?: { id: string; email: string; name?: string; skinType?: string } | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenAI: () => void;
  onOpenProfile: () => void;
  onOpenSkinAnalysis: () => void;
}

// Menu items with icons and descriptions
const menuItems = [
  {
    icon: Stethoscope,
    title: "Consulto Dermatologico",
    description: "Parla con il nostro AI dermatologo",
    gradient: "from-pink-500 to-rose-500",
    action: "onOpenAI"
  },
  {
    icon: Scan,
    title: "Analisi Prodotto",
    description: "Verifica ingredienti e compatibilità",
    gradient: "from-violet-500 to-purple-500",
    action: "onOpenSkinAnalysis"
  },
  {
    icon: Sun,
    title: "Analisi Pelle",
    description: "Scopri il tuo tipo di pelle",
    gradient: "from-amber-500 to-orange-500",
    action: "onOpenSkinAnalysis"
  },
  {
    icon: Heart,
    title: "Preferiti",
    description: "I tuoi prodotti salvati",
    gradient: "from-red-500 to-pink-500",
    action: "onOpenProfile"
  },
];

export default function Header({ user, onLogin, onLogout, onOpenAI, onOpenProfile, onOpenSkinAnalysis }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuAction = (action: string) => {
    switch(action) {
      case 'onOpenAI':
        onOpenAI();
        break;
      case 'onOpenSkinAnalysis':
        onOpenSkinAnalysis();
        break;
      case 'onOpenProfile':
        onOpenProfile();
        break;
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pink-100/50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-500 shadow-lg shadow-pink-500/30"
          >
            <Stethoscope className="h-5 w-5 text-white" />
            <motion.div 
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Glow<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Lab</span>
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase -mt-1">Dermatologia AI</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavLink href="#products">
            <PackageIcon />
            Prodotti
          </NavLink>
          <NavLink onClick={onOpenSkinAnalysis}>
            <ClipboardList className="h-4 w-4" />
            Analisi Pelle
          </NavLink>
          <NavLink onClick={onOpenAI}>
            <Sparkles className="h-4 w-4" />
            Consulto AI
          </NavLink>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={onOpenAI}
              className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 hover:from-pink-600 hover:via-rose-600 hover:to-fuchsia-600 text-white px-5 py-2 rounded-full shadow-lg shadow-pink-500/30 font-medium"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
              <Stethoscope className="h-4 w-4 mr-2" />
              Consulto AI
              <Sparkles className="h-3 w-3 ml-2 opacity-80" />
            </Button>
          </motion.div>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-pink-50">
                  <Avatar className="h-9 w-9 border-2 border-pink-200 shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-pink-100 to-rose-200 text-pink-700 font-semibold text-sm">
                      {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 p-2" align="end">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900">{user.name || "Utente"}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {user.skinType && (
                      <Badge variant="secondary" className="w-fit mt-1 bg-pink-50 text-pink-600 border-pink-100 text-xs">
                        Pelle {user.skinType}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-1 p-1">
                  <DropdownMenuItem onClick={onOpenAI} className="flex flex-col items-center gap-1 p-3 cursor-pointer rounded-lg hover:bg-pink-50">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-pink-600" />
                    </div>
                    <span className="text-xs font-medium">Consulto</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenSkinAnalysis} className="flex flex-col items-center gap-1 p-3 cursor-pointer rounded-lg hover:bg-pink-50">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center">
                      <ClipboardList className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="text-xs font-medium">Analisi</span>
                  </DropdownMenuItem>
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenProfile} className="cursor-pointer rounded-lg p-2">
                  <User className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Il mio profilo</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer rounded-lg p-2 text-red-500 focus:text-red-500 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Esci</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={onLogin}
              variant="outline"
              className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 font-medium"
            >
              <User className="h-4 w-4 mr-1" />
              Accedi
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-50">
              <Menu className="h-5 w-5 text-gray-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] sm:w-[350px] p-0 border-l-pink-100">
            <SheetTitle className="sr-only">Menu di navigazione</SheetTitle>
            
            {/* Header */}
            <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">GlowLab</div>
                    <div className="text-xs opacity-80">Dermatologia AI</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {user ? (
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <Avatar className="h-10 w-10 border-2 border-white/50">
                    <AvatarFallback className="bg-white/20 text-white font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name || "Utente"}</div>
                    <div className="text-xs opacity-80">{user.email}</div>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                  className="w-full bg-white text-pink-600 hover:bg-white/90 font-medium"
                >
                  <User className="h-4 w-4 mr-2" />
                  Accedi / Registrati
                </Button>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                Servizi
              </div>
              
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleMenuAction(item.action)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-pink-400 transition-colors" />
                </motion.button>
              ))}

              <Separator className="my-4" />
              
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                Navigazione
              </div>
              
              <Link
                href="#products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <PackageIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Prodotti</div>
                  <div className="text-xs text-gray-500">Esplora il catalogo</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-teal-400 transition-colors" />
              </Link>

              {user && (
                <>
                  <Separator className="my-4" />
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl p-3"
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Esci dal tuo account
                  </Button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Sparkles className="h-3 w-3" />
                <span>Powered by AI Dermatology</span>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

// NavLink Component for Desktop
function NavLink({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) {
  const baseClasses = "flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors rounded-full hover:bg-pink-50";
  
  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }
  
  return (
    <button onClick={onClick} className={baseClasses}>
      {children}
    </button>
  );
}

// Package Icon
function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
