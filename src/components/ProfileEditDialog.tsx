import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileEditDialogProps {
  profile: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  children: React.ReactNode;
}

const ProfileEditDialog = ({ profile, children }: ProfileEditDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "이미지 파일만 업로드 가능합니다",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기는 5MB 이하여야 합니다",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl.publicUrl + `?t=${Date.now()}`);
      
      toast({
        title: "이미지가 업로드되었습니다",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "업로드에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim() || null,
          avatar_url: avatarUrl || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      toast({
        title: "프로필이 업데이트되었습니다",
      });
      
      setOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "저장에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로필 편집</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {username?.[0]?.toUpperCase() || <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 text-primary-foreground" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              클릭하여 프로필 사진 변경
            </p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">사용자 이름</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용자 이름을 입력하세요"
              maxLength={50}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
