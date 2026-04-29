import { NavLink, useNavigate } from "react-router-dom";
import { useAuth, Roles } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { EmergencyCallCard } from "../sidebar-cards/EmergencyCallCard";
import { BlackmailProtectionCard } from "../sidebar-cards/BlackmailProtectionCard";
import RoleBadge from "../ui/RoleBadge";
import { UserAvatar } from "../ui/Avatar";
import {
  Home,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Users,
  Activity,
  DollarSign,
  BarChart3,
  UserPlus,
  Pill,
  TestTube,
  FolderOpen,
  Clock,
  TrendingUp,
  Headphones,
  Phone,
  Ticket,
  FileText,
} from "lucide-react";

export default function DynamicSidebar({ isOpen, onClose }) {
  const { role, user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleEmergencyClick = () => {
    if (onClose && window.innerWidth < 1024) onClose();
    navigate("/dashboard/patient/messages?type=support&caseType=emergency&support=1");
  };

  const handleProtectionClick = () => {
    if (onClose && window.innerWidth < 1024) onClose();
    navigate("/dashboard/patient/messages?type=support&caseType=billing&support=1");
  };

  // Navigation items for each role
  const navigationConfig = {
    [Roles.PATIENT]: [
      {
        name: t("nav.home"),
        path: "/dashboard/patient/home",
        icon: Home,
      },
      {
        name: t("nav.reserve"),
        path: "/dashboard/patient/reserve",
        icon: Calendar,
      },
      {
        name: t("nav.tests"),
        path: "/dashboard/patient/tests",
        icon: TestTube,
      },
      {
        name: t("nav.blogs"),
        path: "/dashboard/patient/blogs",
        icon: FileText,
      },
      {
        name: t("nav.messages"),
        path: "/dashboard/patient/messages?support=1",
        icon: MessageSquare,
      },
      {
        name: t("nav.profile"),
        path: "/dashboard/patient/profile",
        icon: Settings,
      },
    ],
    [Roles.DOCTOR]: [
      {
        name: t("nav.dashboard"),
        path: "/dashboard/doctor",
        icon: Home,
      },
      { name: t("nav.queue"), path: "/dashboard/doctor/queue", icon: Users },
      {
        name: t("nav.schedule"),
        path: "/dashboard/doctor/schedule",
        icon: Calendar,
      },
      {
        name: t("nav.blogs"),
        path: "/dashboard/doctor/blogs",
        icon: FileText,
      },
      {
        name: t("nav.history"),
        path: "/dashboard/doctor/history",
        icon: Activity,
      },
      {
        name: t("nav.messages"),
        path: "/dashboard/doctor/messages",
        icon: MessageSquare,
      },
      {
        name: t("nav.profile"),
        path: "/dashboard/doctor/settings",
        icon: Settings,
      },
    ],
    [Roles.ADMIN]: [
      { name: t("nav.users"), path: "/admin/users", icon: Users },
      { name: t("nav.bookings"), path: "/admin/bookings", icon: Calendar },
      {
        name: t(
          "nav.paymentDetails",
          isRTL ? "بيانات الدفع" : "Payment Details",
        ),
        path: "/admin/payment-details",
        icon: DollarSign,
      },
      { name: t("nav.blogs"), path: "/admin/blogs", icon: FileText },
      {
        name: isRTL ? "الاختبارات" : "Tests",
        path: "/admin/tests",
        icon: TestTube,
      },
      { name: t("nav.messages"), path: "/admin/messages", icon: MessageSquare },
      { name: t("nav.profile"), path: "/admin/profile", icon: Settings },
    ],
    [Roles.STAFF]: [
      { name: t("nav.dashboard"), path: "/dashboard/staff", icon: Home },
      {
        name: t("nav.blogs"),
        path: "/dashboard/staff/blogs",
        icon: FileText,
      },
      {
        name: t("nav.messages"),
        path: "/dashboard/staff/messages",
        icon: MessageSquare,
      },
      {
        name: t("nav.profile"),
        path: "/dashboard/staff/profile",
        icon: Settings,
      },
    ],
  };

  const navItems = navigationConfig[role] || [];

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 h-full w-64 bg-background-paper
          transform transition-transform duration-300 ease-in-out z-50
          ${
            isRTL
              ? `right-0 border-l border-border ${
                  isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                }`
              : `left-0 border-r border-border ${
                  isOpen
                    ? "translate-x-0"
                    : "-translate-x-full lg:translate-x-0"
                }`
          }
        `}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-primary">
              {t("auth.platformName")}
            </h1>
            <p className="text-sm text-text-light mt-1">
              {t("auth.platformTagline")}
            </p>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={user?.name || user?.Name}
                src={user?.image || user?.Image}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">
                  {user?.name || user?.Name || "User"}
                </p>
                <RoleBadge role={role} size="sm" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end
                      onClick={() => {
                        if (onClose && window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${
                          isActive
                            ? `bg-primary/10 text-primary ${
                                isRTL ? "border-r-4" : "border-l-4"
                              } border-primary`
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

            {/* Emergency Sidebar Cards — patient only, inside scroll area */}
            {role === Roles.PATIENT && (
              <div className="flex flex-col gap-3 mt-4">
                <EmergencyCallCard onClick={handleEmergencyClick} />
                <BlackmailProtectionCard onClick={handleProtectionClick} />
              </div>
            )}
          </nav>

          {/* Logout Button */}
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
