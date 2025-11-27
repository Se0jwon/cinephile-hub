import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import GoogleMap, { Theater } from "@/components/GoogleMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Search, Loader2 } from "lucide-react";

const Theaters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 37.5665,
    lng: 126.978,
  });
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setMapCenter(location);
          setUserLocation(location);
        },
        () => {
          console.log("Could not get user location, using default.");
          setUserLocation(mapCenter); // Use default location
        }
      );
    } else {
      setUserLocation(mapCenter); // Geolocation not supported
    }
  }, []);

  const searchNearbyTheaters = useCallback(
    (location: google.maps.LatLngLiteral) => {
      if (!map) return;
      setLoading(true);
      const service = new google.maps.places.PlacesService(map);
      service.nearbySearch(
        {
          location: location,
          radius: 5000, // 5km
          type: "movie_theater",
        },
        (results, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            const formattedResults: Theater[] = results.map((p) => ({
              id: p.place_id!,
              name: p.name!,
              address: p.vicinity!,
              lat: p.geometry!.location!.lat(),
              lng: p.geometry!.location!.lng(),
            }));
            setTheaters(formattedResults);
          }
          setLoading(false);
        }
      );
    },
    [map]
  );

  useEffect(() => {
    if (map && userLocation) {
      searchNearbyTheaters(userLocation);
    }
  }, [map, userLocation, searchNearbyTheaters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!map) return;
    if (!searchQuery) {
      if (userLocation) searchNearbyTheaters(userLocation);
      return;
    }

    setLoading(true);
    const service = new google.maps.places.PlacesService(map);
    service.textSearch(
      {
        query: `영화관 ${searchQuery}`,
        location: map.getCenter()!,
        radius: 10000, // 10km
      },
      (results, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          const formattedResults: Theater[] = results.map((p) => ({
            id: p.place_id!,
            name: p.name!,
            address: p.formatted_address!,
            lat: p.geometry!.location!.lat(),
            lng: p.geometry!.location!.lng(),
          }));
          setTheaters(formattedResults);
          if (formattedResults.length > 0) {
            setMapCenter({
              lat: formattedResults[0].lat,
              lng: formattedResults[0].lng,
            });
            setSelectedTheater(formattedResults[0]);
          }
        } else {
          setTheaters([]);
        }
        setLoading(false);
      }
    );
  };

  const handleTheaterClick = (theater: Theater) => {
    setMapCenter({ lat: theater.lat, lng: theater.lng });
    setSelectedTheater(theater);
  };

  return (
    <div className="min-h-screen pt-16">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">영화관 찾기</h1>
          <p className="text-muted-foreground">
            가까운 영화관을 찾아보세요
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="영화관 이름 또는 주소로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-24"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
              disabled={loading}
            >
              검색
            </Button>
          </div>
        </form>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : theaters.length > 0 ? (
              theaters.map((theater) => (
                <Card
                  key={theater.id}
                  className={`hover:border-primary/50 transition-colors cursor-pointer ${
                    selectedTheater?.id === theater.id ? "border-primary" : ""
                  }`}
                  onClick={() => handleTheaterClick(theater)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span>{theater.name}</span>
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {theater.address}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  검색 결과가 없습니다.
                </p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-20 h-[600px] rounded-lg overflow-hidden border border-border">
            <GoogleMap
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
              center={mapCenter}
              theaters={theaters}
              selectedTheater={selectedTheater}
              onMapLoad={handleMapLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Theaters;
