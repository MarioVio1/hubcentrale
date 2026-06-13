import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@cosmetica/lib/db";

// Cache ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Comprehensive Ingredient Database
const INGREDIENT_DATABASE: Record<string, {
  inciNames: string[];
  benefits: string[];
  concerns: string[];
  skinTypes: string[];
  avoidWith: string[];
  pregnancy: boolean;
  description: string;
  concentration: string;
  usage: string;
  interactions: string[];
}> = {
  // ==================== ANTIOXIDANTS ====================
  "niacinamide": {
    inciNames: ["Niacinamide", "Nicotinamide", "Vitamin B3"],
    benefits: ["Riduce pori dilatati", "Controlla produzione sebo", "Illumina pelle", "Anti-infiammatorio", "Rinforza barriera cutanea", "Riduce iperpigmentazione"],
    concerns: ["acne", "pori", "sebo", "macchie", "rotondità", "arrossamenti"],
    skinTypes: ["oily", "combination", "normal", "sensitive", "dry"],
    avoidWith: [],
    pregnancy: true,
    description: "Vitamina B3 - ingrediente multi-task eccellente per quasi tutti i tipi di pelle. Uno dei più studiati e sicuri.",
    concentration: "2-10% ottimale, fino a 20% in formulazioni specifiche",
    usage: "Mattina e/o sera, prima della crema idratante",
    interactions: ["Compatibile con retinolo", "Compatibile con acidi", "Può causare arrossamento se combinato con Vitamina C ad alta concentrazione"]
  },
  "vitamin c": {
    inciNames: ["Ascorbic Acid", "L-Ascorbic Acid", "Sodium Ascorbyl Phosphate", "Magnesium Ascorbyl Phosphate", "Ascorbyl Glucoside", "Tetrahexyldecyl Ascorbate"],
    benefits: ["Illumina pelle", "Potente antiossidante", "Riduce macchie scure", "Stimola collagene", "Protegge da danni UV", "Uniforma incarnato"],
    concerns: ["macchie", "luminosità", "anti-età", "discromie", "pelle opaca"],
    skinTypes: ["normal", "combination", "oily", "dry"],
    avoidWith: ["sensitive"],
    pregnancy: true,
    description: "Potente antiossidante - gold standard per luminosità. Applica la mattina sotto SPF per massima efficacia.",
    concentration: "L-Ascorbic Acid: 10-20%, Derivati: 5-15%",
    usage: "Solo mattina, sempre con SPF. Introduci gradualmente.",
    interactions: ["Non combinare con BHAs/AHAs nello stesso step", "Stabile a pH <3.5 per L-Ascorbic Acid", "Sinergico con Vitamina E e Ferulic Acid"]
  },
  "retinol": {
    inciNames: ["Retinol", "Retinyl Palmitate", "Retinaldehyde", "Hydroxypinacolone Retinoate", "Retinyl Acetate", "Adapalene"],
    benefits: ["Riduce rughe", "Rinnova cellule pelle", "Riduce macchie", "Migliora texture", "Riduce acne", "Stimola collagene"],
    concerns: ["rughe", "anti-età", "macchie", "acne", "texture", "punti neri"],
    skinTypes: ["normal", "combination", "oily"],
    avoidWith: ["sensitive", "pregnancy", "eczema", "rosacea"],
    pregnancy: false,
    description: "GOLD STANDARD anti-età. Derivato della Vitamina A che accelera il turnover cellulare. RICHIEDE SPF OBBLIGATORIO.",
    concentration: "Iniziare con 0.1-0.3%, aumentare gradualmente fino a 1%",
    usage: "Solo sera, 1-2 volte a settimana all'inizio. Sempre con SPF il giorno dopo.",
    interactions: ["NON con Acidi esfolianti stesso giorno", "NON con Vitamina C stesso step", "Aspettare 30 min dopo cleansing", "Applicare su pelle asciutta"]
  },
  "retinal": {
    inciNames: ["Retinal", "Retinaldehyde"],
    benefits: ["Più potente del retinol", "Azione più rapida", "Meno irritante", "Antibatterico", "Anti-età"],
    concerns: ["rughe", "anti-età", "acne", "texture"],
    skinTypes: ["normal", "combination", "oily"],
    avoidWith: ["pregnancy", "sensitive"],
    pregnancy: false,
    description: "Forma più potente e veloce del retinolo. Agisce 11x più velocemente. Meno irritante.",
    concentration: "0.05-0.1%",
    usage: "Solo sera, 2-3 volte a settimana. SPF obbligatorio.",
    interactions: ["Stesse precauzioni del retinolo"]
  },

  // ==================== EXFOLIANTS ====================
  "salicylic acid": {
    inciNames: ["Salicylic Acid", "Betaine Salicylate", "Willow Bark Extract"],
    benefits: ["Esfolia dentro i pori", "Antibatterico", "Riduce acne", "Sgrassa pelle", "Riduce punti neri"],
    concerns: ["acne", "pori", "punti neri", "sebo", "imperfezioni"],
    skinTypes: ["oily", "combination"],
    avoidWith: ["sensitive", "dry", "pregnancy", "eczema"],
    pregnancy: false,
    description: "BHA - unico acido che penetra DENTRO i pori. Eccellente per acne e pelle grassa.",
    concentration: "0.5-2% (massimo 2% OTC)",
    usage: "1-3 volte a settimana. Iniziare con 1x. Solo sera. SPF obbligatorio.",
    interactions: ["Non con retinoidi stesso giorno", "Non con altri acidi forti", "Aspettare 20 min dopo cleansing"]
  },
  "glycolic acid": {
    inciNames: ["Glycolic Acid", "Hydroxyacetic Acid"],
    benefits: ["Esfolia superficie", "Illumina pelle", "Uniforma texture", "Riduce linee sottili", "Migliora assorbimento prodotti"],
    concerns: ["texture", "macchie", "luminosità", "pelle opaca", "rughe"],
    skinTypes: ["normal", "combination", "oily"],
    avoidWith: ["sensitive", "dry", "rosacea"],
    pregnancy: true,
    description: "AHA con molecola più piccola - penetra profondamente. Eccellente per luminosità.",
    concentration: "5-10% uso regolare, fino a 20-30% in trattamenti professionali",
    usage: "1-3 volte a settimana. Sera. SPF obbligatorio per 7 giorni dopo.",
    interactions: ["Non con retinoidi stesso giorno", "Sensibilità aumentata al sole", "Aspettare pH 3.5-4"]
  },
  "lactic acid": {
    inciNames: ["Lactic Acid", "Ammonium Lactate", "Sodium Lactate"],
    benefits: ["Esfolia delicatamente", "Idrata", "Illumina", "Uniforma texture", "Lenisce"],
    concerns: ["texture", "secchezza", "macchie", "pelle sensibile"],
    skinTypes: ["dry", "normal", "sensitive"],
    avoidWith: [],
    pregnancy: true,
    description: "AHA più delicato - anche idratante. Perfetto per pelle secca e sensibile.",
    concentration: "5-12%",
    usage: "2-3 volte a settimana. SPF obbligatorio.",
    interactions: ["Simile a glycolic ma più gentile", "Buono per iniziare con AHAs"]
  },
  "mandelic acid": {
    inciNames: ["Mandelic Acid", "Amygdalic Acid"],
    benefits: ["Esfolia delicatamente", "Antibatterico", "Migliora acne", "Uniforma tono pelle", "Molecola grande - meno irritante"],
    concerns: ["acne", "macchie", "texture", "pelle sensibile"],
    skinTypes: ["sensitive", "dry", "normal"],
    avoidWith: [],
    pregnancy: true,
    description: "AHA con molecola grande - penetra lentamente. Ottimo per pelle sensibile e acne.",
    concentration: "5-10%",
    usage: "2-4 volte a settimana. SPF obbligatorio.",
    interactions: ["Buona alternativa a glicolico per sensibili"]
  },

  // ==================== HYDRATORS ====================
  "hyaluronic acid": {
    inciNames: ["Hyaluronic Acid", "Sodium Hyaluronate", "Hydrolyzed Hyaluronic Acid", "Sodium Acetylated Hyaluronate", "Sodium Hyaluronate Crosspolymer"],
    benefits: ["Idratazione profonda", "Rimpolpa pelle", "Lenisce", "Riduce linee sottili", "Barriera cutanea"],
    concerns: ["secchezza", "disidratazione", "rughe", "elasticità"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Idratante universale - una molecola può trattenere 1000x il suo peso in acqua. Fondamentale per tutti.",
    concentration: "0.1-2%",
    usage: "Mattina e sera, su pelle umida per massima efficacia. Sigillare con crema.",
    interactions: ["Compatibile con tutto", "Meglio su pelle umida", "Usare con occlusivo in climi secchi"]
  },
  "ceramides": {
    inciNames: ["Ceramide NP", "Ceramide AP", "Ceramide EOP", "Ceramide NS", "Ceramide EOS", "Phytosphingosine"],
    benefits: ["Ripara barriera cutanea", "Trattiene idratazione", "Protegge da aggressioni esterne", "Previene disidratazione"],
    concerns: ["barriera", "secchezza", "sensibilità", "eczema", "rosacea"],
    skinTypes: ["dry", "sensitive", "normal", "combination"],
    avoidWith: [],
    pregnancy: true,
    description: "Lipidi essenziali che compongono il 50% della barriera cutanea. Fondamentali per pelle sana.",
    concentration: "Formulazioni con 3 ceramidi essenziali (NP, AP, EOP)",
    usage: "Mattina e sera. Fondamentale dopo esfoliazione o retinoidi.",
    interactions: ["Sinergici con colesterolo e acidi grassi", "Rinforzano efficacia di altri prodotti"]
  },
  "squalane": {
    inciNames: ["Squalane", "Squalene"],
    benefits: ["Idrata senza ungere", "Lenisce", "Non comedogenico", "Antiossidante", "Simile a sebo naturale"],
    concerns: ["idratazione", "barriera", "pelle secca"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Olio vegetale leggero - simile al sebo naturale. Non ostruisce i pori. Ottimo per tutti i tipi di pelle.",
    concentration: "5-100%",
    usage: "Ultimo step o mischiato a crema. Mattina e/o sera.",
    interactions: ["Stabilizza formulazioni", "Ottimo veicolo per altri attivi"]
  },
  "glycerin": {
    inciNames: ["Glycerin", "Glycerol", "Vegetable Glycerin"],
    benefits: ["Idratante potente", "Umettante", "Lenisce", "Migliora barriera", "Economico ed efficace"],
    concerns: ["idratazione", "secchezza"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Umettante più studiato e sicuro. Attira acqua negli strati cutanei. Presente in quasi tutti i prodotti.",
    concentration: "3-40%",
    usage: "In qualsiasi step. Più efficace con umidità ambientale.",
    interactions: ["Compatibile con tutto", "Base eccellente per sieri"]
  },

  // ==================== SOOTHING ====================
  "centella asiatica": {
    inciNames: ["Centella Asiatica Extract", "Asiaticoside", "Madecassoside", "Asiatic Acid", "Madecassic Acid", "Cica"],
    benefits: ["Lenisce irritazioni", "Ripara barriera", "Anti-infiammatorio", "Cicatrizzante", "Idrata", "Antiossidante"],
    concerns: ["sensibilità", "arrossamenti", "barriera", "post-procedura", "acne", "eczema"],
    skinTypes: ["sensitive", "dry", "combination", "normal"],
    avoidWith: [],
    pregnancy: true,
    description: "Erba coreana lenitiva per eccellenza. 'Cica' - perfetta per pelle sensibile e reattiva.",
    concentration: "Extract: 0.5-5%, Madecassoside: 0.1-1%",
    usage: "Mattina e sera. Ottimo dopo esfoliazione o retinoidi.",
    interactions: ["Sinergico con panthenol", "Rinforza ceramidi", "Ottimo con niacinamide"]
  },
  "panthenol": {
    inciNames: ["Panthenol", "Provitamin B5", "Dexpanthenol", "Pantothenic Acid"],
    benefits: ["Lenisce", "Idrata", "Ripara barriera", "Anti-infiammatorio", "Migliora elasticità"],
    concerns: ["sensibilità", "idratazione", "arrossamenti", "post-procedura"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Vitamina B5 - lenitivo e idratante universale. Sicuro per tutti, anche bambini.",
    concentration: "0.5-5%",
    usage: "Mattina e sera. In qualsiasi step.",
    interactions: ["Compatibile con tutto", "Sinergico con centella e ceramidi"]
  },
  "allantoin": {
    inciNames: ["Allantoin", "Aluminum Allantoinate"],
    benefits: ["Lenisce", "Esfolia delicatamente", "Idrata", "Cicatrizzante", "Calma irritazioni"],
    concerns: ["sensibilità", "arrossamenti", "pelle irritata"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Composto lenitivo presente nella consolida. Calma e protegge la pelle irritata.",
    concentration: "0.1-2%",
    usage: "In qualsiasi formulazione lenitiva.",
    interactions: ["Compatibile con tutto", "Ottimo con panthenol"]
  },
  "bisabolol": {
    inciNames: ["Bisabolol", "Alpha-Bisabolol", "Levomenol"],
    benefits: ["Lenisce", "Anti-infiammatorio", "Antibatterico", "Migliora assorbimento", "Calma irritazioni"],
    concerns: ["sensibilità", "arrossamenti", "pelle reattiva"],
    skinTypes: ["sensitive", "normal", "dry"],
    avoidWith: [],
    pregnancy: true,
    description: "Principio attivo della camomilla - lenitivo naturale molto efficace.",
    concentration: "0.1-1%",
    usage: "In prodotti lenitivi e post-procedura.",
    interactions: ["Sinergico con panthenol", "Stabilizza formulazioni"]
  },

  // ==================== BRIGHTENING ====================
  "alpha arbutin": {
    inciNames: ["Alpha-Arbutin", "Arbutin", "Beta-Arbutin"],
    benefits: ["Riduce macchie", "Illumina pelle", "Inibisce melanina", "Uniforma incarnato", "Più stabile di arbutin classico"],
    concerns: ["macchie", "discromie", "iperpigmentazione", "melasma"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Derivato dell'idrochinone ma più sicuro. Eccellente per macchie e discromie.",
    concentration: "0.5-2%",
    usage: "Mattina e/o sera. Combinare con SPF per risultati migliori.",
    interactions: ["Sinergico con niacinamide", "Compatibile con Vitamina C", "Non con acidi forti stesso step"]
  },
  "tranexamic acid": {
    inciNames: ["Tranexamic Acid", "Tranexamic Acid"],
    benefits: ["Riduce macchie", "Anti-infiammatorio", "Tratta melasma", "Illumina", "Blocca melanina"],
    concerns: ["macchie", "melasma", "iperpigmentazione", "discromie"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: false,
    description: "Acido amino derivative - eccellente per melasma e macchie persistenti. Usato in dermatologia.",
    concentration: "2-3%",
    usage: "Mattina e/o sera. SEMPRE con SPF.",
    interactions: ["Sinergico con niacinamide e arbutin", "Non con acidi forti stesso step"]
  },
  "kojic acid": {
    inciNames: ["Kojic Acid", "Kojic Dipalmitate"],
    benefits: ["Riduce macchie", "Inibisce tirosinasi", "Antiossidante", "Illumina pelle"],
    concerns: ["macchie", "iperpigmentazione", "melasma"],
    skinTypes: ["normal", "combination", "oily"],
    avoidWith: ["sensitive"],
    pregnancy: true,
    description: "Acido naturale da funghi - inibisce produzione melanina. Può essere irritante.",
    concentration: "1-2%",
    usage: "Sera. SPF obbligatorio.",
    interactions: ["Sinergico con altri brighteners", "Può causare sensibilità"]
  },

  // ==================== ACNE TREATMENTS ====================
  "benzoyl peroxide": {
    inciNames: ["Benzoyl Peroxide"],
    benefits: ["Uccide batteri acne", "Riduce infiammazione", "Sgrassa pelle", "Previene nuove lesioni"],
    concerns: ["acne", "imperfezioni", "punti neri"],
    skinTypes: ["oily", "combination"],
    avoidWith: ["sensitive", "dry", "eczema"],
    pregnancy: false,
    description: "Antibatterico più efficace per acne. Uccide Cutibacterium acnes. Può sbiadire tessuti.",
    concentration: "2.5-10% (2.5% spesso efficace come 10% ma meno irritante)",
    usage: "1x giorno, solo su aree interessate. Iniziare con 2.5%.",
    interactions: ["NON con retinoidi stesso step", "Sbianca capelli e tessuti", "Secca la pelle"]
  },
  "azelaic acid": {
    inciNames: ["Azelaic Acid", "Potassium Azeloyl Diglycinate"],
    benefits: ["Tratta acne", "Riduce macchie", "Anti-infiammatorio", "Lenisce rosacea", "Antibatterico", "Safe in gravidanza"],
    concerns: ["acne", "macchie", "rosacea", "arrossamenti", "iperpigmentazione"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Acido dicarbossilico - versatile e sicuro. Ottimo per acne + macchie + rosacea insieme.",
    concentration: "10-20% (prescrizione: 15-20%)",
    usage: "1-2x giorno. Tollerato bene da pelle sensibile.",
    interactions: ["Compatibile con retinoidi", "Compatibile con altri acidi", "Safe per uso prolungato"]
  },
  "zinc": {
    inciNames: ["Zinc PCA", "Zinc Gluconate", "Zinc Oxide", "Zinc Sulfate"],
    benefits: ["Controlla sebo", "Antinfiammatorio", "Riduce acne", "Antibatterico", "Lenisce"],
    concerns: ["acne", "sebo", "pori", "imperfezioni"],
    skinTypes: ["oily", "combination"],
    avoidWith: [],
    pregnancy: true,
    description: "Minerale che regola produzione sebo e ha proprietà antibatteriche. Ottimo per pelle grassa.",
    concentration: "0.5-2% come PCA",
    usage: "Mattina e/o sera. Ben tollerato.",
    interactions: ["Sinergico con niacinamide", "Compatibile con acidi"]
  },

  // ==================== PEPTIDES ====================
  "peptides": {
    inciNames: ["Palmitoyl Pentapeptide-4", "Copper Peptide", "Acetyl Hexapeptide-8", "Matrixyl", "Argireline", "Palmitoyl Tripeptide-1", "Palmitoyl Tripeptide-5"],
    benefits: ["Stimola collagene", "Anti-rughe", "Rassoda pelle", "Migliora elasticità", "Ripara"],
    concerns: ["anti-età", "rughe", "elasticità", "pelle matura"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Aminoacidi che segnalano alle cellule di produrre collagene. Alternativa gentile ai retinoidi.",
    concentration: "Varia per tipo di peptide, generalmente 1-10%",
    usage: "Mattina e/o sera. In step siero/crema.",
    interactions: ["Non con acidi forti (possono degradarli)", "Ottimo con antiossidanti", "Compatibili tra loro"]
  },
  "copper peptide": {
    inciNames: ["Copper Tripeptide-1", "GHK-Cu"],
    benefits: ["Stimola collagene", "Ripara pelle", "Antinfiammatorio", "Antiossidante", "Ferita repair"],
    concerns: ["anti-età", "riparazione", "post-procedura", "rughe"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Peptide più potente per riparazione cutanea. Usato in medicina rigenerativa.",
    concentration: "0.05-1%",
    usage: "Mattina e/o sera. Evitare acidi forti nello stesso step.",
    interactions: ["Non con Vitamina C diretta", "Non con acidi forti", "Ottimo con centella"]
  },

  // ==================== SPECIALTY ====================
  "snail mucin": {
    inciNames: ["Snail Secretion Filtrate", "Snail Mucin"],
    benefits: ["Idrata profondamente", "Ripara pelle", "Lenisce", "Anti-età", "Migliora texture", "Cicatrizzante"],
    concerns: ["idratazione", "riparazione", "anti-età", "texture", "arrossamenti"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Mucina di lumaca - idratante e riparatore coreano per eccellenza. Ricco di glicoproteine e acido ialuronico.",
    concentration: "70-96%",
    usage: "Dopo tonico, prima di sieri. Mattina e sera.",
    interactions: ["Compatibile con tutto", "Ottimo con centella e niacinamide"]
  },
  "propolis": {
    inciNames: ["Propolis Extract", "Propolis Wax"],
    benefits: ["Antibatterico", "Idrata", "Illumina pelle", "Antinfiammatorio", "Antiossidante"],
    concerns: ["acne", "idratazione", "luminosità", "imperfezioni"],
    skinTypes: ["dry", "normal", "combination"],
    avoidWith: [],
    pregnancy: true,
    description: "Propoli - antibatterico naturale dalle api. Ottimo per pelle tendente all'acne ma non troppo grassa.",
    concentration: "10-80%",
    usage: "Mattina e/o sera come siero o tonico.",
    interactions: ["Compatibile con tutto", "Sinergico con miele e snail mucin"]
  },
  "fermented ingredients": {
    inciNames: ["Galactomyces Ferment Filtrate", "Bifida Ferment Lysate", "Saccharomyces Ferment Filtrate", "Lactobacillus Ferment"],
    benefits: ["Equilibra microbioma", "Idrata", "Illumina", "Anti-età", "Migliora texture", "Ripara barriera"],
    concerns: ["luminosità", "texture", "anti-età", "barriera", "pelle opaca"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "Ingredienti fermentati coreani - ricchi di aminoacidi e acidi organici. Illuminano e nutrono.",
    concentration: "80-97% nelle essence",
    usage: "Dopo tonico, mattina e sera.",
    interactions: ["Compatibili con tutto", "Base ottima per layering"]
  },
  "rosehip oil": {
    inciNames: ["Rosa Canina Fruit Oil", "Rosehip Seed Oil"],
    benefits: ["Idrata", "Rigenera", "Riduce cicatrici", "Ricco di Vit A", "Anti-età", "Migliora macchie"],
    concerns: ["idratazione", "anti-età", "cicatrici", "macchie"],
    skinTypes: ["dry", "normal", "combination"],
    avoidWith: [],
    pregnancy: true,
    description: "Olio ricco di vitamina A naturale e acidi grassi essenziali. Ottimo per cicatrici e macchie.",
    concentration: "100% o 5-15% in miscele",
    usage: "Ultimo step routine sera. 2-3 gocce.",
    interactions: ["Non con retinoidi stessi step", "Ottimo sopra acidi"]
  },
  "sunscreen": {
    inciNames: ["Zinc Oxide", "Titanium Dioxide", "Avobenzone", "Homosalate", "Octinoxate", "Octocrylene", "Mexoryl", "Tinosorb"],
    benefits: ["Protegge da UV", "Previene invecchiamento", "Previene macchie", "Previene cancro pelle", "Mantiene salute pelle"],
    concerns: ["protezione solare", "anti-età", "macchie"],
    skinTypes: ["all"],
    avoidWith: [],
    pregnancy: true,
    description: "FONDAMENTALE - il prodotto anti-età più importante. SPF 30+ ogni giorno, anche se non c'è sole.",
    concentration: "SPF 30-50+, PA+++ o PA++++",
    usage: "Ultimo step mattina, 20 min prima esposizione. Riapplicare ogni 2 ore.",
    interactions: ["Applicare DOPO tutti i prodotti", "Aspettare che assorba prima di trucco"]
  }
};

// Product patterns for matching
const PRODUCT_PATTERNS: Record<string, string> = {
  // COSRX
  "cosrx snail": "COSRX-SNAIL-96-ESSENCE",
  "snail mucin": "COSRX-SNAIL-96-ESSENCE",
  "snail essence": "COSRX-SNAIL-96-ESSENCE",
  "cosrx cleanser": "COSRX-LOW-PH-CLEANSER",
  "cosrx aha": "COSRX-AHA7-WHITEHEAD",
  "cosrx bha": "COSRX-BHA-BLACKHEAD",
  // Beauty of Joseon
  "beauty of joseon": "BOJ-RELIEF-SUN-SPF50",
  "joseon sun": "BOJ-RELIEF-SUN-SPF50",
  "relief sun": "BOJ-RELIEF-SUN-SPF50",
  "joseon ginseng": "BOJ-GINSENG-ESSENCE",
  // Klairs
  "klairs vitamin": "KLAIRS-VITAMIN-DROP",
  "vitamin drop": "KLAIRS-VITAMIN-DROP",
  "klairs toner": "KLAIRS-SUPPLE-PREPARATION-TONER",
  // Laneige
  "laneige water mask": "LANEIGE-WATER-SLEEPING-MASK",
  "laneige sleeping mask": "LANEIGE-WATER-SLEEPING-MASK",
  "laneige lip": "LANEIGE-LIP-SLEEPING-MASK",
  // Round Lab
  "dokdo toner": "ROUNDLAB-DOKDO-TONER",
  "round lab": "ROUNDLAB-DOKDO-TONER",
  // Purito
  "purito centella": "PURITO-CENTELLA-BUFFET-SERUM",
  "purito buffet": "PURITO-CENTELLA-BUFFET-SERUM",
  // The Ordinary
  "niacinamide": "ORD-NIACINAMIDE-10-ZINC-1",
  "the ordinary niacinamide": "ORD-NIACINAMIDE-10-ZINC-1",
  "retinol": "ORD-RETINOL-05-SQUALANE",
  "the ordinary retinol": "ORD-RETINOL-05-SQUALANE",
  "hyaluronic acid": "ORD-HYALURONIC-ACID-2-B5",
  "alpha arbutin": "ORD-ALPHA-ARBUTIN-2-HA",
  // CeraVe
  "cerave cleanser": "CERAVE-HYDRATING-CLEANSER",
  "cerave hydrating": "CERAVE-HYDRATING-CLEANSER",
  "cerave cream": "CERAVE-MOISTURIZING-CREAM",
  // La Roche-Posay
  "cicaplast": "LRP-CICAPLAST-BAUME-B5",
  "baume b5": "LRP-CICAPLAST-BAUME-B5",
  "effaclar": "LRP-EFFACLAR-DUO-PLUS",
  "la roche posay": "LRP-CICAPLAST-BAUME-B5",
  // Paula's Choice
  "paula bha": "PC-BHA-2-LIQUID",
  "paulas choice": "PC-BHA-2-LIQUID",
  // Hada Labo
  "hada labo": "HADALABO-GOKUJYUN-PREMIUM",
  "gokujyun": "HADALABO-GOKUJYUN-PREMIUM",
  // Others
  "olaplex": "OLAPLEX-NO3",
  "sk-ii": "SKII-FTE",
  "skii": "SKII-FTE",
  "advanced night repair": "ESTEE-ANR",
  "estee lauder": "ESTEE-ANR",
  "drunk elephant": "DRUNK-PROTINI",
  "protini": "DRUNK-PROTINI",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, ingredients, skinType, concerns } = body;

    if (!productName && !ingredients) {
      return NextResponse.json({ error: "Nome prodotto o ingredienti richiesti" }, { status: 400 });
    }

    // Search for product in database
    let dbProduct = null;
    if (productName) {
      // Check pattern matching first
      const lowerName = productName.toLowerCase();
      for (const [pattern, productId] of Object.entries(PRODUCT_PATTERNS)) {
        if (lowerName.includes(pattern)) {
          dbProduct = await db.product.findUnique({
            where: { productId },
          });
          if (dbProduct) break;
        }
      }

      // Fallback to database search
      if (!dbProduct) {
        dbProduct = await db.product.findFirst({
          where: {
            OR: [
              { name: { contains: productName } },
              { brand: { contains: productName } },
              { productId: { contains: productName.toUpperCase().replace(/\s+/g, '-') } }
            ]
          }
        });
      }
    }

    // Parse ingredients
    const ingredientList = ingredients?.split(',').map((i: string) => i.trim().toLowerCase()) || 
                          (dbProduct?.keyIngredients ? dbProduct.keyIngredients.toLowerCase().split(',').map((i: string) => i.trim()) : []);
    
    // Analyze ingredients
    const analyzedIngredients: Array<{
      name: string;
      found: boolean;
      data?: typeof INGREDIENT_DATABASE[string];
      matchType: 'exact' | 'partial' | 'inci' | 'none';
    }> = [];

    for (const ing of ingredientList) {
      let found = false;
      let matchType: 'exact' | 'partial' | 'inci' | 'none' = 'none';
      let matchedData = undefined;

      for (const [key, data] of Object.entries(INGREDIENT_DATABASE)) {
        // Check exact match
        if (ing === key) {
          found = true;
          matchType = 'exact';
          matchedData = data;
          break;
        }
        // Check INCI names
        for (const inci of data.inciNames) {
          if (ing.includes(inci.toLowerCase()) || inci.toLowerCase().includes(ing)) {
            found = true;
            matchType = 'inci';
            matchedData = data;
            break;
          }
        }
        // Check partial match
        if (!found && (ing.includes(key) || key.includes(ing))) {
          found = true;
          matchType = 'partial';
          matchedData = data;
        }
        if (found) break;
      }

      analyzedIngredients.push({
        name: ing,
        found,
        data: matchedData,
        matchType: found ? matchType : 'none'
      });
    }

    // Calculate detailed compatibility score
    let score = 50;
    const warnings: string[] = [];
    const benefits: string[] = [];
    const conflicts: string[] = [];

    const userSkinType = skinType || "normal";
    const userConcerns = concerns || [];

    // Score each ingredient
    analyzedIngredients.forEach(ing => {
      if (ing.data) {
        // Skin type compatibility
        if (ing.data.skinTypes.includes("all") || ing.data.skinTypes.includes(userSkinType)) {
          score += 12;
          benefits.push(`✅ ${ing.name.charAt(0).toUpperCase() + ing.name.slice(1)}: ${ing.data.description}`);
        } else if (ing.data.avoidWith.includes(userSkinType)) {
          score -= 20;
          warnings.push(`⚠️ ${ing.name} potrebbe irritare pelle ${userSkinType}`);
          conflicts.push(ing.name);
        } else {
          score += 5;
          benefits.push(`✓ ${ing.name}: ${ing.data.description}`);
        }

        // Pregnancy safety
        if (!ing.data.pregnancy) {
          warnings.push(`🚫 ${ing.name} NON sicuro in gravidanza`);
          score -= 15;
        }

        // Concerns matching
        const matchesConcerns = ing.data.concerns.some(c => 
          userConcerns.some((uc: string) => uc.toLowerCase().includes(c) || c.includes(uc.toLowerCase()))
        );
        if (matchesConcerns) {
          score += 8;
          benefits.push(`🎯 ${ing.name} indicato per: ${userConcerns.join(', ')}`);
        }
      }
    });

    // Check for ingredient conflicts
    const hasRetinol = analyzedIngredients.some(i => i.data && ['retinol', 'retinal'].includes(i.name));
    const hasAHABHA = analyzedIngredients.some(i => i.data && ['glycolic acid', 'lactic acid', 'salicylic acid'].includes(i.name));
    const hasVitC = analyzedIngredients.some(i => i.data && i.name === 'vitamin c');

    if (hasRetinol && hasAHABHA) {
      warnings.push("⚠️ Retinolo + Acidi esfolianti: usare in momenti diversi");
      score -= 5;
    }
    if (hasRetinol && hasVitC) {
      warnings.push("⚠️ Retinolo + Vitamina C: applica Vit C mattina, Retinolo sera");
      score -= 5;
    }

    score = Math.min(100, Math.max(0, score));

    // Get AI analysis
    const zai = await getZAI();
    const prompt = `Sei un dermatologo esperto. Analizza questo prodotto in modo dettagliato per una persona con pelle ${userSkinType}.

Prodotto: ${dbProduct?.name || productName || 'Prodotto'}
Brand: ${dbProduct?.brand || 'Sconosciuto'}
Ingredienti trovati: ${analyzedIngredients.filter(i => i.found).map(i => i.name).join(', ') || 'Nessuno riconosciuto'}
Preoccupazioni utente: ${userConcerns.join(', ') || 'Nessuna specifica'}

Fornisci:
1. VERDETTO (Consigliato/Accettabile/Non consigliato)
2. SPIEGAZIONE breve (max 50 parole)
3. COME USARLO (momento, frequenza, step)
4. ABBINAMENTI consigliati e da evitare

Rispondi in italiano in modo professionale ma accessibile. Massimo 150 parole.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: "Sei un dermatologo esperto. Rispondi in italiano in modo professionale, pratico e dettagliato." },
        { role: "user", content: prompt }
      ],
      thinking: { type: "disabled" }
    });

    const aiAnalysis = completion.choices[0]?.message?.content || "Analisi non disponibile";

    // Build recommendations
    const recommendations: string[] = [];
    
    if (score >= 70) {
      recommendations.push("✅ PRODOTTO CONSIGLIATO per il tuo tipo di pelle");
    } else if (score >= 50) {
      recommendations.push("✓ Prodotto accettabile - introduci gradualmente (1-2x/settimana)");
    } else {
      recommendations.push("⚠️ Procedi con cautela - fai SEMPRE patch test 24h");
    }

    recommendations.push("📱 Applica su pelle pulita e asciutta");
    
    if (hasRetinol || hasAHABHA) {
      recommendations.push("☀️ SPF 50+ OBBLIGATORIO il giorno dopo");
    }
    
    if (hasRetinol) {
      recommendations.push("🌙 Usa solo la sera, 2-3x/settimana all'inizio");
    }

    if (!dbProduct && !ingredients) {
      recommendations.push("💡 Inserisci gli ingredienti per un'analisi più accurata");
    }

    const result = {
      compatible: score >= 50,
      score,
      productName: dbProduct?.name || productName,
      brand: dbProduct?.brand,
      productImage: dbProduct?.imageUrl,
      productImageAlt: dbProduct?.imageUrlAlt,
      productId: dbProduct?.productId,
      // Shop links
      officialUrl: dbProduct?.officialUrl,
      yesStyleUrl: dbProduct?.yesStyleUrl,
      sephoraUrl: dbProduct?.sephoraUrl,
      amazonUrl: dbProduct?.amazonUrl,
      // Analysis
      analysis: aiAnalysis,
      ingredientAnalysis: analyzedIngredients.filter(i => i.found && i.data).map(i => ({
        name: i.name,
        data: i.data
      })),
      warnings,
      benefits,
      recommendations,
      conflicts
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error("Product check error:", error);
    return NextResponse.json({
      compatible: true,
      score: 50,
      analysis: "Non sono riuscito ad analizzare completamente il prodotto. Prova a inserire il nome completo del prodotto o la lista ingredienti (INCI).",
      warnings: ["Impossibile verificare tutti gli ingredienti"],
      benefits: [],
      recommendations: [
        "Fai un patch test su braccio interno per 24h",
        "Consulta un dermatologo per consigli personalizzati",
        "Inserisci gli ingredienti per un'analisi più accurata"
      ]
    });
  }
}
