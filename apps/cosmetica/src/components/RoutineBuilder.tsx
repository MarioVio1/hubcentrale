"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sun, 
  Moon, 
  Plus, 
  Sparkles, 
  Trash2,
  GripVertical,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoutineStep {
  id: string;
  stepOrder: number;
  productName: string;
  productType: string;
  brand?: string;
  notes?: string;
}

interface RoutineBuilderProps {
  onSave?: (routine: { morning: RoutineStep[]; evening: RoutineStep[] }) => void;
}

const productTypes = [
  { id: "cleanser", label: "Detergente", icon: "🧴" },
  { id: "toner", label: "Tonico", icon: "💧" },
  { id: "essence", label: "Essence", icon: "✨" },
  { id: "serum", label: "Siero", icon: "🔬" },
  { id: "moisturizer", label: "Idratante", icon: "🌿" },
  { id: "cream", label: "Crema", icon: "🫧" },
  { id: "spf", label: "SPF", icon: "☀️" },
  { id: "treatment", label: "Trattamento", icon: "💊" },
  { id: "eye_cream", label: "Contorno Occhi", icon: "👁️" },
  { id: "mask", label: "Maschera", icon: "🎭" },
  { id: "oil", label: "Olio", icon: "🫒" },
  { id: "exfoliant", label: "Esfoliante", icon: "🔄" },
];

const suggestedRoutine = {
  morning: [
    { stepOrder: 1, productType: "cleanser", productName: "Detergente delicato" },
    { stepOrder: 2, productType: "toner", productName: "Tonico idratante" },
    { stepOrder: 3, productType: "serum", productName: "Siero Vitamina C" },
    { stepOrder: 4, productType: "moisturizer", productName: "Crema idratante" },
    { stepOrder: 5, productType: "spf", productName: "Protezione solare SPF 50" },
  ],
  evening: [
    { stepOrder: 1, productType: "cleanser", productName: "Struccante/Detergente" },
    { stepOrder: 2, productType: "cleanser", productName: "Seconda detersione" },
    { stepOrder: 3, productType: "toner", productName: "Tonico" },
    { stepOrder: 4, productType: "essence", productName: "Essence" },
    { stepOrder: 5, productType: "serum", productName: "Siero trattamento" },
    { stepOrder: 6, productType: "cream", productName: "Crema notte" },
  ],
};

export default function RoutineBuilder({ onSave }: RoutineBuilderProps) {
  const [morningRoutine, setMorningRoutine] = useState<RoutineStep[]>([]);
  const [eveningRoutine, setEveningRoutine] = useState<RoutineStep[]>([]);
  const [activeTab, setActiveTab] = useState("morning");

  const generateId = () => Math.random().toString(36).substring(7);

  const addStep = (timeOfDay: "morning" | "evening", productType: string) => {
    const productInfo = productTypes.find(p => p.id === productType);
    const newStep: RoutineStep = {
      id: generateId(),
      stepOrder: (timeOfDay === "morning" ? morningRoutine : eveningRoutine).length + 1,
      productName: "",
      productType,
    };

    if (timeOfDay === "morning") {
      setMorningRoutine([...morningRoutine, newStep]);
    } else {
      setEveningRoutine([...eveningRoutine, newStep]);
    }
  };

  const removeStep = (timeOfDay: "morning" | "evening", stepId: string) => {
    if (timeOfDay === "morning") {
      setMorningRoutine(morningRoutine.filter(s => s.id !== stepId));
    } else {
      setEveningRoutine(eveningRoutine.filter(s => s.id !== stepId));
    }
  };

  const generateAIRoutine = () => {
    const morningSteps = suggestedRoutine.morning.map((s, i) => ({
      ...s,
      id: generateId(),
    }));
    const eveningSteps = suggestedRoutine.evening.map((s, i) => ({
      ...s,
      id: generateId(),
    }));
    setMorningRoutine(morningSteps);
    setEveningRoutine(eveningSteps);
  };

  const currentRoutine = activeTab === "morning" ? morningRoutine : eveningRoutine;
  const setCurrentRoutine = activeTab === "morning" ? setMorningRoutine : setEveningRoutine;

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#4CAF50]" />
              Routine Builder
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Crea la tua routine skincare personalizzata
            </p>
          </div>
          <Button
            onClick={generateAIRoutine}
            className="bg-[#4CAF50] hover:bg-[#43A047]"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Genera Routine AI
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="morning" 
              className="data-[state=active]:bg-[#E3F2FD] data-[state=active]:text-[#1565C0]"
            >
              <Sun className="h-4 w-4 mr-2" />
              Mattina
            </TabsTrigger>
            <TabsTrigger 
              value="evening"
              className="data-[state=active]:bg-[#F3E5F5] data-[state=active]:text-[#7B1FA2]"
            >
              <Moon className="h-4 w-4 mr-2" />
              Sera
            </TabsTrigger>
          </TabsList>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Routine Steps */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Passi della routine ({currentRoutine.length})
              </h4>
              <ScrollArea className="h-[400px] pr-4">
                <AnimatePresence>
                  {currentRoutine.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <div className="text-4xl mb-3">🧴</div>
                      <p className="text-sm">Aggiungi prodotti alla tua routine</p>
                      <p className="text-xs mt-1">o usa "Genera Routine AI"</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentRoutine.map((step, index) => {
                        const productInfo = productTypes.find(p => p.id === step.productType);
                        return (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group hover:bg-[#E8F5E9] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#4CAF50] text-white text-xs font-medium">
                                {index + 1}
                              </span>
                            </div>
                            <span className="text-xl">{productInfo?.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {step.productName || productInfo?.label}
                              </p>
                              <p className="text-xs text-gray-500">{productInfo?.label}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeStep(activeTab as "morning" | "evening", step.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </div>

            {/* Add Products */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Aggiungi prodotto
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {productTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => addStep(activeTab as "morning" | "evening", type.id)}
                    className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-[#4CAF50] hover:bg-[#E8F5E9] transition-all text-left"
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-sm text-gray-700">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Tabs>

        {/* Save Button */}
        {(morningRoutine.length > 0 || eveningRoutine.length > 0) && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <Button
              onClick={() => onSave?.({ morning: morningRoutine, evening: eveningRoutine })}
              className="w-full bg-[#4CAF50] hover:bg-[#43A047]"
            >
              Salva Routine
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
