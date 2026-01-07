import { motion } from "framer-motion";
import { PhantomButton } from "@/components/PhantomButton";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { data: user } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin 
        ? { username, password }
        : { username, email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "ERROR",
          description: data.message || "Authentication failed",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "SUCCESS",
        description: isLogin ? "Welcome back!" : "Account created successfully!",
        className: "bg-black border-2 border-primary text-white font-display",
      });

      // Redirect to home
      setTimeout(() => setLocation("/"), 500);
    } catch (error) {
      toast({
        title: "ERROR",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-black border-4 border-primary p-8 relative overflow-hidden shadow-[10px_10px_0px_0px_white]"
      >
        {/* Calling Card Aesthetic */}
        <div className="absolute top-0 left-0 w-full h-4 bg-primary" />
        <div className="absolute bottom-0 right-0 w-full h-4 bg-primary" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-20 h-20 bg-primary mx-auto mb-6 flex items-center justify-center transform rotate-3 shadow-[6px_6px_0px_0px_#fff] border-4 border-white">
            <span className="font-display text-4xl text-black font-bold italic">P5</span>
          </div>
          <h1 className="text-6xl font-display text-white mb-3 transform -skew-x-6 italic uppercase">
            {isLogin ? "INFILTRATE" : "RECRUIT"}
          </h1>
          <p className="text-primary font-body text-lg font-bold italic">
            {isLogin ? "Enter the Black Market" : "Join the Phantom Thieves"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Username */}
          <div>
            <label className="block text-white font-display text-sm uppercase tracking-widest mb-2">
              Codename
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="phantom_user"
              className="w-full bg-black border-4 border-primary text-white px-4 py-3 font-display text-lg focus:outline-none focus:shadow-[0_0_20px_rgba(255,0,25,0.6)] transition-all italic uppercase"
              required
              disabled={isLoading}
            />
          </div>

          {/* Email - only for register */}
          {!isLogin && (
            <div>
              <label className="block text-white font-display text-sm uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-black border-4 border-primary text-white px-4 py-3 font-display text-lg focus:outline-none focus:shadow-[0_0_20px_rgba(255,0,25,0.6)] transition-all italic"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-white font-display text-sm uppercase tracking-widest mb-2">
              Passphrase
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black border-4 border-primary text-white px-4 py-3 font-display text-lg focus:outline-none focus:shadow-[0_0_20px_rgba(255,0,25,0.6)] transition-all italic"
              required
              disabled={isLoading}
            />
          </div>

          <PhantomButton 
            type="submit"
            disabled={isLoading}
            className="w-full text-2xl py-4 shadow-[8px_8px_0px_0px_#fff]"
          >
            {isLoading ? "PROCESSING..." : (isLogin ? "INFILTRATE" : "RECRUIT")}
          </PhantomButton>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-6 relative z-10">
          <p className="text-white/70 font-body mb-3">
            {isLogin ? "Don't have an account?" : "Already a member?"}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setUsername("");
              setEmail("");
              setPassword("");
            }}
            disabled={isLoading}
            className="text-primary font-display font-bold text-lg uppercase hover:text-white transition-colors cursor-pointer hover:underline italic"
          >
            {isLogin ? "BECOME A PHANTOM THIEF" : "INFILTRATE"}
          </button>
        </div>

        {/* Abstract background graphics */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 border-[20px] border-primary/10 rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 border-[20px] border-primary/10 rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
}
