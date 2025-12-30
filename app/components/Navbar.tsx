"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const items = [
    { href: '/', label: 'Dashboard' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/database', label: 'Database' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 relative">
          {/* Invisible spacer on left for mobile (matches hamburger width) */}
          <div className="lg:hidden w-10"></div>

          {/* Logo - centered on mobile/tablet, left on desktop */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer lg:flex-none flex-1 justify-center lg:justify-start">
            <img src="/icons/Agnus-Dei-Logo.png" alt="Agnus Dei" className="h-7 w-7 object-contain" />
            <span className="font-cinzel text-lg font-semibold text-slate-900">Credo Verum</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 lg:ml-12">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="relative">
                  <span className={`inline-block px-3 py-2 text-sm font-medium ${active ? 'text-[#776B5D]' : 'text-slate-600 hover:text-[#776B5D]'}`}>
                    {item.label}
                  </span>
                  {active && <span className="absolute left-1/2 bottom-0 -translate-x-1/2 h-0.5 w-10 rounded-full bg-[#B0A695]" />}
                </Link>
              );
            })}
          </div>

          {/* Mobile/Tablet Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden absolute right-4 p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#776B5D]"
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Menu - Full Screen */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16 relative">
                  {/* Invisible spacer on left (matches hamburger width) */}
                  <div className="w-10"></div>

                  <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer flex-1 justify-center" onClick={() => setMobileMenuOpen(false)}>
                    <img src="/icons/Agnus-Dei-Logo.png" alt="Agnus Dei" className="h-7 w-7 object-contain" />
                    <span className="font-cinzel text-lg font-semibold text-slate-900">Credo Verum</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute right-4 p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-lg font-medium ${
                      active
                        ? 'bg-[#B0A695]/10 text-[#776B5D]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#776B5D]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Footer with tagline */}
            <div className="px-4 py-6 border-t border-slate-200 text-center">
              <p className="font-cinzel text-lg font-semibold text-slate-900">Credo Verum</p>
              <p className="mt-1 text-sm text-slate-600 italic">Latin for "I believe the truth"</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
