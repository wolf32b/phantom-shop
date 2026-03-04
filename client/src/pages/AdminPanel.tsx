import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { PhantomButton } from "@/components/PhantomButton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  ExternalLink, 
  Check, 
  X, 
  RefreshCcw, 
  User as UserIcon, 
  Hash, 
  CreditCard,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("p5_admin_key") || "");

  useEffect(() => {
    // Completely disable all redirects for the Admin Panel.
    // This allows the "Admin Key" bypass to work even if the user isn't logged in.
    return;
  }, []); 

  // Add this to your useQuery and useMutation calls to ensure they don't fail due to 403
  // when the session is missing but the key is present.

  useEffect(() => {
    if (adminKey) {
      localStorage.setItem("p5_admin_key", adminKey);
    }
  }, [adminKey]);

  const { data: orders, isLoading, isRefetching } = useQuery<AdminOrder[]>({
    queryKey: ["/api/admin/orders", adminKey],
    queryFn: async () => {
      const url = new URL("/api/admin/orders", window.location.origin);
      if (adminKey) url.searchParams.set("key", adminKey);
      const res = await fetch(url.toString()); // Remove credentials: "include" to avoid session conflicts when using key
      if (!res.ok) throw new Error("Failed to load orders. Check your admin key.");
      return await res.json();
    },
    // Enable if we have a key
    enabled: !!adminKey,
    refetchInterval: 10000,
  });

  const approve = useMutation({
    mutationFn: async (orderId: number) => {
      const url = new URL(`/api/admin/orders/${orderId}/approve`, window.location.origin);
      if (adminKey) url.searchParams.set("key", adminKey);
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Approve failed");
      return await res.json();
    },
    onSuccess: async () => {
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ 
        title: "SUCCESSFUL HEIST", 
        description: "Target neutralized. Robux delivered.", 
        className: "bg-black border-2 border-primary text-white font-display" 
      });
    },
    onError: () => toast({ title: "MISSION FAILED", description: "Could not approve order.", variant: "destructive" }),
  });

  const reject = useMutation({
    mutationFn: async (orderId: number) => {
      const url = new URL(`/api/admin/orders/${orderId}/reject`, window.location.origin);
      if (adminKey) url.searchParams.set("key", adminKey);
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Reject failed");
      return await res.json();
    },
    onSuccess: async () => {
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ 
        title: "TARGET REJECTED", 
        description: "Operation cancelled. Funds returned.", 
        className: "bg-black border-2 border-primary text-white font-display" 
      });
    },
    onError: () => toast({ title: "MISSION FAILED", description: "Could not reject order.", variant: "destructive" }),
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {!adminKey && (!user || !(user as any).isAdmin) && (
        <div className="mb-8 p-6 bg-yellow-500/10 border-4 border-yellow-500 clip-path-comic-1">
          <h2 className="text-2xl font-display text-yellow-500 mb-4 italic uppercase">ADMIN AUTHENTICATION REQUIRED</h2>
          <div className="flex gap-4">
            <input 
              type="password"
              placeholder="Enter Secret Admin Key..."
              className="flex-grow bg-background border-2 border-yellow-500 p-2 text-foreground font-display focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') setAdminKey((e.target as HTMLInputElement).value);
              }}
            />
            <button 
              className="bg-yellow-500 text-black px-6 font-display italic hover:bg-yellow-400 transition-colors"
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                setAdminKey(input.value);
              }}
            >
              ACCESS
            </button>
          </div>
          <p className="mt-2 text-xs text-yellow-500/60 font-mono italic tracking-tighter uppercase">Default access key: phantom-admin-secure</p>
          <div className="mt-4 p-4 bg-black/40 border-2 border-yellow-500/30 text-yellow-500/80 text-sm font-body">
            <p><strong>كيفية التفعيل:</strong></p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>انسخ الكود الموجود أعلاه (أو الكود الذي خصصته في الإعدادات).</li>
              <li>الصقه في الخانة الصفراء واضغط على <strong>ACCESS</strong>.</li>
              <li>سيتم حفظ الكود في متصفحك ولن تضطر لإدخاله مرة أخرى.</li>
            </ol>
          </div>
        </div>
      )}

      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="mb-12 border-l-8 border-primary pl-6"
      >
        <h1 className="text-7xl font-display text-white-p5 italic uppercase -skew-x-6 leading-none">
          COMMAND <span className="text-primary">CENTER</span>
        </h1>
        <div className="flex items-center gap-4 mt-4">
          <p className="text-primary font-body font-black italic uppercase tracking-widest text-xl">
            Infiltrating the market queue
          </p>
          <div className="h-px flex-grow bg-primary/30" />
          <Badge className="bg-primary text-white font-display text-xl px-4 py-1 rounded-none rotate-2">
            {orders?.length || 0} TARGETS PENDING
          </Badge>
        </div>
      </motion.div>

      <div className="bg-black/80 backdrop-blur-xl border-4 border-primary shadow-[15px_15px_0px_0px_white] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 clip-path-comic-1 -z-10 halftone-pattern" />
        
        <div className="p-8 border-b-4 border-primary/20 flex flex-col md:flex-row md:items-end gap-6 justify-between bg-primary/5">
          <div className="space-y-2">
            <label className="block text-primary font-display text-sm uppercase tracking-[0.2em]">Transmission Message</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Leave a calling card..."
              className="w-full md:w-96 bg-background border-4 border-primary text-foreground px-4 py-3 font-display text-lg focus:outline-none focus:shadow-[0_0_15px_rgba(255,0,25,0.4)] transition-all italic uppercase"
            />
          </div>

          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] })}
            disabled={isRefetching}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black font-display text-xl border-4 border-primary hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <RefreshCcw className={isRefetching ? "animate-spin" : ""} size={20} />
            SYNC DATA
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-primary">
              <TableRow className="border-none hover:bg-primary">
                <TableHead className="text-white font-display text-2xl italic h-16">TARGET</TableHead>
                <TableHead className="text-white font-display text-2xl italic h-16">ROBUX</TableHead>
                <TableHead className="text-white font-display text-2xl italic h-16">VALUATION</TableHead>
                <TableHead className="text-white font-display text-2xl italic h-16">INTEL</TableHead>
                <TableHead className="text-white font-display text-2xl italic h-16 text-right">EXFILTRATION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCcw className="h-12 w-12 animate-spin text-primary" />
                      <span className="font-display text-2xl text-white italic">SCANNING NETWORK...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (orders || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <AlertCircle size={64} className="text-primary" />
                      <span className="font-display text-3xl text-white italic">NO TARGETS DETECTED. THE STREETS ARE QUIET.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (orders || []).map((o) => (
                <TableRow key={o.id} className="border-b border-primary/20 hover:bg-primary/5 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-display text-2xl text-white">#{o.id}</span>
                      <div className="flex items-center gap-1 text-primary/60 font-mono text-xs">
                        <UserIcon size={12} />
                        {o.userId.slice(0, 12)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">
                        <CreditCard className="text-primary" size={24} />
                      </div>
                      <span className="font-display text-3xl text-white italic">{o.amount} <span className="text-primary text-sm not-italic">R$</span></span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-display text-2xl text-primary italic leading-none">{o.expectedPrice} R$</span>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">Required Price</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => window.open(o.gamepassUrl, "_blank")}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-white/20 text-white/80 font-display italic hover:border-primary hover:text-white hover:bg-primary/10 transition-all"
                    >
                      <ExternalLink size={16} />
                      GO TO TARGET
                    </button>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-white/30 font-mono">
                      <Hash size={10} />
                      {o.gamepassId}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-4">
                      <PhantomButton
                        onClick={() => approve.mutate(o.id)}
                        disabled={approve.isPending || reject.isPending}
                        className="px-6 py-2 text-xl shadow-[4px_4px_0px_0px_#fff] group-hover:shadow-[6px_6px_0px_0px_#fff] transition-all"
                      >
                        <Check className="mr-2" size={20} />
                        APPROVE
                      </PhantomButton>
                      <button
                        onClick={() => reject.mutate(o.id)}
                        disabled={approve.isPending || reject.isPending}
                        className="px-6 py-2 border-4 border-primary text-white font-display text-xl hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-95 italic"
                      >
                        <X className="mr-2 inline" size={20} />
                        REJECT
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-12 p-6 bg-primary border-4 border-black dark:border-white clip-path-comic-2">
        <h4 className="font-display text-2xl text-black font-black italic uppercase flex items-center gap-2">
          <AlertCircle className="inline" />
          OPERATIONAL PROTOCOL
        </h4>
        <p className="text-black font-body text-lg font-bold leading-tight mt-2">
          1. ACCESS THE TARGET LINK // 2. CONFIRM THE VALUATION MATCHES // 3. EXECUTE THE PURCHASE MANUALLY // 4. SIGN OFF WITH APPROVAL.
        </p>
      </div>
    </div>
  );
}
