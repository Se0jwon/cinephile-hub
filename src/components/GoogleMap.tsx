import { useEffect, useRef, useState } from "react";

// --- Google Maps Script Loader (Singleton) ---
let googleMapsPromise: Promise<void> | null = null;
const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      return resolve();
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = (error) => {
      googleMapsPromise = null; // Reset for future attempts
      reject(error);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};
// -----------------------------------------

export interface Theater {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
}

interface GoogleMapProps {
  apiKey: string;
  center: google.maps.LatLngLiteral;
  theaters: Theater[];
  selectedTheater: Theater | null;
  onMapLoad: (map: google.maps.Map) => void;
}

const GoogleMap = ({
  apiKey,
  center,
  theaters,
  selectedTheater,
  onMapLoad,
}: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ [id: string]: google.maps.Marker }>(
    {}
  );
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!apiKey || !mapRef.current) return;

      try {
        await loadGoogleMapsScript(apiKey);

        const { Map } = (await google.maps.importLibrary(
          "maps"
        )) as google.maps.MapsLibrary;
        const { Marker } = (await google.maps.importLibrary(
          "marker"
        )) as google.maps.MarkerLibrary;
        const { InfoWindow } = (await google.maps.importLibrary(
          "places"
        )) as typeof google.maps.InfoWindow;

        const mapInstance = new Map(mapRef.current, {
          center,
          zoom: 15,
          mapId: "CINEPHILE_HUB_MAP",
        });

        setMap(mapInstance);
        onMapLoad(mapInstance);
        infoWindowRef.current = new InfoWindow();
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    };

    initMap();
  }, [apiKey, onMapLoad]);

  useEffect(() => {
    if (map) {
      map.setCenter(center);
    }
  }, [map, center]);

  useEffect(() => {
    const setMapMarkers = async () => {
      if (!map) return;

      // Clear old markers
      Object.values(markers).forEach((marker) => marker.setMap(null));
      const newMarkers: { [id: string]: google.maps.Marker } = {};

      const { Marker } = (await google.maps.importLibrary(
        "marker"
      )) as google.maps.MarkerLibrary;

      theaters.forEach((theater) => {
        const marker = new Marker({
          position: { lat: theater.lat, lng: theater.lng },
          map,
          title: theater.name,
        });
        newMarkers[theater.id] = marker;
      });

      setMarkers(newMarkers);
    };

    setMapMarkers();
  }, [map, theaters]);

  useEffect(() => {
    const infoWindow = infoWindowRef.current;
    if (map && infoWindow && selectedTheater && markers[selectedTheater.id]) {
      const marker = markers[selectedTheater.id];
      infoWindow.setContent(
        `
        <div style="padding: 8px; color: #000;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">${selectedTheater.name}</h3>
          ${
            selectedTheater.address
              ? `<p style="margin: 4px 0; font-size: 14px;">${selectedTheater.address}</p>`
              : ""
          }
        </div>
      `
      );
      infoWindow.open({
        map,
        anchor: marker,
      });
    } else if (infoWindow) {
      infoWindow.close();
    }
  }, [map, selectedTheater, markers]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};

export default GoogleMap;
