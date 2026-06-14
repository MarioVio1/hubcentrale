"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Star, 
  Heart, 
  MapPin, 
  Leaf,
  Package,
  ExternalLink,
  Sparkles
} from "lucide-react";

interface ProductCardProps {
  product: {
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
    imageUrl?: string;
    isKorean?: boolean;
    isVegan?: boolean;
    isCrueltyFree?: boolean;
    description?: string;
    // Shop links
    officialUrl?: string;
    redcareUrl?: string;
    dfarmaUrl?: string;
    sephoraUrl?: string;
    amazonUrl?: string;
    miinUrl?: string;
  };
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

const productTypeLabels: Record<string, string> = {
  cleanser: "Detergente",
  toner: "Tonico",
  essence: "Essence",
  serum: "Siero",
  cream: "Crema",
  spf: "SPF",
  mask: "Maschera",
  oil: "Olio",
  exfoliant: "Esfoliante",
  moisturizer: "Idratante",
  treatment: "Trattamento",
  eye_cream: "Contorno Occhi",
  lipstick: "Rossetto",
  shampoo: "Shampoo",
  conditioner: "Balsamo",
};

// Shop configuration
const shopConfig = [
  { key: "official", label: "Sito Ufficiale", color: "bg-pink-500 hover:bg-pink-600" },
  { key: "redcare", label: "Redcare", color: "bg-red-500 hover:bg-red-600" },
  { key: "sephora", label: "Sephora", color: "bg-black hover:bg-gray-800" },
  { key: "amazon", label: "Amazon", color: "bg-orange-500 hover:bg-orange-600" },
];

// Product-specific placeholder colors
const getProductPlaceholder = (productType: string, brand: string) => {
  const colors: Record<string, string> = {
    essence: "from-amber-100 to-orange-100",
    serum: "from-purple-100 to-pink-100",
    cleanser: "from-blue-100 to-cyan-100",
    toner: "from-teal-100 to-green-100",
    spf: "from-yellow-100 to-orange-100",
    cream: "from-pink-100 to-rose-100",
    mask: "from-indigo-100 to-purple-100",
    treatment: "from-rose-100 to-red-100",
  };
  return colors[productType] || "from-gray-100 to-slate-100";
};

export default function ProductCard({ product, isFavorite, onFavoriteToggle }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showLinks, setShowLinks] = useState(false);

  // Get available shops
  const getAvailableShops = () => {
    const shops: Array<{ key: string; url: string; label: string; color: string }> = [];
    
    if (product.miinUrl) {
      shops.push({ key: "miin", url: product.miinUrl, label: "Miin Cosmetics", color: "bg-pink-500 hover:bg-pink-600" });
    }
    if (product.officialUrl) {
      shops.push({ key: "official", url: product.officialUrl, label: "Sito Ufficiale", color: "bg-pink-500 hover:bg-pink-600" });
    }
    if (product.sephoraUrl) {
      shops.push({ key: "sephora", url: product.sephoraUrl, label: "Sephora", color: "bg-black hover:bg-gray-800" });
    }
    if (product.amazonUrl) {
      shops.push({ key: "amazon", url: product.amazonUrl, label: "Amazon", color: "bg-orange-500 hover:bg-orange-600" });
    }
    if (product.redcareUrl) {
      shops.push({ key: "redcare", url: product.redcareUrl, label: "Redcare", color: "bg-red-500 hover:bg-red-600" });
    }
    if (product.dfarmaUrl) {
      shops.push({ key: "dfarma", url: product.dfarmaUrl, label: "DFarma", color: "bg-green-500 hover:bg-green-600" });
    }
    
    return shops;
  };

  const availableShops = getAvailableShops();

  return (
    <>
      <Card className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
        {/* Image */}
        <div 
          className={`relative aspect-square bg-gradient-to-br ${getProductPlaceholder(product.productType, product.brand)} overflow-hidden cursor-pointer`}
          onClick={() => setShowLinks(true)}
        >
          {product.imageUrl && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
                  <Package className="h-12 w-12 text-pink-200 animate-pulse" />
                </div>
              )}
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                loading="lazy"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <Package className="h-16 w-16 text-pink-300 mb-2" />
              <span className="text-xs text-gray-400 text-center font-medium">{product.brand}</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isKorean && (
              <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 text-xs font-medium shadow-sm">
                🇰🇷 K-Beauty
              </Badge>
            )}
            {product.isVegan && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs font-medium shadow-sm">
                <Leaf className="h-3 w-3 mr-1" />
                Vegan
              </Badge>
            )}
            {product.isCrueltyFree && !product.isVegan && (
              <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 text-xs font-medium shadow-sm">
                🐰 Cruelty-Free
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 h-9 w-9 rounded-full transition-all shadow-sm ${
              isFavorite 
                ? "bg-pink-500 text-white hover:bg-pink-600" 
                : "bg-white/90 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-white"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.();
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-white" : ""}`} />
          </Button>

          {/* Product Type Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/95 text-gray-700 border-0 text-xs shadow-sm">
              {productTypeLabels[product.productType] || product.productType}
            </Badge>
          </div>

          {/* Quick Buy Button (appears on hover) */}
          {availableShops.length > 0 && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLinks(true);
                }}
              >
                Acquista
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Brand & Country */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-semibold text-pink-600 uppercase tracking-wide">{product.brand}</span>
            {product.brandCountry && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {product.brandCountry}
                </span>
              </>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors text-sm leading-snug min-h-[2.5rem] cursor-pointer" onClick={() => setShowLinks(true)}>
            {product.name}
          </h3>

          {/* Rating & Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-sm font-semibold text-gray-700">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>
            {product.price && (
              <span className="font-bold text-gray-800 text-base">
                €{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Shop Links Preview */}
          {availableShops.length > 0 && (
            <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-100">
              {availableShops.map((shop) => (
                <a
                  key={shop.key}
                  href={shop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`text-[10px] px-2 py-1 rounded-full text-white font-medium transition-colors ${shop.color}`}
                >
                  {shop.label}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Links Dialog */}
      <Dialog open={showLinks} onOpenChange={setShowLinks}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              {product.name}
            </DialogTitle>
            <DialogDescription>
              {product.brand} • {product.brandCountry || 'Originale'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Product Image */}
            {product.imageUrl && (
              <div className="aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Price */}
            {product.price && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-800">€{product.price.toFixed(2)}</span>
              </div>
            )}
            
            {/* Shop Links */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Dove acquistare:</p>
              <div className="grid gap-2">
                {availableShops.map((shop) => (
                  <a
                    key={shop.key}
                    href={shop.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-3 rounded-xl text-white transition-colors ${shop.color}`}
                  >
                    <span className="font-medium">{shop.label}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Skin Types & Concerns */}
            {product.skinTypes && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">Adatto per:</p>
                <div className="flex flex-wrap gap-1.5">
                  {typeof product.skinTypes === 'string' 
                    ? product.skinTypes.split(',').map((type) => (
                        <Badge key={type} variant="outline" className="text-xs border-pink-200 text-pink-600">
                          {type.trim() === 'all' ? 'Tutti i tipi' : type.trim()}
                        </Badge>
                      ))
                    : product.skinTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs border-pink-200 text-pink-600">
                          {type === 'all' ? 'Tutti i tipi' : type}
                        </Badge>
                      ))
                  }
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
