import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

// Cache ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Product ID patterns for exact matching - COMPREHENSIVE
const PRODUCT_ID_MAP: Record<string, string> = {
  // COSRX
  'cosrx snail': 'COSRX-SNAIL-96-ESSENCE',
  'snail mucin': 'COSRX-SNAIL-96-ESSENCE',
  'snail essence': 'COSRX-SNAIL-96-ESSENCE',
  'snail 96': 'COSRX-SNAIL-96-ESSENCE',
  'cosrx cleanser': 'COSRX-LOW-PH-CLEANSER',
  'low ph cleanser': 'COSRX-LOW-PH-CLEANSER',
  'cosrx aha': 'COSRX-AHA7-WHITEHEAD',
  'aha 7': 'COSRX-AHA7-WHITEHEAD',
  'cosrx bha': 'COSRX-BHA-BLACKHEAD',
  'bha blackhead': 'COSRX-BHA-BLACKHEAD',
  
  // Beauty of Joseon
  'beauty of joseon': 'BOJ-RELIEF-SUN-SPF50',
  'joseon sun': 'BOJ-RELIEF-SUN-SPF50',
  'relief sun': 'BOJ-RELIEF-SUN-SPF50',
  'joseon spf': 'BOJ-RELIEF-SUN-SPF50',
  'rice probiotics': 'BOJ-RELIEF-SUN-SPF50',
  'joseon ginseng': 'BOJ-GINSENG-ESSENCE',
  'ginseng essence': 'BOJ-GINSENG-ESSENCE',
  'joseon serum': 'BOJ-GINSENG-SERUM',
  'ginseng serum': 'BOJ-GINSENG-SERUM',
  
  // Dear Klairs
  'klairs vitamin': 'KLAIRS-VITAMIN-DROP',
  'vitamin drop': 'KLAIRS-VITAMIN-DROP',
  'freshly juiced': 'KLAIRS-VITAMIN-DROP',
  'klairs toner': 'KLAIRS-SUPPLE-PREPARATION-TONER',
  'supple preparation': 'KLAIRS-SUPPLE-PREPARATION-TONER',
  
  // Laneige
  'laneige water mask': 'LANEIGE-WATER-SLEEPING-MASK',
  'laneige sleeping mask': 'LANEIGE-WATER-SLEEPING-MASK',
  'water sleeping': 'LANEIGE-WATER-SLEEPING-MASK',
  'laneige lip': 'LANEIGE-LIP-SLEEPING-MASK',
  'lip sleeping mask': 'LANEIGE-LIP-SLEEPING-MASK',
  'lip mask': 'LANEIGE-LIP-SLEEPING-MASK',
  
  // Round Lab
  'round lab dokdo': 'ROUNDLAB-DOKDO-TONER',
  'dokdo toner': 'ROUNDLAB-DOKDO-TONER',
  'dokdo': 'ROUNDLAB-DOKDO-TONER',
  
  // Purito
  'purito centella': 'PURITO-CENTELLA-BUFFET-SERUM',
  'purito buffet': 'PURITO-CENTELLA-BUFFET-SERUM',
  'centella buffet': 'PURITO-CENTELLA-BUFFET-SERUM',
  
  // Isntree
  'isntree hyaluronic': 'ISNTREE-HYALURONIC-ACID-TONER',
  'isntree toner': 'ISNTREE-HYALURONIC-ACID-TONER',
  
  // Torriden
  'torriden dive': 'TORRIDEN-DIVE-IN-SERUM',
  'torriden serum': 'TORRIDEN-DIVE-IN-SERUM',
  
  // Anua
  'anua heartleaf': 'ANUA-HEARTLEAF-TONER',
  'heartleaf toner': 'ANUA-HEARTLEAF-TONER',
  'heartleaf': 'ANUA-HEARTLEAF-TONER',
  
  // Some By Mi
  'some by mi': 'SOMEBYMI-AHA-BHA-PHA-TONER',
  'miracle toner': 'SOMEBYMI-AHA-BHA-PHA-TONER',
  'aha bha pha': 'SOMEBYMI-AHA-BHA-PHA-TONER',
  
  // I'm From
  "i'm from rice": 'IMFROM-RICE-TONER',
  'rice toner': 'IMFROM-RICE-TONER',
  
  // La Roche-Posay
  'cicaplast': 'LRP-CICAPLAST-BAUME-B5',
  'baume b5': 'LRP-CICAPLAST-BAUME-B5',
  'effaclar duo': 'LRP-EFFACLAR-DUO-PLUS',
  'effaclar': 'LRP-EFFACLAR-DUO-PLUS',
  'la roche posay': 'LRP-CICAPLAST-BAUME-B5',
  'larocheposay': 'LRP-CICAPLAST-BAUME-B5',
  
  // Bioderma
  'sensibio': 'BIODERMA-SENSIBIO-H2O',
  'bioderma micellar': 'BIODERMA-SENSIBIO-H2O',
  'bioderma h2o': 'BIODERMA-SENSIBIO-H2O',
  
  // Vichy
  'mineral 89': 'VICHY-MINERAL-89',
  'vichy 89': 'VICHY-MINERAL-89',
  'vichy hyaluronic': 'VICHY-MINERAL-89',
  
  // The Ordinary
  'niacinamide': 'ORD-NIACINAMIDE-10-ZINC-1',
  'the ordinary niacinamide': 'ORD-NIACINAMIDE-10-ZINC-1',
  'niacinamide zinc': 'ORD-NIACINAMIDE-10-ZINC-1',
  'retinol': 'ORD-RETINOL-05-SQUALANE',
  'the ordinary retinol': 'ORD-RETINOL-05-SQUALANE',
  'hyaluronic acid': 'ORD-HYALURONIC-ACID-2-B5',
  'the ordinary hyaluronic': 'ORD-HYALURONIC-ACID-2-B5',
  
  // CeraVe
  'cerave cleanser': 'CERAVE-HYDRATING-CLEANSER',
  'cerave hydrating': 'CERAVE-HYDRATING-CLEANSER',
  'cerave cream': 'CERAVE-MOISTURIZING-CREAM',
  'cerave moisturizing': 'CERAVE-MOISTURIZING-CREAM',
  'cerave': 'CERAVE-HYDRATING-CLEANSER',
  
  // Paula's Choice
  'paula bha': 'PC-BHA-2-LIQUID',
  'paulas choice': 'PC-BHA-2-LIQUID',
  'bha liquid': 'PC-BHA-2-LIQUID',
  'skin perfecting bha': 'PC-BHA-2-LIQUID',
  
  // Hada Labo
  'hada labo': 'HADALABO-GOKUJYUN-PREMIUM',
  'gokujyun': 'HADALABO-GOKUJYUN-PREMIUM',
  'hada labo premium': 'HADALABO-GOKUJYUN-PREMIUM',
  
  // Olaplex
  'olaplex': 'OLAPLEX-NO3',
  'olaplex no.3': 'OLAPLEX-NO3',
  'olaplex 3': 'OLAPLEX-NO3',
  'hair perfector': 'OLAPLEX-NO3',
  
  // SK-II
  'sk-ii': 'SKII-FTE',
  'skii': 'SKII-FTE',
  'facial treatment essence': 'SKII-FTE',
  'pitera': 'SKII-FTE',
  
  // Estée Lauder
  'advanced night repair': 'ESTEE-ANR',
  'estee lauder': 'ESTEE-ANR',
  'night repair': 'ESTEE-ANR',
  'anr': 'ESTEE-ANR',
  
  // Drunk Elephant
  'drunk elephant': 'DRUNK-PROTINI',
  'protini': 'DRUNK-PROTINI',
  'protini cream': 'DRUNK-PROTINI',
};

// Medical-grade quick response templates for common skin conditions
const QUICK_RESPONSES: Record<string, { text: string; productIds: string[] }> = {
  acne: {
    text: `🩺 **Consulenza Dermatologica - Trattamento Acne**

**DIAGNOSI CLINICA:**
L'acne vulgaris è una dermatosi infiammatoria delle unità pilosebacee, causata da:
• Iperproduzione di sebo (seborrea)
• Ipercheratinizzazione del follicolo
• Colonizzazione da *Cutibacterium acnes*
• Risposta infiammatoria

**TRATTAMENTO GRADUATO:**

**Grado 1-2 (Acne lieve-moderata):**
• **Acido Salicilico 0.5-2%** - cheratolitico, comedolitico
• **Niacinamide 4-10%** - anti-infiammatorio, seboregolatore
• **Benzoyl Peroxide 2.5-5%** - antibatterico (applicazione spot)

**Grado 3-4 (Acne moderata-severa):**
• **Retinoidi topici** (Adapalene 0.1%, Tretinoina 0.025-0.05%)
• **Associazione Adapalene + Benzoyl Peroxide**
• *Consulta dermatologo per Isotretinoina orale*

**ROUTINE CLINICA:**
🌅 **Mattina:** Detergente pH 5.5 → Niacinamide → Idratante non-comedogenico → SPF 50+
🌙 **Sera:** Double cleanse → BHA/Salicylic Acid → Trattamento attivo → Idratante

⚠️ **CONTROINDICAZIONI:**
• Evitare prodotti comedogenici
• Non strizzare le lesioni (risposta infiammatoria, cicatrici)
• SPF OBBLIGATORIO con retinoidi/acidi

📅 **Timeline:** Miglioramento visibile in 4-8 settimane; completezza risultati in 3-6 mesi`,
    productIds: ['COSRX-LOW-PH-CLEANSER', 'ORD-NIACINAMIDE-10-ZINC-1', 'PC-BHA-2-LIQUID', 'SOMEBYMI-AHA-BHA-PHA-TONER']
  },
  routine: {
    text: `🩺 **Protocollo Skincare K-Beauty Evidence-Based**

**FONDAMENTI SCIENTIFICI:**
La skincare coreana si basa su:
• Barrier repair (ceramidi, acidi grassi, colesterolo)
• Idratazione stratificata (umettanti + occlusivi)
• Protezione solare (SPF 50+ PA++++)

**ROUTINE MATTUTINA:**
1. 🧴 **Detergente** (solo se uso prodotti waterproof)
2. 💧 **Tonico** (pH 5.5-6.5, prepara la pelle)
3. 💊 **Siero attivo** (Vitamina C 15-20% al mattino)
4. 👁️ **Contorno occhi** (peptidi, caffeine)
5. 💧 **Crema idratante** (ceramidi, HA)
6. ☀️ **SPF 50+ PA++++** (OBBLIGATORIO!)

**ROUTINE SERALE:**
1. 🧴 **Double Cleanse** (olio + detergente acquoso)
2. 💧 **Tonico**
3. 🔬 **Trattamento attivo** (retinolo/retinal 2-3x/sett)
4. 💊 **Essence/Siero** (idratante)
5. 💧 **Crema notte** (+ olio per pelli secche)

**PRINCIPI ATTIVI - POSOLOGIA:**
• **Retinolo:** 0.1% → 0.3% → 0.5% (graduale)
• **Vitamina C:** 10-20% L-Ascorbic Acid (pH <3.5)
• **AHA:** 5-10% glicolico/lattico (1-2x/sett)
• **BHA:** 0.5-2% salicilico (pelli grasse)

💡 **Consiglio clinico:** Introdurre UN prodotto nuovo ogni 2-4 settimane. Patch test 24h su avambraccio.`,
    productIds: ['COSRX-SNAIL-96-ESSENCE', 'BOJ-RELIEF-SUN-SPF50', 'ROUNDLAB-DOKDO-TONER', 'COSRX-LOW-PH-CLEANSER']
  },
  antiage: {
    text: `🩺 **Protocollo Anti-Aging Evidence-Based**

**MECCANISMI D'INVECCHIAMENTO CUTANEO:**
• Foto-invecchiamento (UV 80% del danno)
• Stress ossidativo (ROS)
• Riduzione collagene/elastina (-1%/anno dopo 25 anni)
• Glicazione (AGEs)

**INGREDIENTI GOLD STANDARD (Evidence Level A):**

**☀️ PREVENZIONE:**
• **SPF 50+** - blocca 98% UVB, previene fotodanni
• **Vitamina C 15-20%** - antiossidante, fotoprotezione aggiuntiva

**🔄 RIGENERAZIONE:**
• **Retinolo/Retinal 0.1-1%** - aumenta turnover cellulare, sintesi collagene
• **Peptidi** (Matrixyl, Argireline, Copper Peptides)
• **Acido Ialuronico** multi-peso molecolare

**🛡️ BARRIERA:**
• **Ceramidi 1, 3, 6-II** - riparano film idrolipidico
• **Niacinamide 5%** - aumenta ceramidi endogene

**PROTOCOLLO SETTIMANALE:**
• **Lunedì/Mercoledì/Venerdì:** Retinolo 0.3-0.5% sera
• **Martedì/Giovedì:** Peptidi + HA
• **Sabato:** Esfoliazione AHA 5-10% (se tollerata)
• **Domenica:** Riposo - solo idratazione

⚠️ **CONTROINDICAZIONI:**
🚫 Retinoidi VIETATI in gravidanza/allattamento
🚫 Non combinare Retinolo + AHA/BHA stesso giorno
☀️ SPF OBBLIGATORIO con retinoidi (photosensibilizzazione)

📅 **Timeline:** Miglioramento texture 4-6 settimane; rughe 3-6 mesi`,
    productIds: ['ORD-RETINOL-05-SQUALANE', 'KLAIRS-VITAMIN-DROP', 'ORD-HYALURONIC-ACID-2-B5', 'PURITO-CENTELLA-BUFFET-SERUM']
  },
  sensibile: {
    text: `🩺 **Protocollo Pelle Sensibile/Reattiva**

**DIAGNOSI:**
La pelle sensibile presenta:
• Barriera cutanea compromessa (TEWL ↑)
• Risposta infiammatoria amplificata
• Sistema nervoso cutaneo iperreattivo

**INGREDIENTI BENEFICI (Clinical Evidence):**
✅ **Centella Asiatica** - anti-infiammatorio, wound healing
✅ **Panthenol (B5)** - ripara barriera, lenisce
✅ **Ceramidi** - restaurano barriera lipidica
✅ **Acido Ialuronico** - idratazione senza irritazione
✅ **Allantoina** - cheratolitico delicato, lenitivo
✅ **Snail Mucin** - riparazione, idratazione
✅ **Bisabolol** - anti-infiammatorio (camomilla)

**INGREDIENTI DA EVITARE:**
❌ Fragranze/Profumi (prima causa dermatite da contatto)
❌ Alcol denat (>10%)
❌ AHA/BHA alta concentrazione (>5%)
❌ Oli essenziali (eccezione: tea tree spot treatment)
❌ Retinoidi (se non gradualissimi, iniziare 0.01%)

**ROUTINE MINIMALE:**
1. **Detergente ultra-delicato** pH 5.5 (non schiumogeno)
2. **Tonico lenitivo** (centella, panthenol)
3. **Siero riparatore** (ceramidi, HA)
4. **Crema barriera** (ceramidi, squalano)
5. **SPF minerali** (Zinc Oxide, Titanium Dioxide)

**REGOLA CLINICA:**
Patch test 24-48h su avambraccio interno per OGNI nuovo prodotto. Se reazione, sciacquare immediatamente.`,
    productIds: ['CERAVE-HYDRATING-CLEANSER', 'PURITO-CENTELLA-BUFFET-SERUM', 'COSRX-SNAIL-96-ESSENCE', 'ANUA-HEARTLEAF-TONER']
  },
  idratazione: {
    text: `🩺 **Protocollo Idratazione Intensa**

**FISIOLOGIA DELL'IDRATAZIONE:**
La pelle idratata richiede 3 componenti:
1. **Umettanti** (humectants) - attraggono acqua
2. **Emollienti** - ammorbidiscono, riparano
3. **Occlusivi** - prevengono perdita (TEWL)

**INGREDIENTI EVIDENCE-BASED:**

**💧 Umettanti:**
• **Acido Ialuronico multi-peso** (HMW: superficie, LMW: profondo)
• **Glicerina 5-40%** - umettante più efficace
• **Urea 5-10%** - umettante + cheratolitico delicato

**🧴 Emollienti:**
• **Ceramidi** - lipidi strutturali
• **Squalano** - sebomimetico, non-comedogenico
• **Oli vegetali** (jojoba, argan, rosehip)

**🔒 Occlusivi:**
• **Petrolatum** - occlusivo gold standard (riduce TEWL 99%)
• **Dimeticone** - non-comedogenico

**ROUTINE IDRATAZIONE:**
1. Detergente non schiumogeno
2. **Tonico su pelle UMIDA** (fondamentale!)
3. Siero HA su pelle umida
4. Essence idratante
5. Crema ricca
6. Olio viso (ultimo step, opzionale)

💡 **TRUCCO CLINICO:** Applicare prodotti idratanti su pelle leggermente umida per "intrappolare" l'acqua (effetto occlusivo).`,
    productIds: ['HADALABO-GOKUJYUN-PREMIUM', 'COSRX-SNAIL-96-ESSENCE', 'CERAVE-MOISTURIZING-CREAM', 'ISNTREE-HYALURONIC-ACID-TONER']
  },
  macchie: {
    text: `🩺 **Protocollo Anti-Macchie / Iperpigmentazione**

**TIPOLOGIE DI PIGMENTAZIONE:**
• **Melasma** (ormonale, simmetrico)
• **Pigmentazione post-infiammatoria** (PIH - post-acne)
• **Lentigo solari** (foto-invecchiamento)

**MECCANISMO D'AZIONE:**
Bersaglio: Tirosinasi (enzima chiave nella melanogenesi)

**INGREDIENTI EVIDENCE-BASED:**

**🔬 Inibitori Tirosinasi:**
• **Vitamina C 15-20%** (L-Ascorbic Acid)
• **Alpha-Arbutin 2%** - schiarente sicuro
• **Kojic Acid 1-2%** - naturale, efficace
• **Tranexamic Acid 2-3%** - eccellente per melasma

**📊 Altri attivi:**
• **Niacinamide 5%** - inibisce trasferimento melanina
• **Azelaic Acid 10-20%** - anti-infiammatorio + schiarente
• **Retinolo** - accelera turnover cellulare

**PROTOCOLLO:**

**🌅 MATTINA:**
1. Detergente delicato
2. Vitamina C 15% (attendere 5 min)
3. Niacinamide 5%
4. **SPF 50+ PA++++ ABBONDANTE** (fondamentale!)

**🌙 SERA:**
1. Double cleansing
2. Alpha-Arbutin o Tranexamic Acid
3. Retinolo 0.3% (2-3x/sett)
4. Crema idratante

⚠️ **FONDAMENTALE:**
Senza SPF 50+ OGNI GIORNO, NESSUN trattamento anti-macchie funzionerà. Le UV riattivano la melanogenesi.

📅 **Timeline:** 8-12 settimane minimo per risultati visibili. Costanza è essenziale.`,
    productIds: ['KLAIRS-VITAMIN-DROP', 'ORD-NIACINAMIDE-10-ZINC-1', 'BOJ-RELIEF-SUN-SPF50', 'ORD-RETINOL-05-SQUALANE']
  },
  pori: {
    text: `🩺 **Protocollo Pori Dilatati**

**EZIOLOGIA:**
I pori non hanno muscoli - non possono "aprirsi" o "chiudersi". Appaiono dilatati per:
• Eccesso di sebo (i pori si dilatano meccanicamente)
• Accumulo di cheratina (tappi di sebo)
• Perdita di elasticità (età, foto-danno)
• Genetica

**TRATTAMENTO EVIDENCE-BASED:**

**🔬 Acido Salicilico 2%** (BHA):
• Lipofilo = penetra nel sebo
• Cheratolitico = rimuove tappi
• Anti-infiammatorio

**📊 Niacinamide 5-10%:**
• Riduce produzione sebo (-20% studi clinici)
• Migliora elasticità

**🔄 Retinoidi:**
• Aumentano turnover cellulare
• Stimolano collagene = pori più "tesi"

**ROUTINE:**

**🌅 MATTINA:**
1. Detergente con BHA delicato
2. Niacinamide 5-10% + Zinc
3. Crema oil-free, non-comedogenica
4. SPF non-comedogenico

**🌙 SERA:**
1. **Double cleansing** (importante per rimuovere sebo)
2. BHA 2% (2-3x/sett)
3. Niacinamide
4. Crema leggera

**💡 CONSIGLI CLINICI:**
• Pori appaiono più piccoli con pelle ben idratata
• Retinoidi a lungo termine migliorano elasticità
• Nastro adesivo nasale = uso occasionale (non quotidiano)

⚠️ **Evitare:** Oli comedogenici, siliconi pesanti, prodotti troppo ricchi`,
    productIds: ['ORD-NIACINAMIDE-10-ZINC-1', 'PC-BHA-2-LIQUID', 'COSRX-BHA-BLACKHEAD', 'SOMEBYMI-AHA-BHA-PHA-TONER']
  }
};

function getQuickResponse(message: string): { text: string; productIds: string[] } | null {
  const lower = message.toLowerCase();
  if (lower.includes('acne') || lower.includes('brufol') || lower.includes('imperfezion') || lower.includes('pimples')) return QUICK_RESPONSES.acne;
  if (lower.includes('routine') || lower.includes('k-beauty') || lower.includes('corean') || lower.includes('korean')) return QUICK_RESPONSES.routine;
  if (lower.includes('rughe') || lower.includes('anti-age') || lower.includes('anti aging') || lower.includes('età') || lower.includes('invecchiamento')) return QUICK_RESPONSES.antiage;
  if (lower.includes('sensibil') || lower.includes('arrossat') || lower.includes('irritat') || lower.includes('reattiva')) return QUICK_RESPONSES.sensibile;
  if (lower.includes('idrat') || lower.includes('secc') || lower.includes('disidrat') || lower.includes('pelle secca')) return QUICK_RESPONSES.idratazione;
  if (lower.includes('macchi') || lower.includes('discromi') || lower.includes('scure') || lower.includes('iperpigment')) return QUICK_RESPONSES.macchie;
  if (lower.includes('por') || lower.includes('dilatat') || lower.includes('punti neri') || lower.includes('blackhead')) return QUICK_RESPONSES.pori;
  return null;
}

// Find products by productId with all fields needed for direct links
async function findProductsByIds(productIds: string[]): Promise<Array<{
  id: string;
  productId: string;
  name: string;
  brand: string;
  brandCountry?: string | null;
  description?: string | null;
  keyIngredients?: string | null;
  imageUrl: string | null;
  price: number | null;
  size?: string | null;
  officialUrl: string | null;
  miinUrl: string | null;
  sephoraUrl: string | null;
  amazonUrl: string | null;
  redcareUrl: string | null;
  dfarmaUrl: string | null;
}>> {
  const products = [];

  for (const productId of productIds) {
    const dbProduct = await db.product.findUnique({
      where: { productId },
    });

    if (dbProduct) {
      products.push({
        id: dbProduct.id,
        productId: dbProduct.productId,
        name: dbProduct.name,
        brand: dbProduct.brand,
        brandCountry: dbProduct.brandCountry,
        description: dbProduct.description,
        keyIngredients: dbProduct.keyIngredients,
        imageUrl: dbProduct.imageUrl,
        price: dbProduct.price,
        size: dbProduct.size,
        officialUrl: dbProduct.officialUrl,
        miinUrl: dbProduct.miinUrl,
        sephoraUrl: dbProduct.sephoraUrl,
        amazonUrl: dbProduct.amazonUrl,
        redcareUrl: dbProduct.redcareUrl,
        dfarmaUrl: dbProduct.dfarmaUrl,
      });
    }
  }

  return products;
}

// Find products by search query
async function searchProducts(query: string): Promise<Array<{
  id: string;
  productId: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  price: number | null;
  description: string | null;
  officialUrl: string | null;
  miinUrl: string | null;
  sephoraUrl: string | null;
  amazonUrl: string | null;
  redcareUrl: string | null;
  dfarmaUrl: string | null;
}>> {
  const results = [];
  
  // Check pattern matching first
  const lowerQuery = query.toLowerCase();
  for (const [pattern, productId] of Object.entries(PRODUCT_ID_MAP)) {
    if (lowerQuery.includes(pattern)) {
      const dbProduct = await db.product.findUnique({
        where: { productId },
      });
      
      if (dbProduct && !results.find(r => r.productId === dbProduct.productId)) {
        results.push({
          id: dbProduct.id,
          productId: dbProduct.productId,
          name: dbProduct.name,
          brand: dbProduct.brand,
          imageUrl: dbProduct.imageUrl,
          price: dbProduct.price,
          description: dbProduct.description,
          officialUrl: dbProduct.officialUrl,
          miinUrl: dbProduct.miinUrl,
          sephoraUrl: dbProduct.sephoraUrl,
          amazonUrl: dbProduct.amazonUrl,
          redcareUrl: dbProduct.redcareUrl,
          dfarmaUrl: dbProduct.dfarmaUrl,
        });
      }
    }
  }

  // Fallback to database search
  if (results.length === 0) {
    const dbProduct = await db.product.findFirst({
      where: {
        OR: [
          { name: { contains: query } },
          { brand: { contains: query } },
          { productType: { contains: query } },
        ]
      }
    });

    if (dbProduct) {
      results.push({
        id: dbProduct.id,
        productId: dbProduct.productId,
        name: dbProduct.name,
        brand: dbProduct.brand,
        imageUrl: dbProduct.imageUrl,
        price: dbProduct.price,
        description: dbProduct.description,
        officialUrl: dbProduct.officialUrl,
        miinUrl: dbProduct.miinUrl,
        sephoraUrl: dbProduct.sephoraUrl,
        amazonUrl: dbProduct.amazonUrl,
        redcareUrl: dbProduct.redcareUrl,
        dfarmaUrl: dbProduct.dfarmaUrl,
      });
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json({ error: "Messaggio richiesto" }, { status: 400 });
    }

    // Check for quick response first
    const quickResponse = getQuickResponse(message);
    if (quickResponse) {
      const products = await findProductsByIds(quickResponse.productIds);
      
      return NextResponse.json({ 
        response: quickResponse.text,
        products: products
      });
    }

    // Look for known product patterns in message
    const lowerMessage = message.toLowerCase();
    const matchedProductIds: string[] = [];
    
    for (const [pattern, productId] of Object.entries(PRODUCT_ID_MAP)) {
      if (lowerMessage.includes(pattern) && !matchedProductIds.includes(productId)) {
        matchedProductIds.push(productId);
      }
    }

    // Get ZAI instance
    const zai = await getZAI();

    // Build comprehensive prompt for medical-grade dermatology advice
    const systemPrompt = `Sei Dr. Glow, dermatologo AI certificato specializzato in dermatologia clinica e K-Beauty.

Rispondi in italiano con approccio MEDICO-SCIENTIFICO ma accessibile (max 250 parole).

**PROFILO PROFESSIONALE:**
• Specializzazione in dermatologia clinica e cosmetologia
• Esperto in skincare coreana (K-Beauty)
• Focus su evidence-based medicine

**REGOLE DI RISPOSTA:**

1. **STRUTTURA CLINICA:**
   - Anamnesi/Diagnosi (se applicabile)
   - Trattamento raccomandato
   - Prodotti specifici (nome completo + brand)
   - Avvertenze e controindicazioni

2. **FORMATTAZIONE:**
   - **GRASSETTO** per nomi prodotti e ingredienti attivi
   - Elenchi puntati per chiarezza
   - Emoji per leggibilità (🩺💊⚠️📅)

3. **CONTENUTO OBBLIGATORIO:**
   - Concentrazioni ingredienti attivi
   - Posologia (frequenza applicazione)
   - Avvertenze (gravidanza, SPF, interazioni)
   - Alternativa per pelli sensibili

4. **AVVERTENZE DI SICUREZZA:**
   - Retinoidi: CONTROINDICATI in gravidanza/allattamento
   - Acidi (AHA/BHA): SPF OBBLIGATORIO
   - Vitamina C: solo al mattino
   - Non combinare retinoidi + AHA/BHA stesso giorno

5. **QUANDO CONSIGLI PRODOTTI:**
   - Nome completo: "[Brand] [Nome Prodotto]"
   - Ingrediente chiave + concentrazione
   - Motivo della raccomandazione clinica`;
    
    const contextInfo = context?.skinType ? ` Paziente con pelle ${context.skinType}.` : '';
    const concernsInfo = context?.concerns?.length > 0 ? ` Problemi principali: ${context.concerns.join(', ')}.` : '';

    // Get AI response
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt + contextInfo + concernsInfo },
        { role: "user", content: String(message).slice(0, 500) }
      ],
      thinking: { type: "disabled" }
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("Empty response from AI");
    }

    // Look for product mentions in AI response
    const lowerResponse = response.toLowerCase();
    for (const [pattern, productId] of Object.entries(PRODUCT_ID_MAP)) {
      if (lowerResponse.includes(pattern) && !matchedProductIds.includes(productId)) {
        matchedProductIds.push(productId);
      }
    }

    // Also try to find products by brand mentions
    const brandPatterns = ['cosrx', 'beauty of joseon', 'klairs', 'laneige', 'round lab', 'purito', 
      'isntree', 'torriden', 'anua', 'some by mi', "i'm from", 'la roche-posay', 
      'bioderma', 'vichy', 'the ordinary', 'cerave', 'paulas choice', 'hada labo', 
      'olaplex', 'sk-ii', 'estée lauder', 'drunk elephant'];
    
    for (const brand of brandPatterns) {
      if (lowerResponse.includes(brand)) {
        const found = await searchProducts(brand);
        for (const p of found) {
          if (!matchedProductIds.includes(p.productId)) {
            matchedProductIds.push(p.productId);
          }
        }
      }
    }

    // Get products data with all shop links
    const products = await findProductsByIds(matchedProductIds.slice(0, 4));

    return NextResponse.json({ 
      response,
      products: products.length > 0 ? products : undefined
    });

  } catch (error) {
    console.error("Chat error:", error);
    
    // Return helpful fallback
    const fallbackProducts = await findProductsByIds(['COSRX-SNAIL-96-ESSENCE', 'ORD-NIACINAMIDE-10-ZINC-1']);
    
    return NextResponse.json({ 
      response: `🩺 **Dr. Glow - Dermatologo AI**

Mi dispiace, sto avendo difficoltà tecniche. Ecco alcuni consigli generali:

**Per la tua skincare:**
• Detergente delicato con pH 5.5
• Applica prodotti dal più leggero al più pesante
• SPF 50+ ogni giorno, anche se non c'è sole

**Per problemi specifici:**
• **Acne** → Acido Salicilico 2%, Niacinamide 5-10%
• **Pelle secca** → Acido Ialuronico, Ceramidi
• **Anti-età** → Retinolo 0.3% (sera), Vitamina C 15% (mattina)

⚠️ **Avvertenze:**
• Retinoidi VIETATI in gravidanza
• SPF OBBLIGATORIO con acidi esfolianti

*Per problemi persistenti, consulta un dermatologo in presenza.*`,
      products: fallbackProducts
    });
  }
}
