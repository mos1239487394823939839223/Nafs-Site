import * as React from 'react'
import MuiDialog from '@mui/material/Dialog'
import MuiDialogTitle from '@mui/material/DialogTitle'
import MuiDialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import { X as CloseIcon } from 'lucide-react'
import Slide from '@mui/material/Slide'

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function Modal({ isOpen, onClose, title, children, className, size = 'md', sx }) {
  return (
    <MuiDialog
      open={!!isOpen}
      onClose={onClose}
      maxWidth={sizeMap[size] || 'md'}
      fullWidth
      className={className}
      TransitionComponent={Transition}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          overflow: 'hidden',
        },
        ...sx,
      }}
    >
      {/* Header */}
      <MuiDialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 3,
          borderBottom: 1,
          borderColor: 'divider',
          fontSize: '1.5rem',
          fontWeight: 600,
        }}
      >
        {title}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseIcon size={18} />
        </IconButton>
      </MuiDialogTitle>

      {/* Content */}
      <MuiDialogContent
        sx={{
          p: 3,
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
        }}
      >
        {children}
      </MuiDialogContent>
    </MuiDialog>
  )
}
