"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

interface ReviewItem {
  id: string;
  prompt: string;
  answer: string;
  note?: string;
  wide?: boolean;
}

interface ReviewSection {
  title: string;
  focus: string;
  items: ReviewItem[];
}

const storageKey = "pulmonary-diagnostics-i-review:v1";

function loadSavedResponses(): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const saved = window.localStorage.getItem(storageKey);
    const parsed = saved ? JSON.parse(saved) : {};

    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [
        key.includes(":") ? key : `${key}:0`,
        typeof value === "string" ? value : "",
      ]),
    );
  } catch {
    return {};
  }
}

function getBlankCount(prompt: string) {
  return prompt.match(/_{2,}/g)?.length ?? 1;
}

function getAnswerParts(item: ReviewItem) {
  const blankCount = getBlankCount(item.prompt);
  const semicolonParts = item.answer.split(";").map((part) => part.trim());

  if (semicolonParts.length === blankCount) return semicolonParts;
  if (blankCount === 1) return [item.answer];

  const commaParts = item.answer.split(",").map((part) => part.trim());
  if (commaParts.length === blankCount) return commaParts;

  return Array.from(
    { length: blankCount },
    (_, index) => semicolonParts[index] ?? item.answer,
  );
}

function responseKey(itemId: string, blankIndex: number) {
  return `${itemId}:${blankIndex}`;
}

const sections: ReviewSection[] = [
  {
    title: "Spirometry Setup and ATS",
    focus: "Start here",
    items: [
      {
        id: "spirometry-calibration",
        prompt: "PFT machine is calibrated daily with a _____ syringe.",
        answer: "3-L calibration syringe",
      },
      {
        id: "spirometry-withhold",
        prompt: "Before spirometry/post-bronchodilator testing, the patient should avoid taking a ____ when ordered.",
        answer: "Bronchodilator",
      },
      {
        id: "spirometry-position",
        prompt: "During the forced vital capacity maneuver, the patient is ____.",
        answer: "Seated",
      },
      {
        id: "spirometry-info",
        prompt: "Patient information used for predicted values includes age, ____, ____, ____, and smoking history.",
        answer: "Height or arm span; sex; race",
      },
      {
        id: "spirometry-ats-efforts",
        prompt: "ATS-quality spirometry requires ____ acceptable efforts and reproducibility.",
        answer: "3 acceptable efforts; at least 2 reproducible efforts by ATS convention",
        note: "The course source phrases this as repeat until 3 efforts meet acceptability and reproducibility criteria.",
        wide: true,
      },
      {
        id: "spirometry-exhale-times",
        prompt: "Minimum exhalation time: healthy adults/patients >=10 years ____ seconds; children <=10 years ____ seconds.",
        answer: "6; 3",
      },
      {
        id: "spirometry-attempts",
        prompt: "You have ____ attempts to get ____ good spirometry tests.",
        answer: "8; 3",
      },
      {
        id: "lln-uln",
        prompt: "LLN to ULN means ____.",
        answer: "Normal predicted range",
      },
      {
        id: "lln-low",
        prompt: "Less than LLN means ____; greater than ULN means ____.",
        answer: "Low; high",
      },
      {
        id: "fvc-grading",
        prompt: "FVC percent predicted grading: >80% ____, 66-79% ____, 50-65% ____, <50% ____.",
        answer: "Normal; mild; moderate; severe",
        note: "The handout visual appears to show 66-69%, but the course source table gives 66-79%.",
        wide: true,
      },
      {
        id: "fev1-grade",
        prompt: "FEV1 is the best spirometry value to grade ____ severity.",
        answer: "Airway obstruction",
      },
      {
        id: "fev1-ratio",
        prompt: "FEV1/FVC is low in ____ patients; >100% or >ULN suggests ____; <70% suggests ____ disease.",
        answer: "Obstructive; restrictive disease; obstructive disease",
        wide: true,
      },
      {
        id: "fev1-ratio-normal",
        prompt: "FEV1/FVC ratio guide: about ____ is normal in adults; ____ can be healthy in older patients.",
        answer: "70%; 65-70%",
      },
      {
        id: "fef",
        prompt: "FEF25%-75% evaluates flow in the ____ airways.",
        answer: "Medium and small airways",
      },
      {
        id: "pefr",
        prompt: "PEFR means ____.",
        answer: "Peak expiratory flow rate; maximum flow at the peak of the flow-volume loop",
      },
    ],
  },
  {
    title: "Post-Bronchodilator and MVV",
    focus: "Reversibility math",
    items: [
      {
        id: "post-purpose",
        prompt: "Pre/post bronchodilator testing determines ____ of airway obstruction.",
        answer: "Reversibility",
      },
      {
        id: "post-diagnose",
        prompt: "A post-bronchodilator study can assess need for additional meds and diagnose ____.",
        answer: "Asthma",
      },
      {
        id: "post-puffs",
        prompt: "ATS protocol in the source uses ____ puffs by MDI.",
        answer: "4 puffs",
      },
      {
        id: "post-wait",
        prompt: "Recommended wait before post-spirometry is ____.",
        answer: "15 minutes",
      },
      {
        id: "post-change",
        prompt: "Significant reversibility is FEV1 or FVC increase of >____ and ____ mL.",
        answer: "12%; 200 mL",
      },
      {
        id: "post-formula",
        prompt: "Percent change formula: ____.",
        answer: "(post - pre) / pre x 100",
      },
      {
        id: "mvv",
        prompt: "MVV is performed for ____ seconds at ____ breaths per minute.",
        answer: "12-15 seconds; 90-110 breaths/min",
      },
    ],
  },
  {
    title: "Lung Volumes and Patterns",
    focus: "TLC, RV, FRC",
    items: [
      {
        id: "lung-volume-equipment",
        prompt: "Lung volume equipment: spirometer, He analyzer, N2 analyzer, and ____.",
        answer: "Body box / plethysmograph",
      },
      {
        id: "pleth-law",
        prompt: "Body plethysmography is based on ____ law.",
        answer: "Boyle's law",
      },
      {
        id: "pleth-computes",
        prompt: "Body plethysmography computes ____ and is used to compute ____.",
        answer: "VTG/FRC; TLC",
      },
      {
        id: "pleth-fastest",
        prompt: "Body plethysmography is the quickest and most accurate method for determining ____.",
        answer: "FRC",
      },
      {
        id: "pleth-panting",
        prompt: "Body box panting frequency is ____ bpm.",
        answer: "30-60 bpm",
      },
      {
        id: "restriction-grades",
        prompt: "Restriction by TLC: TLC <LLN but >=70% ____, TLC <70% but >=60% ____, TLC <59% ____.",
        answer: "Mild restriction; moderate restriction; moderately severe restriction",
        wide: true,
      },
      {
        id: "air-trapping",
        prompt: "FRC >ULN with TLC normal means ____; FRC and TLC >ULN means ____.",
        answer: "Air trapping; hyperinflation",
      },
      {
        id: "patterns",
        prompt: "Pattern snapshot: restriction causes ____; obstruction with air trapping causes ____.",
        answer: "Restriction decreases TLC, RV, and VC; air trapping increases RV",
        wide: true,
      },
      {
        id: "volume-formulas",
        prompt: "Key formulas: RV = ____; TLC = ____ or ____.",
        answer: "FRC - ERV; FRC + IC; VC + RV",
      },
    ],
  },
  {
    title: "N2 Washout, He Dilution, and DLCO",
    focus: "Gas studies",
    items: [
      {
        id: "n2-o2",
        prompt: "N2 washout uses ____% O2, with risk for depression of hypoxic drive in CO2 retainers.",
        answer: "100%",
      },
      {
        id: "n2-duration",
        prompt: "N2 washout lasts up to ____ minutes or until exhaled N2 is <____%.",
        answer: "7 minutes; 1%",
      },
      {
        id: "he-concentration",
        prompt: "Helium dilution uses a known volume with ____% He.",
        answer: "10%",
      },
      {
        id: "he-absorber",
        prompt: "Helium dilution requires a ____ absorber, usually ____.",
        answer: "CO2 absorber; soda lime",
      },
      {
        id: "dlco-smoking",
        prompt: "Before DLCO, the patient should not ____ the day of the test to reduce ____ levels in blood.",
        answer: "Smoke; CO",
      },
      {
        id: "dlco-o2",
        prompt: "Before DLCO, the patient should be off supplemental O2 for ____.",
        answer: "10 minutes",
      },
      {
        id: "dlco-maneuver",
        prompt: "DLCO maneuver: exhale to ____, inhale rapidly to ____, hold ____ seconds.",
        answer: "RV; TLC; 8-12 seconds",
      },
      {
        id: "dlco-trials",
        prompt: "DLCO requires a minimum of ____ tests; wait ____ minutes between trials.",
        answer: "2 tests; 4 minutes",
      },
      {
        id: "dlco-severity",
        prompt: "DLCO severity: LLN-ULN ____, 60%-LLN ____, 40-60% ____, <40% ____.",
        answer: "Normal; mild; moderate; severe",
      },
    ],
  },
  {
    title: "Bronchoprovocation and CPX",
    focus: "Challenge tests",
    items: [
      {
        id: "mtc-definition",
        prompt: "Methacholine challenge repeats spirometry looking for a significant decrease in ____.",
        answer: "FEV1",
      },
      {
        id: "mtc-diluent",
        prompt: "Methacholine begins after verifying post-diluent ____ did not drop by >=10%.",
        answer: "FEV1 after NaCl/saline",
      },
      {
        id: "mtc-no-patients",
        prompt: "Do not perform methacholine challenge in ____ patients or if severe obstruction is present.",
        answer: "Pregnant/nursing patients; FEV1 <60% predicted is an absolute contraindication",
        wide: true,
      },
      {
        id: "mtc-indication",
        prompt: "Methacholine is indicated when history/symptoms suggest ____ but PFTs are inconclusive.",
        answer: "Asthma",
      },
      {
        id: "mtc-start",
        prompt: "FEV1 must be at least ____ predicted to start methacholine.",
        answer: "60-70%",
      },
      {
        id: "mtc-positive-saline",
        prompt: "If FEV1 drops ____% from baseline after NaCl/saline, the test is ____ and ____.",
        answer: "10%; positive; terminated",
      },
      {
        id: "mtc-positive-methacholine",
        prompt: "If FEV1 drops ____ from baseline after methacholine dose, the test is ____ and ____.",
        answer: "20%; positive; terminated",
      },
      {
        id: "eib-prep",
        prompt: "EIA/EIB prep: avoid heavy exercise ____ hours prior; baseline FEV1 at least ____ predicted.",
        answer: "4 hours; 70%",
      },
      {
        id: "eib-exercise",
        prompt: "EIA/EIB exercise target is ____ of predicted max HR for ____ minutes.",
        answer: "80-90%; 6-8 minutes",
      },
      {
        id: "eib-positive",
        prompt: "EIA/EIB positive response is sustained FEV1 decrease of ____.",
        answer: "10-15%",
      },
      {
        id: "cpx-measures",
        prompt: "CPX assesses/measures ____, ____, and ____ during exercise.",
        answer: "Ventilation; gas exchange; cardiovascular function",
      },
      {
        id: "cpx-contra",
        prompt: "CPX contraindications include limiting neuro/neuromuscular or orthopedic disorders, PaO2 <____, PaCO2 >____ on room air.",
        answer: "40 mmHg; 70 mmHg",
        wide: true,
      },
      {
        id: "cpx-gas",
        prompt: "CPX gas analyzers measure exhaled ____, ____, and ____.",
        answer: "O2; CO2; N2",
      },
      {
        id: "cpx-prep",
        prompt: "CPX prep: comfortable clothing, no smoking ____ hours prior, and no ____ the day of the test.",
        answer: "8 hours; exercise",
      },
    ],
  },
  {
    title: "Bronchoscopy",
    focus: "Indications and hazards",
    items: [
      {
        id: "bronch-therapeutic",
        prompt: "Therapeutic bronchoscopy: removal of ____, aspiration/removal of thick ____, localized ____, and selective ____ such as BAL.",
        answer: "Foreign bodies; secretions; medications; lavage",
        wide: true,
      },
      {
        id: "bronch-diagnostic",
        prompt: "Diagnostic bronchoscopy: suspicion of ____ carcinoma, symptoms, hemoptysis, and positive sputum ____ findings.",
        answer: "Bronchogenic; cytologic",
      },
      {
        id: "bronch-relative",
        prompt: "Relative contraindications include inability to cooperate, tracheal obstruction, uncontrolled ____, ____ instability, and moderate-severe ____.",
        answer: "Asthma; cardiovascular; hypoxemia",
        wide: true,
      },
      {
        id: "bronch-absolute",
        prompt: "Absolute contraindications: no signed ____, no experienced ____, no emergency ____, inability to adequately ____.",
        answer: "Consent; personnel; equipment; oxygenate",
        wide: true,
      },
      {
        id: "bronch-hazards",
        prompt: "____ and ____ account for most deaths associated with bronchoscopy.",
        answer: "Hemorrhage; pneumothorax",
      },
      {
        id: "bronch-route",
        prompt: "Most common route is ____; mouth route requires a ____.",
        answer: "Transnasal; bite block",
      },
      {
        id: "bronch-monitor",
        prompt: "During bronchoscopy, monitor for topical anesthesia toxicity, ____, and cardiac ____.",
        answer: "Hypoxemia; arrhythmias",
      },
    ],
  },
  {
    title: "Sleep Studies and PAP",
    focus: "Know the table",
    items: [
      {
        id: "psg",
        prompt: "PSG is the overnight study for definitive diagnosis of ____.",
        answer: "Sleep apnea",
      },
      {
        id: "osa-csa",
        prompt: "OSA has effort but no ____ due to upper airway obstruction; CSA is no ____ signal for respiratory effort.",
        answer: "Airflow; CNS",
        wide: true,
      },
      {
        id: "psg-equipment",
        prompt: "PSG equipment/signals include EEG, EOG, chin EMG, ECG, airflow, ventilatory effort, and ____.",
        answer: "Oxygen saturation by pulse oximetry",
        wide: true,
      },
      {
        id: "pulseox",
        prompt: "Overnight pulse oximetry checks effectiveness of ____ and may trigger a ____ study if desaturations persist.",
        answer: "CPAP/BiPAP; titration",
      },
      {
        id: "hst",
        prompt: "HST is used to diagnose ____ with a portable device about the size of a ____.",
        answer: "Obstructive sleep apnea; telephone",
      },
      {
        id: "actigraphy",
        prompt: "Actigraphy monitors rest/activity cycles by ____ of a limb for a week or more.",
        answer: "Movement",
      },
      {
        id: "mslt",
        prompt: "MSLT helps diagnose ____ and ____; it uses ____ naps with ____-hour breaks.",
        answer: "Narcolepsy; idiopathic hypersomnia; five 15-minute naps; 2-hour breaks",
        wide: true,
      },
      {
        id: "mslt-stop",
        prompt: "MSLT nap trial ends if the patient does not fall asleep within ____ minutes.",
        answer: "20 minutes",
      },
      {
        id: "mwt",
        prompt: "MWT measures how ____ a patient is; it uses ____ sleep trials with ____-hour breaks.",
        answer: "Alert; 4; 2-hour",
      },
      {
        id: "mwt-stop",
        prompt: "MWT trial ends if the patient does not fall asleep within ____ minutes.",
        answer: "40 minutes",
      },
      {
        id: "ahi",
        prompt: "AHI ratings: <5 ____, 5-15 ____, 15-30 ____, >30 ____.",
        answer: "Normal; mild sleep apnea; moderate sleep apnea; severe sleep apnea",
      },
      {
        id: "pap",
        prompt: "CPAP is first-line for ____; BiPAP uses separate pressures for ____ and ____.",
        answer: "OSA; inhalation; exhalation",
      },
      {
        id: "autocpap",
        prompt: "Auto-CPAP adjusts based on monitoring of ____, ____, and ____.",
        answer: "Snoring; hypopneas; apneas",
      },
      {
        id: "pap-success",
        prompt: "For PAP therapy, patient ____ and ____ are key to successful treatment.",
        answer: "Compliance; comfort",
      },
    ],
  },
];

function FieldIcon() {
  return (
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
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function InlineBlank({
  answer,
  id,
  onChange,
  showAnswer,
  value,
}: {
  answer: string;
  id: string;
  onChange: (value: string) => void;
  showAnswer: boolean;
  value: string;
}) {
  const width = Math.min(44, Math.max(7, value.length + 2));

  return (
    <span className="mx-1 inline-flex items-baseline gap-1 align-baseline">
      <input
        aria-label="Fill blank"
        autoComplete="off"
        id={id}
        spellCheck={false}
        style={{ width: `${width}ch` }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="inline-block rounded-none border-0 border-b-2 border-sand-300 bg-transparent px-1 py-0.5 text-center font-semibold text-terracotta-700 outline-none transition-colors placeholder:text-sand-300 focus:border-terracotta-500 focus:bg-white/70"
        placeholder="blank"
      />
      {showAnswer && (
        <span className="inline-flex rounded-md bg-sage-100 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-sage-700">
          {answer}
        </span>
      )}
    </span>
  );
}

function InlinePrompt({
  item,
  onChange,
  responses,
  showAnswers,
}: {
  item: ReviewItem;
  onChange: (itemId: string, blankIndex: number, value: string) => void;
  responses: Record<string, string>;
  showAnswers: boolean;
}) {
  const promptParts = item.prompt.split(/_{2,}/g);
  const answerParts = getAnswerParts(item);

  return (
    <>
      {promptParts.map((part, index) => (
        <Fragment key={`${item.id}-${index}`}>
          {part}
          {index < promptParts.length - 1 && (
            <InlineBlank
              answer={answerParts[index] ?? item.answer}
              id={responseKey(item.id, index)}
              showAnswer={showAnswers}
              value={responses[responseKey(item.id, index)] ?? ""}
              onChange={(value) => onChange(item.id, index, value)}
            />
          )}
        </Fragment>
      ))}
    </>
  );
}

export default function PulmonaryDiagnosticsIReview() {
  const [responses, setResponses] = useState<Record<string, string>>(loadSavedResponses);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(responses));
    } catch {
      // Ignore unavailable local storage.
    }
  }, [responses]);

  const blankKeys = useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.flatMap((item) =>
          Array.from({ length: getBlankCount(item.prompt) }, (_, index) =>
            responseKey(item.id, index),
          ),
        ),
      ),
    [],
  );
  const total = blankKeys.length;
  const filled = blankKeys.filter((key) => responses[key]?.trim()).length;

  function updateResponse(itemId: string, blankIndex: number, value: string) {
    setResponses((current) => ({
      ...current,
      [responseKey(itemId, blankIndex)]: value,
    }));
  }

  function resetResponses() {
    setResponses({});
    setShowAnswers(false);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore unavailable local storage.
    }
  }

  return (
    <div className="not-prose my-8 space-y-6">
      <div className="rounded-2xl border border-sand-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-600">
              Pulmonary Diagnostics I
            </p>
            <h3 className="mt-1 text-xl font-semibold text-sand-900">
              Fillable Module Exam Review
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-sand-600">
              Built from the highlighted RESC 2340 review sheet and the course overview. Your entries save in this browser.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-sand-200 bg-sand-50 px-3 py-2 text-xs font-semibold text-sand-600">
              {filled}/{total} filled
            </span>
            <button
              type="button"
              onClick={() => setShowAnswers((current) => !current)}
              className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-xs font-semibold text-sand-700 transition-colors hover:border-terracotta-300 hover:text-terracotta-600"
            >
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
                aria-hidden="true"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {showAnswers ? "Hide key" : "Reveal key"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-xs font-semibold text-sand-700 transition-colors hover:border-sand-300 hover:text-sand-900"
            >
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
                aria-hidden="true"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
            <button
              type="button"
              onClick={resetResponses}
              className="inline-flex items-center gap-2 rounded-xl border border-clay-200 bg-clay-100/60 px-3 py-2 text-xs font-semibold text-terracotta-600 transition-colors hover:border-clay-300"
            >
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
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <section
          key={section.title}
          className="rounded-2xl border border-sand-200 bg-white p-5 sm:p-6"
        >
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sand-500">
                {section.focus}
              </p>
              <h4 className="text-lg font-semibold text-sand-900">{section.title}</h4>
            </div>
            <p className="text-xs text-sand-500">
              {section.items.reduce((count, item) => count + getBlankCount(item.prompt), 0)} blanks
            </p>
          </div>

          <div className="space-y-4">
            {section.items.map((item) => (
              <div
                key={item.id}
                className="border-b border-sand-100 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 shrink-0 text-sand-400">
                    <FieldIcon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-8 text-sand-800">
                      <InlinePrompt
                        item={item}
                        responses={responses}
                        showAnswers={showAnswers}
                        onChange={updateResponse}
                      />
                    </div>
                    {item.note && (
                      <p className="mt-2 text-xs leading-5 text-sand-500">{item.note}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
