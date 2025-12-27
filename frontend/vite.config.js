import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: 5173
	},
	define: {
		__API_BASE__: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:8000/api'),
		__GOOGLE_MAPS_KEY__: JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY || '')
	}
})


