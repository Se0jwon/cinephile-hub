import { Link, useNavigate } from "react-router-dom";
import { Film, LogOut, User, Share2, Users } from "lucide-react";
import { NavLink } from "./NavLink";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import NotificationBell from "./NotificationBell";

const Navigation = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({
        title: "로그아웃되었습니다",
      });
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CineView
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <nav className="flex items-center space-x-2">
              <NavLink
                to="/"
                className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-accent/10 hover:text-accent"
                activeClassName="bg-accent/20 text-accent font-semibold"
              >
                홈
              </NavLink>
              <NavLink
                to="/search"
                className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-accent/10 hover:text-accent"
                activeClassName="bg-accent/20 text-accent font-semibold"
              >
                검색
              </NavLink>
              <NavLink
                to="/my-movies"
                className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-accent/10 hover:text-accent"
                activeClassName="bg-accent/20 text-accent font-semibold"
              >
                내 영화
              </NavLink>
              <NavLink
                to="/theaters"
                className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-accent/10 hover:text-accent"
                activeClassName="bg-accent/20 text-accent font-semibold"
              >
                영화관
              </NavLink>
            </nav>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      내 계정
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    프로필
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/lists")}>
                    <Share2 className="h-4 w-4 mr-2" />
                    내 리스트
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/following")}>
                    <Users className="h-4 w-4 mr-2" />
                    팔로잉 피드
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="secondary" size="sm">
                  로그인
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
