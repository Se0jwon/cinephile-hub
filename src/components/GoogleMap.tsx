import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

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
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );

  useEffect(() => {
    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
          mapId: "CINEPHILE_HUB_MAP",
        });
        setMap(mapInstance);
        onMapLoad(mapInstance);
        setInfoWindow(new google.maps.InfoWindow());
      }
    });
  }, [apiKey, onMapLoad]);

  useEffect(() => {
    if (map) {
      map.setCenter(center);
    }
  }, [map, center]);

  useEffect(() => {
    if (map) {
      // Clear old markers
      Object.values(markers).forEach((marker) => marker.setMap(null));
      const newMarkers: { [id: string]: google.maps.Marker } = {};

      theaters.forEach((theater) => {
        const marker = new google.maps.Marker({
          position: { lat: theater.lat, lng: theater.lng },
          map,
          title: theater.name,
        });
        newMarkers[theater.id] = marker;
      });

      setMarkers(newMarkers);
    }
  }, [map, theaters]);

  useEffect(() => {
    if (map && infoWindow && selectedTheater && markers[selectedTheater.id]) {
      const marker = markers[selectedTheater.id];
      infoWindow.setContent(`
        <div style="padding: 8px; color: #000;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">${
            selectedTheater.name
          }</h3>
          ${
            selectedTheater.address
              ? `<p style="margin: 4px 0; font-size: 14px;">${selectedTheater.address}</p>`
              : ""
          }
        </div>
      `);
      infoWindow.open(map, marker);
    } else if (infoWindow) {
      infoWindow.close();
    }
  }, [map, infoWindow, selectedTheater, markers]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};

export default GoogleMap;
