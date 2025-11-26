import { Film, User, Map, Home } from "lucide-react";
import { NavLink } from "./NavLink";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CineView
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <NavLink
              to="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              <Home className="h-5 w-5" />
              <span className="hidden md:inline">홈</span>
            </NavLink>
            
            <NavLink
              to="/my-movies"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              <User className="h-5 w-5" />
              <span className="hidden md:inline">마이페이지</span>
            </NavLink>
            
            <NavLink
              to="/theaters"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              <Map className="h-5 w-5" />
              <span className="hidden md:inline">영화관 지도</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
