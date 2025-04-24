
import { Link } from "react-router-dom";
import LogoImage from "./logo/LogoImage";
import LogoText from "./logo/LogoText";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

const Logo = ({
  className = "",
  variant = "full"
}: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <LogoImage className="mr-2" />
      {variant === "full" && <LogoText />}
    </Link>
  );
};

export default Logo;
