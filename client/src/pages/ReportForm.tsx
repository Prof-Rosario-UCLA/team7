// ReportForm.tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { fetchWithLocalCache } from '../utils/cache';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultCoords: [number, number] = [34.0522, -118.2437]; // fallback (Los Angeles)

export interface Car {
  id: number;
  license_plate_num: string;
  car_color?: string;
  car_model?: string;
}

function LocationSelector({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    }
  });
  return null;
}

export default function ReportForm({ onClose, onSubmitSuccess }: { onClose: () => void, onSubmitSuccess: () => void }) {
    const [citation, setCitation] = useState({
      license_plate: '',
      car_color: '',
      car_model: '',
      timestamp: new Date().toISOString(),
      location: { lat: defaultCoords[0], lng: defaultCoords[1] },
      violation: 'speeding',
      notes: '',
      blob: ''
    });
  
    const [file, setFile] = useState<File | null>(null);
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCoords);
    const [cars, setCars] = useState<Car[]>([]);
  
    useEffect(() => {
        const loadCars = async () => {
          try {
            const data = await fetchWithLocalCache<Car[]>('cars-list', '/api/cars', 10 * 60 * 1000); // 10 min cache
            setCars(Array.isArray(data) ? data : []);
          } catch (err) {
            console.error('Failed to fetch cars:', err);
            setCars([]);
          }
        };
      
        loadCars();
    }, []);
  
    const getUserLocation = () => {
      console.log("📍 Button clicked!");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('✅ Got location:', latitude, longitude);
          console.log('Setting center to:', [latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMarkerPosition([latitude, longitude]);
          setCitation((prev) => ({
            ...prev,
            location: { lat: latitude, lng: longitude }
          }));
        },
        (err) => {
          console.warn('❌ Geolocation error:', err);
          alert('Could not access your location. Using fallback location.');
          setMapCenter(defaultCoords);
          setMarkerPosition(defaultCoords);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
    
      // If the license_plate is being changed, try to auto-fill car data
      if (name === 'license_plate') {
        const matchingCar = cars.find(c => c.license_plate_num === value);
        if (matchingCar) {
          setCitation((prev) => ({
            ...prev,
            license_plate: value,
            car_color: matchingCar.car_color || '',
            car_model: matchingCar.car_model || ''
          }));
        } else {
          setCitation((prev) => ({
            ...prev,
            license_plate: value,
            car_color: '',
            car_model: ''
          }));
        }
      } else {
        setCitation((prev) => ({
          ...prev,
          [name]: value
        }));
      }
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
      console.log('📝 Starting citation submission');
  
      let carId: number | undefined;
      const existingCar = cars.find(c => c.license_plate_num === citation.license_plate);
  
      if (existingCar) {
        carId = existingCar.id;
        // Only update if new info was typed by the user
        const colorChanged = citation.car_color && citation.car_color !== existingCar.car_color;
        const modelChanged = citation.car_model && citation.car_model !== existingCar.car_model;
      
        if (colorChanged || modelChanged) {
          const carUpdateRes = await fetch(`/api/cars/${carId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              car_color: colorChanged ? citation.car_color : undefined,
              car_model: modelChanged ? citation.car_model : undefined
            })
          });
  
          if (!carUpdateRes.ok) {
            console.error('Failed to update car:', await carUpdateRes.text());
          }
        }
      } else {
        // Create new car in DB
        const newCarRes = await fetch('/api/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            license_plate_num: citation.license_plate,
            car_color: citation.car_color || undefined,
            car_model: citation.car_model || undefined
          })
        });
  
        if (!newCarRes.ok) {
          const errorText = await newCarRes.text();
          console.error('Failed to create car:', errorText);
          alert('Failed to create car: ' + errorText);
          return;
        }
  
        const newCar = await newCarRes.json();
        carId = newCar.id;
      }
  
      if (!carId) {
        alert('Failed to get car ID');
        return;
      }
  
      // Create FormData for multipart request
      const formData = new FormData();
      
      // Add the media file if present
      if (file) {
        console.log('📎 Adding file to FormData:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
        formData.append('media', file);
        
        // Log FormData contents for debugging
        console.log('🔍 FormData contents:');
        for (const pair of formData.entries()) {
          console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
        }
      }
      
      // Add all other citation data
      const locationData = {
        type: 'Point',
        coordinates: [citation.location.lng, citation.location.lat]
      };
      
      console.log('📍 Location data:', locationData);
      
      formData.append('car_id', carId.toString());
      formData.append('timestamp', citation.timestamp);
      formData.append('location', JSON.stringify(locationData));
      formData.append('status', 'submitted');
      formData.append('violation', citation.violation);
      formData.append('notes', citation.notes);
  
      try {
        console.log('🚀 Sending citation data to server');
        const res = await fetch('/api/citations', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
  
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Failed to submit citation:', errorText);
          alert('Failed to submit citation: ' + errorText);
          return;
        }
  
        const newCitation = await res.json();
        console.log('✅ Citation created:', newCitation);
  
        alert('Citation submitted!');
        onSubmitSuccess();
      } catch (error) {
        console.error('❌ Error submitting citation:', error);
        alert('Failed to submit citation. Please try again.');
      }
    };
  
    return (
      <main className="h-screen overflow-hidden flex items-center justify-center bg-[var(--color-background)] p-6">
        <form
          onSubmit={handleSubmit}
          className="h-full max-h-[90vh] overflow-y-auto w-full max-w-xl bg-white p-8 rounded-xl shadow-lg space-y-6 text-[var(--color-text)]"
        >
          <header className="flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--color-primary)] hover:text-[var(--color-accent)]"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-[var(--color-primary)]">Submit a Citation</h2>
            <div className="w-[52px]"></div>
          </header>
  
          <fieldset>
            <label className="block mb-1 font-medium">License Plate</label>
            <input
              type="text"
              name="license_plate"
              value={citation.license_plate}
              onChange={handleChange}
              required
              className="w-full p-2 rounded border border-gray-300"
            />
          </fieldset>
  
          <fieldset>
          <label className="block mb-1 font-medium">Car Color (optional)</label>
          <input
            type="text"
            name="car_color"
            value={citation.car_color}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-300"
          />
          </fieldset>
  
          <fieldset>
          <label className="block mb-1 font-medium">Car Model/Brand (optional)</label>
          <input
            type="text"
            name="car_model"
            value={citation.car_model}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-300"
          />
          </fieldset>
  
          <fieldset>
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
          </fieldset>
  
          <fieldset>
            <label className="block mb-1 font-medium">Additional Notes</label>
            <textarea
              name="notes"
              value={citation.notes}
              onChange={handleChange}
              className="w-full p-2 rounded border border-gray-300"
              rows={4}
            />
          </fieldset>
  
          <fieldset>
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
          </fieldset>
  
          <button
          type="button"
          onClick={getUserLocation}
          className="mb-4 py-1 px-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition text-sm"
          >
          📍 Use My Location
          </button>
  
          <section>
            <label className="block mb-2 font-medium">Pinpoint Location</label>
            <MapContainer key={mapCenter.join(',')} center={mapCenter} zoom={13} className="h-64 w-full rounded-md">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
          </section>
  
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[var(--color-primary)] text-white font-semibold rounded hover:bg-[var(--color-accent)] transition"
          >
            Submit Citation
          </button>
        </form>
      </main>
    );   
}
