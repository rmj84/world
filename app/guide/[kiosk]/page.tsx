"use client";

import { useState } from "react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { KIOSK_FLOWS, KioskType } from "@/lib/kioskData";
import TopBar from "@/components/TopBar";
import StepCard from "@/components/StepCard";
import BigButton from "@/components/BigButton";

const VALID_TYPES: KioskType[] = ["hospital", "atm", "fastfood"];

export default function GuidePage() {
  const params = useParams<{ kiosk: string }>();
  const searchParams = useSearchParams();
  const kioskType = params.kiosk as KioskType;

  if (!VALID_TYPES.includes(kioskType)) {
    notFound();
  }

  const flow = KIOSK_FLOWS[kioskType];
  const initialStepId = searchParams.get("step");
  const initialIndex = Math.max(
    0,
    flow.steps.findIndex((s) => s.id === initialStepId),
  );
  const [stepIndex, setStepIndex] = useState(initialIndex);

  const step = flow.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === flow.steps.length - 1;

  return (
    <main className="flex min-h-dvh flex-col">
      <TopBar title={`${flow.emoji} ${flow.name}`} />

      <div className="flex-1 px-5 py-6">
        <StepCard step={step} stepNumber={stepIndex + 1} totalSteps={flow.steps.length} />
      </div>

      <div className="sticky bottom-0 flex gap-3 bg-white/95 px-5 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur">
        <BigButton
          variant="secondary"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className="flex-1 py-5 text-xl"
        >
          ← 이전
        </BigButton>
        {isLast ? (
          <BigButton
            variant="primary"
            onClick={() => setStepIndex(0)}
            className="flex-1 whitespace-nowrap py-5 text-xl"
          >
            다시 보기
          </BigButton>
        ) : (
          <BigButton
            variant="primary"
            onClick={() => setStepIndex((i) => Math.min(flow.steps.length - 1, i + 1))}
            className="flex-1 py-5 text-xl"
          >
            다음 →
          </BigButton>
        )}
      </div>
    </main>
  );
}
