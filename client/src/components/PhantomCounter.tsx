import { motion, AnimatePresence } from "framer-motion";
import { GiDiamonds } from "react-icons/gi";

interface PhantomCounterProps {
  value: number;
  label?: string;
}

export function PhantomCounter({ value, label = "TOTAL ROBUX AVAILABLE" }: PhantomCounterProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Decorative Star/Burst Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-48 h-48 border-2 border-primary border-dashed rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-40 h-40 border border-white/30 transform rotate-45"
        />
      </div>

      <div className="relative z-10 bg-black border-y-4 border-primary px-12 py-2 transform -skew-x-12 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-4 transform skew-x-12">
          <GiDiamonds className="text-primary text-3xl animate-pulse" />
          <div className="text-center">
            <h3 className="text-primary font-body text-xs tracking-[0.3em] font-bold mb-1">{label}</h3>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={value}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="font-display text-5xl text-white text-shadow-red"
              >
                {value.toLocaleString()}
              </motion.div>
            </AnimatePresence>
          </div>
          <GiDiamonds className="text-primary text-3xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
