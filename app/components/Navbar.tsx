"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Dashboard' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/database', label: 'Database' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/icons/Agnus-Dei-Logo.png" alt="Agnus Dei" className="h-7 w-7 object-contain" />
              <span className="font-cinzel text-lg font-semibold text-slate-900">Credo Verum</span>
            </div>

            <div className="flex items-center gap-6">
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
          </div>

          {/* keep right side empty for now, or add user controls later */}
          <div />
        </div>
      </div>
    </nav>
  );
}
