import { cn } from '../../lib/utils'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

export default function Pagination({ page, total, onChange, className }) {
  if (total <= 1) return null

  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      
      if (page > 3) pages.push('...')
      
      const start = Math.max(2, page - 1)
      const end = Math.min(total - 1, page + 1)
      
      for (let i = start; i <= end; i++) pages.push(i)
      
      if (page < total - 2) pages.push('...')
      
      pages.push(total)
    }

    return pages
  }

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-all hover:bg-background-subtle disabled:opacity-40 disabled:cursor-not-allowed text-text-muted hover:text-text"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getVisiblePages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-text-muted">
            <MoreHorizontal className="w-4 h-4" />
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all',
              p === page
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-text-muted hover:bg-background-subtle hover:text-text'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(Math.min(total, page + 1))}
        disabled={page === total}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-all hover:bg-background-subtle disabled:opacity-40 disabled:cursor-not-allowed text-text-muted hover:text-text"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}
