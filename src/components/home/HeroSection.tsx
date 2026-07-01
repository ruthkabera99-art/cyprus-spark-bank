import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroCustomerService from '@/assets/hero-customer-service-bright.jpg';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-foreground min-h-[600px] md:min-h-[680px] lg:min-h-[720px] flex items-center">
      {/* Customer service photographic background — fully visible */}
      <div className="absolute inset-0">
        <img
          src={heroCustomerService}
          alt="MorganFinance banker shaking hands with a customer"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-[45%_center] sm:object-center animate-[heroZoom_20s_ease-in-out_infinite_alternate] brightness-110 contrast-110"
        />
        {/* Minimal scrim — just enough to anchor any text that might sit directly on the image edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/20 to-transparent md:from-foreground/50 md:via-foreground/10 md:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content card — readable without obscuring the whole image */}
          <div className="bg-foreground/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6 animate-fade-in border border-primary-foreground/10 shadow-2xl">
            {/* Trust chip */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-sm font-medium">
              <Shield className="w-4 h-4 text-success" />
              FDIC Insured · Trusted by 2M+ Customers
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground leading-tight">
              Secure Banking{' '}
              <span className="text-accent">You Can Trust</span>
            </h1>

            <p className="text-base sm:text-lg text-primary-foreground/85 max-w-lg leading-relaxed">
              Personal & business banking, collateral-backed loans, and secure digital transactions — protected by 256-bit encryption and backed by 50+ years of financial expertise.
            </p>

            {/* Key benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'No hidden fees or charges',
                'FDIC insured up to $250K',
                '24/7 customer support',
                'Bank-grade security',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-primary-foreground/90 text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg group" asChild>
                <Link to="/register">
                  Get Started Safely
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/15 font-semibold text-base px-8" asChild>
                <Link to="/login">
                  Login to Your Account
                </Link>
              </Button>
            </div>

            {/* Contact line */}
            <div className="flex items-center gap-2 text-primary-foreground/90 text-sm pt-2">
              <Phone className="w-4 h-4" />
              <span>Questions? Call us: <a href="tel:+18001234567" className="underline hover:text-primary-foreground transition-colors">+1 (800) 123-4567</a></span>
            </div>
          </div>

          {/* Spacer to keep layout balanced and image visible on the right */}
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
