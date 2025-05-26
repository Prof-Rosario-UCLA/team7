import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Map from './Map';
  

export interface Citation {
    id: number;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    violation: 'speeding' | 'parking' | 'signal' | 'other';
  }

function Home() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [citations, setCitations] = useState<Citation[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        return;
      }
      console.log('Trying to get position')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation success:', position);
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Failed to get location. Using default.');
          setLocation({ lat: 34.068, lng: -118.453 }); // fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }, []);

    useEffect(() => {
        const fetchCitations = async () => {
          if (!location) return;
    
          setLoading(true);
          try {
            const res = await fetch(
              `http://localhost:3001/citations/${location.lat},${location.lng}?radius=1000`
            );
            const data = await res.json();
            setCitations(data);
          } catch (err) {
            console.error(err);
            setError('Failed to fetch nearby citations.');
          } finally {
            setLoading(false);
          }
        };
    
        fetchCitations();
    }, [location]);

    return (
        <div>
            <Navbar></Navbar>
            {location ? (
  <             Map citations={citations} center={location} />
            ) : (
                <p className="p-4 text-text">Getting your location...</p>
            )}
        </div>
    )
}

export default Home;