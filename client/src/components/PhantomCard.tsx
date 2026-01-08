import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PhantomCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function PhantomCard({ children, className, delay = 0 }: PhantomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.4, delay, ease: "backOut" }}
      whileHover={{ scale: 1.02, rotate: -1, zIndex: 10 }}
      className={cn(
        "relative bg-background border-4 border-primary p-1 overflow-visible group shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,0,25,0.3)]",
        className
      )}
    >
      {/* Jagged corners decoration */}
      <div className="absolute -top-4 -left-4 w-12 h-12 border-t-8 border-l-8 border-foreground z-20 pointer-events-none" />
      <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-8 border-r-8 border-foreground z-20 pointer-events-none" />
      
      {/* Content Container with contrasting background */}
      <div className="relative z-10 bg-background h-full w-full p-6 transition-colors duration-300">
        {children}
      </div>

      {/* Background slash effect */}
      <div className="absolute inset-0 bg-primary/20 transform -skew-x-12 translate-x-full group-hover:translate-x-[-10%] transition-transform duration-500 ease-out z-0" />
    </motion.div>
  );
}
