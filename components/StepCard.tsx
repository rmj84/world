"use client";

import { useEffect } from "react";
import type { KioskStep } from "@/lib/kioskData";
import { useTTS } from "@/lib/useTTS";

interface StepCardProps {
  step: KioskStep;
  stepNumber: number;
  totalSteps: number;
  autoSpeak?: boolean;
}

export default function StepCard({ step, stepNumber, totalSteps, autoSpeak = true }: StepCardProps) {
  const { speak, stop, isSpeaking, supported } = useTTS();

  useEffect(() => {
    if (autoSpeak) {
      speak(`${step.title}. ${step.description}`);
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  return (
    <div className="rounded-3xl border-4 border-blue-100 bg-white p-6 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-brand px-4 py-1 text-lg font-bold text-white">
          {stepNumber} / {totalSteps}
        </span>
        {supported && (
          <button
            onClick={() => (isSpeaking ? stop() : speak(`${step.title}. ${step.description}`))}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-3xl active:bg-blue-100"
            aria-label="다시 듣기"
          >
            {isSpeaking ? "⏸" : "🔊"}
          </button>
        )}
      </div>
      <h2 className="mb-3 text-2xl font-extrabold leading-snug text-slate-900">{step.title}</h2>
      <p className="text-xl leading-relaxed text-slate-700">{step.description}</p>
      {step.tip && (
        <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-lg leading-relaxed text-amber-900">
          💡 {step.tip}
        </div>
      )}
    </div>
  );
}
