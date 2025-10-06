"use client";

import { useState } from "react";
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AIErrorInsightResult } from "@/lib/types";

interface ErrorsViewProps {
  userId: string;
}

export function ErrorsView({ userId }: ErrorsViewProps) {
  const [errorText, setErrorText] = useState("");
  const [result, setResult] = useState<AIErrorInsightResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeError = async () => {
    if (!errorText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/ai/error-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorText, userId }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Error Log Analyzer</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Paste your error log for instant AI-powered insights and solutions
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Input Area */}
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your error log here...&#10;&#10;Example:&#10;TypeError: Cannot read property 'map' of undefined&#10;  at MyComponent (app.js:42:15)&#10;  at renderComponent (react-dom.js:1234:5)"
              value={errorText}
              onChange={(e) => setErrorText(e.target.value)}
              className="min-h-[200px] font-mono text-sm resize-none"
            />
            <Button
              onClick={analyzeError}
              disabled={!errorText.trim() || loading}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Error...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Error with AI
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6 p-6 rounded-lg border border-border bg-card animate-in fade-in duration-500">
              {/* Explanation */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  What This Means
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Detection */}
              <div className="flex gap-3 flex-wrap">
                <div className="px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs font-medium text-blue-500">
                    {result.detectedLanguage}
                  </span>
                </div>
                {result.detectedFramework && (
                  <div className="px-3 py-2 rounded-md bg-purple-500/10 border border-purple-500/20">
                    <span className="text-xs font-medium text-purple-500">
                      {result.detectedFramework}
                    </span>
                  </div>
                )}
              </div>

              {/* Causes */}
              {result.possibleCauses && result.possibleCauses.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base mb-3">
                    Possible Causes
                  </h3>
                  <ul className="space-y-2">
                    {result.possibleCauses.map((cause, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex gap-2"
                      >
                        <span className="text-orange-500 font-bold">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Solutions */}
              {result.solutions && result.solutions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base mb-3">Solutions</h3>
                  <div className="space-y-4">
                    {result.solutions.map((solution, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-border bg-accent/30"
                    >
                      <div className="flex items-start gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <h4 className="font-medium">{solution.title}</h4>
                      </div>
                      {solution.steps && solution.steps.length > 0 && (
                        <ol className="space-y-2 ml-7 mb-3">
                          {solution.steps.map((step, j) => (
                            <li
                              key={j}
                              className="text-sm text-muted-foreground leading-relaxed"
                            >
                              <span className="font-semibold text-foreground">
                                {j + 1}.
                              </span>{" "}
                              {step}
                            </li>
                          ))}
                        </ol>
                      )}
                      {solution.code && (
                        <pre className="mt-3 p-3 rounded-md bg-muted text-sm overflow-x-auto font-mono">
                          <code>{solution.code}</code>
                        </pre>
                      )}
                      {solution.reference && (
                        <a
                          href={solution.reference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Documentation
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Related Docs */}
              {result.relatedDocs && result.relatedDocs.length > 0 && (
                <div>
                  <h3 className="font-semibold text-base mb-3">
                    Related Documentation
                  </h3>
                  <div className="space-y-2">
                    {result.relatedDocs.map((doc, i) => (
                      <a
                        key={i}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline p-2 rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{doc}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
