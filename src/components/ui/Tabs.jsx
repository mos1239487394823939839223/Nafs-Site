import * as React from 'react'
import MuiTabs from '@mui/material/Tabs'
import MuiTab from '@mui/material/Tab'
import Box from '@mui/material/Box'

function Tabs({ defaultValue, value, onValueChange, children, className, sx }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')

  const currentValue = value !== undefined ? value : internalValue

  const handleChange = (newValue) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <Box className={className} sx={sx}>
      {React.Children.map(children, (child) => {
        if (!child) return null
        return React.cloneElement(child, {
          _currentValue: currentValue,
          _onValueChange: handleChange,
        })
      })}
    </Box>
  )
}

function TabsList({ children, className, _currentValue, _onValueChange, sx }) {
  // Extract values and labels from TabsTrigger children
  const tabChildren = React.Children.toArray(children).filter(Boolean)

  return (
    <MuiTabs
      value={_currentValue}
      onChange={(e, newVal) => _onValueChange?.(newVal)}
      className={className}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: 48,
        bgcolor: 'action.hover',
        borderRadius: '12px',
        p: 0.5,
        '& .MuiTabs-indicator': {
          borderRadius: '8px',
          height: '100%',
          zIndex: 0,
          bgcolor: 'background.paper',
          boxShadow: 1,
        },
        '& .MuiTab-root': {
          zIndex: 1,
          minHeight: 40,
          borderRadius: '8px',
          px: 2,
          py: 1,
        },
        ...sx,
      }}
    >
      {tabChildren.map((child) => (
        <MuiTab
          key={child.props.value}
          value={child.props.value}
          label={child.props.children}
          icon={child.props.icon}
          iconPosition="start"
          disabled={child.props.disabled}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        />
      ))}
    </MuiTabs>
  )
}

// TabsTrigger is now just a data carrier - TabsList renders the actual MUI Tabs
function TabsTrigger({ value, children, icon, disabled, ...props }) {
  return null // Rendered by TabsList
}

function TabsContent({ value, children, className, _currentValue, sx, ...props }) {
  if (_currentValue !== value) return null

  return (
    <Box
      role="tabpanel"
      className={className}
      sx={{
        mt: 2,
        animation: 'fadeIn 0.2s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
