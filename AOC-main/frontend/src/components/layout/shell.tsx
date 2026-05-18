'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ReactNode } from 'react';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  const navLinks = [
    { label: 'Builders', href: '/builders' },
    { label: 'Teams', href: '/teams' },
    { label: 'Hackathons', href: '/hackathons' },
    { label: 'Projects', href: '/projects' },
    { label: 'Missions', href: '/missions' },
    { label: 'Divisions', href: '/divisions' },
    { label: 'Community', href: '/community' },
    { label: 'About', href: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-inter selection:bg-red-100 selection:text-red-900">
      {/* NAV */}
      <nav className="sticky top-0 z-50 h-16 border-b bg-white/80 backdrop-blur-xl flex items-center justify-between px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-black tracking-tight group">
            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white text-[12px]">⚔</span>
            </div>
            <span>Attack on <span className="text-red-600">Code</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-[13px] font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[12px] font-bold text-red-600 cursor-pointer hover:border-red-200 transition-all">
                {user.fullName.charAt(0)}
              </div>
              <button
                onClick={() => logout()}
                className="text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                Log in
              </Link>
              <Link href="/register" className="px-4 py-2 bg-red-600 text-white text-[13px] font-bold rounded-lg hover:bg-red-700 transition-all shadow-sm shadow-red-200 active:scale-95">
                Join Community
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* CONTENT */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t py-16 px-8 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="font-black text-[15px] mb-4">
              Attack on <span className="text-red-600">Code</span>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-[240px]">
              The collaborative ecosystem for student builders. Find teammates, form teams, build projects, win hackathons.
            </p>
          </div>
          <div>
            <h5 className="text-[12px] font-bold uppercase tracking-wider text-gray-900 mb-6">Platform</h5>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-[12px] font-bold uppercase tracking-wider text-gray-900 mb-6">Community</h5>
            <ul className="space-y-3">
              <li><Link href="#" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">Discord</Link></li>
              <li><Link href="#" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">GitHub</Link></li>
              <li><Link href="#" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[12px] font-bold uppercase tracking-wider text-gray-900 mb-6">Resources</h5>
            <ul className="space-y-3">
              <li><Link href="#" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">Guidelines</Link></li>
              <li><Link href="#" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-gray-400 font-medium">
          <span>© 2024 Attack on Code</span>
          <span>Built by builders, for builders.</span>
        </div>
      </footer>
    </div>
  );
}
