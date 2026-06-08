import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Componente auxiliar para mover la cámara del mapa dinámicamente
function CambiarVista({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 11, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapaClima({ lat, lon }) {
  // Coordenadas por defecto (Argentina) si no hay datos cargados aún
  const posicion = lat && lon ? [lat, lon] : [-34.6037, -58.3816];

  return (
    <MapContainer 
      center={posicion} 
      zoom={11} 
      zoomControl={false} // Oculta los botones de + y - para mantener la estética limpia
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Este componente mueve el mapa cuando cambian lat o lon */}
      <CambiarVista center={posicion} />
    </MapContainer>
  );
}