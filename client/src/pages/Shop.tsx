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
        <h2 className="text-6xl font-display text-white mb-6 text-shadow-blood transform -skew-x-12 italic">إجمالي الروبوكس المتاح</h2>
        <PhantomCounter value={stats?.value || 0} />
      </div>

      <div className="max-w-2xl mx-auto relative">
        <div className="absolute -inset-4 bg-secondary/10 clip-path-comic-2 -z-10 halftone-pattern" />
        <PhantomCard delay={0.1}>
          <div className="space-y-8 p-10">
            <div className="text-center relative">
              <div className="absolute -top-6 -left-6 text-primary text-7xl font-display opacity-20 italic transform rotate-[-15deg]">THE PHANTOM</div>
              <h3 className="text-6xl font-display text-white mb-4 gold-shimmer tracking-tighter italic">
                اطلب الروبوكس الخاص بك
              </h3>
              <p className="text-white font-body text-2xl italic">
                أدخل كمية الروبوكس التي تريد تحويلها إلى حسابك في روبلوكس
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-2 bg-secondary/20 clip-path-comic-1 transition-all group-focus-within:bg-secondary/40" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="000"
                  className="w-full bg-black border-4 border-secondary p-6 text-6xl text-center text-secondary font-display focus:shadow-[0_0_20px_rgba(255,215,0,0.6)] focus:outline-none transition-all relative z-10"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-4xl text-white font-display z-10">
                  R$
                </div>
              </div>

              <PhantomButton 
                onClick={handleRequestRobux}
                disabled={isOrdering}
                className="w-full text-4xl py-8 shadow-[10px_10px_0px_0px_#FF0019] hover:shadow-[14px_14px_0px_0px_#FF0019]"
              >
                {isOrdering ? "جاري المعالجة..." : "سرقة الروبوكس"}
              </PhantomButton>
            </div>

            <div className="bg-secondary p-6 border-4 border-black clip-path-comic-1 transform rotate-2">
              <p className="text-xl text-black font-bold text-center tracking-tight uppercase italic">
                Eventful days at School!
              </p>
            </div>
          </div>
        </PhantomCard>
      </div>
    </div>
  );
}
