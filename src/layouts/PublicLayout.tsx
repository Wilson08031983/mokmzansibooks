
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PublicLayout = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  return (
    <div className={`min-h-screen flex flex-col ${isHomepage ? "bg-layout-pattern" : ""}`}>
      <Navbar />
      <main className="flex-grow relative">
        {isHomepage && (
          <div 
            className="absolute inset-0 bg-cover bg-center z-0 opacity-15"
            style={{ 
              backgroundImage: 'url("/lovable-uploads/fe0d1798-c79c-4326-bda0-8d24514a5874.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              pointerEvents: 'none'
            }}
          />
        )}
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
