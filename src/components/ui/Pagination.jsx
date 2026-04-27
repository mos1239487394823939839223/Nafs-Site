import { Pagination as MuiPagination, PaginationItem } from '@mui/material'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, total, onChange, className, sx }) {
  if (total <= 1) return null

  return (
    <MuiPagination
      count={total}
      page={page}
      onChange={(event, value) => onChange(value)}
      color="primary"
      shape="rounded"
      className={className}
      renderItem={(item) => (
        <PaginationItem
          slots={{ previous: ChevronLeft, next: ChevronRight }}
          {...item}
        />
      )}
      sx={{
        '& .MuiPaginationItem-root': {
          fontWeight: 500,
          borderRadius: '8px',
          '&.Mui-selected': {
            boxShadow: (theme) => `0 4px 14px 0 ${theme.palette.primary.main}40`,
          },
        },
        ...sx,
      }}
    />
  )
}
