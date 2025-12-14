import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, UserPlus, Star, MessageSquare, Users, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useToast } from "@/hooks/use-toast";
import PushNotificationSettings from "@/components/PushNotificationSettings";

const NotificationSettings = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const handleToggle = (key: string, value: boolean) => {
    updatePreferences.mutate(
      { [key]: value },
      {
        onSuccess: () => {
          toast({
            title: "설정이 저장되었습니다",
          });
        },
        onError: () => {
          toast({
            title: "설정 저장에 실패했습니다",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const notificationOptions = [
    {
      key: "new_follower",
      icon: UserPlus,
      title: "새 팔로워",
      description: "누군가 나를 팔로우했을 때 알림을 받습니다",
    },
    {
      key: "new_review_from_following",
      icon: Star,
      title: "팔로잉 리뷰",
      description: "내가 팔로우하는 사람이 새 리뷰를 작성했을 때 알림을 받습니다",
    },
    {
      key: "review_like",
      icon: Star,
      title: "리뷰 좋아요",
      description: "내 리뷰에 좋아요가 달렸을 때 알림을 받습니다",
    },
    {
      key: "review_comment",
      icon: MessageSquare,
      title: "리뷰 댓글",
      description: "내 리뷰에 댓글이 달렸을 때 알림을 받습니다",
    },
    {
      key: "list_collaboration",
      icon: Users,
      title: "리스트 협업",
      description: "리스트 협업 초대를 받았을 때 알림을 받습니다",
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      <Navigation />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8" />
            알림 설정
          </h1>
          <p className="text-muted-foreground mt-2">
            받고 싶은 알림 유형을 선택하세요
          </p>
        </div>

        {/* Push Notification Settings */}
        <PushNotificationSettings />

        <Card>
          <CardHeader>
            <CardTitle>알림 유형</CardTitle>
            <CardDescription>
              각 알림을 켜거나 끌 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {notificationOptions.map((option) => {
              const Icon = option.icon;
              const isEnabled = preferences?.[option.key as keyof typeof preferences] ?? true;

              return (
                <div
                  key={option.key}
                  className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={option.key} className="text-base font-medium">
                        {option.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={option.key}
                    checked={isEnabled as boolean}
                    onCheckedChange={(checked) => handleToggle(option.key, checked)}
                    disabled={updatePreferences.isPending}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettings;
