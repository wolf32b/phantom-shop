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

  const navItems = [
    { href: "/", label: "Hideout", icon: Home },
    { href: "/shop", label: "Black Market", icon: ShoppingBag },
    ...(user ? [{ href: "/orders", label: "Stolen Goods", icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col font-body text-white selection:bg-primary selection:text-white">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b-4 border-primary shadow-lg shadow-primary/20">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="group cursor-pointer">
            <div className="flex items-center gap-2 transform group-hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-primary flex items-center justify-center transform -rotate-12 border-2 border-white">
                <span className="text-3xl font-display font-bold">Pt</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl tracking-widest leading-none text-white">PHANTOM</span>
                <span className="font-display text-xl tracking-widest leading-none text-primary">THIEVES</span>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-2 font-display text-lg tracking-wider uppercase hover:text-primary transition-colors relative group",
                location === item.href ? "text-primary" : "text-white"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:rotate-12",
                  location === item.href && "rotate-12"
                )} />
                {item.label}
                {/* Underline slash */}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-full h-1 bg-primary transform origin-left transition-transform duration-300 skew-x-[-20deg]",
                  location === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="font-display uppercase text-sm text-zinc-400">Codename</span>
                  <span className="font-display text-xl text-primary leading-none">{dbUser?.username || user.username}</span>
                  {dbUser && (
                    <span className="text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded text-green-400 mt-1">
                      {dbUser.robuxBalance} RBX
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => logout()}
                  className="bg-zinc-800 p-2 rounded-full hover:bg-primary transition-colors group"
                >
                  <LogOut className="w-5 h-5 text-white group-hover:rotate-[-10deg] transition-transform" />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <PhantomButton variant="primary" className="text-sm px-6 py-2">
                  Infiltrate
                </PhantomButton>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 relative">
        {/* Background decorative elements */}
        <div className="fixed top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-20 right-10 w-96 h-96 bg-red-900/10 rounded-full blur-3xl -z-10" />
        
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-black/90 border-t border-zinc-800 py-8 mt-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="font-display text-zinc-500 tracking-widest text-sm">
            TAKE YOUR TIME • {new Date().getFullYear()} • PHANTOM THIEVES
          </p>
        </div>
      </footer>
    </div>
  );
}
