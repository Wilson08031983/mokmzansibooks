
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

const Logo = ({ className = "", variant = "full" }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="relative mr-2">
        <img 
          src="/lovable-uploads/12424778-14a4-473b-8a3f-243978f8d419.png" 
          alt="MOKMzansi Logo" 
          className="h-10 w-10"
        />
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
