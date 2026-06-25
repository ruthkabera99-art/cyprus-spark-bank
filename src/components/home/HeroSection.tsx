import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="bg-[#f5f0e0] px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-[#064e3b] p-8 sm:p-12 md:p-20 rounded-3xl overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0d7a5f] opacity-20 skew-x-12 translate-x-1/4" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#c9a84c]/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl animate-fade-in">
            <span className="text-[#c9a84c] uppercase tracking-[0.2em] text-xs font-semibold mb-6 block">
              Est. 1974 — Private Banking
            </span>
            <h1 className="text-[#f5f0e0] font-serif text-4xl sm:text-5xl md:text-7xl leading-tight mb-8">
              Preserving <span className="italic text-[#c9a84c]">legacy</span> across generations.
            </h1>
            <p className="text-[#f5f0e0]/80 text-base sm:text-lg leading-relaxed mb-10 max-w-xl">
              MorganFinance Bank delivers bespoke financial orchestration — FDIC-insured deposits, collateral-backed lending, and global digital banking, trusted by 2M+ clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-[#c9a84c] text-[#064e3b] font-semibold rounded-lg hover:bg-white transition-all shadow-lg text-center"
              >
                Open Private Account
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 border border-[#0d7a5f] text-[#f5f0e0] font-semibold rounded-lg hover:bg-[#0d7a5f] transition-all text-center"
              >
                Our Philosophy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
