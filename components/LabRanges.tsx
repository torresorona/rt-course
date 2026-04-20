"use client";

import { useState } from "react";

type Category = "CBC" | "BMP" | "Coagulation";

interface LabValue {
  category: Category;
  name: string;
  range: string;
  units?: string;
  mnemonic: string;
  hook?: string;
}

const labs: LabValue[] = [
  // CBC
  {
    category: "CBC",
    name: "White Blood Cells (WBC)",
    range: "4,000 – 11,000",
    mnemonic: "\"4 to 11\" — like the hours of a normal workday",
    hook: "Over 16,000 → patient needs antibiotics.",
  },
  {
    category: "CBC",
    name: "Red Blood Cells (RBC)",
    range: "4 – 6 million/mm³",
    mnemonic: "WBC is 4–11 (thousand), RBC is 4–6 (million) — same \"4\" start, RBC is smaller/higher-order.",
  },
  {
    category: "CBC",
    name: "Hemoglobin — Male",
    range: "13.5 – 15.5 g/dL",
    mnemonic: "Men are \"+1\" over women: 13.5–15.5 vs 12.5–14.5.",
    hook: "1.34 mL O₂ per gram of Hgb.",
  },
  {
    category: "CBC",
    name: "Hemoglobin — Female",
    range: "12.5 – 14.5 g/dL",
    mnemonic: "Women 12.5–14.5; Men +1 → 13.5–15.5.",
  },
  {
    category: "CBC",
    name: "Hematocrit — Male",
    range: "42 – 52%",
    mnemonic: "Hct ≈ 3× Hgb. Male Hgb 14 → Hct ~42.",
    hook: "Hct reflects hydration status.",
  },
  {
    category: "CBC",
    name: "Hematocrit — Female",
    range: "37 – 48%",
    mnemonic: "Female Hgb 13 → Hct ~37. \"Rule of 3.\"",
  },
  {
    category: "CBC",
    name: "Platelets",
    range: "150,000 – 400,000",
    mnemonic: "\"150 low bleeds, 400 high clots.\" <150k thrombocytopenia, >400k thrombocytosis.",
  },
  {
    category: "CBC",
    name: "Neutrophils — Segmented",
    range: "~60% of WBC",
    mnemonic: "Mature cells. DOWN with bacterial infection (the mature ones get consumed).",
  },
  {
    category: "CBC",
    name: "Neutrophils — Bands",
    range: "~4% of WBC",
    mnemonic: "Immature cells. UP with bacterial infection (bone marrow ships them out early).",
  },
  {
    category: "CBC",
    name: "Lymphocytes",
    range: "25 – 35%",
    mnemonic: "Second-largest WBC slice (after segmented neutrophils ~60%).",
  },
  {
    category: "CBC",
    name: "Monocytes",
    range: "4 – 6%",
    mnemonic: "\"Mono → TB.\" Elevation associated with tuberculosis.",
  },
  {
    category: "CBC",
    name: "Eosinophils",
    range: "~2%",
    mnemonic: "\"E for Eosinophils = E for Ease of breathing compromised.\" Allergy / asthma.",
  },
  {
    category: "CBC",
    name: "Basophils",
    range: "0.4 – 1%",
    mnemonic: "The smallest slice — less than 1% of the whole pie.",
  },

  // BMP
  {
    category: "BMP",
    name: "Sodium (Na⁺)",
    range: "135 – 145 mmol/L",
    mnemonic: "\"135–145\" — count by 5s from 130. Primary EXTRAcellular cation.",
    hook: "Salt lives outside the cell.",
  },
  {
    category: "BMP",
    name: "Potassium (K⁺)",
    range: "3.5 – 5.0 mmol/L",
    mnemonic: "\"Banana is 3.5–5.\" Primary INTRAcellular cation — heart & kidney function.",
    hook: "Hyperkalemia ↔ metabolic ACIDosis. Hypokalemia ↔ metabolic ALKalosis.",
  },
  {
    category: "BMP",
    name: "Chloride (Cl⁻)",
    range: "98 – 106 mEq/L",
    mnemonic: "\"Close to 100.\" Primary EXTRAcellular anion — rides along with sodium.",
  },
  {
    category: "BMP",
    name: "Total CO₂ (TCO₂)",
    range: "22 – 29 mEq/L",
    mnemonic: "\"Bicarb-ish\" range in the 20s.",
    hook: "↑ TCO₂ = ventilatory failure. ↓ TCO₂ = metabolic acidosis / hyperventilation / diarrhea.",
  },
  {
    category: "BMP",
    name: "Glucose (fasting)",
    range: "70 – 105 mg/dL",
    mnemonic: "\"70s to 100s.\" Below 70 = hypoglycemia, above 105 fasting = hyperglycemia.",
  },
  {
    category: "BMP",
    name: "BUN",
    range: "7 – 20 mg/dL",
    mnemonic: "\"7 days a week, 20 bucks for BUN.\"",
    hook: "↑ BUN = kidney. ↓ BUN = liver or malnutrition.",
  },
  {
    category: "BMP",
    name: "Creatinine",
    range: "0.7 – 1.3 mg/dL",
    mnemonic: "BUN starts at 7, Creatinine starts at 0.7 — \"shift the decimal.\"",
    hook: "↑ = kidney. ↓ = liver. Pair with BUN for renal function.",
  },

  // Coagulation
  {
    category: "Coagulation",
    name: "Prothrombin Time (PT)",
    range: "12 – 15 seconds",
    mnemonic: "\"PT pairs with Warfarin\" — both start with hard consonants: P-W.",
    hook: "Warfarin = Coumadin.",
  },
  {
    category: "Coagulation",
    name: "International Normalized Ratio (INR)",
    range: "0.8 – 1.1",
    mnemonic: "Think \"1.0 ± a hair.\" High = bleeds, Low = clots fast.",
  },
  {
    category: "Coagulation",
    name: "APTT",
    range: "23 – 32 seconds",
    mnemonic: "\"A-P-T-T / Hep.\" Both contain a \"T\" — tie them together.",
    hook: "Roughly double the PT range (12–15 → 23–32).",
  },
];

const mnemonicCheatSheet = [
  { title: "Eos → Asthma/Allergy", detail: "Eosinophils elevated = allergic reactions, asthma." },
  { title: "Monos → TB", detail: "Monocytes elevated = tuberculosis." },
  { title: "Bands UP, Segs DOWN (bacterial)", detail: "Bacterial infection ↑ immature bands, ↓ mature segmented neutrophils." },
  { title: "BUN/Cr: ↑ kidney, ↓ liver", detail: "Elevation of either suggests renal disease; low suggests hepatic issues." },
  { title: "Na outside, K inside", detail: "Sodium is the primary EXTRAcellular cation; potassium is the primary INTRAcellular cation." },
  { title: "Hyperkalemia = acidosis; Hypokalemia = alkalosis", detail: "Potassium swaps with H⁺ across the cell membrane." },
  { title: "PT-Warfarin, APTT-Heparin", detail: "Pair by first letters: P↔W, A↔H (both share T or H-like sounds)." },
  { title: "INR ≈ 1", detail: "Normal INR is 0.8–1.1; >1.1 bleeds, <0.8 clots fast." },
  { title: "Rule of 3: Hct ≈ 3× Hgb", detail: "Quick sanity check on CBC values." },
  { title: "150k bleeds, 400k clots", detail: "Platelets <150k = thrombocytopenia (bleed); >400k = thrombocytosis (clot)." },
  { title: "Gram+ → Penicillins", detail: "Staph, Strep, Diplococcus, Pneumococcus → Penicillins." },
  { title: "Gram– → \"mycin\" trio", detail: "Pseudomonas, H. influenzae, E. coli → Streptomycin, Gentamycin, Colimycin." },
  { title: "Acid Fast = TB", detail: "Rapid method to identify Mycobacterium tuberculosis." },
];

export default function LabRanges() {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [flashcard, setFlashcard] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const filtered = filter === "all" ? labs : labs.filter((l) => l.category === filter);

  const reveal = (name: string) =>
    setRevealed((r) => ({ ...r, [name]: !r[name] }));

  const resetReveals = () => setRevealed({});

  return (
    <div className="not-prose my-8 space-y-8">
      {/* Lab Ranges section */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-sand-900">
            Normal Ranges — Memory Reference
          </h3>
          <button
            onClick={() => {
              setFlashcard((f) => !f);
              resetReveals();
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              flashcard
                ? "bg-terracotta-500 text-white hover:bg-terracotta-600"
                : "bg-sand-100 text-sand-700 hover:bg-sand-200"
            }`}
          >
            {flashcard ? "Flashcard mode: ON" : "Flashcard mode: OFF"}
          </button>
        </div>

        {/* Filter buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "CBC", "BMP", "Coagulation"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-sand-900 text-sand-50"
                  : "bg-sand-100 text-sand-600 hover:bg-sand-200"
              }`}
            >
              {f === "all" ? "All Labs" : f}
            </button>
          ))}
        </div>

        {flashcard && (
          <p className="mb-3 text-xs text-sand-500">
            Ranges are hidden — click a card to reveal. Test yourself before flipping.
          </p>
        )}

        {/* Lab cards */}
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((lab) => {
            const isRevealed = !flashcard || revealed[lab.name];
            return (
              <button
                key={lab.name}
                onClick={() => flashcard && reveal(lab.name)}
                className={`group rounded-xl border border-sand-200 bg-white p-4 text-left transition-all ${
                  flashcard ? "cursor-pointer hover:border-terracotta-300 hover:shadow-sm" : "cursor-default"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      lab.category === "CBC"
                        ? "bg-clay-100 text-terracotta-600"
                        : lab.category === "BMP"
                          ? "bg-sky-100 text-sky-600"
                          : "bg-sand-200 text-sand-700"
                    }`}
                  >
                    {lab.category}
                  </span>
                  <p className="text-sm font-semibold text-sand-900">
                    {lab.name}
                  </p>
                </div>
                <p
                  className={`text-base font-mono font-semibold tracking-tight ${
                    isRevealed ? "text-sand-900" : "text-sand-300 blur-sm select-none"
                  }`}
                >
                  {lab.range}
                </p>
                <p className="mt-2 text-xs text-sand-600">
                  <span className="font-semibold text-sand-700">Mnemonic:</span>{" "}
                  {lab.mnemonic}
                </p>
                {lab.hook && (
                  <p className="mt-1 text-xs italic text-sand-500">{lab.hook}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cheat sheet */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-sand-900">
          High-Yield Mnemonics
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {mnemonicCheatSheet.map((m) => (
            <div
              key={m.title}
              className="rounded-xl border border-sand-200 bg-white p-4"
            >
              <p className="text-sm font-semibold text-sand-900">{m.title}</p>
              <p className="mt-1 text-xs text-sand-600">{m.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
