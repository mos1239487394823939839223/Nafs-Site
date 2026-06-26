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
import { useNotifications } from "../../contexts/NotificationContext";
import {
  Activity,
  Bell,
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
  const { unreadCount, unreadByCategory } = useNotifications();

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
      { name: t("nav.doctors"), path: "/dashboard/patient/reserve?tab=available", icon: Users },
      { name: t("nav.psychologicalAssessment"), path: "/dashboard/patient/tests", icon: Brain },
      { name: t("nav.treatmentPrograms"), path: "/dashboard/patient/treatment-program", icon: HeartHandshake },
      { name: t("nav.contentLibrary"), path: "/dashboard/patient/blogs", icon: BookOpen },
      { name: t("nav.messages", "الرسائل"), path: "/dashboard/patient/messages?type=doctors", icon: MessageSquare, badge: unreadByCategory.messages || 0 },
      { name: t("common.notifications", "Notifications"), path: "/notifications", icon: Bell, badge: unreadCount },
    ];
    const supportItems = [
      { name: t("nav.supportAndHelp"), path: "/dashboard/patient/messages?type=support", icon: Headphones, badge: (unreadByCategory.support || 0) + (unreadByCategory.emergency || 0), emergency: Boolean(unreadByCategory.emergency) },
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
            style={isActive ? { backgroundColor: "#2c6947", color: "#ffffff" } : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all relative ${
              isActive
                ? "shadow-sm font-bold"
                : "text-[#bfd9d4] hover:bg-white/8 hover:text-white"
            }`}
          >
            {isActive && (
              <span className={`absolute ${isRTL ? 'right-1.5' : 'left-1.5'} top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-emerald-400`} />
            )}
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className={isActive ? (isRTL ? 'pr-1.5' : 'pl-1.5') : ''}>{item.name}</span>
            {item.badge > 0 && (
              <span className={`ms-auto grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${item.emergency ? "bg-red-500 text-white" : "bg-white/15 text-white"}`}>
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
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
          style={{ backgroundColor: "#153f34" }}
          className={`fixed start-0 top-0 z-50 h-full w-[86vw] max-w-[280px] border-e border-white/10 text-[#bfd9d4] shadow-card transform transition-transform duration-300 ease-in-out ${
            isOpen
              ? "translate-x-0"
              : isRTL
                ? "translate-x-full lg:translate-x-0"
                : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-6">
              {isRTL ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black tracking-tight text-white">nafas</span>
                    <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: "#2c6947" }}>
                      <HeartHandshake className="h-5 w-5 text-white" />
                    </span>
                  </div>
                </>
              ) : (
                <>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black tracking-tight text-white">nafas</span>
                <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: "#2c6947" }}>
                  <HeartHandshake className="h-5 w-5 text-white" />
                </span>
              </div>
                </>
              )}
            </div>

            <nav className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
              <ul className="space-y-1">{mainItems.map(renderPatientLink)}</ul>
              <div className="my-4 h-px bg-white/16" />
              <ul className="space-y-1">
                {supportItems.map(renderPatientLink)}
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#bfd9d4] transition-all hover:bg-white/8 hover:text-white"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{t("auth.logout")}</span>
                  </button>
                </li>
              </ul>

              <div className="mt-5 space-y-3">
                <EmergencyCallCard onClick={handleEmergencyClick} />
                <BlackmailProtectionCard onClick={handleProtectionClick} />
              </div>

              <div className="mt-4 mx-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-start flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-[#bfd9d4] shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{t("sidebar.privacy.title")}</h4>
                  <p className="text-[10px] leading-relaxed text-[#bfd9d4]/80">
                    {t("sidebar.privacy.desc")}
                  </p>
                </div>
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
      { name: t("nav.history"), path: "/dashboard/doctor/history?tab=records", icon: Activity },
      { name: t("doctor.medicalHistory", "Medical records"), path: "/dashboard/doctor/medical-records", icon: FileText },
      { name: t("nav.messages"), path: "/dashboard/doctor/messages", icon: MessageSquare, badge: unreadByCategory.messages || 0 },
      { name: t("common.notifications", "Notifications"), path: "/notifications", icon: Bell, badge: unreadCount },
      { name: t("nav.profile"), path: "/dashboard/doctor/settings", icon: Settings },
    ],
    [Roles.ADMIN]: [
      { name: t("nav.users"), path: "/admin/users", icon: Users },
      { name: t("nav.bookings"), path: "/admin/bookings", icon: Calendar },
      { name: t("nav.paymentDetails"), path: "/admin/payment-details", icon: DollarSign },
      { name: t("nav.blogs"), path: "/admin/blogs", icon: FileText },
      { name: t("admin.tests") || "Tests", path: "/admin/tests", icon: TestTube },
      { name: t("nav.messages"), path: "/admin/messages", icon: MessageSquare, badge: unreadByCategory.messages || 0 },
      { name: t("common.notifications", "Notifications"), path: "/notifications", icon: Bell, badge: unreadCount },
      { name: t("nav.profile"), path: "/admin/profile", icon: Settings },
    ],
    [Roles.STAFF]: [
      { name: t("nav.dashboard"), path: "/dashboard/staff", icon: Home },
      { name: t("nav.blogs"), path: "/dashboard/staff/blogs", icon: FileText },
      { name: t("nav.messages"), path: "/dashboard/staff/messages", icon: MessageSquare, badge: unreadByCategory.messages || 0 },
      { name: t("common.notifications", "Notifications"), path: "/notifications", icon: Bell, badge: unreadCount },
      { name: t("nav.profile"), path: "/dashboard/staff/profile", icon: Settings },
    ],
  };
  const navItems = navigationConfig[role] || [];

  if (role === Roles.DOCTOR) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
        )}
        <aside
          style={{ backgroundColor: "#153f34" }}
          className={`fixed start-0 top-0 z-50 h-full w-[88vw] max-w-[292px] border-e border-white/10 text-[#bfd9d4] shadow-card transform transition-transform duration-300 ease-in-out ${
            isOpen
              ? "translate-x-0"
              : isRTL
                ? "translate-x-full lg:translate-x-0"
                : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 pb-6 pt-8">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl shadow-md" style={{ backgroundColor: "#2c6947" }}>
                  <HeartHandshake className="h-6 w-6 text-white" />
                </span>
                <div>
                  <p className="text-2xl font-black leading-none tracking-tight text-white">nafas</p>
                  <p className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-[#bfd9d4]/70">
                    CARE PLATFORM
                  </p>
                </div>
              </div>
            </div>

            <nav className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
              <ul className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        end
                        onClick={closeOnMobile}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all relative ${
                            isActive
                              ? "text-white shadow-sm font-bold"
                              : "text-[#bfd9d4] hover:bg-white/8 hover:text-white"
                          }`
                        }
                        style={({ isActive }) => (isActive ? { backgroundColor: "#2c6947" } : undefined)}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className={`absolute ${isRTL ? 'right-1.5' : 'left-1.5'} top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-emerald-300`} />
                            )}
                            <Icon className="h-5 w-5 shrink-0" />
                            <span className={isActive ? (isRTL ? 'pr-1.5' : 'pl-1.5') : ''}>{item.name}</span>
                            {item.badge > 0 && (
                              <span className={`ms-auto rounded-full px-2 py-0.5 text-[10px] font-black ${item.emergency ? "bg-red-500 text-white" : "bg-white/15 text-white"}`}>
                                {item.badge > 99 ? "99+" : item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>

              <div className="my-6 h-px bg-white/15" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#bfd9d4] hover:bg-white/8 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
                <span>{t("auth.logout")}</span>
              </button>
            </nav>

            <div className="m-4 mt-0 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-start flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white/10 text-[#bfd9d4] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">{t("sidebar.privacy.title")}</h4>
                <p className="text-[10px] leading-relaxed text-[#bfd9d4]/80">
                  {t("sidebar.privacy.desc")}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        style={{ backgroundColor: "#153f34" }}
        className={`fixed top-0 h-full w-[85vw] max-w-[280px] sm:w-64 text-[#bfd9d4] transform transition-transform duration-300 ease-in-out z-50 start-0 border-e border-white/10 ${
          isOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-white">{t("auth.platformName")}</h1>
            <p className="text-sm text-[#bfd9d4]/80 mt-1">{t("auth.platformTagline")}</p>
          </div>

          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <UserAvatar name={user?.name || user?.Name} src={user?.image || user?.Image} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user?.name || user?.Name || "User"}</p>
                <RoleBadge role={role} size="sm" />
              </div>
            </div>
          </div>

          <nav className="no-scrollbar flex-1 overflow-y-auto p-4">
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
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                          isActive
                            ? "text-white font-bold shadow-sm"
                            : "text-[#bfd9d4] hover:bg-white/8 hover:text-white"
                        }`
                      }
                      style={({ isActive }) => (isActive ? { backgroundColor: "#2c6947" } : undefined)}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.name}</span>
                      {item.badge > 0 && (
                        <span className={`ms-auto rounded-full px-2 py-0.5 text-[10px] font-black text-white ${item.emergency ? "bg-red-500" : "bg-white/15"}`}>
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[#bfd9d4] hover:bg-white/8 hover:text-white transition-all duration-200"
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
