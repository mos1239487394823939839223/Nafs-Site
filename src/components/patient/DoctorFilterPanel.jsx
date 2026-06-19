import {
  ArrowDownUp,
  CalendarDays,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Users,
  WalletCards,
} from "lucide-react";

const chipClass = (active) =>
  `rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
    active
      ? "border-primary bg-primary text-white shadow-sm shadow-primary/20"
      : "border-border bg-background-paper text-text-muted hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
  }`;

const FilterSection = ({ icon: Icon, title, hint, children, className = "" }) => (
  <section
    className={`rounded-2xl border border-border/70 bg-background-paper/80 p-4 shadow-sm ${className}`}
  >
    <div className="mb-3 flex items-center gap-2.5">
      <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div>
        <h4 className="text-sm font-bold text-text-heading">{title}</h4>
        {hint && <p className="mt-0.5 text-[11px] text-text-muted">{hint}</p>}
      </div>
    </div>
    {children}
  </section>
);

export default function DoctorFilterPanel({
  specialties,
  filterSpecialties,
  onSpecialtiesChange,
  filterGender,
  onGenderChange,
  filterPriceMin,
  filterPriceMax,
  onPriceChange,
  filterAvailability,
  onAvailabilityChange,
  showAvailabilityFilter,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  t,
}) {
  const minPrice = Number(filterPriceMin || 0);
  const maxPrice = Number(filterPriceMax || 2000);
  const updateMinPrice = (value) => onPriceChange(String(Math.min(Number(value), maxPrice)), String(maxPrice));
  const updateMaxPrice = (value) => onPriceChange(String(minPrice), String(Math.max(Number(value), minPrice)));
  const toggleSpecialty = (specialty) => {
    onSpecialtiesChange(
      filterSpecialties.includes(specialty)
        ? filterSpecialties.filter((item) => item !== specialty)
        : [...filterSpecialties, specialty],
    );
  };

  const activeCount =
    filterSpecialties.length +
    (filterGender !== null ? 1 : 0) +
    (filterPriceMin !== "" || filterPriceMax !== "" ? 1 : 0) +
    (filterAvailability !== "all" ? 1 : 0) +
    (sortBy !== "default" ? 1 : 0);

  const sortOptions = [
    { value: "default", label: t("patient.sortDefault", "Default") },
    { value: "availability", label: t("patient.sortAvailability", "Nearest Available") },
    { value: "rating", label: t("patient.sortRating", "Highest Rating") },
    { value: "priceAsc", label: t("patient.sortPriceAsc", "Price: Low to High") },
    { value: "priceDesc", label: t("patient.sortPriceDesc", "Price: High to Low") },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/[0.07] to-background-paper shadow-[0_18px_50px_rgba(51,104,87,0.10)]">
      <div className="flex flex-col gap-4 border-b border-primary/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25">
            <SlidersHorizontal className="h-5 w-5" />
            <Sparkles className="absolute -end-1 -top-1 h-4 w-4 text-amber-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-text-heading">
                {t("patient.filterDoctors", "Filter Therapists")}
              </h3>
              {activeCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {t("patient.filterPanelHint", "Choose what matters most to find the right therapist")}
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-primary/20 bg-background-paper px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("patient.clearFilters", "Clear Filters")}
          </button>
        )}
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
        <FilterSection
          icon={ArrowDownUp}
          title={t("patient.sortBy", "Sort By")}
          hint={t("patient.sortHint", "Arrange results your way")}
          className="lg:col-span-2"
        >
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={chipClass(sortBy === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {specialties.length > 0 && (
          <FilterSection
            icon={Stethoscope}
            title={t("patient.filterSpecialty", "Specialty")}
            hint={t("patient.specialtyHint", "You can select more than one specialty")}
            className="lg:col-span-2"
          >
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto pe-1">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => toggleSpecialty(specialty)}
                  className={chipClass(filterSpecialties.includes(specialty))}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        <FilterSection icon={Users} title={t("patient.filterGender", "Gender")}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: null, label: t("common.all", "All") },
              { value: 1, label: t("common.male", "Male") },
              { value: 2, label: t("common.female", "Female") },
            ].map((option) => (
              <button
                key={String(option.value)}
                onClick={() => onGenderChange(option.value)}
                className={chipClass(filterGender === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection icon={WalletCards} title={t("patient.filterPriceRange", "Price Range")}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
                {minPrice} EGP
              </span>
              <span className="h-px flex-1 bg-border" />
              <span className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
                {maxPrice} EGP
              </span>
            </div>
            <div className="grid gap-3">
              <label className="grid gap-1 text-[11px] font-semibold text-text-muted">
                {t("common.min", "Minimum Price")}
                <input type="range" min="0" max="2000" step="50" value={minPrice} onChange={(event) => updateMinPrice(event.target.value)} className="w-full accent-primary" />
              </label>
              <label className="grid gap-1 text-[11px] font-semibold text-text-muted">
                {t("common.max", "Maximum Price")}
                <input type="range" min="0" max="2000" step="50" value={maxPrice} onChange={(event) => updateMaxPrice(event.target.value)} className="w-full accent-primary" />
              </label>
            </div>
          </div>
        </FilterSection>

        {showAvailabilityFilter && (
          <FilterSection
            icon={CalendarDays}
            title={t("patient.filterAvailability", "Availability")}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { value: "all", label: t("patient.allAvailableAppointments", "All Available Appointments") },
                { value: "now", label: t("patient.availabilityNow", "Available Now") },
                { value: "today", label: t("patient.availabilityToday", "Today") },
                { value: "week", label: t("patient.availabilityThisWeek", "This Week") },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onAvailabilityChange(option.value)}
                  className={chipClass(filterAvailability === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </FilterSection>
        )}
      </div>
    </div>
  );
}
