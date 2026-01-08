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
        <h2 className="text-4xl font-display text-white mb-4">ACCESS RESTRICTED</h2>
        <p className="text-white/60 mb-8 max-w-md">
          You need to be logged in to view your heist history. Identify yourself to proceed.
        </p>
        <Link href="/login">
          <PhantomButton>LOGIN NOW</PhantomButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-12 border-b-4 border-primary pb-4">
        <h1 className="text-5xl font-display text-white text-shadow-red">MY HEISTS</h1>
        <div className="bg-white/10 px-4 py-2 font-body text-white">
          TOTAL: <span className="text-primary font-bold">{orders?.length || 0}</span>
        </div>
      </div>

      <div className="space-y-4">
        {orders?.length === 0 ? (
          <div className="text-center py-20 bg-black/50 border-2 border-dashed border-white/20">
            <PackageX className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-display text-white/50">NO HEISTS RECORDED</h3>
            <p className="text-white/30 mb-8">You haven't stolen anything yet.</p>
            <Link href="/shop">
              <PhantomButton>GO TO BLACK MARKET</PhantomButton>
            </Link>
          </div>
        ) : (
          orders?.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black border border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/50 transition-all group relative overflow-hidden"
            >
              {/* Decorative slash */}
              <div className="absolute top-0 right-0 w-2 h-full bg-primary transform skew-x-12 translate-x-4 group-hover:translate-x-0 transition-transform duration-300" />

              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-white/5 flex items-center justify-center font-display text-2xl text-white/30 border border-white/10">
                  #{String(order.id).padStart(3, '0')}
                </div>
                <div>
                  <h3 className="font-display text-xl text-white mb-1">
                    PRODUCT ID: {order.productId}
                  </h3>
                  <p className="text-white/50 text-sm font-body">
                    {format(new Date(order.createdAt!), "PPP 'at' p")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Status</div>
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
