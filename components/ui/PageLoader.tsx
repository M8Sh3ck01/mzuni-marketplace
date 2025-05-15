"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  text?: string;
  fullscreen?: boolean;
  className?: string;
}

export default function PageLoader({ 
  text = "Loading...", 
  fullscreen = true,
  className 
}: PageLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "flex flex-col items-center justify-center",
        fullscreen ? "fixed inset-0 z-50 bg-[var(--background)]/80 backdrop-blur-sm" : "min-h-[200px]",
        className
      )}
    >
      <div className="relative">
        {/* Outer spinning ring */}
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-[var(--primary)]/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner spinning ring */}
        <motion.div
          className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-[var(--primary)] border-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
        </div>
      </div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-sm font-medium text-[var(--foreground)]/60"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
} 