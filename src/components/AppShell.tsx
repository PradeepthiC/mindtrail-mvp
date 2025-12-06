// src/components/AppShell.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { logger } from "@/lib/oe/logging/logger";

type AppShellTab = "home" | "capture" | "insights" | "settings";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const TABS: { key: AppShellTab; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "capture", label: "Capture", href: "/capture" },
  { key: "insights", label: "Insights", href: "/insights" },   // future
  { key: "settings", label: "Settings", href: "/settings" },   // future
];

function tabForPath(pathname: string | null): AppShellTab {
  if (!pathname || pathname === "/") return "home";
  if (pathname.startsWith("/capture")) return "capture";
  if (pathname.startsWith("/insights")) return "insights";
  if (pathname.startsWith("/settings")) return "settings";
  return "home";
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const activeTab = tabForPath(pathname);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    logger.info("screen_view", {
      event: "screen_view",
      route: activeTab,
      uid,
      pathname,
    });
  }, [activeTab, pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
        {/* Brand + Nav */}
        <header className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium tracking-tight text-slate-500">
            MindTrail
          </div>

          <nav className="hidden gap-1 rounded-full border border-slate-200 bg-white/80 p-1 text-xs text-slate-600 sm:flex">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  className={[
                    "rounded-full px-3 py-1 transition",
                    isActive
                      ? "bg-slate-900 text-slate-50"
                      : "hover:bg-slate-100",
                  ].join(" ")}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Title */}
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 sm:text-base">{subtitle}</p>
          )}
        </div>

        {/* Page content */}
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
