import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { testimonial1 as t1, testimonial2 as t2, testimonial3 as t3 } from "../assets";
import { customerReviewsAPI } from "../../../lib/api";

// ─── Fallback static items ────────────────────────────────────────────────────
const FALLBACK_AR = [
  { id: "f1", customerName: "منى خالد", customerTitle: "عميلة", feedback: "منصة رائعة ساعدتني أفهم مشكلتي، الدكتورة كانت راقية.", imageUrl: t1, rate: 5 },
  { id: "f2", customerName: "أحمد محمود", customerTitle: "عميل", feedback: "ساعدوني في اختيار دكتور مناسب باحترافية وخصوصية تامة.", imageUrl: t2, rate: 5 },
  { id: "f3", customerName: "فاطمة علي", customerTitle: "عميلة", feedback: "الدعم كان سريع والمتخصصين متفهمين جدًا.", imageUrl: t3, rate: 5 },
];
const FALLBACK_EN = [
  { id: "f1", customerName: "Mona Khaled", customerTitle: "Client", feedback: "A wonderful platform that helped me understand my issue. The doctor was excellent.", imageUrl: t1, rate: 5 },
  { id: "f2", customerName: "Ahmed Mahmoud", customerTitle: "Client", feedback: "They helped me choose the right doctor with care and complete privacy.", imageUrl: t2, rate: 5 },
  { id: "f3", customerName: "Fatma Ali", customerTitle: "Client", feedback: "Support was fast and the specialists were very understanding.", imageUrl: t3, rate: 5 },
];

// ─── Mini star display ────────────────────────────────────────────────────────
function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 mt-1" aria-label={`Rating: ${value} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3 w-3 ${n <= value ? "text-amber-400 fill-amber-400" : "text-border fill-transparent"}`}
        />
      ))}
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex min-h-[220px] flex-col rounded-lg border border-border bg-background-paper p-6 animate-pulse">
      <div className="h-8 w-8 rounded-lg bg-background-subtle" />
      <div className="mt-4 flex-1 space-y-2">
        <div className="h-3 bg-background-subtle rounded w-full" />
        <div className="h-3 bg-background-subtle rounded w-5/6" />
        <div className="h-3 bg-background-subtle rounded w-4/6" />
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="h-16 w-16 rounded-full bg-background-subtle shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-background-subtle rounded w-3/4" />
          <div className="h-2 bg-background-subtle rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export const Testimonials = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [reviews, setReviews] = useState<Array<{
    id: string;
    customerName: string;
    customerTitle?: string | null;
    feedback: string;
    imageUrl?: string | null;
    rate: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    customerReviewsAPI
      .getPublicReviews(1, 6)
      .then((res) => {
        if (cancelled) return;
        const success = res?.isSuccess ?? res?.IsSuccess;
        // Accept both explicit success and undefined (some APIs omit the flag)
        if (success === false) {
          setReviews(isAr ? FALLBACK_AR : FALLBACK_EN);
          return;
        }
        const data = res?.data ?? res?.Data ?? res;
        const items: any[] = data?.items ?? data?.Items ?? [];
        if (items.length === 0) {
          setReviews(isAr ? FALLBACK_AR : FALLBACK_EN);
        } else {
          // Normalize PascalCase/camelCase — Snowflake IDs stay as strings
          setReviews(
            items.map((r: any) => ({
              id: String(r.id ?? r.Id ?? ""),
              customerName: r.customerName ?? r.CustomerName ?? "",
              customerTitle: r.customerTitle ?? r.CustomerTitle ?? null,
              feedback: r.feedback ?? r.Feedback ?? "",
              rate: r.rate ?? r.Rate ?? 0,
              imageUrl: r.imageUrl ?? r.ImageUrl ?? null,
            }))
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReviews(isAr ? FALLBACK_AR : FALLBACK_EN);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Limit to at most 3 for the landing layout
  const displayed = reviews.slice(0, 3);

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-black text-text-heading">
          {isAr ? "ماذا يقول عملاؤنا" : "What our clients say"}
        </h2>

        <div className="mt-8 grid gap-12 md:grid-cols-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            displayed.map((item) => (
              <article
                key={item.id}
                className="flex min-h-[220px] flex-col rounded-lg border border-border bg-background-paper p-6"
              >
                <Quote
                  className={`h-8 w-8 shrink-0 text-[#78a794] ${isAr ? "ms-auto" : "me-auto"}`}
                  strokeWidth={1.5}
                />

                <p className="mt-4 flex-1 text-start text-sm font-semibold leading-8 text-text">
                  {String(item.feedback)}
                </p>

                <div className="mt-6 flex items-center justify-between gap-4">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.customerName}
                      className="h-16 w-16 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-16 w-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-black border-2 border-primary/20"
                      aria-label={item.customerName}
                    >
                      {String(item.customerName).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 text-start flex-1">
                    <p className="text-sm font-black text-text-heading">{item.customerName}</p>
                    {item.customerTitle && (
                      <p className="mt-0.5 text-xs font-semibold text-text-light">{item.customerTitle}</p>
                    )}
                    <Stars value={item.rate} />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-7 flex justify-center gap-2">
          <span className="h-2 w-2 rounded-full border border-text-light" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
          <span className="h-2 w-2 rounded-full border border-text-light" aria-hidden />
        </div>
      </div>
    </section>
  );
};
