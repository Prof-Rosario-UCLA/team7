import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultCoords: [number, number] = [34.0522, -118.2437]; // fallback (Los Angeles)

function LocationSelector({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    }
  });
  return null;
}

function MapController({ center }: { center: [number, number] }) {
    const map = useMapEvents({});
    useEffect(() => {
      map.setView(center);
    }, [center]);
    return null;
}

function Report() {
  const [citation, setCitation] = useState({
    license_plate: '',
    timestamp: new Date().toISOString(),
    location: { lat: defaultCoords[0], lng: defaultCoords[1] },
    violation: 'speeding',
    notes: '',
    blob: ''
  });

  const [file, setFile] = useState<File | null>(null);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCoords);
  const [cars, setCars] = useState<{ id: number, license_plate_num: string }[]>([]);

  // Get user location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        setMarkerPosition([latitude, longitude]);
        setCitation((prev) => ({
          ...prev,
          location: { lat: latitude, lng: longitude }
        }));
      },
      () => {
        console.warn('Geolocation failed or denied, using fallback location.');
        setMarkerPosition(defaultCoords);
      }
    );
  }, []);

  useEffect(() => {
    fetch('/api/cars')
      .then(res => res.json())
      .then(data => setCars(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCitation((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setCitation((prev) => ({
      ...prev,
      location: { lat, lng }
    }));
    setMarkerPosition([lat, lng]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const car = cars.find(c => c.license_plate_num === citation.license_plate);
    if (!car) {
      alert('Car not found!');
      return;
    }

    let blobUrl = '';
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        blobUrl = url;
      }
    }

    const payload = {
      ...citation,
      car_id: car.id,
      blob: blobUrl,
      status: 'submitted',
      location: {
        type: 'Point',
        coordinates: [citation.location.lng, citation.location.lat]
      }
    };

    const res = await fetch('/api/citations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('Citation submitted!');
    } else {
      alert('Submission failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white p-8 rounded-xl shadow-lg space-y-6 text-[var(--color-text)]"
      >
        <h2 className="text-2xl font-bold text-center text-[var(--color-primary)]">Submit a Citation</h2>

        <div>
          <label className="block mb-1 font-medium">License Plate</label>
          <input
            type="text"
            name="license_plate"
            value={citation.license_plate}
            onChange={handleChange}
            required
            className="w-full p-2 rounded border border-gray-300"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Violation</label>
          <select
            name="violation"
            value={citation.violation}
            onChange={handleChange}
            required
            className="w-full p-2 rounded border border-gray-300"
          >
            <option value="speeding">Speeding</option>
            <option value="parking">Parking</option>
            <option value="signal">Signal</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Additional Notes</label>
          <textarea
            name="notes"
            value={citation.notes}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-300"
            rows={4}
          />
        </div>

        <div>
            <label className="block mb-2 font-medium">Upload Image/Video (optional)</label>
            <div className="flex items-center justify-between gap-4 border border-dashed border-gray-400 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
            <input
                type="file"
                accept="image/*,video/*"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
            />
            <label
                htmlFor="file-upload"
                className="text-[var(--color-primary)] font-semibold cursor-pointer"
            >
                {file ? 'Change File' : 'Choose File'}
            </label>
            <span className="text-sm text-gray-700 truncate w-full text-right">
                {file ? file.name : 'No file chosen'}
            </span>
            </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Pinpoint Location</label>
          <MapContainer center={mapCenter} zoom={13} className="h-64 w-full rounded-md">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController center={mapCenter} />
            <LocationSelector onSelect={handleLocationSelect} />
            {markerPosition && (
              <Marker
                position={markerPosition}
                icon={L.icon({
                  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                  iconAnchor: [12, 41]
                })}
              />
            )}
          </MapContainer>
          <p className="text-sm mt-2 text-gray-600">
            Click on the map to mark where the citation occurred.
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-[var(--color-primary)] text-white font-semibold rounded hover:bg-[var(--color-accent)] transition"
        >
          Submit Citation
        </button>
      </form>
    </div>
  );
}

export default Report;
