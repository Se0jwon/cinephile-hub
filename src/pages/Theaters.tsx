import Navigation from "@/components/Navigation";
import GoogleMap from "@/components/GoogleMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock } from "lucide-react";

const Theaters = () => {
  // Mock theater data
  const theaters = [
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
  ];

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

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {theaters.map((theater) => (
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
            ))}
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
