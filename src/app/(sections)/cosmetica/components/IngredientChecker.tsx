"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Loader2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IngredientAnalysis {
  name: string;
  inciName?: string;
  description: string;
  benefits: string[];
  concerns: string[];
  safetyRating: number;
  suitableFor: string[];
  avoidWith: string[];
  isVegan: boolean;
  pregnancySafe: boolean;
}

const sampleIngredients: IngredientAnalysis[] = [
  {
    name: "Niacinamide",
    inciName: "Niacinamide",
    description: "Vitamina B3, potente ingrediente multi-task per la pelle.",
    benefits: ["Riduce pori", "Controlla sebo", "Illumina", "Anti-infiammatorio"],
    concerns: [],
    safetyRating: 5,
    suitableFor: ["oily", "combination", "sensitive", "normal"],
    avoidWith: [],
    isVegan: true,
    pregnancySafe: true,
  },
  {
    name: "Retinol",
    inciName: "Retinol",
    description: "Derivato della vitamina A, potente anti-aging.",
    benefits: ["Anti-rughe", "Uniforma pelle", "Riduce macchie", "Anti-acne"],
    concerns: ["Può irritare", "Fotosensibilità"],
    safetyRating: 4,
    suitableFor: ["normal", "combination", "oily"],
    avoidWith: ["sensitive", "pregnancy"],
    isVegan: true,
    pregnancySafe: false,
  },
  {
    name: "Hyaluronic Acid",
    inciName: "Sodium Hyaluronate",
    description: "Acido ialuronico, potente idratante naturale.",
    benefits: ["Idratazione profonda", "Rimpolpa", "Anti-età"],
    concerns: [],
    safetyRating: 5,
    suitableFor: ["all"],
    avoidWith: [],
    isVegan: true,
    pregnancySafe: true,
  },
];

export default function IngredientChecker() {
  const [mode, setMode] = useState<"single" | "list">("single");
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState<IngredientAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeIngredients = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/ingredients/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ingredients: mode === "list" 
            ? input.split(",").map(i => i.trim()).filter(Boolean)
            : [input.trim()]
        }),
      });

      const data = await response.json();
      setIngredients(data.ingredients || sampleIngredients);
    } catch (error) {
      console.error("Analysis error:", error);
      // Use sample data for demo
      setIngredients(sampleIngredients);
    } finally {
      setIsLoading(false);
    }
  };

  const getSafetyColor = (rating: number) => {
    if (rating >= 4) return "text-green-500";
    if (rating >= 3) return "text-yellow-500";
    return "text-red-500";
  };

  const getSafetyBadge = (rating: number) => {
    if (rating >= 4) return { label: "Sicuro", color: "bg-[#E8F5E9] text-[#2E7D32]" };
    if (rating >= 3) return { label: "Attenzione", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Rischioso", color: "bg-red-100 text-red-700" };
  };

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-[#4CAF50]" />
              Ingredient Checker
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Analizza gli ingredienti dei tuoi cosmetici
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={mode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("single")}
              className={mode === "single" ? "bg-[#4CAF50] hover:bg-[#43A047]" : ""}
            >
              Singolo
            </Button>
            <Button
              variant={mode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("list")}
              className={mode === "list" ? "bg-[#4CAF50] hover:bg-[#43A047]" : ""}
            >
              Lista INCI
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Input */}
        <div className="space-y-4">
          {mode === "single" ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Cerca un ingrediente (es. Niacinamide, Retinol...)"
                  className="pl-10 border-gray-200 focus:border-[#4CAF50]"
                  onKeyDown={(e) => e.key === "Enter" && analyzeIngredients()}
                />
              </div>
              <Button
                onClick={analyzeIngredients}
                disabled={!input.trim() || isLoading}
                className="bg-[#4CAF50] hover:bg-[#43A047]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Incolla la lista ingredienti INCI (separati da virgola o nuova riga)..."
                className="min-h-[120px] border-gray-200 focus:border-[#4CAF50]"
              />
              <Button
                onClick={analyzeIngredients}
                disabled={!input.trim() || isLoading}
                className="w-full bg-[#4CAF50] hover:bg-[#43A047]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analisi in corso...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analizza Ingredienti
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="mt-6 h-[400px]">
          <AnimatePresence>
            {ingredients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {ingredients.map((ingredient, index) => {
                  const safetyBadge = getSafetyBadge(ingredient.safetyRating);
                  return (
                    <motion.div
                      key={ingredient.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{ingredient.name}</h4>
                          {ingredient.inciName && ingredient.inciName !== ingredient.name && (
                            <p className="text-xs text-gray-500">INCI: {ingredient.inciName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={safetyBadge.color}>
                            {safetyBadge.label}
                          </Badge>
                          <div className={`flex items-center ${getSafetyColor(ingredient.safetyRating)}`}>
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3">{ingredient.description}</p>

                      {/* Benefits */}
                      {ingredient.benefits.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Benefici:</p>
                          <div className="flex flex-wrap gap-1">
                            {ingredient.benefits.map((benefit) => (
                              <Badge
                                key={benefit}
                                variant="outline"
                                className="bg-[#E8F5E9] text-[#2E7D32] border-0 text-xs"
                              >
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Concerns */}
                      {ingredient.concerns.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Attenzione:</p>
                          <div className="flex flex-wrap gap-1">
                            {ingredient.concerns.map((concern) => (
                              <Badge
                                key={concern}
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700 border-0 text-xs"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {concern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suitable For */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Adatto per: {ingredient.suitableFor.join(", ")}
                        </span>
                        {!ingredient.pregnancySafe && (
                          <span className="text-red-500">⚠️ Non in gravidanza</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {ingredients.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FlaskConical className="h-12 w-12 mb-3" />
              <p className="text-sm">Cerca o incolla ingredienti per iniziare</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
