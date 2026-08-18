"use client";

import type { ARTarget } from "@/app/api/recognize/route";

interface AROverlayImageProps {
  src: string;
  target: ARTarget | null;
}

/** 촬영한 사진 위에 AI가 찾아낸 버튼 위치를 노란 테두리와 말풍선으로 표시합니다. */
export default function AROverlayImage({ src, target }: AROverlayImageProps) {
  const show = !!target?.found && target.width > 0 && target.height > 0;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border-4 border-blue-100 bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="촬영한 키오스크 화면" className="block w-full" />
      {show && target && (
        <div
          className="pointer-events-none absolute animate-pulse rounded-2xl border-4 border-yellow-300"
          style={{
            left: `${target.x * 100}%`,
            top: `${target.y * 100}%`,
            width: `${target.width * 100}%`,
            height: `${target.height * 100}%`,
            boxShadow: "0 0 0 6px rgba(250, 204, 21, 0.35)",
          }}
        >
          <span className="absolute left-0 top-full mt-2 whitespace-nowrap rounded-lg bg-yellow-300 px-3 py-1 text-base font-bold text-slate-900 shadow-md">
            👉 {target.label || "여기를 눌러주세요"}
          </span>
        </div>
      )}
    </div>
  );
}
