import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: March 31, 2026</p>

          <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using SecureBank's website, mobile applications, or any of our banking services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">2. Eligibility</h2>
              <p>You must be at least 18 years of age and a legal resident of the United States to open an account. By registering, you represent that all information provided is accurate, current, and complete.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">3. Account Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You must notify us immediately of any unauthorized access to your account.</li>
                <li>You agree not to use our services for any unlawful purpose, including money laundering or fraud.</li>
                <li>We reserve the right to suspend or close accounts that violate these terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">4. Banking Services</h2>
              <p>All banking services, including deposits, withdrawals, transfers, and loans, are subject to applicable fees, processing times, and regulatory requirements. Specific terms for each product are provided at the time of application or enrollment.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">5. Loan Terms & Collateral</h2>
              <p>Loan products are subject to credit approval. Interest rates, loan-to-value ratios, and repayment terms are determined based on your creditworthiness and collateral value. Failure to meet repayment obligations may result in collateral liquidation as outlined in your loan agreement.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
              <p>SecureBank shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount of fees paid by you in the twelve (12) months preceding the claim.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">7. Dispute Resolution</h2>
              <p>Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You agree to waive your right to participate in class action lawsuits.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">8. Modifications</h2>
              <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email or in-app notification at least 30 days before they take effect. Continued use of our services constitutes acceptance of updated terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-3">9. Contact</h2>
              <p>For questions about these Terms, contact us at:</p>
              <p>Email: legal@securebank.com<br />Phone: +1 (800) 123-4567<br />Mail: 123 Financial District, Banking Tower, City Center</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;