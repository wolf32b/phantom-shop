import { motion } from "framer-motion";
import { PhantomButton } from "@/components/PhantomButton";
import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";

export default function Home() {
  const { data: user } = useUser();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Dynamic Background Elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        {/* Unsplash abstract red/black texture */}
        {/* Phantom thieves style aesthetic background */}
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
            مرحبًا بك في متجر الفانتومز.
          </div>
          <h1 className="text-7xl md:text-9xl font-display text-white mb-2 leading-[0.85] text-shadow-red">
            PHANTOM<br /><span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-red-800">SHOP</span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-white/80 font-body tracking-wider mb-12 max-w-2xl mx-auto bg-black/50 p-4 border-l-4 border-primary backdrop-blur-sm"
        >
          {user ? `اول موقع لبيع الروبوكس عربيًا.` : "The world is rotten. Steal the treasure and take back your future."}
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="flex justify-center gap-6"
        >
          <Link href="/shop">
            <PhantomButton className="text-2xl px-12 py-6">
              تصفح المتجر
            </PhantomButton>
          </Link>
          
          {!user && (
            <Link href="/login">
              <PhantomButton variant="secondary" className="text-2xl px-12 py-6">
                التسجيل كـ فانتوم
              </PhantomButton>
            </Link>
          )}
        </motion.div>
      </div>

      {/* Decorative floating shards */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-32 h-32 border-4 border-white/10 hidden lg:block pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-48 h-48 border-4 border-primary/20 hidden lg:block pointer-events-none"
      />
    </div>
  );
}
