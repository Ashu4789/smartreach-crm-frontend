import React, { useState } from 'react';
import API from '../services/api';

export default function AudienceBuilder() {
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
      } else {
        setError('Failed to translate query');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during query generation');
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
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving segment to localStorage:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white m-0">Audience Builder</h1>
        <p className="text-slate-400 mt-1">Define marketing segments by converting natural language into intelligent database queries using AI.</p>
      </div>

      {/* Main Builder Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Input Pane */}
        <div className="glass-card p-6 space-y-6 lg:col-span-1 h-fit">
          <form onSubmit={handleTranslate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Ask AI Segmenter
              </label>
              <textarea
                rows="4"
                placeholder="Find customers who spent more than 5000 rupees but haven't purchased in 45 days..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm leading-relaxed"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={translating || !prompt.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold disabled:opacity-40 transition flex items-center justify-center"
            >
              {translating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-t-transparent mr-2"></div>
                  Generating Query...
                </>
              ) : 'Translate & Run Filter'}
            </button>
          </form>

          {/* Quick Examples */}
          <div className="pt-4 border-t border-slate-700/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Try Examples</p>
            <div className="space-y-2">
              {[
                "Find VIP customers who spent more than 5000",
                "Shoppers who live in Mumbai",
                "Find customers who haven't ordered in 45 days"
              ].map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(ex)}
                  className="w-full text-left p-2 rounded bg-slate-900/40 text-xs text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                >
                  &bull; "{ex}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Preview Pane */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-red-950/20 border border-red-800/40 rounded-xl text-brand-red text-sm">
              <p className="font-semibold">AI segmentation translation failed:</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}

          {!result && !translating && !error && (
            <div className="glass-card p-12 text-center text-slate-500 min-h-[40vh] flex flex-col items-center justify-center">
              <svg className="h-12 w-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
              </svg>
              <p className="text-sm font-semibold">Ready to filter.</p>
              <p className="text-xs text-slate-650 mt-1">Enter a natural language request on the left pane to build your segment.</p>
            </div>
          )}

          {translating && (
            <div className="glass-card p-12 text-center text-slate-500 min-h-[40vh] flex flex-col items-center justify-center animate-pulse">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-sm font-semibold">Gemini is translating your marketing requirements...</p>
              <p className="text-xs text-slate-600 mt-1">Constructing MongoDB filter and calculating date periods.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Query Meta & Save */}
              <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    AI Translation Result
                  </span>
                  <p className="text-sm font-semibold text-slate-100">{result.explanation}</p>
                  <p className="text-xs text-slate-400">
                    Segment Size: <span className="font-semibold text-emerald-400">{result.count}</span> shoppers matched.
                  </p>
                </div>

                <div className="space-y-3 md:border-l md:border-slate-700/50 md:pl-6 flex flex-col justify-end">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Save this cohort</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. Inactive Spenders"
                      value={segmentName}
                      onChange={(e) => setSegmentName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSaveSegment}
                      disabled={!segmentName.trim() || saveSuccess}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold disabled:opacity-40 transition whitespace-nowrap"
                    >
                      {saveSuccess ? 'Saved! ✓' : 'Save Cohort'}
                    </button>
                  </div>
                </div>
              </div>

              {/* JSON Query Code Block */}
              <div className="glass-card p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Generated MongoDB Query Filter</p>
                <pre className="bg-slate-950 p-3 rounded-lg text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed border border-slate-800">
                  {JSON.stringify(result.filter, null, 2)}
                </pre>
              </div>

              {/* Matching Customers Table Preview */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-white">Cohort Customer Preview (Capped at 50)</p>
                  <p className="text-xs text-slate-400">{result.preview.length} of {result.count} displayed</p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-700/30">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-850">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">City</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Spend</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Last Order</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
                      {result.preview.map((cust) => (
                        <tr key={cust._id}>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-semibold text-slate-100">{cust.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-slate-400">{cust.email}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-slate-300">{cust.city || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium text-slate-100">
                            Rs. {cust.totalSpend ? cust.totalSpend.toLocaleString('en-IN') : '0'}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-slate-400">
                            {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString() : 'No Purchases'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
