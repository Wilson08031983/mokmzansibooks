
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

const Logo = ({
  className = "",
  variant = "full"
}: LogoProps) => {
  return <Link to="/" className={`flex items-center ${className}`}>
      <div className="relative mr-2">
        <img 
          src="/lovable-uploads/826e09ad-45e8-44e4-b4ab-4594e18f803e.png" 
          alt="MOKMzansi Logo" 
          className="h-16 w-16 rounded-lg object-cover" 
        />
      </div>
      {variant === "full" && <div className="font-bold text-xl">
          <span className="gradient-text">MOKMzansi</span>
          <span>Books</span>
        </div>}
    </Link>;
};

export default Logo;
