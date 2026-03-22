import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Copy, CheckCircle2, Clock, Banknote, Smartphone, Zap, Shield, Star, CreditCard } from "lucide-react";

type PaymentInfo = {
  bankName: string;
  iban: string;
  accountName: string;
  stcPay: string | null;
  phonePay: string | null;
};

type PurchaseResult = {
  code: string;
  amount: number;
  price: number;
  email: string;
  paymentInfo: PaymentInfo;
};

const PACKAGES = [
  { amount: 1000,  price: 8  },
  { amount: 2000,  price: 14 },
  { amount: 3000,  price: 21 },
  { amount: 4000,  price: 26 },
  { amount: 5000,  price: 32 },
  { amount: 6000,  price: 37 },
  { amount: 7000,  price: 42 },
  { amount: 8000,  price: 47 },
  { amount: 9000,  price: 53 },
  { amount: 10000, price: 59 },
];

const POPULAR = [5000, 10000];
const BEST_VALUE = 10000;

export default function Codes() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const ar = language === "ar";

  const [email, setEmail]           = useState("");
  const [buyerName, setBuyerName]   = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [result, setResult]         = useState<PurchaseResult | null>(null);
  const [copied, setCopied]         = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleBuy = async (amount: number) => {
    if (!email.trim()) {
      toast({ title: ar ? "خطأ" : "Error", description: ar ? "أدخل بريدك الإلكتروني" : "Please enter your email", variant: "destructive" });
      return;
    }
    if (!buyerName.trim()) {
      toast({ title: ar ? "خطأ" : "Error", description: ar ? "أدخل اسمك الكامل" : "Please enter your name", variant: "destructive" });
      return;
    }
    setPendingAmount(amount);
    setIsPurchasing(true);
    try {
      const res = await apiRequest("POST", "/api/codes/purchase", { amount, email, buyerName });
      const data = await res.json();
      setResult(data);
    } catch {
      toast({ title: ar ? "خطأ" : "Error", description: ar ? "فشلت العملية، حاول مجدداً" : "Purchase failed. Try again.", variant: "destructive" });
    } finally {
      setIsPurchasing(false);
      setPendingAmount(null);
    }
  };

  /* ─── Success / Payment instructions screen ─── */
  if (result) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 border-4 border-foreground mb-5 shadow-[6px_6px_0px_0px_hsl(var(--foreground))]">
              <Clock className="text-black" size={36} />
            </div>
            <h1 className="text-4xl md:text-5xl font-display text-foreground italic uppercase -skew-x-3 mb-3">
              {ar ? "في انتظار" : "AWAITING"}{" "}
              <span className="text-primary">{ar ? "التحويل" : "TRANSFER"}</span>
            </h1>
            <p className="text-foreground/60 font-body text-lg">
              {ar
                ? "كودك جاهز — سيُفعَّل بعد مراجعة الأدمن للتحويل"
                : "Your code is ready — it activates after admin verifies payment"}
            </p>
          </div>

          {/* Code box */}
          <div className="bg-background border-4 border-yellow-400 p-6 mb-5 shadow-[8px_8px_0px_0px_#facc15]">
            <p className="text-yellow-500 font-display text-xs uppercase tracking-widest mb-3">
              {ar ? "كودك المحجوز" : "YOUR RESERVED CODE"}
            </p>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="font-display text-2xl md:text-3xl text-foreground tracking-widest break-all">
                {result.code}
              </span>
              <button
                onClick={() => copy(result.code, "code")}
                className="flex items-center gap-2 px-5 py-2 border-4 border-yellow-400 text-yellow-500 font-display text-sm hover:bg-yellow-400 hover:text-black transition-all shrink-0"
              >
                {copied === "code" ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied === "code" ? (ar ? "تم" : "Copied") : (ar ? "نسخ" : "Copy")}
              </button>
            </div>
            <p className="mt-4 text-foreground/50 text-sm font-body">
              {result.amount.toLocaleString()} Robux &nbsp;·&nbsp; ${result.price} &nbsp;·&nbsp; {result.email}
            </p>
          </div>

          {/* Payment methods */}
          <div className="bg-background border-4 border-primary p-6 mb-5 shadow-[8px_8px_0px_0px_hsl(var(--foreground))]">
            <h2 className="font-display text-2xl text-foreground uppercase italic flex items-center gap-3 mb-6">
              <Banknote className="text-primary shrink-0" size={24} />
              {ar ? "طرق الدفع" : "PAYMENT METHODS"}
            </h2>

            {/* Bank Transfer */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="text-primary" size={16} />
                <span className="font-display text-sm uppercase tracking-widest text-foreground/60">
                  {ar ? "تحويل بنكي" : "Bank Transfer"}
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: ar ? "اسم البنك" : "Bank Name",          value: result.paymentInfo.bankName,    key: "bank" },
                  { label: ar ? "رقم الآيبان" : "IBAN Number",      value: result.paymentInfo.iban,        key: "iban" },
                  { label: ar ? "اسم صاحب الحساب" : "Account Name", value: result.paymentInfo.accountName, key: "acname" },
                ].map(({ label, value, key }) => (
                  <div key={key} className="flex items-center justify-between bg-foreground/5 border border-foreground/10 p-4 gap-3">
                    <div className="min-w-0">
                      <p className="text-foreground/40 text-xs font-body uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-foreground font-display text-lg break-all">{value}</p>
                    </div>
                    <button onClick={() => copy(value, key)} className="text-primary hover:text-foreground transition-colors shrink-0">
                      {copied === key ? <CheckCircle2 size={22} /> : <Copy size={22} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Apple Pay / Google Pay / STC Pay */}
            {result.paymentInfo.phonePay && (
              <div className="mt-4 pt-4 border-t-2 border-foreground/10">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="text-primary" size={16} />
                  <span className="font-display text-sm uppercase tracking-widest text-foreground/60">
                    Apple Pay &nbsp;·&nbsp; Google Pay &nbsp;·&nbsp; STC Pay
                  </span>
                </div>
                <div className="flex items-center justify-between bg-foreground/5 border border-primary/30 p-4 gap-3">
                  <div>
                    <p className="text-primary text-xs font-body uppercase tracking-wider mb-1">
                      {ar ? "رقم الجوال" : "Mobile Number"}
                    </p>
                    <p className="text-foreground font-display text-lg tracking-widest">{result.paymentInfo.phonePay}</p>
                  </div>
                  <button onClick={() => copy(result.paymentInfo.phonePay!, "phone")} className="text-primary hover:text-foreground transition-colors">
                    {copied === "phone" ? <CheckCircle2 size={22} /> : <Copy size={22} />}
                  </button>
                </div>
              </div>
            )}

            {/* STC Pay (standalone if no phonePay) */}
            {result.paymentInfo.stcPay && !result.paymentInfo.phonePay && (
              <div className="mt-4 pt-4 border-t-2 border-foreground/10">
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 p-4 gap-3">
                  <div>
                    <p className="text-green-500 text-xs font-body uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Smartphone size={12} /> STC Pay
                    </p>
                    <p className="text-foreground font-display text-lg">{result.paymentInfo.stcPay}</p>
                  </div>
                  <button onClick={() => copy(result.paymentInfo.stcPay!, "stc")} className="text-green-500 hover:text-foreground transition-colors">
                    {copied === "stc" ? <CheckCircle2 size={22} /> : <Copy size={22} />}
                  </button>
                </div>
              </div>
            )}

            <div className="border-t-2 border-foreground/10 mt-5 pt-5 flex items-center justify-between">
              <span className="font-display text-lg text-foreground uppercase">
                {ar ? "المبلغ المطلوب" : "AMOUNT DUE"}
              </span>
              <span className="font-display text-4xl text-primary font-bold">${result.price}</span>
            </div>
          </div>

          {/* Important note */}
          <div className="bg-yellow-400/10 border-2 border-yellow-400 p-5 mb-6 text-foreground text-sm font-body space-y-2">
            <p className="font-bold text-yellow-500 uppercase font-display">
              ⚠️ {ar ? "مهم جداً" : "IMPORTANT"}
            </p>
            <p>
              {ar
                ? <>• اكتب كودك <strong className="text-primary">{result.code}</strong> في ملاحظة التحويل</>
                : <>• Write your code <strong className="text-primary">{result.code}</strong> in the transfer note</>}
            </p>
            <p>{ar ? "• بعد التحويل انتظر تأكيد الأدمن (عادةً خلال ساعات قليلة)" : "• After transferring, await admin confirmation (usually within a few hours)"}</p>
            <p>{ar ? "• سيُفعَّل الكود تلقائياً بعد التحقق" : "• The code will be activated automatically after verification"}</p>
          </div>

          <button
            onClick={() => { setResult(null); setEmail(""); setBuyerName(""); }}
            className="w-full border-4 border-foreground/20 text-foreground/40 font-display text-lg py-4 hover:border-foreground/40 hover:text-foreground/60 transition-all italic uppercase"
          >
            {ar ? "شراء كود آخر" : "Buy another code"}
          </button>
        </motion.div>
      </div>
    );
  }

  /* ─── Main page ─── */
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative border-b-4 border-primary overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <div className="container mx-auto px-4 py-14 md:py-20">
          <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="border-l-8 border-primary pl-6">
            <h1 className="text-5xl md:text-8xl font-display text-foreground italic uppercase -skew-x-6 leading-none">
              {ar ? "أكواد" : "PHANTOM"}{" "}
              <span className="text-primary">{ar ? "فانتوم" : "CODES"}</span>
            </h1>
            <p className="text-foreground/60 font-body text-lg mt-3 max-w-lg">
              {ar
                ? "اشترِ كودك، حوّل المبلغ، واستلم الروبوكس مباشرة في حسابك."
                : "Purchase your code, transfer the amount, and receive Robux directly in your account."}
            </p>
          </motion.div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { icon: <Zap size={14} />, text: ar ? "تفعيل سريع" : "Fast Activation" },
              { icon: <Shield size={14} />, text: ar ? "آمن 100%" : "100% Secure" },
              { icon: <Banknote size={14} />, text: ar ? "تحويل بنكي / STC Pay" : "Bank Transfer / STC Pay" },
            ].map((b, i) => (
              <span key={i} className="flex items-center gap-2 px-4 py-2 border-2 border-foreground/20 text-foreground/60 font-display text-xs uppercase tracking-wider">
                {b.icon} {b.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Info form */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-2xl mx-auto mb-12">
          <div className="bg-background border-4 border-primary shadow-[8px_8px_0px_0px_hsl(var(--foreground))] p-8">
            <h2 className="font-display text-2xl text-foreground uppercase italic mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary text-white flex items-center justify-center font-display text-sm font-bold shrink-0">1</span>
              {ar ? "أدخل بياناتك أولاً" : "ENTER YOUR INFO FIRST"}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-primary font-display text-xs uppercase tracking-widest mb-2">
                  {ar ? "اسمك الكامل" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  placeholder={ar ? "لتسهيل التعرف على تحويلك" : "To identify your transfer"}
                  className="w-full bg-background border-4 border-foreground/20 focus:border-primary text-foreground px-4 py-3 font-body text-base focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-primary font-display text-xs uppercase tracking-widest mb-2">
                  {ar ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={ar ? "بريدك الإلكتروني" : "your@email.com"}
                  className="w-full bg-background border-4 border-foreground/20 focus:border-primary text-foreground px-4 py-3 font-body text-base focus:outline-none transition-colors"
                />
              </div>
            </div>
            <p className="mt-3 text-foreground/40 text-sm font-body">
              {ar ? "📧 تأكيد الكود سيُرسل لهذا البريد" : "📧 Code confirmation will be sent to this email"}
            </p>
          </div>
        </motion.div>

        {/* Packages heading */}
        <div className="flex items-center gap-4 mb-8 max-w-6xl mx-auto">
          <span className="w-8 h-8 bg-primary text-white flex items-center justify-center font-display text-sm font-bold shrink-0">2</span>
          <h2 className="font-display text-3xl text-foreground uppercase italic">
            {ar ? "اختر باقتك" : "CHOOSE YOUR PACKAGE"}
          </h2>
        </div>

        {/* Packages grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {PACKAGES.map(({ amount, price }, i) => {
            const isPopular   = POPULAR.includes(amount);
            const isBestValue = amount === BEST_VALUE;
            const isLoading   = isPurchasing && pendingAmount === amount;

            return (
              <motion.div
                key={amount}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05, ease: "backOut" }}
                className="relative"
              >
                {/* Badge */}
                {isBestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-primary px-3 py-0.5 font-display text-white text-[10px] uppercase tracking-widest whitespace-nowrap border-2 border-foreground">
                    {ar ? "الأفضل قيمة" : "BEST VALUE"}
                  </div>
                )}
                {isPopular && !isBestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-yellow-400 px-3 py-0.5 font-display text-black text-[10px] uppercase tracking-widest whitespace-nowrap border-2 border-foreground">
                    {ar ? "الأكثر طلباً" : "POPULAR"}
                  </div>
                )}

                <button
                  onClick={() => handleBuy(amount)}
                  disabled={isPurchasing}
                  className={`
                    w-full group relative bg-background border-4 p-5 text-center transition-all duration-200
                    hover:shadow-[6px_6px_0px_0px_hsl(var(--primary))] hover:-translate-y-0.5
                    active:translate-y-0 active:shadow-none focus:outline-none
                    ${isBestValue
                      ? "border-primary shadow-[4px_4px_0px_0px_hsl(var(--primary))]"
                      : isPopular
                        ? "border-yellow-400 shadow-[4px_4px_0px_0px_#facc15]"
                        : "border-foreground/30 shadow-[4px_4px_0px_0px_hsl(var(--foreground)/0.15)]"
                    }
                    ${isPurchasing && !isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {/* Robux amount */}
                  <div className={`font-display text-2xl md:text-3xl italic mb-1 ${isBestValue ? "text-primary" : isPopular ? "text-yellow-500" : "text-foreground"}`}>
                    {(amount / 1000).toFixed(0)}K
                    <span className="text-sm not-italic ml-1 text-foreground/50">R$</span>
                  </div>

                  <div className="text-foreground/40 font-body text-xs mb-3">
                    {amount.toLocaleString()} Robux
                  </div>

                  {/* Price */}
                  <div className="font-display text-3xl text-foreground font-bold mb-4">
                    ${price}
                  </div>

                  {/* Buy button */}
                  <div className={`
                    w-full py-2 font-display text-sm uppercase tracking-wider transition-all
                    ${isBestValue
                      ? "bg-primary text-white group-hover:bg-primary/90"
                      : isPopular
                        ? "bg-yellow-400 text-black group-hover:bg-yellow-300"
                        : "bg-foreground/10 text-foreground group-hover:bg-foreground/20"
                    }
                  `}>
                    {isLoading
                      ? (ar ? "جاري..." : "Loading...")
                      : (ar ? "اشتري الآن" : "BUY NOW")}
                  </div>

                  {isBestValue && (
                    <Star className="absolute top-3 right-3 text-primary" size={14} fill="currentColor" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto mt-12 p-6 border-2 border-foreground/10 text-center"
        >
          <p className="text-foreground/50 font-body text-sm">
            {ar
              ? "💳 الدفع عن طريق تحويل بنكي أو STC Pay · ⚡ يتفعّل الكود خلال ساعات قليلة"
              : "💳 Payment via bank transfer or STC Pay · ⚡ Code activates within a few hours"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
