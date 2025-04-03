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
        <img src="/lovable-uploads/21bb22cc-35f7-4bdc-b74c-281c0412605d.png" alt="MOKMzansi Logo" className="h-39.8 w-39.8" />
      </div>
      {variant === "full" && <div className="font-bold text-xl">
          <span className="gradient-text">MOKMzansi</span>
          <span>Books</span>
        </div>}
    </Link>;
};
export default Logo;