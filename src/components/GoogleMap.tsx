import { useEffect, useRef } from "react";

interface Theater {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
}

interface GoogleMapProps {
  theaters: Theater[];
  apiKey: string;
}

const GoogleMap = ({ theaters, apiKey }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !apiKey) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (!mapRef.current) return;

      const center = theaters.length > 0 
        ? { lat: theaters[0].lat, lng: theaters[0].lng }
        : { lat: 37.5665, lng: 126.9780 };

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
      });

      theaters.forEach((theater) => {
        const marker = new google.maps.Marker({
          position: { lat: theater.lat, lng: theater.lng },
          map,
          title: theater.name,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; color: #000;">
              <h3 style="font-weight: bold; margin-bottom: 8px;">${theater.name}</h3>
              <p style="margin: 4px 0; font-size: 14px;">${theater.address}</p>
              <p style="margin: 4px 0; font-size: 14px;">📞 ${theater.phone}</p>
              <p style="margin: 4px 0; font-size: 14px;">🕐 ${theater.hours}</p>
            </div>
          `
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [theaters, apiKey]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};

export default GoogleMap;
