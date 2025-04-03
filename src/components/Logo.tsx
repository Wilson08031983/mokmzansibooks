
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

const Logo = ({ className = "", variant = "full" }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="relative mr-2">
        <span className="flex h-10 w-10 rounded-full bg-gradient-to-br from-brand-pink via-brand-purple to-brand-blue items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </span>
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
