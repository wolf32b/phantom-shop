import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PhantomCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function PhantomCard({ children, className, delay = 0 }: PhantomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay,
        ease: "backOut" 
      }}
      className={cn(
        "relative bg-black/80 border-2 border-zinc-800 p-6 overflow-hidden group hover:border-primary transition-colors duration-300",
        className
      )}
    >
      {/* Background slash effect on hover */}
      <div className="absolute inset-0 bg-primary/10 -skew-x-12 translate-x-[-150%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0 pointer-events-none" />
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary opacity-50" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary opacity-50" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
