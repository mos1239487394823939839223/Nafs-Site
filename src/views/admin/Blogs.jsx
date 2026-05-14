import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText as ArticleIcon,
  Plus,
  Pencil,
  Trash2,
  Tag as TagIcon,
  Calendar,
  X,
  Save,
  Search,
  Filter,
  Image as ImageIcon,
  CloudUpload,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../components/ui/Toast";
import { useBlogsStore } from "../../hooks/useBlogsStore";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth, Roles } from "../../contexts/AuthContext";
import { blogAPI, extractErrorMessage, filesAPI } from "../../lib/api";
import RichTextEditor from "../../components/ui/RichTextEditor";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pickData(payload) {
  return payload?.Data ?? payload?.data ?? null;
}

function pickItems(payload) {
  const data = pickData(payload);
  if (Array.isArray(data?.Items)) return data.Items;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  if (Array.isArray(payload?.Items)) return payload.Items;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

// ─── Create / Edit Article Modal ──────────────────────────────────────────────

function ArticleFormModal({
  isOpen,
  onClose,
  onSave,
  initial,
  allTags = [],
  isSaving,
}) {
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState({
    title: "",
    body: "",
    images: [],
    tagIds: [],
  });
  const [errors, setErrors] = useState({});
  const [selectedTagId, setSelectedTagId] = useState("");
  const [uploading, setUploading] = useState(false);

  // reset form when initial changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setForm({
          title: initial.title || initial.Title || "",
          body:
            initial.description ||
            initial.Body ||
            initial.body ||
            initial.Summary ||
            initial.summary ||
            "",
          images: initial.images || initial.Images || [],
          tagIds:
            initial.tagIds || (initial.tagItems || []).map((ti) => ti.id) || [],
        });
      } else {
        setForm({ title: "", body: "", images: [], tagIds: [] });
      }
      setErrors({});
      setSelectedTagId("");
    }
  }, [isOpen, initial]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t("blogs.titleRequired");
    if (!form.body.trim()) e.body = t("blogs.contentRequired");
    if (form.tagIds.length === 0) e.tags = t("blogs.tagsRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddTag = () => {
    if (!selectedTagId) return;
    // Ensure we are using the exact ID from the tag object
    const tag = allTags.find(
      (t) => (t.TagID ?? t.tagID ?? t.id) == selectedTagId,
    );
    if (!tag) return;

    const id = tag.TagID ?? tag.tagID ?? tag.id;
    if (form.tagIds.includes(id)) return;

    setForm((f) => ({ ...f, tagIds: [...f.tagIds, id] }));
    setSelectedTagId("");
    if (errors.tags) setErrors((e) => ({ ...e, tags: "" }));
  };

  const handleRemoveTag = (id) => {
    setForm((f) => ({ ...f, tagIds: f.tagIds.filter((tid) => tid !== id) }));
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      Title: form.title.trim(),
      Body: form.body.trim(),
      Images: form.images.length > 0 ? form.images : [],
      TagIDs: form.tagIds,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await filesAPI.uploadFile(file);
      const url = response?.Data?.PublicUrl || response?.PublicUrl;
      if (url) {
        setForm((f) => ({ ...f, images: [url] }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, images: [] }));
  };

  const selectedTagNames = form.tagIds.map((id) => {
    const tag = allTags.find((t) => (t.TagID ?? t.tagID ?? t.id) == id);
    return { id, name: tag?.Name || tag?.name || `${t("blogs.tag")} #${id}` };
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? t("blogs.editArticle") : `✨ ${t("blogs.addNew")}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5">
            {t("blogs.articleTitle")}{" "}
            <span className="text-red-500">{t("blogs.required")}</span>
          </label>
          <input
            className={`w-full px-4 py-3 rounded-xl border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm ${errors.title ? "border-red-400" : "border-border focus:border-primary"}`}
            placeholder={t("blogs.titlePlaceholder")}
            value={form.title}
            onChange={(e) => {
              setForm((f) => ({ ...f, title: e.target.value }));
              if (errors.title) setErrors((er) => ({ ...er, title: "" }));
            }}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5">
            {t("blogs.content")}{" "}
            <span className="text-red-500">{t("blogs.required")}</span>
          </label>
          <RichTextEditor
            content={form.body}
            onChange={(html) => {
              setForm((f) => ({ ...f, body: html }));
              if (errors.body) setErrors((er) => ({ ...er, body: "" }));
            }}
            placeholder={t("blogs.contentPlaceholder")}
            error={!!errors.body}
            isRTL={isRTL}
          />
          {errors.body && (
            <p className="text-xs text-red-500 mt-1">{errors.body}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5">
            {t("auto.articleImageOptional")}
          </label>

          {form.images.length > 0 ? (
            <div className="relative group rounded-xl overflow-hidden border border-border aspect-video bg-background-subtle">
              <img
                src={form.images[0]}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={removeImage}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <Trash2 style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-sm ${uploading ? "pointer-events-none" : ""}`}
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
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-text-muted">{t("auto.uploading")}</span>
                </div>
              ) : (
                <>
                  <CloudUpload
                    className="text-text-muted mb-2"
                    style={{ width: 32, height: 32 }}
                  />
                  <span className="font-medium text-text-heading">
                    {t("auto.clickToUploadImage")}
                  </span>
                  <span className="text-xs text-text-muted mt-1">
                    {t("auto.169AspectRatioRecommended")}
                  </span>
                </>
              )}
            </label>
          )}
        </div>

        {/* Tags Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5">
            {t("blogs.tagsLabel")}{" "}
            <span className="text-red-500">{t("blogs.required")}</span>
          </label>

          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <select
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{t("auto.chooseATagFromList")}</option>
              {allTags
                .filter(
                  (tag) =>
                    !form.tagIds.includes(tag.TagID ?? tag.tagID ?? tag.id),
                )
                .map((tag) => {
                  const tid = tag.TagID ?? tag.tagID ?? tag.id;
                  return (
                    <option key={tid} value={tid}>
                      {tag.Name ?? tag.name}
                    </option>
                  );
                })}
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
              disabled={!selectedTagId}
            >
              {t("auto.add")}
            </Button>
          </div>

          {/* Selected tags */}
          {selectedTagNames.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {selectedTagNames.map((tag) => (
                <span
                  key={tag.id}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium border border-primary/20"
                >
                  <TagIcon style={{ width: 12, height: 12 }} />
                  {tag.name}
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className={`${t("auto.ms1")} hover:text-red-500 transition-colors`}
                  >
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.tags && (
            <p className="text-xs text-red-500 mt-1">{errors.tags}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t("blogs.cancel")}
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleSave}
            disabled={isSaving}
            isLoading={isSaving}
          >
            <Save style={{ width: 16, height: 16 }} />
            {initial ? t("blogs.saveChanges") : t("blogs.publish")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Create Tag Modal ─────────────────────────────────────────────────────────

function CreateTagModal({ isOpen, onClose, onSave, isCreating }) {
  const { t, isRTL } = useLanguage();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setError("");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setError(t("auto.tagNameIsRequired"));
      return;
    }
    onSave(name.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("auto.CreateNewTag")}
      size="sm"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text-heading mb-1.5">
            {t("auto.tagName")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            placeholder={t("auto.egMentalHealth")}
            className={`w-full px-4 py-3 rounded-xl border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm ${error ? "border-red-400" : "border-border focus:border-primary"}`}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex gap-3 pt-2 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t("auto.cancel")}
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleSave}
            disabled={isCreating}
            isLoading={isCreating}
          >
            <Plus style={{ width: 16, height: 16 }} />
            {t("auto.create")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function BlogCard({ blog, onEdit, onDelete, isAdmin, detailsPathPrefix }) {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(t("auto.enus"), {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleOpenDetails = () => {
    navigate(`${detailsPathPrefix}/${blog.id}`);
  };

  const thumbnail = blog.Images?.[0] || blog.images?.[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-background-paper border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
      onClick={handleOpenDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenDetails();
        }
      }}
    >
      {thumbnail && (
        <div className="aspect-video overflow-hidden relative border-b border-border">
          <img
            src={thumbnail}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
      )}
      {!thumbnail && (
        <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary/40" />
      )}

      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-text-heading text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {blog.title}
            </h3>
          </div>
        </div>

        <p
          className={`text-sm text-text-muted line-clamp-2 leading-relaxed text-start`}
        >
          {blog.description}
        </p>

        <button
          onClick={(event) => {
            event.stopPropagation();
            handleOpenDetails();
          }}
          className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition-all cursor-pointer w-fit"
        >
          {t("auto.readMore")}
        </button>

        <div className="mt-auto pt-4 flex flex-col gap-3">
          <div className={`flex flex-wrap gap-1.5 ${t("auto.justifystart")}`}>
            {blog.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 bg-primary/8 border border-primary/15 text-primary rounded-full font-medium flex items-center gap-1"
              >
                <TagIcon style={{ width: 10, height: 10 }} />
                {tag}
              </span>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-text-muted">
              <span className="flex items-center gap-1">
                <Calendar style={{ width: 10, height: 10 }} />
                {formatDate(blog.createdAt)}
              </span>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(blog);
                  }}
                  className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/8 rounded-lg transition-all"
                  title={t("common.edit")}
                >
                  <Pencil style={{ width: 14, height: 14 }} />
                </button>
                {confirmDelete ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(blog.id);
                        setConfirmDelete(false);
                      }}
                      className="px-2 py-0.5 text-[10px] bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      {t("blogs.confirmDelete")}
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setConfirmDelete(false);
                      }}
                      className="px-2 py-0.5 text-[10px] bg-background-subtle text-text-muted rounded-lg hover:bg-border transition-colors"
                    >
                      {t("blogs.confirmNo")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setConfirmDelete(true);
                    }}
                    className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title={t("common.delete")}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tag Card ─────────────────────────────────────────────────────────────────

function TagCard({ tag, isRTL, articleCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-background-paper border border-border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
    >
      <div
        className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <TagIcon className="text-primary" style={{ width: 18, height: 18 }} />
        </div>
        <div>
          <h4 className="font-semibold text-text-heading text-sm">
            {tag.Name ?? tag.name}
          </h4>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function AdminBlogs() {
  const { blogs, blogLoadError, addBlog, updateBlog, deleteBlog } =
    useBlogsStore();
  const { t, isRTL } = useLanguage();
  const { role } = useAuth();
  const isAdmin = role === Roles.ADMIN;
  const toast = useToast();
  const detailsPathPrefix =
    role === Roles.ADMIN
      ? "/admin/blogs"
      : role === Roles.DOCTOR
        ? "/dashboard/doctor/blogs"
        : role === Roles.STAFF
          ? "/dashboard/staff/blogs"
          : "/dashboard/patient/blogs";

  // Tab state
  const [activeTab, setActiveTab] = useState("articles");

  // Articles state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTagId, setFilterTagId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Tags state
  const [allTags, setAllTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Show blog load error
  useEffect(() => {
    if (!blogLoadError) return;
    toast.error(t("auto.failedToLoadBlogsFromServer"));
  }, [blogLoadError, toast, isRTL]);

  // Load tags from API
  const loadTags = useCallback(async () => {
    setTagsLoading(true);
    try {
      const response = await blogAPI.getTags();
      const items = pickItems(response);
      const data = pickData(response);
      // handle both array and paginated response
      if (Array.isArray(items) && items.length > 0) {
        setAllTags(items);
      } else if (Array.isArray(data)) {
        setAllTags(data);
      } else {
        setAllTags([]);
      }
    } catch {
      setAllTags([]);
    } finally {
      setTagsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // ─── Article Handlers ─────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (blog) => {
    try {
      // Fetch full blog details (list API doesn't return Body)
      const response = await blogAPI.getBlogById(blog.id);
      const data = pickData(response);
      const fullBlog = data || response;

      setEditingBlog({
        ...blog,
        // Override with the full data from the detail endpoint
        Body: fullBlog?.Body || fullBlog?.body || "",
        Title: fullBlog?.Title || fullBlog?.title || blog.title,
        Tags: fullBlog?.Tags || fullBlog?.tags || [],
        tagItems: (fullBlog?.Tags || fullBlog?.tags || [])
          .map((t) => ({
            id: t.TagID ?? t.tagID ?? t.id,
            name: t.Name ?? t.name,
          }))
          .filter((t) => t.id && t.name),
      });
      setIsModalOpen(true);
    } catch {
      // Fallback to the store data if API fails
      setEditingBlog(blog);
      setIsModalOpen(true);
    }
  };

  const handleSave = async (payload) => {
    setIsSaving(true);
    try {
      if (editingBlog?.id) {
        await updateBlog(editingBlog.id, {
          title: payload.Title,
          description: payload.Body,
          tags: payload.TagIDs.map((id) => {
            const tag = allTags.find(
              (t) => (t.TagID ?? t.tagID ?? t.id) === id,
            );
            return tag?.Name ?? tag?.name ?? String(id);
          }),
        });
        toast.success(t("success.blogUpdated"));
      } else {
        // Direct API call for proper TagIDs
        const createResponse = await blogAPI.createBlog(payload);
        if (createResponse?.IsSuccess === false) {
          toast.error(
            extractErrorMessage(createResponse) || t("errors.unexpectedError"),
          );
          return;
        }
        toast.success(t("success.blogAdded"));
        // Reload page data
        window.location.reload();
      }
      setIsModalOpen(false);
      setEditingBlog(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, t("errors.unexpectedError")));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBlog(id);
      toast.success(t("success.blogDeleted"));
    } catch {
      toast.error(t("errors.unexpectedError"));
    }
  };

  // ─── Tag Handlers ─────────────────────────────────────────────────────

  const handleCreateTag = async (name) => {
    setIsCreatingTag(true);
    try {
      const response = await blogAPI.createTag(name);
      if (response?.IsSuccess === false) {
        toast.error(
          extractErrorMessage(response) || t("errors.unexpectedError"),
        );
        return;
      }
      setIsCreateTagOpen(false);
      toast.success(t("auto.tagCreatedSuccessfully"));
      await loadTags();
    } catch (err) {
      toast.error(extractErrorMessage(err, t("auto.failedToCreateTag")));
    } finally {
      setIsCreatingTag(false);
    }
  };

  // ─── Filtered Articles ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return blogs.filter((b) => {
      const matchSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      let matchTag = true;
      if (filterTagId) {
        const filterTag = allTags.find(
          (t) => String(t.TagID ?? t.tagID ?? t.id) === String(filterTagId),
        );
        if (filterTag) {
          const tagName = (
            filterTag.Name ??
            filterTag.name ??
            ""
          ).toLowerCase();
          matchTag = b.tags.some((bt) => bt.toLowerCase() === tagName);
        }
      }

      return matchSearch && matchTag;
    });
  }, [blogs, search, filterTagId, allTags]);

  // ─── Tab Definitions ──────────────────────────────────────────────────

  const tabs = [
    {
      key: "articles",
      label: t("auto.articles"),
      icon: <ArticleIcon style={{ width: 18, height: 18 }} />,
      count: blogs.length,
    },
    isAdmin && {
      key: "tags",
      label: t("auto.tags"),
      icon: <TagIcon style={{ width: 18, height: 18 }} />,
      count: allTags.length,
    },
  ].filter(Boolean);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-heading flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ArticleIcon
                className="text-primary"
                style={{ width: 22, height: 22 }}
              />
            </div>
            {t("blogs.adminTitle")}
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            {t("blogs.adminSubtitle")}
          </p>
        </div>

        {/* CTA Button - changes based on active tab */}
        {isAdmin && (
          <>
            {activeTab === "articles" ? (
              <Button
                onClick={handleOpenAdd}
                className="gap-2 shadow-lg shadow-primary/20"
              >
                <Plus style={{ width: 18, height: 18 }} />
                {t("blogs.addNew")}
              </Button>
            ) : (
              <Button
                onClick={() => setIsCreateTagOpen(true)}
                className="gap-2 shadow-lg shadow-primary/20"
              >
                <Plus style={{ width: 18, height: 18 }} />
                {t("auto.createTag")}
              </Button>
            )}
          </>
        )}
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex border-b border-border gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm transition-all relative whitespace-nowrap rounded-t-xl ${
              activeTab === tab.key
                ? "text-primary bg-primary/5 border-b-2 border-primary -mb-[2px]"
                : "text-text-muted hover:text-text-heading hover:bg-background-subtle"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "bg-background-subtle text-text-muted"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Articles Tab ────────────────────────────────────────────── */}
      {activeTab === "articles" && (
        <motion.div
          key="articles"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {/* Search + Filter Row */}
          <div
            className={`flex flex-col sm:flex-row gap-3 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className={`absolute ${t("auto.start4")} top-1/2 -translate-y-1/2 text-text-muted`}
                style={{ width: 18, height: 18 }}
              />
              <input
                type="text"
                placeholder={t("blogs.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full ${t("auto.ps11Pe4")} py-3 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text transition-all`}
              />
            </div>

            {/* Tag Filter */}
            <div
              className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <Filter
                className="text-text-muted"
                style={{ width: 18, height: 18 }}
              />
              <select
                value={filterTagId}
                onChange={(e) => setFilterTagId(e.target.value)}
                className="px-4 py-3 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text min-w-[180px]"
              >
                <option value="">{t("auto.allTags")}</option>
                {allTags.map((tag) => (
                  <option
                    key={tag.TagID ?? tag.tagID ?? tag.id}
                    value={tag.TagID ?? tag.tagID ?? tag.id}
                  >
                    {tag.Name ?? tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Articles Grid */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-background-subtle/30 rounded-2xl border-2 border-dashed border-border"
            >
              <ArticleIcon
                className="text-text-muted opacity-20 mb-4"
                style={{ width: 64, height: 64 }}
              />
              <h3 className="text-xl font-bold text-text-heading mb-2">
                {search || filterTagId
                  ? t("blogs.noResults")
                  : t("blogs.noArticles")}
              </h3>
              <p className="text-text-muted text-sm mb-6">
                {search || filterTagId
                  ? t("blogs.noResultsDesc")
                  : t("blogs.noArticlesDesc")}
              </p>
              {isAdmin && !search && !filterTagId && (
                <Button onClick={handleOpenAdd} className="gap-2">
                  <Plus style={{ width: 16, height: 16 }} />
                  {t("blogs.addNew")}
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              <AnimatePresence>
                {filtered.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    detailsPathPrefix={detailsPathPrefix}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ─── Tags Tab ────────────────────────────────────────────────── */}
      {activeTab === "tags" && (
        <motion.div
          key="tags"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {tagsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-text-muted">{t("auto.loadingTags")}</p>
            </div>
          ) : allTags.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-background-subtle/30 rounded-2xl border-2 border-dashed border-border"
            >
              <TagIcon
                className="text-text-muted opacity-20 mb-4"
                style={{ width: 64, height: 64 }}
              />
              <h3 className="text-xl font-bold text-text-heading mb-2">
                {t("auto.noTagsYet")}
              </h3>
              <p className="text-text-muted text-sm mb-6">
                {t("auto.createYourFirstTagToOrganizeArticles")}
              </p>
              {isAdmin && (
                <Button
                  onClick={() => setIsCreateTagOpen(true)}
                  className="gap-2"
                >
                  <Plus style={{ width: 16, height: 16 }} />
                  {t("auto.createTag")}
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTags.map((tag) => (
                <TagCard
                  key={tag.TagID ?? tag.tagID ?? tag.id}
                  tag={tag}
                  isRTL={isRTL}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Modals ──────────────────────────────────────────────────── */}
      <ArticleFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBlog(null);
        }}
        onSave={handleSave}
        initial={editingBlog}
        allTags={allTags}
        isSaving={isSaving}
      />

      <CreateTagModal
        isOpen={isCreateTagOpen}
        onClose={() => setIsCreateTagOpen(false)}
        onSave={handleCreateTag}
        isCreating={isCreatingTag}
      />
    </div>
  );
}
