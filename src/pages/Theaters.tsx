import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import GoogleMap, { Theater } from "@/components/GoogleMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2 } from "lucide-react";

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

        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error("Google Maps Places library is not loaded.");
          setLoading(false);
          return;
        }

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
              } else {
                if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                  console.error("Nearby Search failed with status:", status);
                }
                setTheaters([]);
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

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Google Maps Places library is not loaded.");
      setLoading(false);
      return;
    }

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
            if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              console.error("Text Search failed with status:", status);
            }
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

  const handleGoToUserLocation = () => {
    if (map && userLocation) {
      setMapCenter(userLocation); // 지도를 사용자의 위치로 이동
      searchNearbyTheaters(userLocation); // 사용자 위치를 중심으로 주변 검색 재실행
      setSelectedTheater(null); // 선택된 영화관 초기화 (정보 창 닫기)
      setSearchQuery(""); // 검색어 초기화
    }
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

          <div className="mb-6 space-y-4">
            <form onSubmit={handleSearch}>
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

            {/* 현재 내 위치로 이동 버튼 (기존 구현) */}
            <Button
                onClick={handleGoToUserLocation}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled={!userLocation || loading}
            >
              <MapPin className="h-4 w-4 mr-2" />
              현재 내 위치로 이동
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {loading ? (
                  <div className="flex justify-center items-center h-full py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
              ) : theaters.length > 0 ? (
                  theaters.map((theater) => (
                      // 카드 클릭 시 지도 위치로 이동 및 마커 표시
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

                          {/* --- 새로운 길찾기 버튼 --- */}
                          <a
                              // Google Maps 길찾기 URL 생성
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(theater.name + ' 영화관')}`}
                              target="_blank" // 새 탭에서 열기
                              rel="noopener noreferrer"
                              // 이 링크를 클릭해도 부모 카드(map selection) 이벤트가 실행되지 않도록 막습니다.
                              onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="secondary" size="sm" className="mt-2">
                              <MapPin className="h-4 w-4 mr-2" />
                              길찾기
                            </Button>
                          </a>
                          {/* --------------------------- */}

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