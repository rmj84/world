"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import BigButton from "@/components/BigButton";
import AROverlayImage from "@/components/AROverlayImage";
import { KIOSK_FLOWS, KIOSK_LIST, KioskType } from "@/lib/kioskData";
import type { ARTarget } from "@/app/api/recognize/route";

type Status = "idle" | "starting" | "ready" | "analyzing" | "error" | "not-found" | "result";

interface RecognizeResult {
  ok: boolean;
  kioskType: KioskType | null;
  stepId: string | null;
  message: string;
  target: ARTarget | null;
}

interface ArResult {
  kioskType: KioskType;
  stepId: string;
  imageDataUrl: string;
  target: ARTarget | null;
}

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("starting");
  const [message, setMessage] = useState<string>("");
  const [result, setResult] = useState<ArResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("ready");
      } catch {
        setStatus("error");
        setMessage("카메라를 사용할 수 없어요. 브라우저의 카메라 권한을 확인해주세요.");
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg", 0.85);

    setStatus("analyzing");
    setMessage("");

    try {
      const res = await fetch("/api/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = (await res.json()) as RecognizeResult;

      if (data.ok && data.kioskType && data.stepId) {
        setResult({
          kioskType: data.kioskType,
          stepId: data.stepId,
          imageDataUrl: image,
          target: data.target,
        });
        setStatus("result");
        return;
      }

      setStatus("not-found");
      setMessage(data.message || "어떤 화면인지 알기 어려워요.");
    } catch {
      setStatus("not-found");
      setMessage("인식 중 문제가 생겼어요. 아래에서 키오스크 종류를 직접 골라주세요.");
    }
  }, []);

  const retake = useCallback(() => {
    setResult(null);
    setStatus("ready");
  }, []);

  const matchedStep = result
    ? KIOSK_FLOWS[result.kioskType].steps.find((s) => s.id === result.stepId)
    : null;

  return (
    <main className="flex min-h-dvh flex-col">
      <TopBar title="📷 화면 비추기" />

      <div className="flex-1 px-5 py-4">
        {/* 카메라 미리보기 블록: <video>가 스트림에 계속 연결된 상태를 유지하도록
            상태와 관계없이 항상 마운트해두고, 결과 화면일 때는 CSS로만 숨깁니다. */}
        <div className={status === "result" ? "hidden" : "block"}>
          <p className="mb-4 text-center text-lg text-slate-600">
            키오스크 화면 전체가 잘 보이도록 카메라를 맞춘 뒤,<br />아래 버튼을 눌러 사진을 찍어주세요.
          </p>

          <div className="relative overflow-hidden rounded-3xl border-4 border-blue-100 bg-black">
            <video ref={videoRef} className="aspect-[3/4] w-full object-cover" playsInline muted />
            {status === "starting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xl text-white">
                카메라를 켜는 중이에요...
              </div>
            )}
            {status === "analyzing" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xl text-white">
                화면을 확인하는 중이에요...
              </div>
            )}
          </div>

          {(status === "error" || status === "not-found") && message && (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-lg text-amber-900">{message}</div>
          )}

          <div className="mt-5">
            <BigButton onClick={capture} disabled={status !== "ready" && status !== "not-found" && status !== "error"}>
              {status === "analyzing" ? "확인하는 중..." : "📸 사진 찍고 확인하기"}
            </BigButton>
          </div>

          {(status === "not-found" || status === "error") && (
            <div className="mt-6">
              <p className="mb-3 text-center text-lg font-bold text-slate-500">직접 골라서 보기</p>
              <div className="flex flex-col gap-3">
                {KIOSK_LIST.map((kiosk) => (
                  <BigButton
                    key={kiosk.type}
                    variant="secondary"
                    className="py-4 text-lg"
                    onClick={() => router.push(`/guide/${kiosk.type}`)}
                  >
                    {kiosk.emoji} {kiosk.name}
                  </BigButton>
                ))}
              </div>
            </div>
          )}
        </div>

        {status === "result" && result && (
          <div className="flex flex-col gap-4">
            <p className="text-center text-lg text-slate-600">
              {result.target?.found
                ? "노란 테두리로 표시된 곳을 눌러주세요"
                : "정확한 위치는 못 찾았지만, 이 화면으로 보여요"}
            </p>
            <AROverlayImage src={result.imageDataUrl} target={result.target} />
            {matchedStep && (
              <div className="rounded-2xl bg-blue-50 p-4 text-lg leading-relaxed text-blue-900">
                {matchedStep.description}
              </div>
            )}
            <div className="flex gap-3">
              <BigButton
                variant="secondary"
                className="flex-1 whitespace-nowrap px-2 py-4 text-base"
                onClick={retake}
              >
                🔄 다시 찍기
              </BigButton>
              <BigButton
                className="flex-1 whitespace-nowrap px-2 py-4 text-base"
                onClick={() => router.push(`/guide/${result.kioskType}?step=${result.stepId}`)}
              >
                📖 자세히 보기
              </BigButton>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  );
}
