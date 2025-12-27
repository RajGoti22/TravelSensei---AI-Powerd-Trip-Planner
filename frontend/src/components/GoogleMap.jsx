import { useEffect, useRef } from 'react'

const key = typeof __GOOGLE_MAPS_KEY__ !== 'undefined' ? __GOOGLE_MAPS_KEY__ : ''

export function GoogleMap() {
	const ref = useRef(null)

	useEffect(() => {
		if (!key) return
		const script = document.createElement('script')
		script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`
		script.async = true
		script.onload = () => {
			// eslint-disable-next-line no-undef
			const map = new google.maps.Map(ref.current, {
				center: { lat: 35.6762, lng: 139.6503 },
				zoom: 11
			})
			// eslint-disable-next-line no-undef
			new google.maps.Marker({ position: { lat: 35.6762, lng: 139.6503 }, map })
		}
		document.body.appendChild(script)
		return () => { document.body.removeChild(script) }
	}, [])

	return <div ref={ref} style={{ width: '100%', height: 360, background: '#eee' }} />
}


