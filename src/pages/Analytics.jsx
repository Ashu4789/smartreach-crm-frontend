import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../services/api';

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const campaignUrlId = searchParams.get('campaignId') || '';

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  
  // Detailed Campaign Metrics
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  // AI Insights State
  const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);

  // Fetch all campaigns list
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await API.get('/campaigns');
        if (res.data.success && res.data.data.length > 0) {
          setCampaigns(res.data.data);
          
          // Select either URL campaign or the first one in list
          if (campaignUrlId) {
            setSelectedCampaignId(campaignUrlId);
          } else {
            setSelectedCampaignId(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching campaigns list:', err);
      }
    };
    fetchCampaigns();
  }, [campaignUrlId]);

  // Fetch campaign details when ID changes
  useEffect(() => {
    if (!selectedCampaignId) return;

    const fetchDetails = async () => {
      setMetricsLoading(true);
      setMetricsError(null);
      setCampaignDetails(null);
      setAiInsights(null); // Reset insights on campaign switch

      try {
        const res = await API.get(`/analytics/campaigns/${selectedCampaignId}`);
        if (res.data.success) {
          setCampaignDetails(res.data.data);
        } else {
          setMetricsError('Failed to load campaign analytics');
        }
      } catch (err) {
        setMetricsError(err.message || 'Error loading campaign details');
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchDetails();
  }, [selectedCampaignId]);

  // Trigger AI insights generation
  const handleGenerateInsights = async () => {
    if (!selectedCampaignId) return;

    setInsightsLoading(true);
    setInsightsError(null);
    setAiInsights(null);

    try {
      const res = await API.get(`/analytics/campaigns/${selectedCampaignId}/insights`);
      if (res.data.success) {
        setAiInsights(res.data.data);
      } else {
        setInsightsError('Failed to generate AI insights');
      }
    } catch (err) {
      setInsightsError(err.response?.data?.message || err.message || 'Error communicating with AI analyst');
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white m-0">Analytics</h1>
          <p className="text-slate-400 mt-1">Review specific campaign funnel conversion depths and read AI performance audits.</p>
        </div>
        
        {/* Campaign Selector */}
        {campaigns.length > 0 && (
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <label className="text-xs text-slate-400 uppercase font-semibold whitespace-nowrap">Select Campaign:</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm font-semibold cursor-pointer max-w-xs"
            >
              {campaigns.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.channel})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 min-h-[40vh] flex flex-col items-center justify-center">
          <p className="text-sm font-semibold">No campaigns logged.</p>
          <p className="text-xs text-slate-650 mt-1">Go to the Campaign Studio and launch your first outbound campaign!</p>
        </div>
      ) : metricsLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : metricsError ? (
        <div className="glass-card p-6 border-brand-red/30 text-brand-red text-center">
          <p>Failed to load analytics: {metricsError}</p>
        </div>
      ) : !campaignDetails ? (
        <div className="text-slate-500 text-center py-12">No data loaded.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Stats and Funnel Chart */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Campaign Summary Meta */}
            <div className="glass-card p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Campaign</p>
                <p className="text-base font-bold text-white mt-1">{campaignDetails.campaign.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Channel</p>
                <p className="text-base font-bold text-emerald-400 mt-1">{campaignDetails.campaign.channel}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Audience Size</p>
                <p className="text-base font-bold text-white mt-1">{campaignDetails.campaign.audienceSize}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Launch Status</p>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mt-1.5 ${
                  campaignDetails.campaign.status === 'SENT' ? 'bg-indigo-500/20 text-indigo-300' :
                  campaignDetails.campaign.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                  'bg-slate-500/20 text-slate-300'
                }`}>
                  {campaignDetails.campaign.status}
                </span>
              </div>
            </div>

            {/* Funnel Progress List */}
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white m-0">Conversion Funnel Analysis</h2>
              
              <div className="space-y-4">
                {campaignDetails.funnel.map((step, idx) => {
                  const maxVal = campaignDetails.funnel[0].value || 1;
                  const percentOfTotal = ((step.value / maxVal) * 100).toFixed(1);
                  
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-300">{step.name}</span>
                        <div className="space-x-3 text-slate-400">
                          <span>Count: <strong className="text-white">{step.value}</strong></span>
                          <span>Depth: <strong className="text-emerald-400">{percentOfTotal}%</strong></span>
                        </div>
                      </div>
                      
                      {/* Funnel Progress Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-3.5 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            step.name === 'Sent' ? 'bg-slate-500' :
                            step.name === 'Delivered' ? 'bg-blue-600' :
                            step.name === 'Opened' ? 'bg-indigo-500' :
                            step.name === 'Clicked' ? 'bg-yellow-500' :
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${percentOfTotal}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recharts Funnel visualization */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white m-0">Funnel Falloff Visualization</h2>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignDetails.funnel} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
                      labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Right Panel: AI Analytics Insights */}
          <div className="glass-card p-6 space-y-5 h-fit flex flex-col">
            <div>
              <h2 className="text-lg font-semibold text-white m-0">AI Performance Review</h2>
              <p className="text-xs text-slate-400 mt-1">Audit campaign funnel conversions with Gemini intelligence.</p>
            </div>

            {!aiInsights && !insightsLoading && (
              <div className="space-y-4 py-6 text-center">
                <p className="text-xs text-slate-500">Insights are compiled dynamically from current webhook delivery reports.</p>
                <button
                  onClick={handleGenerateInsights}
                  className="w-full py-2 bg-blue-650 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
                >
                  Generate AI Report Card
                </button>
              </div>
            )}

            {insightsLoading && (
              <div className="py-12 text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="text-xs text-slate-500">Gemini is auditing conversion drop-offs...</p>
              </div>
            )}

            {insightsError && (
              <div className="p-3 bg-red-950/20 border border-red-800/40 rounded text-brand-red text-xs">
                {insightsError}
              </div>
            )}

            {aiInsights && (
              <div className="space-y-5">
                {/* Performance rating badge */}
                <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-xs text-slate-450 font-semibold uppercase">Audit Rating:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    aiInsights.performanceRating === 'High Performing' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    aiInsights.performanceRating === 'Healthy' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    aiInsights.performanceRating === 'Needs Optimization' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/10 text-red-450 border border-red-500/20'
                  }`}>
                    {aiInsights.performanceRating}
                  </span>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Executive Summary</h4>
                  <p className="text-xs text-slate-350 leading-relaxed bg-slate-900/40 p-3 rounded border border-slate-800/50">
                    {aiInsights.summary}
                  </p>
                </div>

                {/* Insights bullets */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Funnel Breakdown Insights</h4>
                  <ul className="text-xs text-slate-400 space-y-2 list-none pl-0">
                    {aiInsights.insights.map((ins, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-emerald-500 mr-2 font-bold">&bull;</span>
                        <span className="leading-relaxed">{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations bullets */}
                <div className="space-y-2 pt-2 border-t border-slate-850">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Growth Recommendations</h4>
                  <ul className="text-xs text-slate-400 space-y-2 list-none pl-0">
                    {aiInsights.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2 font-bold">&bull;</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
