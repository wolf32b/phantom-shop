import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { PhantomButton } from "@/components/PhantomButton";
import { useToast } from "@/hooks/use-toast";

type AdminOrder = {
  id: number;
  userId: string;
  amount: number;
  phantomCode: string;
  gamepassUrl: string;
  gamepassId: string;
  expectedPrice: number;
  actualPrice: number;
  status: string;
  adminNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminPanel() {
  const { data: user } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [note, setNote] = useState("");

  useEffect(() => {
    if (user === null) setLocation("/login");
    if (user && !(user as any).isAdmin) setLocation("/");
  }, [user, setLocation]);

  const { data: orders, isLoading } = useQuery<AdminOrder[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      return await res.json();
    },
    enabled: !!user && (user as any).isAdmin,
    refetchInterval: 5000,
  });

  const approve = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Approve failed");
      return await res.json();
    },
    onSuccess: async () => {
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "APPROVED", description: "Order marked as approved.", className: "bg-black border-2 border-primary text-white font-display" });
    },
    onError: () => toast({ title: "ERROR", description: "Could not approve order.", variant: "destructive" }),
  });

  const reject = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Reject failed");
      return await res.json();
    },
    onSuccess: async () => {
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "REJECTED", description: "Order rejected and refunded.", className: "bg-black border-2 border-primary text-white font-display" });
    },
    onError: () => toast({ title: "ERROR", description: "Could not reject order.", variant: "destructive" }),
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-6xl font-display text-white-p5 italic uppercase -skew-x-6">ADMIN PANEL</h1>
        <p className="text-primary font-body font-bold italic mt-2">
          Pending requests waiting for manual purchase.
        </p>
      </div>

      <div className="bg-black border-4 border-primary shadow-[10px_10px_0px_0px_white] p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between mb-6">
          <div className="text-white/80 font-body">
            {isLoading ? "Loading..." : `${orders?.length || 0} pending order(s)`}
          </div>

          <div className="flex items-center gap-3">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional admin note..."
              className="w-full md:w-80 bg-background border-2 border-primary text-foreground px-3 py-2 font-body focus:outline-none"
            />
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] })}
              className="px-4 py-2 bg-white text-black font-display border-2 border-primary hover:bg-primary hover:text-white transition"
            >
              REFRESH
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-primary font-display text-lg border-b border-primary/40">
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Gamepass</th>
                <th className="py-3 pr-4">Receive</th>
                <th className="py-3 pr-4">Expected Price</th>
                <th className="py-3 pr-4">Actual Price</th>
                <th className="py-3 pr-4">Phantom Code</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white font-body">
              {(orders || []).map((o) => (
                <tr key={o.id} className="border-b border-primary/10 hover:bg-primary/5 transition">
                  <td className="py-4 pr-4 font-display text-xl">#{o.id}</td>
                  <td className="py-4 pr-4">
                    <a
                      href={o.gamepassUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white underline hover:text-primary"
                    >
                      Open
                    </a>
                    <div className="text-[11px] text-white/50 mt-1">ID: {o.gamepassId}</div>
                  </td>
                  <td className="py-4 pr-4">{o.amount} R$</td>
                  <td className="py-4 pr-4">{o.expectedPrice} R$</td>
                  <td className="py-4 pr-4">{o.actualPrice} R$</td>
                  <td className="py-4 pr-4 font-mono text-sm">{o.phantomCode}</td>
                  <td className="py-4 pr-4">
                    <div className="flex gap-3">
                      <PhantomButton
                        onClick={() => approve.mutate(o.id)}
                        disabled={approve.isPending || reject.isPending}
                        className="px-4 py-2 text-base"
                      >
                        APPROVE
                      </PhantomButton>
                      <button
                        onClick={() => reject.mutate(o.id)}
                        disabled={approve.isPending || reject.isPending}
                        className="px-4 py-2 border-2 border-primary text-white font-display hover:bg-primary hover:text-white transition"
                      >
                        REJECT
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(orders || []).length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-white/50 italic">
                    No pending orders. The hideout is quiet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-white/60 text-sm">
          Tip: After you manually purchase the user’s Game Pass in Roblox, press <span className="text-white font-bold">APPROVE</span>.
        </div>
      </div>
    </div>
  );
}
