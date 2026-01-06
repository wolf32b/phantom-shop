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
      <div className="mb-16">
        <h2 className="text-4xl font-display text-primary mb-4">إجمالي الروبوكس المتاح</h2>
        <PhantomCounter value={stats?.value || 0} />
      </div>

      <div className="max-w-2xl mx-auto">
        <PhantomCard delay={0.1}>
          <div className="space-y-8 p-6">
            <div className="text-center">
              <h3 className="text-3xl font-display text-white mb-2 red-shimmer">
                اطلب الروبوكس الخاص بك
              </h3>
              <p className="text-white/60 font-body">
                أدخل كمية الروبوكس التي تريد تحويلها إلى حسابك في روبلوكس
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black border-2 border-primary/30 p-4 text-4xl text-center text-primary font-display focus:border-primary focus:outline-none transition-colors"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-primary/50 font-display">
                  R$
                </div>
              </div>

              <PhantomButton 
                onClick={handleRequestRobux}
                disabled={isOrdering}
                className="w-full text-2xl h-16"
              >
                {isOrdering ? "جاري المعالجة..." : "سرقة الروبوكس"}
              </PhantomButton>
            </div>

            <div className="bg-primary/5 p-4 border border-primary/20 text-center">
              <p className="text-sm text-primary/80">
                ملاحظة: يمكنك طلب أي مبلغ طالما أنه أقل من الروبوكس المتاح في الخزنة العامة.
              </p>
            </div>
          </div>
        </PhantomCard>
      </div>
    </div>
  );
}
