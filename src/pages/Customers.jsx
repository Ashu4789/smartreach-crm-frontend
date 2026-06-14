import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Upload,
  Download,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import API from '../services/api';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import Input from '../components/UI/Input';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { useToast } from '../context/ToastContext';

export default function Customers() {
  const { addToast } = useToast();
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

  // Ingestion Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState('customers'); // 'customers' or 'orders'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/customers', {
        params: { search, city, channel, page, limit: 10 }
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadResult(null);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await API.post(`/customers/upload?type=${uploadType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadResult({
        success: true,
        message: res.data.message,
        summary: res.data.summary
      });
      setSelectedFile(null);
      addToast(`${uploadType === 'customers' ? 'Shopper profiles' : 'Orders'} uploaded successfully!`, 'success');
      fetchCustomers();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'File upload failed. Ensure the format matches CSV requirements.';
      setUploadResult({
        success: false,
        message: errMsg
      });
      addToast(errMsg, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Generate and download client-side CSV template file
  const downloadCSVTemplate = (type) => {
    let csvContent = '';
    let filename = '';
    
    if (type === 'customers') {
      csvContent = 'name,email,phone,city,preferredChannel,tags\nJohn Doe,john.doe@example.com,+919988776655,Mumbai,WhatsApp,vip,regular\nJane Smith,jane.smith@example.com,+918877665544,Delhi,Email,new,coupon-hunter';
      filename = 'shoppers_template.csv';
    } else {
      csvContent = 'email,amount,category,date\njohn.doe@example.com,4999.00,Fashion,2026-06-01\njane.smith@example.com,1250.50,Grocery,2026-06-05';
      filename = 'orders_template.csv';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Downloaded ${filename} template`, 'info');
  };

  // Define Table Headers
  const tableHeaders = [
    {
      key: 'name',
      label: 'Shopper Name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.name}</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{row._id}</span>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact Info',
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="text-slate-650 font-medium">{row.email}</span>
          <span className="text-slate-400 mt-0.5">{row.phone || '-'}</span>
        </div>
      )
    },
    {
      key: 'city',
      label: 'Location',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <MapPin className="h-3 w-3 text-slate-400" />
          <span>{row.city || 'Unknown'}</span>
        </div>
      )
    },
    {
      key: 'preferredChannel',
      label: 'Channel Preferance',
      render: (row) => <Badge variant={row.preferredChannel}>{row.preferredChannel}</Badge>
    },
    {
      key: 'totalSpend',
      label: 'Total Spend',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-slate-900">
          Rs. {row.totalSpend ? row.totalSpend.toLocaleString('en-IN') : '0'}
        </span>
      )
    },
    {
      key: 'lastOrderDate',
      label: 'Last Purchase Date',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3 w-3 text-slate-400" />
          <span>{row.lastOrderDate ? new Date(row.lastOrderDate).toLocaleDateString() : 'No orders'}</span>
        </div>
      )
    },
    {
      key: 'tags',
      label: 'Cohorts',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags && row.tags.length > 0 ? (
            row.tags.map((tag, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded border border-slate-200/50">
                {tag}
              </span>
            ))
          ) : (
            <span className="text-slate-300 text-xs">-</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">Shopper Database</h1>
          <p className="text-xs text-slate-500 mt-1">Ingest, search, filter, and audit customer lifetime spend details.</p>
        </div>
        <Button
          onClick={() => {
            setIsModalOpen(true);
            setUploadResult(null);
          }}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          <span>Import CSV Data</span>
        </Button>
      </div>

      {/* Filter Toolbar Card */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, tags..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
            />
          </div>

          {/* City Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by city (e.g. Mumbai)"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 text-xs font-semibold"
            />
          </div>

          {/* Preferred Channel */}
          <div>
            <select
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-650 focus:outline-none focus:border-emerald-600 text-xs font-semibold cursor-pointer"
            >
              <option value="">All Channels</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="SMS">SMS</option>
              <option value="Email">Email</option>
              <option value="RCS">RCS</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table view */}
      {error ? (
        <Card title="Query Error" className="border-red-200 text-center">
          <p className="text-sm text-red-650">{error}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Table
            headers={tableHeaders}
            data={customers}
            loading={loading}
            emptyMessage="No shopper records matched your parameters."
            emptySubtitle="Adjust filters or upload a fresh customers list."
          />

          {/* Pagination Controls */}
          {!loading && customers.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <p className="text-xs text-slate-450">
                Displaying <span className="font-semibold text-slate-800">{(page - 1) * 10 + 1}</span> to{' '}
                <span className="font-semibold text-slate-800">{Math.min(page * 10, totalCustomers)}</span> of{' '}
                <span className="font-semibold text-slate-800">{totalCustomers}</span> total shoppers
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </Button>
                <span className="text-xs font-bold text-slate-600 px-2">
                  Page {page} of {totalPages || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ingestion Dialog modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sync Customer Database"
        subtitle="Import CSV logs to upload shopper profiles or relational order histories"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {/* Ingestion Profile Type selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">CSV Data Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setUploadType('customers');
                  setSelectedFile(null);
                  setUploadResult(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                  uploadType === 'customers'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                }`}
              >
                <UsersIcon className="h-4 w-4 mb-1" />
                <span>Shopper Profiles</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadType('orders');
                  setSelectedFile(null);
                  setUploadResult(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                  uploadType === 'orders'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 mb-1" />
                <span>Order Records</span>
              </button>
            </div>
          </div>

          {/* Download Template Buttons */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-800">Need a format guide?</p>
              <p className="text-[10px] text-slate-450">Get our clean mock template:</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadCSVTemplate(uploadType)}
              className="flex items-center gap-1.5"
            >
              <Download className="h-3 w-3" />
              <span>Download Template</span>
            </Button>
          </div>

          {/* Drag & Drop File Area */}
          <div className="border border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-lg p-6 text-center transition cursor-pointer relative bg-white">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              required
            />
            <div className="space-y-1">
              <Upload className="mx-auto h-6 w-6 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : 'Select or drag CSV file'}
              </p>
              <p className="text-[10px] text-slate-400">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'CSV spreadsheet up to 5MB'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="secondary" disabled={uploading || !selectedFile} loading={uploading}>
              Import File
            </Button>
          </div>
        </form>

        {/* Action Results Log inside modal */}
        {uploadResult && (
          <div className="mt-4 p-4 rounded-lg text-xs leading-relaxed bg-slate-900 text-slate-300 font-mono overflow-y-auto max-h-[140px] border border-slate-800">
            {uploadResult.success ? (
              <div className="text-emerald-450 space-y-1">
                <p className="font-bold">{uploadResult.message}</p>
                <p>Total Parsed: {uploadResult.summary.totalParsed}</p>
                <p>Successful: {uploadResult.summary.successCount}</p>
                <p>Failed / Skipped: {uploadResult.summary.failedCount}</p>
                {uploadResult.summary.errors.length > 0 && (
                  <div className="text-red-400 mt-2">
                    <p className="font-semibold underline">Skipped details:</p>
                    {uploadResult.summary.errors.map((err, i) => (
                      <p key={i}>&bull; {err.reason}</p>
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
      </Modal>
    </div>
  );
}
