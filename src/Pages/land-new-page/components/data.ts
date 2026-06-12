export const statTiles = [
  {
    icon: "CalendarDays",
    titleKey: "doctor.dashboardHome.tiles.schedule.title",
    descKey: "doctor.dashboardHome.tiles.schedule.desc",
    ctaKey: "doctor.dashboardHome.tiles.schedule.cta",
    href: "/dashboard/doctor/schedule",
  },
  {
    icon: "FileText",
    titleKey: "doctor.dashboardHome.tiles.articles.title",
    descKey: "doctor.dashboardHome.tiles.articles.desc",
    ctaKey: "doctor.dashboardHome.tiles.articles.cta",
    href: "/dashboard/doctor/blogs",
  },
  {
    icon: "Star",
    titleKey: "doctor.dashboardHome.tiles.reviews.title",
    descKey: "doctor.dashboardHome.tiles.reviews.desc",
    ctaKey: "doctor.dashboardHome.tiles.reviews.cta",
      href: "/dashboard/doctor/history?tab=statistics",
  },
  {
    icon: "BarChart3",
    titleKey: "doctor.dashboardHome.tiles.performance.title",
    descKey: "doctor.dashboardHome.tiles.performance.desc",
    ctaKey: "doctor.dashboardHome.tiles.performance.cta",
    href: "/dashboard/doctor/history?tab=statistics",
  },
];

export const todaySessions = [
  {
    name: "Sara Ahmed",
    typeKey: "doctor.dashboardHome.schedule.sessionTypes.individualAnxiety",
    timeAr: "10:00 ص - 11:00 ص",
    timeEn: "10:00 AM - 11:00 AM",
    ctaKey: "doctor.dashboardHome.schedule.enterNow",
    primary: true,
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "Mohamed Ali",
    typeKey: "doctor.dashboardHome.schedule.sessionTypes.individualDepression",
    timeAr: "12:00 م - 01:00 م",
    timeEn: "12:00 PM - 01:00 PM",
    ctaKey: "doctor.dashboardHome.schedule.join",
    primary: false,
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    name: "Fatma Hassan",
    typeKey: "doctor.dashboardHome.schedule.sessionTypes.couple",
    timeAr: "02:00 م - 03:00 م",
    timeEn: "02:00 PM - 03:00 PM",
    ctaKey: "doctor.dashboardHome.schedule.join",
    primary: false,
    avatar: "https://i.pravatar.cc/100?img=45",
  },
];

export const performance = [
  {
    icon: "Star",
    value: "4.8",
    labelKey: "doctor.dashboardHome.performance.cards.rating.label",
    deltaKey: "doctor.dashboardHome.performance.cards.rating.delta",
  },
  {
    icon: "Users",
    value: "32",
    labelKey: "doctor.dashboardHome.performance.cards.sessions.label",
    deltaKey: "doctor.dashboardHome.performance.cards.sessions.delta",
  },
  {
    icon: "Clock",
    value: "26",
    labelKey: "doctor.dashboardHome.performance.cards.hours.label",
    deltaKey: "doctor.dashboardHome.performance.cards.hours.delta",
  },
  {
    icon: "Smile",
    value: "28",
    labelKey: "doctor.dashboardHome.performance.cards.activePatients.label",
    deltaKey: "doctor.dashboardHome.performance.cards.activePatients.delta",
  },
];

export const quickTools = [
  {
    icon: "BookOpen",
    titleKey: "doctor.dashboardHome.quickTools.items.assessmentForms.title",
    descKey: "doctor.dashboardHome.quickTools.items.assessmentForms.desc",
    href: "/dashboard/doctor/medical-records?section=assessments",
  },
  {
    icon: "ClipboardList",
    titleKey: "doctor.dashboardHome.quickTools.items.sessionNotes.title",
    descKey: "doctor.dashboardHome.quickTools.items.sessionNotes.desc",
    href: "/dashboard/doctor/history?tab=records",
  },
  {
    icon: "SlidersHorizontal",
    titleKey: "doctor.dashboardHome.quickTools.items.sessionManagement.title",
    descKey: "doctor.dashboardHome.quickTools.items.sessionManagement.desc",
    href: "/dashboard/doctor/schedule?open=slot",
  },
  {
    icon: "UserPlus",
    titleKey: "doctor.dashboardHome.quickTools.items.addPatient.title",
    descKey: "doctor.dashboardHome.quickTools.items.addPatient.desc",
    href: "/dashboard/doctor/medical-records?add=1",
  },
];

export const recentPatients = [
  {
    name: "Asmaa Mahmoud",
    lastSession: "2024-02",
    date: "2024-05-12",
    statusKey: "doctor.dashboardHome.recentPatients.status.active",
    statusVariant: "active",
    avatar: "https://i.pravatar.cc/100?img=44",
  },
  {
    name: "Ahmed Khaled",
    lastSession: "2024-09",
    date: "2024-05-10",
    statusKey: "doctor.dashboardHome.recentPatients.status.active",
    statusVariant: "active",
    avatar: "https://i.pravatar.cc/100?img=14",
  },
  {
    name: "Nouran Ali",
    lastSession: "2024-08",
    date: "2024-05-08",
    statusKey: "doctor.dashboardHome.recentPatients.status.followUp",
    statusVariant: "followUp",
    avatar: "https://i.pravatar.cc/100?img=49",
  },
];
