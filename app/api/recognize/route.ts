import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { KIOSK_FLOWS, KioskType } from "@/lib/kioskData";

export const runtime = "nodejs";

export interface ARTarget {
  /** 화면에서 다음에 눌러야 할 버튼을 찾았는지 여부 */
  found: boolean;
  /** 버튼 이름 (예: "카드 결제 버튼") */
  label: string;
  /** 사진 좌상단 기준 0~1 정규화 좌표 (가로 비율) */
  x: number;
  /** 사진 좌상단 기준 0~1 정규화 좌표 (세로 비율) */
  y: number;
  /** 사진 너비 대비 0~1 정규화 너비 */
  width: number;
  /** 사진 높이 대비 0~1 정규화 높이 */
  height: number;
}

interface RecognizeResult {
  ok: boolean;
  kioskType: KioskType | null;
  stepId: string | null;
  message: string;
  target: ARTarget | null;
}

function buildCatalog() {
  return Object.values(KIOSK_FLOWS)
    .map((flow) => {
      const steps = flow.steps
        .map((s) => `  - stepId "${s.id}": ${s.title} — 화면 예시 문구: ${s.screenHints.join(", ")}`)
        .join("\n");
      return `kioskType "${flow.type}" (${flow.name}):\n${steps}`;
    })
    .join("\n\n");
}

function clamp01(n: unknown): number {
  const num = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.min(1, Math.max(0, num));
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<RecognizeResult>({
      ok: false,
      kioskType: null,
      stepId: null,
      target: null,
      message:
        "카메라 인식 기능이 아직 설정되지 않았어요. 아래에서 키오스크 종류를 직접 골라주세요.",
    });
  }

  let body: { image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<RecognizeResult>(
      { ok: false, kioskType: null, stepId: null, target: null, message: "이미지를 읽지 못했어요. 다시 시도해주세요." },
      { status: 400 },
    );
  }

  const imageDataUrl = body.image;
  if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
    return NextResponse.json<RecognizeResult>(
      { ok: false, kioskType: null, stepId: null, target: null, message: "사진이 없어요. 다시 촬영해주세요." },
      { status: 400 },
    );
  }

  const [, mediaType, base64Data] = imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/) ?? [];
  if (!base64Data) {
    return NextResponse.json<RecognizeResult>(
      { ok: false, kioskType: null, stepId: null, target: null, message: "사진 형식을 읽지 못했어요. 다시 시도해주세요." },
      { status: 400 },
    );
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              kioskType: { type: "string", enum: ["hospital", "atm", "fastfood", "unknown"] },
              stepId: { type: "string" },
              reason: { type: "string" },
              target: {
                type: "object",
                properties: {
                  found: { type: "boolean" },
                  label: { type: "string" },
                  x: { type: "number" },
                  y: { type: "number" },
                  width: { type: "number" },
                  height: { type: "number" },
                },
                required: ["found", "label", "x", "y", "width", "height"],
                additionalProperties: false,
              },
            },
            required: ["kioskType", "stepId", "reason", "target"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png", data: base64Data },
            },
            {
              type: "text",
              text: `이 사진은 노년층 사용자가 실제 키오스크(무인 단말기) 화면을 촬영한 것입니다.

1. 아래 목록 중 이 화면이 어떤 키오스크의 어떤 단계에 가장 가까운지 판단해주세요. 일치하는 항목이 없으면 kioskType을 "unknown"으로, stepId를 빈 문자열로 답해주세요.

${buildCatalog()}

2. 화면을 인식했다면(kioskType이 "unknown"이 아니면), 사진 속에서 사용자가 다음으로 눌러야 할 바로 그 버튼이나 영역을 사진 안에서 직접 찾아 사각형 위치로 표시해주세요.
   - x, y는 사진의 왼쪽 위 모서리를 (0, 0), 오른쪽 아래 모서리를 (1, 1)로 하는 비율 좌표입니다.
   - width, height도 사진 전체 크기 대비 비율입니다 (예: 사진 가로의 20%를 차지하면 width는 0.2).
   - 그 버튼이 사진에 실제로 뚜렷하게 보일 때만 found를 true로 하고, 잘 안 보이거나 애매하면 found를 false로 하고 x,y,width,height는 0으로 주세요.
   - label에는 그 버튼을 한국어로 짧게 설명해주세요 (예: "카드 결제 버튼", "출금 버튼").
   - 화면을 인식하지 못했다면(kioskType이 "unknown") target.found는 false로 주세요.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("no text block in response");
    }
    const parsed = JSON.parse(textBlock.text) as {
      kioskType: KioskType | "unknown";
      stepId: string;
      reason: string;
      target: ARTarget;
    };

    if (parsed.kioskType === "unknown" || !(parsed.kioskType in KIOSK_FLOWS)) {
      return NextResponse.json<RecognizeResult>({
        ok: false,
        kioskType: null,
        stepId: null,
        target: null,
        message: "어떤 화면인지 정확히 알기 어려워요. 아래에서 키오스크 종류를 직접 골라주세요.",
      });
    }

    const flow = KIOSK_FLOWS[parsed.kioskType];
    const stepExists = flow.steps.some((s) => s.id === parsed.stepId);

    const target: ARTarget | null = parsed.target?.found
      ? {
          found: true,
          label: (parsed.target.label || "").slice(0, 40),
          x: clamp01(parsed.target.x),
          y: clamp01(parsed.target.y),
          width: clamp01(parsed.target.width),
          height: clamp01(parsed.target.height),
        }
      : null;

    return NextResponse.json<RecognizeResult>({
      ok: true,
      kioskType: parsed.kioskType,
      stepId: stepExists ? parsed.stepId : flow.steps[0].id,
      target,
      message: `${flow.name} 화면으로 보여요.`,
    });
  } catch (error) {
    console.error("recognize error", error);
    return NextResponse.json<RecognizeResult>({
      ok: false,
      kioskType: null,
      stepId: null,
      target: null,
      message: "지금은 인식이 잘 안 돼요. 아래에서 키오스크 종류를 직접 골라주세요.",
    });
  }
}
