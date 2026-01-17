import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Sun, Moon, Languages, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { useNotifications } from "../hooks/use-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import phantomLogo from "../PhantomThieves.webp";

export function Navbar() {
  const [location] = useLocation();
  const { data: user } = useUser();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { data: notifications, mutate: markAsRead } = useNotifications();

  const unreadCount = (notifications as any[])?.filter((n: any) => !n.isRead).length || 0;

  const links = [
    { href: "/", label: t("nav.hideout") || "HIDEOUT" },
    { href: "/shop", label: t("nav.shop") },
    { href: "/codes", label: t("nav.codes") || "CODES" },
    { href: "/orders", label: t("nav.orders") },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full bg-black border-b-8 border-primary shadow-[0_10px_40px_rgba(255,0,25,0.6)] transition-colors duration-500"
    >
      <div className="h-4 w-full bg-primary halftone-pattern" />

      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3 cursor-pointer">
          <div className="relative p-2 bg-white clip-path-comic-1 rotate-3 group-hover:rotate-0 transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(255,0,25,1)]">
            <img 
              src={phantomLogo} 
              alt="Phantom Thieves Logo" 
              className="w-14 h-14 object-contain"
            />
          </div>
          <span className="font-display text-4xl tracking-tighter text-white transform -skew-x-12 group-hover:text-primary transition-colors italic">
            PHANTOM<span className="text-primary not-italic transition-colors">SHOP</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <div 
                className={cn(
                  "relative px-8 py-3 font-display text-3xl tracking-tighter cursor-pointer transition-all duration-300 transform italic uppercase",
                  location === link.href 
                    ? "bg-primary text-white -skew-x-12 scale-110 shadow-[8px_8px_0px_0px_white]" 
                    : "text-white/80 hover:text-white hover:-skew-x-12 hover:bg-white/10"
                )}
              >
                {link.label}
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover-elevate bg-white dark:bg-black border-2 border-primary rounded-none">
                  <Bell className="h-5 w-5 text-black dark:text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-black border-2 border-primary text-white font-body p-0">
                <div className="p-3 border-b border-primary/30 font-display text-xl bg-primary/10">
                  {t("nav.notifications") || "NOTIFICATIONS"}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications?.length === 0 ? (
                    <div className="p-8 text-center text-white/50 italic">
                      No updates from the hideout.
                    </div>
                  ) : (
                    notifications?.map((n: any) => (
                      <DropdownMenuItem 
                        key={n.id} 
                        className={cn(
                          "flex flex-col items-start gap-1 p-4 border-b border-primary/10 focus:bg-primary/20 cursor-pointer",
                          !n.isRead && "bg-primary/5"
                        )}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="font-display text-lg text-primary">{n.title}</div>
                        <div className="text-sm leading-tight text-white/80">{n.message}</div>
                        <div className="text-[10px] text-white/40 mt-1">
                          {new Date(n.createdAt!).toLocaleTimeString()}
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="hover-elevate bg-white dark:bg-black border-2 border-primary rounded-none rotate-3 hover:rotate-0 transition-transform"
          >
            <Languages className="h-5 w-5 text-black dark:text-white" />
          </Button>

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
                <p className="text-[10px] text-black/50 dark:text-white/50 font-bold uppercase leading-none">{t("auth.codename")}</p>
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
                {t("nav.login")}
              </div>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
