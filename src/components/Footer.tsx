
import Logo from "./Logo";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { text: "Features", href: "/#features" },
        { text: "Pricing", href: "/#pricing" },
        { text: "Testimonials", href: "/#testimonials" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About", href: "/#about" },
        { text: "Careers", href: "/#careers" },
        { text: "Blog", href: "/#blog" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Support", href: "/#support" },
        { text: "Documentation", href: "/#docs" },
        { text: "Privacy Policy", href: "/#privacy" },
        { text: "Terms of Service", href: "/#terms" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
    { icon: <Instagram className="h-5 w-5" />, href: "#", label: "Instagram" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-gray-100">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Logo className="mb-4" />
            <p className="text-gray-600 mb-6 max-w-md">
              MOKMzansiBooks: Simplifying financial management and business operations
              for South African entrepreneurs.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-500 hover:text-primary transition"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          {footerLinks.map((column, index) => (
            <div key={index}>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-primary transition"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            &copy; {currentYear} MOKMzansiBooks by Morwa Moabelo (Pty) Ltd. Reg No. 2018/421571/07. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
