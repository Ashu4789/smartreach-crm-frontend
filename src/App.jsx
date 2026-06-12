import React from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';

// Import Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import AudienceBuilder from './pages/AudienceBuilder';
import CampaignStudio from './pages/CampaignStudio';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-900 font-sans antialiased text-slate-200">
        
        {/* Sidebar Container */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-950/50">
                SR
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight text-white leading-none">SmartReach</p>
                <span className="text-[10px] font-semibold text-emerald-400">AI CRM Platform</span>
              </div>
            </div>

            {/* Navlinks */}
            <nav className="mt-8 space-y-1.5">
              <NavLink 
                to="/" 
                className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                    : 'text-slate-400 hover:text-slate-250 border border-transparent hover:bg-slate-900/40'
                }`}
              >
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink 
                to="/customers" 
                className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                    : 'text-slate-400 hover:text-slate-250 border border-transparent hover:bg-slate-900/40'
                }`}
              >
                <span>Customers</span>
              </NavLink>

              <NavLink 
                to="/audience-builder" 
                className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                    : 'text-slate-400 hover:text-slate-250 border border-transparent hover:bg-slate-900/40'
                }`}
              >
                <span>Audience Builder</span>
              </NavLink>

              <NavLink 
                to="/campaign-studio" 
                className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                    : 'text-slate-400 hover:text-slate-250 border border-transparent hover:bg-slate-900/40'
                }`}
              >
                <span>Campaign Studio</span>
              </NavLink>

              <NavLink 
                to="/analytics" 
                className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                    : 'text-slate-400 hover:text-slate-250 border border-transparent hover:bg-slate-900/40'
                }`}
              >
                <span>Analytics</span>
              </NavLink>
            </nav>
          </div>

          {/* Footer Info inside Sidebar */}
          <div className="p-6 border-t border-slate-850">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              <p>Simulated Node API OK</p>
            </div>
            <p className="text-[10px] text-slate-600 mt-1">&copy; SmartReach CRM 2026</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Navbar */}
          <header className="h-16 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-40">
            {/* Mobile Title */}
            <div className="flex items-center space-x-2 md:hidden">
              <div className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center font-bold text-white text-sm">
                SR
              </div>
              <p className="font-bold text-sm tracking-tight text-white leading-none">SmartReach</p>
            </div>

            {/* Spacer in desktop */}
            <div className="hidden md:block"></div>

            {/* Topbar Info tags */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-900 border border-slate-850 rounded px-2.5 py-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-slate-400 font-semibold">Atlas MongoDB Connected</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-900 border border-slate-850 rounded px-2.5 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400 font-semibold">Gemini LLM Ready</span>
              </div>
            </div>
          </header>

          {/* Page Routing Outlets */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/audience-builder" element={<AudienceBuilder />} />
              <Route path="/campaign-studio" element={<CampaignStudio />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>

      </div>
    </Router>
  );
}
