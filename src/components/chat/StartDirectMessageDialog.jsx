import { useEffect, useMemo, useState } from "react";
import { Headphones, Loader2, MessageSquare, Search, Stethoscope, UserRoundPlus, Users } from "lucide-react";
import { chatAPI, extractErrorMessage, userAPI } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";
import { Roles, useAuth } from "../../contexts/AuthContext";
import { useToast } from "../ui/Toast";
import Button from "../ui/Button";
import { UserAvatar } from "../ui/Avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";

const TARGET_ROLES = [
  { key: "patients", role: 3, labelEn: "Patients", labelAr: "المرضى", icon: Users },
  { key: "doctors", role: 2, labelEn: "Therapists", labelAr: "المعالجين", icon: Stethoscope },
  { key: "support", role: 4, labelEn: "Support", labelAr: "الدعم", icon: Headphones },
];

const getUserId = (user) =>
  user?.Id || user?.ID || user?.id || user?.UserId || user?.UserID || user?.userId;

export default function StartDirectMessageDialog({ open, onOpenChange, onStarted }) {
  const { t, isRTL } = useLanguage();
  const { role } = useAuth();
  const toast = useToast();
  const [targetRole, setTargetRole] = useState("patients");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingId, setStartingId] = useState("");

  const availableTargetRoles = useMemo(
    () => role === Roles.STAFF
      ? TARGET_ROLES.filter((item) => item.key === "patients" || item.key === "doctors")
      : TARGET_ROLES,
    [role],
  );
  const selectedRole = useMemo(
    () => availableTargetRoles.find((item) => item.key === targetRole) || availableTargetRoles[0],
    [availableTargetRoles, targetRole],
  );

  useEffect(() => {
    if (!availableTargetRoles.some((item) => item.key === targetRole)) {
      setTargetRole(availableTargetRoles[0]?.key || "patients");
    }
  }, [availableTargetRoles, targetRole]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await userAPI.getUsers({
          pageIndex: 1,
          pageSize: 20,
          role: selectedRole.role,
          name: query.trim() || undefined,
        });
        const items = response?.Data?.Items || response?.Data || response?.data?.Items || [];
        setUsers(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Failed to load users for direct chat:", error);
        toast.error(extractErrorMessage(error, t("errors.somethingWentWrong", "Something went wrong")));
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [open, query, selectedRole.role, t, toast]);

  const handleStart = async (targetUser) => {
    const targetUserId = getUserId(targetUser);
    if (!targetUserId) {
      toast.error(t("errors.somethingWentWrong", "Something went wrong"));
      return;
    }

    setStartingId(String(targetUserId));
    try {
      const response = await chatAPI.startDirectChat({
        targetUserId,
        targetRole: selectedRole.role,
      });
      if (response?.IsSuccess === false || response?.isSuccess === false) {
        throw new Error(response?.Message || response?.message || "Failed to start chat");
      }
      onStarted?.(response, targetUser);
      onOpenChange?.(false);
    } catch (error) {
      console.error("Failed to start direct chat:", error);
      toast.error(extractErrorMessage(error, t("chat.failedToStartDirectMessage", "Could not start this conversation.")));
    } finally {
      setStartingId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent sx={{ "& .MuiDialog-paper": { maxWidth: 640 } }}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserRoundPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t("chat.startMessage", "Start Message")}</DialogTitle>
              <DialogDescription>
                {t("chat.startMessageDesc", "Search for a user and create a direct conversation.")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-5">
          <div
            className={`grid gap-2 rounded-2xl border border-border bg-background-subtle p-1 ${
              availableTargetRoles.length === 2 ? "grid-cols-2" : "grid-cols-3"
            }`}
          >
            {availableTargetRoles.map((item) => {
              const Icon = item.icon;
              const active = item.key === targetRole;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setTargetRole(item.key);
                    setQuery("");
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                    active ? "bg-primary text-white shadow-sm" : "text-text-muted hover:bg-background-paper hover:text-text-heading"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {isRTL ? item.labelAr : item.labelEn}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("chat.searchUsers", "Search users...")}
              className="w-full rounded-xl border border-border bg-background-subtle py-2.5 pe-4 ps-10 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-border/70">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-text-muted">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                {t("common.loading", "Loading...")}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="mb-3 h-8 w-8 text-text-muted" />
                <p className="text-sm font-medium text-text-muted">
                  {t("chat.noUsersFound", "No users found")}
                </p>
              </div>
            ) : (
              users.map((targetUser) => {
                const targetUserId = getUserId(targetUser);
                const name = targetUser.Name || targetUser.name || targetUser.UserName || targetUser.Email || "User";
                const email = targetUser.Email || targetUser.email || "";
                const isStarting = String(startingId) === String(targetUserId);

                return (
                  <div
                    key={targetUserId || email}
                    className="flex items-center gap-3 border-b border-border/60 px-4 py-3 last:border-b-0"
                  >
                    <UserAvatar name={name} src={targetUser.Image || targetUser.image} size="md" />
                    <div className="min-w-0 flex-1 text-start">
                      <p className="truncate text-sm font-semibold text-text-heading">{name}</p>
                      {email && <p className="truncate text-xs text-text-muted">{email}</p>}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStart(targetUser)}
                      disabled={isStarting}
                      isLoading={isStarting}
                    >
                      {!isStarting && t("chat.startMessage", "Start Message")}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
