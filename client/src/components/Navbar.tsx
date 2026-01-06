import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

import phantomLogo from "../PhantomThieves.webp";

export function Navbar() {
  const [location] = useLocation();
  const { data: user } = useUser();
  const { theme, setTheme } = useTheme();

  const links = [
    { href: "/", label: "HIDEOUT" },
    { href: "/shop", label: "BLACK MARKET" },
    { href: "/orders", label: "MY HEISTS" },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full bg-background border-b-8 border-secondary shadow-[0_10px_30px_rgba(255,0,25,0.4)] transition-colors duration-500"
    >
      <div className="h-2 w-full bg-primary halftone-pattern opacity-50" />

      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3 cursor-pointer">
          <div className="relative p-1 bg-white clip-path-comic-1 rotate-3 group-hover:rotate-0 transition-transform">
            <img 
              src={phantomLogo} 
              alt="Phantom Thieves Logo" 
              className="w-14 h-14 object-contain"
            />
          </div>
          <span className="font-display text-3xl tracking-tighter text-foreground transform -skew-x-12 group-hover:text-primary transition-colors">
            PHANTOM<span className="text-primary italic">SHOP</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <div 
                className={cn(
                  "relative px-6 py-2 font-display text-2xl tracking-tighter cursor-pointer transition-all duration-300 transform",
                  location === link.href 
                    ? "bg-primary text-white -skew-x-12 scale-110 shadow-[6px_6px_0px_0px_white] dark:shadow-[6px_6px_0px_0px_black]" 
                    : "text-foreground/70 hover:text-foreground hover:-skew-x-6"
                )}
              >
                {link.label}
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover-elevate bg-white dark:bg-black border-2 border-primary rounded-none rotate-3 hover:rotate-0 transition-transform"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-black dark:text-white" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-black dark:text-white" />
          </Button>

          {user ? (
            <div className="flex items-center gap-4 bg-white dark:bg-black p-1 clip-path-comic-2 shadow-[4px_4px_0px_0px_#FF0019] border-2 border-black dark:border-white">
              <div className="text-right px-2">
                <p className="text-[10px] text-black/50 dark:text-white/50 font-bold uppercase leading-none">Codename</p>
                <p className="font-display text-xl leading-none text-black dark:text-white tracking-tighter">{user.username}</p>
              </div>
              <img 
                src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=FF0019&color=fff`} 
                alt="Profile" 
                className="w-12 h-12 border-4 border-black dark:border-white"
              />
            </div>
          ) : (
            <Link href="/login">
              <div className="px-8 py-2 bg-white dark:bg-black text-black dark:text-white font-display text-2xl hover:bg-primary hover:text-white transition-all cursor-pointer clip-path-p5-angle shadow-[6px_6px_0px_0px_#FF0019] border-2 border-black dark:border-white">
                LOGIN
              </div>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
