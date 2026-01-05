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
      className="h-full flex flex-col group/card"
    >
      <div 
        className="relative overflow-hidden aspect-video mb-4 bg-zinc-900 -mx-6 -mt-6 border-b-2 border-zinc-800 group-hover/card:border-primary transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-overlay opacity-0 group-hover/card:opacity-100 transition-opacity" />
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-500 filter grayscale group-hover/card:grayscale-0"
        />
        
        {/* Price Tag */}
        <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 skew-x-[-20deg] translate-x-4 shadow-lg">
          <span className="block skew-x-[20deg] font-display font-bold text-lg">
            {product.price} RBX
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-display uppercase tracking-wider text-white group-hover/card:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>
        
        <div className="w-12 h-1 bg-primary transform -skew-x-12" />
        
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
          {product.description}
        </p>
        
        <div className="pt-4 mt-auto">
          <PhantomButton 
            onClick={handleBuy} 
            disabled={isPending}
            className="w-full text-base py-2"
          >
            {isPending ? (
              <span className="animate-pulse">STEALING...</span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                PURCHASE
              </span>
            )}
          </PhantomButton>
        </div>
      </div>

      {/* Rarity/Category Indicator */}
      <div className="absolute top-2 left-2 z-20">
        <div className="bg-black/80 backdrop-blur border border-zinc-700 px-2 py-0.5 rounded text-xs font-mono uppercase tracking-widest text-zinc-300">
          {product.category}
        </div>
      </div>
    </PhantomCard>
  );
}
