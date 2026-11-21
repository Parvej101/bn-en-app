import * as React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8 rounded-xl",
    md: "h-10 w-10 rounded-2xl",
    lg: "h-16 w-16 rounded-3xl",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden shadow-md shrink-0",
        sizeClasses[size],
        className
      )}
    >
      <svg
        viewBox="0 0 108 108"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="bneng-grad" x1="0" y1="0" x2="108" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="55%" stopColor="#059669" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <rect width="108" height="108" rx="24" fill="url(#bneng-grad)" />
        <rect
          x="18"
          y="22"
          width="72"
          height="64"
          rx="16"
          fill="#FFFFFF"
          fillOpacity="0.16"
        />
        {/* Forward arrow (Banglish -> English) */}
        <path
          d="M32 43H64L59 38L62.5 34.5L73.5 45.5L62.5 56.5L59 53L64 48H32V43Z"
          fill="#FFFFFF"
        />
        {/* Backward arrow (English -> Bangla) */}
        <path
          d="M76 65H44L49 70L45.5 73.5L34.5 62.5L45.5 51.5L49 55L44 60H76V65Z"
          fill="#FFFFFF"
        />
        {/* Magic AI Sparkle */}
        <path
          d="M79 22L81.5 28.5L88 31L81.5 33.5L79 40L76.5 33.5L70 31L76.5 28.5L79 22Z"
          fill="#FACC15"
        />
      </svg>
    </div>
  );
}
