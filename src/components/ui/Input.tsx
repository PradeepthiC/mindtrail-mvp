"use client";

import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    const base =
      "h-9 w-full rounded-full border border-slate-200 bg-white/80 px-3 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300";

    return (
      <input
        ref={ref}
        className={[base, className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
