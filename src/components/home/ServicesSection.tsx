import { Link } from 'react-router-dom';
import { ArrowRight, Wallet, Globe, Headphones, Bitcoin } from 'lucide-react';

export function ServicesSection() {
  return (
    <section className="bg-[#f5f0e0] px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Bento Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:auto-rows-[180px]">
          {/* Main Wealth Management */}
          <Link
            to="/personal"
            className="md:col-span-2 md:row-span-2 bg-white p-10 rounded-3xl border border-[#064e3b]/5 shadow-sm flex flex-col justify-between group hover:border-[#c9a84c] hover:shadow-xl transition-all"
          >
            <div>
              <div className="w-12 h-12 bg-[#064e3b] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-[#c9a84c]" />
              </div>
              <h3 className="font-serif text-2xl text-[#064e3b] mb-4">Wealth Management</h3>
              <p className="text-[#064e3b]/70 leading-relaxed">
                Tailored portfolio strategies and personal banking designed for long-term growth and capital preservation.
              </p>
            </div>
            <span className="text-[#c9a84c] font-semibold flex items-center gap-2 mt-6">
              View Strategies <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Global Markets */}
          <Link
            to="/business"
            className="md:col-span-2 bg-[#0d7a5f] p-8 rounded-3xl flex flex-col justify-center text-[#f5f0e0] relative overflow-hidden group hover:shadow-xl transition-all"
          >
            <div className="relative z-10">
              <Globe className="w-6 h-6 text-[#c9a84c] mb-3" />
              <h3 className="font-serif text-xl mb-2">Global Markets</h3>
              <p className="opacity-80 text-sm">
                24/7 access to international exchanges, wire transfers, and SWIFT liquidity.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
          </Link>

          {/* Concierge */}
          <Link
            to="/contact"
            className="md:col-span-1 bg-white p-8 rounded-3xl border border-[#064e3b]/5 flex flex-col items-center justify-center text-center group hover:border-[#c9a84c] transition-colors"
          >
            <Headphones className="w-6 h-6 text-[#064e3b] mb-3 group-hover:text-[#c9a84c] transition-colors" />
            <h4 className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-2">Concierge</h4>
            <p className="font-serif text-[#064e3b]">24/7 Advisory</p>
          </Link>

          {/* Digital Assets */}
          <Link
            to="/loans"
            className="md:col-span-1 bg-[#064e3b] p-8 rounded-3xl flex flex-col items-center justify-center text-center border border-[#c9a84c]/20 group hover:border-[#c9a84c] transition-colors"
          >
            <Bitcoin className="w-6 h-6 text-[#c9a84c] mb-3" />
            <h4 className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-2">Next-Gen</h4>
            <p className="font-serif text-white">Digital Assets</p>
          </Link>
        </div>

        {/* Trust signals + inline CTA */}
        <div className="flex flex-col md:flex-row items-center justify-between py-12 border-t border-[#064e3b]/10 gap-12">
          <div className="flex flex-wrap gap-12 items-center">
            <div className="flex flex-col">
              <span className="text-[#c9a84c] font-bold text-2xl">$420B+</span>
              <span className="text-[#064e3b]/60 text-xs uppercase tracking-tight">Assets Under Care</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#c9a84c] font-bold text-2xl">98%</span>
              <span className="text-[#064e3b]/60 text-xs uppercase tracking-tight">Client Retention</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#c9a84c] font-bold text-2xl">2M+</span>
              <span className="text-[#064e3b]/60 text-xs uppercase tracking-tight">Trusted Clients</span>
            </div>
          </div>

          <div className="bg-[#c9a84c]/10 px-8 py-6 rounded-2xl border-l-4 border-[#c9a84c] flex items-center justify-between gap-8 w-full md:w-auto">
            <div>
              <h4 className="font-serif text-[#064e3b] text-lg">Ready to transition?</h4>
              <p className="text-[#064e3b]/70 text-sm">Schedule a private consultation today.</p>
            </div>
            <Link
              to="/contact"
              aria-label="Contact us"
              className="p-4 bg-[#064e3b] text-white rounded-full hover:scale-110 transition-transform"
            >
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
