import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { title: "Features", href: "/#features" },
    { title: "Pricing", href: "/#pricing" },
    { title: "About", href: "/#about" },
    { title: "Contact", href: "/#contact" },
  ];

  const serviceItems = [
    { title: "Accounting", href: "/accounting" },
    { title: "Tax Services", href: "/tax" },
    { title: "Invoicing", href: "/invoices" },
    { title: "Client Management", href: "/clients" },
    { title: "Reporting", href: "/reports" },
  ];

  const isActive = (href: string) => {
    const path = location.pathname + location.hash;
    return path === href || (path === "/" && href === "/#features");
  };

  const isInSection = (section: string) => {
    return location.pathname.includes(section);
  };

  const scrollToSection = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    if (location.pathname === '/') {
      event.preventDefault();
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState({}, '', `/#${sectionId}`);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          
          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <Link
                      to={item.href}
                      className={`${navigationMenuTriggerStyle()} ${
                        isActive(item.href) 
                          ? "bg-accent/70 text-primary font-medium" 
                          : ""
                      }`}
                      onClick={(e) => scrollToSection(e, item.href.split('#')[1])}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuItem>
                ))}
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={isInSection("services") ? "bg-accent/70 text-primary font-medium" : ""}
                  >
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {serviceItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                isInSection(item.href.substring(1)) && "bg-accent/70 text-primary font-medium"
                              )}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <div className="text-sm font-medium leading-none">{item.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Professional {item.title.toLowerCase()} services for your business
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white p-4 shadow-md">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={`text-sm font-medium p-2 rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-gray-100 text-primary font-semibold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={(e) => {
                  scrollToSection(e, item.href.split('#')[1]);
                  setIsMenuOpen(false);
                }}
              >
                {item.title}
              </Link>
            ))}
            
            <div className="space-y-2">
              <p className="text-sm font-semibold px-2 pt-2">Services</p>
              {serviceItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  className={`text-sm ml-2 block p-2 rounded-md transition-colors ${
                    isInSection(item.href.substring(1))
                      ? "bg-gray-100 text-primary font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </div>
            
            <Separator className="my-2" />
            {isAuthenticated ? (
              <Button
                asChild
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
