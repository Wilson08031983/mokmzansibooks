
interface LogoTextProps {
  className?: string;
}

const LogoText = ({ className = "" }: LogoTextProps) => {
  return (
    <div className={`font-bold text-xl ${className}`}>
      <span className="gradient-text">MOKMzansi</span>
      <span>Books</span>
    </div>
  );
};

export default LogoText;
