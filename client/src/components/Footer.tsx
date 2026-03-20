import { SiDiscord, SiYoutube } from "react-icons/si";
import { Link } from "wouter";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-black border-t-4 border-primary mt-auto relative overflow-hidden">

      {/* Decorative angled bg shapes */}
      <div className="absolute top-0 right-0 w-72 h-full bg-primary/5 transform -skew-x-12 translate-x-1/4 pointer-events-none" />
      <div className="absolute top-0 left-0 w-40 h-full bg-white/[0.02] transform skew-x-12 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10">

        {/* Main footer content */}
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">

            {/* Brand column */}
            <div className="flex flex-col gap-3 max-w-xs">
              <span className="font-display text-3xl text-white italic tracking-tight transform -skew-x-6 leading-none">
                PHANTOMS<span className="text-primary">SHOP</span>
              </span>
              <p className="text-white/40 text-xs uppercase tracking-widest font-body">
                Trusted by The Phantom Thieves
              </p>
              <div className="flex gap-3 mt-1">
                <a
                  href="https://discord.gg/esFJ8Tjc9n"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Discord"
                  className="group w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-[#5865F2] hover:border-[#5865F2] transition-all duration-300"
                >
                  <SiDiscord className="text-lg text-white/60 group-hover:text-white transition-colors" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="group w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-[#FF0000] hover:border-[#FF0000] transition-all duration-300"
                >
                  <SiYoutube className="text-lg text-white/60 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              <div className="flex flex-col gap-2">
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">الموقع</p>
                {[
                  { href: "/shop", label: "المتجر" },
                  { href: "/codes", label: "الأكواد" },
                  { href: "/orders", label: "الطلبات" },
                ].map(link => (
                  <Link key={link.href} href={link.href}>
                    <span className="text-white/40 hover:text-white text-sm font-body transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">مساعدة</p>
                {[
                  { href: "/faq", label: "الأسئلة الشائعة" },
                  { href: "/reviews", label: "آراء العملاء" },
                ].map(link => (
                  <Link key={link.href} href={link.href}>
                    <span className="text-white/40 hover:text-white text-sm font-body transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/25 text-xs font-body tracking-wide">
              &copy; {year} <span className="text-white/40 font-semibold">Phantoms Shop</span> — جميع الحقوق محفوظة
            </p>
            <p className="text-white/15 text-[10px] font-body tracking-wider uppercase">
              TAKE YOUR HEART
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
