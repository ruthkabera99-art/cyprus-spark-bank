import { SEO } from '@/components/SEO';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TopBar } from '@/components/home/TopBar';
import { HeroSection } from '@/components/home/HeroSection';
import { PaymentPartnersSection } from '@/components/home/PaymentPartnersSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { StatsSection } from '@/components/home/StatsSection';
import { TrustBadgesSection } from '@/components/home/TrustBadgesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FAQSection } from '@/components/home/FAQSection';
import { DisclaimerSection } from '@/components/home/DisclaimerSection';
import { CTASection } from '@/components/home/CTASection';
import { DownloadAppSection } from '@/components/home/DownloadAppSection';

const faqs = [
  { q: 'Is my money safe with MorganFinance Bank?', a: 'Yes. All deposits are FDIC insured up to $250,000 per depositor, per ownership category. We use 256-bit SSL encryption, multi-factor authentication, and undergo regular SOC 2 Type II security audits.' },
  { q: 'What fees should I expect?', a: 'Our personal checking account has no monthly maintenance fee. Wire transfer fees, ATM fees, and other service charges are clearly disclosed in our fee schedule before you open an account.' },
  { q: 'How do collateral-backed loans work?', a: 'You pledge an asset (real estate, vehicle, equipment, or cryptocurrency) as collateral to secure a loan, allowing lower interest rates than unsecured loans. Loan-to-value and terms depend on the collateral.' },
  { q: 'How long does it take to open an account?', a: 'Online account opening typically takes under 10 minutes. You will need a valid government-issued ID and your Social Security number. Most accounts are approved instantly.' },
  { q: 'Can I access my account from outside the country?', a: 'Yes. Our online and mobile banking platforms are accessible worldwide, 24/7, with bank-grade encryption and device verification for new locations.' },
  { q: 'What happens if I miss a loan payment?', a: 'Contact us immediately. We offer hardship programs and may adjust your payment schedule. Late payments may incur fees. For collateral-backed loans, sustained non-payment may result in collateral liquidation.' },
  { q: 'Does MorganFinance Bank guarantee investment returns?', a: 'No. All investments carry risk, including potential loss of principal. Past performance is not indicative of future results.' },
  { q: 'How can I contact support?', a: 'Reach us via phone at +1 (800) 123-4567 (24/7), email at support@morganfinance.us, or live chat on our website.' },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://morganfinance.us/' },
  ],
};

const servicesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FinancialProduct',
  name: 'MorganFinance Banking Services',
  provider: { '@type': 'BankOrCreditUnion', name: 'MorganFinance Bank', url: 'https://morganfinance.us' },
  description: 'FDIC-insured checking, savings, business banking, and collateral-backed loans with 24/7 secure digital access.',
  areaServed: 'US',
  feesAndCommissionsSpecification: 'No monthly maintenance fees on personal checking. Transparent fee schedule.',
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="MorganFinance Bank — Online Banking, Loans & FDIC-Insured Accounts"
        description="Open an FDIC-insured checking, savings, or business account with MorganFinance Bank. Instant transfers, collateral-backed loans, and 24/7 secure digital banking trusted by 2M+ customers."
        path="/"
        jsonLd={[faqJsonLd, breadcrumbJsonLd, servicesJsonLd]}
      />
      <TopBar />
      <Header />
      <main>
        <HeroSection />
        <PaymentPartnersSection />
        <HowItWorksSection />
        <ServicesSection />
        <FeaturesSection />
        <StatsSection />
        <TrustBadgesSection />
        <TestimonialsSection />
        <FAQSection />
        <DownloadAppSection />
        <CTASection />
        <DisclaimerSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
