import { PhantomCard } from "@/components/PhantomCard";
import { PhantomButton } from "@/components/PhantomButton";
import { PhantomCounter } from "@/components/PhantomCounter";
import { useProducts } from "@/hooks/use-products";
import { useCreateOrder } from "@/hooks/use-orders";
import { useRobuxCounter } from "@/hooks/use-stats";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Shop() {
  const { data: products, isLoading } = useProducts();
  const { data: stats } = useRobuxCounter();
  const { mutate: createOrder, isPending: isOrdering } = useCreateOrder();
  const { toast } = useToast();
  const { data: user } = useUser();

  const handleSteal = (productId: number, productName: string) => {
    if (!user) {
      toast({
        title: "ACCESS DENIED",
        description: "You must be a member of the Phantom Thieves to steal items.",
        variant: "destructive",
      });
      return;
    }

    createOrder(productId, {
      onSuccess: () => {
        toast({
          title: "HEIST SUCCESSFUL",
          description: `You successfully stole ${productName}!`,
          className: "bg-black border-2 border-primary text-white font-display",
        });
      },
      onError: (error) => {
        toast({
          title: "HEIST FAILED",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-16">
        <PhantomCounter value={stats?.value || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products?.map((product, index) => (
          <PhantomCard key={product.id} delay={index * 0.1}>
            <div className="aspect-square w-full mb-4 overflow-hidden border-2 border-white/10 relative group-hover:border-primary/50 transition-colors">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 border border-primary text-primary font-display text-sm tracking-wider">
                {product.category}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-display text-white mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-white/60 font-body text-sm line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="flex items-end justify-between border-t border-white/10 pt-4">
                <div className="font-display text-3xl text-white">
                  R$ <span className="text-primary">{product.price}</span>
                </div>
              </div>

              <PhantomButton 
                onClick={() => handleSteal(product.id, product.name)}
                disabled={isOrdering}
                className="w-full text-xl"
              >
                STEAL IT
              </PhantomButton>
            </div>
          </PhantomCard>
        ))}
      </div>
    </div>
  );
}
