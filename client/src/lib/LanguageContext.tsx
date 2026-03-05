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
    "home.guide_1_title": "1) PURCHASE PHANTOM CODE",
    "home.guide_1_desc": "Visit the Codes page, choose your pack, and complete the transaction. Your unique Phantom Code will be activated instantly.",
    "home.guide_2_title": "2) PREPARE YOUR GAMEPASS",
    "home.guide_2_desc": "Create a Gamepass in your Roblox experience. Set it to 'On Sale'. To receive X Robux, you MUST set the price to Ceil(X / 0.7) to account for the 30% Roblox tax.",
    "home.guide_3_title": "3) SUBMIT HEIST REQUEST",
    "home.guide_3_desc": "Go to the Shop, enter your Phantom Code, your Gamepass ID, and the amount. Our system will verify the price automatically.",
    "home.guide_4_title": "4) ADMIN APPROVAL",
    "home.guide_4_desc": "Our admins will purchase your Gamepass manually. Once approved, you'll receive a notification and your Robux will be pending in your Roblox account.",
    "home.guide_note": "Note: Always ensure your Gamepass is public and the price matches the calculator exactly.",
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
    "shop.payment_methods": "يدعم PayPal، مدى، ميزة، KNET، Benefit وجميع البطاقات العالمية",
    "auth.login": "تسلل",
    "auth.register": "تجنيد",
    "auth.verify": "تأكيد البريد",
    "auth.codename": "الاسم الرمزي",
    "auth.passphrase": "كلمة المرور",
    "auth.email": "البريد الإلكتروني",
    "auth.verify_btn": "تأكيد",
    "common.loading": "جاري المعالجة...",
    "common.success": "نجاح",
    "common.error": "خطأ",
    "home.guide_1_title": "1) شراء PHANTOM CODE",
    "home.guide_1_desc": "قم بزيارة صفحة الأكواد، اختر باقتك، وأكمل عملية الدفع. سيتم تفعيل كود فانتوم الخاص بك فوراً.",
    "home.guide_2_title": "2) تجهيز الجيم باس",
    "home.guide_2_desc": "أنشئ Gamepass في تجربتك على روبلوكس واجعله معروضاً للبيع. لاستلام X روبوكس، يجب عليك تعيين السعر على Ceil(X / 0.7) لتعويض ضريبة روبلوكس (30%).",
    "home.guide_3_title": "3) تقديم طلب السحب",
    "home.guide_3_desc": "انتقل للمتجر، أدخل كود فانتوم، رقم الجيم باس، والكمية. سيقوم نظامنا بالتحقق من السعر تلقائياً.",
    "home.guide_4_title": "4) موافقة الإدارة",
    "home.guide_4_desc": "سيقوم المشرفون بشراء الجيم باس الخاص بك يدوياً. بمجرد الموافقة، ستصلك رسالة وستكون الروبوكس معلقة في حسابك على روبلوكس.",
    "home.guide_note": "ملاحظة: تأكد دائماً أن الجيم باس عام وأن السعر مطابق تماماً للحاسبة."
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
    const currentTranslations = translations[language] as any;
    return currentTranslations[key] || key;
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
