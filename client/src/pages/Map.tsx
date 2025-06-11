import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../utils/leaflet-icons';
import type { Citation } from './Home';

interface MapProps {
    citations: Citation[];
    center: { lat: number; lng: number };
}

function Map({ citations, center }: MapProps) {
    console.log('Rendering map with center:', center);
    console.log('Citations:', citations);

    const formatDate = (timestamp: string) => {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const renderMedia = (citation: Citation) => {
      if (!citation.media_type) return null;

      const mediaUrl = `/api/citations/${citation.id}/media`;

      if (citation.media_type.startsWith('image/')) {
        return (
          <img 
            src={mediaUrl} 
            alt="Citation evidence" 
            className="w-full h-auto max-h-48 object-cover rounded-lg mb-2"
          />
        );
      } else if (citation.media_type.startsWith('video/')) {
        return (
          <video 
            src={mediaUrl} 
            controls 
            className="w-full h-auto max-h-48 rounded-lg mb-2"
          >
            Your browser does not support the video tag.
          </video>
        );
      }
      return null;
    };

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
