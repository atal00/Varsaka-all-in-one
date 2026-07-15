"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Search, FileText, Settings, Briefcase, Hash, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const routes = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/topics', label: 'Topics', icon: Hash },
  { href: '/dashboard/research', label: 'Research', icon: Search },
  { href: '/dashboard/articles', label: 'Blogs', icon: FileText },
  { href: '/dashboard/case-studies', label: 'Case Studies', icon: Briefcase },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex h-screen flex-col border-r border-border bg-surface w-64 shadow-sm">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <img src="https://varsaka.com/logo.png" alt="Varsaka Logo" className="h-6 w-6 object-contain" />
          <span className="font-serif font-medium">Varsaka</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = route.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(route.href);
            
            return (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-surface2 text-foreground'
                    : 'text-v-muted hover:bg-surface2/50 hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-foreground' : 'text-v-muted'}`} />
                {route.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-v-muted transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
