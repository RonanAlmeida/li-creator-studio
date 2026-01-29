'use client';

import { Home, Users, Briefcase, MessageSquare, Bell, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center justify-between h-[56px]">
          {/* Left section: Logo and Search */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[34px] h-[34px] text-linkedin-blue fill-current">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
              </svg>
            </div>
            <div className="hidden md:flex items-center bg-linkedin-gray-100 rounded-md px-3 py-2">
              <Search className="w-4 h-4 text-linkedin-gray-600 mr-2" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none outline-none text-sm w-56 placeholder:text-linkedin-gray-600"
              />
            </div>
          </div>

          {/* Right section: Navigation Icons */}
          <nav className="flex items-center gap-1">
            <NavItem icon={<Home className="w-5 h-5" />} label="Home" active />
            <NavItem icon={<Users className="w-5 h-5" />} label="Network" />
            <NavItem icon={<Briefcase className="w-5 h-5" />} label="Projects" />
            <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Messages" />
            <NavItem icon={<Bell className="w-5 h-5" />} label="Alerts" />
          </nav>
        </div>
      </div>
    </header>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active }: NavItemProps) {
  return (
    <button
      className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
        active ? 'text-linkedin-gray-900' : 'text-linkedin-gray-600 hover:text-linkedin-gray-900 hover:bg-linkedin-gray-100'
      }`}
    >
      {icon}
      <span className="text-xs hidden lg:block font-medium">{label}</span>
      {active && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-[2px] bg-linkedin-gray-900 rounded-full" />
      )}
    </button>
  );
}
