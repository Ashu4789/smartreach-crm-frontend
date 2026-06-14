import React, { useState } from 'react';
import {
  Sparkles,
  Terminal,
  Users,
  Compass,
  Bookmark,
  CheckCircle,
  HelpCircle,
  Database
} from 'lucide-react';
import API from '../services/api';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Input from '../components/UI/Input';
import Table from '../components/UI/Table';
import { useToast } from '../context/ToastContext';

export default function AudienceBuilder() {
  const { addToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [translating, setTranslating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Save segment state
  const [segmentName, setSegmentName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setTranslating(true);
    setError(null);
    setResult(null);
    setSaveSuccess(false);
    setSegmentName('');

    try {
      const res = await API.post('/customers/segment-ai', { prompt });
      if (res.data.success) {
        setResult(res.data);
        addToast('AI Segment Query generated successfully!', 'success');
      } else {
        setError('Failed to translate query');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'An error occurred during query generation';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setTranslating(false);
    }
  };

  const handleSaveSegment = () => {
    if (!segmentName.trim() || !result) return;

    try {
      const savedSegments = JSON.parse(localStorage.getItem('smartreach_segments') || '[]');
      
      const newSegment = {
        id: `seg_${Date.now()}`,
        name: segmentName.trim(),
        filter: result.filter,
        explanation: result.explanation,
        count: result.count,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('smartreach_segments', JSON.stringify([...savedSegments, newSegment]));
      setSaveSuccess(true);
      addToast(`Cohort segment "${segmentName}" saved to workspace!`, 'success');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving segment to localStorage:', err);
      addToast('Failed to save segment', 'error');
    }
  };

  // Preview table headers
  const previewHeaders = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City' },
    { 
      key: 'totalSpend', 
      label: 'Spend', 
      align: 'right', 
      render: (row) => <span>Rs. {row.totalSpend ? row.totalSpend.toLocaleString('en-IN') : '0'}</span> 
    },
    { 
      key: 'lastOrderDate', 
      label: 'Last Order', 
      render: (row) => <span>{row.lastOrderDate ? new Date(row.lastOrderDate).toLocaleDateString() : 'No Purchases'}</span> 
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Audience Builder</h1>
          <p className="text-xs text-slate-500 mt-1">Carve out precise customer segments using natural language prompts.</p>
        </div>
        {/* Powered by Gemini AI chip */}
        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-1.5 rounded-lg w-fit">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
          <span className="font-semibold">Powered by Gemini 1.5 Flash</span>
        </div>
      </div>

      {/* Segment Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Ask AI Prompt Form */}
        <div className="space-y-6 lg:col-span-1">
          <Card title="Query Architect" subtitle="Describe your target shopper cohort parameters">
            <form onSubmit={handleTranslate} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Marketer Prompt Input</label>
                <textarea
                  rows="4"
                  placeholder="Find customers who spent more than 5000 and haven't purchased in 45 days..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs leading-relaxed font-semibold transition"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={translating || !prompt.trim()}
                loading={translating}
                className="w-full flex items-center justify-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Compile Segment</span>
              </Button>
            </form>

            {/* Quick Templates Examples */}
            <div className="pt-5 mt-5 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Compass className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Example Templates</span>
              </div>
              <div className="space-y-2">
                {[
                  "Find VIP customers who spent more than 5000",
                  "Shoppers who live in Mumbai",
                  "Find customers who haven't ordered in 45 days"
                ].map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(ex)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-50 text-xs text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/50 hover:text-slate-900 transition font-semibold"
                  >
                    &bull; "{ex}"
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Translation Details, Queries, Table Previews */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs leading-relaxed flex items-start gap-2.5 animate-slide-in">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-1.5"></span>
              <div>
                <p className="font-bold">AI Query Translation Failure</p>
                <p className="text-slate-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Placeholder state when empty */}
          {!result && !translating && !error && (
            <div className="glass-card p-12 text-center text-slate-400 min-h-[42vh] flex flex-col items-center justify-center">
              <Terminal className="h-8 w-8 text-slate-300 mb-4" />
              <h3 className="text-sm font-semibold text-slate-950">Segment Compiler Console</h3>
              <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto leading-normal">
                Submit a cohort query on the left console to compile a Mongoose selector filter and view your matching shopper preview list.
              </p>
            </div>
          )}

          {/* Loading state animation */}
          {translating && (
            <div className="glass-card p-12 text-center text-slate-400 min-h-[42vh] flex flex-col items-center justify-center space-y-4 animate-pulse">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Gemini LLM Processing...</h3>
                <p className="text-xs text-slate-450 mt-1">Generating MongoDB filters and running aggregate preview lookups...</p>
              </div>
            </div>
          )}

          {/* Segment Outcomes */}
          {result && (
            <div className="space-y-6 animate-slide-in">
              {/* Cohort Meta statistics Card */}
              <Card title="Cohort Analysis" subtitle="Review size metrics and save the rules config">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <span className="inline-flex text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Query Compiled
                    </span>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                      {result.explanation}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Users className="h-3.5 w-3.5 text-slate-450" />
                      <span>Cohort Size: <strong className="text-emerald-700 font-bold">{result.count}</strong> matches.</span>
                    </div>
                  </div>

                  <div className="space-y-2 md:border-l md:border-slate-100 md:pl-6 flex flex-col justify-end">
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Save Cohort Segment</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Inactive Spenders"
                        value={segmentName}
                        onChange={(e) => setSegmentName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-semibold"
                      />
                      <Button
                        onClick={handleSaveSegment}
                        disabled={!segmentName.trim() || saveSuccess}
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        {saveSuccess ? 'Saved ✓' : 'Save Cohort'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* JSON code block filter details */}
              <Card
                title="Mongoose Query Selectors"
                subtitle="Compiled raw JSON query structure generated by Gemini"
                actions={
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Database className="h-3.5 w-3.5" />
                    <span>MongoDB Atlas</span>
                  </div>
                }
              >
                <pre className="bg-slate-950 p-4 rounded-lg text-xs text-slate-350 font-mono overflow-x-auto leading-relaxed border border-slate-900 scrollbar-thin">
                  {JSON.stringify(result.filter, null, 2)}
                </pre>
              </Card>

              {/* Customer preview table lists */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-sm font-semibold text-slate-900">Cohort Customer Preview (Capped at 50)</h4>
                  <span className="text-xs text-slate-400">{result.preview.length} of {result.count} displayed</span>
                </div>
                <Table
                  headers={previewHeaders}
                  data={result.preview}
                  loading={false}
                  emptyMessage="No shoppers match this generated filter."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
