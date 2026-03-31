import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { StatsSection } from '@/components/home/StatsSection';
import { TrustBadgesSection } from '@/components/home/TrustBadgesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FAQSection } from '@/components/home/FAQSection';
import { DisclaimerSection } from '@/components/home/DisclaimerSection';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TrustBadgesSection />
        <ServicesSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <DisclaimerSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;