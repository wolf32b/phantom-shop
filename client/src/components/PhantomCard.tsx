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
      whileHover={{ scale: 1.02, rotate: 1, zIndex: 10 }}
      className={cn(
        "relative bg-black border-2 border-white/20 p-1 overflow-hidden group",
        className
      )}
    >
      {/* Jagged corners decoration */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary z-20" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary z-20" />
      
      {/* Content Container with contrasting background */}
      <div className="relative z-10 bg-[#151515] h-full w-full p-4 clip-path-slant group-hover:bg-[#1a1a1a] transition-colors duration-300">
        {children}
      </div>

      {/* Background slash effect */}
      <div className="absolute inset-0 bg-primary/10 transform -skew-x-12 translate-x-full group-hover:translate-x-[-10%] transition-transform duration-500 ease-out z-0" />
    </motion.div>
  );
}
