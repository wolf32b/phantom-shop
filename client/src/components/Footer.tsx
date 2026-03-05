import { SiDiscord, SiYoutube } from "react-icons/si";

export function Footer() {
  return (
    <footer className="w-full bg-black border-t-8 border-secondary py-12 mt-auto relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-64 h-full bg-primary/10 transform -skew-x-12 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        
        <div className="text-center md:text-left">
          <h4 className="text-3xl font-display text-white mb-2 text-shadow-red">
            TAKE YOUR HEART
          </h4>
          <p className="font-body text-white/50 tracking-wider">
            ALL RIGHTS RESERVED © {new Date().getFullYear()}
          </p>
        </div>

        {/* Social Icons with jagged containers */}
        <div className="flex items-center gap-6">
          <a 
            href="https://discord.gg/esFJ8Tjc9n" 
            target="_blank" 
            rel="noreferrer"
            className="group relative w-12 h-12 flex items-center justify-center bg-white hover:bg-[#5865F2] transition-colors duration-300 clip-path-shard transform hover:scale-110"
          >
            <SiDiscord className="text-2xl text-black group-hover:text-white transition-colors" />
          </a>
          
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noreferrer"
            className="group relative w-12 h-12 flex items-center justify-center bg-white hover:bg-[#FF0000] transition-colors duration-300 clip-path-shard transform hover:scale-110"
          >
            <SiYoutube className="text-2xl text-black group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>
    </footer>
  );
}
