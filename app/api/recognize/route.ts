import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { KIOSK_FLOWS, KioskType } from "@/lib/kioskData";

export const runtime = "nodejs";

interface RecognizeResult {
  ok: boolean;
  kioskType: KioskType | null;
  stepId: string | null;
  message: string;
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

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<RecognizeResult>({
      ok: false,
      kioskType: null,
      stepId: null,
      message:
        "카메라 인식 기능이 아직 설정되지 않았어요. 아래에서 키오스크 종류를 직접 골라주세요.",
    });
  }

  let body: { image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<RecognizeResult>(
      { ok: false, kioskType: null, stepId: null, message: "이미지를 읽지 못했어요. 다시 시도해주세요." },
      { status: 400 },
    );
  }

  const imageDataUrl = body.image;
  if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
    return NextResponse.json<RecognizeResult>(
      { ok: false, kioskType: null, stepId: null, message: "사진이 없어요. 다시 촬영해주세요." },
      { status: 400 },
    );
  }

  const [, mediaType, base64Data] = imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/) ?? [];
  if (!base64Data) {
    return NextResponse.json<RecognizeResult>(
      { ok: false, kioskType: null, stepId: null, message: "사진 형식을 읽지 못했어요. 다시 시도해주세요." },
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
            },
            required: ["kioskType", "stepId", "reason"],
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
              text: `이 사진은 노년층 사용자가 실제 키오스크(무인 단말기) 화면을 촬영한 것입니다. 아래 목록 중 이 화면이 어떤 키오스크의 어떤 단계에 가장 가까운지 판단해주세요.\n\n${buildCatalog()}\n\n일치하는 항목이 없으면 kioskType을 "unknown"으로, stepId를 빈 문자열로 답해주세요.`,
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
    };

    if (parsed.kioskType === "unknown" || !(parsed.kioskType in KIOSK_FLOWS)) {
      return NextResponse.json<RecognizeResult>({
        ok: false,
        kioskType: null,
        stepId: null,
        message: "어떤 화면인지 정확히 알기 어려워요. 아래에서 키오스크 종류를 직접 골라주세요.",
      });
    }

    const flow = KIOSK_FLOWS[parsed.kioskType];
    const stepExists = flow.steps.some((s) => s.id === parsed.stepId);

    return NextResponse.json<RecognizeResult>({
      ok: true,
      kioskType: parsed.kioskType,
      stepId: stepExists ? parsed.stepId : flow.steps[0].id,
      message: `${flow.name} 화면으로 보여요.`,
    });
  } catch (error) {
    console.error("recognize error", error);
    return NextResponse.json<RecognizeResult>({
      ok: false,
      kioskType: null,
      stepId: null,
      message: "지금은 인식이 잘 안 돼요. 아래에서 키오스크 종류를 직접 골라주세요.",
    });
  }
}
