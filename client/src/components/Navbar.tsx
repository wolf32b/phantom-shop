import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

import phantomLogo from "../PhantomThieves.webp";

export function Navbar() {
  const [location] = useLocation();
  const { data: user } = useUser();

  const links = [
    { href: "/", label: "HIDEOUT" },
    { href: "/shop", label: "BLACK MARKET" },
    { href: "/orders", label: "MY HEISTS" },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full bg-black border-b-8 border-secondary shadow-[0_10px_30px_rgba(255,0,25,0.4)]"
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
          <span className="font-display text-3xl tracking-tighter text-white transform -skew-x-12 group-hover:text-primary transition-colors">
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
                    ? "bg-primary text-white -skew-x-12 scale-110 shadow-[6px_6px_0px_0px_white]" 
                    : "text-white/70 hover:text-white hover:-skew-x-6"
                )}
              >
                {link.label}
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 bg-white p-1 clip-path-comic-2 shadow-[4px_4px_0px_0px_#FF0019]">
              <div className="text-right px-2">
                <p className="text-[10px] text-black/50 font-bold uppercase leading-none">Codename</p>
                <p className="font-display text-xl leading-none text-black tracking-tighter">{user.username}</p>
              </div>
              <img 
                src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=FF0019&color=fff`} 
                alt="Profile" 
                className="w-12 h-12 border-4 border-black"
              />
            </div>
          ) : (
            <Link href="/login">
              <div className="px-8 py-2 bg-white text-black font-display text-2xl hover:bg-primary hover:text-white transition-all cursor-pointer clip-path-p5-angle shadow-[6px_6px_0px_0px_#FF0019]">
                LOGIN
              </div>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
