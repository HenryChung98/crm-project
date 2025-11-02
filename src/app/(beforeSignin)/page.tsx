"use client";
import { useRouter } from "next/navigation";
import { IoMdPeople, IoMdAnalytics, IoMdSync, IoMdCog } from "react-icons/io";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <IoMdPeople size={30} />,
      title: "Customer Management",
      description:
        "Manage all your customer information in one centralized database with unified customer data.",
    },
    {
      icon: <IoMdAnalytics size={30} />,
      title: "Real-time Analytics",
      description:
        "Track and optimize your business performance in real-time with powerful analytical tools.",
    },
    {
      icon: <IoMdSync size={30} />,
      title: "Integration",
      description:
        "Connect seamlessly with your favorite tools and platforms for a unified workflow.",
    },
    {
      icon: <IoMdCog size={30} />,
      title: "Automation",
      description: "Maximize efficiency by automating repetitive tasks and streamlining workflows.",
    },
  ];

  const benefits = [
    {
      title: "Built for Growth",
      description:
        "Scalable architecture designed to grow with your business from startup to enterprise.",
    },
    {
      title: "Modern Technology",
      description: "Latest tech stack ensuring fast performance and reliable user experience.",
    },
    {
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with 99.9% uptime guarantee to keep your business running.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-primary"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            <div className="pb-5 drop-shadow-sm">Start Simply</div>
            <span className="block drop-shadow-sm">Grow Faster</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90 drop-shadow-sm leading-relaxed font-medium tracking-wide">
            Transform customer relationships and accelerate business growth with us
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="bg-primary-foreground text-primary px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105"
              onClick={() => router.push("/auth/signup")}
            >
              Start For Free
            </button>

            <button
              className="flex items-center gap-2 px-8 py-4 border-2 border-primary-foreground text-primary-foreground rounded-full text-lg font-semibold hover:bg-primary-foreground hover:text-primary transition-all"
              onClick={() => router.push("/demo")}
            >
              View Demo
            </button>
          </div>

          <div className="mt-16 text-sm opacity-75">
            <p>No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover all the CRM capabilities you need for business growth in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-card p-8 rounded-2xl shadow-base hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose CRMPro
            </h2>
            <p className="text-xl text-muted-foreground">
              Built with modern technology and designed for the future
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Stats Section */}
      {/* <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Join Our Growing Community</h2>
          <p className="text-xl opacity-90 mb-12">Early adopters are already experiencing the difference</p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">100+</div>
              <div className="opacity-80">Early Adopters</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">99.9%</div>
              <div className="opacity-80">Uptime</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">10+</div>
              <div className="opacity-80">Integrations</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="opacity-80">Support</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-accent text-accent-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of businesses already using CRMPro to grow faster
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-accent-foreground text-accent px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105"
              onClick={() => router.push("/auth/signup")}
            >
              Start For Free
            </button>
            <button
              className="border-2 border-accent-foreground px-8 py-4 rounded-full text-lg font-semibold hover:bg-accent-foreground hover:text-accent transition-all"
              onClick={() => router.push("/contact")}
            >
              Contact Sales
            </button>
          </div>

          <div className="mt-8 text-sm opacity-75">
            <p>Setup in minutes • No long-term contracts</p>
          </div>
        </div>
      </section>
    </div>
  );
}
