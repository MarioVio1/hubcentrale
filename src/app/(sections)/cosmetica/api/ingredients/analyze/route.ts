import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

const INGREDIENT_SYSTEM_PROMPT = `Sei un esperto di ingredienti cosmetici e chimica dermatologica. Analizza gli ingredienti forniti e restituisci un JSON con le seguenti informazioni per ogni ingrediente:

Per ogni ingrediente, fornisci:
1. name: nome comune dell'ingrediente
2. inciName: nome INCI ufficiale (se diverso)
3. description: breve descrizione (1-2 frasi)
4. benefits: array di benefici principali
5. concerns: array di possibili controindicazioni o effetti collaterali
6. safetyRating: punteggio sicurezza da 1 a 5 (5 = molto sicuro, 1 = rischio alto)
7. suitableFor: array di tipi di pelle adatti (oily, dry, combination, sensitive, normal, all)
8. avoidWith: array di condizioni/pelli da evitare
9. isVegan: boolean
10. pregnancySafe: boolean

Rispondi SOLO con un JSON valido, senza testo aggiuntivo:
{
  "ingredients": [...]
}

Se non riconosci un ingrediente, fornisci comunque una valutazione basata sulla sicurezza generale.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Ingredients array is required" },
        { status: 400 }
      );
    }

    // Initialize ZAI
    const zai = await ZAI.create();

    // Build prompt
    const userPrompt = `Analizza questi ingredienti cosmetici: ${ingredients.join(", ")}

Per ogni ingrediente, fornisci un'analisi dettagliata in formato JSON.`;

    // Get completion
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: INGREDIENT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      thinking: { type: "disabled" }
    });

    const responseText = completion.choices[0]?.message?.content || "{}";

    // Try to parse JSON
    try {
      // Extract JSON from response if it contains markdown code blocks
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const parsed = JSON.parse(jsonStr);
      return NextResponse.json(parsed);
    } catch {
      // Return structured response if JSON parsing fails
      return NextResponse.json({
        ingredients: ingredients.map(name => ({
          name,
          description: "Analisi non disponibile. Consulta un dermatologo per maggiori informazioni.",
          benefits: [],
          concerns: [],
          safetyRating: 3,
          suitableFor: ["all"],
          avoidWith: [],
          isVegan: true,
          pregnancySafe: true,
        }))
      });
    }
  } catch (error) {
    console.error("Ingredient analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze ingredients" },
      { status: 500 }
    );
  }
}
