import { PhantomButton } from "@/components/PhantomButton";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center relative overflow-hidden font-body">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-primary/20 z-0" />
      
      {/* Decorative red slashes */}
      <div className="absolute top-0 right-0 w-[50vw] h-[120vh] bg-primary transform -skew-x-12 translate-x-1/2 z-0 opacity-80" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-black border-4 border-white p-12 shadow-[15px_15px_0px_rgba(217,0,24,1)] transform rotate-1">
          <div className="text-center mb-10">
            <h1 className="text-6xl font-display text-white mb-2 uppercase tracking-tighter transform -skew-x-6">
              Calling Card
            </h1>
            <div className="h-1 w-24 bg-primary mx-auto mb-4" />
            <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">
              Identify yourself to enter the velvet room.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900/50 p-4 border-l-4 border-zinc-700">
              <p className="text-sm text-zinc-300 italic">
                "We will take your distorted desires without fail."
              </p>
            </div>

            <PhantomButton 
              onClick={handleLogin}
              className="w-full py-4 text-xl"
            >
              Authenticate with Replit
            </PhantomButton>

            <button 
              onClick={() => setLocation("/")}
              className="w-full text-zinc-500 hover:text-white uppercase text-xs tracking-widest mt-4 transition-colors"
            >
              Return to Safety
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
