import { Layout } from "@/components/Layout";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { motion } from "framer-motion";
import { Loader2, Package, Check, Clock } from "lucide-react";
import { PhantomCard } from "@/components/PhantomCard";
import { format } from "date-fns";

export default function Orders() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products } = useProducts();

  // Helper to find product details since orders usually contain just IDs
  const getProduct = (id: number) => products?.find(p => p.id === id);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-display text-white mb-8 uppercase tracking-tight border-l-8 border-primary pl-6">
          Stolen Goods History
        </h1>

        {ordersLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map((order, i) => {
              const product = getProduct(order.productId);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="bg-black/60 border border-zinc-800 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group hover:border-primary transition-colors">
                    {/* Status Stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${order.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />

                    <div className="w-full md:w-24 h-24 bg-zinc-900 flex-shrink-0 border border-zinc-700">
                      {product ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">?</div>
                      )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-display text-white uppercase">{product?.name || "Unknown Item"}</h3>
                      <p className="text-zinc-400 text-sm font-mono mt-1">
                        Order #{order.id.toString().padStart(6, '0')} • {format(new Date(order.createdAt || Date.now()), 'PPpp')}
                      </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2">
                      <div className={`px-4 py-1 text-xs font-bold uppercase tracking-widest border ${
                        order.status === 'completed' 
                          ? 'border-green-500 text-green-500 bg-green-500/10' 
                          : 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                      }`}>
                        {order.status}
                      </div>
                      {product && (
                        <span className="font-display text-xl text-primary">{product.price} RBX</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {orders?.length === 0 && (
              <div className="text-center py-20 bg-black/40 border-2 border-dashed border-zinc-800 rounded">
                <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-2xl font-display text-zinc-500 uppercase">No successful heists yet</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
