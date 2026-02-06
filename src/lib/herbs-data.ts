import herbAshwagandha from "@/assets/herb-ashwagandha.jpg";
import herbTurmeric from "@/assets/herb-turmeric.jpg";
import herbTulsi from "@/assets/herb-tulsi.jpg";
import herbBrahmi from "@/assets/herb-brahmi.jpg";
import herbShatavari from "@/assets/herb-shatavari.jpg";
import herbNeem from "@/assets/herb-neem.jpg";

export interface ProcessingStep {
  step: string;
  date: string;
  description: string;
}

export interface HerbBatch {
  id: string;
  herbName: string;
  scientificName: string;
  description: string;
  harvestRegion: string;
  harvestDate: string;
  farmer: {
    name: string;
    region: string;
    verified: boolean;
  };
  processingSteps: ProcessingStep[];
  image: string;
  price: number;
  unit: string;
  hash: string;
  integrityStatus: "verified" | "tampered";
  category: string;
}

export const herbBatches: HerbBatch[] = [
  {
    id: "ATB-2025-001",
    herbName: "Ashwagandha",
    scientificName: "Withania somnifera",
    description: "Premium Ashwagandha roots harvested from organic farms in Madhya Pradesh. Known for adaptogenic properties that support stress relief and vitality.",
    harvestRegion: "Mandsaur, Madhya Pradesh",
    harvestDate: "2025-09-15",
    farmer: { name: "Rajesh Patel", region: "Madhya Pradesh", verified: true },
    processingSteps: [
      { step: "Harvesting", date: "2025-09-15", description: "Roots hand-harvested at optimal maturity from certified organic fields." },
      { step: "Washing & Sorting", date: "2025-09-16", description: "Roots cleaned and sorted by grade. Damaged or immature roots removed." },
      { step: "Sun Drying", date: "2025-09-17", description: "Roots spread on clean mats for natural sun drying over 5 days." },
      { step: "Quality Testing", date: "2025-09-22", description: "Withanolide content tested and verified at 5.2%. Heavy metal screening passed." },
      { step: "Packaging", date: "2025-09-23", description: "Sealed in food-grade, moisture-proof packaging with batch labeling." },
    ],
    image: herbAshwagandha,
    price: 450,
    unit: "250g",
    hash: "a7f3c2d1e5b9804f6a1d3c7e9b2f4a8d0c6e1f3a5b7d9e2c4f6a8b0d2e4f6a8",
    integrityStatus: "verified",
    category: "Adaptogen",
  },
  {
    id: "ATB-2025-002",
    herbName: "Turmeric",
    scientificName: "Curcuma longa",
    description: "High-curcumin turmeric rhizomes from the Erode region of Tamil Nadu. Traditionally processed to preserve maximum potency.",
    harvestRegion: "Erode, Tamil Nadu",
    harvestDate: "2025-08-20",
    farmer: { name: "Sundar Krishnan", region: "Tamil Nadu", verified: true },
    processingSteps: [
      { step: "Harvesting", date: "2025-08-20", description: "Rhizomes harvested after 9-month growth cycle from pesticide-free soil." },
      { step: "Boiling & Curing", date: "2025-08-21", description: "Traditional boiling in alkaline water for 45 minutes to gelatinize starch." },
      { step: "Sun Drying", date: "2025-08-22", description: "Spread on bamboo mats for 10-12 days of natural sun drying." },
      { step: "Polishing", date: "2025-09-02", description: "Hand-polished to remove rough outer skin and reveal bright orange interior." },
      { step: "Lab Analysis", date: "2025-09-03", description: "Curcumin content verified at 7.8%. Free from lead and aflatoxins." },
      { step: "Packaging", date: "2025-09-04", description: "Vacuum-sealed in UV-protected pouches with QR traceability label." },
    ],
    image: herbTurmeric,
    price: 320,
    unit: "500g",
    hash: "b8e4d3c2f6a0915g7b2e4d8f0a3c5e7g1b3d5f7a9c1e3g5b7d9f1a3c5e7g9b1",
    integrityStatus: "verified",
    category: "Anti-inflammatory",
  },
  {
    id: "ATB-2025-003",
    herbName: "Tulsi (Holy Basil)",
    scientificName: "Ocimum tenuiflorum",
    description: "Sacred Rama Tulsi leaves from organic gardens in Uttar Pradesh. Revered in Ayurveda for immune-boosting and respiratory support.",
    harvestRegion: "Lucknow, Uttar Pradesh",
    harvestDate: "2025-10-05",
    farmer: { name: "Meera Devi", region: "Uttar Pradesh", verified: true },
    processingSteps: [
      { step: "Harvesting", date: "2025-10-05", description: "Leaves hand-picked in early morning to preserve volatile oils." },
      { step: "Shade Drying", date: "2025-10-06", description: "Dried under shade to retain green color and essential oil content." },
      { step: "Sorting & Grading", date: "2025-10-10", description: "Leaves sorted by size and quality. Only A-grade leaves selected." },
      { step: "Quality Testing", date: "2025-10-11", description: "Eugenol content measured at 72%. Microbial testing passed." },
      { step: "Packaging", date: "2025-10-12", description: "Packed in airtight containers with desiccant for freshness." },
    ],
    image: herbTulsi,
    price: 280,
    unit: "100g",
    hash: "c9f5e4d3a7b1026h8c3f5e9a1b4d6f8h2c4f6a8b0d2e4f6h8a0c2e4g6i8a0c2",
    integrityStatus: "verified",
    category: "Immunity",
  },
  {
    id: "ATB-2025-004",
    herbName: "Brahmi",
    scientificName: "Bacopa monnieri",
    description: "Wild-harvested Brahmi from the wetlands of Kerala. A legendary brain tonic used for centuries to enhance memory and cognition.",
    harvestRegion: "Alappuzha, Kerala",
    harvestDate: "2025-07-10",
    farmer: { name: "Anoop Nair", region: "Kerala", verified: true },
    processingSteps: [
      { step: "Wild Harvesting", date: "2025-07-10", description: "Sustainably harvested from natural wetland habitats." },
      { step: "Cleaning", date: "2025-07-11", description: "Thoroughly washed to remove aquatic debris and sediment." },
      { step: "Low-Heat Drying", date: "2025-07-12", description: "Dried at controlled low temperature to preserve bacosides." },
      { step: "Quality Testing", date: "2025-07-18", description: "Bacoside content at 25%. Pesticide residue test negative." },
      { step: "Packaging", date: "2025-07-19", description: "Nitrogen-flushed packaging for extended shelf life." },
    ],
    image: herbBrahmi,
    price: 520,
    unit: "100g",
    hash: "d0a6f5e4b8c2137i9d4a6f0b2c5e7a9i3d5a7b9c1e3f5a7i9b1d3f5a7c9e1a3",
    integrityStatus: "verified",
    category: "Cognitive",
  },
  {
    id: "ATB-2025-005",
    herbName: "Shatavari",
    scientificName: "Asparagus racemosus",
    description: "Premium Shatavari roots from Rajasthan. Known as the 'Queen of Herbs' for women's health and hormonal balance support.",
    harvestRegion: "Udaipur, Rajasthan",
    harvestDate: "2025-11-01",
    farmer: { name: "Kavita Sharma", region: "Rajasthan", verified: true },
    processingSteps: [
      { step: "Harvesting", date: "2025-11-01", description: "Tuberous roots carefully unearthed to avoid damage." },
      { step: "Peeling & Washing", date: "2025-11-02", description: "Outer bark removed and roots washed in purified water." },
      { step: "Steam Processing", date: "2025-11-03", description: "Brief steam treatment to deactivate enzymes and preserve nutrients." },
      { step: "Drying", date: "2025-11-04", description: "Sliced and dried in solar dryers for 7 days." },
      { step: "Lab Testing", date: "2025-11-11", description: "Saponin content verified. Microbiological limits within range." },
      { step: "Packaging", date: "2025-11-12", description: "Double-sealed in food-grade pouches with batch traceability." },
    ],
    image: herbShatavari,
    price: 380,
    unit: "200g",
    hash: "e1b7a6f5c9d3248j0e5b7a1c3d6f8b0j4e6b8c0d2f4a6b8j0c2e4a6b8d0f2a4",
    integrityStatus: "verified",
    category: "Women's Health",
  },
  {
    id: "ATB-2025-006",
    herbName: "Neem",
    scientificName: "Azadirachta indica",
    description: "Organic Neem leaves from Gujarat. A powerful herb for skin health, blood purification, and natural pest management.",
    harvestRegion: "Bhavnagar, Gujarat",
    harvestDate: "2025-06-25",
    farmer: { name: "Dinesh Bhatt", region: "Gujarat", verified: true },
    processingSteps: [
      { step: "Harvesting", date: "2025-06-25", description: "Mature leaves collected from organically maintained neem trees." },
      { step: "Washing", date: "2025-06-26", description: "Triple-washed in RO-purified water to remove dust and contaminants." },
      { step: "Shade Drying", date: "2025-06-27", description: "Dried under shade for 8 days to retain green color and bitterness." },
      { step: "Grinding", date: "2025-07-05", description: "Coarsely ground using stone mill to preserve cell structure." },
      { step: "Quality Check", date: "2025-07-06", description: "Azadirachtin levels verified. Heavy metal screening passed." },
      { step: "Packaging", date: "2025-07-07", description: "Packed in moisture-barrier foil pouches with batch QR code." },
    ],
    image: herbNeem,
    price: 200,
    unit: "250g",
    hash: "f2c8b7a6d0e4359k1f6c8b2d4e7a9c1k5f7c9d1e3a5b7c9k1d3f5a7c9e1b3d5",
    integrityStatus: "verified",
    category: "Skin & Detox",
  },
];

export function getHerbById(id: string): HerbBatch | undefined {
  return herbBatches.find((h) => h.id === id);
}

export function getHerbDataForHash(herb: HerbBatch): Record<string, unknown> {
  return {
    id: herb.id,
    herbName: herb.herbName,
    scientificName: herb.scientificName,
    harvestRegion: herb.harvestRegion,
    harvestDate: herb.harvestDate,
    farmerName: herb.farmer.name,
    processingSteps: herb.processingSteps.map((s) => s.step).join(","),
  };
}
