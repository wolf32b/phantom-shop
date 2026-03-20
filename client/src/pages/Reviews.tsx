import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { PhantomButton } from "@/components/PhantomButton";
import { useLanguage } from "@/lib/LanguageContext";

const WORD_LIMIT = 4;

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 28,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            width={size}
            height={size}
            className={
              star <= (hovered || value)
                ? "text-primary fill-primary"
                : "text-white/20 fill-transparent"
            }
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-black border-2 border-primary/30 hover:border-primary p-5 transition-colors group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.username)}&background=FF0019&color=fff&size=40`}
            alt={review.username}
            className="w-10 h-10 border-2 border-primary"
          />
          <div>
            <p className="font-display text-white text-lg italic tracking-tight leading-none">
              {review.username}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StarRating value={review.rating} readonly size={20} />
      </div>
      <p className="text-white/80 font-body text-base border-t border-primary/10 pt-3 italic">
        "{review.text}"
      </p>
    </motion.div>
  );
}

export default function Reviews() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { language } = useLanguage();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["/api/reviews"],
    queryFn: async () => {
      const res = await fetch("/api/reviews");
      return res.json();
    },
  });

  const { data: myOrders } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/orders");
      return res.json();
    },
  });

  const hasCompletedOrder = Array.isArray(myOrders)
    ? myOrders.some((o: any) => o.status === "approved")
    : false;

  const alreadyReviewed = Array.isArray(reviews)
    ? reviews.some((r: any) => r.userId === (user as any)?.id)
    : false;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const wordsLeft = WORD_LIMIT - wordCount;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/reviews"] });
      setRating(0);
      setText("");
      toast({
        title: language === "ar" ? "تم إرسال رأيك!" : "Review submitted!",
        description: language === "ar" ? "شكراً لمشاركة رأيك." : "Thanks for sharing your feedback.",
      });
    },
    onError: (e: any) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const avgRating =
    Array.isArray(reviews) && reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="container mx-auto px-3 md:px-4 py-8 md:py-12 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-10"
      >
        <h1 className="text-4xl md:text-6xl font-display text-white italic uppercase transform -skew-x-6 text-shadow-red mb-2">
          {language === "ar" ? "آراء العملاء" : "REVIEWS"}
        </h1>
        <div className="h-1 w-20 bg-primary mb-4" />
        <p className="text-white/50 font-body">
          {language === "ar"
            ? "آراء حقيقية من عملائنا الذين أتمموا عملياتهم"
            : "Real feedback from customers who completed their orders"}
        </p>
      </motion.div>

      {/* Stats bar */}
      {reviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-5 bg-primary/10 border-2 border-primary flex flex-col sm:flex-row items-center gap-4"
        >
          <div className="text-center sm:text-left">
            <p className="text-5xl font-display text-primary italic">{avgRating.toFixed(1)}</p>
            <StarRating value={Math.round(avgRating)} readonly size={22} />
            <p className="text-white/50 text-sm mt-1">
              {language === "ar" ? `${reviews.length} رأي` : `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="hidden sm:block w-px h-16 bg-primary/30 mx-4" />
          <div className="flex-1 w-full">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r: any) => r.rating === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-white/50 text-xs w-2">{star}</span>
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  <div className="flex-1 h-2 bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <span className="text-white/40 text-xs w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Submit form */}
      <AnimatePresence>
        {user && hasCompletedOrder && !alreadyReviewed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-10 p-6 bg-black border-2 border-primary shadow-[4px_4px_0px_0px_#FF0019]"
          >
            <h2 className="font-display text-2xl text-white italic mb-4">
              {language === "ar" ? "شارك رأيك" : "SHARE YOUR REVIEW"}
            </h2>

            <div className="mb-4">
              <p className="text-white/60 text-sm mb-2">
                {language === "ar" ? "تقييمك" : "Your Rating"}
              </p>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <p className="text-white/60 text-sm">
                  {language === "ar" ? "رأيك (حتى 4 كلمات)" : "Your Review (up to 4 words)"}
                </p>
                <span className={`text-xs font-bold ${wordsLeft < 0 ? "text-red-400" : "text-white/40"}`}>
                  {wordCount}/{WORD_LIMIT}
                </span>
              </div>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={language === "ar" ? "مثال: خدمة ممتازة وسريعة" : "e.g. Fast and reliable service"}
                className="w-full bg-white/5 border-2 border-white/20 focus:border-primary text-white font-body p-3 outline-none transition-colors"
                maxLength={80}
              />
              {wordsLeft < 0 && (
                <p className="text-red-400 text-xs mt-1">
                  {language === "ar" ? "تجاوزت الحد الأقصى للكلمات" : "Exceeded word limit"}
                </p>
              )}
            </div>

            <PhantomButton
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || rating === 0 || text.trim() === "" || wordsLeft < 0}
            >
              {mutation.isPending
                ? (language === "ar" ? "جاري الإرسال..." : "Submitting...")
                : (language === "ar" ? "إرسال الرأي" : "SUBMIT REVIEW")}
            </PhantomButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info banners */}
      {user && !hasCompletedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 bg-white/5 border-2 border-white/20 text-white/60 font-body text-sm"
        >
          {language === "ar"
            ? "يجب إتمام عملية شراء واحدة على الأقل لتتمكن من إضافة رأيك."
            : "You need to complete at least one order to leave a review."}
        </motion.div>
      )}

      {user && alreadyReviewed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 bg-primary/10 border-2 border-primary text-white/70 font-body text-sm"
        >
          {language === "ar"
            ? "لقد أضفت رأيك بالفعل. شكراً لك!"
            : "You have already submitted your review. Thank you!"}
        </motion.div>
      )}

      {!user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 bg-white/5 border-2 border-white/20 text-white/60 font-body text-sm"
        >
          {language === "ar"
            ? "سجّل دخول وأتمم عملية شراء لتتمكن من إضافة رأيك."
            : "Login and complete an order to leave a review."}
        </motion.div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="text-white/40 text-center py-16 font-body">
          {language === "ar" ? "جاري التحميل..." : "Loading..."}
        </div>
      ) : reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 border-2 border-white/10"
        >
          <Star className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 font-body italic">
            {language === "ar" ? "لا توجد آراء بعد. كن أول من يشارك!" : "No reviews yet. Be the first to share!"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any, i: number) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
