"use client";

import { useState } from "react";

interface Receptor {
  pathway: "Adrenergic" | "Cholinergic";
  receptor: string;
  location: string;
  stimulated: string;
  drugType: string;
  drugEffect: string;
  examples: string;
}

const receptors: Receptor[] = [
  {
    pathway: "Adrenergic",
    receptor: "Alpha(1)",
    location: "Heart, lungs, and vasculature",
    stimulated: "Vasoconstriction (increasing blood pressure), increased HR",
    drugType: "Anti-adrenergic (\"zosin\" drugs)",
    drugEffect: "Reduce arteriolar resistance, produces vasodilation (lowers BP)",
    examples: "Vasopressors (agonist); Prazosin, doxazosin, terazosin (antagonist)",
  },
  {
    pathway: "Adrenergic",
    receptor: "Beta 1",
    location: "Heart and kidneys",
    stimulated: "Constriction/contraction — increasing HR, increasing myocardial contractility",
    drugType: "Beta blockers (\"lol\" drugs)",
    drugEffect: "Block effects of epinephrine and norepinephrine — reduces HR and BP; primary treatment for hypertension",
    examples: "Dobutamine (agonist); Atenolol, metoprolol, labetolol (antagonist)",
  },
  {
    pathway: "Adrenergic",
    receptor: "Beta 2",
    location: "Lungs, pancreas, liver, intestines, and arteriolar smooth muscle",
    stimulated: "Relaxation — vasodilation (decreased BP), bronchodilation (opening up the airways)",
    drugType: "Beta blockers",
    drugEffect: "Block relaxation effects",
    examples: "Albuterol, levalbuterol (agonist)",
  },
  {
    pathway: "Cholinergic",
    receptor: "Muscarinic (M1, M3)",
    location: "Airways",
    stimulated: "Constriction of the airways",
    drugType: "Anti-cholinergic",
    drugEffect: "Block stimulation of M1 and M3, resulting in bronchodilation",
    examples: "Anti-cholinergic medications (antagonist)",
  },
];

export default function ReceptorTable() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "Adrenergic" | "Cholinergic">("all");

  const filtered = filter === "all" ? receptors : receptors.filter((r) => r.pathway === filter);

  return (
    <div className="not-prose my-8">
      <h3 className="mb-4 text-lg font-semibold text-sand-900">
        Receptor Breakdown
      </h3>

      {/* Filter buttons */}
      <div className="mb-4 flex gap-2">
        {(["all", "Adrenergic", "Cholinergic"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-sand-900 text-sand-50"
                : "bg-sand-100 text-sand-600 hover:bg-sand-200"
            }`}
          >
            {f === "all" ? "All Receptors" : `${f} Pathway`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-2">
        {filtered.map((r) => {
          const isOpen = expanded === r.receptor;
          return (
            <div
              key={r.receptor}
              className="rounded-xl border border-sand-200 bg-white transition-shadow hover:shadow-sm"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : r.receptor)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <span
                  className={`flex h-8 shrink-0 items-center rounded-lg px-2.5 text-xs font-semibold ${
                    r.pathway === "Adrenergic"
                      ? "bg-clay-100 text-terracotta-600"
                      : "bg-sky-100 text-sky-600"
                  }`}
                >
                  {r.pathway === "Adrenergic" ? "SNS" : "PNS"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-sand-900">
                    {r.receptor}
                  </p>
                  <p className="text-xs text-sand-500">{r.location}</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 text-sand-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-sand-100 px-4 pb-4 pt-3">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sand-400">
                        When Stimulated
                      </p>
                      <p className="text-sand-800">{r.stimulated}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sand-400">
                        Blocking Drugs
                      </p>
                      <p className="text-sand-800">{r.drugType}</p>
                      <p className="mt-0.5 text-sand-600">{r.drugEffect}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sand-400">
                        Examples
                      </p>
                      <p className="text-sand-800">{r.examples}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
