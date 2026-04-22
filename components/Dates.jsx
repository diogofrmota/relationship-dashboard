const { useState } = window.React;
import { LeafletMap } from './LeafletMap.jsx';
import { NominatimSearch } from './NominatimSearch.jsx';

export const DatesSection = ({ locations = [], onAddLocation }) => {
  const [dateLocations, setDateLocations] = useState(locations);
  
  const handleSelectLocation = (place) => {
    const newLocation = {
      id: Date.now(),
      name: place.displayName.split(',')[0], // First part as name
      lat: place.lat,
      lng: place.lng,
      fullAddress: place.displayName
    };
    setDateLocations([...dateLocations, newLocation]);
    onAddLocation?.(newLocation);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Our Date Spots</h2>
      
      <NominatimSearch onSelect={handleSelectLocation} />
      
      <LeafletMap
        center={{ lat: 38.7223, lng: -9.1393, zoom: 13 }}
        markers={dateLocations.map(loc => ({
          lat: loc.lat,
          lng: loc.lng,
          popup: loc.name
        }))}
        height="500px"
      />
      
      {/* List of saved locations */}
      <div className="space-y-2">
        {dateLocations.map(loc => (
          <div key={loc.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
            <span className="text-white">{loc.name}</span>
            <a 
              href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=15/${loc.lat}/${loc.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Open in OSM ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};