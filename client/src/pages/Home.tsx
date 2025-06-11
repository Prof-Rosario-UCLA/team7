import { useState, useEffect } from 'react';
import CookieConsent from "react-cookie-consent";
import Navbar from './Navbar';
import Map from './Map';
import CitationList from './CitationList';
import ReportForm from './ReportForm';

export interface Citation {
    id: number;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    violation: 'speeding' | 'parking' | 'signal' | 'other';
    timestamp: string;
    notes: string;
    media_type?: string;
    media_filename?: string;
    car: {
      id: number;
      license_plate_num: string;
      car_color: string;
      car_model: string;
    };
}

function Home() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [citations, setCitations] = useState<Citation[]>([]);
    const [view, setView] = useState<'map' | 'list'>('map');
    const [radiusKm, setRadiusKm] = useState<number | ''>(''); 
    const [showReportModal, setShowReportModal] = useState(false);

    const fetchCitations = async (lat: number, lng: number, radiusMeters?: number) => {
      try {
        const url = radiusMeters
          ? `/api/citations/near/${lat},${lng}?radius=${radiusMeters}`
          : `/api/citations`;
        console.log('🔍 Fetching citations from:', url);
        
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Failed to fetch citations:', res.status, res.statusText);
          const errorText = await res.text();
          console.error('Error details:', errorText);
          setCitations([]);
          return;
        }

        const data = await res.json();
        console.log('📊 Received citations data:', data);
        
        if (Array.isArray(data)) {
          console.log(`✅ Found ${data.length} citations`);
          setCitations(data);
        } else {
          console.error('❌ Citations response is not an array:', data);
          setCitations([]);
        }
      } catch (err) {
        console.error('❌ Failed to fetch citations:', err);
        setCitations([]);
      }
    };

    useEffect(() => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by your browser.');
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
          console.error('Failed to get location. Using default.');
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
      if (location) fetchCitations(location.lat, location.lng);
    }, [location]);

    const handleSearch = () => {
      if (!location) return;
      const radiusMeters = typeof radiusKm === 'number' ? radiusKm * 1000 : undefined;
      fetchCitations(location.lat, location.lng, radiusMeters);
    };

    return (
      <main>
      <Navbar onReportClick={() => setShowReportModal(true)} />
      <header className="flex justify-between items-center px-4 py-2">
        <button
          onClick={() => setView(view === 'map' ? 'list' : 'map')}
          className="bg-secondary text-white px-4 py-2 rounded"
        >
          Switch to {view === 'map' ? 'List' : 'Map'} View
        </button>

        <input
          type="number"
          placeholder="Max distance (km)"
          className="border px-2 py-1 rounded ml-4"
          value={radiusKm}
          onChange={(e) => {
            const val = e.target.value;
            setRadiusKm(val === '' ? '' : Number(val));
          }}
        />

        <button
          onClick={handleSearch}
          className="ml-2 bg-accent text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </header>

      <section aria-label="Citation View" className="relative">
        {location ? (
          view === 'map' ? (
            <Map citations={citations} center={location} />
          ) : (
            <CitationList citations={citations} />
          )
        ) : (
          <p className="p-4">Getting your location...</p>
        )}
      </section>

      {showReportModal && (
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Submit a citation"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        >
          <div className="relative bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-lg transform transition-all duration-300 scale-100">
            <ReportForm
              onClose={() => setShowReportModal(false)}
              onSubmitSuccess={() => {
                setShowReportModal(false);
                if (location) fetchCitations(location.lat, location.lng);
              }}
            />
          </div>
        </section>
      )}

      <footer>
        <CookieConsent
          location="bottom"
          buttonText="I understand"
          buttonClasses="bg-secondary-500 hover:bg-accent-700 text-white font-bold py-2 px-4 rounded-full"
          cookieName="myAppCookieConsent"
          style={{ background: "#98d8aa" }}
          expires={150}
        >
          This website uses cookies to enhance the user experience.{" "}
          <a href="/privacy" style={{ color: "#111827" }}>
            Learn more
          </a>
        </CookieConsent>
      </footer>
    </main>
    )
}

export default Home;