import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.get('/analytics/summary');
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError('Failed to fetch analytics summary');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 glass-card border-brand-red/30 text-brand-red max-w-lg mx-auto mt-12 text-center">
        <p className="font-semibold">Error loading dashboard: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const { metrics, totalCustomers, recentCampaigns } = data || {
    metrics: {},
    totalCustomers: 0,
    recentCampaigns: []
  };

  // Prepare chart data from recent campaigns
  const chartData = recentCampaigns
    .filter(c => c.sentCount > 0)
    .slice(0, 5)
    .map(c => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
      Conversion: c.convertedCount,
      Clicks: c.clickedCount,
      Opens: c.openedCount
    }))
    .reverse();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white m-0">Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time audience tracking and D2C campaign performance overview.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to="/campaign-studio"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-md hover:shadow-lg shadow-emerald-950/40"
          >
            + Create Campaign
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="glass-card p-6 hover-lift">
          <p className="text-sm font-medium text-slate-400">Total Shopper Profiles</p>
          <p className="text-3xl font-semibold mt-2 text-white">{totalCustomers.toLocaleString()}</p>
          <div className="text-xs text-slate-500 mt-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Database Synced
          </div>
        </div>

        {/* Total Campaigns */}
        <div className="glass-card p-6 hover-lift">
          <p className="text-sm font-medium text-slate-400">Total Campaigns Run</p>
          <p className="text-3xl font-semibold mt-2 text-white">{metrics.totalCampaigns}</p>
          <div className="text-xs text-slate-500 mt-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Outbound Messaging
          </div>
        </div>

        {/* Total Messages Sent */}
        <div className="glass-card p-6 hover-lift">
          <p className="text-sm font-medium text-slate-400">Messages Sent</p>
          <p className="text-3xl font-semibold mt-2 text-white">{metrics.sentCount.toLocaleString()}</p>
          <div className="text-xs text-emerald-400 mt-2 flex items-center">
            Delivery Rate: {metrics.deliveryRate}%
          </div>
        </div>

        {/* Conversions */}
        <div className="glass-card p-6 hover-lift">
          <p className="text-sm font-medium text-slate-400">Overall Conversions</p>
          <p className="text-3xl font-semibold mt-2 text-emerald-400">{metrics.convertedCount.toLocaleString()}</p>
          <div className="text-xs text-blue-400 mt-2 flex items-center">
            Conversion Rate: {metrics.conversionRate}%
          </div>
        </div>
      </div>

      {/* Funnel Metrics Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-400 font-medium">Sent</p>
          <p className="text-xl font-bold mt-1 text-white">{metrics.sentCount}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-400 font-medium">Delivered</p>
          <p className="text-xl font-bold mt-1 text-blue-400">{metrics.deliveredCount}</p>
          <span className="text-[10px] text-slate-500">Rate: {metrics.deliveryRate}%</span>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-400 font-medium">Opened</p>
          <p className="text-xl font-bold mt-1 text-indigo-400">{metrics.openedCount}</p>
          <span className="text-[10px] text-slate-500">Rate: {metrics.openRate}%</span>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-400 font-medium">Clicked</p>
          <p className="text-xl font-bold mt-1 text-yellow-500">{metrics.clickedCount}</p>
          <span className="text-[10px] text-slate-500">Rate: {metrics.clickRate}%</span>
        </div>
        <div className="glass-card p-4 text-center col-span-2 md:col-span-1">
          <p className="text-xs text-slate-400 font-medium">Converted</p>
          <p className="text-xl font-bold mt-1 text-emerald-400">{metrics.convertedCount}</p>
          <span className="text-[10px] text-slate-500">Rate: {metrics.conversionRate}%</span>
        </div>
      </div>

      {/* Main Charts & Table section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white m-0">Campaign Performance Trends</h2>
            <p className="text-xs text-slate-400">Comparing funnel depths for recently launched campaigns.</p>
          </div>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
                    labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                  />
                  <Bar dataKey="Opens" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Clicks" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Conversion" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No active campaign metrics to chart. Run a campaign first!
              </div>
            )}
          </div>
        </div>

        {/* Recent Campaigns List */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white m-0">Recent Campaigns</h2>
              <p className="text-xs text-slate-400">Status of latest customer communications.</p>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[280px]">
              {recentCampaigns.length > 0 ? (
                recentCampaigns.map((camp) => (
                  <div key={camp._id} className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{camp.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{camp.channel} &bull; Size: {camp.audienceSize}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        camp.status === 'SENT' ? 'bg-indigo-500/20 text-indigo-300' :
                        camp.status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-300' :
                        camp.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {camp.status}
                      </span>
                      {camp.sentCount > 0 && (
                        <p className="text-[10px] text-emerald-400 mt-1">
                          Conv: {((camp.convertedCount / camp.sentCount) * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">No campaigns created yet.</p>
              )}
            </div>
          </div>

          <Link
            to="/analytics"
            className="w-full mt-4 py-2 border border-slate-700 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-850 text-slate-300 rounded-lg text-center text-sm font-medium transition"
          >
            View Detailed Reports &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
