import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import type { Citation } from './Home'; 

interface MapProps {
    citations: Citation[];
    center: { lat: number; lng: number };
}

function Map({ citations, center }: MapProps) {
    console.log('Rendering map with center:', center);
    console.log('Citations:', citations);
    return (
      <div className="h-[500px] w-full">
        <MapContainer center={center} zoom={14} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
  
          {citations.map((citation) => (
            <Marker
              key={citation.id}
              position={{
                lat: citation.location.coordinates[1], // lat
                lng: citation.location.coordinates[0], // lng
              }}
            >
              <Popup>
                Violation: {citation.violation}
                <br />
                ID: {citation.id}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  }
  
  export default Map;
