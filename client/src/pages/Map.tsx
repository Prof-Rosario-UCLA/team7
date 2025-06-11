import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../utils/leaflet-icons';
import type { Citation } from './Home';

import { useEffect } from 'react';

interface MapProps {
    citations: Citation[];
    center: { lat: number; lng: number };
}

function Map({ citations, center }: MapProps) {
    console.log('Rendering map with center:', center);
    console.log('Citations:', citations);

    // Add useEffect to fix z-index
    useEffect(() => {
      // Fix z-index for map tiles
      const mapPane = document.querySelector('.leaflet-map-pane') as HTMLElement;
      if (mapPane) {
        mapPane.style.zIndex = '0';
      }
      // Fix z-index for map controls
      const mapControls = document.querySelector('.leaflet-control-container') as HTMLElement;
      if (mapControls) {
        mapControls.style.zIndex = '1';
      }
    }, []);

    const formatDate = (timestamp: string) => {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const renderMedia = (citation: Citation) => {
      console.log('🖼️ Rendering media for citation:', citation.id);
      console.log('Media type:', citation.media_type);
      
      if (!citation.media_type) {
        console.log('No media type found for citation:', citation.id);
        return null;
      }

      const mediaUrl = `/api/citations/${citation.id}/media`;
      console.log('Media URL:', mediaUrl);

      if (citation.media_type.startsWith('image/')) {
        return (
          <img 
            src={mediaUrl} 
            alt="Citation evidence" 
            className="w-full h-auto max-h-48 object-cover rounded-lg mb-2"
            onError={(e) => {
              console.error('Failed to load image:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      } else if (citation.media_type.startsWith('video/')) {
        return (
          <video 
            src={mediaUrl} 
            controls 
            className="w-full h-auto max-h-48 rounded-lg mb-2"
            onError={(e) => {
              console.error('Failed to load video:', e);
              e.currentTarget.style.display = 'none';
            }}
          >
            Your browser does not support the video tag.
          </video>
        );
      }
      return null;
    };

    return (
      <div className="h-[500px] w-full relative" style={{ zIndex: 0 }}>
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
                <div className="space-y-2">
                  {renderMedia(citation)}
                  <div><strong>Violation:</strong> {citation.violation}</div>
                  <div><strong>License Plate:</strong> {citation.car.license_plate_num}</div>
                  <div><strong>Time:</strong> {formatDate(citation.timestamp)}</div>
                  {citation.notes && (
                    <div><strong>Notes:</strong> {citation.notes}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  }
  
  export default Map;
