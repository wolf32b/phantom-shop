import { motion } from "framer-motion";
import { PhantomButton } from "@/components/PhantomButton";
import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { useLanguage } from "@/lib/LanguageContext";

export default function Home() {
  const { data: user } = useUser();
  const { t, language } = useLanguage();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden px-3 md:px-4">
      {user && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 p-4 bg-white dark:bg-black border-4 border-primary clip-path-comic-1 shadow-[8px_8px_0px_0px_rgba(255,0,0,1)] z-20"
        >
          <h2 className="font-display text-3xl text-primary italic uppercase tracking-tighter">
            {language === 'ar' ? `مرحباً بعودتك، ${user.username}` : `WELCOME BACK, ${user.username}`}
            {user.isAdmin && <span className="ml-2 text-white bg-primary px-2 text-sm not-italic">ADMIN</span>}
          </h2>
        </motion.div>
      )}
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
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-display text-foreground mb-2 leading-[0.85] text-shadow-red dark:text-white">
            PHANTOMS<br /><span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-red-800">SHOP</span>
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
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link href="/shop" className="w-full sm:w-auto">
            <PhantomButton className="text-lg sm:text-2xl px-6 sm:px-12 py-4 sm:py-6 w-full sm:w-auto">
              {t("home.cta")}
            </PhantomButton>
          </Link>
          
          {!user && (
            <Link href="/login" className="w-full sm:w-auto">
              <PhantomButton variant="secondary" className="text-lg sm:text-2xl px-6 sm:px-12 py-4 sm:py-6 w-full sm:w-auto">
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
      <section className="w-full max-w-5xl mx-auto mt-20 px-4 mb-20">
        <div className="bg-black/90 border-4 border-primary p-8 shadow-[15px_15px_0px_0px_white] dark:shadow-[15px_15px_0px_0px_rgba(255,0,0,0.3)] backdrop-blur-md">
          <h2 className="font-display text-5xl md:text-6xl text-white italic uppercase -skew-x-6 mb-8 border-b-4 border-primary pb-4 inline-block">
            {t("How To buy Robux") || "HOW TO BUY ROBUX"}
          </h2>

          <div className="grid md:grid-cols-2 gap-8 text-white/80 font-body leading-relaxed">
            <motion.div 
              whileHover={{ x: 10 }}
              className="border-l-4 border-primary pl-6 py-2 bg-white/5"
            >
              <div className="text-primary font-display text-3xl italic mb-2 uppercase tracking-tighter">
                {t("home.guide_1_title")}
              </div>
              <div className="text-lg">
                {t("home.guide_1_desc")}
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 10 }}
              className="border-l-4 border-primary pl-6 py-2 bg-white/5"
            >
              <div className="text-primary font-display text-3xl italic mb-2 uppercase tracking-tighter">
                {t("home.guide_2_title")}
              </div>
              <div className="text-lg">
                {t("home.guide_2_desc")}
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 10 }}
              className="border-l-4 border-primary pl-6 py-2 bg-white/5"
            >
              <div className="text-primary font-display text-3xl italic mb-2 uppercase tracking-tighter">
                {t("home.guide_3_title")}
              </div>
              <div className="text-lg">
                {t("home.guide_3_desc")}
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 10 }}
              className="border-l-4 border-primary pl-6 py-2 bg-white/5"
            >
              <div className="text-primary font-display text-3xl italic mb-2 uppercase tracking-tighter">
                {t("home.guide_4_title")}
              </div>
              <div className="text-lg">
                {t("home.guide_4_desc")}
              </div>
            </motion.div>
          </div>

          <div className="mt-10 p-4 bg-primary/20 border-2 border-primary italic text-white text-center font-bold tracking-wide">
            {t("home.guide_note")}
          </div>
        </div>
      </section>

    </div>
  );
}
