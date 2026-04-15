import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import GlobalSearch from '@/components/GlobalSearch';
import {
  BarChart3, Brain, Shield, ClipboardList, GraduationCap,
  Building2, Headphones, Users, PieChart, LogOut, Menu, X,
  ChevronDown, User, Home, Search, Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard/ceo', label: 'CEO / Government', icon: BarChart3, level: 'L1' },
  { path: '/dashboard/ai', label: 'AI Insights', icon: Brain, level: 'L1' },
  { path: '/dashboard/officer', label: 'Govt. Officer', icon: Shield, level: 'L2' },
  { path: '/dashboard/pmo', label: 'PMO', icon: ClipboardList, level: 'L2' },
  { path: '/dashboard/institute', label: 'Institute', icon: GraduationCap, level: 'L3' },
  { path: '/dashboard/employer', label: 'Employer', icon: Building2, level: 'L3' },
  { path: '/dashboard/helpdesk', label: 'Helpdesk', icon: Headphones, level: 'L3' },
  { path: '/dashboard/student', label: 'Student', icon: Users, level: 'L4' },
  { path: '/dashboard/bi', label: 'BI / Analytics', icon: PieChart, level: 'L5' },
];

const LEVELS = { L1: 'Strategic', L2: 'Operational', L3: 'Execution', L4: 'End User', L5: 'Analytical' };

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    navigate('/', { replace: true });
    await logout();
  };

  const SidebarContent = () => {
    let lastLevel = '';
    return (
      <>
        <div className="px-4 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white font-heading font-bold text-base">M</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-white text-sm truncate">MahaSwayam</h2>
              <p className="text-[10px] text-slate-400 truncate">SEEID Portal</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 py-3">
          <nav className="px-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const showHeader = item.level !== lastLevel;
              lastLevel = item.level;
              return (
                <React.Fragment key={item.path}>
                  {showHeader && (
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 px-3 pt-4 pb-1">
                      {LEVELS[item.level]}
                    </p>
                  )}
                  <NavLink
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-700/80 text-white border-l-[3px] border-blue-500 pl-[9px]'
                          : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
                      }`
                    }
                    data-testid={`nav-${item.path.split('/').pop()}`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </React.Fragment>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="px-4 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-slate-400 hover:text-white hover:bg-slate-700/50 justify-start"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden" data-testid="dashboard-layout">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#0f172a] shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#0f172a] flex flex-col shadow-xl">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="glass-bar dark:bg-slate-900/90 dark:border-slate-800 h-14 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-40" data-testid="top-bar">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setSidebarOpen(true)}
              data-testid="mobile-menu-btn"
            >
              {sidebarOpen ? <X className="w-5 h-5 dark:text-slate-300" /> : <Menu className="w-5 h-5 dark:text-slate-300" />}
            </button>
            <NavLink to="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400">
              <Home className="w-3.5 h-3.5" /> Home
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 h-9 px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              data-testid="search-trigger"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search KPIs...</span>
              <kbd className="hidden md:inline text-[10px] font-medium px-1.5 py-0.5 bg-white dark:bg-slate-700 text-slate-400 rounded border border-slate-200 dark:border-slate-600 ml-2">Ctrl+K</kbd>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              data-testid="dark-mode-toggle"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" data-testid="user-menu-trigger">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <span className="hidden sm:inline font-medium">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-xs text-slate-500">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} data-testid="user-menu-logout">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Search */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
