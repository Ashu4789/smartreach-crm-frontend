import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  MessageSquare,
  MessageCircle,
  Smartphone,
  Send,
  HelpCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import API from '../services/api';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';
import { useToast } from '../context/ToastContext';

export default function CampaignStudio() {
  const navigate = useNavigate();
  const { addToast } = useToast();
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
  const [tone, setTone] = useState('Professional'); // Professional, Friendly, Urgent
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [copyError, setCopyError] = useState(null);

  // Launch Confirmation Modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
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

    const activeSegment = segments.find(s => s.id === selectedSegmentId);
    const segmentExplanation = activeSegment ? activeSegment.explanation : 'All customers';

    // Combine tone selector value into the campaign goal to direct Gemini
    const enrichedGoal = `[Tone: ${tone}] ${aiGoal.trim()}`;

    try {
      const res = await API.post('/campaigns/generate-copy', {
        segmentExplanation,
        goal: enrichedGoal
      });

      if (res.data.success) {
        setAiResult(res.data.data);
        if (res.data.data.recommendation?.channel) {
          setChannel(res.data.data.recommendation.channel);
        }
        addToast('AI Copies generated successfully!', 'success');
      } else {
        setCopyError('Failed to generate campaign copy');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error communicating with AI writer';
      setCopyError(errMsg);
      addToast(errMsg, 'error');
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
    addToast(`Applied ${type} copy template`, 'info');
  };

  const handleLaunchCampaign = async () => {
    setIsConfirmOpen(false);
    setLaunching(true);
    setCampaignError(null);

    const activeSegment = segments.find(s => s.id === selectedSegmentId);
    if (!activeSegment) {
      setCampaignError('Selected segment is invalid.');
      setLaunching(false);
      return;
    }

    try {
      // 1. Create campaign draft
      const createRes = await API.post('/campaigns', {
        name: name.trim(),
        audienceFilter: activeSegment.filter,
        messageTemplate: messageTemplate.trim(),
        channel
      });

      if (createRes.data.success) {
        const campaignId = createRes.data.data._id;
        
        // 2. Launch the campaign (sends payload to simulator)
        const launchRes = await API.post(`/campaigns/${campaignId}/launch`);
        
        if (launchRes.data.success) {
          addToast(`Campaign "${name}" launched successfully!`, 'success');
          navigate(`/analytics?campaignId=${campaignId}`);
        } else {
          setCampaignError('Campaign created as draft, but launch execution failed.');
        }
      } else {
        setCampaignError('Failed to create campaign draft.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error processing campaign launch';
      setCampaignError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLaunching(false);
    }
  };

  const activeSegment = segments.find(s => s.id === selectedSegmentId);

  const channelsData = [
    { id: 'Email', name: 'Email Messaging', icon: Mail, desc: 'Deliver newsletter digests directly to user inboxes.' },
    { id: 'WhatsApp', name: 'WhatsApp Web', icon: MessageCircle, desc: 'Highest read rate. Support conversational templates.' },
    { id: 'SMS', name: 'SMS Texting', icon: MessageSquare, desc: 'Direct carrier outreach. Character cap limits.' },
    { id: 'RCS', name: 'RCS Business', icon: Smartphone, desc: 'Rich communication features containing inline buttons.' }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Campaign Studio</h1>
        <p className="text-xs text-slate-500 mt-1">Design message copy, select target segments, and dispatch outbound communications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Campaign Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Outbox Setup" subtitle="Select target segments, channel type, and finalize copy template">
            {campaignError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs mb-5 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-650 shrink-0" />
                <span>{campaignError}</span>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); setIsConfirmOpen(true); }} className="space-y-6">
              
              {/* Campaign Name */}
              <Input
                label="Campaign Name"
                placeholder="e.g. Inactive Spenders Reactivation Offer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Target Segment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Segment</label>
                {segments.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                    No segments saved. Build and save a segment inside the{' '}
                    <a href="#/audience-builder" className="text-emerald-600 font-bold underline">Audience Builder</a> first.
                  </div>
                ) : (
                  <select
                    value={selectedSegmentId}
                    onChange={(e) => setSelectedSegmentId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-600 text-xs font-semibold cursor-pointer"
                  >
                    {segments.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.count} shoppers matched)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Channel Selection cards */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Outbound Channel</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {channelsData.map((chan) => {
                    const Icon = chan.icon;
                    const isSelected = channel === chan.id;
                    const isRecommended = aiResult?.recommendation?.channel === chan.id;

                    return (
                      <button
                        key={chan.id}
                        type="button"
                        onClick={() => setChannel(chan.id)}
                        className={`p-3 rounded-lg border text-left flex items-start gap-3 transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">{chan.name}</p>
                          <p className="text-[10px] text-slate-400 leading-normal">{chan.desc}</p>
                        </div>
                        {isRecommended && (
                          <span className="absolute top-2 right-2 inline-flex items-center text-[8px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 border border-blue-200 rounded-full">
                            Recommended
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Template textarea */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="block font-semibold text-slate-500 uppercase tracking-wider">Message Template Copy</label>
                  <span className="text-[10px] text-slate-400">Tokens: [Name], [City], [TotalSpend], [LastOrderDate]</span>
                </div>
                <textarea
                  rows="5"
                  placeholder="Hi [Name]! Enjoy 20% off on your next purchase. Use code OFF20 at checkout. Shop now: smartreach.ai"
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 text-xs font-mono leading-relaxed"
                  required
                />
              </div>

              {/* Launch Action */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  disabled={launching || segments.length === 0 || !messageTemplate.trim() || !name.trim()}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Launch Dispatch</span>
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Right Side: AI Copywriter Panel */}
        <div className="space-y-6">
          <Card title="AI Copy Assistant" subtitle="Generate personalized copy variations by tone">
            <div className="space-y-4">
              
              {/* Tone selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Message Tone</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Professional', 'Friendly', 'Urgent'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`py-1 border rounded text-[11px] font-semibold transition cursor-pointer ${
                        tone === t
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Goal */}
              <Input
                label="Offer details / Goal"
                placeholder="e.g. Win back inactive users with Rs. 500 off"
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
              />

              <Button
                onClick={handleGenerateCopy}
                disabled={generatingCopy || !aiGoal.trim() || segments.length === 0}
                loading={generatingCopy}
                variant="secondary"
                className="w-full flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate Outbox Copies</span>
              </Button>

              {copyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-[10px] leading-relaxed">
                  {copyError}
                </div>
              )}

              {/* Copy results variants */}
              {aiResult && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  {/* Channel recommendation */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs leading-normal">
                    <p className="font-bold text-blue-800 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Recommended: {aiResult.recommendation?.channel}</span>
                    </p>
                    <p className="text-slate-600 mt-1 text-[11px]">{aiResult.recommendation?.reason}</p>
                  </div>

                  {/* Channel Copy Variations */}
                  <div className="space-y-3">
                    {/* WhatsApp */}
                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-emerald-700">WhatsApp Copy</span>
                        <button type="button" onClick={() => handleApplyTemplate('WhatsApp')} className="text-slate-400 hover:text-slate-800 underline">
                          Apply
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-650 font-mono leading-relaxed whitespace-pre-wrap">{aiResult.copy.WhatsApp}</p>
                    </div>

                    {/* Email */}
                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-blue-700">Email Copy</span>
                        <button type="button" onClick={() => handleApplyTemplate('Email')} className="text-slate-400 hover:text-slate-800 underline">
                          Apply
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-800 font-semibold font-mono">Subj: {aiResult.copy.Email.subject}</p>
                      <p className="text-[10px] text-slate-500 font-mono leading-relaxed whitespace-pre-wrap mt-1">{aiResult.copy.Email.body}</p>
                    </div>

                    {/* SMS */}
                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-amber-700">SMS Copy</span>
                        <button type="button" onClick={() => handleApplyTemplate('SMS')} className="text-slate-400 hover:text-slate-800 underline">
                          Apply
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-650 font-mono leading-relaxed whitespace-pre-wrap">{aiResult.copy.SMS}</p>
                    </div>

                    {/* RCS */}
                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-purple-700">RCS Copy</span>
                        <button type="button" onClick={() => handleApplyTemplate('RCS')} className="text-slate-400 hover:text-slate-800 underline">
                          Apply
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-650 font-mono leading-relaxed whitespace-pre-wrap">{aiResult.copy.RCS}</p>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </Card>
        </div>

      </div>

      {/* Confirmation Dialog checkout */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Campaign Launch"
        subtitle="This triggers the simulated outbound gateway dispatch loop"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-2">
            <p className="text-slate-500">Campaign Name: <strong className="text-slate-800">{name}</strong></p>
            <p className="text-slate-500">Segment Cohort: <strong className="text-slate-800">{activeSegment?.name || 'All'}</strong></p>
            <p className="text-slate-500">Size: <strong className="text-emerald-700 font-bold">{activeSegment?.count || 0} customers</strong></p>
            <p className="text-slate-500">Outbound Channel: <strong className="text-blue-700">{channel}</strong></p>
          </div>
          
          <p className="text-[11px] text-slate-450 leading-relaxed">
            Upon confirmation, the CRM Backend will bulk-register communications and dispatch the payload to the simulated Event Simulator. You will be redirected to analytics conversion report.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleLaunchCampaign} className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              <span>Confirm & Dispatch</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
