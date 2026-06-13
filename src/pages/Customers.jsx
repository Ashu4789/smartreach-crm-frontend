import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [channel, setChannel] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState('customers'); // 'customers' or 'orders'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/customers', {
        params: { search, city, channel, page, limit: 12 }
      });
      if (res.data.success) {
        setCustomers(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalCustomers(res.data.pagination.totalCustomers);
      } else {
        setError('Failed to fetch customers');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading shopper profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, city, channel, page]);

  // Handle file select
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadResult(null);
  };

  // Handle file upload submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await API.post(`/customers/upload?type=${uploadType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadResult({
        success: true,
        message: res.data.message,
        summary: res.data.summary
      });
      setSelectedFile(null);
      // Refresh list
      fetchCustomers();
    } catch (err) {
      setUploadResult({
        success: false,
        message: err.response?.data?.message || 'File upload failed. Ensure the format matches CSV requirements.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white m-0">Customers</h1>
          <p className="text-slate-400 mt-1">Manage and sync shopper profiles and order analytics.</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setUploadResult(null);
          }}
          className="mt-4 sm:mt-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-md hover:shadow-lg shadow-emerald-950/40"
        >
          Import Data (CSV)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/40 p-4 border border-slate-700/30 rounded-xl">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search</label>
          <input
            type="text"
            placeholder="Search by name, email, tag..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
          <input
            type="text"
            placeholder="e.g. Mumbai, Delhi"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        {/* Preferred Channel */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Preferred Channel</label>
          <select
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
          >
            <option value="">All Channels</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="SMS">SMS</option>
            <option value="Email">Email</option>
            <option value="RCS">RCS</option>
          </select>
        </div>
      </div>

      {/* Customer List / Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="glass-card p-6 border-brand-red/30 text-brand-red text-center">
          <p>Failed to load customer profiles: {error}</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">
          <p className="text-base font-medium">No shopper profiles matched your queries.</p>
          <p className="text-xs text-slate-600 mt-2">Try widening filters or import raw customer CSVs.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/20 backdrop-blur-md">
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-800/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Preferred Channel</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Spend (Rupees)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Last Purchase</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-100">{cust.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      <p>{cust.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{cust.phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{cust.city || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        cust.preferredChannel === 'WhatsApp' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        cust.preferredChannel === 'SMS' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        cust.preferredChannel === 'Email' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {cust.preferredChannel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-100">
                      Rs. {cust.totalSpend ? cust.totalSpend.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString() : 'No Purchases'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-1">
                        {cust.tags && cust.tags.length > 0 ? (
                          cust.tags.map((tag, idx) => (
                            <span key={idx} className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-300">{(page - 1) * 12 + 1}</span> to{' '}
              <span className="font-semibold text-slate-300">{Math.min(page * 12, totalCustomers)}</span> of{' '}
              <span className="font-semibold text-slate-300">{totalCustomers}</span> customers
            </p>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-3 py-1.5 border border-slate-700 rounded bg-slate-800 text-sm text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-755 transition"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 border border-slate-700 rounded bg-slate-800 text-sm text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-755 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-750 max-w-md w-full rounded-xl shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-2">Import Data via CSV</h3>
            <p className="text-xs text-slate-400 mb-6">Select a file to sync customer profiles or append order logs.</p>
            
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {/* Upload Type Radio Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ingestion Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center p-3 rounded-lg border text-sm font-semibold cursor-pointer transition ${
                    uploadType === 'customers' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                      : 'border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="uploadType"
                      value="customers"
                      checked={uploadType === 'customers'}
                      onChange={() => setUploadType('customers')}
                      className="sr-only"
                    />
                    Shopper Profiles
                  </label>
                  <label className={`flex items-center justify-center p-3 rounded-lg border text-sm font-semibold cursor-pointer transition ${
                    uploadType === 'orders' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                      : 'border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="uploadType"
                      value="orders"
                      checked={uploadType === 'orders'}
                      onChange={() => setUploadType('orders')}
                      className="sr-only"
                    />
                    Order Records
                  </label>
                </div>
              </div>

              {/* File Select */}
              <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-slate-500 transition cursor-pointer relative bg-slate-900/40">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  required
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    {selectedFile ? selectedFile.name : 'Click or Drag CSV here'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'CSV files up to 5MB'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 text-sm hover:text-slate-250 transition"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  {uploading ? 'Processing File...' : 'Upload & Sync'}
                </button>
              </div>
            </form>

            {/* Results feedback log inside modal */}
            {uploadResult && (
              <div className="mt-6 p-4 rounded-lg text-xs leading-relaxed bg-slate-900 border border-slate-700 overflow-y-auto max-h-[160px]">
                {uploadResult.success ? (
                  <div className="text-emerald-400 space-y-1">
                    <p className="font-bold">{uploadResult.message}</p>
                    <p>Total Parsed: {uploadResult.summary.totalParsed}</p>
                    <p>Successful: {uploadResult.summary.successCount}</p>
                    <p>Failed (Skipped): {uploadResult.summary.failedCount}</p>
                    {uploadResult.summary.errors.length > 0 && (
                      <div className="text-red-400 mt-2">
                        <p className="font-semibold underline">First few parsing warnings:</p>
                        {uploadResult.summary.errors.map((err, i) => (
                          <p key={i}>&bull; Reason: {err.reason}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-400 font-semibold">
                    <p>{uploadResult.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
