"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Loader({
  size = 40,
  className,
  label = "Loading conscious destinations...",
}: LoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        style={{ width: size, height: size }}
        className="relative rounded-full border-3 border-primary/20 border-t-primary animate-spin"
      />
      {label && <p className="text-xs text-muted-foreground animate-pulse font-medium">{label}</p>}
    </div>
  );
}

export default Loader;
