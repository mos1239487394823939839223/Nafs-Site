import { useEffect, useState } from "react";
import { ExternalLink, Beaker, Tag, Loader2, ClipboardCheck, Target, Clock3, WalletCards, ListChecks } from "lucide-react";
import { medicalAPI } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TestDetailModal({ open, onOpenChange, test, result, isRTL }) {
  const { t } = useLanguage();
  const [diseases, setDiseases] = useState([]);
  const [loadingDiseases, setLoadingDiseases] = useState(false);

  useEffect(() => {
    if (!open || !test?.id) return;
    let cancelled = false;

    const fetchDiseases = async () => {
      setLoadingDiseases(true);
      try {
        const response = await medicalAPI.getTestTypeDiseases(test.id);
        const data = response?.Data ?? response?.data ?? response;
        const items = Array.isArray(data?.Items)
          ? data.Items
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        if (!cancelled) {
          setDiseases(
            items
              .map((d) => String(d?.Name ?? d?.name ?? "").trim())
              .filter(Boolean),
          );
        }
      } catch {
        if (!cancelled) setDiseases([]);
      } finally {
        if (!cancelled) setLoadingDiseases(false);
      }
    };

    fetchDiseases();
    return () => {
      cancelled = true;
    };
  }, [open, test?.id]);

  if (!open || !test) return null;

  const hasResult = Boolean(String(result?.resultText || "").trim());
  const tagNames = diseases.length > 0
    ? diseases
    : test.tagName
    ? [test.tagName]
    : [];
  const steps = Array.isArray(test.steps)
    ? test.steps
    : String(test.steps || "")
        .split(/\r?\n|,/)
        .map((step) => step.trim())
        .filter(Boolean);
  const hasPrice = test.price !== null && test.price !== undefined && String(test.price).trim() !== "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative bg-background-paper rounded-2xl shadow-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-3 p-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Beaker className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-heading leading-tight">
              {test.name}
            </h2>
            {test.tagName && (
              <p className="text-sm text-text-muted mt-0.5">{test.tagName}</p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-text-muted hover:text-text-heading transition-colors p-1 rounded-lg hover:bg-background-subtle flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Description */}
          {test.description && (
            <div>
              <p className="text-sm text-text-muted leading-relaxed">
                {test.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background-subtle/60 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1">
                <Target className="w-4 h-4 text-primary" />
                {t("auto.testPurpose", "Test purpose")}
              </div>
              <p className="text-sm text-text-heading">{test.purpose || t("auto.testPurposeFallback", "Understand your current needs and support the next step.")}</p>
            </div>
            <div className="rounded-xl border border-border bg-background-subtle/60 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1">
                <Clock3 className="w-4 h-4 text-primary" />
                {t("auto.testDuration", "Duration")}
              </div>
              <p className="text-sm text-text-heading">{test.duration || t("auto.durationVaries", "Varies by test")}</p>
            </div>
            {hasPrice && (
              <div className="rounded-xl border border-border bg-background-subtle/60 p-3 sm:col-span-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1">
                  <WalletCards className="w-4 h-4 text-primary" />
                  {t("auto.price", "Price")}
                </div>
                <p className="text-sm text-text-heading">{test.price}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-text-heading">{t("auto.howToStart", "How to start")}</h3>
            </div>
            <ol className="space-y-2 text-sm text-text-muted">
              {(steps.length > 0 ? steps : [
                t("auto.reviewTestDetails", "Review the test details."),
                t("auto.openAndCompleteTest", "Open and complete the test."),
                t("auto.returnAndSubmitResult", "Return and submit your result."),
              ]).map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0">{index + 1}</span>
                  <span>{typeof step === "string" ? step : String(step?.Name ?? step?.name ?? "")}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Associated conditions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-text-heading">
                {t("auto.associatedConditions")}
              </h3>
            </div>
            {loadingDiseases ? (
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("auto.loading")}
              </div>
            ) : tagNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tagNames.map((name, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-medium"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">
                {t("auto.noAssociatedConditions")}
              </p>
            )}
          </div>

          {/* Result section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-text-heading">
                {t("auto.result")}
              </h3>
            </div>
            {hasResult ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <ClipboardCheck className="w-4 h-4" />
                  {t("auto.resultSubmitted")}
                </div>
                <p className="text-sm text-text-heading whitespace-pre-wrap">
                  {result.resultText}
                </p>
                <p className="text-xs text-text-muted">
                  {t("auto.submittedAt")}{" "}
                  {new Date(result.submittedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">
                {t("auto.noResultSubmittedYet")}
              </p>
            )}
          </div>

          {test.url && (
            <a
              href={test.url}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-semibold bg-primary px-4 py-3 rounded-xl transition-colors hover:bg-primary-dark"
            >
              <ExternalLink className="w-4 h-4" />
              {t("auto.startTest", "Start test")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
