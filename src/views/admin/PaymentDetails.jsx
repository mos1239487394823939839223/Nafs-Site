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
            t("auto.failedToLoadPaymentData"),
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
      (t("auto.paymentMethod"));

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
        t("auto.pleaseEnterTitleAccountNumberAndProvider"),
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
        t("auto.paymentInstructionsSavedSuccessfully"),
      );
    } catch (error) {
      toast.error(
        extractErrorMessage(
          error,
          t("auto.failedToSavePaymentInstructions"),
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
          t("auto.paymentInstructionsDeletedSuccessfully"),
        ),
      );
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error(
        extractErrorMessage(
          error,
          t(
            "admin.paymentInstructionDeleteFailed",
            t("auto.failedToDeletePaymentInstructions"),
          ),
        ),
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-heading">
          {t("auto.paymentDetails")}
        </h2>
        <p className="text-sm sm:text-base text-text-muted mt-1">
          {t("auto.manageAccountDetailsUsedForManualTransfers")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("auto.transferInstructionsDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-text-muted">
              {t("auto.loadingPaymentDetails")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label={t("auto.paymentProvider")}
                value={selectedProvider === "" ? "" : Number(selectedProvider)}
                onChange={handleProviderChange}
                disabled={loadingProviders || saving || providers.length === 0}
              >
                {providers.length === 0 ? (
                  <MenuItem value="">{t("auto.noProviders")}</MenuItem>
                ) : (
                  providers.map((provider) => (
                    <MenuItem key={provider.ID} value={provider.ID}>
                      {provider.Name}
                    </MenuItem>
                  ))
                )}
              </Select>

              <Input
                label={t("auto.instructionTitle")}
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder={
                  t("auto.exampleDirectBankTransfer")
                }
              />

              <Input
                label={t("auto.accountName")}
                value={form.accountName}
                onChange={(e) => handleChange("accountName", e.target.value)}
                placeholder={t("auto.enterAccountName")}
              />

              <Input
                label={t("auto.accountNumber")}
                value={form.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                placeholder={t("auto.enterAccountNumber")}
              />

              <div className="md:col-span-2">
                <Textarea
                  label={t("auto.transferInstructions")}
                  rows={4}
                  value={form.instructions}
                  onChange={(e) => handleChange("instructions", e.target.value)}
                  placeholder={
                    t("auto.addTransferStepsThePatientShouldFollow")
                  }
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Button
              variant="outline"
              disabled={!isDirty || saving || deleting || loading}
              onClick={() => setForm(initialForm)}
              className="whitespace-nowrap"
            >
              {t("auto.discardChanges")}
            </Button>
            <Button
              variant="danger"
              disabled={!form.id || saving || deleting || loading}
              onClick={handleDeleteRequest}
              className="whitespace-nowrap"
            >
              {deleting
                ? t("admin.paymentInstructionDeleting", t("auto.deleting"))
                : t(
                    "admin.paymentInstructionDeleteButton",
                    t("auto.deleteInstructions"),
                  )}
            </Button>
            <Button
              disabled={
                !isDirty || saving || deleting || loading || selectedProvider === ""
              }
              onClick={handleSave}
              className="whitespace-nowrap"
            >
              {saving
                ? t("auto.saving")
                : t("auto.saveInstructions")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title={t(
          "admin.paymentInstructionDeleteTitle",
          t("auto.confirmPaymentInstructionsDeletion"),
        )}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted leading-6">
            {t(
              "admin.paymentInstructionDeleteDescription",
              t("auto.thePaymentInstructionsForTheSelectedProviderWillBeRemovedYouCanAddThemAgainLaterIfNeeded"),
            )}
          </p>
          <div className="rounded-xl border border-border bg-background-subtle p-3 text-sm">
            <p className="font-semibold text-text-heading">{form.title || "-"}</p>
            <p className="text-text-muted mt-1">{form.accountNumber || "-"}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteModalOpen(false)}
              className="whitespace-nowrap"
            >
              {t("common.cancel", t("auto.cancel"))}
            </Button>
            <Button variant="danger" disabled={deleting} onClick={handleDelete} className="whitespace-nowrap">
              {deleting
                ? t("admin.paymentInstructionDeleting", t("auto.deleting"))
                : t("admin.paymentInstructionDeleteConfirm", t("auto.confirmDelete"))}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
