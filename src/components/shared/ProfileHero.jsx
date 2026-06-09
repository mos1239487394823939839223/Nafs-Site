import { Camera, Loader2, Mail } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

/**
 * Reusable, fully-responsive profile hero header for all roles
 * (patient, doctor, admin, staff, manager, etc.).
 *
 * Mobile  : avatar centered, content stacked vertically.
 * Desktop : avatar overlaps the cover, content sits beside it.
 *
 * Props:
 *  - avatar             : URL string | null
 *  - uploadingImage     : boolean (shows spinner inside avatar)
 *  - initials           : fallback text when no image
 *  - displayName        : main heading text
 *  - email              : muted email line under name (optional)
 *  - onAvatarChange     : file <input> change handler
 *  - patternId          : unique id for the SVG pattern (prevents conflicts)
 *  - badges             : Array<{ icon?, label, tone?: 'primary'|'emerald', pulse?: boolean }>
 *  - actions            : ReactNode (right side action buttons)
 *  - showOnlineDot      : boolean (default true)
 */
export default function ProfileHero({
    avatar,
    uploadingImage = false,
    initials = '',
    displayName,
    email,
    onAvatarChange,
    patternId = 'profile-hero-grid',
    badges = [],
    actions,
    showOnlineDot = true,
    status = 'online',
}) {
    const { t } = useLanguage()
    const statusMeta = {
        online: { label: t('common.online'), dot: 'bg-emerald-400' },
        away: { label: t('common.away', 'Away'), dot: 'bg-amber-400' },
        offline: { label: t('common.offline'), dot: 'bg-slate-400' },
    }[status] || { label: t('common.online'), dot: 'bg-emerald-400' }
    return (
        <>
            {/* ─── Cover banner ─── */}
            <div className="h-40 sm:h-56 md:h-72 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
                <svg
                    className="absolute inset-0 w-full h-full opacity-10"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id={patternId}
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="white"
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
                </svg>
                <div className="absolute top-8 start-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 end-1/3 w-64 h-64 bg-secondary/30 rounded-full blur-3xl" />
            </div>

            {/* ─── Info bar ─── */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 relative">
                <div className="flex flex-col">
                    {/* Avatar:
                          mobile  → centered, overlaps cover by -mt-16
                          desktop → absolute, anchored to cover bottom-start */}
                    <div className="flex justify-center md:justify-start -mt-16">
                        <div className="relative group">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-4 border-background-paper shadow-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                                {uploadingImage ? (
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                ) : avatar ? (
                                    <img
                                        src={avatar}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl sm:text-4xl font-bold text-primary">
                                        {initials}
                                    </span>
                                )}
                            </div>
                            {onAvatarChange && (
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                                    <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={onAvatarChange}
                                    />
                                </label>
                            )}
                            {showOnlineDot && (
                                <div title={statusMeta.label} className={`absolute bottom-1 end-1 sm:bottom-2 sm:end-2 w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusMeta.dot} rounded-full border-2 border-background-paper shadow`} />
                            )}
                        </div>
                    </div>

                    {/* Name + badges + email + actions */}
                    <div className="mt-4 rounded-[var(--ds-radius-card)] border border-border bg-background-paper px-5 pt-4 flex flex-col md:flex-row items-center md:items-end justify-between pb-5 shadow-[var(--ds-shadow-card)] gap-5">
                        <div className="text-center md:text-start md:ms-3 min-w-0 w-full md:max-w-sm">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-heading break-words">
                                {displayName}
                            </h1>

                            {badges.length > 0 && (
                                <div className="flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 mt-2 flex-wrap">
                                    {badges.map((b, i) => {
                                        const Icon = b.icon
                                        const tone = b.tone === 'primary'
                                            ? 'text-primary bg-primary/10'
                                            : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                        return (
                                            <span
                                                key={i}
                                                className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap ${tone}`}
                                            >
                                                {b.pulse ? (
                                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
                                                ) : Icon ? (
                                                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                                ) : null}
                                                {b.label}
                                            </span>
                                        )
                                    })}
                                </div>
                            )}

                            {email && (
                                <p className="text-xs sm:text-sm text-text-muted mt-1.5 flex items-center justify-center md:justify-start gap-1.5 min-w-0">
                                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate min-w-0">{email}</span>
                                </p>
                            )}
                            <p className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-text-muted">
                                <span className={`h-2.5 w-2.5 rounded-full ${statusMeta.dot}`} />
                                {statusMeta.label}
                            </p>
                        </div>

                        {actions && (
                            <div className="flex items-center justify-center md:justify-end gap-2 sm:gap-3 flex-wrap w-full md:w-auto md:pb-1">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
