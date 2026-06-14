import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './layouts/DashboardLayout';

// Import Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import AudienceBuilder from './pages/AudienceBuilder';
import CampaignStudio from './pages/CampaignStudio';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/audience-builder" element={<AudienceBuilder />} />
            <Route path="/campaign-studio" element={<CampaignStudio />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </ToastProvider>
  );
}
