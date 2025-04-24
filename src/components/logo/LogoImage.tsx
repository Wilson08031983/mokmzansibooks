
interface LogoImageProps {
  className?: string;
}

const LogoImage = ({ className = "" }: LogoImageProps) => {
  return (
    <div className={`relative ${className}`}>
      <img 
        src="/lovable-uploads/363fdeac-5fd9-467f-9fd5-181cb338a241.png" 
        alt="MOKMzansi Books Logo" 
        className="w-10 h-10 object-contain"
      />
    </div>
  );
};

export default LogoImage;
