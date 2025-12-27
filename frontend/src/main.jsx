import React from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'

const theme = createTheme({
	palette: { mode: 'light', primary: { main: '#1976d2' } }
})
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<App />
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>
)


