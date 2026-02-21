import * as React from 'react'
import MuiDialog from '@mui/material/Dialog'
import MuiDialogTitle from '@mui/material/DialogTitle'
import MuiDialogContent from '@mui/material/DialogContent'
import MuiDialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Zoom from '@mui/material/Zoom'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />
})

// Root Dialog component - manages open/close state
function Dialog({ children, open, onOpenChange, ...props }) {
  // We pass the open state and close handler down to children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        _dialogOpen: !!open,
        _dialogOnClose: () => onOpenChange?.(false),
      })
    }
    return child
  })

  return <>{childrenWithProps}</>
}

// DialogContent wraps everything in MUI Dialog
const DialogContent = React.forwardRef(({ className, children, _dialogOpen, _dialogOnClose, sx, ...props }, ref) => (
  <MuiDialog
    ref={ref}
    open={!!_dialogOpen}
    onClose={_dialogOnClose}
    TransitionComponent={Transition}
    maxWidth="md"
    fullWidth
    className={className}
    sx={{
      '& .MuiDialog-paper': {
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      },
      '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      },
      ...sx,
    }}
    {...props}
  >
    {/* Close button */}
    {_dialogOnClose && (
      <IconButton
        aria-label="close"
        onClick={_dialogOnClose}
        sx={{
          position: 'absolute',
          right: 12,
          top: 12,
          zIndex: 10,
          color: 'text.secondary',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    )}
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // Strip _dialog props from being passed further
        const { _dialogOpen: _, _dialogOnClose: __, ...childProps } = child.props
        return React.cloneElement(child, childProps)
      }
      return child
    })}
  </MuiDialog>
))
DialogContent.displayName = 'DialogContent'

// Simple trigger wrapper
function DialogTrigger({ children, asChild, onClick, ...props }) {
  if (!children) return null
  return React.cloneElement(children, {
    onClick: (e) => {
      children.props?.onClick?.(e)
      onClick?.(e)
    },
    ...props,
  })
}

// No-ops for API compatibility
function DialogPortal({ children }) {
  return <>{children}</>
}

function DialogClose({ children, ...props }) {
  return children || null
}

const DialogOverlay = React.forwardRef((props, ref) => null)
DialogOverlay.displayName = 'DialogOverlay'

const DialogHeader = ({ className, children, sx, ...props }) => (
  <MuiDialogTitle
    className={className}
    component="div"
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      pb: 2,
      pr: 5,
      borderBottom: '1px solid',
      borderColor: 'divider',
      ...sx,
    }}
    {...props}
  >
    {children}
  </MuiDialogTitle>
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, children, sx, ...props }) => (
  <MuiDialogActions
    className={className}
    sx={{
      px: 3,
      py: 2,
      borderTop: '1px solid',
      borderColor: 'divider',
      gap: 1,
      ...sx,
    }}
    {...props}
  >
    {children}
  </MuiDialogActions>
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef(({ className, children, sx, ...props }, ref) => (
  <MuiDialogTitle
    ref={ref}
    className={className}
    component="h2"
    sx={{
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '-0.01em',
      p: 0,
      ...sx,
    }}
    {...props}
  >
    {children}
  </MuiDialogTitle>
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef(({ className, children, sx, ...props }, ref) => (
  <DialogContentText
    ref={ref}
    className={className}
    sx={{
      fontSize: '0.875rem',
      color: 'text.secondary',
      mt: 0.5,
      ...sx,
    }}
    {...props}
  >
    {children}
  </DialogContentText>
))
DialogDescription.displayName = 'DialogDescription'

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
