"use client";

import * as React from "react";

export const Card: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ className = "", children, ...props }) => {
  const base =
    "rounded-2xl border border-slate-100 bg-white/80 shadow-md shadow-slate-200/70 backdrop-blur";
  return (
    <div className={[base, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
};
