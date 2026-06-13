"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Droplets, 
  Sun, 
  Wind, 
  Thermometer,
  Sparkles,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SkinQuizProps {
  onComplete?: (results: QuizResults) => void;
}

interface QuizResults {
  skinType: string;
  concerns: string[];
  age: string;
  climate: string;
}

const skinTypes = [
  { id: "oily", label: "Grassa", icon: Droplets, desc: "Pelle lucida, pori visibili" },
  { id: "dry", label: "Secca", icon: Sun, desc: "Pelle tesa, screpolature" },
  { id: "combination", label: "Mista", icon: Wind, desc: "Zona T grassa, guance secche" },
  { id: "sensitive", label: "Sensibile", icon: Sparkles, desc: "Rossori, reattività" },
  { id: "normal", label: "Normale", icon: Thermometer, desc: "Bilanciata, senza problemi" },
];

const skinConcerns = [
  { id: "acne", label: "Acne" },
  { id: "pores", label: "Pori dilatati" },
  { id: "darkSpots", label: "Macchie scure" },
  { id: "wrinkles", label: "Rughe" },
  { id: "redness", label: "Rossori" },
  { id: "dullness", label: "Pelle opaca" },
  { id: "aging", label: "Anti-age" },
  { id: "dehydration", label: "Disidratazione" },
];

const ageRanges = [
  { id: "under20", label: "Sotto i 20" },
  { id: "20-29", label: "20-29" },
  { id: "30-39", label: "30-39" },
  { id: "40-49", label: "40-49" },
  { id: "50plus", label: "50+" },
];

const climates = [
  { id: "humid", label: "Umidità alta", icon: "💧" },
  { id: "dry", label: "Clima secco", icon: "🏜️" },
  { id: "cold", label: "Clima freddo", icon: "❄️" },
  { id: "hot", label: "Clima caldo", icon: "☀️" },
  { id: "temperate", label: "Clima temperato", icon: "🌤️" },
];

export default function SkinQuiz({ onComplete }: SkinQuizProps) {
  const [step, setStep] = useState(0);
  const [selectedSkinType, setSelectedSkinType] = useState<string | null>(null);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedClimate, setSelectedClimate] = useState<string | null>(null);

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const toggleConcern = (id: string) => {
    setSelectedConcerns(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Quiz complete
      const results: QuizResults = {
        skinType: selectedSkinType || "",
        concerns: selectedConcerns,
        age: selectedAge || "",
        climate: selectedClimate || "",
      };
      onComplete?.(results);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return selectedSkinType !== null;
      case 1: return selectedConcerns.length > 0;
      case 2: return selectedAge !== null;
      case 3: return selectedClimate !== null;
      default: return false;
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardContent className="p-6 md:p-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Passo {step + 1} di {totalSteps}</span>
            <span className="text-sm font-medium text-[#4CAF50]">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-[#E8F5E9]" />
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Skin Type */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Qual è il tuo tipo di pelle?
                </h3>
                <p className="text-gray-500 text-sm">
                  Seleziona la descrizione che meglio si adatta alla tua pelle
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skinTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedSkinType(type.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedSkinType === type.id
                        ? "border-[#4CAF50] bg-[#E8F5E9]"
                        : "border-gray-200 hover:border-[#C8E6C9] hover:bg-gray-50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedSkinType === type.id ? "bg-[#4CAF50] text-white" : "bg-gray-100"
                    }`}>
                      <type.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.desc}</div>
                    </div>
                    {selectedSkinType === type.id && (
                      <CheckCircle2 className="h-5 w-5 text-[#4CAF50] ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Skin Concerns */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Quali sono i tuoi problemi principali?
                </h3>
                <p className="text-gray-500 text-sm">
                  Seleziona tutti quelli che ti riguardano
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {skinConcerns.map((concern) => (
                  <Badge
                    key={concern.id}
                    variant={selectedConcerns.includes(concern.id) ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                      selectedConcerns.includes(concern.id)
                        ? "bg-[#4CAF50] hover:bg-[#43A047] text-white"
                        : "hover:bg-[#E8F5E9] text-gray-700"
                    }`}
                    onClick={() => toggleConcern(concern.id)}
                  >
                    {concern.label}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Age */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Quanti anni hai?
                </h3>
                <p className="text-gray-500 text-sm">
                  Questo ci aiuta a consigliarti i prodotti più adatti
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ageRanges.map((age) => (
                  <button
                    key={age.id}
                    onClick={() => setSelectedAge(age.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedAge === age.id
                        ? "border-[#4CAF50] bg-[#E8F5E9]"
                        : "border-gray-200 hover:border-[#C8E6C9] hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium text-gray-800">{age.label}</span>
                    {selectedAge === age.id && (
                      <CheckCircle2 className="h-4 w-4 text-[#4CAF50] ml-2 inline" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Climate */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Che clima c'è nella tua zona?
                </h3>
                <p className="text-gray-500 text-sm">
                  Il clima influenza le esigenze della tua pelle
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {climates.map((climate) => (
                  <button
                    key={climate.id}
                    onClick={() => setSelectedClimate(climate.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedClimate === climate.id
                        ? "border-[#4CAF50] bg-[#E8F5E9]"
                        : "border-gray-200 hover:border-[#C8E6C9] hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-2xl">{climate.icon}</span>
                    <span className="font-medium text-gray-800">{climate.label}</span>
                    {selectedClimate === climate.id && (
                      <CheckCircle2 className="h-5 w-5 text-[#4CAF50] ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="border-gray-200"
          >
            Indietro
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-[#4CAF50] hover:bg-[#43A047]"
          >
            {step === totalSteps - 1 ? "Completa Analisi" : "Continua"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
