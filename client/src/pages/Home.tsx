import { motion } from "framer-motion";
import { PhantomButton } from "@/components/PhantomButton";
import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { useLanguage } from "@/lib/LanguageContext";

export default function Home() {
  const { data: user } = useUser();
  const { t } = useLanguage();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Dynamic Background Elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <img 
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" 
          alt="Background Texture"
          className="w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
      </motion.div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="mb-8"
        >
          <div className="inline-block bg-primary text-white font-display text-xl px-4 py-1 transform -rotate-2 mb-4">
            {t("home.subtitle")}
          </div>
          <h1 className="text-7xl md:text-9xl font-display text-foreground mb-2 leading-[0.85] text-shadow-red dark:text-white">
            PHANTOM<br /><span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-red-800">SHOP</span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-foreground/80 font-body tracking-wider mb-12 max-w-2xl mx-auto bg-background/50 p-4 border-l-4 border-primary backdrop-blur-sm dark:text-white/80 dark:bg-black/50"
        >
          {t("home.subtitle")}
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="flex justify-center gap-6"
        >
          <Link href="/shop">
            <PhantomButton className="text-2xl px-12 py-6">
              {t("home.cta")}
            </PhantomButton>
          </Link>
          
          {!user && (
            <Link href="/login">
              <PhantomButton variant="secondary" className="text-2xl px-12 py-6">
                {t("auth.register")}
              </PhantomButton>
            </Link>
          )}
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-32 h-32 border-4 border-foreground/10 hidden lg:block pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-48 h-48 border-4 border-primary/20 hidden lg:block pointer-events-none"
      />

      {/* Detailed guide */}
      <section className="w-full max-w-5xl mx-auto mt-20 px-4">
        <div className="bg-black border-4 border-primary p-8 shadow-[10px_10px_0px_0px_white]">
          <h2 className="font-display text-5xl text-white italic uppercase -skew-x-6 mb-4">
            {t("hideout.guide_title") || "HOW TO BUY ROBUX"}
          </h2>

          <div className="text-white/80 font-body leading-relaxed space-y-5">
            <div className="border-l-4 border-primary pl-4">
              <div className="text-primary font-display text-2xl italic">1) شراء Phantom Code</div>
              <div>
                ادخل صفحة <span className="text-white font-bold">Codes</span>، اختر الباقة، وادفع. بعد الدفع يصلك كود (Phantom Code) ويتفعّل في قاعدة البيانات.
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <div className="text-primary font-display text-2xl italic">2) تجهيز Game Pass على روبلوكس</div>
              <div className="space-y-2">
                <div>• سوي Game Pass في تجربة/لعبة حسابك.</div>
                <div>• خلي الـ Game Pass <span className="text-white font-bold">On Sale</span>.</div>
                <div>
                  • إذا تبي تستلم <span className="text-white font-bold">X Robux</span> لازم تسعّر الـ Game Pass على:
                  <span className="text-primary font-bold"> Ceil(X / 0.7) </span>
                  لأن روبلوكس ياخذ 30%.
                </div>
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <div className="text-primary font-display text-2xl italic">3) طلب السحب من صفحة Shop</div>
              <div className="space-y-2">
                <div>• حط Phantom Code.</div>
                <div>• حط رابط الـ Game Pass (أو الـ ID).</div>
                <div>• حط كمية الروبوكس اللي تبيها (X).</div>
                <div>• الموقع بيتحقق تلقائيًا إن سعر الـ Game Pass مضبوط.</div>
                <div>• الطلب يدخل قائمة <span className="text-white font-bold">Admin Panel</span>.</div>
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <div className="text-primary font-display text-2xl italic">4) موافقة الأدمن</div>
              <div className="space-y-2">
                <div>• الأدمن يفتح رابط الـ Game Pass ويشتريه يدويًا من حساب المتجر.</div>
                <div>• بعدها يضغط <span className="text-white font-bold">Approve</span> في Admin Panel.</div>
                <div>• لو فيه مشكلة، يقدر يسوي <span className="text-white font-bold">Reject</span> والرصيد يرجع للكود.</div>
              </div>
            </div>

            <div className="mt-6 text-white/60 italic">
              ملاحظة: دايم تأكد إن رابط الـ Game Pass صحيح وإن السعر مطابق للآلة الحاسبة في صفحة Shop.
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
