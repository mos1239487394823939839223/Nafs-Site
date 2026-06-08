import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth, Roles } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { chatAPI, userAPI } from "../../lib/api";
import { getConfiguredBlackmailSupportUserId } from "../../lib/supportRouting";
import { EmergencyCallCard } from "../sidebar-cards/EmergencyCallCard";
import { BlackmailProtectionCard } from "../sidebar-cards/BlackmailProtectionCard";
import RoleBadge from "../ui/RoleBadge";
import { UserAvatar } from "../ui/Avatar";
import { useToast } from "../ui/Toast";
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  DollarSign,
  FileText,
  Headphones,
  HeartHandshake,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  TestTube,
  Users,
} from "lucide-react";

export default function DynamicSidebar({ isOpen, onClose }) {
  const { role, user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const closeOnMobile = () => {
    if (onClose && window.innerWidth < 1024) onClose();
  };

  const handleEmergencyClick = () => {
    closeOnMobile();
    navigate("/dashboard/patient/messages?type=support&caseType=emergency&support=1");
  };

  const handleProtectionClick = async () => {
    closeOnMobile();
    const patientId = userAPI.resolveUserId(user);
    const dedicatedSupportUserId = getConfiguredBlackmailSupportUserId();

    if (!patientId) {
      navigate("/dashboard/patient/messages?type=support&caseType=blackmail_abuse&support=1");
      return;
    }

    try {
      const response = await chatAPI.openBlackmailSupportChat(patientId, dedicatedSupportUserId);
      const data = response?.Data ?? response?.data ?? response;
      const roomId =
        data?.RoomId ||
        data?.roomId ||
        data?.Id ||
        data?.id ||
        data?.ChatRoomId ||
        data?.chatRoomId;
      navigate(
        `/dashboard/patient/messages?type=support&caseType=blackmail_abuse&support=1${roomId ? `&room=${roomId}` : ""}`,
      );
    } catch (error) {
      console.error("Failed to open blackmail support chat:", error);
      toast.error(t("errors.somethingWentWrong", "Could not open the private support chat now."));
      navigate("/dashboard/patient/messages?type=support&caseType=blackmail_abuse&support=1");
    }
  };

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  if (role === Roles.PATIENT) {
    const mainItems = [
      { name: t("nav.home"), path: "/dashboard/patient/home", icon: Home },
      { name: t("nav.mySessions"), path: "/dashboard/patient/reserve", icon: Calendar },
      { name: t("nav.doctors"), path: "/dashboard/patient/reserve?tab=available", icon: Users },
      { name: t("nav.psychologicalAssessment"), path: "/dashboard/patient/tests", icon: Brain },
      { name: t("nav.treatmentPrograms"), path: "/dashboard/patient/tests", icon: HeartHandshake },
      { name: t("nav.contentLibrary"), path: "/dashboard/patient/blogs", icon: BookOpen },
    ];
    const supportItems = [
      { name: t("nav.supportAndHelp"), path: "/dashboard/patient/messages?type=support", icon: Headphones },
      { name: t("nav.settings"), path: "/dashboard/patient/profile", icon: Settings },
    ];
    const currentUrl = `${location.pathname}${location.search}`;

    const renderPatientLink = (item) => {
      const Icon = item.icon;
      const isActive =
        item.path.includes("?")
          ? currentUrl === item.path
          : location.pathname === item.path;

      return (
        <li key={item.path}>
          <NavLink
            to={item.path}
            onClick={closeOnMobile}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${
              isActive
                ? "bg-white/14 text-white shadow-lg shadow-black/10"
                : "text-white/78 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        </li>
      );
    };

    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
        )}
        <aside
          className={`fixed start-0 top-0 z-50 h-full w-[86vw] max-w-[280px] border-e border-white/10 bg-gradient-to-b from-[#0F5132] via-[#104733] to-[#083625] text-white shadow-2xl shadow-black/25 transform transition-transform duration-300 ease-in-out ${
            isOpen
              ? "translate-x-0"
              : isRTL
                ? "translate-x-full lg:translate-x-0"
                : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-6">
              {isRTL ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black tracking-tight">nafas</span>
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-[#7ACB88] to-[#2F855A]">
                      <HeartHandshake className="h-5 w-5 text-white" />
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white/85 transition-colors hover:bg-white/15"
                    aria-label="Menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white/85 transition-colors hover:bg-white/15"
                    aria-label="Menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black tracking-tight">nafas</span>
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-[#7ACB88] to-[#2F855A]">
                      <HeartHandshake className="h-5 w-5 text-white" />
                    </span>
                  </div>
                </>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto px-4 pb-5">
              <ul className="space-y-2">{mainItems.map(renderPatientLink)}</ul>
              <div className="my-5 h-px bg-white/16" />
              <ul className="space-y-2">
                {supportItems.map(renderPatientLink)}
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-white/78 transition-all hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{t("auth.logout")}</span>
                  </button>
                </li>
              </ul>

              <div className="mt-7 space-y-4">
                <EmergencyCallCard onClick={handleEmergencyClick} />
                <BlackmailProtectionCard onClick={handleProtectionClick} />
              </div>

              <div className="mt-7 rounded-3xl p-4 text-center text-white">
                <ShieldCheck className="mx-auto mb-3 h-7 w-7 text-emerald-200" />
                <h4 className="mb-2 text-base font-extrabold">{t("sidebar.privacy.title")}</h4>
                <p className="text-xs leading-6 text-white/75">
                  {t("sidebar.privacy.desc")}
                </p>
              </div>
            </nav>
          </div>
        </aside>
      </>
    );
  }

  const navigationConfig = {
    [Roles.DOCTOR]: [
      { name: t("nav.dashboard"), path: "/dashboard/doctor", icon: Home },
      { name: t("nav.queue"), path: "/dashboard/doctor/queue", icon: Users },
      { name: t("nav.schedule"), path: "/dashboard/doctor/schedule", icon: Calendar },
      { name: t("nav.blogs"), path: "/dashboard/doctor/blogs", icon: FileText },
      { name: t("nav.history"), path: "/dashboard/doctor/history", icon: Activity },
      { name: t("nav.messages"), path: "/dashboard/doctor/messages", icon: MessageSquare },
      { name: t("nav.profile"), path: "/dashboard/doctor/settings", icon: Settings },
    ],
    [Roles.ADMIN]: [
      { name: t("nav.users"), path: "/admin/users", icon: Users },
      { name: t("nav.bookings"), path: "/admin/bookings", icon: Calendar },
      { name: t("nav.paymentDetails"), path: "/admin/payment-details", icon: DollarSign },
      { name: t("nav.blogs"), path: "/admin/blogs", icon: FileText },
      { name: t("admin.tests") || "Tests", path: "/admin/tests", icon: TestTube },
      { name: t("nav.messages"), path: "/admin/messages", icon: MessageSquare },
      { name: t("nav.profile"), path: "/admin/profile", icon: Settings },
    ],
    [Roles.STAFF]: [
      { name: t("nav.dashboard"), path: "/dashboard/staff", icon: Home },
      { name: t("nav.blogs"), path: "/dashboard/staff/blogs", icon: FileText },
      { name: t("nav.messages"), path: "/dashboard/staff/messages", icon: MessageSquare },
      { name: t("nav.profile"), path: "/dashboard/staff/profile", icon: Settings },
    ],
  };
  const navItems = navigationConfig[role] || [];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 h-full w-[85vw] max-w-[280px] sm:w-64 bg-background-paper transform transition-transform duration-300 ease-in-out z-50 start-0 border-e border-border ${
          isOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-primary">{t("auth.platformName")}</h1>
            <p className="text-sm text-text-light mt-1">{t("auth.platformTagline")}</p>
          </div>

          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <UserAvatar name={user?.name || user?.Name} src={user?.image || user?.Image} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{user?.name || user?.Name || "User"}</p>
                <RoleBadge role={role} size="sm" />
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end
                      onClick={closeOnMobile}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary border-s-4 border-primary"
                            : "text-text hover:bg-background-gray hover:text-primary"
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t("auth.logout")}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
