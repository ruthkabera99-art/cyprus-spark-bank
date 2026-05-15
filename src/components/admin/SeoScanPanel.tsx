import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type ScanStatus = "pass" | "warn" | "fail";

export type ScanCheck = {
  id: string;
  category: "Meta" | "Open Graph" | "Headings" | "Robots & Sitemap" | "Structured Data";
  label: string;
  status: ScanStatus;
  detail: string;
};

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

async function fetchText(path: string): Promise<string | null> {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function check(label: string, ok: boolean, passDetail: string, failDetail: string, soft = false): ScanCheck {
  return {
    id: label,
    category: "Meta",
    label,
    status: ok ? "pass" : soft ? "warn" : "fail",
    detail: ok ? passDetail : failDetail,
  };
}

export async function runSeoScan(): Promise<ScanCheck[]> {
  const checks: ScanCheck[] = [];
  const html = await fetchText("/");
  const robots = await fetchText("/robots.txt");
  const sitemap = await fetchText("/sitemap.xml");

  if (!html) {
    return [
      {
        id: "fetch",
        category: "Meta",
        label: "Fetch homepage",
        status: "fail",
        detail: "Could not fetch / — scan aborted.",
      },
    ];
  }

  const doc = new DOMParser().parseFromString(html, "text/html");

  // ===== Meta =====
  const title = doc.querySelector("title")?.textContent?.trim() ?? "";
  checks.push({
    id: "title",
    category: "Meta",
    label: "Title tag",
    status: title.length === 0 ? "fail" : title.length > 60 ? "warn" : "pass",
    detail: title
      ? `"${title}" (${title.length} chars${title.length > 60 ? " — over 60" : ""})`
      : "Missing <title>",
  });

  const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "";
  checks.push({
    id: "description",
    category: "Meta",
    label: "Meta description",
    status: !desc ? "fail" : desc.length > 160 ? "warn" : "pass",
    detail: desc
      ? `${desc.length} chars${desc.length > 160 ? " — over 160" : ""}`
      : "Missing meta description",
  });

  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
  checks.push({
    id: "canonical",
    category: "Meta",
    label: "Canonical URL",
    status: canonical ? "pass" : "warn",
    detail: canonical || "No <link rel=\"canonical\"> (recommended)",
  });

  const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? "";
  checks.push({
    id: "viewport",
    category: "Meta",
    label: "Viewport meta",
    status: viewport ? "pass" : "fail",
    detail: viewport || "Missing viewport meta — bad mobile UX",
  });

  const robotsMeta = doc.querySelector('meta[name="robots"]')?.getAttribute("content")?.toLowerCase() ?? "";
  const noindex = robotsMeta.includes("noindex");
  checks.push({
    id: "robots-meta",
    category: "Meta",
    label: "Robots meta",
    status: noindex ? "fail" : "pass",
    detail: noindex ? "noindex set — site blocked from search!" : robotsMeta || "Default (index, follow)",
  });

  // ===== Open Graph =====
  const ogTags = ["og:title", "og:description", "og:url", "og:type"];
  ogTags.forEach((tag) => {
    const v = doc.querySelector(`meta[property="${tag}"]`)?.getAttribute("content")?.trim() ?? "";
    checks.push({
      id: tag,
      category: "Open Graph",
      label: tag,
      status: v ? "pass" : "fail",
      detail: v || `Missing ${tag}`,
    });
  });
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content")?.trim() ?? "";
  checks.push({
    id: "og:image",
    category: "Open Graph",
    label: "og:image",
    status: ogImage ? "pass" : "warn",
    detail: ogImage || "No og:image — link previews will lack a thumbnail",
  });

  const twitterCard = doc.querySelector('meta[name="twitter:card"]')?.getAttribute("content") ?? "";
  checks.push({
    id: "twitter:card",
    category: "Open Graph",
    label: "twitter:card",
    status: twitterCard ? "pass" : "warn",
    detail: twitterCard || "No twitter:card meta",
  });

  // ===== Headings =====
  // Note: SPA — H1 may be in JS bundle, not raw HTML
  const h1s = doc.querySelectorAll("h1");
  const liveH1s = document.querySelectorAll("main h1, h1");
  const h1Count = h1s.length || liveH1s.length;
  checks.push({
    id: "h1",
    category: "Headings",
    label: "Single H1",
    status: h1Count === 1 ? "pass" : h1Count === 0 ? "warn" : "warn",
    detail:
      h1Count === 0
        ? "No H1 in homepage HTML (SPA — rendered client-side; check live DOM)"
        : `${h1Count} H1 element${h1Count > 1 ? "s" : ""} ${h1Count > 1 ? "— should be exactly one" : ""}`,
  });

  const langAttr = doc.documentElement.getAttribute("lang");
  checks.push({
    id: "lang",
    category: "Headings",
    label: "html lang attribute",
    status: langAttr ? "pass" : "warn",
    detail: langAttr ? `lang="${langAttr}"` : "Missing lang attribute on <html>",
  });

  // ===== Robots & Sitemap =====
  const hasRobots = !!robots;
  checks.push({
    id: "robots-file",
    category: "Robots & Sitemap",
    label: "robots.txt reachable",
    status: hasRobots ? "pass" : "fail",
    detail: hasRobots ? `${robots!.length} bytes` : "Could not fetch /robots.txt",
  });

  if (robots) {
    const hasSitemap = /^Sitemap:/im.test(robots);
    checks.push({
      id: "robots-sitemap",
      category: "Robots & Sitemap",
      label: "Sitemap directive in robots.txt",
      status: hasSitemap ? "pass" : "warn",
      detail: hasSitemap ? "Sitemap: line present" : "No Sitemap: directive in robots.txt",
    });
    const blocksAll = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/\s*(\n|$)/i.test(robots);
    checks.push({
      id: "robots-block",
      category: "Robots & Sitemap",
      label: "Crawlers not blocked",
      status: blocksAll ? "fail" : "pass",
      detail: blocksAll ? "robots.txt blocks all crawlers!" : "All crawlers allowed",
    });
  }

  checks.push({
    id: "sitemap-file",
    category: "Robots & Sitemap",
    label: "sitemap.xml reachable",
    status: sitemap ? "pass" : "fail",
    detail: sitemap ? `${sitemap.match(/<url>/g)?.length ?? 0} URLs` : "Could not fetch /sitemap.xml",
  });

  // ===== Structured Data =====
  const ldScripts = doc.querySelectorAll('script[type="application/ld+json"]');
  let validLd = 0;
  let ldTypes: string[] = [];
  ldScripts.forEach((s) => {
    try {
      const data = JSON.parse(s.textContent || "{}");
      validLd++;
      const t = Array.isArray(data) ? data.map((d) => d["@type"]) : [data["@type"]];
      ldTypes.push(...t.filter(Boolean));
    } catch {}
  });
  checks.push({
    id: "json-ld",
    category: "Structured Data",
    label: "JSON-LD schema",
    status: validLd > 0 ? "pass" : "warn",
    detail:
      validLd > 0
        ? `${validLd} block(s): ${ldTypes.join(", ")}`
        : "No JSON-LD found — add Organization or WebSite schema",
  });

  return checks;
}

const STATUS_META: Record<ScanStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  pass: { icon: CheckCircle2, color: "text-success", label: "Pass" },
  warn: { icon: AlertTriangle, color: "text-warning", label: "Warn" },
  fail: { icon: XCircle, color: "text-destructive", label: "Fail" },
};

interface SeoScanPanelProps {
  onScanComplete?: (checks: ScanCheck[]) => void;
}

export function SeoScanPanel({ onScanComplete }: SeoScanPanelProps) {
  const [checks, setChecks] = useState<ScanCheck[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScanAt, setLastScanAt] = useState<Date | null>(null);

  const run = async () => {
    setScanning(true);
    try {
      const results = await runSeoScan();
      setChecks(results);
      setLastScanAt(new Date());
      onScanComplete?.(results);
      const fails = results.filter((c) => c.status === "fail").length;
      const warns = results.filter((c) => c.status === "warn").length;
      if (fails === 0 && warns === 0) toast.success("SEO scan: all checks passed");
      else toast.message(`SEO scan: ${fails} fail, ${warns} warn`);
    } catch (e) {
      toast.error("Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const grouped = checks?.reduce<Record<string, ScanCheck[]>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  const total = checks?.length ?? 0;
  const passed = checks?.filter((c) => c.status === "pass").length ?? 0;
  const score = total ? Math.round((passed / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Automated SEO Scan</CardTitle>
            <CardDescription>
              Live check of meta tags, Open Graph, headings, robots.txt, sitemap, and structured data on{" "}
              <code className="text-xs">{ORIGIN}</code>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {checks && (
              <Badge variant={score === 100 ? "default" : score >= 80 ? "secondary" : "destructive"}>
                Score {score}
              </Badge>
            )}
            <Button onClick={run} disabled={scanning} size="sm">
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" /> {checks ? "Rescan" : "Run scan"}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!checks && !scanning && (
          <p className="text-sm text-muted-foreground">
            Click "Run scan" to audit the deployed site against SEO best practices.
          </p>
        )}
        {checks && (
          <>
            <Progress value={score} className="h-2" />
            {lastScanAt && (
              <p className="text-xs text-muted-foreground">
                Last scan: {lastScanAt.toLocaleTimeString()} · {passed}/{total} passed
              </p>
            )}
            {grouped &&
              Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {cat}
                  </h4>
                  <div className="space-y-1">
                    {items.map((c) => {
                      const meta = STATUS_META[c.status];
                      const Icon = meta.icon;
                      return (
                        <div
                          key={c.id}
                          className="flex items-start gap-3 p-2 rounded border border-border"
                        >
                          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{c.label}</p>
                            <p className="text-xs text-muted-foreground break-words">{c.detail}</p>
                          </div>
                          <Badge variant="outline" className={`text-xs ${meta.color}`}>
                            {meta.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
