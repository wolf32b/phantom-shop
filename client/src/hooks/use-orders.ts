import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (res.status === 401) return null; // Not logged in
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Please login to purchase");
        if (res.status === 400) {
          const error = api.orders.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to process order");
      }
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      // Invalidate user queries to update robux balance if needed
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
      
      toast({
        title: "TREASURE SECURED",
        description: "The item has been successfully acquired!",
        className: "bg-black text-white border-2 border-red-600 font-display uppercase",
      });
    },
    onError: (error) => {
      toast({
        title: "HEIST FAILED",
        description: error.message,
        variant: "destructive",
        className: "bg-red-900 text-white font-display uppercase",
      });
    }
  });
}
