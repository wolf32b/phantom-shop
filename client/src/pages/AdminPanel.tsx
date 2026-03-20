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
  AlertCircle,
  ShieldOff,
  Key,
  Unlock,
  Trash2,
  Mail,
  Clock
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
};

type PhantomCode = {
  id: number;
  code: string;
  initialAmount: number;
  remainingAmount: number;
  email: string;
  buyerName?: string | null;
  isPaid: boolean;
  createdAt?: string;
};

export default function AdminPanel() {
  const { data: user, isLoading: userLoading } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "codes">("orders");

  useEffect(() => {
    if (userLoading) return;
    if (!user) { setLocation("/login"); return; }
    if (!(user as any).isAdmin) {
      toast({ title: "Access Denied", description: "You do not have permission.", variant: "destructive" });
      setLocation("/");
    }
  }, [user, userLoading, setLocation, toast]);

  const { data: statsData } = useQuery<{ total: number; pending: number; approved: number; rejected: number; totalRobux: number }>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) return { total: 0, pending: 0, approved: 0, rejected: 0, totalRobux: 0 };
      return await res.json();
    },
    enabled: !userLoading && !!(user as any)?.isAdmin,
    refetchInterval: 15000,
  });

  const { data: orders, isLoading: ordersLoading, isRefetching: ordersRefetching } = useQuery<AdminOrder[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders.");
      return await res.json();
    },
    enabled: !userLoading && !!(user as any)?.isAdmin,
    refetchInterval: 10000,
  });

  const { data: codes, isLoading: codesLoading, isRefetching: codesRefetching } = useQuery<PhantomCode[]>({
    queryKey: ["/api/admin/codes"],
    queryFn: async () => {
      const res = await fetch("/api/admin/codes", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load codes.");
      return await res.json();
    },
    enabled: !userLoading && !!(user as any)?.isAdmin,
    refetchInterval: 10000,
  });

  const pendingCodes = (codes || []).filter(c => !c.isPaid);
  const activatedCodes = (codes || []).filter(c => c.isPaid);

  const approve = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Approve failed");
      return await res.json();
    },
    onSuccess: async () => {
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "SUCCESSFUL HEIST", description: "Target neutralized. Robux delivered.", className: "bg-black border-2 border-primary text-white font-display" });
    },
    onError: () => toast({ title: "MISSION FAILED", description: "Could not approve order.", variant: "destructive" }),
  });

  const reject = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Reject failed");
      return await res.json();
    },
    onSuccess: async () => {
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "TARGET REJECTED", description: "Operation cancelled. Funds returned.", className: "bg-black border-2 border-primary text-white font-display" });
    },
    onError: () => toast({ title: "MISSION FAILED", description: "Could not reject order.", variant: "destructive" }),
  });

  const activateCode = useMutation({
    mutationFn: async (codeId: number) => {
      const res = await fetch(`/api/admin/codes/${codeId}/activate`, {
        method: "POST", credentials: "include",
      });
      if (!res.ok) throw new Error("Activate failed");
      return await res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/codes"] });
      toast({ title: "✅ Code Activated", description: "Phantom Code is now active.", className: "bg-black border-2 border-green-500 text-white font-display" });
    },
    onError: () => toast({ title: "Error", description: "Could not activate code.", variant: "destructive" }),
  });

  const deleteCode = useMutation({
    mutationFn: async (codeId: number) => {
      const res = await fetch(`/api/admin/codes/${codeId}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      return await res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/codes"] });
      toast({ title: "🗑️ Code Deleted", description: "Code removed successfully.", className: "bg-black border-2 border-red-500 text-white font-display" });
    },
    onError: () => toast({ title: "Error", description: "Could not delete code.", variant: "destructive" }),
  });

  if (userLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <RefreshCcw className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !(user as any).isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldOff className="h-20 w-20 text-primary mx-auto" />
          <h1 className="text-4xl font-display text-white italic uppercase">Access Denied</h1>
          <p className="text-white/60 font-body">You are not authorized to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-8 border-l-8 border-primary pl-6">
        <h1 className="text-5xl md:text-7xl font-display text-white italic uppercase -skew-x-6 leading-none">
          COMMAND <span className="text-primary">CENTER</span>
        </h1>
        <p className="text-primary font-body font-black italic uppercase tracking-widest text-lg mt-2">Go for it, Joker.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: "TOTAL", value: statsData?.total ?? "—", color: "border-white/30 text-white" },
          { label: "PENDING", value: statsData?.pending ?? "—", color: "border-yellow-500 text-yellow-300" },
          { label: "APPROVED", value: statsData?.approved ?? "—", color: "border-green-500 text-green-300" },
          { label: "REJECTED", value: statsData?.rejected ?? "—", color: "border-red-500 text-red-300" },
          { label: "ROBUX SOLD", value: statsData ? `${statsData.totalRobux.toLocaleString()} R$` : "—", color: "border-primary text-primary" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
            className={`bg-black/60 border-2 ${s.color} p-4 text-center`}>
            <div className={`font-display text-2xl md:text-3xl ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {[
          { id: "orders", label: "طلبات الروبوكس", icon: <CreditCard size={18} /> },
          { id: "codes", label: `أكواد الدفع ${pendingCodes.length > 0 ? `(${pendingCodes.length} معلّق)` : ""}`, icon: <Key size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 font-display text-lg italic uppercase transition-all border-b-4 ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-black/80 backdrop-blur-xl border-4 border-primary shadow-[15px_15px_0px_0px_white] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 -z-10" />
          <div className="p-6 border-b-4 border-primary/20 flex flex-col md:flex-row gap-4 bg-primary/5">
            <div className="flex-1 space-y-1">
              <label className="block text-primary font-display text-xs uppercase tracking-[0.2em]">Transmission Message</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Leave a calling card..."
                className="w-full bg-background border-4 border-primary text-foreground px-4 py-3 font-display text-lg focus:outline-none italic uppercase" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="block text-primary font-display text-xs uppercase tracking-[0.2em]">Search Orders</label>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by user, code, URL..."
                className="w-full bg-background border-4 border-primary/50 text-foreground px-4 py-3 font-display text-lg focus:outline-none focus:border-primary italic" />
            </div>
            <div className="flex items-end">
              <button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] })} disabled={ordersRefetching}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-display text-xl border-4 border-primary hover:bg-primary hover:text-white transition-all">
                <RefreshCcw className={ordersRefetching ? "animate-spin" : ""} size={20} /> SYNC
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary">
                <TableRow className="border-none hover:bg-primary">
                  <TableHead className="text-white font-display text-2xl italic h-16">USER</TableHead>
                  <TableHead className="text-white font-display text-2xl italic h-16">ROBUX</TableHead>
                  <TableHead className="text-white font-display text-2xl italic h-16">VERIFY</TableHead>
                  <TableHead className="text-white font-display text-2xl italic h-16">LINK</TableHead>
                  <TableHead className="text-white font-display text-2xl italic h-16 text-right">APPROVAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCcw className="h-12 w-12 animate-spin text-primary" />
                      <span className="font-display text-2xl text-white italic">SCANNING NETWORK...</span>
                    </div>
                  </TableCell></TableRow>
                ) : (orders || []).filter(o =>
                  !searchQuery ||
                  String(o.userId).toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (o.phantomCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (o.gamepassUrl || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  String(o.amount).includes(searchQuery)
                ).length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <AlertCircle size={64} className="text-primary" />
                      <span className="font-display text-3xl text-white italic">No pending orders.</span>
                    </div>
                  </TableCell></TableRow>
                ) : (orders || []).filter(o =>
                  !searchQuery ||
                  String(o.userId).toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (o.phantomCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (o.gamepassUrl || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  String(o.amount).includes(searchQuery)
                ).map((o) => (
                  <TableRow key={o.id} className="border-b border-primary/20 hover:bg-primary/5 transition-colors group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-display text-2xl text-white">#{o.id}</span>
                        <div className="flex items-center gap-1 text-primary/60 font-mono text-xs">
                          <UserIcon size={12} />{o.userId.slice(0, 12)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-primary" size={24} />
                        <span className="font-display text-3xl text-white italic">{o.amount} <span className="text-primary text-sm not-italic">R$</span></span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-display text-2xl text-primary italic">{o.expectedPrice} R$</span>
                      <div className="text-[10px] text-white/40 uppercase">Required Price</div>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => window.open(o.gamepassUrl, "_blank")}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-white/20 text-white/80 font-display italic hover:border-primary hover:text-white hover:bg-primary/10 transition-all">
                        <ExternalLink size={16} /> GO TO TARGET
                      </button>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-white/30 font-mono">
                        <Hash size={10} />{o.gamepassId}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-4">
                        <PhantomButton onClick={() => approve.mutate(o.id)} disabled={approve.isPending || reject.isPending}
                          className="px-6 py-2 text-xl shadow-[4px_4px_0px_0px_#fff]">
                          <Check className="mr-2" size={20} /> APPROVE
                        </PhantomButton>
                        <button onClick={() => reject.mutate(o.id)} disabled={approve.isPending || reject.isPending}
                          className="px-6 py-2 border-4 border-primary text-white font-display text-xl hover:bg-primary transition-all italic">
                          <X className="mr-2 inline" size={20} /> REJECT
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Codes Tab */}
      {activeTab === "codes" && (
        <div className="space-y-6">
          {/* Pending codes */}
          <div className="bg-black/80 border-4 border-yellow-500 shadow-[8px_8px_0px_0px_theme(colors.yellow.500)]">
            <div className="p-4 border-b border-yellow-500/30 flex items-center justify-between bg-yellow-500/10">
              <h2 className="font-display text-2xl text-yellow-300 italic uppercase flex items-center gap-2">
                <Clock size={22} /> أكواد بانتظار التفعيل ({pendingCodes.length})
              </h2>
              <button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/codes"] })} disabled={codesRefetching}
                className="flex items-center gap-2 px-4 py-2 border-2 border-yellow-500 text-yellow-400 font-display text-sm hover:bg-yellow-500 hover:text-black transition-all">
                <RefreshCcw className={codesRefetching ? "animate-spin" : ""} size={16} /> تحديث
              </button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-yellow-500/20 hover:bg-transparent">
                    <TableHead className="text-yellow-400 font-display uppercase">الكود</TableHead>
                    <TableHead className="text-yellow-400 font-display uppercase">المشتري</TableHead>
                    <TableHead className="text-yellow-400 font-display uppercase">الروبوكس</TableHead>
                    <TableHead className="text-yellow-400 font-display uppercase">الإيميل</TableHead>
                    <TableHead className="text-yellow-400 font-display uppercase">التاريخ</TableHead>
                    <TableHead className="text-yellow-400 font-display uppercase text-right">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codesLoading ? (
                    <TableRow><TableCell colSpan={6} className="h-32 text-center">
                      <RefreshCcw className="h-8 w-8 animate-spin text-yellow-400 mx-auto" />
                    </TableCell></TableRow>
                  ) : pendingCodes.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-32 text-center text-white/30 font-display italic">
                      لا توجد أكواد معلّقة
                    </TableCell></TableRow>
                  ) : pendingCodes.map(c => (
                    <TableRow key={c.id} className="border-b border-yellow-500/10 hover:bg-yellow-500/5">
                      <TableCell className="font-mono text-yellow-300 font-bold text-sm">{c.code}</TableCell>
                      <TableCell className="text-white font-body">{c.buyerName || "—"}</TableCell>
                      <TableCell className="font-display text-white text-xl">{c.initialAmount.toLocaleString()} R$</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-white/60 text-sm">
                          <Mail size={12} />{c.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/40 text-xs font-mono">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("ar-SA") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => activateCode.mutate(c.id)} disabled={activateCode.isPending}
                            className="flex items-center gap-1 px-4 py-2 bg-green-500 text-black font-display text-sm font-bold hover:bg-green-400 transition-all">
                            <Unlock size={14} /> تفعيل
                          </button>
                          <button onClick={() => deleteCode.mutate(c.id)} disabled={deleteCode.isPending}
                            className="flex items-center gap-1 px-3 py-2 border-2 border-red-500 text-red-400 font-display text-sm hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Activated codes */}
          <div className="bg-black/60 border-4 border-green-500/40">
            <div className="p-4 border-b border-green-500/20 bg-green-500/5">
              <h2 className="font-display text-xl text-green-400 italic uppercase flex items-center gap-2">
                <Check size={20} /> أكواد مفعّلة ({activatedCodes.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-green-500/20 hover:bg-transparent">
                    <TableHead className="text-green-400/60 font-display uppercase text-sm">الكود</TableHead>
                    <TableHead className="text-green-400/60 font-display uppercase text-sm">المشتري</TableHead>
                    <TableHead className="text-green-400/60 font-display uppercase text-sm">الروبوكس</TableHead>
                    <TableHead className="text-green-400/60 font-display uppercase text-sm">المتبقي</TableHead>
                    <TableHead className="text-green-400/60 font-display uppercase text-sm">الإيميل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activatedCodes.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-20 text-center text-white/20 font-display italic text-sm">
                      لا توجد أكواد مفعّلة بعد
                    </TableCell></TableRow>
                  ) : activatedCodes.map(c => (
                    <TableRow key={c.id} className="border-b border-green-500/10 hover:bg-green-500/5">
                      <TableCell className="font-mono text-green-300 text-sm">{c.code}</TableCell>
                      <TableCell className="text-white/70 font-body text-sm">{c.buyerName || "—"}</TableCell>
                      <TableCell className="font-display text-white">{c.initialAmount.toLocaleString()} R$</TableCell>
                      <TableCell className="font-display text-green-400">{c.remainingAmount.toLocaleString()} R$</TableCell>
                      <TableCell className="text-white/40 text-xs">{c.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 p-6 bg-primary border-4 border-black dark:border-white">
        <h4 className="font-display text-2xl text-black font-black italic uppercase flex items-center gap-2">
          <AlertCircle className="inline" /> Robux PROTOCOL
        </h4>
        <p className="text-black font-body text-lg font-bold leading-tight mt-2">
          1. ACCESS THE TARGET LINK // 2. CONFIRM THE VALUATION MATCHES // 3. EXECUTE THE PURCHASE MANUALLY // 4. SIGN OFF WITH APPROVAL.
        </p>
      </div>
    </div>
  );
}
