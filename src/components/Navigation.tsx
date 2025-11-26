import { NavLink } from "./NavLink";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/">
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CineView
            </span>
          </Link>
          
          <div className="flex items-center space-x-2">
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
