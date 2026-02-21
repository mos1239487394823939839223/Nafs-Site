import * as React from 'react'
import MuiTable from '@mui/material/Table'
import MuiTableHead from '@mui/material/TableHead'
import MuiTableBody from '@mui/material/TableBody'
import MuiTableRow from '@mui/material/TableRow'
import MuiTableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'

const Table = React.forwardRef(({ className, children, sx, ...props }, ref) => (
  <TableContainer
    component={Paper}
    variant="outlined"
    sx={{
      borderRadius: '12px',
      border: 1,
      borderColor: 'divider',
      ...sx,
    }}
  >
    <MuiTable
      ref={ref}
      className={className}
      size="medium"
      {...props}
    >
      {children}
    </MuiTable>
  </TableContainer>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <MuiTableHead ref={ref} className={className} {...props}>
    {children}
  </MuiTableHead>
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(({ className, children, ...props }, ref) => (
  <MuiTableBody ref={ref} className={className} {...props}>
    {children}
  </MuiTableBody>
))
TableBody.displayName = 'TableBody'

const TableRow = React.forwardRef(({ className, hover = true, children, ...props }, ref) => (
  <MuiTableRow ref={ref} className={className} hover={hover} {...props}>
    {children}
  </MuiTableRow>
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef(({ className, children, ...props }, ref) => (
  <MuiTableCell
    ref={ref}
    className={className}
    component="th"
    sx={{
      fontWeight: 600,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'text.secondary',
    }}
    {...props}
  >
    {children}
  </MuiTableCell>
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef(({ className, children, ...props }, ref) => (
  <MuiTableCell
    ref={ref}
    className={className}
    sx={{
      fontSize: '0.875rem',
    }}
    {...props}
  >
    {children}
  </MuiTableCell>
))
TableCell.displayName = 'TableCell'

export default Table
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
