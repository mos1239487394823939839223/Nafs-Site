import { forwardRef } from "react";

/**
 * Generic section surface used across the dashboard.
 * Large radius, soft shadow, clean border, smooth transition — the single
 * source of truth for "what a card looks like" so every section stays consistent.
 */
const DashboardCard = forwardRef(function DashboardCard(
  { as: Tag = "section", className = "", children, ...props },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={`rounded-3xl border border-border bg-background-paper shadow-[var(--ds-shadow-card)] transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
});

export default DashboardCard;
