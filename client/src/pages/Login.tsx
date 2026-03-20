import { motion } from "framer-motion";
import { PhantomButton } from "@/components/PhantomButton";
import { VerifyEmail } from "./VerifyEmail";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/LanguageContext";

type AuthStep = "login" | "register" | "verify-email";

interface Captcha { id: string; question: string; }

export default function Login() {
  const { data: user } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [step, setStep] = useState<AuthStep>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUserId, setPendingUserId] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  // CAPTCHA state
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  useEffect(() => {
    if (user) setLocation("/");
  }, [user, setLocation]);

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaAnswer("");
    try {
      const res = await fetch("/api/auth/captcha");
      const data = await res.json();
      setCaptcha(data);
    } catch {
      setCaptcha(null);
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  // Load CAPTCHA when switching to register step
  useEffect(() => {
    if (step === "register") {
      fetchCaptcha();
    } else {
      setCaptcha(null);
      setCaptchaAnswer("");
    }
  }, [step, fetchCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (step === "login") {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          // If email not verified, go to verify step
          if (response.status === 403 && data.needsVerification) {
            setPendingUserId(data.userId);
            setPendingEmail(email);
            setStep("verify-email");
            toast({
              title: "تحقق من إيميلك",
              description: "أرسلنا لك رمز التحقق — تحقق من بريدك الإلكتروني",
              className: "bg-black border-2 border-primary text-white font-display",
            });
            return;
          }
          toast({
            title: t("common.error"),
            description: data.message || "Authentication failed",
            variant: "destructive",
          });
          return;
        }

        await queryClient.resetQueries({ queryKey: ["/api/user"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });

        toast({
          title: t("common.success"),
          description: `${data.user?.username || username}`,
          className: "bg-black border-2 border-primary text-white font-display",
        });

        setTimeout(() => setLocation("/"), 500);

      } else if (step === "register") {
        if (!captcha) {
          toast({ title: t("common.error"), description: "يرجى انتظار تحميل سؤال التحقق", variant: "destructive" });
          return;
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            captchaId: captcha.id,
            captchaAnswer: parseInt(captchaAnswer),
          }),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          toast({
            title: t("common.error"),
            description: data.message || "Registration failed",
            variant: "destructive",
          });
          // Refresh captcha on failure
          fetchCaptcha();
          return;
        }

        // Redirect to email verification step
        setPendingUserId(data.userId);
        setPendingEmail(data.email || email);
        setStep("verify-email");

        toast({
          title: "تحقق من إيميلك 📧",
          description: "أرسلنا رمز التحقق على بريدك الإلكتروني",
          className: "bg-black border-2 border-primary text-white font-display",
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "verify-email") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <VerifyEmail
          userId={pendingUserId}
          email={pendingEmail}
          onVerified={async () => {
            await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            toast({
              title: t("common.success"),
              description: t("auth.verify"),
              className: "bg-black border-2 border-primary text-white font-display",
            });
            setTimeout(() => setLocation("/"), 1000);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-background border-4 border-primary p-8 relative overflow-hidden shadow-[10px_10px_0px_0px_black] dark:shadow-[10px_10px_0px_0px_white]"
      >
        <div className="absolute top-0 left-0 w-full h-4 bg-primary" />
        <div className="absolute bottom-0 right-0 w-full h-4 bg-primary" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-20 h-20 bg-primary mx-auto mb-6 flex items-center justify-center transform rotate-3 shadow-[6px_6px_0px_0px_#fff] border-4 border-white">
            <span className="font-display text-4xl text-black font-bold italic">R</span>
          </div>
          <h1 className="text-6xl font-display text-white-p5 mb-3 transform -skew-x-6 italic uppercase">
            {step === "login" ? t("auth.infiltrate") : t("auth.recruit")}
          </h1>
          <p className="text-primary font-body text-lg font-bold italic">
            {step === "login" ? t("auth.enter_market") : t("auth.join_thieves")}
          </p>
        </div>

        <div className="mb-6 relative z-10">
          <PhantomButton
            type="button"
            onClick={() => {
              toast({ title: t("auth.redirecting"), description: t("auth.google_redirect") });
              window.location.href = "/api/login";
            }}
            className="w-full text-xl py-4 shadow-[8px_8px_0px_0px_#fff]"
          >
            {t("auth.google_btn")}
          </PhantomButton>
          <div className="text-center text-white/50 font-body mt-3 italic">{t("auth.or_codename")}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-white-p5 font-display text-sm uppercase tracking-widest mb-2">
              {t("auth.codename")}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="phantom_user"
              className="w-full bg-background border-4 border-primary text-foreground px-4 py-3 font-display text-lg focus:outline-none focus:shadow-[0_0_20px_rgba(255,0,25,0.6)] transition-all italic uppercase"
              required
              disabled={isLoading}
            />
          </div>

          {step === "register" && (
            <div>
              <label className="block text-white-p5 font-display text-sm uppercase tracking-widest mb-2">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-background border-4 border-primary text-foreground px-4 py-3 font-display text-lg focus:outline-none focus:shadow-[0_0_20px_rgba(255,0,25,0.6)] transition-all italic"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-white-p5 font-display text-sm uppercase tracking-widest mb-2">
              {t("auth.passphrase")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border-4 border-primary text-foreground px-4 py-3 font-display text-lg focus:outline-none focus:shadow-[0_0_20px_rgba(255,0,25,0.6)] transition-all italic"
              required
              disabled={isLoading}
            />
          </div>

          {/* CAPTCHA — only shown during registration */}
          {step === "register" && (
            <div className="border-2 border-primary/40 bg-black/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-primary font-display text-xs uppercase tracking-widest font-bold">
                  تحقق: لست روبوت
                </span>
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  disabled={captchaLoading}
                  className="text-white/40 hover:text-primary text-xs font-display uppercase tracking-wider transition-colors"
                >
                  ↻ تحديث
                </button>
              </div>
              {captchaLoading ? (
                <p className="text-white/40 font-display text-sm italic">جارٍ التحميل...</p>
              ) : captcha ? (
                <div className="flex items-center gap-3">
                  <span className="text-white font-display text-xl font-bold tracking-wider bg-primary/10 border border-primary/30 px-4 py-2 min-w-[120px] text-center">
                    {captcha.question}
                  </span>
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="؟"
                    className="w-20 bg-background border-4 border-primary text-foreground px-3 py-2 font-display text-lg text-center focus:outline-none focus:shadow-[0_0_20px_rgba(255,0,25,0.6)] transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <button type="button" onClick={fetchCaptcha} className="text-primary text-sm underline">
                  اضغط لتحميل سؤال التحقق
                </button>
              )}
            </div>
          )}

          <PhantomButton
            type="submit"
            disabled={isLoading || (step === "register" && (!captcha || captchaLoading))}
            className="w-full text-2xl py-4 shadow-[8px_8px_0px_0px_#fff]"
          >
            {isLoading ? t("common.loading") : (step === "login" ? t("auth.infiltrate") : t("auth.recruit"))}
          </PhantomButton>
        </form>

        <div className="text-center mt-6 relative z-10">
          <p className="text-foreground/70 font-body mb-3">
            {step === "login" ? t("auth.no_account") : t("auth.already_member")}
          </p>
          <button
            onClick={() => {
              setStep(step === "login" ? "register" : "login");
              setUsername("");
              setEmail("");
              setPassword("");
            }}
            disabled={isLoading}
            className="text-primary font-display font-bold text-lg uppercase hover:text-white transition-colors cursor-pointer hover:underline italic"
          >
            {step === "login" ? t("auth.become_thief") : t("auth.infiltrate")}
          </button>
        </div>

        <div className="absolute -bottom-20 -left-20 w-64 h-64 border-[20px] border-primary/10 rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 border-[20px] border-primary/10 rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
}
