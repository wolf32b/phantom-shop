import { PhantomCard } from "@/components/PhantomCard";
import { PhantomButton } from "@/components/PhantomButton";
import { PhantomCounter } from "@/components/PhantomCounter";
import { useCreateOrder } from "@/hooks/use-orders";
import { useRobuxCounter } from "@/hooks/use-stats";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { motion } from "framer-motion";

export default function Shop() {
  const { data: stats } = useRobuxCounter();
  const { mutate: createOrder, isPending: isOrdering } = useCreateOrder();
  const { toast } = useToast();
  const { data: user } = useUser();
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>("");
  const [gamepassUrl, setGamepassUrl] = useState<string>("");
  const [redeemCode, setRedeemCode] = useState("");

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
          toast({
            title: "HEIST SUCCESSFUL",
            description: `You will receive ${desiredAmount} Robux (Price set to ${requiredPrice})`,
            className: "bg-black border-2 border-primary text-white font-display",
          });
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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-16 relative">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary clip-path-comic-1 rotate-12 opacity-30 halftone-pattern" />
        <h2 className="text-6xl font-display text-foreground mb-6 text-shadow-blood transform -skew-x-12 italic dark:text-white">
          {t("home.robux_pool")}
        </h2>
        <PhantomCounter value={stats?.value || 0} />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-10 bg-primary/10 clip-path-comic-1 -z-10 halftone-pattern animate-pulse" />
          
          <PhantomCard delay={0.1} className="transform -rotate-1">
            <div className="space-y-12 p-10 bg-background relative overflow-hidden dark:bg-black border-8 border-double border-primary">
              <div className="absolute top-0 left-0 w-full h-24 bg-primary -skew-y-6 -translate-y-12 z-0" />
              
              <div className="text-center relative z-10">
                <h3 className="text-7xl font-display text-foreground mb-4 tracking-tighter italic uppercase text-shadow-blood dark:text-white">
                  ORDER ROBUX
                </h3>
              </div>

              <div className="grid gap-8 relative z-10">
                {/* Step 1: The Code */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border-4 border-primary rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors shadow-[8px_8px_0px_0px_rgba(255,0,0,0.2)]"
                >
                  <h4 className="font-display text-3xl text-primary italic mb-4 uppercase tracking-tighter">01. PHANTOM CODE</h4>
                  <input
                    type="text"
                    placeholder="PHANTOM-XXXX-XXXX"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                    className="w-full bg-background border-4 border-primary p-5 text-3xl text-foreground font-display focus:outline-none dark:bg-black dark:text-white uppercase placeholder:opacity-30"
                  />
                </motion.div>

                {/* Step 2: Gamepass */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border-4 border-primary rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors shadow-[8px_8px_0px_0px_rgba(255,0,0,0.2)]"
                >
                  <h4 className="font-display text-3xl text-primary italic mb-4 uppercase tracking-tighter">02. TARGET GAMEPASS (ID)</h4>
                  <input
                    type="text"
                    value={gamepassUrl}
                    onChange={(e) => setGamepassUrl(e.target.value)}
                    placeholder="Enter Gamepass ID or URL"
                    className="w-full bg-background border-4 border-primary p-5 text-xl text-foreground font-body focus:outline-none dark:bg-black dark:text-white placeholder:opacity-30"
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
                  className="w-full text-5xl py-12 shadow-[15px_15px_0px_0px_black] dark:shadow-[15px_15px_0px_0px_#FFFFFF] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all"
                >
                  {isOrdering ? "PROCESSING..." : "Buy robux"}
                </PhantomButton>
              </div>

              <div className="bg-primary p-4 border-4 border-black dark:border-white">
                <p className="text-xl text-black font-black text-center tracking-tighter uppercase italic">
                  MUST SET GAMEPASS PRICE TO {requiredPrice} R$ FOR VERIFICATION
                </p>
              </div>
            </div>
          </PhantomCard>
        </div>
      </div>
    </div>
  );
}
