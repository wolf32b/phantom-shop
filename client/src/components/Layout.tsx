import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { motion } from "framer-motion";
import { PhantomButton } from "./PhantomButton";
import { ShoppingBag, User, LogOut, Home, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: dbUser } = useUser();

  return (
    <div className="min-h-screen flex flex-col font-body text-white selection:bg-primary selection:text-white bg-black">
      {/* Background patterns */}
      <div className="fixed inset-0 halftone-pattern opacity-5 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-950 to-red-950/20 -z-20" />

      <Navbar />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 relative">
        <motion.div
          key={location}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "anticipate" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t-8 border-primary py-12 relative overflow-hidden">
        <div className="absolute inset-0 halftone-pattern opacity-10" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white clip-path-comic-1 rotate-3 flex items-center justify-center border-4 border-primary">
              <span className="text-black font-display font-black text-4xl">Pt</span>
            </div>
            <div>
              <p className="font-display text-3xl italic tracking-tighter text-white">PHANTOM SHOP</p>
              <p className="font-display text-primary text-xl italic tracking-tighter uppercase leading-none">Take Your Heart</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="font-display text-white tracking-widest text-2xl italic uppercase mb-2">
              THESE ARE REBELS' TOOLS
            </p>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} • PHANTOM THIEVES OF HEARTS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
