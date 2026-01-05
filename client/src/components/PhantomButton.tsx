import { ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PhantomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export function PhantomButton({ 
  children, 
  className, 
  variant = "primary",
  ...props 
}: PhantomButtonProps) {
  
  const baseStyles = "relative px-8 py-3 font-display uppercase tracking-wider text-xl transition-all duration-300 transform";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-black hover:text-primary skew-x-[-10deg] border-2 border-transparent hover:border-primary",
    secondary: "bg-black text-white hover:bg-primary hover:text-black skew-x-[-10deg] border-2 border-primary",
    outline: "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white skew-x-[-10deg]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, x: 5 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      <span className="block skew-x-[10deg] drop-shadow-md">
        {children}
      </span>
      {/* Decorative stars/elements */}
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
