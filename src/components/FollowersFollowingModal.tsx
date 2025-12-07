import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsFollowing, useFollowUser, useUnfollowUser } from "@/hooks/useFollows";
import { Link } from "react-router-dom";

interface FollowersFollowingModalProps {
  userId: string;
  followersCount: number;
  followingCount: number;
  children: React.ReactNode;
  defaultTab?: "followers" | "following";
}

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const UserListItem = ({ profile, currentUserId }: { profile: UserProfile; currentUserId?: string }) => {
  const { data: isFollowing } = useIsFollowing(profile.id);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const isOwnProfile = profile.id === currentUserId;

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFollowing) {
      unfollowUser.mutate(profile.id);
    } else {
      followUser.mutate(profile.id);
    }
  };

  return (
    <Link 
      to={`/profile?user=${profile.id}`}
      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback>
            {profile.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{profile.username || "사용자"}</span>
      </div>
      {!isOwnProfile && currentUserId && (
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          onClick={handleFollowToggle}
          disabled={followUser.isPending || unfollowUser.isPending}
        >
          {isFollowing ? (
            <>
              <UserMinus className="h-3 w-3 mr-1" />
              언팔로우
            </>
          ) : (
            <>
              <UserPlus className="h-3 w-3 mr-1" />
              팔로우
            </>
          )}
        </Button>
      )}
    </Link>
  );
};

const FollowersFollowingModal = ({ 
  userId, 
  followersCount, 
  followingCount, 
  children,
  defaultTab = "followers" 
}: FollowersFollowingModalProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { user } = useAuth();

  const { data: followers, isLoading: followersLoading } = useQuery({
    queryKey: ['followers-profiles', userId],
    queryFn: async () => {
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);
      
      if (followsError) throw followsError;
      if (!followsData || followsData.length === 0) return [];

      const followerIds = followsData.map(f => f.follower_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followerIds);
      
      if (profilesError) throw profilesError;
      return profiles as UserProfile[];
    },
    enabled: open && activeTab === "followers",
  });

  const { data: following, isLoading: followingLoading } = useQuery({
    queryKey: ['following-profiles', userId],
    queryFn: async () => {
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
      
      if (followsError) throw followsError;
      if (!followsData || followsData.length === 0) return [];

      const followingIds = followsData.map(f => f.following_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followingIds);
      
      if (profilesError) throw profilesError;
      return profiles as UserProfile[];
    },
    enabled: open && activeTab === "following",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>팔로워 / 팔로잉</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "followers" | "following")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">팔로워 ({followersCount})</TabsTrigger>
            <TabsTrigger value="following">팔로잉 ({followingCount})</TabsTrigger>
          </TabsList>
          <TabsContent value="followers" className="mt-4">
            <ScrollArea className="h-[300px]">
              {followersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : followers && followers.length > 0 ? (
                <div className="space-y-1">
                  {followers.map((profile) => (
                    <UserListItem 
                      key={profile.id} 
                      profile={profile} 
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  팔로워가 없습니다
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="following" className="mt-4">
            <ScrollArea className="h-[300px]">
              {followingLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : following && following.length > 0 ? (
                <div className="space-y-1">
                  {following.map((profile) => (
                    <UserListItem 
                      key={profile.id} 
                      profile={profile} 
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  팔로잉하는 사용자가 없습니다
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersFollowingModal;
