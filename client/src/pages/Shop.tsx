import { PhantomCard } from "@/components/PhantomCard";
import { PhantomButton } from "@/components/PhantomButton";
import { PhantomCounter } from "@/components/PhantomCounter";
import { useCreateOrder } from "@/hooks/use-orders";
import { useRobuxCounter } from "@/hooks/use-stats";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";

export default function Shop() {
  const { data: stats } = useRobuxCounter();
  const { mutate: createOrder, isPending: isOrdering } = useCreateOrder();
  const { toast } = useToast();
  const { data: user } = useUser();
  const [amount, setAmount] = useState<string>("");

  const handleRequestRobux = () => {
    if (!user) {
      toast({
        title: "تم رفض الوصول",
        description: "يجب أن تكون عضواً في لصوص الفانتوم للحصول على الروبوكس.",
        variant: "destructive",
      });
      return;
    }

    const robuxAmount = parseInt(amount);
    if (isNaN(robuxAmount) || robuxAmount <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح.",
        variant: "destructive",
      });
      return;
    }

    if (robuxAmount > (stats?.value || 0)) {
      toast({
        title: "عملية فاشلة",
        description: "المبلغ المطلوب يتجاوز الروبوكس المتاح في الخزنة!",
        variant: "destructive",
      });
      return;
    }

    createOrder(robuxAmount, {
      onSuccess: () => {
        toast({
          title: "تمت العملية بنجاح",
          description: `لقد حصلت على ${robuxAmount} روبوكس بنجاح!`,
          className: "bg-black border-2 border-primary text-white font-display",
        });
        setAmount("");
        queryClient.invalidateQueries({ queryKey: ["/api/stats/robux"] });
      },
      onError: (error) => {
        toast({
          title: "فشلت العملية",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 text-right" dir="rtl">
      <div className="mb-16 relative">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary clip-path-comic-1 rotate-12 opacity-30 halftone-pattern" />
        <h2 className="text-6xl font-display text-white mb-6 text-shadow-blood transform -skew-x-12 italic"></h2>
        <PhantomCounter value={stats?.value || 0} />
      </div>

      <div className="max-w-2xl mx-auto relative">
        <div className="absolute -inset-10 bg-primary/10 clip-path-comic-1 -z-10 halftone-pattern animate-pulse" />
        <div className="absolute -inset-20 bg-black/40 clip-path-comic-2 -z-20 transform rotate-3" />
        
        <PhantomCard delay={0.1} className="transform -rotate-1">
          <div className="space-y-8 p-10 bg-black relative overflow-hidden">
            {/* Persona 5 Style Red Slash */}
            <div className="absolute top-0 left-0 w-full h-24 bg-primary -skew-y-6 -translate-y-12 z-0" />
            
            <div className="text-center relative z-10">
              <div className="absolute -top-12 -left-12 text-white text-8xl font-display opacity-10 italic transform rotate-[-25deg] pointer-events-none">STOLEN</div>
              <h3 className="text-7xl font-display text-white-p5 mb-4 tracking-tighter italic uppercase text-shadow-blood">
                BLACK MARKET
              </h3>
              <p className="text-primary font-display text-3xl italic font-bold border-y-4 border-primary py-2 inline-block">
                CONFIDENTIAL EXCHANGE
              </p>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 clip-path-comic-1 transition-all group-focus-within:bg-primary/40 -z-10" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="000"
                  className="w-full bg-background border-8 border-primary p-8 text-7xl text-center text-foreground font-display focus:shadow-[0_0_40px_rgba(255,0,25,0.6)] focus:outline-none transition-all relative z-10 italic"
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-5xl text-primary font-display z-10 animate-bounce">
                  R$
                </div>
              </div>

              <PhantomButton 
                onClick={handleRequestRobux}
                disabled={isOrdering}
                variant="primary"
                className="w-full text-5xl py-10 shadow-[15px_15px_0px_0px_#FFFFFF] hover:shadow-[20px_20px_0px_0px_#FFFFFF] transition-all"
              >
                {isOrdering ? "EXECUTING..." : "HEIST START"}
              </PhantomButton>
            </div>

            <div className="bg-white p-8 border-8 border-primary transform rotate-1 relative z-10">
              <p className="text-2xl text-black font-black text-center tracking-tighter uppercase italic">
                CAUTION: UNAUTHORIZED TRANSACTION IN PROGRESS
              </p>
            </div>
          </div>
        </PhantomCard>
      </div>
    </div>
  );
}
