"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Sun, Moon } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isFaqPage = pathname === "/faq";

  // Theme State
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check saved theme on component mount
    const savedTheme = localStorage.getItem("iptv_theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("iptv_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("iptv_theme", "light");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-500 ${scrolled
          ? "bg-white/85 dark:bg-[#070414]/80 backdrop-blur-xl border-zinc-200 dark:border-white/[0.08] shadow-lg shadow-black/5 dark:shadow-black/20"
          : "bg-transparent border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-22">
          {/* Logo & Brand */}
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center gap-2.5 sm:gap-4.5 cursor-pointer group"
            >
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/15 group-hover:border-primary/40 shadow-xl shadow-primary/10 dark:shadow-primary/20 bg-zinc-100 dark:bg-white/5 flex-shrink-0 transition-colors">
                <Image
                  src="/logo.png"
                  alt="IPTV Player Logo"
                  fill
                  sizes="(max-width: 640px) 40px, 56px"
                  className="object-cover group-hover:scale-105 transition-transform"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center">
                {/* Mobile UI Brand */}
                <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white sm:hidden leading-none select-none">
                  IP<span className="gradient-text">TV</span>
                </span>

                {/* Desktop UI Brand */}
                <div className="hidden sm:flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                    IP
                  </span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight gradient-text">
                    TV Player
                  </span>
                </div>

                {/* Desktop Live Broadcast Badge */}
                <div className="hidden sm:flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                      LIVE BROADCAST
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Right side navigation / FAQ & Theme Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <Link
              href="/faq"
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 active:scale-95 cursor-pointer ${
                isFaqPage
                  ? "border-primary/50 bg-primary/10 text-primary animate-pulse"
                  : "border-zinc-200 dark:border-white/10 hover:border-primary/50 bg-zinc-100 dark:bg-white/5 hover:bg-primary/10 text-zinc-900 dark:text-white"
              } font-bold text-xs sm:text-sm`}
            >
              <HelpCircle size={15} className="text-primary" />
              <span>FAQ</span>
            </Link>

            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-primary/50 bg-zinc-100 dark:bg-white/5 hover:bg-primary/10 text-zinc-900 dark:text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 active:scale-95 cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun size={15} className="text-primary" />
                    <span className="hidden sm:inline">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={15} className="text-primary" />
                    <span className="hidden sm:inline">Dark Mode</span>
                  </>
                )}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
}