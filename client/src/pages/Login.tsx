import { motion } from "framer-motion";
import { PhantomButton } from "@/components/PhantomButton";
import { useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";

export default function Login() {
  const { data: user } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-black border-4 border-white p-8 relative overflow-hidden shadow-[10px_10px_0px_0px_#d90018]"
      >
        {/* Calling Card Aesthetic */}
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        <div className="absolute bottom-0 right-0 w-full h-2 bg-primary" />
        
        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-primary mx-auto mb-6 flex items-center justify-center transform rotate-3 shadow-lg">
            <span className="font-display text-4xl text-black font-bold">P5</span>
          </div>
          <h1 className="text-5xl font-display text-white mb-2 transform -skew-x-6">
            IDENTIFY YOURSELF
          </h1>
          <p className="text-white/60 font-body text-lg">
            The Phantom Thieves require authentication to access the Black Market.
          </p>
        </div>

        <div className="space-y-4 relative z-10">
          <PhantomButton onClick={handleLogin} className="w-full text-xl py-6">
            LOGIN WITH REPLIT
          </PhantomButton>
          
          <p className="text-center text-white/30 text-xs mt-4 font-mono">
            SECURE CONNECTION // ENCRYPTED // TRACELESS
          </p>
        </div>

        {/* Abstract background graphics */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 border-[20px] border-white/5 rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 border-[20px] border-white/5 rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
}
