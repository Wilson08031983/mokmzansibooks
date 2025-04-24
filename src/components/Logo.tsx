
import { Link, useLocation } from "react-router-dom";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

const Logo = ({
  className = "",
  variant = "full"
}: LogoProps) => {
  const location = useLocation();

  // Only render the logo if we're on the home page ('/')
  if (location.pathname !== "/") {
    return null;
  }

  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="relative mr-2">
        
      </div>
      {variant === "full" && (
        <div className="font-bold text-xl">
          <span className="gradient-text">MOKMzansi</span>
          <span>Books</span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
