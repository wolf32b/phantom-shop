import { useState } from "react";
import { motion } from "framer-motion";
import { PhantomButton } from "@/components/PhantomButton";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/LanguageContext";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { User, Lock, Image, LogOut, Shield } from "lucide-react";

export default function Profile() {
  const { data: user, isLoading } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [username, setUsername] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-4xl font-display text-white mb-4">{t("profile.restricted")}</h2>
        <Link href="/login">
          <PhantomButton>{t("nav.login")}</PhantomButton>
        </Link>
      </div>
    );
  }

  const handleSaveInfo = async () => {
    const newUsername = username.trim() || user.username;
    const newImageUrl = profileImageUrl.trim() || user.profileImageUrl;

    if (!newUsername && !newImageUrl) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, profileImageUrl: newImageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: t("common.error"), description: data.message, variant: "destructive" });
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: t("common.success"), description: t("profile.saved"), className: "bg-black border-2 border-primary text-white font-display" });
      setUsername("");
      setProfileImageUrl("");
    } catch {
      toast({ title: t("common.error"), description: t("profile.save_error"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: t("common.error"), description: t("profile.fill_all"), variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t("common.error"), description: t("profile.password_mismatch"), variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: t("common.error"), description: t("profile.password_short"), variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: t("common.error"), description: data.message, variant: "destructive" });
        return;
      }
      toast({ title: t("common.success"), description: t("profile.password_changed"), className: "bg-black border-2 border-primary text-white font-display" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: t("common.error"), description: t("profile.save_error"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const avatarUrl = profileImageUrl.trim() || user.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${user.username}&background=FF0019&color=fff&size=128`;

  return (
    <div className="container mx-auto px-3 md:px-4 py-8 md:py-12 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-6xl font-display text-white italic uppercase transform -skew-x-6 text-shadow-red mb-2">
          {t("profile.title")}
        </h1>
        <div className="h-1 w-24 bg-primary" />
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-black border-4 border-primary p-6 md:p-8 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={avatarUrl}
              alt={user.username || ""}
              className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary object-cover"
            />
            {(user as any).isAdmin && (
              <div className="absolute -bottom-2 -right-2 bg-primary p-1">
                <Shield className="w-4 h-4 text-black" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center sm:text-start flex-1">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">{t("auth.codename")}</div>
            <h2 className="font-display text-3xl md:text-4xl text-white italic tracking-tighter mb-1">
              {user.username}
            </h2>
            <p className="text-white/50 text-sm font-body mb-3">{user.email}</p>
            {(user as any).isAdmin && (
              <span className="bg-primary text-black font-display text-xs px-2 py-1 uppercase">ADMIN</span>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/50 hover:text-primary transition-colors font-display text-sm uppercase italic"
          >
            <LogOut className="w-4 h-4" />
            {t("nav.logout")}
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-4 py-2 font-display text-sm uppercase italic transition-all border-2 ${
            activeTab === "info"
              ? "bg-primary text-black border-primary"
              : "text-white/60 border-white/10 hover:border-primary/50"
          }`}
        >
          <User className="w-4 h-4" />
          {t("profile.tab_info")}
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 px-4 py-2 font-display text-sm uppercase italic transition-all border-2 ${
            activeTab === "password"
              ? "bg-primary text-black border-primary"
              : "text-white/60 border-white/10 hover:border-primary/50"
          }`}
        >
          <Lock className="w-4 h-4" />
          {t("profile.tab_password")}
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black border-4 border-primary/50 p-6 md:p-8 space-y-6"
      >
        {activeTab === "info" ? (
          <>
            <div>
              <label className="block text-white/50 font-display text-xs uppercase tracking-widest mb-2">
                {t("profile.new_username")}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={user.username || ""}
                className="w-full bg-background border-4 border-primary/50 focus:border-primary p-3 text-white font-display text-lg focus:outline-none transition-all uppercase"
              />
            </div>

            <div>
              <label className="block text-white/50 font-display text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <Image className="w-3 h-3" />
                {t("profile.avatar_url")}
              </label>
              <input
                type="url"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-background border-4 border-primary/50 focus:border-primary p-3 text-white font-body text-base focus:outline-none transition-all"
              />
              <p className="text-white/30 text-xs mt-1 italic">{t("profile.avatar_hint")}</p>
            </div>

            <PhantomButton
              onClick={handleSaveInfo}
              disabled={isSaving || (!username.trim() && !profileImageUrl.trim())}
              className="w-full text-xl py-4"
            >
              {isSaving ? t("common.loading") : t("profile.save")}
            </PhantomButton>
          </>
        ) : (
          <>
            <div>
              <label className="block text-white/50 font-display text-xs uppercase tracking-widest mb-2">
                {t("profile.current_password")}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border-4 border-primary/50 focus:border-primary p-3 text-white font-display text-lg focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-white/50 font-display text-xs uppercase tracking-widest mb-2">
                {t("profile.new_password")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border-4 border-primary/50 focus:border-primary p-3 text-white font-display text-lg focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-white/50 font-display text-xs uppercase tracking-widest mb-2">
                {t("profile.confirm_password")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border-4 border-primary/50 focus:border-primary p-3 text-white font-display text-lg focus:outline-none transition-all"
              />
            </div>

            <PhantomButton
              onClick={handleChangePassword}
              disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full text-xl py-4"
            >
              {isSaving ? t("common.loading") : t("profile.change_password")}
            </PhantomButton>
          </>
        )}
      </motion.div>
    </div>
  );
}
