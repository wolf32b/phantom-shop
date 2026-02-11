import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const translations = {
  en: {
    "nav.hideout": "Hideout",
    "nav.shop": "Shop",
    "nav.orders": "Orders",
    "nav.codes": "Phantom Codes",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.balance": "Robux Balance",
    "nav.notifications": "Notifications",
    "home.title": "THE PHANTOM THIEVES",
    "home.subtitle": "Trusted by The Phantom Thieves",
    "home.cta": "Enter the Shop",
    "home.robux_pool": "The Shop",
    "shop.title": "ROBUX ORDER",
    "shop.subtitle": "Virtual treasures for the master thief.",
    "shop.buy": "Buy",
    "shop.insufficient": "Insufficient Funds",
    "shop.gamepass_url": "Gamepass URL",
    "shop.gamepass_placeholder": "https://www.roblox.com/game-pass/...",
    "shop.gamepass_help": "Create a gamepass on Roblox and paste the link here.",
    "auth.login": "Sign In",
    "auth.register": "Login to your account",
    "auth.verify": "Verify Email",
    "auth.codename": "Codename",
    "auth.passphrase": "Passphrase",
    "auth.email": "Email",
    "auth.verify_btn": "Verify",
    "common.loading": "Processing...",
    "common.success": "Success",
    "common.error": "Error"
  },
  ar: {
    "nav.hideout": "المخبأ",
    "nav.shop": "المتجر",
    "nav.orders": "الطلبات",
    "nav.codes": "أكواد فانتوم",
    "nav.login": "تسلل",
    "nav.logout": "رحيل",
    "nav.balance": "رصيد روبوكس",
    "nav.notifications": "التنبيهات",
    "home.title": "لصوص الأشباح",
    "home.subtitle": "استعد ما هو لك من مخزن الروبوكس.",
    "home.cta": "دخول المتجر",
    "home.robux_pool": "مخزون الروبوكس العالمي",
    "shop.title": "السوق السوداء",
    "shop.subtitle": "كنوز افتراضية للص المحترف.",
    "shop.buy": "سرقة",
    "shop.insufficient": "رصيد غير كافٍ",
    "shop.gamepass_url": "رابط الجيم باس",
    "shop.gamepass_placeholder": "https://www.roblox.com/game-pass/...",
    "shop.gamepass_help": "أنشئ جيم باس على روبلوكس والصق الرابط هنا.",
    "auth.login": "تسلل",
    "auth.register": "تجنيد",
    "auth.verify": "تأكيد البريد",
    "auth.codename": "الاسم الرمزي",
    "auth.passphrase": "كلمة المرور",
    "auth.email": "البريد الإلكتروني",
    "auth.verify_btn": "تأكيد",
    "common.loading": "جاري المعالجة...",
    "common.success": "نجاح",
    "common.error": "خطأ"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("p5-lang") as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("p5-lang", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  const isRtl = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      <div dir={isRtl ? "rtl" : "ltr"}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
