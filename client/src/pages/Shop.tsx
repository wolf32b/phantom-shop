import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCreateProduct } from "@/hooks/use-products";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, InsertProduct } from "@shared/schema";
import { z } from "zod";

// Admin Add Product Form Schema (extending with coercions if needed)
const productFormSchema = insertProductSchema.extend({
  price: z.coerce.number().min(1, "Price must be at least 1"),
});

export default function Shop() {
  const { data: products, isLoading } = useProducts();
  const { data: user } = useUser();
  const isAdmin = user?.isAdmin;

  return (
    <Layout>
      <div className="flex justify-between items-end mb-12 border-b-2 border-zinc-800 pb-6">
        <div>
          <h1 className="text-6xl font-display text-white mb-2 uppercase tracking-tight">
            Black Market
          </h1>
          <p className="text-zinc-400 font-mono uppercase tracking-widest text-sm">
            Available Goods • {products?.length || 0} Items
          </p>
        </div>

        {isAdmin && <AddProductDialog />}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products?.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
          
          {products?.length === 0 && (
            <div className="col-span-full text-center py-20 text-zinc-500 font-display text-2xl uppercase">
              No loot available right now...
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createProduct, isPending } = useCreateProduct();
  const form = useForm<InsertProduct>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000", // Abstract tech placeholder
      category: "General",
    }
  });

  const onSubmit = (data: InsertProduct) => {
    createProduct(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-primary text-white p-4 hover:bg-white hover:text-black transition-colors transform hover:-translate-y-1 shadow-lg shadow-primary/20">
          <Plus className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-black border-2 border-primary text-white font-body max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl uppercase text-primary tracking-wider">
            Smuggle New Item
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="uppercase text-xs tracking-widest text-zinc-400">Item Name</Label>
            <Input {...form.register("name")} className="bg-zinc-900 border-zinc-700 focus:border-primary" />
            {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="uppercase text-xs tracking-widest text-zinc-400">Description</Label>
            <Textarea {...form.register("description")} className="bg-zinc-900 border-zinc-700 focus:border-primary" />
            {form.formState.errors.description && <p className="text-red-500 text-xs">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="uppercase text-xs tracking-widest text-zinc-400">Price (Robux)</Label>
              <Input type="number" {...form.register("price")} className="bg-zinc-900 border-zinc-700 focus:border-primary" />
              {form.formState.errors.price && <p className="text-red-500 text-xs">{form.formState.errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-xs tracking-widest text-zinc-400">Category</Label>
              <Input {...form.register("category")} className="bg-zinc-900 border-zinc-700 focus:border-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="uppercase text-xs tracking-widest text-zinc-400">Image URL</Label>
            {/* Using a tech/abstract image from unsplash as placeholder */}
            <Input {...form.register("imageUrl")} placeholder="https://..." className="bg-zinc-900 border-zinc-700 focus:border-primary" />
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-primary hover:bg-red-600 text-white font-display uppercase tracking-widest text-lg px-8 skew-x-[-10deg]"
            >
              {isPending ? "Smuggling..." : "Add to Stash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
