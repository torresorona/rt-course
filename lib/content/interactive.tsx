import type { ReactNode } from "react";
import type { InteractiveComponentId } from "./types";
import ReceptorTable from "@/components/ReceptorTable";
import LabRanges from "@/components/LabRanges";
import GCSScenarios from "@/components/GCSScenarios";
import PulmonaryDiagnosticsIReview from "@/components/PulmonaryDiagnosticsIReview";
import CylinderDurationExercises from "@/components/CylinderDurationExercises";

const interactiveComponents: Record<
  InteractiveComponentId,
  () => ReactNode
> = {
  ReceptorTable: () => <ReceptorTable />,
  LabRanges: () => <LabRanges />,
  GCSScenarios: () => <GCSScenarios />,
  PulmonaryDiagnosticsIReview: () => <PulmonaryDiagnosticsIReview />,
  CylinderDurationExercises: () => <CylinderDurationExercises />,
};

export function renderInteractiveComponent(id: InteractiveComponentId) {
  const render = interactiveComponents[id];
  return render ? render() : null;
}

export function isInteractiveComponentId(
  value: string,
): value is InteractiveComponentId {
  return value in interactiveComponents;
}
