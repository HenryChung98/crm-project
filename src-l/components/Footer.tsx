import Link from "next/link";

export default function Footer() {
  const linkStyle = "hover:text-primary transition-colors duration-300";

  return (
    <footer className="bg-muted text-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">CRMPro</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Transform customer relationships and accelerate business growth
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link href="/features" className={linkStyle}>
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className={linkStyle}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/help" className={linkStyle}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkStyle}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link href="/about" className={linkStyle}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={linkStyle}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkStyle}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8 text-center">
          <div className="text-muted-foreground text-sm">
            &copy; 2025 CRMPro. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
