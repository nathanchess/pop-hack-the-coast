'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  children?: Omit<NavItem, 'icon'>[];
}

// Simple SVG Icon Components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const BotIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: <DashboardIcon />,
  },
  {
    name: 'Demand Intelligence',
    href: '/demand',
    icon: <ChartIcon />,
    children: [
      { name: 'True Demand Analysis', href: '/demand/true-demand' },
      { name: 'Promo Finder', href: '/demand/promo-finder' },
      { name: 'Channels', href: '/demand/channels' },
    ],
  },
  {
    name: 'Reorder Center',
    href: '/reorder',
    icon: <TargetIcon />,
    children: [
      { name: 'Alerts & Actions', href: '/reorder/alerts' },
      { name: 'Draft POs', href: '/reorder/draft-pos' },
      { name: 'Communications', href: '/reorder/communications' },
    ],
  },
  {
    name: 'AI Agent',
    href: '/agent',
    icon: <BotIcon />,
  },
  {
    name: 'Data Explorer',
    href: '/data',
    icon: <DatabaseIcon />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isChildActive = (children?: Omit<NavItem, 'icon'>[]) => {
    return children?.some((child) => pathname === child.href) ?? false;
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-72 glass-sidebar border-r border-neutral-200/50 flex flex-col animate-fade-up">
      {/* Logo Section */}
      <div className="p-6 border-b border-neutral-200/50" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3">
          <div className="relative w-80 h-10">
            <Image
              src="/logo.jpg"
              alt="Prince of Peace"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item, idx) => (
          <div key={item.href} className="animate-fade-up" style={{ animationDelay: `${200 + idx * 50}ms` }}>
            {/* Parent Item */}
            <div
              className={`
                group relative flex items-center justify-between px-4 py-3 rounded-xl
                transition-all duration-300 ease-out cursor-pointer
                focus:outline-none active:scale-[0.98]
                ${
                  isActive(item.href) && !item.children
                    ? 'glass-active text-pop-primary font-medium'
                    : isChildActive(item.children)
                    ? 'glass-subtle text-neutral-900 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100/60 hover:backdrop-blur-md hover:shadow-sm'
                }
              `}
              onClick={() => {
                if (item.children) {
                  toggleExpanded(item.href);
                }
              }}
            >
              <Link
                href={item.children ? '#' : item.href}
                className="flex items-center gap-3 flex-1"
                onClick={(e) => {
                  if (item.children) {
                    e.preventDefault();
                  }
                }}
              >
                <span className="transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>

              {/* Expand Arrow for Parent Items */}
              {item.children && (
                <svg
                  className={`
                    w-4 h-4 transition-transform duration-300
                    ${expandedItems.includes(item.href) ? 'rotate-180' : ''}
                  `}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}

              {/* Active Indicator */}
              {isActive(item.href) && !item.children && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-pop-primary rounded-r-full" />
              )}
            </div>

            {/* Children Items */}
            {item.children && (
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${
                    expandedItems.includes(item.href) || isChildActive(item.children)
                      ? 'max-h-96 opacity-100 mt-1'
                      : 'max-h-0 opacity-0'
                  }
                `}
              >
                <div className="ml-4 pl-6 border-l border-neutral-200/50 space-y-1 mt-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`
                        group flex items-center gap-3 px-3 py-2 rounded-lg
                        transition-all duration-300 ease-out text-sm
                        ${
                          pathname === child.href
                            ? 'text-pop-primary font-medium bg-pop-primary/5'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                        }
                        hover:translate-x-1
                      `}
                    >
                      <span
                        className={`
                          w-1.5 h-1.5 rounded-full transition-all duration-300
                          ${
                            pathname === child.href
                              ? 'bg-pop-primary scale-125'
                              : 'bg-neutral-400 group-hover:bg-neutral-600'
                          }
                        `}
                      />
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Navigation Items */}
      <div className="p-4 border-t border-neutral-200/50 space-y-1">
        {/* Divider with label */}
        <div className="px-4 py-2">
          <div className="h-px bg-neutral-200/50 mb-2"></div>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className={`
            group relative flex items-center gap-3 px-4 py-3 rounded-xl
            transition-all duration-300 ease-out cursor-pointer animate-fade-up
            focus:outline-none active:scale-[0.98]
            text-neutral-700 hover:bg-neutral-100/60 hover:backdrop-blur-md hover:shadow-sm
          `}
          style={{ animationDelay: '500ms' }}
        >
          <span className="transition-transform duration-300 group-hover:scale-110">
            <GitHubIcon />
          </span>
          <span className="text-sm font-medium">Source Code</span>
          <svg className="w-3 h-3 ml-auto text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        <Link
          href="/export"
          className={`
            group relative flex items-center gap-3 px-4 py-3 rounded-xl
            transition-all duration-300 ease-out cursor-pointer animate-fade-up
            focus:outline-none active:scale-[0.98]
            ${
              pathname === '/export'
                ? 'glass-active text-pop-primary font-medium'
                : 'text-neutral-700 hover:bg-neutral-100/60 hover:backdrop-blur-md hover:shadow-sm'
            }
          `}
          style={{ animationDelay: '550ms' }}
        >
          <span className="transition-transform duration-300 group-hover:scale-110">
            <UploadIcon />
          </span>
          <span className="text-sm font-medium">Exports & Reports</span>
          {pathname === '/export' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-pop-primary rounded-r-full" />
          )}
        </Link>

        <Link
          href="/settings"
          className={`
            group relative flex items-center gap-3 px-4 py-3 rounded-xl
            transition-all duration-300 ease-out cursor-pointer animate-fade-up
            focus:outline-none active:scale-[0.98]
            ${
              pathname === '/settings'
                ? 'glass-active text-pop-primary font-medium'
                : 'text-neutral-700 hover:bg-neutral-100/60 hover:backdrop-blur-md hover:shadow-sm'
            }
          `}
          style={{ animationDelay: '600ms' }}
        >
          <span className="transition-transform duration-300 group-hover:scale-110">
            <SettingsIcon />
          </span>
          <span className="text-sm font-medium">Settings</span>
          {pathname === '/settings' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-pop-primary rounded-r-full" />
          )}
        </Link>
      </div>
    </div>
  );
}
