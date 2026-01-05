import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface PhantomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

export function PhantomButton({ 
  children, 
  className, 
  variant = "primary", 
  isLoading, 
  disabled,
  ...props 
}: PhantomButtonProps) {
  const baseStyles = "relative px-8 py-3 font-display uppercase tracking-widest text-lg font-bold transform transition-all duration-200";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-white hover:text-black border-2 border-black hover:border-primary",
    secondary: "bg-black text-white border-2 border-white hover:bg-white hover:text-black",
    danger: "bg-red-900 text-white border-2 border-red-500 hover:bg-red-600"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, skewX: -12 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles, 
        variants[variant], 
        "clip-path-shard shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite]" />
      <span className={cn("relative z-10 flex items-center justify-center gap-2", isLoading && "animate-pulse")}>
        {isLoading ? "STEALING..." : children}
      </span>
    </motion.button>
  );
}
