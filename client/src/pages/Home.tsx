import { Layout } from "@/components/Layout";
import { PhantomButton } from "@/components/PhantomButton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center mb-16 overflow-hidden">
        {/* Jagged background shape */}
        <div className="absolute inset-0 bg-primary clip-path-polygon z-0 opacity-10" 
             style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)" }} 
        />

        <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-block bg-primary text-white px-4 py-1 transform -skew-x-12 mb-6">
              <span className="block skew-x-12 font-display uppercase tracking-widest text-sm">
                Welcome to the Hideout
              </span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-display uppercase leading-[0.85] tracking-tighter mb-6 text-white drop-shadow-[4px_4px_0px_rgba(217,0,24,0.5)]">
              Take Your <br/>
              <span className="text-primary italic">Heart</span>
            </h1>
            
            <p className="text-xl text-zinc-300 max-w-lg mb-8 font-light border-l-4 border-primary pl-6 py-2 bg-gradient-to-r from-black/50 to-transparent">
              The premier underground marketplace for Robux assets. Secure, fast, and always rebellious. Join the Phantom Thieves today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <PhantomButton className="text-xl px-10 py-4">
                  Start Heist <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </PhantomButton>
              </Link>
              <Link href="/login">
                <PhantomButton variant="outline" className="text-xl px-10 py-4">
                  Join Us
                </PhantomButton>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            {/* Abstract visual composition representing P5 style */}
            <div className="relative w-full h-[500px]">
              <div className="absolute inset-0 bg-black skew-x-[-10deg] border-4 border-white z-10" />
              <div className="absolute top-4 left-4 inset-0 bg-primary skew-x-[-10deg] z-0" />
              
              <div className="absolute inset-0 z-20 flex items-center justify-center p-8">
                <div className="text-center transform -rotate-6">
                  <Star className="w-24 h-24 text-primary mx-auto mb-4 animate-pulse" fill="currentColor" />
                  <h2 className="text-6xl font-display text-white uppercase tracking-widest bg-black px-4 py-2 border-2 border-primary inline-block transform skew-x-[-15deg]">
                    Steal It
                  </h2>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }} 
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-10 -right-10 bg-white text-black font-display text-4xl px-6 py-3 transform rotate-12 border-4 border-black z-30 shadow-[8px_8px_0px_rgba(0,0,0,1)]"
              >
                HOT!
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/50 skew-y-2 -mx-4 px-4 border-y-4 border-primary/30">
        <div className="container mx-auto skew-y-[-2deg]">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Shield} 
              title="Secure Trades" 
              desc="Our automated bots ensure 100% safe delivery of your assets."
            />
            <FeatureCard 
              icon={Zap} 
              title="Instant Delivery" 
              desc="No waiting times. Get your Robux items immediately after purchase."
            />
            <FeatureCard 
              icon={Star} 
              title="Premium Quality" 
              desc="Only the rarest and most coveted items make it to our shop."
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-zinc-900/80 p-8 border border-zinc-800 hover:border-primary hover:bg-zinc-900 transition-all group">
      <Icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
      <h3 className="text-2xl font-display text-white mb-3 uppercase tracking-wide">{title}</h3>
      <p className="text-zinc-400">{desc}</p>
    </div>
  );
}
