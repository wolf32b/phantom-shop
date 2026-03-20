import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Link } from "wouter";
import { PhantomButton } from "@/components/PhantomButton";

interface FAQItem {
  q: string;
  a: string;
}

function FAQRow({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.07 }}
      className="border-2 border-primary/30 hover:border-primary transition-colors"
    >
      <button
        className="w-full text-left flex items-center justify-between gap-4 p-4 md:p-5 group"
        onClick={() => setOpen(!open)}
      >
        <span className="font-display text-white text-base md:text-lg italic group-hover:text-primary transition-colors">
          {item.q}
        </span>
        <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-4 text-white/70 font-body text-sm md:text-base border-t border-primary/20 pt-3 leading-relaxed">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const { t, language } = useLanguage();

  const faqs: FAQItem[] = language === "ar" ? [
    {
      q: "كيف أشتري روبوكس؟",
      a: "اذهب لصفحة الأكواد، اختر الباقة المناسبة وادفع. ستحصل على كود فانتوم. بعدها انشئ Gamepass على روبلوكس بالسعر الصحيح وقدم طلبك من صفحة المتجر."
    },
    {
      q: "ما هو كود فانتوم؟",
      a: "كود فانتوم هو كود رقمي تشتريه وتستخدمه لفتح طلب الروبوكس. كل كود له رصيد محدد من الروبوكس."
    },
    {
      q: "كيف أنشئ Gamepass على روبلوكس؟",
      a: "ادخل على موقع روبلوكس، اذهب لخبرتك (Experience)، اختر Monetization ثم Create Gamepass. اضبط السعر بنفس القيمة الموضحة في حاسبة الضريبة."
    },
    {
      q: "كم من الوقت يستغرق التحويل؟",
      a: "بعد تقديم طلبك، يقوم المشرفون بمراجعته يدوياً. عادةً يتم الموافقة خلال 24 ساعة."
    },
    {
      q: "لماذا يجب أن يكون سعر الـ Gamepass مختلفاً؟",
      a: "روبلوكس تأخذ 30% عمولة من كل عملية بيع. لذلك نحسب السعر الصحيح تلقائياً حتى تصل إليك الكمية الكاملة التي طلبتها."
    },
    {
      q: "هل يمكنني استرداد أموالي؟",
      a: "في حالة رفض الطلب، يُعاد رصيد الـ Phantom Code إليك تلقائياً. لأي مشكلة تواصل مع الإدارة."
    },
    {
      q: "ما طرق الدفع المتاحة؟",
      a: "نقبل PayPal، مدى، ميزة، Visa، Mastercard، KNET، وBenefit."
    },
    {
      q: "ماذا أفعل إذا لم يُقبل طلبي؟",
      a: "تأكد أن الـ Gamepass عام (Public) وأن سعره مطابق تماماً للحاسبة. إذا استمرت المشكلة تواصل معنا."
    },
  ] : [
    {
      q: "How do I buy Robux?",
      a: "Go to the Phantom Codes page, choose a pack and complete payment. You'll receive a Phantom Code. Then create a Gamepass on Roblox with the correct price and submit your request from the Shop."
    },
    {
      q: "What is a Phantom Code?",
      a: "A Phantom Code is a digital code you purchase that holds a Robux balance. You use it to unlock a withdrawal request."
    },
    {
      q: "How do I create a Gamepass on Roblox?",
      a: "Go to Roblox.com, open your Experience, go to Monetization → Create Gamepass. Set the price to exactly what the Tax Calculator shows."
    },
    {
      q: "How long does the transfer take?",
      a: "After submitting, admins manually review your request. Approval typically happens within 24 hours."
    },
    {
      q: "Why is the Gamepass price different from what I want to receive?",
      a: "Roblox takes a 30% cut from every sale. Our calculator automatically adjusts the price so you receive the exact Robux amount you requested."
    },
    {
      q: "Can I get a refund?",
      a: "If your order is rejected, your Phantom Code balance is automatically refunded. For any other issues, contact the admin team."
    },
    {
      q: "What payment methods are accepted?",
      a: "We accept PayPal, mada, Meeza, Visa, Mastercard, KNET, and Benefit."
    },
    {
      q: "What if my order keeps failing verification?",
      a: "Make sure your Gamepass is set to Public and the price matches the Tax Calculator exactly (no rounding). If the issue persists, contact support."
    },
  ];

  return (
    <div className="container mx-auto px-3 md:px-4 py-8 md:py-12 max-w-3xl">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-10"
      >
        <h1 className="text-4xl md:text-6xl font-display text-white italic uppercase transform -skew-x-6 text-shadow-red mb-2">
          {t("faq.title")}
        </h1>
        <div className="h-1 w-20 bg-primary mb-4" />
        <p className="text-white/50 font-body">{t("faq.subtitle")}</p>
      </motion.div>

      <div className="space-y-3">
        {faqs.map((item, i) => (
          <FAQRow key={i} item={item} index={i} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 p-6 bg-primary/10 border-2 border-primary text-center"
      >
        <p className="text-white font-body mb-4">{t("faq.still_confused")}</p>
        <Link href="/shop">
          <PhantomButton>{t("home.cta")}</PhantomButton>
        </Link>
      </motion.div>
    </div>
  );
}
