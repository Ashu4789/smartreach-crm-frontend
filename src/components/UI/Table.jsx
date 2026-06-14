import React from 'react';

export default function Table({
  headers = [], // Array of { key, label, align: 'left' | 'right' | 'center', className }
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  emptySubtitle = 'Try adding data or relaxing filter options.',
  className = '',
  ...props
}) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-slate-200/80 bg-white ${className}`}>
      <table className="min-w-full divide-y divide-slate-200" {...props}>
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                scope="col"
                className={`px-6 py-3 text-xs font-semibold text-slate-550 uppercase tracking-wider ${
                  header.align === 'right' ? 'text-right' :
                  header.align === 'center' ? 'text-center' : 'text-left'
                } ${header.className || ''}`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="divide-y divide-slate-200/60 bg-white">
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 5 }).map((_, rIdx) => (
              <tr key={rIdx} className="animate-pulse">
                {headers.map((header, hIdx) => (
                  <td key={hIdx} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-slate-100 rounded-sm w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            // Empty State
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center">
                <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">{emptyMessage}</h3>
                <p className="mt-1 text-xs text-slate-400">{emptySubtitle}</p>
              </td>
            </tr>
          ) : (
            // Data Rows
            data.map((row, rIdx) => (
              <tr key={row._id || rIdx} className="hover:bg-slate-50/50 transition-colors">
                {headers.map((header, hIdx) => (
                  <td
                    key={hIdx}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-slate-600 ${
                      header.align === 'right' ? 'text-right font-medium' :
                      header.align === 'center' ? 'text-center' : 'text-left'
                    } ${header.className || ''}`}
                  >
                    {row[header.key] !== undefined ? row[header.key] : (header.render ? header.render(row) : null)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
