import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";
import { PhantomButton } from "@/components/PhantomButton";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Background glitch effect */}
      <div className="absolute inset-0 bg-primary/10 bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] z-0" />
      
      <div className="relative z-10 text-center border-4 border-white p-12 bg-black shadow-[10px_10px_0px_var(--p5-red)] transform rotate-2">
        <AlertTriangle className="w-24 h-24 text-primary mx-auto mb-6" />
        
        <h1 className="text-8xl font-display text-white mb-2 tracking-tighter">404</h1>
        <h2 className="text-3xl font-display text-primary mb-8 uppercase tracking-widest bg-white inline-block px-2 transform -skew-x-12">
          Page Stolen
        </h2>
        
        <p className="text-zinc-400 mb-8 max-w-md mx-auto font-mono uppercase">
          The phantom thieves must have taken this page. It's gone forever.
        </p>

        <Link href="/">
          <PhantomButton className="px-8">
            Escape to Hideout
          </PhantomButton>
        </Link>
      </div>
    </div>
  );
}
