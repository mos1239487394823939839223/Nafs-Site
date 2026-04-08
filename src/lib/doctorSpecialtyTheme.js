const SPECIALTY_THEME_MAP = {
  psychiatry: {
    badge: "bg-primary/10 text-primary border-primary/25",
    surface: "bg-primary/5 border-primary/20",
    accent: "from-primary/20 to-primary-light/10",
    avatar: "bg-primary/10 border-primary/25 text-primary",
  },
  psychology: {
    badge: "bg-secondary/15 text-secondary-dark border-secondary/30",
    surface: "bg-secondary/10 border-secondary/25",
    accent: "from-secondary/25 to-secondary-light/10",
    avatar: "bg-secondary/15 border-secondary/25 text-secondary-dark",
  },
  neurology: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    surface: "bg-blue-50/70 border-blue-200",
    accent: "from-blue-100 to-blue-50",
    avatar: "bg-blue-100 border-blue-200 text-blue-700",
  },
  pediatrics: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    surface: "bg-amber-50/70 border-amber-200",
    accent: "from-amber-100 to-amber-50",
    avatar: "bg-amber-100 border-amber-200 text-amber-700",
  },
  dermatology: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    surface: "bg-rose-50/70 border-rose-200",
    accent: "from-rose-100 to-rose-50",
    avatar: "bg-rose-100 border-rose-200 text-rose-700",
  },
  cardiology: {
    badge: "bg-red-50 text-red-700 border-red-200",
    surface: "bg-red-50/70 border-red-200",
    accent: "from-red-100 to-red-50",
    avatar: "bg-red-100 border-red-200 text-red-700",
  },
  orthopedics: {
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    surface: "bg-slate-100/70 border-slate-300",
    accent: "from-slate-200 to-slate-100",
    avatar: "bg-slate-200 border-slate-300 text-slate-700",
  },
  general: {
    badge: "bg-background-subtle text-text-muted border-border",
    surface: "bg-background-subtle/70 border-border",
    accent: "from-background-subtle to-background",
    avatar: "bg-background-subtle border-border text-text-muted",
  },
};

const SPECIALTY_ALIASES = {
  psych: "psychiatry",
  psychiatrist: "psychiatry",
  mental: "psychiatry",
  therapist: "psychology",
  neurologist: "neurology",
  neuro: "neurology",
  pediatrician: "pediatrics",
  children: "pediatrics",
  skin: "dermatology",
  dermatologist: "dermatology",
  heart: "cardiology",
  cardiologist: "cardiology",
  bones: "orthopedics",
  orthopedic: "orthopedics",
  orthopaedic: "orthopedics",
};

const normalizeSpecialtyKey = (specialty) => {
  const raw = String(specialty || "")
    .toLowerCase()
    .trim();
  if (!raw) return "general";

  if (SPECIALTY_THEME_MAP[raw]) return raw;

  const aliasMatch = Object.entries(SPECIALTY_ALIASES).find(([alias]) =>
    raw.includes(alias),
  );
  if (aliasMatch) return aliasMatch[1];

  return "general";
};

export const getDoctorSpecialtyTheme = (specialties = []) => {
  const firstSpecialty =
    Array.isArray(specialties) && specialties.length > 0
      ? specialties[0]
      : specialties;
  const normalized = normalizeSpecialtyKey(firstSpecialty);
  return SPECIALTY_THEME_MAP[normalized] || SPECIALTY_THEME_MAP.general;
};
