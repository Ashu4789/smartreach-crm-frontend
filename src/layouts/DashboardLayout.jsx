import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Target,
  Send,
  BarChart3,
  Search,
  Bell,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Building2,
  Cpu
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('SmartReach Fashion');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Audience Builder', path: '/audience-builder', icon: Target },
    { name: 'Campaign Studio', path: '/campaign-studio', icon: Send },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* 1. Desktop Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-xs">
              SR
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">SmartReach</h1>
              <span className="text-[10px] font-semibold text-emerald-400">Enterprise AI CRM</span>
            </div>
          </div>

          {/* Workspace Selector */}
          <div className="p-4 border-b border-slate-800 relative">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="w-full bg-slate-850 border border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{activeWorkspace}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute left-4 right-4 mt-1 bg-slate-850 border border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
                {['SmartReach Fashion', 'Coffee Chain Test', 'Sandbox Brand'].map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-300 transition"
                  >
                    {ws}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Navigation Menu */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition border ${
                    isActive
                      ? 'bg-slate-800 text-white border-slate-700/50 shadow-xs'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-500' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Details */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-2 text-xs text-slate-450">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <p>API Endpoint Connected</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">&copy; SmartReach AI 2026</p>
        </div>
      </aside>

      {/* 2. Right Main Layout Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-45 shadow-2xs">
          {/* Left: Mobile Toggle & Page context */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-lg px-3 py-1.5 text-xs text-slate-500 max-w-xs">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search CRM..."
                className="bg-transparent focus:outline-none w-28 md:w-44 text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Right: Notification Alerts & AI Connected Status Indicator */}
          <div className="flex items-center gap-4">
            {/* AI Gemini Chip indicator */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3 text-emerald-600 animate-pulse" />
              <span className="text-emerald-700 font-semibold hidden sm:inline">Gemini AI Ready</span>
            </div>

            {/* Notification Icon */}
            <button className="p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-lg transition relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            </button>

            {/* Vertical Splitter */}
            <div className="h-4 w-px bg-slate-200" />

            {/* User Dropdown Preview */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs shadow-inner">
                MK
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">Marketer Admin</p>
                <span className="text-[10px] text-slate-400">growth@brand.com</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* 3. Mobile Responsive Drawer Panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer layout */}
          <div className="relative w-64 max-w-xs bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shadow-2xl animate-slide-in">
            <div>
              {/* Close Button & Brand */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center font-bold text-white text-xs">
                    SR
                  </div>
                  <h1 className="text-sm font-bold text-white">SmartReach</h1>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition border ${
                        isActive
                          ? 'bg-slate-800 text-white border-slate-700/50'
                          : 'text-slate-400 border-transparent hover:bg-slate-850'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-800 pt-4 text-xs text-slate-500">
              <p>Workspace: {activeWorkspace}</p>
              <p className="text-[10px] text-slate-650 mt-1">&copy; SmartReach AI 2026</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
