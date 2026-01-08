import { useOrders } from "@/hooks/use-orders";
import { useUser } from "@/hooks/use-user";
import { Link } from "wouter";
import { PhantomButton } from "@/components/PhantomButton";
import { Loader2, PackageX } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Orders() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: orders, isLoading: ordersLoading } = useOrders();

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
        <h2 className="text-6xl font-display text-white-p5 mb-4 text-shadow-blood transform -skew-x-12 italic uppercase">ACCESS RESTRICTED</h2>
        <p className="text-foreground text-2xl font-body italic mb-8 max-w-md">
          You need to be logged in to view your heist history. Identify yourself to proceed.
        </p>
        <Link href="/login">
          <PhantomButton className="text-2xl py-4 shadow-[8px_8px_0px_0px_#fff]">LOGIN NOW</PhantomButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl transition-colors duration-500">
      <div className="flex items-center justify-between mb-12 border-b-4 border-primary pb-4">
        <h1 className="text-6xl font-display text-white-p5 text-shadow-blood transform -skew-x-12 italic uppercase">MY HEISTS</h1>
        <div className="bg-background border-4 border-primary px-4 py-2 font-display text-2xl text-foreground italic shadow-[4px_4px_0px_0px_#FF0019]">
          TOTAL: <span className="text-primary font-bold">{orders?.length || 0}</span>
        </div>
      </div>

      <div className="space-y-4">
        {orders?.length === 0 ? (
          <div className="text-center py-20 bg-background border-8 border-dashed border-primary/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 halftone-pattern pointer-events-none" />
            <PackageX className="w-24 h-24 text-primary/30 mx-auto mb-6 transform group-hover:scale-110 transition-transform" />
            <h3 className="text-4xl font-display text-foreground/50 italic mb-2">NO HEISTS RECORDED</h3>
            <p className="text-foreground/30 text-xl font-body italic mb-8">You haven't stolen anything yet.</p>
            <Link href="/shop">
              <PhantomButton className="text-2xl py-4 shadow-[8px_8px_0px_0px_#fff]">GO TO BLACK MARKET</PhantomButton>
            </Link>
          </div>
        ) : (
          orders?.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-background border-4 border-primary p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:translate-x-2 transition-all group relative overflow-hidden shadow-[8px_8px_0px_0px_black] dark:shadow-[8px_8px_0px_0px_white]"
            >
              {/* Decorative slash */}
              <div className="absolute top-0 right-0 w-2 h-full bg-primary transform skew-x-12 translate-x-4 group-hover:translate-x-0 transition-transform duration-300" />

              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-20 h-20 bg-primary flex items-center justify-center font-display text-3xl text-white transform -rotate-3 border-4 border-foreground shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white]">
                  #{String(order.id).padStart(3, '0')}
                </div>
                <div>
                  <h3 className="font-display text-3xl text-foreground italic mb-1 uppercase tracking-tighter">
                    PRODUCT ID: {order.productId}
                  </h3>
                  <p className="text-foreground/50 text-lg font-body italic">
                    {format(new Date(order.createdAt!), "PPP 'at' p")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <div className="text-xs text-foreground/40 uppercase tracking-widest mb-1 font-display font-bold">Status</div>
                  <div className={`font-display text-2xl px-6 py-2 transform -skew-x-12 italic ${
                    order.status === 'completed' 
                      ? 'bg-primary text-white shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white]' 
                      : 'bg-background border-4 border-primary text-foreground shadow-[4px_4px_0px_0px_black] dark:shadow-[4px_4px_0px_0px_white]'
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
