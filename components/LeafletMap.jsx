import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix Leaflet's default icon paths (they break with bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const LeafletMap = ({ center, markers = [], onMapClick, height = '400px' }) => {
  const { useEffect, useRef } = React;
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView(
      [center?.lat || 0, center?.lng || 0],
      center?.zoom || 13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    markersLayer.current = L.layerGroup().addTo(mapInstance.current);

    if (onMapClick) {
      mapInstance.current.on('click', (e) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center, onMapClick]);

  // Update markers when they change
  useEffect(() => {
    if (!markersLayer.current || !mapInstance.current) return;

    markersLayer.current.clearLayers();
    markers.forEach((marker) => {
      const m = L.marker([marker.lat, marker.lng]).addTo(markersLayer.current);
      if (marker.popup) m.bindPopup(marker.popup);
    });
  }, [markers]);

  // Update view when center changes
  useEffect(() => {
    if (!mapInstance.current || !center) return;
    mapInstance.current.setView([center.lat, center.lng], center.zoom || mapInstance.current.getZoom());
  }, [center]);

  return <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-xl overflow-hidden border border-slate-700" />;
};