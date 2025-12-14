import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported || !user) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking push subscription:", error);
      }
    };

    checkSubscription();
  }, [isSupported, user]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "푸시 알림 미지원",
        description: "이 브라우저는 푸시 알림을 지원하지 않습니다",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast({
          title: "알림 허용됨",
          description: "푸시 알림을 받을 수 있습니다",
        });
        return true;
      } else {
        toast({
          title: "알림 거부됨",
          description: "브라우저 설정에서 알림을 허용해주세요",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported, toast]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !user) return false;

    try {
      if (permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // Store subscription in database
      const { error } = await supabase.from('push_subscriptions' as any).upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
      });

      if (error) {
        console.error("Error saving subscription:", error);
        toast({
          title: "구독 실패",
          description: "푸시 알림 구독에 실패했습니다",
          variant: "destructive",
        });
        return false;
      }

      setIsSubscribed(true);
      toast({
        title: "푸시 알림 구독 완료",
        description: "새로운 알림을 푸시로 받을 수 있습니다",
      });
      return true;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast({
        title: "구독 실패",
        description: "푸시 알림 구독에 실패했습니다",
        variant: "destructive",
      });
      return false;
    }
  }, [isSupported, user, permission, requestPermission, toast]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported || !user) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        await supabase
          .from('push_subscriptions' as any)
          .delete()
          .eq('user_id', user.id);
      }

      setIsSubscribed(false);
      toast({
        title: "푸시 알림 해제",
        description: "더 이상 푸시 알림을 받지 않습니다",
      });
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      return false;
    }
  }, [isSupported, user, toast]);

  const sendTestNotification = useCallback(async () => {
    if (!isSupported || permission !== "granted") return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("CineView 테스트 알림", {
        body: "푸시 알림이 정상적으로 작동합니다!",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "test-notification",
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  }, [isSupported, permission]);

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
};

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
