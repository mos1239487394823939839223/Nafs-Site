import { useEffect, useState } from "react";
import { ExternalLink, Beaker, Tag, Loader2, ClipboardCheck } from "lucide-react";
import { medicalAPI } from "../../lib/api";

export default function TestDetailModal({ open, onOpenChange, test, result, isRTL }) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={isRTL ? "rtl" : "ltr"}
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

          {/* External link */}
          {test.url && (
            <a
              href={test.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline bg-primary/5 px-4 py-2.5 rounded-xl border border-primary/20 transition-colors hover:bg-primary/10"
            >
              <ExternalLink className="w-4 h-4" />
              {isRTL ? "فتح الاختبار" : "Open Test"}
            </a>
          )}

          {/* Associated conditions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-text-heading">
                {isRTL ? "الأمراض المرتبطة" : "Associated Conditions"}
              </h3>
            </div>
            {loadingDiseases ? (
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isRTL ? "جاري التحميل..." : "Loading..."}
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
                {isRTL ? "لا توجد أمراض مرتبطة" : "No associated conditions"}
              </p>
            )}
          </div>

          {/* Result section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-text-heading">
                {isRTL ? "النتيجة" : "Result"}
              </h3>
            </div>
            {hasResult ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <ClipboardCheck className="w-4 h-4" />
                  {isRTL ? "تم إرسال النتيجة" : "Result submitted"}
                </div>
                <p className="text-sm text-text-heading whitespace-pre-wrap">
                  {result.resultText}
                </p>
                <p className="text-xs text-text-muted">
                  {isRTL ? "وقت الإدخال:" : "Submitted at:"}{" "}
                  {new Date(result.submittedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">
                {isRTL ? "لم تُرسل نتيجة بعد" : "No result submitted yet"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
