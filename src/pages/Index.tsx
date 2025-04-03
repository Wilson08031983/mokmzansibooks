
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, X, Zap, PieChart, Users, FileText, CheckCircle } from "lucide-react";

const Index = () => {
  // Features section data
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Client Management",
      description:
        "Organize clients into companies, individuals, and vendors. Keep all contact information, transaction history, and documents in one place.",
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Invoices & Quotations",
      description:
        "Create professional invoices and quotes in minutes. Track payments, send reminders, and manage your cash flow effortlessly.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "QuickFill Tendering",
      description:
        "Upload tender documents and let our system auto-fill forms. Find the best prices for RFQ items with our price comparison engine.",
    },
    {
      icon: <PieChart className="h-8 w-8 text-primary" />,
      title: "Reports & Analytics",
      description:
        "Get valuable insights about your business with comprehensive reports and analytics to make informed decisions.",
    },
  ];

  // Pricing plans data
  const pricingPlans = [
    {
      name: "Free Trial",
      price: "0",
      duration: "for 30 days",
      description: "Perfect for getting started",
      features: [
        "Client management (up to 10 clients)",
        "Basic invoicing & quotations",
        "Limited QuickFill functionality",
        "Basic reports",
        "Email support",
      ],
      limitations: [
        "No bulk operations",
        "Limited templates",
        "No advanced analytics",
      ],
      ctaText: "Start Free Trial",
      ctaLink: "/signup",
    },
    {
      name: "Premium",
      price: "44.90",
      duration: "per month",
      description: "Everything you need to grow",
      features: [
        "Unlimited clients",
        "Advanced invoicing & quotations",
        "Full QuickFill functionality",
        "Comprehensive reports & analytics",
        "Priority email & phone support",
        "Custom branding",
        "Tender document auto-fill",
        "Price comparison engine",
        "Data backup & restoration",
        "Multiple users (team access)",
      ],
      ctaText: "Subscribe Now",
      ctaLink: "/signup",
      popular: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-purple-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-purple-100 text-purple-800">
                  <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                  <span>Made for South African Businesses</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Simplify Your <span className="gradient-text">Business Operations</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                MOKMzansiBooks streamlines your financial management, tendering, and business operations - all tailored for South African entrepreneurs.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base">
                  <Link to="/#features">Learn More</Link>
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
            </div>
            <div className="lg:pl-12">
              <div className="relative">
                <div className="rounded-lg shadow-xl overflow-hidden border border-gray-100 bg-white">
                  <img
                    src="/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
                    alt="South African Business Collaboration"
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 animate-float hidden md:block">
                  <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Invoice Paid</p>
                        <p className="text-xs text-gray-500">R14,750.00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Features Designed for <span className="gradient-text">South African</span> Businesses
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your finances, tenders, and clients in one platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* QuickFill Section */}
      <section className="py-16 md:py-24 bg-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Upload Tender Documents</h4>
                      <p className="text-sm text-gray-500">Upload your business documents and tender forms</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Auto-Fill Forms</h4>
                      <p className="text-sm text-gray-500">Our system extracts and auto-fills tender documents</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Price Comparison</h4>
                      <p className="text-sm text-gray-500">Get the best prices for RFQ items automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Submit with Confidence</h4>
                      <p className="text-sm text-gray-500">Review, approve, and submit your complete tender</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="gradient-text">QuickFill</span> Tendering System
              </h2>
              <p className="text-lg text-gray-600">
                Say goodbye to the tedious process of manually filling tender documents. Our QuickFill system automates the tendering process while finding you the best prices.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Save hours of manual data entry</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Avoid errors in your tender submissions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Get competitive pricing for all RFQ items</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Increase your chances of winning tenders</span>
                </li>
              </ul>
              <Button asChild className="text-base">
                <Link to="/signup">Try QuickFill Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works for your business
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-xl border ${
                  plan.popular ? "border-primary shadow-lg" : "border-gray-200"
                } bg-white p-6 lg:p-8`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="inline-block rounded-bl-lg rounded-tr-lg bg-primary px-3 py-1 text-xs text-white">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-gray-500 mt-1 text-sm">{plan.description}</p>
                </div>
                <div className="mb-5">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">R{plan.price}</span>
                    <span className="ml-1 text-gray-500">{plan.duration}</span>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations && plan.limitations.map((limitation, i) => (
                    <div key={`limit-${i}`} className="flex">
                      <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link to={plan.ctaLink}>{plan.ctaText}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/lovable-uploads/44062e3c-e3b2-47ea-9869-37a2dc71b5d8.png"
                  alt="Wilson Mokgethwa Moabelo - CEO & Founder"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-block">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-purple-100 text-purple-800">
                  <span>Our Story</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Meet the <span className="gradient-text">Founder</span>
              </h2>
              <p className="text-lg">
                Wilson Mokgethwa Moabelo founded Morwa Moabelo (Pty) Ltd in 2018 in Atteridgeville, Pretoria.
              </p>
              <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700">
                "I was a business man who tried almost every business you can think of. Through all my trials and errors, running on a loss, I realized that there might be other South Africans suffering the same fate on a daily basis—filling tender documents, hitting dead ends, losing money on stationery without getting anything in return. I had to come up with an idea to assist myself and others to have an automated business platform that will save time and cost of filling endless RFQs and running without funding and zero assistance. This was the birth of MOKMzansiBooks est. 2024. This is to help South Africans grow, one page at a time."
              </blockquote>
              <div className="pt-4">
                <p className="font-medium">Wilson Mokgethwa Moabelo</p>
                <p className="text-gray-500">CEO & Founder, MOKMzansiBooks</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions? Want to learn more about our services? Contact us today!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">
                    123 Main Street, Pretoria<br />
                    Gauteng, South Africa
                  </p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">info@mokmzansibooks.co.za</p>
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">+27 12 345 6789</p>
                </div>
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-gray-600">
                    Monday - Friday: 8:00 AM - 5:00 PM<br />
                    Saturday: 9:00 AM - 1:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-lg mb-6">
                Whether you're looking to streamline your business operations, need help with tender documents, or want to learn more about our services, our team is here to help.
              </p>
              <p className="text-lg mb-6">
                Reach out to us today and discover how MOKMzansiBooks can transform your business operations and help you succeed in the South African market.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base">
                  <a href="mailto:info@mokmzansibooks.co.za">Email Us</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-brand-purple to-brand-pink text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of South African entrepreneurs who are saving time and growing their businesses with MOKMzansiBooks.
          </p>
          <Button
            asChild
            size="lg"
            className="text-base bg-white text-primary hover:bg-gray-100"
          >
            <Link to="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
