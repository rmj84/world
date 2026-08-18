import Link from "next/link";
import { KIOSK_LIST } from "@/lib/kioskData";
import BigButton from "@/components/BigButton";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col gap-6 px-5 pb-10 pt-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">친절 키오스크</h1>
        <p className="mt-2 text-lg text-slate-600">키오스크, 어렵지 않아요.<br />화면을 비추면 바로 알려드려요.</p>
      </div>

      <Link href="/camera">
        <BigButton className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-8 text-2xl">
          📷 카메라로 화면 비추기
        </BigButton>
      </Link>

      <div>
        <p className="mb-3 text-center text-lg font-bold text-slate-500">또는 직접 골라서 순서 보기</p>
        <div className="flex flex-col gap-4">
          {KIOSK_LIST.map((kiosk) => (
            <Link key={kiosk.type} href={`/guide/${kiosk.type}`}>
              <div className="flex items-center gap-4 rounded-2xl border-4 border-slate-100 bg-white p-5 shadow active:bg-slate-50">
                <span className="text-4xl">{kiosk.emoji}</span>
                <div className="flex-1">
                  <p className="text-xl font-bold text-slate-900">{kiosk.name}</p>
                  <p className="mt-1 text-base text-slate-500">{kiosk.summary}</p>
                </div>
                <span className="text-2xl text-slate-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <a
        href="tel:1234"
        className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-6 py-5 text-xl font-bold text-white active:bg-slate-900"
      >
        ☎️ 사람이랑 이야기하고 싶어요
      </a>

      <p className="mt-2 text-center text-sm leading-relaxed text-slate-400">
        ※ 이 안내는 일반적으로 알려진 사용 순서를 바탕으로 만들었어요.
        실제 매장·기관의 화면 문구는 조금 다를 수 있으니 참고용으로 봐주세요.
      </p>
    </main>
  );
}
