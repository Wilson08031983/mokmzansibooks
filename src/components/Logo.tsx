import { Link, useLocation } from "react-router-dom";
interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
  showOnlyOnLanding?: boolean;
}
const Logo = ({
  className = "",
  variant = "full",
  showOnlyOnLanding = false
}: LogoProps) => {
  const location = useLocation();

  // Hide logo when not on landing page and showOnlyOnLanding is true
  if (showOnlyOnLanding && location.pathname !== "/") {
    return null;
  }
  return <Link to="/" className={`flex items-center ${className}`}>
      <div className="relative mr-2">
        
      </div>
      {variant === "full" && <div className="font-bold text-xl">
          <span className="gradient-text">MOKMzansi</span>
          <span>Books</span>
        </div>}
    </Link>;
};
export default Logo;