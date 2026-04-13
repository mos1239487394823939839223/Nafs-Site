import { useEffect, useState } from "react";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Input, { Select, MenuItem, Textarea } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { adminAPI, paymentAPI, extractErrorMessage } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import { useLanguage } from "../../contexts/LanguageContext";

const emptyForm = {
  id: null,
  title: "",
  accountName: "",
  accountNumber: "",
  provider: "",
  instructions: "",
};

const mapInstructionFromApi = (payload = {}) => ({
  id: payload.ID || payload.Id || payload.id || null,
  title: payload.Title || payload.title || "",
  accountName: payload.AccountName || payload.accountName || "",
  accountNumber: payload.AccountNumber || payload.accountNumber || "",
  provider:
    payload.Provider !== undefined && payload.Provider !== null
      ? Number(payload.Provider)
      : "",
  instructions: payload.Instructions || payload.instructions || "",
});

const mapToApi = (payload = {}) => ({
  Title: payload.title,
  AccountName: payload.accountName || null,
  AccountNumber: payload.accountNumber,
  Provider: Number(payload.provider),
  Instructions: payload.instructions || null,
});

const areFormsEqual = (a = {}, b = {}) =>
  String(a.id ?? "") === String(b.id ?? "") &&
  String(a.title ?? "") === String(b.title ?? "") &&
  String(a.accountName ?? "") === String(b.accountName ?? "") &&
  String(a.accountNumber ?? "") === String(b.accountNumber ?? "") &&
  String(a.provider ?? "") === String(b.provider ?? "") &&
  String(a.instructions ?? "") === String(b.instructions ?? "");

export default function AdminPaymentDetails() {
  const { t, isRTL } = useLanguage();
  const toast = useToast();

  const [instructions, setInstructions] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const isDirty = !areFormsEqual(form, initialForm);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadingProviders(true);
      try {
        const [providersResponse, instructionsResponse] = await Promise.all([
          paymentAPI.getProviders(),
          adminAPI.getPaymentInstructions(),
        ]);

        const loadedProviders = Array.isArray(providersResponse?.Data)
          ? providersResponse.Data
          : [];
        const loadedInstructions = Array.isArray(instructionsResponse?.Data)
          ? instructionsResponse.Data.map(mapInstructionFromApi)
          : [];

        setProviders(loadedProviders);
        setInstructions(loadedInstructions);

        const initialProvider =
          loadedProviders.length > 0
            ? Number(loadedProviders[0].ID)
            : loadedInstructions.length > 0
            ? Number(loadedInstructions[0].provider)
            : "";

        setSelectedProvider(initialProvider);

        const activeInstruction = loadedInstructions.find(
          (item) => Number(item.provider) === Number(initialProvider),
        );

        const normalized = activeInstruction
          ? activeInstruction
          : {
              ...emptyForm,
              provider: initialProvider,
            };

        setForm(normalized);
        setInitialForm(normalized);
      } catch (error) {
        toast.error(
          extractErrorMessage(
            error,
            isRTL ? "تعذر تحميل بيانات الدفع" : "Failed to load payment data",
          ),
        );
      } finally {
        setLoading(false);
        setLoadingProviders(false);
      }
    };

    fetchData();
  }, [isRTL, toast]);

  useEffect(() => {
    if (selectedProvider === "" || selectedProvider === null) {
      const resetForm = {
        ...emptyForm,
        provider: "",
      };
      setForm(resetForm);
      setInitialForm(resetForm);
      return;
    }

    const activeInstruction = instructions.find(
      (item) => Number(item.provider) === Number(selectedProvider),
    );

    if (activeInstruction) {
      setForm(activeInstruction);
      setInitialForm(activeInstruction);
      return;
    }

    const providerLabel =
      providers.find((p) => Number(p.ID) === Number(selectedProvider))?.Name ||
      (isRTL ? "وسيلة دفع" : "Payment Method");

    const freshForm = {
      ...emptyForm,
      provider: Number(selectedProvider),
      title: providerLabel,
    };

    setForm(freshForm);
    setInitialForm(freshForm);
  }, [selectedProvider, instructions, providers, isRTL]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const refreshInstructions = async () => {
    const response = await adminAPI.getPaymentInstructions();
    const nextInstructions = Array.isArray(response?.Data)
      ? response.Data.map(mapInstructionFromApi)
      : [];
    setInstructions(nextInstructions);

    const updated = nextInstructions.find(
      (item) => Number(item.provider) === Number(selectedProvider),
    );
    if (updated) {
      setForm(updated);
      setInitialForm(updated);
      return;
    }

    const fallback = {
      ...emptyForm,
      provider: selectedProvider,
    };
    setForm(fallback);
    setInitialForm(fallback);
  };

  const handleSave = async () => {
    if (!form.title || !form.accountNumber || form.provider === "") {
      toast.error(
        isRTL
          ? "أدخل العنوان ورقم الحساب ووسيلة الدفع"
          : "Please enter title, account number, and provider",
      );
      return;
    }

    setSaving(true);
    try {
      const payload = mapToApi(form);
      const response = form.id
        ? await adminAPI.updatePaymentInstruction(form.id, payload)
        : await adminAPI.createPaymentInstruction(payload);

      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.unexpectedError"));
        return;
      }

      await refreshInstructions();
      toast.success(
        isRTL
          ? "تم حفظ تعليمات الدفع بنجاح"
          : "Payment instructions saved successfully",
      );
    } catch (error) {
      toast.error(
        extractErrorMessage(
          error,
          isRTL ? "تعذر حفظ البيانات" : "Failed to save payment instructions",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleProviderChange = (event) => {
    const value = event.target.value;
    setSelectedProvider(value === "" ? "" : Number(value));
  };

  const handleDeleteRequest = () => {
    if (!form.id) return;
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setDeleting(true);
    try {
      const response = await adminAPI.deletePaymentInstruction(form.id);
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.unexpectedError"));
        return;
      }

      await refreshInstructions();
      toast.success(
        t(
          "admin.paymentInstructionDeletedSuccess",
          isRTL
            ? "تم حذف تعليمات الدفع بنجاح"
            : "Payment instructions deleted successfully",
        ),
      );
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error(
        extractErrorMessage(
          error,
          t(
            "admin.paymentInstructionDeleteFailed",
            isRTL
              ? "تعذر حذف البيانات"
              : "Failed to delete payment instructions",
          ),
        ),
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h2 className="text-2xl font-bold text-text-heading">
          {isRTL ? "بيانات الدفع" : "Payment Details"}
        </h2>
        <p className="text-text-muted mt-1">
          {isRTL
            ? "إدارة بيانات الحساب المستخدمة في التحويلات اليدوية."
            : "Manage account details used for manual transfers."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isRTL ? "تفاصيل تعليمات التحويل" : "Transfer Instructions Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-text-muted">
              {isRTL ? "جار تحميل البيانات..." : "Loading payment details..."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label={isRTL ? "وسيلة الدفع" : "Payment Provider"}
                value={selectedProvider === "" ? "" : Number(selectedProvider)}
                onChange={handleProviderChange}
                disabled={loadingProviders || saving || providers.length === 0}
              >
                {providers.length === 0 ? (
                  <MenuItem value="">{isRTL ? "لا توجد وسائل" : "No providers"}</MenuItem>
                ) : (
                  providers.map((provider) => (
                    <MenuItem key={provider.ID} value={provider.ID}>
                      {provider.Name}
                    </MenuItem>
                  ))
                )}
              </Select>

              <Input
                label={isRTL ? "عنوان التعليمات" : "Instruction Title"}
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder={
                  isRTL ? "مثال: تحويل بنكي مباشر" : "Example: Direct bank transfer"
                }
              />

              <Input
                label={isRTL ? "اسم الحساب" : "Account Name"}
                value={form.accountName}
                onChange={(e) => handleChange("accountName", e.target.value)}
                placeholder={isRTL ? "أدخل اسم الحساب" : "Enter account name"}
              />

              <Input
                label={isRTL ? "رقم الحساب" : "Account Number"}
                value={form.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                placeholder={isRTL ? "أدخل رقم الحساب" : "Enter account number"}
              />

              <div className="md:col-span-2">
                <Textarea
                  label={isRTL ? "تعليمات التحويل" : "Transfer Instructions"}
                  rows={4}
                  value={form.instructions}
                  onChange={(e) => handleChange("instructions", e.target.value)}
                  placeholder={
                    isRTL
                      ? "أضف خطوات التحويل التي يجب على العميل اتباعها"
                      : "Add transfer steps the patient should follow"
                  }
                />
              </div>
            </div>
          )}

          <div
            className={`mt-6 flex gap-3 ${
              isRTL ? "justify-start" : "justify-end"
            }`}
          >
            <Button
              variant="outline"
              disabled={!isDirty || saving || deleting || loading}
              onClick={() => setForm(initialForm)}
            >
              {isRTL ? "إلغاء التغييرات" : "Discard Changes"}
            </Button>
            <Button
              variant="danger"
              disabled={!form.id || saving || deleting || loading}
              onClick={handleDeleteRequest}
            >
              {deleting
                ? t("admin.paymentInstructionDeleting", isRTL ? "جار الحذف..." : "Deleting...")
                : t(
                    "admin.paymentInstructionDeleteButton",
                    isRTL ? "حذف التعليمات" : "Delete Instructions",
                  )}
            </Button>
            <Button
              disabled={
                !isDirty || saving || deleting || loading || selectedProvider === ""
              }
              onClick={handleSave}
            >
              {saving
                ? isRTL
                  ? "جار الحفظ..."
                  : "Saving..."
                : isRTL
                ? "حفظ التعليمات"
                : "Save Instructions"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title={t(
          "admin.paymentInstructionDeleteTitle",
          isRTL ? "تأكيد حذف تعليمات الدفع" : "Confirm Payment Instructions Deletion",
        )}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted leading-6">
            {t(
              "admin.paymentInstructionDeleteDescription",
              isRTL
                ? "سيتم حذف تعليمات الدفع الخاصة بوسيلة الدفع المحددة. يمكنك إضافتها مرة أخرى لاحقًا إذا لزم الأمر."
                : "The payment instructions for the selected provider will be removed. You can add them again later if needed.",
            )}
          </p>
          <div className="rounded-xl border border-border bg-background-subtle p-3 text-sm">
            <p className="font-semibold text-text-heading">{form.title || "-"}</p>
            <p className="text-text-muted mt-1">{form.accountNumber || "-"}</p>
          </div>
          <div
            className={`flex gap-3 ${isRTL ? "justify-start" : "justify-end"}`}
          >
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteModalOpen(false)}
            >
              {t("common.cancel", isRTL ? "إلغاء" : "Cancel")}
            </Button>
            <Button variant="danger" disabled={deleting} onClick={handleDelete}>
              {deleting
                ? t("admin.paymentInstructionDeleting", isRTL ? "جار الحذف..." : "Deleting...")
                : t("admin.paymentInstructionDeleteConfirm", isRTL ? "تأكيد الحذف" : "Confirm Delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
