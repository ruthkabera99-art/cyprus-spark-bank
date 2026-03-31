import { Info } from 'lucide-react';

export function DisclaimerSection() {
  return (
    <section className="py-8 bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex gap-3 items-start max-w-4xl mx-auto">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Important Disclosures:</strong> SecureBank is an FDIC-insured institution. Deposits are insured up to $250,000 per depositor, per insured bank, for each account ownership category. Loan products are subject to credit approval. Rates, terms, and conditions are subject to change without notice.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Risk Disclaimer:</strong> All financial products carry risk. Past performance does not guarantee future results. Investment products are not FDIC insured, are not bank guaranteed, and may lose value. Collateral-backed loans carry the risk of collateral liquidation upon default. Please review all terms and conditions before applying.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Equal Housing Lender. NMLS# 123456. © {new Date().getFullYear()} SecureBank. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}