import * as React from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import MuiSelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'

const Input = React.forwardRef(
  ({ className, type = 'text', label, error, icon: Icon, startContent, placeholder, value, onChange, name, required, disabled, sx, ...props }, ref) => {
    const startAdornment = (Icon || startContent) ? (
      <InputAdornment position="start">
        {Icon ? <Icon style={{ width: 18, height: 18, opacity: 0.6 }} /> : startContent}
      </InputAdornment>
    ) : undefined

    return (
      <TextField
        inputRef={ref}
        type={type}
        label={label}
        placeholder={placeholder}
        error={!!error}
        helperText={error || undefined}
        fullWidth
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={className}
        size="medium"
        slotProps={{
          input: {
            startAdornment,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          },
          ...sx,
        }}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export function Select({ label, error, className, children, value, onChange, name, required, disabled, sx, ...props }) {
  // Auto-convert <option> to <MenuItem> for backward compatibility
  const convertedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === 'option') {
      return (
        <MenuItem value={child.props.value}>
          {child.props.children}
        </MenuItem>
      )
    }
    return child
  })

  return (
    <FormControl fullWidth error={!!error} className={className}>
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect
        label={label}
        value={value}
        onChange={onChange}
        name={name}
        required={required}
        disabled={disabled}
        sx={{
          borderRadius: '12px',
          ...sx,
        }}
        {...props}
      >
        {convertedChildren}
      </MuiSelect>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  )
}

export function Textarea({ label, error, className, rows = 3, value, onChange, name, placeholder, required, disabled, sx, ...props }) {
  return (
    <TextField
      label={label}
      error={!!error}
      helperText={error || undefined}
      fullWidth
      multiline
      rows={rows}
      value={value}
      onChange={onChange}
      name={name}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        },
        ...sx,
      }}
      {...props}
    />
  )
}

// Re-export MenuItem for use with Select
export { MenuItem }

export default Input
