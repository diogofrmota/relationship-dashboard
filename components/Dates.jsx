import { LeafletMap } from './LeafletMap.jsx';

function DatesSection() {
  const [dateLocations, setDateLocations] = useState([]);

  // Example handler for adding a new location by clicking the map
  const handleMapClick = (coords) => {
    // Show a modal or prompt to name the location, then add to list
    console.log('Add location at:', coords);
  };

  return (
    <div>
      <h2>Our Date Spots</h2>
      <LeafletMap
        center={{ lat: 38.7223, lng: -9.1393, zoom: 13 }} // Default to Lisbon (adjust as needed)
        markers={dateLocations.map(loc => ({
          lat: loc.lat,
          lng: loc.lon,
          popup: loc.name
        }))}
        onMapClick={handleMapClick}
        height="500px"
      />
      {/* List of saved locations with "Open in OpenStreetMap" buttons */}
    </div>
  );
}