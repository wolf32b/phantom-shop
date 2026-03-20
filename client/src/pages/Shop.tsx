import { PhantomCard } from "@/components/PhantomCard";
import { PhantomButton } from "@/components/PhantomButton";
import { PhantomCounter } from "@/components/PhantomCounter";
import { useCreateOrder } from "@/hooks/use-orders";
import { useRobuxCounter } from "@/hooks/use-stats";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Shop() {
  const { data: stats } = useRobuxCounter();
  const { mutate: createOrder, isPending: isOrdering } = useCreateOrder();
  const { toast } = useToast();
  const { data: user } = useUser();
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>("");
  const [gamepassUrl, setGamepassUrl] = useState<string>("");
  const [redeemCode, setRedeemCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Tax Calculator Logic
  const desiredAmount = parseInt(amount) || 0;
  const requiredPrice = Math.ceil(desiredAmount / 0.7);
  const robloxTax = requiredPrice - desiredAmount;

  const handleHeist = async () => {
    if (!user) {
      toast({ title: t("common.error"), description: t("shop.insufficient"), variant: "destructive" });
      return;
    }

    if (!redeemCode) {
      toast({ title: "Error", description: "Please enter your Phantom Code first", variant: "destructive" });
      return;
    }

    if (!gamepassUrl) {
      toast({ title: "Error", description: "Gamepass ID is required", variant: "destructive" });
      return;
    }

    if (desiredAmount <= 0) {
      toast({ title: "Error", description: "Enter a valid amount to withdraw", variant: "destructive" });
      return;
    }

    try {
      createOrder({ amount: desiredAmount, gamepassUrl, phantomCode: redeemCode }, {
        onSuccess: () => {
          setShowSuccess(true);
          setAmount("");
          setGamepassUrl("");
          setRedeemCode("");
        },
        onError: (error) => {
          toast({ title: t("common.error"), description: error.message, variant: "destructive" });
        },
      });
    } catch (err: any) {
      toast({ title: "Heist Failed", description: err.message, variant: "destructive" });
    } finally {
    }
  };

  return (
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-12">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              onClick={e => e.stopPropagation()}
              className="bg-black border-4 border-primary shadow-[12px_12px_0px_0px_#FF0019] p-8 max-w-md w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-4" />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="font-display text-4xl text-white uppercase italic text-shadow-red mb-3"
              >
                {t("shop.order_success_title")}
              </motion.h2>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-white/60 font-body mb-8"
              >
                {t("shop.order_success_desc")}
              </motion.p>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex gap-3 justify-center"
              >
                <Link href="/orders">
                  <PhantomButton onClick={() => setShowSuccess(false)}>
                    {t("shop.view_orders")}
                  </PhantomButton>
                </Link>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="px-4 py-2 border-2 border-white/20 text-white/50 font-display hover:border-primary hover:text-white transition-all uppercase italic text-sm"
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 md:mb-16 relative">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary clip-path-comic-1 rotate-12 opacity-30 halftone-pattern" />
        <h2 className="text-3xl md:text-6xl font-display text-foreground mb-4 md:mb-6 text-shadow-blood transform -skew-x-12 italic dark:text-white">
          {t("home.robux_pool")}
        </h2>
        <PhantomCounter value={stats?.value || 0} />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-10 bg-primary/10 clip-path-comic-1 -z-10 halftone-pattern animate-pulse" />
          
          <PhantomCard delay={0.1} className="transform -rotate-1">
            <div className="space-y-6 md:space-y-12 p-4 md:p-10 bg-background relative overflow-hidden dark:bg-black border-4 md:border-8 border-double border-primary">
              <div className="absolute top-0 left-0 w-full h-24 bg-primary -skew-y-6 -translate-y-12 z-0" />
              
              <div className="text-center relative z-10">
                <h3 className="text-4xl md:text-7xl font-display text-foreground mb-4 tracking-tighter italic uppercase text-shadow-blood dark:text-white">
                  ORDER ROBUX
                </h3>
              </div>

              <div className="grid gap-8 relative z-10">
                {/* Step 1: The Code */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border-4 border-primary rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors shadow-[8px_8px_0px_0px_rgba(255,0,0,0.2)]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-display text-xl md:text-3xl text-primary italic uppercase tracking-tighter">01. PHANTOM CODE</h4>
                    <div className="bg-primary text-black px-2 py-1 font-display text-xs rotate-3">REQUIRED</div>
                  </div>
                  <p className="text-white/60 font-body text-sm mb-4 italic">Enter the code you received after purchase to unlock your balance.</p>
                  <input
                    type="text"
                    placeholder="PHANTOM-XXXX-XXXX"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                    className="w-full bg-background border-4 border-primary p-3 md:p-5 text-xl md:text-3xl text-foreground font-display focus:outline-none dark:bg-black dark:text-white uppercase placeholder:opacity-30"
                  />
                </motion.div>

                {/* Step 2: Gamepass */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border-4 border-primary rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors shadow-[8px_8px_0px_0px_rgba(255,0,0,0.2)]"
                >
                  <h4 className="font-display text-xl md:text-3xl text-primary italic mb-4 uppercase tracking-tighter">02. TARGET GAMEPASS (ID)</h4>
                  <p className="text-white/60 font-body text-sm mb-4 italic">Create a Gamepass on Roblox and paste its ID or URL here.</p>
                  <input
                    type="text"
                    value={gamepassUrl}
                    onChange={(e) => setGamepassUrl(e.target.value)}
                    placeholder="Enter Gamepass ID or URL"
                    className="w-full bg-background border-4 border-primary p-3 md:p-5 text-base md:text-xl text-foreground font-body focus:outline-none dark:bg-black dark:text-white placeholder:opacity-30"
                  />
                </motion.div>

                {/* Step 3: Amount & Calculator */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-6 border-4 border-primary rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                    <h4 className="font-display text-2xl text-primary italic mb-4">03. DESIRED ROBUX</h4>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="1000"
                        className="w-full bg-background border-4 border-primary p-4 text-4xl text-center text-foreground font-display focus:outline-none dark:bg-black dark:text-white"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-primary font-display">R$</span>
                    </div>
                  </div>

                  <div className="p-6 border-4 border-white/10 rounded-lg bg-white/5 dark:bg-white/5 backdrop-blur-sm flex flex-col justify-center">
                    <h4 className="font-display text-2xl text-primary italic mb-2">04. TAX CALCULATOR</h4>
                    <div className="space-y-1 font-display italic">
                      <div className="flex justify-between text-xl">
                        <span>YOU RECEIVE:</span>
                        <span className="text-white">{desiredAmount} R$</span>
                      </div>
                      <div className="flex justify-between text-xl text-primary">
                        <span>ROBLOX TAX (30%):</span>
                        <span>-{robloxTax} R$</span>
                      </div>
                      <div className="border-t-2 border-primary pt-2 flex justify-between text-3xl font-black">
                        <span>SET PRICE TO:</span>
                        <span className="text-primary">{requiredPrice} R$</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Step: Purchase */}
                <PhantomButton 
                  onClick={handleHeist}
                  disabled={isOrdering}
                  variant="primary"
                  className="w-full text-2xl md:text-5xl py-6 md:py-12 shadow-[8px_8px_0px_0px_black] md:shadow-[15px_15px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_#FFFFFF] dark:md:shadow-[15px_15px_0px_0px_#FFFFFF] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all"
                >
                  {isOrdering ? "PROCESSING..." : "Buy robux"}
                </PhantomButton>
              </div>

                <div className="bg-primary p-4 border-4 border-black dark:border-white">
                  <p className="text-xl text-black font-black text-center tracking-tighter uppercase italic">
                    MUST SET GAMEPASS PRICE TO {requiredPrice} R$ FOR VERIFICATION
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4 py-4 border-t-2 border-primary/20">
                  <div className="flex flex-wrap justify-center gap-6 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8" />
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded text-black font-black italic text-lg shadow-sm">
                      <span className="text-[#003087]">mada</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-[#00753b] rounded text-white font-bold text-lg shadow-sm">
                      <span>Meeza</span>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 mt-1" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-10" />
                    <div className="flex items-center gap-1 px-3 py-1 bg-[#231f20] rounded text-white font-bold text-lg shadow-sm">
                      <span>KNET</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-[#1e2c4f] rounded text-white font-bold text-lg shadow-sm">
                      <span>Benefit</span>
                    </div>
                  </div>
                  <p className="text-primary font-display text-sm italic animate-pulse">
                    {t("shop.payment_methods")}
                  </p>
                </div>
              </div>
          </PhantomCard>
        </div>
      </div>
    </div>
  );
}
