import { motion } from "framer-motion";
import { PhantomCard } from "@/components/PhantomCard";
import { PhantomButton } from "@/components/PhantomButton";
import { useLanguage } from "@/lib/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Codes() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);

  const purchaseOptions = [
    { amount: 1000, price: "10.00" },
    { amount: 2000, price: "19.00" },
    { amount: 5000, price: "45.00" },
  ];

  const handlePurchase = async (amount: number) => {
    if (!email) {
      toast({ title: t("common.error"), description: "Please enter your email", variant: "destructive" });
      return;
    }
    setIsPurchasing(true);
    try {
      const res = await apiRequest("POST", "/api/codes/purchase", { amount, email });
      const data = await res.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast({ 
          title: "Purchase Successful", 
          description: `Code ${data.code} has been sent to ${email}`,
          className: "bg-black border-2 border-primary text-white font-display"
        });
      }
    } catch (err) {
      toast({ title: t("common.error"), description: "Purchase failed", variant: "destructive" });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-6xl font-display text-foreground mb-12 text-shadow-blood transform -skew-x-12 italic dark:text-white">
        PHANTOM CODES
      </h2>

      <div className="max-w-xl mx-auto mb-12">
        <PhantomCard>
          <div className="p-8 space-y-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-background border-4 border-primary p-4 text-xl text-foreground font-body focus:outline-none dark:bg-black dark:text-white"
            />
            <p className="text-primary italic text-sm">Codes will be delivered to this email.</p>
          </div>
        </PhantomCard>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {purchaseOptions.map((opt, i) => (
          <PhantomCard key={i} delay={i * 0.1}>
            <div className="p-8 text-center space-y-4">
              <div className="text-4xl font-display text-primary italic">{opt.amount} R$</div>
              <div className="text-2xl font-body text-foreground dark:text-white">${opt.price}</div>
              <PhantomButton 
                className="w-full" 
                onClick={() => handlePurchase(opt.amount)}
                disabled={isPurchasing}
              >
                BUY NOW
              </PhantomButton>
            </div>
          </PhantomCard>
        ))}
      </div>
    </div>
  );
}
