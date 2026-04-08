import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Article as ArticleIcon,
  Search,
  BookmarkBorder as Bookmark,
  Bookmark as BookmarkFilled,
  AccessTime as Clock,
  Person as User,
  FiberManualRecord as Circle,
  Tag,
  TrendingUp,
  LocalOffer as TagIcon,
} from "@mui/icons-material";
import { useLanguage } from "../../contexts/LanguageContext";
import Badge from "../../components/ui/Badge";

// Mock articles data - in the future these will come from Admin/Technical Support
const mockArticles = [
  {
    id: 1,
    title: "How to Prepare for Your First Telehealth Visit",
    titleAr: "كيف تستعد لأول زيارة عن بُعد معك",
    summary:
      "Learn the steps to ensure your virtual consultation goes smoothly, from testing your connection to organizing your concerns beforehand.",
    summaryAr:
      "تعرف على الخطوات اللازمة لضمان سير استشارتك الافتراضية بسلاسة، من اختبار الاتصال إلى تنظيم استفساراتك مسبقًا.",
    content:
      "A telehealth visit can be just as effective as an in-person appointment when done right. Here are the key steps to prepare...",
    contentAr:
      "يمكن أن تكون زيارة الرعاية الصحية عن بُعد فعالة مثل المواعيد الشخصية عند إعدادها بالشكل الصحيح...",
    author: "Technical Support Team",
    authorAr: "فريق الدعم التقني",
    publishedAt: "2025-01-12",
    readTime: 5,
    category: "guide",
    tags: ["Telehealth", "Preparation", "Technology"],
    tagsAr: ["الرعاية عن بُعد", "الاستعداد", "التكنولوجيا"],
    image: null,
    featured: true,
  },
  {
    id: 2,
    title: "Understanding Mental Health: A Patient's Guide",
    titleAr: "فهم الصحة النفسية: دليل المريض",
    summary:
      "Mental health is just as important as physical health. This guide helps you understand common conditions, symptoms, and when to seek help.",
    summaryAr:
      "الصحة النفسية لا تقل أهمية عن الصحة الجسدية. يساعدك هذا الدليل على فهم الحالات الشائعة والأعراض ومتى تطلب المساعدة.",
    content: "",
    contentAr: "",
    author: "Dr. Sara Mohamed",
    authorAr: "د. سارة محمد",
    publishedAt: "2025-01-08",
    readTime: 8,
    category: "health",
    tags: ["Mental Health", "Awareness", "Wellbeing"],
    tagsAr: ["الصحة النفسية", "التوعية", "الرفاه"],
    image: null,
    featured: true,
  },
  {
    id: 3,
    title: "Platform Update: New Features in January 2025",
    titleAr: "تحديث المنصة: ميزات جديدة في يناير 2025",
    summary:
      "We've added several exciting features to improve your experience, including enhanced appointment scheduling and faster load times.",
    summaryAr:
      "أضفنا عدة ميزات مثيرة لتحسين تجربتك، بما في ذلك جدولة مواعيد محسّنة وأوقات تحميل أسرع.",
    content: "",
    contentAr: "",
    author: "Technical Support Team",
    authorAr: "فريق الدعم التقني",
    publishedAt: "2025-01-02",
    readTime: 3,
    category: "news",
    tags: ["Platform", "Updates", "Features"],
    tagsAr: ["المنصة", "التحديثات", "الميزات"],
    image: null,
    featured: false,
  },
  {
    id: 4,
    title: "10 Tips for Better Sleep & Mental Health",
    titleAr: "10 نصائح لنوم أفضل وصحة نفسية جيدة",
    summary:
      "Quality sleep is fundamental to mental wellness. Discover evidence-based strategies to improve your sleep habits and overall wellbeing.",
    summaryAr:
      "النوم الجيد أساسي للصحة النفسية. اكتشف استراتيجيات قائمة على الأدلة لتحسين عادات نومك وصحتك العامة.",
    content: "",
    contentAr: "",
    author: "Dr. Amr Hassan",
    authorAr: "د. عمرو حسن",
    publishedAt: "2024-12-28",
    readTime: 6,
    category: "health",
    tags: ["Sleep", "Mental Health", "Wellness"],
    tagsAr: ["النوم", "الصحة النفسية", "العافية"],
    image: null,
    featured: false,
  },
  {
    id: 5,
    title: "How to Use the Messaging Feature",
    titleAr: "كيفية استخدام ميزة المراسلة",
    summary:
      "Step-by-step guide on how to communicate with your healthcare team through the secure messaging feature on our platform.",
    summaryAr:
      "دليل خطوة بخطوة حول كيفية التواصل مع فريق الرعاية الصحية الخاص بك من خلال ميزة المراسلة الآمنة على منصتنا.",
    content: "",
    contentAr: "",
    author: "Technical Support Team",
    authorAr: "فريق الدعم التقني",
    publishedAt: "2024-12-15",
    readTime: 4,
    category: "guide",
    tags: ["Guide", "Messaging", "Platform"],
    tagsAr: ["دليل", "المراسلة", "المنصة"],
    image: null,
    featured: false,
  },
];

const categoryConfig = {
  guide: { labelEn: "Guide", labelAr: "دليل", color: "primary" },
  health: { labelEn: "Health", labelAr: "صحة", color: "success" },
  news: { labelEn: "News", labelAr: "أخبار", color: "info" },
};

function ArticleCard({
  article,
  isRTL,
  isBookmarked,
  onToggleBookmark,
  onClick,
}) {
  const cat = categoryConfig[article.category] || categoryConfig.news;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-background-paper border border-border rounded-2xl shadow-sm overflow-hidden cursor-pointer group transition-shadow hover:shadow-md"
      role="button"
      tabIndex={0}
      aria-label={
        isRTL
          ? `فتح المقال ${article.titleAr}`
          : `Open article ${article.title}`
      }
      onClick={() => onClick(article)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(article);
        }
      }}
    >
      {/* Cover placeholder */}
      <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

      <div className="p-5">
        {/* Top row */}
        <div
          className={`flex items-start justify-between gap-3 mb-3 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Badge variant={cat.color}>{isRTL ? cat.labelAr : cat.labelEn}</Badge>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article.id);
            }}
            onKeyDown={(e) => e.stopPropagation()}
            className="p-1 rounded-lg text-text-muted hover:text-primary transition-colors"
          >
            {isBookmarked ? (
              <BookmarkFilled className="w-5 h-5 text-primary" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-text-heading text-base leading-snug group-hover:text-primary transition-colors mb-2 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {isRTL ? article.titleAr : article.title}
        </h3>

        {/* Summary */}
        <p
          className={`text-sm text-text-muted line-clamp-2 leading-relaxed mb-4 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {isRTL ? article.summaryAr : article.summary}
        </p>

        {/* Tags */}
        <div
          className={`flex flex-wrap gap-1.5 mb-4 ${
            isRTL ? "justify-end" : "justify-start"
          }`}
        >
          {(isRTL ? article.tagsAr : article.tags).slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 bg-background-subtle border border-border rounded-full text-text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between gap-2 text-xs text-text-muted border-t border-border pt-3 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div
            className={`flex items-center gap-1.5 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isRTL ? article.authorAr : article.author}</span>
          </div>
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <span
              className={`flex items-center gap-1 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {article.readTime} {isRTL ? "دقائق" : "min read"}
            </span>
            <span>
              {new Date(article.publishedAt).toLocaleDateString(
                isRTL ? "ar-EG" : "en-US",
                { month: "short", day: "numeric" },
              )}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ArticleModal({ article, isRTL, onClose }) {
  if (!article) return null;
  const cat = categoryConfig[article.category] || categoryConfig.news;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background-paper rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
          <div className="p-6" dir={isRTL ? "rtl" : "ltr"}>
            <div
              className={`flex items-start justify-between gap-4 mb-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Badge variant={cat.color}>
                {isRTL ? cat.labelAr : cat.labelEn}
              </Badge>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <h2
              className={`text-2xl font-bold text-text-heading mb-3 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {isRTL ? article.titleAr : article.title}
            </h2>

            <div
              className={`flex items-center gap-4 text-sm text-text-muted mb-6 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <span
                className={`flex items-center gap-1.5 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <User className="w-4 h-4" />
                {isRTL ? article.authorAr : article.author}
              </span>
              <Circle className="w-1 h-1" />
              <span
                className={`flex items-center gap-1.5 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Clock className="w-4 h-4" />
                {article.readTime} {isRTL ? "دقائق قراءة" : "min read"}
              </span>
              <Circle className="w-1 h-1" />
              <span>
                {new Date(article.publishedAt).toLocaleDateString(
                  isRTL ? "ar-EG" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              </span>
            </div>

            <div
              className={`text-text-muted leading-relaxed mb-6 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <p className="mb-4 text-base">
                {isRTL ? article.summaryAr : article.summary}
              </p>
              {(isRTL ? article.contentAr : article.content) && (
                <p>{isRTL ? article.contentAr : article.content}</p>
              )}
              {!(isRTL ? article.contentAr : article.content) && (
                <div className="p-6 bg-background-subtle rounded-xl text-center text-text-muted">
                  <ArticleIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    {isRTL
                      ? "المحتوى الكامل سيكون متاحاً قريباً"
                      : "Full content coming soon"}
                  </p>
                </div>
              )}
            </div>

            <div
              className={`flex flex-wrap gap-2 ${
                isRTL ? "justify-end" : "justify-start"
              }`}
            >
              {(isRTL ? article.tagsAr : article.tags).map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
                >
                  <TagIcon className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function PatientArticles() {
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [bookmarks, setBookmarks] = useState(new Set());
  const [selectedArticle, setSelectedArticle] = useState(null);

  const toggleBookmark = (id) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const featured = mockArticles.filter((a) => a.featured);
  const filters = [
    { key: "all", labelEn: "All Articles", labelAr: "كل المقالات" },
    { key: "guide", labelEn: "Guides", labelAr: "أدلة" },
    { key: "health", labelEn: "Health", labelAr: "صحة" },
    { key: "news", labelEn: "News", labelAr: "أخبار" },
    { key: "saved", labelEn: "Saved", labelAr: "محفوظة" },
  ];

  const filtered = mockArticles.filter((a) => {
    const matchSearch =
      search === "" ||
      (isRTL ? a.titleAr : a.title)
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "saved"
        ? bookmarks.has(a.id)
        : a.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isRTL ? "md:flex-row-reverse" : ""
        }`}
      >
        <div>
          <h1 className="text-3xl font-bold text-text-heading flex items-center gap-3">
            <ArticleIcon className="w-8 h-8 text-primary" />
            {isRTL ? "المقالات الصحية" : "Health Articles"}
          </h1>
          <p className="text-text-muted mt-1">
            {isRTL
              ? "مقالات ودلائل من فريق الدعم والأطباء"
              : "Articles and guides from support team & doctors"}
          </p>
        </div>
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search
            className={`absolute ${
              isRTL ? "right-3" : "left-3"
            } top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted`}
          />
          <input
            type="text"
            placeholder={isRTL ? "ابحث في المقالات..." : "Search articles..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full ${
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2.5 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text transition-all`}
          />
        </div>
      </div>

      {/* Featured Banner */}
      {filter === "all" && search === "" && featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featured.slice(0, 2).map((article) => {
            const cat = categoryConfig[article.category] || categoryConfig.news;
            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="relative bg-gradient-to-br from-primary/90 to-secondary/80 rounded-2xl p-6 text-white cursor-pointer overflow-hidden shadow-lg"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {isRTL ? "مميز" : "Featured"}
                  </span>
                  <h3
                    className={`font-bold text-lg leading-snug mb-2 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {isRTL ? article.titleAr : article.title}
                  </h3>
                  <p
                    className={`text-white/80 text-sm line-clamp-2 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {isRTL ? article.summaryAr : article.summary}
                  </p>
                  <div
                    className={`flex items-center gap-3 mt-4 text-white/70 text-xs ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span>{isRTL ? article.authorAr : article.author}</span>
                    <Circle className="w-1 h-1" />
                    <span>
                      {article.readTime} {isRTL ? "دقائق" : "min"}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-border gap-1 overflow-x-auto no-scrollbar">
        {filters.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-5 py-3 font-semibold transition-all relative whitespace-nowrap rounded-t-xl ${
              filter === tab.key
                ? "text-primary bg-primary/5 border-b-2 border-primary -mb-[2px]"
                : "text-text-muted hover:text-text-heading hover:bg-background-subtle"
            }`}
          >
            {isRTL ? tab.labelAr : tab.labelEn}
            {tab.key === "saved" && bookmarks.size > 0 && (
              <span className="ms-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
                {bookmarks.size}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isRTL={isRTL}
              isBookmarked={bookmarks.has(article.id)}
              onToggleBookmark={toggleBookmark}
              onClick={setSelectedArticle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-background-subtle/20 rounded-2xl border-2 border-dashed border-border">
          <ArticleIcon className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-medium text-text-muted">
            {isRTL ? "لا توجد مقالات" : "No articles found"}
          </h3>
          <p className="text-text-muted mt-2 text-sm">
            {isRTL
              ? "جرب تغيير فلتر البحث"
              : "Try changing your search or filter"}
          </p>
        </div>
      )}

      {/* Article Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          isRTL={isRTL}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
