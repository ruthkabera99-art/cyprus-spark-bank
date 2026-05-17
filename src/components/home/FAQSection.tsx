import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const buildFaqs = (s: { phone: string; email: string; address: string; hours: string }) => [
  {
    question: 'Is my money safe with MorganFinance Bank?',
    answer: 'Yes. All deposits are FDIC insured up to $250,000 per depositor, per ownership category. We use 256-bit SSL encryption, multi-factor authentication, and undergo regular SOC 2 Type II security audits. Your funds are protected by the same standards used by the largest financial institutions.',
  },
  {
    question: 'What fees should I expect?',
    answer: 'We believe in full transparency. Our personal checking account has no monthly maintenance fee. Wire transfer fees, ATM fees (if any), and other service charges are clearly disclosed in our fee schedule before you open an account. There are no hidden charges.',
  },
  {
    question: 'How do collateral-backed loans work?',
    answer: 'You pledge an asset (real estate, vehicle, equipment, or cryptocurrency) as collateral to secure a loan. This allows us to offer lower interest rates compared to unsecured loans. If you meet your repayment obligations, your collateral remains yours. The loan-to-value ratio and terms depend on the type and value of the collateral.',
  },
  {
    question: 'How long does it take to open an account?',
    answer: 'Online account opening typically takes under 10 minutes. You\'ll need a valid government-issued ID and your Social Security number. Most accounts are approved instantly, though some may require additional verification within 1–2 business days.',
  },
  {
    question: 'Can I access my account from outside the country?',
    answer: 'Yes. Our online and mobile banking platforms are accessible worldwide, 24/7. All international sessions use the same bank-grade encryption. Standard security protocols apply, including device verification for new locations.',
  },
  {
    question: 'What happens if I miss a loan payment?',
    answer: 'We understand that financial difficulties can arise. If you anticipate missing a payment, contact us immediately. We offer hardship programs and may be able to adjust your payment schedule. Late payments may incur fees and could affect your credit score. For collateral-backed loans, sustained non-payment may result in collateral liquidation as outlined in your loan agreement.',
  },
  {
    question: 'Does MorganFinance Bank guarantee investment returns?',
    answer: 'No. MorganFinance Bank does not guarantee returns on any investment product. All investments carry risk, including the potential loss of principal. Past performance is not indicative of future results. We encourage all customers to consult with a qualified financial advisor before making investment decisions.',
  },
  {
    question: 'How can I contact support?',
    answer: `You can reach us via phone at ${s.phone} (24/7), email at ${s.email}, or through the live chat on our website. Our branch at ${s.address} is open ${s.hours}.`,
  },
];

export function FAQSection() {
  const { data: settings } = useSiteSettings();
  const faqs = buildFaqs({
    phone: settings?.contact_phone ?? '+1 (800) 123-4567',
    email: settings?.contact_email ?? 'support@morganfinancebank.com',
    address: settings?.contact_address ?? '123 Financial District, Banking Tower, City Center',
    hours: settings?.contact_hours ?? 'Mon–Fri, 9 AM – 5 PM',
  });
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Honest answers to the questions our customers ask most.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-elegant transition-all"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5 text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}