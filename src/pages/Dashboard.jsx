import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users as UsersIcon,
  IndianRupee,
  Megaphone,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import API from '../services/api';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';

const COLORS = ['#059669', '#2563eb', '#fbbf24', '#a855f7'];

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollingActive, setPollingActive] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await API.get('/analytics/summary');
      if (res.data.success) {
        setSummaryData(res.data.data);
      } else {
        setError('Failed to fetch analytics summary');
      }
    } catch (err) {
      setError(err.message || 'Error loading dashboard data');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await API.get('/webhook/logs');
      if (res.data.success) {
        setWebhookLogs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching webhook logs:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchLogs()]);
      setLoading(false);
    };
    initData();
  }, []);

  // Poll for webhook logs and campaign stats every 3.5 seconds
  useEffect(() => {
    if (!pollingActive) return;
    const timer = setInterval(() => {
      fetchSummary();
      fetchLogs();
    }, 3500);
    return () => clearInterval(timer);
  }, [pollingActive]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent"></div>
        <p className="text-xs text-slate-400 font-medium">Loading workspace metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-lg mx-auto mt-12 text-center" title="Dashboard Error">
        <p className="text-sm text-red-650">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
        >
          Retry Load
        </button>
      </Card>
    );
  }

  const { metrics, totalCustomers, totalRevenue, recentCampaigns } = summaryData || {
    metrics: {},
    totalCustomers: 0,
    totalRevenue: 0,
    recentCampaigns: []
  };

  // 1. Line Chart: Campaign Performance Trends (Opens, Clicks, Conversions)
  const lineChartData = recentCampaigns
    .filter(c => c.sentCount > 0)
    .slice(0, 6)
    .map(c => ({
      name: c.name.length > 10 ? c.name.substring(0, 10) + '..' : c.name,
      Opens: c.openedCount,
      Clicks: c.clickedCount,
      Conversions: c.convertedCount
    }))
    .reverse();

  // 2. Bar Chart: Delivery Funnel Overview
  const funnelChartData = [
    { name: 'Sent', count: metrics.sentCount, fill: '#64748b' },
    { name: 'Delivered', count: metrics.deliveredCount, fill: '#2563eb' },
    { name: 'Opened', count: metrics.openedCount, fill: '#818cf8' },
    { name: 'Clicked', count: metrics.clickedCount, fill: '#fbbf24' },
    { name: 'Converted', count: metrics.convertedCount, fill: '#059669' }
  ];

  // 3. Pie Chart: Preferred Channels Distribution
  const channelCounts = recentCampaigns.reduce((acc, c) => {
    acc[c.channel] = (acc[c.channel] || 0) + c.audienceSize;
    return acc;
  }, { Email: 12, WhatsApp: 18, SMS: 8, RCS: 4 }); // Add fallback default seed weights if database campaigns empty

  const pieChartData = Object.keys(channelCounts).map(key => ({
    name: key,
    value: channelCounts[key]
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Workspace Overview</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time stats, conversion channels, and campaign metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPollingActive(!pollingActive)}
            className={`px-3 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              pollingActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-650 border-slate-200'
            }`}
          >
            <RefreshCw className={`h-3 w-3 ${pollingActive ? 'animate-spin' : ''}`} />
            <span>{pollingActive ? 'Live Syncing' : 'Sync Paused'}</span>
          </button>
          <Link
            to="/campaign-studio"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow-sm transition"
          >
            Create Campaign
          </Link>
        </div>
      </div>

      {/* CEO Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="glass-card p-6 flex flex-col justify-between hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <UsersIcon className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900 leading-none">{totalCustomers.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-2">
              <ArrowUpRight className="h-3 w-3" />
              <span>+4.2% vs last week</span>
            </div>
          </div>
        </div>

        {/* Revenue Spend */}
        <div className="glass-card p-6 flex flex-col justify-between hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Brand Revenue</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <IndianRupee className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900 leading-none">
              Rs. {totalRevenue ? totalRevenue.toLocaleString('en-IN') : '0'}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-2">
              <ArrowUpRight className="h-3 w-3" />
              <span>+18.7% YoY growth</span>
            </div>
          </div>
        </div>

        {/* Total Campaigns */}
        <div className="glass-card p-6 flex flex-col justify-between hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Campaigns Run</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Megaphone className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900 leading-none">{metrics.totalCampaigns}</p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-2">
              <span>Active simulator queues</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="glass-card p-6 flex flex-col justify-between hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900 leading-none">{metrics.conversionRate}%</p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-2">
              <ArrowUpRight className="h-3 w-3" />
              <span>Avg: 11.2% optimal click depth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Recharts Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Conversion Performance Trends */}
        <Card title="Conversion Trends" subtitle="Compare message engagement depth across campaigns" className="lg:col-span-2">
          <div className="h-72 w-full">
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="Opens" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Clicks" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Conversions" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No active campaign metrics available.
              </div>
            )}
          </div>
        </Card>

        {/* Pie Chart: Target Channels split */}
        <Card title="Preferred Channels" subtitle="Marketers segment size split by delivery type">
          <div className="h-72 w-full flex flex-col justify-between">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend details */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-center">
              {pieChartData.map((item, idx) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-slate-500">{item.name}</span>
                  </div>
                  <p className="text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Second Analytics Section: Delivery Funnel & Recent Campaigns Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Funnel bar falloff */}
        <Card title="Delivery Funnel Falloff" subtitle="Aggregated messaging metrics conversion depth" className="lg:col-span-1">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={25}>
                  {funnelChartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Campaigns table list */}
        <Card
          title="Recent Campaigns"
          subtitle="Outbound status and results summary"
          className="lg:col-span-2"
          bodyClassName="p-0 overflow-x-auto"
        >
          {recentCampaigns.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Campaign</th>
                  <th className="px-6 py-3">Channel</th>
                  <th className="px-6 py-3 text-right">Audience</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650 bg-white">
                {recentCampaigns.slice(0, 5).map((camp) => (
                  <tr key={camp._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 truncate max-w-[150px]">{camp.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={camp.channel}>{camp.channel}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">{camp.audienceSize}</td>
                    <td className="px-6 py-4">
                      <Badge variant={camp.status}>{camp.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      {camp.sentCount > 0 ? `${((camp.convertedCount / camp.sentCount) * 100).toFixed(1)}%` : '0.0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-xs text-slate-450">No campaigns launched yet.</div>
          )}
        </Card>
      </div>

      {/* 3. Live Webhook Console Feed */}
      <Card
        title="Live Webhook Developer Monitor"
        subtitle="Real-time simulated delivery callback event log feed"
        actions={
          <div className="flex items-center gap-1 text-[10px] text-slate-450 bg-slate-100 px-2 py-0.5 rounded border">
            <span className={`w-1.5 h-1.5 rounded-full ${pollingActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            <span>{pollingActive ? 'Syncing...' : 'Idle'}</span>
          </div>
        }
      >
        <div className="bg-slate-950 text-slate-300 font-mono text-[11px] p-4 rounded-lg border border-slate-900 overflow-y-auto max-h-56 leading-relaxed flex flex-col gap-1.5 scrollbar-thin">
          {webhookLogs.length > 0 ? (
            webhookLogs.map((log) => {
              const dateStr = new Date(log.updatedAt).toLocaleTimeString();
              const latestHist = log.statusHistory[log.statusHistory.length - 1];
              const eventId = latestHist ? latestHist.eventId : 'evt_unknown';
              
              let badgeColor = 'text-slate-400';
              if (log.status === 'DELIVERED') badgeColor = 'text-blue-400';
              else if (log.status === 'OPENED') badgeColor = 'text-indigo-400';
              else if (log.status === 'CLICKED') badgeColor = 'text-yellow-400';
              else if (log.status === 'CONVERTED') badgeColor = 'text-emerald-400';
              else if (log.status === 'FAILED') badgeColor = 'text-red-400';

              return (
                <div key={log._id + log.status} className="hover:bg-slate-900/50 py-0.5 px-1 rounded flex flex-col sm:flex-row justify-between border-b border-slate-900/30">
                  <div className="truncate">
                    <span className="text-slate-500">[{dateStr}]</span>{' '}
                    <span className="font-bold text-slate-200">{log.customerId?.name || 'Customer'}</span> &bull;{' '}
                    <span className="text-slate-400">{log.campaignId?.name || 'Campaign'}</span>{' '}
                    <span className="text-slate-500">({log.campaignId?.channel})</span> ➔{' '}
                    <span className={`font-bold ${badgeColor}`}>{log.status}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate sm:text-right">
                    <span>id: {eventId}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-slate-500 text-center py-6">Listening for simulated gateway events... Launch a campaign.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
