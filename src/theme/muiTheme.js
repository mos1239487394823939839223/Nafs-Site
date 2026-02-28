import { createTheme } from '@mui/material/styles'

// Helper to read CSS variable values at runtime
const getCSSVar = (varName) => {
    if (typeof window === 'undefined') return ''
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

export function createAppTheme(mode = 'light', direction = 'ltr') {
    const isLight = mode === 'light'

    // Light mode colors
    const lightPalette = {
        primary: {
            main: '#6B9E8A',
            light: '#8FBDAA',
            dark: '#4A7E6D',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#8FBDAA',
            light: '#D4EAE0',
            dark: '#6B9E8A',
        },
        background: {
            default: '#F5FAF7',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#2D3D35',
            secondary: '#4A7E6D',
            disabled: '#8FBDAA',
        },
        error: {
            main: '#ef4444',
            light: '#fca5a5',
            dark: '#dc2626',
        },
        warning: {
            main: '#f59e0b',
            light: '#fcd34d',
            dark: '#d97706',
        },
        success: {
            main: '#10b981',
            light: '#6ee7b7',
            dark: '#059669',
        },
        info: {
            main: '#3b82f6',
            light: '#93c5fd',
            dark: '#2563eb',
        },
        divider: '#C8DFD3',
    }

    // Dark mode colors
    const darkPalette = {
        primary: {
            main: '#6B9E8A',
            light: '#8FBDAA',
            dark: '#4A7E6D',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#4A7E6D',
            light: '#2D3D35',
            dark: '#8FBDAA',
        },
        background: {
            default: '#050a08',
            paper: '#0d1612',
        },
        text: {
            primary: '#e0efe7',
            secondary: '#8fbdaa',
            disabled: '#4A7E6D',
        },
        error: {
            main: '#f87171',
            light: '#fca5a5',
            dark: '#ef4444',
        },
        warning: {
            main: '#fbbf24',
            light: '#fcd34d',
            dark: '#f59e0b',
        },
        success: {
            main: '#34d399',
            light: '#6ee7b7',
            dark: '#10b981',
        },
        info: {
            main: '#60a5fa',
            light: '#93c5fd',
            dark: '#3b82f6',
        },
        divider: '#1e332a',
    }

    const palette = isLight ? lightPalette : darkPalette

    return createTheme({
        direction,
        palette: {
            mode,
            ...palette,
        },
        typography: {
            fontFamily: "'Inter', 'Almarai', system-ui, Avenir, Helvetica, Arial, sans-serif",
            h1: {
                fontWeight: 700,
                fontSize: '2.25rem',
                lineHeight: 1.2,
            },
            h2: {
                fontWeight: 700,
                fontSize: '1.875rem',
                lineHeight: 1.3,
            },
            h3: {
                fontWeight: 600,
                fontSize: '1.5rem',
                lineHeight: 1.4,
            },
            h4: {
                fontWeight: 600,
                fontSize: '1.25rem',
                lineHeight: 1.4,
            },
            h5: {
                fontWeight: 600,
                fontSize: '1.125rem',
                lineHeight: 1.5,
            },
            h6: {
                fontWeight: 600,
                fontSize: '1rem',
                lineHeight: 1.5,
            },
            button: {
                textTransform: 'none',
                fontWeight: 500,
            },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                },
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        padding: '8px 20px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        '&:active': {
                            transform: 'scale(0.98)',
                        },
                    },
                    sizeLarge: {
                        height: 48,
                        padding: '8px 32px',
                        fontSize: '1rem',
                    },
                    sizeMedium: {
                        height: 40,
                        padding: '8px 20px',
                    },
                    sizeSmall: {
                        height: 32,
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        borderRadius: 8,
                    },
                    containedPrimary: {
                        boxShadow: `0 4px 14px 0 ${palette.primary.main}33`,
                        '&:hover': {
                            boxShadow: `0 6px 20px 0 ${palette.primary.main}4D`,
                            backgroundColor: palette.primary.dark,
                        },
                    },
                    containedError: {
                        boxShadow: '0 4px 14px 0 rgba(239,68,68,0.2)',
                        '&:hover': {
                            boxShadow: '0 6px 20px 0 rgba(239,68,68,0.3)',
                        },
                    },
                    outlined: {
                        borderColor: isLight ? '#C8DFD3' : '#1e332a',
                        '&:hover': {
                            borderColor: palette.primary.main + '66',
                            backgroundColor: isLight ? '#EDF5F0' : '#15221d',
                        },
                    },
                    text: {
                        '&:hover': {
                            backgroundColor: isLight ? '#EDF5F0' : '#15221d',
                        },
                    },
                },
            },
            MuiTextField: {
                defaultProps: {
                    variant: 'outlined',
                    size: 'medium',
                },
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 12,
                            backgroundColor: isLight ? 'rgba(237,245,240,0.5)' : 'rgba(21,34,29,0.5)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: isLight ? '#EDF5F0' : '#15221d',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: isLight ? '#8FBDAA' : '#2d4a3e',
                                },
                            },
                            '&.Mui-focused': {
                                backgroundColor: isLight ? '#FFFFFF' : '#0d1612',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: palette.primary.main,
                                    borderWidth: 2,
                                },
                            },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isLight ? '#E0EFE7' : '#1e332a',
                        },
                        '& .MuiInputLabel-root': {
                            color: palette.text.secondary,
                        },
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        border: `1px solid ${isLight ? 'rgba(200,223,211,0.6)' : 'rgba(30,51,42,0.6)'}`,
                        backgroundImage: 'none',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        transition: 'all 0.3s ease',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 16,
                        border: `1px solid ${isLight ? 'rgba(200,223,211,0.6)' : 'rgba(30,51,42,0.6)'}`,
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                    },
                    root: {
                        '& .MuiBackdrop-root': {
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 999,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                    },
                },
            },
            MuiAvatar: {
                styleOverrides: {
                    root: {
                        fontSize: '0.875rem',
                        fontWeight: 600,
                    },
                    colorDefault: {
                        background: `linear-gradient(135deg, ${palette.primary.main}, ${palette.primary.dark})`,
                        color: '#ffffff',
                    },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        borderRadius: 8,
                        fontSize: '0.75rem',
                        backgroundColor: isLight ? '#1A2B23' : '#e0efe7',
                        color: isLight ? '#ffffff' : '#1A2B23',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    head: {
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: palette.text.secondary,
                        backgroundColor: isLight ? 'rgba(237,245,240,0.7)' : 'rgba(21,34,29,0.7)',
                        textAlign: 'start',
                    },
                    root: {
                        borderColor: isLight ? 'rgba(200,223,211,0.4)' : 'rgba(30,51,42,0.4)',
                        padding: '12px 16px',
                        textAlign: 'start',
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                            backgroundColor: `${palette.primary.main}08`,
                        },
                    },
                },
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        borderRadius: 8,
                        minHeight: 40,
                        transition: 'all 0.2s ease',
                    },
                },
            },
            MuiTabs: {
                styleOverrides: {
                    root: {
                        minHeight: 48,
                    },
                    indicator: {
                        borderRadius: 4,
                        height: 3,
                    },
                },
            },
            MuiPagination: {
                styleOverrides: {
                    root: {
                        '& .MuiPaginationItem-root': {
                            borderRadius: 8,
                            fontWeight: 500,
                            '&.Mui-selected': {
                                boxShadow: `0 4px 14px 0 ${palette.primary.main}40`,
                            },
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiCircularProgress: {
                styleOverrides: {
                    root: {
                        color: palette.primary.main,
                    },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    },
                },
            },
        },
    })
}

export const lightTheme = createAppTheme('light')
export const darkTheme = createAppTheme('dark')
