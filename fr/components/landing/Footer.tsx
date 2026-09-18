import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.svg";

export const Footer = () => {
  return (
    <footer className="w-full py-stack-lg bg-surface-container-low border-t border-outline-variant mt-auto">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-md">
          <div className="flex flex-col gap-2">
            <Link
              href="#"
              className="text-title-lg font-title-lg font-bold text-primary flex items-center gap-2 mb-2"
            >
              <Image src={logo} alt="Ceylon Tour logo" width={32} height={32} />
              Ceylon Tour
            </Link>
            <p className="font-caption text-caption text-on-surface-variant">
              © {new Date().getFullYear()} Ceylon Tour National Agricultural Grid. All rights
              reserved.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-2">
              Platform
            </h4>
            <Link
              href="#"
              className="font-caption text-caption text-on-surface-variant hover:text-primary underline transition-all duration-200"
            >
              Product
            </Link>
            <Link
              href="#"
              className="font-caption text-caption text-on-surface-variant hover:text-primary underline transition-all duration-200"
            >
              Network
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-2">
              Resources
            </h4>
            <Link
              href="#"
              className="font-caption text-caption text-on-surface-variant hover:text-primary underline transition-all duration-200"
            >
              Governance
            </Link>
            <Link
              href="#"
              className="font-caption text-caption text-on-surface-variant hover:text-primary underline transition-all duration-200"
            >
              Compliance
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-2">
              Legal
            </h4>
            <Link
              href="#"
              className="font-caption text-caption text-on-surface-variant hover:text-primary underline transition-all duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="font-caption text-caption text-on-surface-variant hover:text-primary underline transition-all duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
