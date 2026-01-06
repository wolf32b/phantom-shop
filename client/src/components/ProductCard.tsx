import { Product } from "@shared/schema";
import { PhantomCard } from "./PhantomCard";
import { PhantomButton } from "./PhantomButton";
import { useCreateOrder } from "@/hooks/use-orders";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { data: user } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const handleBuy = () => {
    if (!user) {
      toast({
        title: "LOGIN REQUIRED",
        description: "You must be a member to purchase from the black market.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    createOrder(product.id);
  };

  return (
    <PhantomCard 
      delay={index * 0.1} 
      className="h-full flex flex-col group/card border-4 border-primary shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
    >
      <div 
        className="relative overflow-hidden aspect-video mb-4 bg-black -mx-6 -mt-6 border-b-4 border-primary group-hover/card:border-white transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 bg-primary/40 z-10 mix-blend-overlay opacity-0 group-hover/card:opacity-100 transition-opacity" />
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700 filter grayscale brightness-50 group-hover/card:grayscale-0 group-hover/card:brightness-100"
        />
        
        {/* Price Tag - Persona 5 Style */}
        <div className="absolute top-0 right-0 bg-primary text-white px-6 py-2 -rotate-12 translate-x-4 -translate-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20">
          <span className="block font-display font-black text-2xl italic uppercase tracking-tighter">
            {product.price} RBX
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-3xl font-display uppercase tracking-tighter text-white group-hover/card:text-primary transition-colors line-clamp-1 italic">
            {product.name}
          </h3>
        </div>
        
        <div className="w-24 h-2 bg-primary transform -skew-x-12" />
        
        <p className="text-zinc-300 text-lg leading-tight line-clamp-2 font-body italic">
          {product.description}
        </p>
        
        <div className="pt-6 mt-auto">
          <PhantomButton 
            onClick={handleBuy} 
            disabled={isPending}
            className="w-full text-2xl py-4 shadow-[8px_8px_0px_0px_#FFFFFF] hover:shadow-[12px_12px_0px_0px_#FFFFFF]"
          >
            {isPending ? (
              <span className="animate-pulse italic">STEALING...</span>
            ) : (
              <span className="flex items-center justify-center gap-2 italic">
                <ShoppingCart className="w-6 h-6" />
                ACQUIRE
              </span>
            )}
          </PhantomButton>
        </div>
      </div>

      {/* Rarity/Category Indicator */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white text-black border-4 border-primary px-3 py-1 font-display uppercase italic font-bold tracking-tighter text-sm transform -rotate-3">
          {product.category}
        </div>
      </div>
    </PhantomCard>
  );
}
