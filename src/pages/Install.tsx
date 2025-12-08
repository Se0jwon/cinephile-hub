import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Share } from "lucide-react";
import Navigation from "@/components/Navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">CineView 앱 설치</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isInstalled ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-lg font-semibold text-green-600">
                    이미 설치되었습니다!
                  </p>
                  <p className="text-muted-foreground mt-2">
                    홈 화면에서 CineView를 실행할 수 있습니다.
                  </p>
                </div>
              ) : isIOS ? (
                <div className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    iOS에서 앱을 설치하려면 다음 단계를 따라주세요:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <p className="text-sm">
                        Safari 브라우저 하단의{" "}
                        <Share className="h-4 w-4 inline" /> 공유 버튼을 탭하세요
                      </p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <p className="text-sm">
                        "홈 화면에 추가"를 선택하세요
                      </p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <p className="text-sm">
                        "추가"를 탭하여 설치를 완료하세요
                      </p>
                    </div>
                  </div>
                </div>
              ) : deferredPrompt ? (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    CineView를 홈 화면에 설치하고 앱처럼 사용하세요!
                  </p>
                  <Button onClick={handleInstall} size="lg" className="gap-2">
                    <Download className="h-5 w-5" />
                    앱 설치하기
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    브라우저 메뉴에서 "홈 화면에 추가" 또는 "앱 설치"를 선택하여 
                    CineView를 설치할 수 있습니다.
                  </p>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">앱 설치 장점</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    빠른 실행 - 홈 화면에서 바로 접근
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    오프라인 지원 - 인터넷 없이도 사용 가능
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    네이티브 앱 경험 - 전체 화면 지원
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Install;
