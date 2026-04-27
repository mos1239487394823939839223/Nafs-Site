import { X } from "lucide-react";
import Button from "../ui/Button";

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
  isRTL,
}) {
  const toggleSpecialty = (spec) => {
    if (filterSpecialties.includes(spec)) {
      onSpecialtiesChange(filterSpecialties.filter((s) => s !== spec));
    } else {
      onSpecialtiesChange([...filterSpecialties, spec]);
    }
  };

  return (
    <div
      className="bg-background-paper border border-border rounded-2xl p-4 md:p-5 space-y-5 shadow-sm"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-heading text-sm">
          {t("patient.filterDoctors", "Filter & Sort")}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-primary hover:text-primary/70 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {t("patient.clearFilters", "Clear All")}
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-medium text-text-muted mb-2 block uppercase tracking-wide">
          {t("patient.sortBy", "Sort by")}
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "default", label: t("patient.sortDefault", "Default") },
            { value: "rating", label: t("patient.sortRating", "Highest Rating") },
            { value: "price", label: t("patient.sortPrice", "Lowest Price") },
            { value: "availability", label: t("patient.sortAvailability", "Nearest Available") },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                sortBy === opt.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-background-subtle border-border text-text-muted hover:text-text-heading hover:border-primary/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Specialty Multi-select */}
      {specialties.length > 0 && (
        <div>
          <label className="text-xs font-medium text-text-muted mb-2 block uppercase tracking-wide">
            {t("patient.filterSpecialty", "Specialty")}
          </label>
          <div className="flex flex-wrap gap-2">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => toggleSpecialty(spec)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                  filterSpecialties.includes(spec)
                    ? "bg-primary/10 text-primary border-primary/40"
                    : "bg-background-subtle border-border text-text-muted hover:text-text-heading hover:border-primary/30"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Gender */}
        <div>
          <label className="text-xs font-medium text-text-muted mb-2 block uppercase tracking-wide">
            {t("patient.filterGender", "Gender")}
          </label>
          <div className="flex gap-2">
            {[
              { value: null, label: t("common.all", "All") },
              { value: 1, label: t("common.male", "Male") },
              { value: 0, label: t("common.female", "Female") },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => onGenderChange(filterGender === opt.value ? (opt.value === null ? null : null) : opt.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex-1 ${
                  filterGender === opt.value
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-background-subtle border-border text-text-muted hover:text-text-heading hover:border-primary/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-xs font-medium text-text-muted mb-2 block uppercase tracking-wide">
            {t("patient.filterPriceRange", "Price Range (EGP)")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={t("common.min", "Min")}
              value={filterPriceMin}
              onChange={(e) => onPriceChange(e.target.value, filterPriceMax)}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background-subtle text-text-heading placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
            <span className="text-text-muted text-xs">—</span>
            <input
              type="number"
              placeholder={t("common.max", "Max")}
              value={filterPriceMax}
              onChange={(e) => onPriceChange(filterPriceMin, e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background-subtle text-text-heading placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Availability (only on All Doctors tab) */}
        {showAvailabilityFilter && (
          <div>
            <label className="text-xs font-medium text-text-muted mb-2 block uppercase tracking-wide">
              {t("patient.filterAvailability", "Availability")}
            </label>
            <div className="flex gap-2">
              {[
                { value: "all", label: t("common.all", "All") },
                { value: "today", label: t("patient.availabilityToday", "Today") },
                { value: "week", label: t("patient.availabilityThisWeek", "This Week") },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onAvailabilityChange(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex-1 ${
                    filterAvailability === opt.value
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-background-subtle border-border text-text-muted hover:text-text-heading hover:border-primary/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
