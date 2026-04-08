import { useEffect, useState } from "react";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { adminAPI, extractErrorMessage } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import { useLanguage } from "../../contexts/LanguageContext";

const LOCAL_STORAGE_KEY = "nafs_admin_payment_details";

const defaultPaymentDetails = {
  accountName: "Nafs Mental Health",
  accountNumber: "01XXXXXXXXXX",
  instaPayUsername: "nafs.pay",
};

const mapFromApi = (payload = {}) => ({
  accountName: payload.AccountName || payload.accountName || "",
  accountNumber: payload.AccountNumber || payload.accountNumber || "",
  instaPayUsername: payload.InstaPayUsername || payload.instaPayUsername || "",
});

const mapToApi = (payload = {}) => ({
  AccountName: payload.accountName,
  AccountNumber: payload.accountNumber,
  InstaPayUsername: payload.instaPayUsername,
});

const loadLocalFallback = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return defaultPaymentDetails;
    const parsed = JSON.parse(stored);
    return {
      accountName: parsed.accountName || defaultPaymentDetails.accountName,
      accountNumber:
        parsed.accountNumber || defaultPaymentDetails.accountNumber,
      instaPayUsername:
        parsed.instaPayUsername || defaultPaymentDetails.instaPayUsername,
    };
  } catch {
    return defaultPaymentDetails;
  }
};

export default function AdminPaymentDetails() {
  const { t, isRTL } = useLanguage();
  const toast = useToast();

  const [form, setForm] = useState(defaultPaymentDetails);
  const [initialForm, setInitialForm] = useState(defaultPaymentDetails);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isDirty =
    form.accountName !== initialForm.accountName ||
    form.accountNumber !== initialForm.accountNumber ||
    form.instaPayUsername !== initialForm.instaPayUsername;

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.getPaymentDetails();
        if (response?.IsSuccess !== false && response?.Data) {
          const normalized = mapFromApi(response.Data);
          setForm(normalized);
          setInitialForm(normalized);
        } else {
          const fallback = loadLocalFallback();
          setForm(fallback);
          setInitialForm(fallback);
        }
      } catch {
        const fallback = loadLocalFallback();
        setForm(fallback);
        setInitialForm(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.accountName || !form.accountNumber || !form.instaPayUsername) {
      toast.error(
        isRTL ? "يرجى استكمال جميع الحقول" : "Please complete all fields",
      );
      return;
    }

    setSaving(true);
    try {
      const response = await adminAPI.updatePaymentDetails(mapToApi(form));
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t("errors.unexpectedError"));
        return;
      }

      setInitialForm(form);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
      toast.success(
        isRTL
          ? "تم تحديث بيانات الدفع بنجاح"
          : "Payment details updated successfully",
      );
    } catch (error) {
      // Keep mock-data fallback in sync if backend endpoint is unavailable.
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
      setInitialForm(form);
      toast.success(
        extractErrorMessage(
          error,
          isRTL
            ? "تم حفظ البيانات محليًا حتى يتوفر الربط مع الخادم"
            : "Saved locally until backend endpoint is available",
        ),
      );
    } finally {
      setSaving(false);
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
            {isRTL ? "تفاصيل الحساب" : "Account Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-text-muted">
              {isRTL ? "جار تحميل البيانات..." : "Loading payment details..."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Input
                  label={isRTL ? "اسم المستخدم InstaPay" : "InstaPay Username"}
                  value={form.instaPayUsername}
                  onChange={(e) =>
                    handleChange("instaPayUsername", e.target.value)
                  }
                  placeholder={
                    isRTL
                      ? "أدخل اسم مستخدم InstaPay"
                      : "Enter InstaPay username"
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
              disabled={!isDirty || saving || loading}
              onClick={() => setForm(initialForm)}
            >
              {isRTL ? "إلغاء التغييرات" : "Discard Changes"}
            </Button>
            <Button
              disabled={!isDirty || saving || loading}
              onClick={handleSave}
            >
              {saving
                ? isRTL
                  ? "جار الحفظ..."
                  : "Saving..."
                : isRTL
                ? "تحديث البيانات"
                : "Update Details"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
