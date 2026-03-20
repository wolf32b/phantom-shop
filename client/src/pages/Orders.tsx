import { useOrders } from "@/hooks/use-orders";
import { useUser } from "@/hooks/use-user";
import { Link } from "wouter";
import { PhantomButton } from "@/components/PhantomButton";
import { Loader2, PackageX, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const map: Record<string, { label: string; color: string; icon: any }> = {
    pending_admin: { label: t("orders.status_pending"),  color: "bg-yellow-900/60 text-yellow-200 border-yellow-600", icon: Clock },
    approved:      { label: t("orders.status_approved"), color: "bg-green-900/60 text-green-200 border-green-600",  icon: CheckCircle2 },
    completed:     { label: t("orders.status_completed"),color: "bg-green-900/60 text-green-200 border-green-600",  icon: CheckCircle2 },
    rejected:      { label: t("orders.status_rejected"), color: "bg-red-900/60 text-red-200 border-red-600",        icon: XCircle },
  };
  const s = map[status] || { label: status.toUpperCase(), color: "bg-white/10 text-white border-white/20", icon: Clock };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 border font-display text-sm uppercase italic ${s.color}`}>
      <Icon className="w-3 h-3" />{s.label}
    </span>
  );
}

export default function Orders() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { t } = useLanguage();

  if (userLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-4xl font-display text-foreground mb-4 dark:text-white">{t("orders.restricted")}</h2>
        <p className="text-foreground/60 mb-8 max-w-md dark:text-white/60">{t("orders.login_req")}</p>
        <Link href="/login"><PhantomButton>{t("nav.login")}</PhantomButton></Link>
      </div>
    );
  }

  const pending  = orders?.filter(o => o.status === "pending_admin").length || 0;
  const approved = orders?.filter(o => o.status === "approved" || o.status === "completed").length || 0;
  const rejected = orders?.filter(o => o.status === "rejected").length || 0;

  return (
    <div className="container mx-auto px-3 md:px-4 py-8 md:py-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b-4 border-primary pb-4 gap-4">
        <h1 className="text-4xl md:text-5xl font-display text-foreground text-shadow-red dark:text-white italic">
          {t("orders.title")}
        </h1>
        <div className="bg-foreground/10 px-4 py-2 font-body text-foreground dark:bg-white/10 dark:text-white text-sm">
          {t("orders.total")}: <span className="text-primary font-bold text-lg">{orders?.length || 0}</span>
        </div>
      </div>

      {/* Stats Row */}
      {(orders?.length || 0) > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 text-center">
            <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-2xl font-display text-yellow-200">{pending}</div>
            <div className="text-xs text-yellow-400/70 uppercase">{t("orders.status_pending")}</div>
          </div>
          <div className="bg-green-900/20 border border-green-600/30 p-3 text-center">
            <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-2xl font-display text-green-200">{approved}</div>
            <div className="text-xs text-green-400/70 uppercase">{t("orders.status_approved")}</div>
          </div>
          <div className="bg-red-900/20 border border-red-600/30 p-3 text-center">
            <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <div className="text-2xl font-display text-red-200">{rejected}</div>
            <div className="text-xs text-red-400/70 uppercase">{t("orders.status_rejected")}</div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {orders?.length === 0 ? (
          <div className="text-center py-20 bg-background/50 border-2 border-dashed border-foreground/20 dark:bg-black/50 dark:border-white/20">
            <PackageX className="w-16 h-16 text-foreground/20 mx-auto mb-4 dark:text-white/20" />
            <h3 className="text-2xl font-display text-foreground/50 dark:text-white/50">{t("orders.empty")}</h3>
            <p className="text-foreground/30 mb-8 dark:text-white/30">{t("orders.empty_desc")}</p>
            <Link href="/shop"><PhantomButton>{t("orders.go_shop")}</PhantomButton></Link>
          </div>
        ) : (
          orders?.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.07 }}
              className="bg-background border-2 border-foreground/10 hover:border-primary/50 transition-all group relative overflow-hidden dark:bg-black dark:border-white/10 p-4 md:p-6"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Order info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center font-display text-sm text-primary shrink-0">
                    #{String(order.id).padStart(3, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-display text-white text-lg">{(order as any).amount} R$</span>
                      <StatusBadge status={order.status} t={t} />
                    </div>
                    <div className="text-white/40 text-xs font-body mb-2">
                      {new Date(order.createdAt!).toLocaleDateString()} — {new Date(order.createdAt!).toLocaleTimeString()}
                    </div>
                    <a
                      href={order.gamepassUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary/70 hover:text-primary text-xs font-mono truncate max-w-[260px] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {order.gamepassUrl}
                    </a>
                    {(order as any).adminNote && (
                      <div className="mt-2 text-xs text-white/50 italic border-l-2 border-primary/30 pl-2">
                        {(order as any).adminNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Price info */}
                <div className="flex flex-col items-end shrink-0 text-right">
                  <div className="text-xs text-white/30 uppercase mb-1">{t("orders.gamepass_price")}</div>
                  <div className="font-display text-2xl text-primary">{(order as any).expectedPrice} R$</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
