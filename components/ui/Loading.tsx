"use client";

import React from "react";
import clsx from "clsx"; // Optional: only if you want cleaner class toggling

export default function Loading({
  text = "Loading...",
  fullscreen = false,
}: {
  text?: string;
  fullscreen?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center",
        fullscreen ? "fixed inset-0 z-50 bg-[var(--background)]" : "py-8"
      )}
    >
      <div className="w-12 h-12 border-4 border-[var(--primary)] border-dashed rounded-full animate-spin" />
      <p className="mt-4 text-[var(--foreground)]/60">{text}</p>
    </div>
  );
}
