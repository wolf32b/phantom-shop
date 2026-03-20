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
    "home.subtitle": "Trusted by Utopia",
    "home.cta": "Enter the Shop",
    "home.robux_pool": "The Shop",
    "shop.title": "ROBUX ORDER",
    "shop.subtitle": "Virtual treasures for the master thief.",
    "shop.buy": "Buy",
    "shop.insufficient": "Please log in first",
    "shop.gamepass_url": "Gamepass URL",
    "shop.gamepass_placeholder": "https://www.roblox.com/game-pass/...",
    "shop.gamepass_help": "Create a gamepass on Roblox and paste the link here.",
    "shop.payment_methods": "Supports PayPal, mada, Meeza, KNET, Benefit & all major cards",
    "auth.login": "Sign In",
    "auth.register": "Login to your account",
    "auth.verify": "Verify Email",
    "auth.codename": "Codename",
    "auth.passphrase": "Passphrase",
    "auth.email": "Email",
    "auth.verify_btn": "Verify",
    "auth.infiltrate": "INFILTRATE",
    "auth.recruit": "RECRUIT",
    "auth.enter_market": "Enter the Black Market",
    "auth.join_thieves": "Join the Phantom Thieves",
    "auth.google_btn": "CONTINUE WITH GOOGLE",
    "auth.or_codename": "or use codename login below",
    "auth.no_account": "Don't have an account?",
    "auth.already_member": "Already a member?",
    "auth.become_thief": "BECOME A PHANTOM THIEF",
    "auth.verification_sent": "VERIFICATION CODE SENT",
    "auth.check_email": "Check your email for the verification code",
    "auth.redirecting": "REDIRECTING",
    "auth.google_redirect": "Taking you to Google Secure Login...",
    "common.loading": "Processing...",
    "common.success": "Success",
    "common.error": "Error",
    "home.guide_1_title": "1) PURCHASE PHANTOM CODE",
    "home.guide_1_desc": "Visit the Codes page, choose your pack, and complete the transaction. Your unique Phantom Code will be activated instantly.",
    "home.guide_2_title": "2) PREPARE YOUR GAMEPASS",
    "home.guide_2_desc": "Create a Gamepass in your Roblox experience. Set it to 'On Sale' and ensure your Gamepass is public and the price matches the calculator exactly.",
    "home.guide_3_title": "3) SUBMIT HEIST REQUEST",
    "home.guide_3_desc": "Go to the Shop, enter your Phantom Code, your Gamepass ID, and the amount. Our system will verify the price automatically.",
    "home.guide_4_title": "4) ADMIN APPROVAL",
    "home.guide_4_desc": "Our admins will purchase your Gamepass manually. Once approved, you'll receive a notification and your Robux will be pending in your Roblox account.",
    "home.guide_note": "Note: Always ensure your Gamepass is public and the price matches the calculator exactly.",
    "orders.restricted": "CLASSIFIED ACCESS",
    "orders.login_req": "You need to log in to view your orders.",
    "orders.title": "YOUR HEISTS",
    "orders.total": "Total",
    "orders.empty": "No Heists Yet",
    "orders.empty_desc": "Your order history is empty. Start your first heist!",
    "orders.go_shop": "Go to Shop",
    "orders.status": "Status",
    "codes.title": "PHANTOM CODES",
    "codes.email_placeholder": "Your email address",
    "codes.email_note": "Codes will be delivered to this email.",
    "codes.buy_now": "BUY NOW",
    "codes.purchase_success": "Purchase Successful",
    "codes.purchase_fail": "Purchase failed. Please try again.",
    "codes.email_required": "Please enter your email first",
    "profile.title": "MY PROFILE",
    "profile.restricted": "LOGIN REQUIRED",
    "profile.tab_info": "Info",
    "profile.tab_password": "Password",
    "profile.new_username": "New Username",
    "profile.avatar_url": "Avatar Image URL",
    "profile.avatar_hint": "Paste a link to your profile picture (optional)",
    "profile.save": "SAVE CHANGES",
    "profile.saved": "Profile updated successfully",
    "profile.save_error": "Failed to save changes",
    "profile.fill_all": "Fill all fields",
    "profile.password_mismatch": "Passwords do not match",
    "profile.password_short": "Password must be at least 6 characters",
    "profile.current_password": "Current Password",
    "profile.new_password": "New Password",
    "profile.confirm_password": "Confirm New Password",
    "profile.change_password": "CHANGE PASSWORD",
    "profile.password_changed": "Password changed successfully",
    "faq.title": "FAQ",
    "faq.subtitle": "Everything you need to know about Phantom Shop.",
    "faq.still_confused": "Still have questions? Jump into the shop and we'll help you out.",
    "nav.faq": "FAQ",
    "orders.status_pending": "Pending",
    "orders.status_approved": "Approved",
    "orders.status_completed": "Completed",
    "orders.status_rejected": "Rejected",
    "orders.gamepass_price": "Gamepass Price",
    "shop.order_success_title": "HEIST SUCCESSFUL",
    "shop.order_success_desc": "Your withdrawal request has been submitted. Admins will review it shortly.",
    "shop.view_orders": "VIEW MY ORDERS",
  },
  ar: {
    "nav.hideout": "الواجهة",
    "nav.shop": "المتجر",
    "nav.orders": "الطلبات",
    "nav.codes": "أكواد الروبوكس",
    "nav.login": "ادخل",
    "nav.logout": "اخرج",
    "nav.balance": "رصيد روبوكس",
    "nav.notifications": "التنبيهات",
    "home.title": "الفانتوم ثيفز",
    "home.subtitle": "مرحبًا بك، في متجر الفانتومز!",
    "home.cta": "دخول المتجر",
    "home.robux_pool": "المتجر",
    "shop.title": "طلب روبوكس",
    "shop.subtitle": "كنوز افتراضية للص المحترف.",
    "shop.buy": "شراء",
    "shop.insufficient": "سجل دخولك أولاً",
    "shop.gamepass_url": "رابط الجيم باس",
    "shop.gamepass_placeholder": "https://www.roblox.com/game-pass/...",
    "shop.gamepass_help": "أنشئ جيم باس على روبلوكس والصق الرابط هنا.",
    "shop.payment_methods": "يدعم PayPal، مدى، ميزة، KNET، Benefit وجميع البطاقات",
    "auth.login": "ادخل",
    "auth.register": "سجل",
    "auth.verify": "تأكيد البريد",
    "auth.codename": "الاسم الرمزي",
    "auth.passphrase": "كلمة المرور",
    "auth.email": "البريد الإلكتروني",
    "auth.verify_btn": "تأكيد",
    "auth.infiltrate": "تسلل",
    "auth.recruit": "انضم",
    "auth.enter_market": "ادخل السوق السوداء",
    "auth.join_thieves": "انضم للفانتوم ثيفز",
    "auth.google_btn": "متابعة عبر Google",
    "auth.or_codename": "أو استخدم الاسم الرمزي أدناه",
    "auth.no_account": "ليس لديك حساب؟",
    "auth.already_member": "لديك حساب بالفعل؟",
    "auth.become_thief": "انضم للفانتوم ثيفز",
    "auth.verification_sent": "تم إرسال رمز التحقق",
    "auth.check_email": "تحقق من بريدك الإلكتروني للحصول على الرمز",
    "auth.redirecting": "جاري التحويل",
    "auth.google_redirect": "سيتم تحويلك لتسجيل دخول Google...",
    "common.loading": "جاري المعالجة...",
    "common.success": "نجاح",
    "common.error": "خطأ",
    "home.guide_1_title": "1) شراء كود فانتوم",
    "home.guide_1_desc": "قم بزيارة صفحة الأكواد، اختر إحدى الباقات، وأكمل عملية الدفع. وسيتم تفعيل كود الروبوكس الخاص بك.",
    "home.guide_2_title": "2) تجهيز الجيم باس",
    "home.guide_2_desc": "أنشئ جيم باس في تجربتك على روبلوكس، مع التأكد من مطابقة سعره بنفس السعر المذكور في الآلة الحاسبة.",
    "home.guide_3_title": "3) تقديم طلب السحب",
    "home.guide_3_desc": "انتقل للمتجر، أدخل كود فانتوم، رقم الجيم باس، والكمية. سيقوم نظامنا بالتحقق من السعر تلقائياً.",
    "home.guide_4_title": "4) موافقة الإدارة",
    "home.guide_4_desc": "سيقوم المشرفون بشراء الجيم باس الخاص بك يدوياً. بمجرد الموافقة، ستصلك رسالة وستكون الروبوكس معلقة في حسابك.",
    "home.guide_note": "ملاحظة: تأكد دائماً أن الجيم باس عام وأن السعر مطابق تماماً للحاسبة.",
    "orders.restricted": "وصول مقيد",
    "orders.login_req": "يجب تسجيل الدخول لعرض طلباتك.",
    "orders.title": "طلباتك",
    "orders.total": "المجموع",
    "orders.empty": "لا توجد طلبات بعد",
    "orders.empty_desc": "سجل طلبك الأول الآن!",
    "orders.go_shop": "اذهب للمتجر",
    "orders.status": "الحالة",
    "codes.title": "أكواد فانتوم",
    "codes.email_placeholder": "بريدك الإلكتروني",
    "codes.email_note": "سيتم إرسال الأكواد لهذا البريد.",
    "codes.buy_now": "اشتري الآن",
    "codes.purchase_success": "تمت عملية الشراء",
    "codes.purchase_fail": "فشلت عملية الشراء، حاول مجدداً.",
    "codes.email_required": "أدخل بريدك الإلكتروني أولاً",
    "profile.title": "ملفي الشخصي",
    "profile.restricted": "يجب تسجيل الدخول",
    "profile.tab_info": "المعلومات",
    "profile.tab_password": "كلمة المرور",
    "profile.new_username": "اسم مستخدم جديد",
    "profile.avatar_url": "رابط صورة الملف الشخصي",
    "profile.avatar_hint": "الصق رابط صورتك (اختياري)",
    "profile.save": "حفظ التغييرات",
    "profile.saved": "تم تحديث الملف الشخصي",
    "profile.save_error": "فشل حفظ التغييرات",
    "profile.fill_all": "أكمل جميع الحقول",
    "profile.password_mismatch": "كلمتا المرور غير متطابقتين",
    "profile.password_short": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    "profile.current_password": "كلمة المرور الحالية",
    "profile.new_password": "كلمة المرور الجديدة",
    "profile.confirm_password": "تأكيد كلمة المرور الجديدة",
    "profile.change_password": "تغيير كلمة المرور",
    "profile.password_changed": "تم تغيير كلمة المرور بنجاح",
    "faq.title": "الأسئلة الشائعة",
    "faq.subtitle": "كل ما تحتاج معرفته عن فانتوم شوب.",
    "faq.still_confused": "لا تزال لديك أسئلة؟ انضم إلى المتجر وسنساعدك.",
    "nav.faq": "الأسئلة",
    "orders.status_pending": "قيد المراجعة",
    "orders.status_approved": "موافق عليه",
    "orders.status_completed": "مكتمل",
    "orders.status_rejected": "مرفوض",
    "orders.gamepass_price": "سعر الجيم باس",
    "shop.order_success_title": "تمت العملية بنجاح",
    "shop.order_success_desc": "تم تقديم طلب السحب. سيقوم المشرفون بمراجعته قريباً.",
    "shop.view_orders": "عرض طلباتي",
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
