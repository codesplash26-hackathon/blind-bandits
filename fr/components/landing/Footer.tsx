import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.svg";
import { Compass, Globe, Shield, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full py-12 md:py-16 bg-card border-t border-border mt-auto transition-colors">
      <div className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link
              href="/"
              className="text-2xl font-bold font-heading text-primary flex items-center gap-2"
            >
              <Image src={logo} alt="Ceylon Tour logo" width={36} height={36} />
              Ceylon Tour
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Sri Lanka&apos;s premier smart & sustainable travel platform. Discover authentic experiences while preserving nature and empowering local communities.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold dark:text-emerald-400">
                <Shield className="w-4 h-4" /> 100% Verified Eco Tourism
              </span>
            </div>
          </div>

          {/* Destinations */}
          <div className="flex flex-col gap-3">
            <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider">
              Destinations
            </h4>
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Sigiriya & Cultural Triangle
            </Link>
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Ella & Tea Country
            </Link>
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Mirissa & Southern Coast
            </Link>
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Yala & Wildlife Parks
            </Link>
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-3">
            <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider">
              Platform
            </h4>
            <Link
              href="#about"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              About Ceylon Tour
            </Link>
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              AI Eco Route Planner
            </Link>
            <Link
              href="#market"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Traveler Reviews
            </Link>
            <Link
              href="/auth"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Local Guide Portal
            </Link>
          </div>

          {/* Contact & Sustainability */}
          <div className="flex flex-col gap-3">
            <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider">
              Pledge
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We donate 5% of net profits to rainforest reforestation & marine wildlife rescue in Sri Lanka.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="p-2 rounded-full bg-primary/10 text-primary">
                <Globe className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-full bg-primary/10 text-primary">
                <Compass className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-full bg-primary/10 text-primary">
                <Heart className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Ceylon Tour. All rights reserved. Made with love for Sri Lanka.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Sustainability Code
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
