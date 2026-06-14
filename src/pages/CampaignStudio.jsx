import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function CampaignStudio() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  
  // Campaign Form State
  const [name, setName] = useState('');
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [channel, setChannel] = useState('Email');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [launching, setLaunching] = useState(false);
  const [campaignError, setCampaignError] = useState(null);

  // AI Copywriter State
  const [aiGoal, setAiGoal] = useState('');
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [copyError, setCopyError] = useState(null);

  useEffect(() => {
    // Load segments from localStorage
    try {
      const savedSegments = JSON.parse(localStorage.getItem('smartreach_segments') || '[]');
      setSegments(savedSegments);
      if (savedSegments.length > 0) {
        setSelectedSegmentId(savedSegments[0].id);
      }
    } catch (err) {
      console.error('Error loading segments:', err);
    }
  }, []);

  const handleGenerateCopy = async () => {
    if (!aiGoal.trim()) return;

    setGeneratingCopy(true);
    setCopyError(null);
    setAiResult(null);

    // Get current segment details
    const activeSegment = segments.find(s => s.id === selectedSegmentId);
    const segmentExplanation = activeSegment ? activeSegment.explanation : 'All customers';

    try {
      const res = await API.post('/campaigns/generate-copy', {
        segmentExplanation,
        goal: aiGoal.trim()
      });

      if (res.data.success) {
        setAiResult(res.data.data);
        // Automatically check if recommended channel is different
        if (res.data.data.recommendation?.channel) {
          setChannel(res.data.data.recommendation.channel);
        }
      } else {
        setCopyError('Failed to generate campaign copy');
      }
    } catch (err) {
      setCopyError(err.response?.data?.message || err.message || 'Error communicating with AI writer');
    } finally {
      setGeneratingCopy(false);
    }
  };

  const handleApplyTemplate = (type) => {
    if (!aiResult) return;
    const copy = aiResult.copy;

    if (type === 'Email') {
      setMessageTemplate(`Subject: ${copy.Email.subject}\n\n${copy.Email.body}`);
    } else {
      setMessageTemplate(copy[type]);
    }
    setChannel(type);
  };

  const handleLaunchCampaign = async (e) => {
    e.preventDefault();
    if (!name.trim() || !messageTemplate.trim() || !selectedSegmentId) {
      setCampaignError('Please complete all form fields before launching.');
      return;
    }

    setLaunching(true);
    setCampaignError(null);

    const activeSegment = segments.find(s => s.id === selectedSegmentId);
    if (!activeSegment) {
      setCampaignError('Selected segment is invalid.');
      setLaunching(false);
      return;
    }

    try {
      // 1. Create the campaign draft in backend
      const createRes = await API.post('/campaigns', {
        name: name.trim(),
        audienceFilter: activeSegment.filter,
        messageTemplate: messageTemplate.trim(),
        channel
      });

      if (createRes.data.success) {
        const campaignId = createRes.data.data._id;
        
        // 2. Launch the campaign (triggers segment selection + channel dispatch)
        const launchRes = await API.post(`/campaigns/${campaignId}/launch`);
        
        if (launchRes.data.success) {
          // Success! Redirect to analytics report for this campaign
          navigate(`/analytics?campaignId=${campaignId}`);
        } else {
          setCampaignError('Campaign created as draft, but launch execution failed.');
        }
      } else {
        setCampaignError('Failed to create campaign draft.');
      }
    } catch (err) {
      setCampaignError(err.response?.data?.message || err.message || 'Error processing campaign launch');
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white m-0">Campaign Studio</h1>
        <p className="text-slate-400 mt-1">Design copy, select target segments, and launch automated communications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Panel */}
        <div className="lg:col-span-2 glass-card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white m-0">Campaign Setup</h2>
          
          {campaignError && (
            <div className="p-4 bg-red-950/20 border border-red-800/40 rounded-lg text-brand-red text-xs">
              {campaignError}
            </div>
          )}

          <form onSubmit={handleLaunchCampaign} className="space-y-5">
            {/* Campaign Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Campaign Name</label>
              <input
                type="text"
                placeholder="e.g. June Retention Offer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Target Audience Segment Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Segment</label>
              {segments.length === 0 ? (
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-400">
                  No segments saved. Create an audience segment inside the{' '}
                  <a href="#/audience-builder" className="text-emerald-400 underline">Audience Builder</a> first.
                </div>
              ) : (
                <select
                  value={selectedSegmentId}
                  onChange={(e) => setSelectedSegmentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
                >
                  {segments.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.count} shoppers matched)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Delivery Channel</label>
              <div className="grid grid-cols-4 gap-2">
                {['WhatsApp', 'SMS', 'Email', 'RCS'].map((chan) => (
                  <button
                    key={chan}
                    type="button"
                    onClick={() => setChannel(chan)}
                    className={`py-2 rounded-lg border text-xs font-semibold transition ${
                      channel === chan
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'border-slate-750 bg-slate-850 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {chan}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Template Textarea */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Message Copy Template
                </label>
                <div className="text-[10px] text-slate-500 flex space-x-2">
                  <span>Tokens: [Name], [City], [TotalSpend], [LastOrderDate]</span>
                </div>
              </div>
              <textarea
                rows="6"
                placeholder="Hi [Name]! Enjoy 20% off on your next purchase. Use code OFF20 at cart. Shop now: sreach.ai/cart"
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono leading-relaxed"
                required
              />
            </div>

            {/* Launch Action */}
            <div className="pt-4 border-t border-slate-750 flex justify-end">
              <button
                type="submit"
                disabled={launching || segments.length === 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold disabled:opacity-40 transition flex items-center justify-center shadow-md hover:shadow-lg shadow-emerald-950/40"
              >
                {launching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-t-transparent mr-2"></div>
                    Executing Simulation...
                  </>
                ) : 'Launch Campaign'}
              </button>
            </div>
          </form>
        </div>

        {/* Right AI Copywriter Pane */}
        <div className="glass-card p-6 space-y-5 h-fit">
          <div>
            <h2 className="text-lg font-semibold text-white m-0">AI Copywriter</h2>
            <p className="text-xs text-slate-400 mt-1">Generate personalized messages optimized by channel recommendation.</p>
          </div>

          {/* AI goal input */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Campaign Offer/Goal</label>
            <input
              type="text"
              placeholder="e.g. Win back inactive users with Rs. 500 off"
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleGenerateCopy}
              disabled={generatingCopy || !aiGoal.trim() || segments.length === 0}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold disabled:opacity-40 transition"
            >
              {generatingCopy ? 'Generating Templates...' : 'Generate Copy Templates'}
            </button>
          </div>

          {copyError && (
            <div className="p-3 bg-red-950/20 border border-red-800/40 rounded text-brand-red text-[11px]">
              {copyError}
            </div>
          )}

          {/* AI Result Options */}
          {aiResult && (
            <div className="space-y-4 pt-4 border-t border-slate-700/50">
              {/* Channel recommendation rationale */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-1">
                <p className="text-xs font-bold text-blue-400">
                  Recommended: {aiResult.recommendation?.channel}
                </p>
                <p className="text-[11px] text-slate-300 leading-normal">
                  {aiResult.recommendation?.reason}
                </p>
              </div>

              {/* Individual copy options */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outbox Copy Drafts</p>
                
                {/* WhatsApp */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-400">WhatsApp Copy</span>
                    <button
                      onClick={() => handleApplyTemplate('WhatsApp')}
                      className="text-[10px] text-slate-400 underline hover:text-white transition"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{aiResult.copy.WhatsApp}</p>
                </div>

                {/* SMS */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-yellow-400">SMS Copy</span>
                    <button
                      onClick={() => handleApplyTemplate('SMS')}
                      className="text-[10px] text-slate-400 underline hover:text-white transition"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{aiResult.copy.SMS}</p>
                </div>

                {/* Email */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-blue-400">Email Copy</span>
                    <button
                      onClick={() => handleApplyTemplate('Email')}
                      className="text-[10px] text-slate-400 underline hover:text-white transition"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 font-bold font-mono">Subj: {aiResult.copy.Email.subject}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 leading-relaxed whitespace-pre-wrap">{aiResult.copy.Email.body}</p>
                </div>

                {/* RCS */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-purple-400">RCS Copy</span>
                    <button
                      onClick={() => handleApplyTemplate('RCS')}
                      className="text-[10px] text-slate-400 underline hover:text-white transition"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{aiResult.copy.RCS}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
