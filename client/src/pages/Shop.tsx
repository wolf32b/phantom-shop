import { PhantomCard } from "@/components/PhantomCard";
import { PhantomButton } from "@/components/PhantomButton";
import { PhantomCounter } from "@/components/PhantomCounter";
import { useCreateOrder } from "@/hooks/use-orders";
import { useRobuxCounter } from "@/hooks/use-stats";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/LanguageContext";

export default function Shop() {
  const { data: stats } = useRobuxCounter();
  const { mutate: createOrder, isPending: isOrdering } = useCreateOrder();
  const { toast } = useToast();
  const { data: user } = useUser();
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>("");
  const [gamepassUrl, setGamepassUrl] = useState<string>("");
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async () => {
    if (!redeemCode || !redeemAmount) return;
    setIsRedeeming(true);
    try {
      const res = await apiRequest("POST", "/api/codes/redeem", { 
        code: redeemCode, 
        amount: parseInt(redeemAmount) 
      });
      if (!res.ok) throw new Error("Redeem failed");
      
      toast({ title: "Redeemed!", description: "Funds added to heist pool" });
      setRedeemCode("");
      setRedeemAmount("");
    } catch (err) {
      toast({ title: "Error", description: "Invalid code or balance", variant: "destructive" });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleRequestRobux = () => {
    if (!user) {
      toast({
        title: t("common.error"),
        description: t("shop.insufficient"),
        variant: "destructive",
      });
      return;
    }

    const robuxAmount = parseInt(amount);
    if (isNaN(robuxAmount) || robuxAmount <= 0) {
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    if (!gamepassUrl.includes("roblox.com/game-pass/") && !gamepassUrl.match(/\d+/)) {
      toast({
        title: t("common.error"),
        description: t("shop.gamepass_help"),
        variant: "destructive",
      });
      return;
    }

    if (robuxAmount > (stats?.value || 0)) {
      toast({
        title: t("common.error"),
        description: t("shop.insufficient"),
        variant: "destructive",
      });
      return;
    }

    createOrder({ amount: robuxAmount, gamepassUrl }, {
      onSuccess: () => {
        toast({
          title: t("common.success"),
          description: t("common.success"),
          className: "bg-black border-2 border-primary text-white font-display",
        });
        setAmount("");
        setGamepassUrl("");
      },
      onError: (error) => {
        toast({
          title: t("common.error"),
          description: error.message,
          variant: "destructive",
        });
      },
    });
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

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Purchase Card */}
        <div className="relative">
          <div className="absolute -inset-10 bg-primary/10 clip-path-comic-1 -z-10 halftone-pattern animate-pulse" />
          <div className="absolute -inset-20 bg-background/40 clip-path-comic-2 -z-20 transform rotate-3 dark:bg-black/40" />
          
          <PhantomCard delay={0.1} className="transform -rotate-1">
            <div className="space-y-8 p-10 bg-background relative overflow-hidden dark:bg-black border-8 border-double border-primary">
              {/* Persona 5 Style Red Slash */}
              <div className="absolute top-0 left-0 w-full h-24 bg-primary -skew-y-6 -translate-y-12 z-0" />
              
              <div className="text-center relative z-10">
                <div className="absolute -top-12 -left-12 text-foreground text-8xl font-display opacity-10 italic transform rotate-[-25deg] pointer-events-none dark:text-white">STOLEN</div>
                <h3 className="text-7xl font-display text-foreground mb-4 tracking-tighter italic uppercase text-shadow-blood dark:text-white">
                  {t("shop.title")}
                </h3>
                <p className="text-primary font-display text-3xl italic font-bold border-y-4 border-primary py-2 inline-block">
                  {t("shop.subtitle")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 relative z-10">
                {/* Left Side: Gamepass Request */}
                <div className="space-y-6 p-6 border-4 border-primary/30 rounded-lg bg-primary/5">
                  <h4 className="font-display text-3xl text-primary italic uppercase border-b-4 border-primary pb-2">Direct Heist</h4>
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-primary/20 clip-path-comic-1 transition-all group-focus-within:bg-primary/40 -z-10" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="000"
                        className="w-full bg-background border-4 border-primary p-4 text-5xl text-center text-foreground font-display focus:shadow-[0_0_20px_rgba(255,0,25,0.4)] focus:outline-none transition-all relative z-10 italic dark:bg-black dark:text-white"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-primary font-display z-10">
                        R$
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-2 bg-primary/20 clip-path-comic-1 transition-all group-focus-within:bg-primary/40 -z-10" />
                      <input
                        type="text"
                        value={gamepassUrl}
                        onChange={(e) => setGamepassUrl(e.target.value)}
                        placeholder={t("shop.gamepass_placeholder")}
                        className="w-full bg-background border-4 border-primary p-4 text-xl text-foreground font-body focus:shadow-[0_0_20px_rgba(255,0,25,0.4)] focus:outline-none transition-all relative z-10 dark:bg-black dark:text-white"
                      />
                      <p className="text-xs text-primary mt-1 font-display italic">
                        {t("shop.gamepass_help")}
                      </p>
                    </div>

                    <PhantomButton 
                      onClick={handleRequestRobux}
                      disabled={isOrdering}
                      variant="primary"
                      className="w-full text-4xl py-8 shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_#FFFFFF] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      {isOrdering ? t("common.loading") : t("shop.buy")}
                    </PhantomButton>
                  </div>
                </div>

                {/* Right Side: Code Redemption */}
                <div className="space-y-6 p-6 border-4 border-primary/30 rounded-lg bg-primary/5">
                  <h4 className="font-display text-3xl text-primary italic uppercase border-b-4 border-primary pb-2">Redeem Code</h4>
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-primary/20 clip-path-comic-1 -z-10" />
                      <input
                        type="text"
                        placeholder="PHANTOM-XXXX"
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value)}
                        className="w-full bg-background border-4 border-primary p-4 text-2xl text-center text-foreground font-display focus:shadow-[0_0_20px_rgba(255,0,25,0.4)] focus:outline-none transition-all relative z-10 italic dark:bg-black dark:text-white"
                      />
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-primary/20 clip-path-comic-1 -z-10" />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(e.target.value)}
                        className="w-full bg-background border-4 border-primary p-4 text-2xl text-center text-foreground font-display focus:shadow-[0_0_20px_rgba(255,0,25,0.4)] focus:outline-none transition-all relative z-10 italic dark:bg-black dark:text-white"
                      />
                    </div>

                    <PhantomButton 
                      className="w-full text-4xl py-8 shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_#FFFFFF] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" 
                      onClick={handleRedeem} 
                      disabled={isRedeeming}
                    >
                      {isRedeeming ? "REDEEMING..." : "ACTIVATE"}
                    </PhantomButton>
                  </div>
                </div>
              </div>

              <div className="bg-foreground p-8 border-8 border-primary transform rotate-1 relative z-10 dark:bg-white">
                <p className="text-2xl text-background font-black text-center tracking-tighter uppercase italic dark:text-black">
                  CAUTION: BLACK MARKET TRADING IS MONITORED BY THE PHANTOM THIEVES
                </p>
              </div>
            </div>
          </PhantomCard>
        </div>
      </div>
    </div>
  );
}
