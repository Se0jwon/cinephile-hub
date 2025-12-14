import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, BellRing, Loader2, Smartphone } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const PushNotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            푸시 알림
          </CardTitle>
          <CardDescription>
            이 브라우저는 푸시 알림을 지원하지 않습니다
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return <Badge variant="default">허용됨</Badge>;
      case "denied":
        return <Badge variant="destructive">차단됨</Badge>;
      default:
        return <Badge variant="secondary">미설정</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              푸시 알림
            </CardTitle>
            <CardDescription className="mt-1">
              새로운 알림을 실시간으로 받아보세요
            </CardDescription>
          </div>
          {getPermissionBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              푸시 알림 받기
            </Label>
            <p className="text-sm text-muted-foreground">
              {isSubscribed 
                ? "새로운 알림을 푸시로 받고 있습니다" 
                : "푸시 알림을 활성화하면 앱을 열지 않아도 알림을 받을 수 있습니다"
              }
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={(checked) => {
              if (checked) {
                subscribe();
              } else {
                unsubscribe();
              }
            }}
            disabled={permission === "denied"}
          />
        </div>

        {permission === "denied" && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            <p className="font-medium mb-1">알림이 차단되어 있습니다</p>
            <p>브라우저 설정에서 CineView의 알림을 허용해주세요</p>
          </div>
        )}

        {isSubscribed && (
          <Button 
            variant="outline" 
            onClick={sendTestNotification}
            className="w-full"
          >
            <BellRing className="h-4 w-4 mr-2" />
            테스트 알림 보내기
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;
