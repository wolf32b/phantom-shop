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
      className="sticky top-0 z-50 w-full bg-black/95 border-b-4 border-primary shadow-2xl backdrop-blur-sm"
    >
      {/* Decorative top strip */}
      <div className="h-1 w-full bg-gradient-to-r from-black via-primary to-black" />

      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 cursor-pointer">
          <img 
            src={phantomLogo} 
            alt="Phantom Thieves Logo" 
            className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
          />
          <span className="font-display text-2xl tracking-widest text-white group-hover:text-primary transition-colors">
            PHANTOM<span className="text-primary">SHOP</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <div 
                className={cn(
                  "relative px-4 py-2 font-display text-xl tracking-wider cursor-pointer transition-all duration-300 transform hover:-skew-x-12 hover:scale-110",
                  location === link.href ? "text-primary scale-110 -skew-x-12" : "text-white/70 hover:text-white"
                )}
              >
                {link.label}
                {location === link.href && (
                  <motion.div 
                    layoutId="underline"
                    className="absolute bottom-0 left-0 w-full h-1 bg-primary"
                  />
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 bg-white/5 px-4 py-1 rounded-sm border-l-2 border-primary transform skew-x-6">
              <div className="text-right transform -skew-x-6">
                <p className="text-xs text-muted-foreground uppercase">Codename</p>
                <p className="font-display text-lg leading-none text-white">{user.username}</p>
              </div>
              <img 
                src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=d90018&color=fff`} 
                alt="Profile" 
                className="w-10 h-10 border-2 border-white transform -skew-x-6"
              />
            </div>
          ) : (
            <Link href="/login">
              <div className="px-6 py-2 bg-white text-black font-display text-lg hover:bg-primary hover:text-white transition-colors cursor-pointer clip-path-slant">
                LOGIN
              </div>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
