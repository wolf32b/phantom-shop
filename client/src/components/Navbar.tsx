import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Sun, Moon, Languages, Bell, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { useNotifications } from "../hooks/use-notifications";
import { useState, useRef, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const unreadCount = (notifications as any[])?.filter((n: any) => !n.isRead).length || 0;

  let links = [
    { href: "/", label: t("nav.hideout") || "HIDEOUT" },
    { href: "/shop", label: t("nav.shop") },
    { href: "/codes", label: t("nav.codes") || "CODES" },
    { href: "/orders", label: t("nav.orders") },
    { href: "/faq", label: t("nav.faq") || "FAQ" },
    { href: "/reviews", label: language === "ar" ? "آراء" : "REVIEWS" },
  ];

  if (user && (user as any).isAdmin) {
    links = [...links, { href: "/admin", label: "ADMIN" }];
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full bg-black border-b-8 border-primary shadow-[0_10px_40px_rgba(255,0,25,0.6)] transition-colors duration-500"
    >
      <div className="h-2 w-full bg-primary halftone-pattern" />

      <div className="container mx-auto px-3 h-16 md:h-24 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 cursor-pointer">
          <div className="relative p-1 md:p-2 bg-white clip-path-comic-1 rotate-3 group-hover:rotate-0 transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(255,0,25,1)]">
            <img
              src={phantomLogo}
              alt="Phantom Thieves Logo"
              className="w-8 h-8 md:w-14 md:h-14 object-contain"
            />
          </div>
          <span className="font-display text-xl md:text-4xl tracking-tighter text-white transform -skew-x-12 group-hover:text-primary transition-colors italic">
            PHANTOM<span className="text-primary not-italic transition-colors">SHOP</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "relative px-6 py-2 font-display text-xl tracking-tighter cursor-pointer transition-all duration-300 transform italic uppercase",
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

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          {/* Notifications - desktop only */}
          {user && (
            <div className="hidden md:block">
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
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="hover-elevate bg-white dark:bg-black border-2 border-primary rounded-none rotate-3 hover:rotate-0 transition-transform w-8 h-8 md:w-10 md:h-10"
          >
            <Languages className="h-4 w-4 text-black dark:text-white" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover-elevate bg-white dark:bg-black border-2 border-primary rounded-none rotate-3 hover:rotate-0 transition-transform w-8 h-8 md:w-10 md:h-10"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-black dark:text-white" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-black dark:text-white" />
          </Button>

          {/* User / Login - desktop */}
          <div className="hidden md:block">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-white dark:bg-black p-1 clip-path-comic-2 shadow-[4px_4px_0px_0px_#FF0019] border-2 border-black dark:border-white hover:border-primary transition-all"
                >
                  <div className="text-right px-2">
                    <p className="text-[10px] text-black/50 dark:text-white/50 font-bold uppercase leading-none">{t("auth.codename")}</p>
                    <p className="font-display text-lg leading-none text-black dark:text-white tracking-tighter">{user.username}</p>
                  </div>
                  <img
                    src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=FF0019&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 border-4 border-black dark:border-white"
                  />
                  <ChevronDown className={`w-3 h-3 text-black dark:text-white transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-black border-2 border-primary shadow-[4px_4px_0px_0px_#FF0019] z-50"
                    >
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 text-white hover:bg-primary/20 transition-colors cursor-pointer border-b border-primary/20">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-display text-sm uppercase italic">{t("profile.title")}</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-red-900/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-primary" />
                        <span className="font-display text-sm uppercase italic">{t("nav.logout")}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <div className="px-6 py-2 bg-white dark:bg-black text-black dark:text-white font-display text-xl hover:bg-primary hover:text-white transition-all cursor-pointer clip-path-p5-angle shadow-[6px_6px_0px_0px_#FF0019] border-2 border-black dark:border-white">
                  {t("nav.login")}
                </div>
              </Link>
            )}
          </div>

          {/* Hamburger - mobile only */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 bg-primary text-white border-2 border-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-black border-t-4 border-primary"
          >
            <div className="flex flex-col px-4 py-4 gap-2">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-4 py-3 font-display text-xl tracking-tighter cursor-pointer transition-all italic uppercase border-2",
                      location === link.href
                        ? "bg-primary text-white border-white shadow-[4px_4px_0px_0px_white]"
                        : "text-white/80 border-white/10 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {link.label}
                  </div>
                </Link>
              ))}

              <div className="border-t border-primary/30 pt-3 mt-1">
                {user ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 bg-white/5 border border-primary p-3">
                      <img
                        src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=FF0019&color=fff`}
                        alt="Profile"
                        className="w-10 h-10 border-2 border-primary"
                      />
                      <div>
                        <p className="text-[10px] text-white/50 uppercase">{t("auth.codename")}</p>
                        <p className="font-display text-lg text-white">{user.username}</p>
                      </div>
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-1">
                          {unreadCount} 🔔
                        </span>
                      )}
                    </div>
                    <Link href="/profile">
                      <div
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white border border-white/10 hover:border-primary transition-all cursor-pointer"
                      >
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-display text-sm uppercase italic">{t("profile.title")}</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-900/30 border border-white/10 transition-all cursor-pointer w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-display text-sm uppercase italic">{t("nav.logout")}</span>
                    </button>
                  </div>
                ) : (
                  <Link href="/login">
                    <div
                      onClick={() => setMobileOpen(false)}
                      className="w-full px-4 py-3 bg-primary text-white font-display text-xl text-center cursor-pointer border-2 border-white shadow-[4px_4px_0px_0px_white]"
                    >
                      {t("nav.login")}
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
