import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, ListChecks } from "lucide-react";
import { toast } from "sonner";

type IssueKey =
  | "missing_title"
  | "title_too_long"
  | "missing_description"
  | "description_too_long"
  | "missing_canonical"
  | "missing_viewport"
  | "noindex"
  | "missing_og_title"
  | "missing_og_description"
  | "missing_og_url"
  | "missing_og_type"
  | "missing_og_image"
  | "missing_twitter_card"
  | "no_h1"
  | "multiple_h1"
  | "missing_lang";

const ISSUE_LABEL: Record<IssueKey, string> = {
  missing_title: "Missing <title>",
  title_too_long: "Title over 60 chars",
  missing_description: "Missing meta description",
  description_too_long: "Description over 160 chars",
  missing_canonical: "Missing canonical URL",
  missing_viewport: "Missing viewport meta",
  noindex: "Page set to noindex",
  missing_og_title: "Missing og:title",
  missing_og_description: "Missing og:description",
  missing_og_url: "Missing og:url",
  missing_og_type: "Missing og:type",
  missing_og_image: "Missing og:image",
  missing_twitter_card: "Missing twitter:card",
  no_h1: "No H1 in raw HTML (SPA)",
  multiple_h1: "Multiple H1 tags",
  missing_lang: "Missing html lang",
};

const ISSUE_SEVERITY: Record<IssueKey, "fail" | "warn"> = {
  missing_title: "fail",
  title_too_long: "warn",
  missing_description: "fail",
  description_too_long: "warn",
  missing_canonical: "warn",
  missing_viewport: "fail",
  noindex: "fail",
  missing_og_title: "fail",
  missing_og_description: "fail",
  missing_og_url: "fail",
  missing_og_type: "fail",
  missing_og_image: "warn",
  missing_twitter_card: "warn",
  no_h1: "warn",
  multiple_h1: "warn",
  missing_lang: "warn",
};

type PageResult = {
  url: string;
  ok: boolean;
  issues: IssueKey[];
  error?: string;
};

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractSitemapUrls(xml: string): string[] {
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) ?? [];
  return matches.map((m) => m.replace(/<\/?loc>/g, "").trim()).filter(Boolean);
}

function analyzePage(html: string): IssueKey[] {
  const issues: IssueKey[] = [];
  const doc = new DOMParser().parseFromString(html, "text/html");

  const title = doc.querySelector("title")?.textContent?.trim() ?? "";
  if (!title) issues.push("missing_title");
  else if (title.length > 60) issues.push("title_too_long");

  const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "";
  if (!desc) issues.push("missing_description");
  else if (desc.length > 160) issues.push("description_too_long");

  if (!doc.querySelector('link[rel="canonical"]')) issues.push("missing_canonical");
  if (!doc.querySelector('meta[name="viewport"]')) issues.push("missing_viewport");

  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute("content")?.toLowerCase() ?? "";
  if (robots.includes("noindex")) issues.push("noindex");

  const og = (p: string) => doc.querySelector(`meta[property="${p}"]`)?.getAttribute("content")?.trim() ?? "";
  if (!og("og:title")) issues.push("missing_og_title");
  if (!og("og:description")) issues.push("missing_og_description");
  if (!og("og:url")) issues.push("missing_og_url");
  if (!og("og:type")) issues.push("missing_og_type");
  if (!og("og:image")) issues.push("missing_og_image");

  if (!doc.querySelector('meta[name="twitter:card"]')) issues.push("missing_twitter_card");

  const h1Count = doc.querySelectorAll("h1").length;
  if (h1Count === 0) issues.push("no_h1");
  else if (h1Count > 1) issues.push("multiple_h1");

  if (!doc.documentElement.getAttribute("lang")) issues.push("missing_lang");

  return issues;
}

const STATUS_ICON = {
  fail: { Icon: XCircle, color: "text-destructive" },
  warn: { Icon: AlertTriangle, color: "text-warning" },
  pass: { Icon: CheckCircle2, color: "text-success" },
};

export function SeoBulkScanPanel() {
  const [sitemapUrl, setSitemapUrl] = useState(
    typeof window !== "undefined" ? `${window.location.origin}/sitemap.xml` : "/sitemap.xml"
  );
  const [maxUrls, setMaxUrls] = useState(20);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<PageResult[] | null>(null);

  const run = async () => {
    setScanning(true);
    setResults(null);
    setProgress(0);
    try {
      const xml = await fetchText(sitemapUrl);
      if (!xml) {
        toast.error("Could not fetch sitemap.xml");
        setScanning(false);
        return;
      }
      const urls = extractSitemapUrls(xml).slice(0, maxUrls);
      if (urls.length === 0) {
        toast.error("No <loc> URLs found in sitemap");
        setScanning(false);
        return;
      }
      toast.message(`Scanning ${urls.length} URL${urls.length > 1 ? "s" : ""}…`);

      const out: PageResult[] = [];
      for (let i = 0; i < urls.length; i++) {
        const u = urls[i];
        const html = await fetchText(u);
        if (!html) {
          out.push({ url: u, ok: false, issues: [], error: "Fetch failed (CORS or 4xx/5xx)" });
        } else {
          out.push({ url: u, ok: true, issues: analyzePage(html) });
        }
        setProgress(Math.round(((i + 1) / urls.length) * 100));
        setResults([...out]);
      }
      const totalIssues = out.reduce((s, r) => s + r.issues.length, 0);
      toast.success(`Scanned ${out.length} pages · ${totalIssues} issue${totalIssues === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error("Bulk scan failed");
    } finally {
      setScanning(false);
    }
  };

  // Aggregate counts
  const counts: Partial<Record<IssueKey, number>> = {};
  results?.forEach((r) => r.issues.forEach((k) => (counts[k] = (counts[k] ?? 0) + 1)));
  const summary = (Object.entries(counts) as [IssueKey, number][])
    .sort((a, b) => b[1] - a[1]);

  const pagesScanned = results?.length ?? 0;
  const cleanPages = results?.filter((r) => r.ok && r.issues.length === 0).length ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" /> Bulk Sitemap Scan
            </CardTitle>
            <CardDescription>
              Fetch URLs from your sitemap.xml and summarize the most common SEO issues across pages.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
          <div className="space-y-1">
            <Label htmlFor="sitemap-url" className="text-xs">Sitemap URL</Label>
            <Input
              id="sitemap-url"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              disabled={scanning}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="max-urls" className="text-xs">Max URLs</Label>
            <Input
              id="max-urls"
              type="number"
              min={1}
              max={100}
              value={maxUrls}
              onChange={(e) => setMaxUrls(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              disabled={scanning}
            />
          </div>
          <Button onClick={run} disabled={scanning}>
            {scanning ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning…</>
            ) : (
              <><ListChecks className="h-4 w-4 mr-2" /> Scan sitemap</>
            )}
          </Button>
        </div>

        {scanning && <Progress value={progress} className="h-2" />}

        {results && results.length > 0 && (
          <>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <Badge variant="secondary">{pagesScanned} pages scanned</Badge>
              <Badge variant="default">{cleanPages} clean</Badge>
              <Badge variant="destructive">{pagesScanned - cleanPages} with issues</Badge>
            </div>

            {summary.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Most common issues
                </h4>
                <div className="space-y-1">
                  {summary.map(([key, n]) => {
                    const sev = ISSUE_SEVERITY[key];
                    const { Icon, color } = STATUS_ICON[sev];
                    const pct = Math.round((n / pagesScanned) * 100);
                    return (
                      <div key={key} className="flex items-center gap-3 p-2 rounded border border-border">
                        <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{ISSUE_LABEL[key]}</p>
                          <p className="text-xs text-muted-foreground">
                            {n} of {pagesScanned} page{pagesScanned > 1 ? "s" : ""} ({pct}%)
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${color}`}>
                          {sev === "fail" ? "Fail" : "Warn"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Per-page results
              </h4>
              <ScrollArea className="h-64 rounded border border-border">
                <div className="p-2 space-y-1">
                  {results.map((r) => {
                    const sev: "fail" | "warn" | "pass" = !r.ok
                      ? "fail"
                      : r.issues.length === 0
                      ? "pass"
                      : r.issues.some((i) => ISSUE_SEVERITY[i] === "fail")
                      ? "fail"
                      : "warn";
                    const { Icon, color } = STATUS_ICON[sev];
                    return (
                      <div key={r.url} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono truncate">{r.url}</p>
                          {r.error ? (
                            <p className="text-xs text-destructive">{r.error}</p>
                          ) : r.issues.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No issues</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {r.issues.map((k) => ISSUE_LABEL[k]).join(" · ")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <p className="text-xs text-muted-foreground">
              Note: external URLs may fail to fetch from the browser due to CORS. For best results, scan URLs on the
              same origin as this dashboard.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
