import { SEO } from '@/components/SEO';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy | MorganFinance Bank"
        description="How MorganFinance Bank collects, uses, and protects your personal and financial information."
        path="/privacy"
      />
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: March 31, 2026</p>

          <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly, including your name, email address, phone number, date of birth, Social Security number (for account opening), government-issued identification, and financial information necessary to provide banking services.</p>
              <p>We also automatically collect device information, IP addresses, browser type, and usage data when you interact with our website and mobile applications.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To open, maintain, and service your accounts</li>
                <li>To process transactions and send related communications</li>
                <li>To verify your identity and prevent fraud</li>
                <li>To comply with legal and regulatory requirements (AML, KYC)</li>
                <li>To improve our services and develop new features</li>
                <li>To send service-related notifications and updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">3. Information Sharing</h2>
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Service providers who assist in delivering our banking services</li>
                <li>Regulatory authorities as required by law</li>
                <li>Credit bureaus for credit reporting purposes</li>
                <li>Law enforcement when required by valid legal process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">4. Data Security</h2>
              <p>We employ 256-bit SSL encryption, multi-factor authentication, SOC 2 Type II certified infrastructure, and regular penetration testing to protect your data. Access to personal information is restricted to authorized personnel on a need-to-know basis.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">5. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal information, subject to legal and regulatory retention requirements. You may opt out of marketing communications at any time. Contact us at privacy@securebank.com for any data-related requests.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">6. Cookies & Tracking</h2>
              <p>We use essential cookies to operate our website and optional analytics cookies to improve our services. You can manage your cookie preferences through your browser settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">7. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, contact our Privacy Officer at:</p>
              <p>Email: privacy@securebank.com<br />Phone: +1 (800) 123-4567<br />Mail: 123 Financial District, Banking Tower, City Center</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;