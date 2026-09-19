"use client";

import { Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/public/logo.svg"

const navItems = [
  { name: "Why CeylonTour", href: "#why-us" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Impact", href: "#impact" },
  { name: "Reviews", href: "#reviews" },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter(); // Initialize router
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth >= 640) setMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const getLinkHref = (item: { name: string; href: string }) => {
    return item.href;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 1 : 0 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed justify-center top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-40"
      />
      <header className="pointer-events-none fixed top-0 left-0 right-0 z-[999] w-full px-0 py-4 flex justify-center">
        <motion.nav
          layout
          initial={{
            width: "800px",
            backgroundColor: "var(--card)",
          }}
          animate={
            isMobile
              ? {
                  width: "95%",
                  backgroundColor: "var(--card)",
                }
              : {
                  width: isScrolled ? "fit-content" : "1000px",
                  backgroundColor: "var(--card)",
                }
          }
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="relative max-screen backdrop-blur-md pointer-events-auto flex w-full items-center justify-between gap-6 rounded-full px-4 py-1.5 transition-all duration-300 sm:px-6 sm:pr-4 border border-border/80 shadow-lg text-card-foreground"
        >
          <Link
            href="/"
            className="text-title-lg font-title-lg font-bold text-primary flex items-center gap-2 transition-colors"
          >
            <Image src={logo} alt="Ceylon Tour logo" width={32} height={32} />
            Ceylon Tour
          </Link>
          <ul className="hidden font-body-md gap-6 text-sm sm:flex whitespace-nowrap px-16">
            {navItems.map((item) => {
              const href = getLinkHref(item);
              const isActive = pathname === href;
              return (
                <li
                  key={item.name}
                  className="group relative flex items-center"
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute -left-3 h-1.5 w-1.5 rounded-full bg-primary"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <Link
                    className={`text-foreground hover:text-primary transition-colors ${
                      isActive ? "font-bold" : ""
                    }`}
                    href={href}
                  >
                    <span className="relative inline-flex overflow-hidden">
                      <div className="translate-y-0 skew-y-0 transform-gpu transition-transform duration-500 group-hover:-translate-y-[150%] group-hover:skew-y-12">
                        {item.name}
                      </div>
                      <div className="absolute translate-y-[150%] skew-y-12 transform-gpu transition-transform duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                        {item.name}
                      </div>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex gap-4">
              <Button
                onClick={() => router.push("/auth")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                Launch App
              </Button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden p-2 text-primary"
            >
              <Menu size={24} />
            </button>
          </div>
        </motion.nav>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[1001] bg-black/50 backdrop-blur-sm sm:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[1002] w-64 bg-background border-l border-border p-6 sm:hidden flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="text-title-lg font-title-lg font-bold text-primary flex items-center gap-2"
                >
                  <Image src={logo} alt="Ceylon Tour logo" width={32} height={32} />
                  Ceylon Tour
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-foreground hover:bg-muted rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <ul className="flex flex-col gap-4">
                {navItems.map((item) => {
                  const href = getLinkHref(item);
                  return (
                    <li key={item.name}>
                      <Link
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block text-md ${pathname === href
                          ? "text-primary font-bold"
                          : "text-foreground hover:text-primary"
                          }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-col gap-4">
                <Button
                  className="w-full flex justify-center bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => router.push("/auth")}
                >
                  Launch App
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
