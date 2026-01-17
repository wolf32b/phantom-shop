import { useOrders } from "@/hooks/use-orders";
import { useUser } from "@/hooks/use-user";
import { Link } from "wouter";
import { PhantomButton } from "@/components/PhantomButton";
import { Loader2, PackageX } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useLanguage } from "@/lib/LanguageContext";

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
        <p className="text-foreground/60 mb-8 max-w-md dark:text-white/60">
          {t("orders.login_req")}
        </p>
        <Link href="/login">
          <PhantomButton>{t("nav.login")}</PhantomButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-12 border-b-4 border-primary pb-4">
        <h1 className="text-5xl font-display text-foreground text-shadow-red dark:text-white">{t("orders.title")}</h1>
        <div className="bg-foreground/10 px-4 py-2 font-body text-foreground dark:bg-white/10 dark:text-white">
          {t("orders.total")}: <span className="text-primary font-bold">{orders?.length || 0}</span>
        </div>
      </div>

      <div className="space-y-4">
        {orders?.length === 0 ? (
          <div className="text-center py-20 bg-background/50 border-2 border-dashed border-foreground/20 dark:bg-black/50 dark:border-white/20">
            <PackageX className="w-16 h-16 text-foreground/20 mx-auto mb-4 dark:text-white/20" />
            <h3 className="text-2xl font-display text-foreground/50 dark:text-white/50">{t("orders.empty")}</h3>
            <p className="text-foreground/30 mb-8 dark:text-white/30">{t("orders.empty_desc")}</p>
            <Link href="/shop">
              <PhantomButton>{t("orders.go_shop")}</PhantomButton>
            </Link>
          </div>
        ) : (
          orders?.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-background border border-foreground/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/50 transition-all group relative overflow-hidden dark:bg-black dark:border-white/10"
            >
              {/* Decorative slash */}
              <div className="absolute top-0 right-0 w-2 h-full bg-primary transform skew-x-12 translate-x-4 group-hover:translate-x-0 transition-transform duration-300" />

              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-foreground/5 flex items-center justify-center font-display text-2xl text-foreground/30 border border-foreground/10 dark:bg-white/5 dark:text-white/30 dark:border-white/10">
                  #{String(order.id).padStart(3, '0')}
                </div>
                <div>
                  <h3 className="font-display text-xl text-foreground mb-1 dark:text-white">
                    {t("shop.buy")} #{order.id}
                  </h3>
                  <p className="text-foreground/50 text-sm font-body mb-2 dark:text-white/50">
                    {format(new Date(order.createdAt!), "PPP 'at' p")}
                  </p>
                  <div className="bg-primary/10 p-2 border-l-2 border-primary text-xs font-mono break-all text-foreground dark:text-white">
                    {order.gamepassUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <div className="text-xs text-foreground/40 uppercase tracking-widest mb-1 dark:text-white/40">{t("orders.status")}</div>
                  <div className={`font-display text-lg px-3 py-1 ${
                    order.status === 'completed' ? 'bg-green-900 text-green-100' : 'bg-yellow-900/50 text-yellow-100'
                  }`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
