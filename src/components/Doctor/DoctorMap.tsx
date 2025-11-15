import React, { useEffect, useRef } from 'react';
import { Doctor } from '../../types';
import { MapPin, Navigation, Globe } from 'lucide-react';

interface DoctorMapProps {
  doctor: Doctor;
}

export const DoctorMap: React.FC<DoctorMapProps> = ({ doctor }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!doctor.current_location || !mapRef.current) return;
    const { lat, lng } = doctor.current_location;
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.google.com/maps?q=${lat},${lng}&hl=en&output=embed&zoom=15`;
    iframe.width = '100%';
    iframe.height = '400px';
    iframe.style.border = '0';
    iframe.setAttribute('allowfullscreen', '');
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.title = `Location of ${doctor.full_name}`;
    mapContainer.appendChild(iframe);
  }, [doctor]);

  if (!doctor.current_location) return null;
  const { lat, lng } = doctor.current_location;

  return (
    <div>
      <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-red-600" />
        Doctor Location
      </h4>
      <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md mb-3">
        <div ref={mapRef} className="w-full h-96 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p>Loading map...</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Address:</p>
            <p className="text-gray-800">{doctor.location_address}</p>
            <p className="text-xs text-gray-500 mt-1">Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Get Directions
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          <Globe className="w-4 h-4" />
          Open in Maps
        </a>
      </div>
    </div>
  );
};
