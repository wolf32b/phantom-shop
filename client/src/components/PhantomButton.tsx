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
  const baseStyles = "relative px-8 py-3 font-display uppercase tracking-widest text-lg font-bold transform transition-all duration-200 group";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-white hover:text-black border-4 border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
    secondary: "bg-black text-white border-4 border-white hover:bg-white hover:text-black shadow-[6px_6px_0px_0px_rgba(220,20,60,1)]",
    danger: "bg-red-900 text-white border-4 border-red-500 hover:bg-red-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, rotate: -1, skewX: -12 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles, 
        variants[variant], 
        "clip-path-p5-angle shadow-[6px_6px_0px_0px_white]",
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite]" />
      <span className={cn("relative z-10 flex items-center justify-center gap-2", isLoading && "animate-pulse")}>
        {isLoading ? "جاري المعالجة..." : children}
      </span>
    </motion.button>
  );
}
