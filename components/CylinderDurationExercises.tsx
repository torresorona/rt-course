"use client";

import { useState } from "react";

interface Exercise {
  id: string;
  title: string;
  tank: "D" | "E" | "G" | "H/K" | "Heliox H";
  gas: "Oxygen" | "Heliox";
  pressure: number;
  flow: number;
  factor: number;
  context: string;
  safetyReserve?: boolean;
}

const exercises: Exercise[] = [
  {
    id: "e-cylinder-nc",
    title: "Exercise 1",
    tank: "E",
    gas: "Oxygen",
    pressure: 2000,
    flow: 5,
    factor: 0.28,
    context: "A patient is receiving oxygen by nasal cannula during transport.",
    safetyReserve: true,
  },
  {
    id: "d-cylinder-low-flow",
    title: "Exercise 2",
    tank: "D",
    gas: "Oxygen",
    pressure: 1800,
    flow: 2,
    factor: 0.16,
    context: "A small cylinder is being used for low-flow oxygen delivery.",
    safetyReserve: true,
  },
  {
    id: "h-cylinder-high-flow",
    title: "Exercise 3",
    tank: "H/K",
    gas: "Oxygen",
    pressure: 2200,
    flow: 10,
    factor: 3.14,
    context: "A large cylinder is powering a high-flow oxygen device.",
    safetyReserve: true,
  },
  {
    id: "g-cylinder-transport",
    title: "Exercise 4",
    tank: "G",
    gas: "Oxygen",
    pressure: 1600,
    flow: 15,
    factor: 2.41,
    context: "A G cylinder is being used for a transport device at 15 L/min.",
    safetyReserve: true,
  },
  {
    id: "e-cylinder-reserve",
    title: "Exercise 5",
    tank: "E",
    gas: "Oxygen",
    pressure: 1000,
    flow: 4,
    factor: 0.28,
    context: "An E cylinder has reached 1000 psig and still needs reserve time.",
    safetyReserve: true,
  },
  {
    id: "heliox-h-nrb",
    title: "Exercise 6",
    tank: "Heliox H",
    gas: "Heliox",
    pressure: 2200,
    flow: 10,
    factor: 2.5,
    context: "An H cylinder of Heliox is running through a non-rebreather mask.",
  },
  {
    id: "heliox-h-vent",
    title: "Exercise 7",
    tank: "Heliox H",
    gas: "Heliox",
    pressure: 1800,
    flow: 12,
    factor: 2.5,
    context: "An H cylinder of Heliox is being used with a ventilator setup.",
  },
];

const factors = [
  { tank: "D", factor: "0.16 L/psig" },
  { tank: "E", factor: "0.28 L/psig" },
  { tank: "G", factor: "2.41 L/psig" },
  { tank: "H & K", factor: "3.14 L/psig" },
  { tank: "Heliox H", factor: "2.50 L/psig" },
];

interface FlowExercise {
  id: string;
  title: string;
  mixture: "80/20" | "70/30" | "60/40";
  indicatedFlow: number;
  correction: number;
}

const flowExercises: FlowExercise[] = [
  {
    id: "heliox-80-20",
    title: "Flow Exercise 1",
    mixture: "80/20",
    indicatedFlow: 10,
    correction: 1.8,
  },
  {
    id: "heliox-70-30",
    title: "Flow Exercise 2",
    mixture: "70/30",
    indicatedFlow: 8,
    correction: 1.6,
  },
  {
    id: "heliox-60-40",
    title: "Flow Exercise 3",
    mixture: "60/40",
    indicatedFlow: 12,
    correction: 1.4,
  },
];

function durationMinutes(exercise: Exercise) {
  const usablePressure = exercise.safetyReserve
    ? exercise.pressure - 500
    : exercise.pressure;

  return (usablePressure * exercise.factor) / exercise.flow;
}

function roundedDuration(exercise: Exercise) {
  return Math.round(durationMinutes(exercise));
}

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) return `${remainder} min`;
  return `${hours} hr ${remainder} min`;
}

function actualFlow(exercise: FlowExercise) {
  return exercise.indicatedFlow * exercise.correction;
}

export default function CylinderDurationExercises() {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const setResponse = (id: string, value: string) => {
    setResponses((current) => ({ ...current, [id]: value }));
    setChecked((current) => ({ ...current, [id]: false }));
  };

  const checkExercise = (id: string) => {
    setChecked((current) => ({ ...current, [id]: true }));
  };

  const reset = () => {
    setResponses({});
    setChecked({});
  };

  const correctCount = exercises.reduce((total, exercise) => {
    const response = Number(responses[exercise.id]);
    if (!Number.isFinite(response)) return total;
    return Math.abs(response - roundedDuration(exercise)) <= 1 ? total + 1 : total;
  }, 0);

  const flowCorrectCount = flowExercises.reduce((total, exercise) => {
    const response = Number(responses[exercise.id]);
    if (!Number.isFinite(response)) return total;
    return Math.abs(response - actualFlow(exercise)) <= 0.5 ? total + 1 : total;
  }, 0);

  return (
    <div className="not-prose my-8 space-y-6">
      <div className="rounded-2xl border border-sand-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-sand-900">
              Cylinder Duration Calculation Practice
            </h3>
            <p className="mt-1 text-sm text-sand-600">
              Calculate each duration in minutes. Round to the nearest whole minute.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs font-medium text-sand-600 transition-all hover:border-sand-300 hover:bg-sand-100"
          >
            Reset
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl bg-sand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-sand-500">
              Formula
            </p>
            <p className="mt-2 font-mono text-sm text-sand-900">
              [(PSI - 500) x tank factor] / L/min = minutes
            </p>
            <p className="mt-2 text-xs text-sand-500">
              The 500 psig safety factor leaves reserve time before the cylinder runs empty.
            </p>
            <p className="mt-2 font-mono text-sm text-sand-900">
              Heliox H: (PSI x 2.50) / L/min = minutes
            </p>
          </div>

          <div className="rounded-xl bg-sand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-sand-500">
              Tank Factors
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {factors.map((item) => (
                <div key={item.tank} className="rounded-lg bg-white px-3 py-2">
                  <p className="text-xs font-semibold text-sand-900">
                    {item.tank}
                  </p>
                  <p className="font-mono text-xs text-sand-500">
                    {item.factor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {exercises.map((exercise) => {
          const answer = roundedDuration(exercise);
          const response = Number(responses[exercise.id]);
          const isChecked = checked[exercise.id];
          const hasResponse = responses[exercise.id]?.trim() !== "";
          const isCorrect =
            isChecked && Number.isFinite(response) && Math.abs(response - answer) <= 1;
          const isWrong = isChecked && (!Number.isFinite(response) || !isCorrect);

          return (
            <div
              key={exercise.id}
              className="rounded-2xl border border-sand-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-sand-500">
                    {exercise.title}
                  </p>
                  <p className="mt-2 text-sm text-sand-800">
                    {exercise.context}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                  <div className="rounded-lg bg-sand-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                      Tank
                    </p>
                    <p className="font-mono text-sm font-semibold text-sand-900">
                      {exercise.tank}
                    </p>
                  </div>
                  <div className="rounded-lg bg-sand-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                      Gas
                    </p>
                    <p className="font-mono text-sm font-semibold text-sand-900">
                      {exercise.gas}
                    </p>
                  </div>
                  <div className="rounded-lg bg-sand-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                      PSI
                    </p>
                    <p className="font-mono text-sm font-semibold text-sand-900">
                      {exercise.pressure}
                    </p>
                  </div>
                  <div className="rounded-lg bg-sand-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                      Flow
                    </p>
                    <p className="font-mono text-sm font-semibold text-sand-900">
                      {exercise.flow}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-500">
                    Duration in minutes
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={responses[exercise.id] ?? ""}
                    onChange={(event) => setResponse(exercise.id, event.target.value)}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-sand-900 outline-none transition focus:ring-2 focus:ring-terracotta-400 ${
                      isCorrect
                        ? "border-sage-500"
                        : isWrong
                          ? "border-clay-500"
                          : "border-sand-200"
                    }`}
                    placeholder="Enter minutes"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => checkExercise(exercise.id)}
                  disabled={!hasResponse}
                  className="self-end rounded-xl bg-sand-900 px-5 py-3 text-sm font-semibold text-sand-50 transition-all hover:bg-sand-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Check
                </button>
              </div>

              {isChecked && (
                <div
                  className={`mt-4 rounded-xl p-4 ${
                    isCorrect ? "bg-sage-100 text-sage-700" : "bg-clay-100 text-terracotta-600"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {isCorrect ? "Correct." : "Review the setup."}
                  </p>
                  <p className="mt-1 font-mono text-xs">
                    {exercise.safetyReserve
                      ? `[(${exercise.pressure} - 500) x ${exercise.factor}] / ${exercise.flow}`
                      : `(${exercise.pressure} x ${exercise.factor}) / ${exercise.flow}`}{" "}
                    ={" "}
                    {durationMinutes(exercise).toFixed(1)} min
                  </p>
                  <p className="mt-1 text-sm">
                    Rounded answer: <span className="font-semibold">{answer} minutes</span>{" "}
                    ({formatHours(answer)}).
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-sand-200 bg-sand-50 p-5">
        <p className="text-sm font-semibold text-sand-900">
          Current score: {correctCount} / {exercises.length}
        </p>
        <p className="mt-1 text-xs text-sand-500">
          Answers within 1 minute of the rounded result count as correct.
        </p>
      </div>

      <div className="rounded-2xl border border-sand-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-sand-900">
          Heliox Delivery with O2 Flowmeters
        </h3>
        <p className="mt-1 text-sm text-sand-600">
          When Heliox is delivered with an oxygen flowmeter, actual flow is greater than the indicated flow.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { mixture: "80/20", formula: "O2 flow x 1.8" },
            { mixture: "70/30", formula: "O2 flow x 1.6" },
            { mixture: "60/40", formula: "O2 flow x 1.4" },
          ].map((item) => (
            <div key={item.mixture} className="rounded-xl bg-sand-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-sand-500">
                {item.mixture}
              </p>
              <p className="mt-1 font-mono text-sm text-sand-900">
                {item.formula}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {flowExercises.map((exercise) => {
          const answer = actualFlow(exercise);
          const response = Number(responses[exercise.id]);
          const isChecked = checked[exercise.id];
          const hasResponse = responses[exercise.id]?.trim() !== "";
          const isCorrect =
            isChecked && Number.isFinite(response) && Math.abs(response - answer) <= 0.5;
          const isWrong = isChecked && (!Number.isFinite(response) || !isCorrect);

          return (
            <div
              key={exercise.id}
              className="rounded-2xl border border-sand-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-sand-500">
                    {exercise.title}
                  </p>
                  <p className="mt-2 text-sm text-sand-800">
                    Heliox {exercise.mixture} is set on an oxygen flowmeter at{" "}
                    {exercise.indicatedFlow} L/min. Calculate the actual delivered flow.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-sand-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                      Mix
                    </p>
                    <p className="font-mono text-sm font-semibold text-sand-900">
                      {exercise.mixture}
                    </p>
                  </div>
                  <div className="rounded-lg bg-sand-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                      O2 Flow
                    </p>
                    <p className="font-mono text-sm font-semibold text-sand-900">
                      {exercise.indicatedFlow}
                    </p>
                  </div>
                  <div className="rounded-lg bg-sand-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sand-400">
                      Factor
                    </p>
                    <p className="font-mono text-sm font-semibold text-sand-900">
                      {exercise.correction}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-500">
                    Actual flow in L/min
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={responses[exercise.id] ?? ""}
                    onChange={(event) => setResponse(exercise.id, event.target.value)}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-sand-900 outline-none transition focus:ring-2 focus:ring-terracotta-400 ${
                      isCorrect
                        ? "border-sage-500"
                        : isWrong
                          ? "border-clay-500"
                          : "border-sand-200"
                    }`}
                    placeholder="Enter L/min"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => checkExercise(exercise.id)}
                  disabled={!hasResponse}
                  className="self-end rounded-xl bg-sand-900 px-5 py-3 text-sm font-semibold text-sand-50 transition-all hover:bg-sand-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Check
                </button>
              </div>

              {isChecked && (
                <div
                  className={`mt-4 rounded-xl p-4 ${
                    isCorrect ? "bg-sage-100 text-sage-700" : "bg-clay-100 text-terracotta-600"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {isCorrect ? "Correct." : "Review the correction factor."}
                  </p>
                  <p className="mt-1 font-mono text-xs">
                    {exercise.indicatedFlow} x {exercise.correction} = {answer.toFixed(1)} L/min
                  </p>
                  <p className="mt-1 text-sm">
                    Actual delivered flow:{" "}
                    <span className="font-semibold">{answer.toFixed(1)} L/min</span>.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-sand-200 bg-sand-50 p-5">
        <p className="text-sm font-semibold text-sand-900">
          Heliox flow score: {flowCorrectCount} / {flowExercises.length}
        </p>
        <p className="mt-1 text-xs text-sand-500">
          Answers within 0.5 L/min of the calculated flow count as correct.
        </p>
      </div>
    </div>
  );
}
