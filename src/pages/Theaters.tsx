import { useState } from "react";
import Navigation from "@/components/Navigation";
import GoogleMap from "@/components/GoogleMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Clock, Search } from "lucide-react";

const Theaters = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const allTheaters = [
    {
      id: 1,
      name: "CGV 강남",
      address: "서울특별시 강남구 강남대로 438",
      phone: "1544-1122",
      hours: "09:00 - 24:00",
      lat: 37.5012,
      lng: 127.0261,
    },
    {
      id: 2,
      name: "메가박스 코엑스",
      address: "서울특별시 강남구 영동대로 513",
      phone: "1544-0070",
      hours: "09:00 - 02:00",
      lat: 37.5115,
      lng: 127.0595,
    },
    {
      id: 3,
      name: "롯데시네마 월드타워",
      address: "서울특별시 송파구 올림픽로 300",
      phone: "1544-8855",
      hours: "10:00 - 24:00",
      lat: 37.5131,
      lng: 127.1028,
    },
    {
      id: 4,
      name: "CGV 용산아이파크몰",
      address: "서울특별시 용산구 한강대로23길 55",
      phone: "1544-1122",
      hours: "09:00 - 24:00",
      lat: 37.5295,
      lng: 126.9654,
    },
    {
      id: 5,
      name: "메가박스 홍대",
      address: "서울특별시 마포구 양화로 153",
      phone: "1544-0070",
      hours: "09:00 - 02:00",
      lat: 37.5563,
      lng: 126.9222,
    },
    {
      id: 6,
      name: "롯데시네마 건대입구",
      address: "서울특별시 광진구 능동로 92",
      phone: "1544-8855",
      hours: "10:00 - 24:00",
      lat: 37.5404,
      lng: 127.0698,
    },
    {
      id: 7,
      name: "CGV 명동역 씨네라이브러리",
      address: "서울특별시 중구 명동8길 36",
      phone: "1544-1122",
      hours: "10:00 - 23:00",
      lat: 37.5606,
      lng: 126.9860,
    },
    {
      id: 8,
      name: "메가박스 동대문",
      address: "서울특별시 성동구 왕십리로 50",
      phone: "1544-0070",
      hours: "09:00 - 02:00",
      lat: 37.5659,
      lng: 127.0093,
    },
  ];

  const theaters = allTheaters.filter(
    (theater) =>
      theater.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theater.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="영화관 이름 또는 주소로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {theaters.length > 0 ? (
              theaters.map((theater) => (
              <Card key={theater.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{theater.name}</span>
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{theater.address}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{theater.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{theater.hours}</span>
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
              theaters={theaters} 
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Theaters;
