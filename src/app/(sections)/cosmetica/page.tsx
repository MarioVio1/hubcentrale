"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@cosmetica/components/Header";
import Footer from "@cosmetica/components/Footer";
import ProductCard from "@cosmetica/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Brain, 
  Search, 
  Star,
  Send,
  Loader2,
  RefreshCcw,
  Stethoscope,
  ClipboardList,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Scan,
  Package,
  ExternalLink,
  ShoppingCart
} from "lucide-react";

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  skinType?: string;
  skinConcerns?: string[];
}

interface Product {
  id: string;
  productId?: string;
  name: string;
  brand: string;
  brandCountry?: string;
  category?: string;
  productType: string;
  price?: number;
  rating: number;
  reviewCount: number;
  skinTypes?: string;
  skinConcerns?: string;
  isKorean?: boolean;
  isVegan?: boolean;
  isCrueltyFree?: boolean;
  imageUrl?: string;
  imageUrlAlt?: string;
  keyIngredients?: string;
  description?: string;
  // Shop links
  officialUrl?: string;
  redcareUrl?: string;
  dfarmaUrl?: string;
  sephoraUrl?: string;
  amazonUrl?: string;
  yesStyleUrl?: string;
}

interface RecommendedProduct {
  id: string;
  productId?: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  imageUrlAlt?: string | null;
  price: number | null;
  description: string | null;
  // Shop links - matching API response
  officialUrl?: string | null;
  redcareUrl?: string | null;
  dfarmaUrl?: string | null;
  sephoraUrl?: string | null;
  amazonUrl?: string | null;
  yesStyleUrl?: string | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: RecommendedProduct[];
}

const skinTypes = [
  { value: "oily", label: "Grassa" },
  { value: "dry", label: "Secca" },
  { value: "combination", label: "Mista" },
  { value: "sensitive", label: "Sensibile" },
  { value: "normal", label: "Normale" },
];

const skinConcernsList = [
  { value: "acne", label: "Acne" },
  { value: "wrinkles", label: "Rughe" },
  { value: "darkSpots", label: "Macchie" },
  { value: "pores", label: "Pori dilatati" },
  { value: "redness", label: "Rossori" },
  { value: "dryness", label: "Secchezza" },
  { value: "oiliness", label: "Eccesso sebo" },
  { value: "dullness", label: "Pelle opaca" },
];

export default function Home() {
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // AI Assistant state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Skin Analysis state
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);
  const [selectedSkinType, setSelectedSkinType] = useState<string>("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  
  // Profile state
  const [showProfile, setShowProfile] = useState(false);
  
  // Product Checker state
  const [showProductChecker, setShowProductChecker] = useState(false);
  const [productCheckInput, setProductCheckInput] = useState("");
  const [productIngredientInput, setProductIngredientInput] = useState("");
  const [isCheckingProduct, setIsCheckingProduct] = useState(false);
  const [productCheckResult, setProductCheckResult] = useState<{
    compatible: boolean;
    score: number;
    productName?: string;
    brand?: string;
    productImage?: string;
    analysis: string;
    ingredientAnalysis?: Array<{
      name: string;
      data?: {
        benefits: string[];
        description: string;
        pregnancy: boolean;
      };
    }>;
    warnings: string[];
    benefits: string[];
    recommendations: string[];
  } | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAILoading]);

  // Initialize user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("glowlab_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        const parsed = JSON.parse(savedUser);
        setSelectedSkinType(parsed.skinType || "");
        setSelectedConcerns(parsed.skinConcerns || []);
      } catch {
        localStorage.removeItem("glowlab_user");
      }
    }
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products?limit=12");
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch favorites when user changes
  useEffect(() => {
    if (user) {
      fetch(`/api/favorites?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          const favIds = data.favorites?.map((f: { productId: string }) => f.productId) || [];
          setFavorites(favIds);
        })
        .catch(console.error);
    }
  }, [user]);

  // Login handler
  const handleLogin = async () => {
    if (!loginEmail) return;
    
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, name: loginName || undefined }),
      });
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("glowlab_user", JSON.stringify(data.user));
        setShowLogin(false);
        setLoginEmail("");
        setLoginName("");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setFavorites([]);
    localStorage.removeItem("glowlab_user");
  };

  // Update skin profile
  const updateSkinProfile = async () => {
    const profileData = {
      skinType: selectedSkinType,
      skinConcerns: selectedConcerns,
    };
    
    if (user?.id && user.id !== "temp") {
      // Update in database
      try {
        const response = await fetch("/api/auth", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            ...profileData,
          }),
        });
        const data = await response.json();
        
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("glowlab_user", JSON.stringify(data.user));
        }
      } catch (error) {
        console.error("Update profile error:", error);
      }
    } else {
      // Save locally for guest users
      const updatedUser = {
        ...user,
        ...profileData,
      } as User;
      setUser(updatedUser);
      localStorage.setItem("glowlab_user", JSON.stringify(updatedUser));
    }
  };

  // Toggle favorite
  const toggleFavorite = async (productId: string) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      if (favorites.includes(productId)) {
        await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, productId }),
        });
        setFavorites(favorites.filter(id => id !== productId));
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, productId }),
        });
        setFavorites([...favorites, productId]);
      }
    } catch (error) {
      console.error("Favorite error:", error);
    }
  };

  // AI Chat
  const sendMessage = async () => {
    if (!inputMessage.trim() || isAILoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsAILoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context: user?.skinType ? {
            skinType: user.skinType,
            concerns: user.skinConcerns,
          } : undefined,
        }),
      });

      const data = await response.json();

      // Handle API error responses
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Mi dispiace, non ho potuto elaborare la risposta. Riprova.",
        timestamp: new Date(),
        products: data.products || undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Mi dispiace, c'è stato un problema di connessione. Riprova tra qualche istante.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAILoading(false);
    }
  };

  // Product Checker
  const checkProduct = async () => {
    if ((!productCheckInput.trim() && !productIngredientInput.trim()) || isCheckingProduct) return;
    
    setIsCheckingProduct(true);
    setProductCheckResult(null);
    
    try {
      const response = await fetch("/api/product-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productCheckInput || undefined,
          ingredients: productIngredientInput || undefined,
          skinType: user?.skinType || "normal",
          concerns: user?.skinConcerns || [],
        }),
      });

      const data = await response.json();
      setProductCheckResult(data);
    } catch (error) {
      console.error("Product check error:", error);
      setProductCheckResult({
        compatible: true,
        score: 50,
        analysis: "Non sono riuscito ad analizzare completamente il prodotto. Prova a inserire il nome completo del prodotto.",
        warnings: ["Impossibile verificare tutti gli ingredienti"],
        benefits: [],
        recommendations: ["Fai un patch test", "Consulta un dermatologo"]
      });
    } finally {
      setIsCheckingProduct(false);
    }
  };

  // Toggle concern selection
  const toggleConcern = (concern: string) => {
    setSelectedConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  // Filter products by search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.productType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header 
        user={user} 
        onLogin={() => setShowLogin(true)} 
        onLogout={handleLogout}
        onOpenAI={() => setShowAIAssistant(true)}
        onOpenProfile={() => setShowProfile(true)}
        onOpenSkinAnalysis={() => setShowSkinAnalysis(true)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
          <div className="container px-4 md:px-8 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Badge className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border-pink-200">
                  <Stethoscope className="h-3 w-3 mr-1" />
                  Dermatologia AI
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Il tuo dermatologo{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500">
                    personale AI
                  </span>
                </h1>
                
                <p className="text-lg text-gray-600 max-w-lg">
                  Consulti dermatologici professionali 24/7. Analisi della pelle personalizzata e consigli skincare basati su evidenze scientifiche.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => setShowAIAssistant(true)}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-pink-500/25"
                  >
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Consulto Dermatologico
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowProductChecker(true)}
                    className="px-8 py-6 text-lg rounded-xl border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    <Scan className="mr-2 h-5 w-5" />
                    Check Prodotto
                  </Button>
                </div>

                <div className="flex flex-wrap gap-8 pt-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-pink-500" />
                    <div>
                      <div className="text-xl font-bold text-gray-800">Dermatologo AI</div>
                      <div className="text-sm text-gray-500">Certificato</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-rose-500" />
                    <div>
                      <div className="text-xl font-bold text-gray-800">15+ anni</div>
                      <div className="text-sm text-gray-500">Esperienza</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-fuchsia-500" />
                    <div>
                      <div className="text-xl font-bold text-gray-800">24/7</div>
                      <div className="text-sm text-gray-500">Disponibile</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="aspect-square max-w-lg mx-auto bg-gradient-to-br from-pink-100 via-rose-100 to-fuchsia-100 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/10">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                      <Stethoscope className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Dr. Glow AI</h3>
                    <p className="text-gray-600">Dermatologo Virtuale Certificato</p>
                    <p className="text-sm text-pink-600 mt-2">Specializzato in K-Beauty</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-8">
            <div className="grid md:grid-cols-4 gap-6">
              <Card 
                className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-pink-50 to-white hover:from-pink-100"
                onClick={() => setShowAIAssistant(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white mb-4">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Consulto AI</h3>
                  <p className="text-sm text-gray-500">Parla con il dermatologo</p>
                </CardContent>
              </Card>

              <Card 
                className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-rose-50 to-white hover:from-rose-100"
                onClick={() => setShowProductChecker(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-fuchsia-500 text-white mb-4">
                    <Scan className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Check Prodotto</h3>
                  <p className="text-sm text-gray-500">Verifica compatibilità</p>
                </CardContent>
              </Card>

              <Card 
                className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-fuchsia-50 to-white hover:from-fuchsia-100"
                onClick={() => setShowSkinAnalysis(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 text-white mb-4">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Analisi Pelle</h3>
                  <p className="text-sm text-gray-500">Scopri il tuo tipo</p>
                </CardContent>
              </Card>

              <Card 
                className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-pink-50 to-white hover:from-pink-100"
                onClick={() => user ? setShowProfile(true) : setShowLogin(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white mb-4">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Preferiti</h3>
                  <p className="text-sm text-gray-500">I tuoi prodotti</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-16 md:py-24 bg-gradient-to-br from-pink-50/50 to-rose-50/50">
          <div className="container px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <Badge className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 mb-4">
                  Prodotti Skincare
                </Badge>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Prodotti consigliati
                </h2>
                <p className="text-gray-600 max-w-xl">
                  Selezione di prodotti K-Beauty e skincare dermatologica
                </p>
              </div>
              
              <div className="relative mt-4 md:mt-0 w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca prodotti..."
                  className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoadingProducts ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-md overflow-hidden">
                    <div className="aspect-square bg-pink-50">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    isFavorite={favorites.includes(product.id)}
                    onFavoriteToggle={() => toggleFavorite(product.id)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Nessun prodotto trovato per "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500">
          <div className="container px-4 md:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Inizia il tuo consulto dermatologico
              </h2>
              <p className="text-pink-100 mb-8">
                Ricevi consigli professionali personalizzati dal nostro dermatologo AI
              </p>
              <Button
                onClick={() => setShowAIAssistant(true)}
                size="lg"
                className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-6 text-lg rounded-xl shadow-lg"
              >
                <Stethoscope className="mr-2 h-5 w-5" />
                Inizia Consulto
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Accedi o Registrati</DialogTitle>
            <DialogDescription>
              Crea un account per salvare i tuoi preferiti e ricevere consigli personalizzati
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome (opzionale)</Label>
              <Input
                id="name"
                placeholder="Il tuo nome"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="la.tua@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              Continua
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skin Analysis Dialog */}
      <Dialog open={showSkinAnalysis} onOpenChange={setShowSkinAnalysis}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Analisi del Tuo Tipo di Pelle</DialogTitle>
            <DialogDescription>
              Completa il profilo per ricevere consigli personalizzati
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Tipo di pelle</Label>
              <Select value={selectedSkinType} onValueChange={setSelectedSkinType}>
                <SelectTrigger className="border-pink-200">
                  <SelectValue placeholder="Seleziona il tuo tipo di pelle" />
                </SelectTrigger>
                <SelectContent>
                  {skinTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Problemi principali</Label>
              <div className="flex flex-wrap gap-2">
                {skinConcernsList.map(concern => (
                  <Badge
                    key={concern.value}
                    variant={selectedConcerns.includes(concern.value) ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1 transition-all ${
                      selectedConcerns.includes(concern.value)
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                        : "hover:bg-pink-50 text-gray-700"
                    }`}
                    onClick={() => toggleConcern(concern.value)}
                  >
                    {concern.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSkinAnalysis(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                onClick={updateSkinProfile}
                disabled={!selectedSkinType}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                {user ? "Aggiorna Profilo" : "Salva e Continua"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog - FIXED */}
      <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Dr. Glow - Dermatologo AI</DialogTitle>
                <p className="text-xs text-gray-500">Specializzato in K-Beauty e dermatologia clinica</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMessages([])}
              title="Nuova conversazione"
              className="h-8 w-8"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[50vh]"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-14 h-14 mb-3 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <Stethoscope className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Buongiorno, sono il Dr. Glow</h3>
                <p className="text-sm text-gray-500 mb-4">Come posso aiutarti oggi?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Routine K-Beauty", "Trattamento acne", "Anti-aging", "Pelle sensibile"].map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="cursor-pointer hover:bg-pink-50 border-pink-200 text-pink-600"
                      onClick={() => {
                        setInputMessage(`Mi serve aiuto per: ${topic}`);
                      }}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "flex-col"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500">
                        <Stethoscope className="h-4 w-4 text-white" />
                      </div>
                      <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-800 rounded-bl-md">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  )}
                  {message.role === "assistant" && message.products && message.products.length > 0 && (
                    <div className="ml-11 mt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Prodotti consigliati
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {message.products.map((product) => {
                          // Get available shop links with proper labels
                          const shopLinks = [
                            product.yesStyleUrl && { url: product.yesStyleUrl, label: "YesStyle", color: "from-purple-500 to-pink-500" },
                            product.officialUrl && { url: product.officialUrl, label: "Sito Ufficiale", color: "from-pink-500 to-rose-500" },
                            product.sephoraUrl && { url: product.sephoraUrl, label: "Sephora", color: "from-black to-gray-700" },
                            product.amazonUrl && { url: product.amazonUrl, label: "Amazon", color: "from-yellow-500 to-orange-500" },
                            product.redcareUrl && { url: product.redcareUrl, label: "Redcare", color: "from-red-500 to-orange-500" },
                            product.dfarmaUrl && { url: product.dfarmaUrl, label: "DFarma", color: "from-green-500 to-teal-500" },
                          ].filter(Boolean) as Array<{ url: string; label: string; color: string }>;
                          
                          // Image with fallback
                          const imageSrc = product.imageUrl || product.imageUrlAlt;
                          
                          return (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col p-2 bg-white rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 shrink-0">
                                {imageSrc ? (
                                  <img 
                                    src={imageSrc} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Try alt image first
                                      if (product.imageUrlAlt && (e.target as HTMLImageElement).src !== product.imageUrlAlt) {
                                        (e.target as HTMLImageElement).src = product.imageUrlAlt;
                                      } else {
                                        // Use placeholder
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect fill="#fce7f3" width="56" height="56"/><text x="28" y="32" text-anchor="middle" fill="#ec4899" font-family="Arial" font-size="8">Skincare</text></svg>');
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-6 w-6 text-pink-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">{product.brand}</p>
                                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                {product.price && (
                                  <p className="text-xs text-gray-500">€{product.price.toFixed(2)}</p>
                                )}
                              </div>
                            </div>
                            {/* Shop Links */}
                            {shopLinks.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
                                {shopLinks.slice(0, 3).map((shop, i) => shop && (
                                  <a
                                    key={i}
                                    href={shop.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${shop.color} text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-0.5`}
                                  >
                                    {shop.label}
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {message.role === "user" && (
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
            
            {isAILoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                  <span className="text-sm text-gray-500">Analisi in corso...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Descrivi il tuo problema dermatologico..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                disabled={isAILoading}
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputMessage.trim() || isAILoading} 
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Le informazioni fornite hanno scopo educativo e non sostituiscono il parere di un medico.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Checker Dialog */}
      <Dialog open={showProductChecker} onOpenChange={(open) => {
        setShowProductChecker(open);
        if (!open) {
          setProductCheckResult(null);
          setProductCheckInput("");
          setProductIngredientInput("");
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-fuchsia-500 shadow-lg">
                <Scan className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Analisi Prodotto</DialogTitle>
                <p className="text-sm text-gray-500">Verifica compatibilità con la tua pelle</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* User skin profile - Editable */}
            <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Il tuo profilo pelle</p>
              </div>
              
              {/* Skin Type Selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-xs text-gray-500">Tipo:</Label>
                  <Select value={selectedSkinType} onValueChange={setSelectedSkinType}>
                    <SelectTrigger className="h-7 w-32 text-xs border-pink-200 bg-white">
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent>
                      {skinTypes.map(type => (
                        <SelectItem key={type.value} value={type.value} className="text-xs">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Skin Concerns */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Problemi:</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {skinConcernsList.map(concern => (
                      <Badge
                        key={concern.value}
                        variant={selectedConcerns.includes(concern.value) ? "default" : "outline"}
                        className={`cursor-pointer px-2 py-0.5 text-xs transition-all ${
                          selectedConcerns.includes(concern.value)
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0"
                            : "hover:bg-pink-50 text-gray-600 border-pink-200"
                        }`}
                        onClick={() => toggleConcern(concern.value)}
                      >
                        {concern.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Save Profile Button */}
                {(selectedSkinType !== user?.skinType || 
                  JSON.stringify(selectedConcerns.sort()) !== JSON.stringify(user?.skinConcerns?.sort() || [])) && (
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (user) {
                        await updateSkinProfile();
                      } else {
                        // Save to localStorage for non-logged users
                        const tempUser = {
                          id: "temp",
                          email: "guest",
                          skinType: selectedSkinType,
                          skinConcerns: selectedConcerns,
                        };
                        setUser(tempUser);
                        localStorage.setItem("glowlab_user", JSON.stringify(tempUser));
                      }
                    }}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs h-7"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Salva profilo
                  </Button>
                )}
              </div>
            </div>
            
            {/* Input Section */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nome prodotto</Label>
                <Input
                  value={productCheckInput}
                  onChange={(e) => setProductCheckInput(e.target.value)}
                  placeholder="es: COSRX Snail Mucin, The Ordinary Niacinamide..."
                  className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ingredienti (opzionale)</Label>
                <Input
                  value={productIngredientInput}
                  onChange={(e) => setProductIngredientInput(e.target.value)}
                  placeholder="es: Niacinamide, Retinolo, Acido Ialuronico..."
                  className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
                />
                <p className="text-xs text-gray-400">Separa gli ingredienti con virgole</p>
              </div>
            </div>
            
            <Button 
              onClick={checkProduct} 
              disabled={(!productCheckInput.trim() && !productIngredientInput.trim()) || isCheckingProduct}
              className="w-full bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 py-6 text-lg"
            >
              {isCheckingProduct ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analisi in corso...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-5 w-5" />
                  Analizza Prodotto
                </>
              )}
            </Button>
            
            {/* Results */}
            {productCheckResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Product Info */}
                {(productCheckResult.productName || productCheckResult.brand) && (
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    {productCheckResult.productImage && (
                      <img 
                        src={productCheckResult.productImage} 
                        alt={productCheckResult.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      {productCheckResult.brand && (
                        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">{productCheckResult.brand}</p>
                      )}
                      {productCheckResult.productName && (
                        <p className="font-semibold text-gray-800">{productCheckResult.productName}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Compatibility Score */}
                <div className={`p-6 rounded-2xl ${
                  productCheckResult.score >= 70 
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200" 
                    : productCheckResult.score >= 50 
                    ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200"
                    : "bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {productCheckResult.score >= 70 ? (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg">
                          <CheckCircle2 className="h-8 w-8 text-white" />
                        </div>
                      ) : productCheckResult.score >= 50 ? (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500 shadow-lg">
                          <AlertCircle className="h-8 w-8 text-white" />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 shadow-lg">
                          <XCircle className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <div>
                        <p className={`text-2xl font-bold ${
                          productCheckResult.score >= 70 ? "text-green-700" : 
                          productCheckResult.score >= 50 ? "text-yellow-700" : "text-red-700"
                        }`}>
                          {productCheckResult.score >= 70 ? "Compatibile" : 
                           productCheckResult.score >= 50 ? "Parzialmente" : "Non Consigliato"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Punteggio: {productCheckResult.score}/100
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-gray-800">{productCheckResult.score}%</div>
                    </div>
                  </div>
                  
                  {/* Score Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${productCheckResult.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-3 rounded-full ${
                        productCheckResult.score >= 70 ? "bg-gradient-to-r from-green-400 to-emerald-500" :
                        productCheckResult.score >= 50 ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
                        "bg-gradient-to-r from-red-400 to-rose-500"
                      }`}
                    />
                  </div>
                </div>
                
                {/* AI Analysis */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500">
                      <Stethoscope className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Analisi Dermatologica</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{productCheckResult.analysis}</p>
                    </div>
                  </div>
                </div>
                
                {/* Ingredient Analysis */}
                {productCheckResult.ingredientAnalysis && productCheckResult.ingredientAnalysis.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Ingredienti Analizzati</p>
                    <div className="grid gap-2">
                      {productCheckResult.ingredientAnalysis.map((ing, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 capitalize">{ing.name}</p>
                            {ing.data && (
                              <>
                                <p className="text-xs text-gray-500 mt-0.5">{ing.data.description}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {ing.data.benefits.slice(0, 3).map((b, j) => (
                                    <Badge key={j} className="text-xs bg-green-50 text-green-700 border-0">
                                      {b}
                                    </Badge>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Benefits */}
                {productCheckResult.benefits && productCheckResult.benefits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Benefici per la tua pelle
                    </p>
                    {productCheckResult.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                        <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Warnings */}
                {productCheckResult.warnings && productCheckResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Avvertenze
                    </p>
                    {productCheckResult.warnings.map((warning, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Recommendations */}
                {productCheckResult.recommendations && productCheckResult.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Consigli d'uso
                    </p>
                    {productCheckResult.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-rose-400" />
                        {rec}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Il Tuo Profilo</DialogTitle>
            <DialogDescription>
              Gestisci le tue preferenze e dati
            </DialogDescription>
          </DialogHeader>
          {user && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-medium">{user.name || "Utente"}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                {user.skinType && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Tipo di pelle:</span>{" "}
                    <Badge className="bg-pink-100 text-pink-700">
                      {skinTypes.find(t => t.value === user.skinType)?.label || user.skinType}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowProfile(false);
                    setShowSkinAnalysis(true);
                  }}
                  className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50"
                >
                  Modifica Profilo Pelle
                </Button>
                <Button
                  onClick={() => setShowProfile(false)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
                >
                  Chiudi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
