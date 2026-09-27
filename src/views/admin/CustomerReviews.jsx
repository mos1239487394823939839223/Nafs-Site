import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Star,
  CloudUpload,
  MessageSquare,
  Eye,
  EyeOff,
  ChevronDown,
  Save,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { useToast } from "../../components/ui/Toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { customerReviewsAPI, extractErrorMessage, filesAPI } from "../../lib/api";
import { UserAvatar } from "../../components/ui/Avatar";

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value = 0, onChange, readOnly = false, size = "md" }) {
  const [hovered, setHovered] = useState(0);
  const px = size === "sm" ? 14 : size === "lg" ? 24 : 20;
  return (
    <div
      className="flex items-center gap-0.5"
      role={readOnly ? "img" : "group"}
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => !readOnly && onChange?.(n)}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          disabled={readOnly}
          aria-label={readOnly ? undefined : `Rate ${n} star${n !== 1 ? "s" : ""}`}
          className={`transition-transform ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded`}
          style={{ background: "none", border: "none", padding: 1 }}
        >
          <Star
            style={{ width: px, height: px }}
            className={`transition-colors ${(hovered || value) >= n ? "text-amber-400 fill-amber-400" : "text-border fill-transparent"}`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Safe Feedback Preview ────────────────────────────────────────────────────
function FeedbackPreview({ text, maxLength = 90 }) {
  if (!text) return <span className="text-text-muted italic text-xs">—</span>;
  const safe = String(text);
  return (
    <span className="text-text text-sm leading-relaxed">
      {safe.length > maxLength ? `${safe.slice(0, maxLength)}…` : safe}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ isPublished }) {
  const { t } = useLanguage();
  return isPublished ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
      <Eye style={{ width: 11, height: 11 }} /> {t("customerReviews.published", "Published")}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-background-subtle text-text-muted rounded-full border border-border">
      <EyeOff style={{ width: 11, height: 11 }} /> {t("customerReviews.draft", "Draft")}
    </span>
  );
}

// ─── Review Form Modal ────────────────────────────────────────────────────────
function ReviewFormModal({ isOpen, onClose, onSave, initial, isSaving }) {
  const { t, isRTL } = useLanguage();
  const toast = useToast();

  const blankForm = {
    customerName: "",
    customerTitle: "",
    feedback: "",
    rate: 5,
    imageUrl: "",
    isPublished: false,
    displayOrder: 0,
  };

  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setForm({
        customerName: initial.customerName || "",
        customerTitle: initial.customerTitle || "",
        feedback: initial.feedback || "",
        rate: initial.rate ?? 5,
        imageUrl: initial.imageUrl || "",
        isPublished: Boolean(initial.isPublished),
        displayOrder: initial.displayOrder ?? 0,
      });
    } else {
      setForm(blankForm);
    }
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initial]);

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) {
      e.customerName = t("customerReviews.nameRequired", "Customer name is required.");
    } else if (form.customerName.trim().length > 250) {
      e.customerName = t("customerReviews.maxChars250", "Max 250 characters.");
    }
    if (form.customerTitle && form.customerTitle.length > 250) {
      e.customerTitle = t("customerReviews.maxChars250", "Max 250 characters.");
    }
    if (!form.feedback.trim()) {
      e.feedback = t("customerReviews.feedbackRequired", "Feedback is required.");
    } else if (form.feedback.trim().length > 2000) {
      e.feedback = t("customerReviews.maxChars2000", "Max 2000 characters.");
    }
    if (!form.rate || form.rate < 1 || form.rate > 5) {
      e.rate = t("customerReviews.ratingRequired", "Rating must be 1–5.");
    }
    if (form.imageUrl && form.imageUrl.length > 2000) {
      e.imageUrl = t("customerReviews.imageUrlTooLong", "Image URL is too long.");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      customerName: form.customerName.trim(),
      customerTitle: form.customerTitle.trim() || null,
      feedback: form.feedback.trim(),
      rate: Number(form.rate),
      imageUrl: form.imageUrl.trim() || null,
      isPublished: Boolean(form.isPublished),
      displayOrder: Number(form.displayOrder ?? 0),
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await filesAPI.uploadFile(file);
      const url = response?.Data?.PublicUrl || response?.data?.Data?.PublicUrl;
      if (url) {
        setField("imageUrl", url);
      } else {
        toast.error(t("customerReviews.uploadFailed", "Image upload failed."));
      }
    } catch {
      toast.error(t("customerReviews.uploadFailed", "Image upload failed."));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const feedbackLen = (form.feedback || "").length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initial
          ? t("customerReviews.editReview", "Edit Customer Review")
          : t("customerReviews.addNewReview", "Add Customer Review")
      }
      size="md"
    >
      <div className="space-y-5">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5 text-start" htmlFor="cr-name">
            {t("customerReviews.customerName", "Customer Name")} <span className="text-red-500">*</span>
          </label>
          <input
            id="cr-name"
            type="text"
            maxLength={250}
            value={form.customerName}
            onChange={(e) => setField("customerName", e.target.value)}
            placeholder={t("customerReviews.customerNamePlaceholder", "e.g. Sara A.")}
            className={`w-full px-4 py-3 rounded-xl border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm ${errors.customerName ? "border-red-400" : "border-border focus:border-primary"} ${isRTL ? "text-right" : "text-left"}`}
          />
          {errors.customerName && <p className="text-xs text-red-500 mt-1 text-start">{errors.customerName}</p>}
        </div>

        {/* Customer Title */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5 text-start" htmlFor="cr-title">
            {t("customerReviews.customerTitle", "Customer Title")}{" "}
            <span className="text-text-muted text-xs font-normal">
              {t("customerReviews.customerTitleOptional", "(optional)")}
            </span>
          </label>
          <input
            id="cr-title"
            type="text"
            maxLength={250}
            value={form.customerTitle}
            onChange={(e) => setField("customerTitle", e.target.value)}
            placeholder={t("customerReviews.customerTitlePlaceholder", "e.g. Patient")}
            className={`w-full px-4 py-3 rounded-xl border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm ${errors.customerTitle ? "border-red-400" : "border-border focus:border-primary"} ${isRTL ? "text-right" : "text-left"}`}
          />
          {errors.customerTitle && <p className="text-xs text-red-500 mt-1 text-start">{errors.customerTitle}</p>}
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5 text-start" htmlFor="cr-feedback">
            {t("customerReviews.feedback", "Feedback")} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cr-feedback"
            rows={4}
            maxLength={2000}
            value={form.feedback}
            onChange={(e) => setField("feedback", e.target.value)}
            placeholder={t("customerReviews.feedbackPlaceholder", "Customer's testimonial (plain text only)...")}
            className={`w-full px-4 py-3 rounded-xl border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm resize-none ${errors.feedback ? "border-red-400" : "border-border focus:border-primary"} ${isRTL ? "text-right" : "text-left"}`}
          />
          <div className="flex justify-between mt-1">
            {errors.feedback ? (
              <p className="text-xs text-red-500 text-start">{errors.feedback}</p>
            ) : (
              <span />
            )}
            <span className={`text-xs ${feedbackLen > 1900 ? "text-amber-500" : "text-text-muted"}`}>
              {feedbackLen} / 2000
            </span>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-2 text-start">
            {t("customerReviews.rating", "Rating")} <span className="text-red-500">*</span>
          </label>
          <StarRating value={form.rate} onChange={(v) => setField("rate", v)} size="lg" />
          {errors.rate && <p className="text-xs text-red-500 mt-1 text-start">{errors.rate}</p>}
        </div>

        {/* Customer Image */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5 text-start">
            {t("customerReviews.customerImage", "Customer Image")}{" "}
            <span className="text-text-muted text-xs font-normal">
              {t("customerReviews.customerImageOptional", "(optional)")}
            </span>
          </label>
          {form.imageUrl ? (
            <div className="flex items-center gap-4">
              <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
                <img
                  src={form.imageUrl}
                  alt="Customer avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                    <CloudUpload style={{ width: 13, height: 13 }} />
                    {uploading
                      ? t("customerReviews.uploading", "Uploading…")
                      : t("customerReviews.replace", "Replace")}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setField("imageUrl", "")}
                  className="text-xs font-semibold text-red-500 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors text-start"
                  aria-label="Remove image"
                >
                  {t("customerReviews.remove", "Remove")}
                </button>
              </div>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-sm ${uploading ? "pointer-events-none" : ""}`}
            >
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-text-muted text-xs">
                    {t("customerReviews.uploading", "Uploading…")}
                  </span>
                </div>
              ) : (
                <>
                  <CloudUpload className="text-text-muted mb-2" style={{ width: 28, height: 28 }} />
                  <span className="font-medium text-text-heading text-sm">
                    {t("customerReviews.clickToUpload", "Click to upload image")}
                  </span>
                  <span className="text-xs text-text-muted mt-1">PNG, JPG, WEBP</span>
                </>
              )}
            </label>
          )}
        </div>

        {/* Published + Display Order */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-heading mb-2 text-start" htmlFor="cr-published">
              {t("customerReviews.status", "Status")}
            </label>
            <button
              id="cr-published"
              type="button"
              onClick={() => setField("isPublished", !form.isPublished)}
              role="switch"
              aria-checked={form.isPublished}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all w-full ${form.isPublished ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-border bg-background text-text-muted"}`}
            >
              {form.isPublished ? (
                <Eye style={{ width: 15, height: 15 }} />
              ) : (
                <EyeOff style={{ width: 15, height: 15 }} />
              )}
              {form.isPublished
                ? t("customerReviews.published", "Published")
                : t("customerReviews.draft", "Draft")}
            </button>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-heading mb-1.5 text-start" htmlFor="cr-order">
              {t("customerReviews.displayOrder", "Display Order")}
            </label>
            <input
              id="cr-order"
              type="number"
              min={0}
              value={form.displayOrder}
              onChange={(e) =>
                setField("displayOrder", e.target.value === "" ? 0 : Number(e.target.value))
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
            />
            <p className="text-[10px] text-text-muted mt-1">
              {t("customerReviews.displayOrderHint", "Lower numbers appear first.")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
            {t("customerReviews.cancel", "Cancel")}
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleSave}
            disabled={isSaving}
            isLoading={isSaving}
          >
            <Save style={{ width: 16, height: 16 }} />
            {initial
              ? t("customerReviews.saveChanges", "Save Changes")
              : t("customerReviews.addReview", "Add Review")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ isOpen, onClose, onConfirm, isDeleting }) {
  const { t } = useLanguage();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("customerReviews.deleteTitle", "Delete Customer Review?")}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-text leading-relaxed">
          {t(
            "customerReviews.deleteBody",
            "Are you sure you want to delete this customer review? This action will remove it from the admin list and landing page."
          )}
        </p>
        <div className="flex gap-3 pt-1 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isDeleting}>
            {t("customerReviews.cancel", "Cancel")}
          </Button>
          <Button
            variant="danger"
            className="flex-1 gap-1.5"
            onClick={onConfirm}
            disabled={isDeleting}
            isLoading={isDeleting}
          >
            <Trash2 style={{ width: 15, height: 15 }} />
            {t("customerReviews.delete", "Delete")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-border/50">
      {[55, 45, 30, 25, 15, 20, 20].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-4 bg-background-subtle rounded-lg animate-pulse"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Review Row ───────────────────────────────────────────────────────────────
function ReviewRow({ review, onEdit, onTogglePublish, onDelete, publishingId }) {
  const { t, isRTL } = useLanguage();
  const isPublishing = publishingId === review.id;

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-border/50 hover:bg-background-subtle/40 transition-colors"
    >
      {/* Customer */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            name={review.customerName}
            src={review.imageUrl || undefined}
            size="md"
          />
          <div className="min-w-0">
            <p className="font-semibold text-text-heading text-sm truncate">{review.customerName}</p>
            {review.customerTitle && (
              <p className="text-xs text-text-muted truncate">{review.customerTitle}</p>
            )}
          </div>
        </div>
      </td>

      {/* Feedback */}
      <td className="px-4 py-3 max-w-[260px]">
        <FeedbackPreview text={review.feedback} maxLength={100} />
      </td>

      {/* Rating */}
      <td className="px-4 py-3">
        <StarRating value={review.rate} readOnly size="sm" />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge isPublished={review.isPublished} />
      </td>

      {/* Order */}
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-semibold text-text-heading">{review.displayOrder ?? 0}</span>
      </td>

      {/* Created */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-xs text-text-muted">{formatDate(review.createdAt)}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(review)}
            className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/8 rounded-lg transition-all"
            title={t("customerReviews.edit", "Edit")}
            aria-label={`${t("customerReviews.edit", "Edit")} ${review.customerName}`}
          >
            <Pencil style={{ width: 14, height: 14 }} />
          </button>

          <button
            onClick={() => onTogglePublish(review)}
            disabled={isPublishing}
            className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${
              review.isPublished
                ? "text-text-muted hover:text-amber-600 hover:bg-amber-50"
                : "text-text-muted hover:text-emerald-600 hover:bg-emerald-50"
            }`}
            title={
              review.isPublished
                ? t("customerReviews.unpublish", "Unpublish")
                : t("customerReviews.publish", "Publish")
            }
            aria-label={`${review.isPublished ? t("customerReviews.unpublish", "Unpublish") : t("customerReviews.publish", "Publish")} ${review.customerName}`}
          >
            {isPublishing ? (
              <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
            ) : review.isPublished ? (
              <EyeOff style={{ width: 14, height: 14 }} />
            ) : (
              <Eye style={{ width: 14, height: 14 }} />
            )}
          </button>

          <button
            onClick={() => onDelete(review)}
            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title={t("customerReviews.delete", "Delete")}
            aria-label={`${t("customerReviews.delete", "Delete")} ${review.customerName}`}
          >
            <Trash2 style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Mobile Review Card ───────────────────────────────────────────────────────
function ReviewCard({ review, onEdit, onTogglePublish, onDelete, publishingId }) {
  const { t } = useLanguage();
  const isPublishing = publishingId === review.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-background-paper border border-border rounded-2xl p-4 shadow-sm space-y-3"
    >
      <div className="flex items-start gap-3">
        <UserAvatar name={review.customerName} src={review.imageUrl || undefined} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-text-heading text-sm">{review.customerName}</p>
          {review.customerTitle && (
            <p className="text-xs text-text-muted">{review.customerTitle}</p>
          )}
          <StarRating value={review.rate} readOnly size="sm" />
        </div>
        <StatusBadge isPublished={review.isPublished} />
      </div>

      <p className="text-sm text-text leading-relaxed line-clamp-3">{review.feedback}</p>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-text-muted">
          {t("customerReviews.order", "Order")}: {review.displayOrder ?? 0}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(review)}
            className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/8 rounded-lg transition-all"
            title={t("customerReviews.edit", "Edit")}
            aria-label={`${t("customerReviews.edit", "Edit")} ${review.customerName}`}
          >
            <Pencil style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={() => onTogglePublish(review)}
            disabled={isPublishing}
            className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${
              review.isPublished
                ? "text-text-muted hover:text-amber-600 hover:bg-amber-50"
                : "text-text-muted hover:text-emerald-600 hover:bg-emerald-50"
            }`}
            title={
              review.isPublished
                ? t("customerReviews.unpublish", "Unpublish")
                : t("customerReviews.publish", "Publish")
            }
            aria-label={`${review.isPublished ? t("customerReviews.unpublish", "Unpublish") : t("customerReviews.publish", "Publish")} review`}
          >
            {isPublishing ? (
              <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
            ) : review.isPublished ? (
              <EyeOff style={{ width: 14, height: 14 }} />
            ) : (
              <Eye style={{ width: 14, height: 14 }} />
            )}
          </button>
          <button
            onClick={() => onDelete(review)}
            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title={t("customerReviews.delete", "Delete")}
            aria-label={`${t("customerReviews.delete", "Delete")} ${review.customerName}`}
          >
            <Trash2 style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Normalize API response (handles PascalCase & camelCase) ─────────────────
function normalizeReview(r) {
  return {
    id: String(r.id ?? r.Id ?? ""),
    customerName: r.customerName ?? r.CustomerName ?? "",
    customerTitle: r.customerTitle ?? r.CustomerTitle ?? null,
    feedback: r.feedback ?? r.Feedback ?? "",
    rate: r.rate ?? r.Rate ?? 0,
    imageUrl: r.imageUrl ?? r.ImageUrl ?? null,
    isPublished: Boolean(r.isPublished ?? r.IsPublished ?? false),
    displayOrder: r.displayOrder ?? r.DisplayOrder ?? 0,
    createdAt: r.createdAt ?? r.CreatedAt ?? null,
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminCustomerReviews() {
  const { t, isRTL } = useLanguage();
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debounceRef = useRef(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [publishingId, setPublishingId] = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchReviews = useCallback(
    async (pg) => {
      setLoading(true);
      try {
        const isPublished =
          statusFilter === "published"
            ? true
            : statusFilter === "unpublished"
            ? false
            : undefined;

        const res = await customerReviewsAPI.getAdminReviews({
          pageIndex: pg,
          pageSize,
          search: search || undefined,
          isPublished,
        });

        const success = res?.isSuccess ?? res?.IsSuccess;
        if (success === false) {
          toast.error(
            res?.message ||
              res?.Message ||
              t("customerReviews.loadFailed", "Failed to load reviews.")
          );
          return;
        }

        const data = res?.data ?? res?.Data ?? res;
        const items = data?.items ?? data?.Items ?? [];
        // Normalize PascalCase/camelCase and coerce IDs to strings (Snowflake safety)
        const safeItems = items.map(normalizeReview);
        setReviews(safeItems);
        setTotalPages(data?.pages ?? data?.Pages ?? 1);
        setTotalRecords(data?.records ?? data?.Records ?? safeItems.length);
      } catch (err) {
        toast.error(
          extractErrorMessage(
            err,
            t("customerReviews.loadFailed", "Failed to load reviews.")
          )
        );
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageSize, search, statusFilter, t]
  );

  useEffect(() => {
    fetchReviews(pageIndex);
  }, [fetchReviews, pageIndex]);

  // Debounced search
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPageIndex(1);
    }, 450);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPageIndex(1);
  };

  // ── Create / Edit ─────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (review) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const handleFormSave = async (payload) => {
    setIsSaving(true);
    try {
      if (editingReview) {
        const res = await customerReviewsAPI.updateReview(String(editingReview.id), payload);
        const success = res?.isSuccess ?? res?.IsSuccess;
        if (success === false) {
          toast.error(
            res?.message ||
              res?.Message ||
              t("customerReviews.saveFailed", "Failed to update review.")
          );
          return;
        }
        toast.success(t("customerReviews.updatedSuccess", "Review updated successfully."));
        setIsFormOpen(false);
        setEditingReview(null);
        fetchReviews(pageIndex);
      } else {
        const res = await customerReviewsAPI.createReview(payload);
        const success = res?.isSuccess ?? res?.IsSuccess;
        if (success === false) {
          toast.error(
            res?.message ||
              res?.Message ||
              t("customerReviews.createFailed", "Failed to create review.")
          );
          return;
        }
        toast.success(t("customerReviews.createdSuccess", "Review created successfully."));
        setIsFormOpen(false);
        setEditingReview(null);
        setPageIndex(1);
        fetchReviews(1);
      }
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          t("customerReviews.errorOccurred", "An error occurred.")
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Publish / Unpublish ───────────────────────────────────────────────────
  const handleTogglePublish = async (review) => {
    if (publishingId) return;
    const safeId = String(review.id);
    setPublishingId(safeId);
    try {
      const payload = {
        customerName: review.customerName,
        customerTitle: review.customerTitle || null,
        feedback: review.feedback,
        rate: review.rate,
        imageUrl: review.imageUrl || null,
        isPublished: !review.isPublished,
        displayOrder: review.displayOrder ?? 0,
      };
      const res = await customerReviewsAPI.updateReview(safeId, payload);
      const success = res?.isSuccess ?? res?.IsSuccess;
      if (success === false) {
        toast.error(
          res?.message ||
            res?.Message ||
            t("customerReviews.statusFailed", "Failed to update status.")
        );
        return;
      }
      toast.success(
        review.isPublished
          ? t("customerReviews.unpublishedSuccess", "Review unpublished.")
          : t("customerReviews.publishedSuccess", "Review published.")
      );
      setReviews((prev) =>
        prev.map((r) =>
          String(r.id) === safeId ? { ...r, isPublished: !r.isPublished } : r
        )
      );
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          t("customerReviews.statusFailed", "Failed to update status.")
        )
      );
    } finally {
      setPublishingId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleOpenDelete = (review) => {
    setDeletingReview(review);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    setIsDeleting(true);
    try {
      const res = await customerReviewsAPI.deleteReview(String(deletingReview.id));
      const success = res?.isSuccess ?? res?.IsSuccess;
      if (success === false) {
        toast.error(
          res?.message ||
            res?.Message ||
            t("customerReviews.deleteFailed", "Failed to delete review.")
        );
        return;
      }
      toast.success(t("customerReviews.deletedSuccess", "Review deleted successfully."));
      setIsDeleteOpen(false);
      setDeletingReview(null);
      const newTotal = totalRecords - 1;
      const newPages = Math.max(1, Math.ceil(newTotal / pageSize));
      const targetPage = pageIndex > newPages ? newPages : pageIndex;
      setPageIndex(targetPage);
      fetchReviews(targetPage);
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          t("customerReviews.deleteFailed", "Failed to delete review.")
        )
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const showFrom = totalRecords === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const showTo = Math.min(pageIndex * pageSize, totalRecords);

  const tableHeaders = [
    { key: "Customer", label: t("customerReviews.colCustomer", "Customer") },
    { key: "Feedback", label: t("customerReviews.colFeedback", "Feedback") },
    { key: "Rating", label: t("customerReviews.colRating", "Rating") },
    { key: "Status", label: t("customerReviews.colStatus", "Status") },
    { key: "Order", label: t("customerReviews.colOrder", "Order") },
    { key: "Created", label: t("customerReviews.colCreated", "Created") },
    { key: "Actions", label: t("customerReviews.colActions", "Actions") },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6 max-w-[1400px] mx-auto p-1 sm:p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-heading flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="text-primary" style={{ width: 20, height: 20 }} />
            </div>
            {t("customerReviews.pageTitle", "Customer Reviews")}
          </h1>
          <p className="text-text-muted mt-1.5 text-sm">
            {t(
              "customerReviews.pageSubtitle",
              "Manage customer testimonials displayed on the landing page."
            )}
          </p>
        </div>
        <div className="shrink-0">
          <Button
            id="add-customer-review-btn"
            onClick={handleOpenAdd}
            className="gap-2 shadow-lg shadow-primary/25 rounded-xl font-bold"
          >
            <Plus style={{ width: 18, height: 18 }} />
            {t("customerReviews.addReview", "Add Review")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-paper border border-border rounded-2xl p-4 shadow-sm">
        <div
          className={`flex flex-col sm:flex-row gap-3 items-stretch sm:items-center ${
            isRTL ? "sm:flex-row-reverse" : ""
          }`}
        >
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              style={{
                width: 16,
                height: 16,
                [isRTL ? "right" : "left"]: 12,
              }}
            />
            <input
              id="customer-reviews-search"
              type="search"
              placeholder={t("customerReviews.searchPlaceholder", "Search by name or feedback…")}
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`w-full py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all ${
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              }`}
            />
          </div>
          <div className="relative sm:w-44">
            <select
              id="customer-reviews-status-filter"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-8 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer transition-all"
            >
              <option value="all">{t("customerReviews.allStatus", "All Status")}</option>
              <option value="published">{t("customerReviews.filterPublished", "Published")}</option>
              <option value="unpublished">{t("customerReviews.filterUnpublished", "Unpublished")}</option>
            </select>
            <ChevronDown
              className="absolute top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              style={{
                width: 14,
                height: 14,
                [isRTL ? "left" : "right"]: 10,
              }}
            />
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-background-paper border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Customer reviews table">
            <thead>
              <tr className="border-b border-border bg-background-subtle/50">
                {tableHeaders.map((h) => (
                  <th
                    key={h.key}
                    className={`px-4 py-3 text-xs font-bold text-text-muted tracking-wide uppercase ${
                      h.key === "Order" ? "text-center" : "text-start"
                    }`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
                        <MessageSquare
                          style={{ width: 40, height: 40 }}
                          className="opacity-30"
                        />
                        <p className="font-semibold text-sm">
                          {t("customerReviews.noReviews", "No reviews found")}
                        </p>
                        {(search || statusFilter !== "all") && (
                          <button
                            onClick={() => {
                              setSearchInput("");
                              setSearch("");
                              handleStatusChange("all");
                            }}
                            className="text-xs text-primary underline"
                          >
                            {t("customerReviews.clearFilters", "Clear filters")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <ReviewRow
                      key={review.id}
                      review={review}
                      onEdit={handleOpenEdit}
                      onTogglePublish={handleTogglePublish}
                      onDelete={handleOpenDelete}
                      publishingId={publishingId}
                    />
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {!loading && totalRecords > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/50">
            <p className="text-xs text-text-muted">
              {t("customerReviews.showingOf", "Showing")} {showFrom}–{showTo} {t("customerReviews.of", "of")} {totalRecords} {t("customerReviews.reviews", "reviews")}
            </p>
            <Pagination
              page={pageIndex}
              total={totalPages}
              onChange={(pg) => setPageIndex(pg)}
            />
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-background-paper border border-border rounded-2xl p-4 space-y-3 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-background-subtle" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-background-subtle rounded w-1/2" />
                    <div className="h-2 bg-background-subtle rounded w-1/3" />
                  </div>
                </div>
                <div className="h-3 bg-background-subtle rounded" />
                <div className="h-3 bg-background-subtle rounded w-4/5" />
              </div>
            ))
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted bg-background-paper border border-border rounded-2xl">
              <MessageSquare style={{ width: 36, height: 36 }} className="opacity-30" />
              <p className="font-semibold text-sm">
                {t("customerReviews.noReviews", "No reviews found")}
              </p>
              {(search || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    handleStatusChange("all");
                  }}
                  className="text-xs text-primary underline"
                >
                  {t("customerReviews.clearFilters", "Clear filters")}
                </button>
              )}
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleOpenEdit}
                onTogglePublish={handleTogglePublish}
                onDelete={handleOpenDelete}
                publishingId={publishingId}
              />
            ))
          )}
        </AnimatePresence>
        {!loading && totalRecords > 0 && (
          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-xs text-text-muted">
              {t("customerReviews.showingOf", "Showing")} {showFrom}–{showTo} {t("customerReviews.of", "of")} {totalRecords}
            </p>
            <Pagination
              page={pageIndex}
              total={totalPages}
              onChange={(pg) => setPageIndex(pg)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ReviewFormModal
        isOpen={isFormOpen}
        onClose={() => {
          if (!isSaving) {
            setIsFormOpen(false);
            setEditingReview(null);
          }
        }}
        onSave={handleFormSave}
        initial={editingReview}
        isSaving={isSaving}
      />
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteOpen(false);
            setDeletingReview(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
