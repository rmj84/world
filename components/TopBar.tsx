"use client";

import Link from "next/link";

interface TopBarProps {
  title: string;
  backHref?: string;
}

export default function TopBar({ title, backHref = "/" }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 bg-white/95 px-4 py-4 shadow-sm backdrop-blur">
      <Link
        href={backHref}
        aria-label="처음으로"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-3xl active:bg-slate-200"
      >
        ←
      </Link>
      <h1 className="flex-1 truncate text-2xl font-extrabold text-slate-900">{title}</h1>
    </header>
  );
}
