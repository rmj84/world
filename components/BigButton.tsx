"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

const VARIANT_CLASSES: Record<NonNullable<BigButtonProps["variant"]>, string> = {
  primary: "bg-brand text-white active:bg-brand-dark",
  secondary: "bg-white text-brand border-4 border-brand active:bg-blue-50",
  ghost: "bg-slate-100 text-slate-800 active:bg-slate-200",
};

export default function BigButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: BigButtonProps) {
  return (
    <button
      className={`w-full rounded-2xl px-6 py-6 text-2xl font-bold shadow-md transition active:scale-[0.98] disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
