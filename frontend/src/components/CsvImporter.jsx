import React, { useState } from 'react';
import { CloudUpload, CheckCircle, AlertCircle, FileSpreadsheet, Download, AlertTriangle } from 'lucide-react';

export default function CsvImporter({ onCompleted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  
  // Importer workflow states: 'upload', 'preview', 'success'
  const [importState, setImportState] = useState('upload');

  // Exact mockup rows for validation step (highlighting duplicates)
  const previewRows = [
    { first_name: 'Michael', last_name: 'Torres', email: 'michael@startupxyz.com', company: 'Startup XYZ', status: 'New', duplicate: false },
    { first_name: 'Anna', last_name: 'Schmidt', email: 'anna@techberlin.de', company: 'TechBerlin GmbH', status: 'New', duplicate: false },
    { first_name: 'Sarah', last_name: 'Chen', email: 'sarah@acmecorp.com', company: 'Acme Corp', status: 'Converted', duplicate: true },
    { first_name: 'Raj', last_name: 'Kumar', email: 'raj@innovate.in', company: 'Innovate.in', status: 'New', duplicate: false },
    { first_name: 'James', last_name: 'Okafor', email: 'james@novatech.io', company: 'NovaTech', status: 'Demo Scheduled', duplicate: true }
  ];

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportState('preview'); // Move directly to validation step
    }
  };

  const handleImportAction = async (skipDuplicates) => {
    setLoading(true);
    setError('');
    
    // Simulate ingest API call
    setTimeout(() => {
      setSummary({
        total_rows: 5,
        imported_count: skipDuplicates ? 3 : 5,
        duplicate_count: skipDuplicates ? 2 : 0,
        failed_count: 0
      });
      setImportState('success');
      setLoading(false);
      if (onCompleted) onCompleted();
    }, 1200);
  };

  const downloadTemplate = () => {
    const headers = 'first_name,last_name,company_name,job_title,email,phone,country\n';
    const sampleRow = 'Sarah,Chen,Acme Corp,VP Marketing,sarah@acmecorp.com,+1 415 555 0100,USA\n';
    const csvContent = 'data:text/csv;charset=utf-8,' + headers + sampleRow;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'leadflow_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6 animate-fade-in max-w-xl text-left">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base tracking-tight">Import Leads from CSV / Excel</h3>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Upload a file to bulk import leads. Duplicate emails will be detected automatically.
          </p>
        </div>
        {importState === 'upload' && (
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider transition-colors shrink-0"
          >
            <Download size={12} />
            <span>Template</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* WORKFLOW STATE 1: UPLOAD dragzone */}
      {importState === 'upload' && (
        <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative">
          <input type="file" accept=".csv" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
          <div className="text-center flex flex-col items-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-blue-600 mb-3">
              <CloudUpload size={22} />
            </div>
            <span className="block text-xs font-extrabold text-slate-700">Drag and drop your CSV or Excel file here</span>
            <span className="block text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              Supports .csv, .xlsx, .xls — max 10 MB
            </span>
          </div>
        </div>
      )}

      {/* WORKFLOW STATE 2: PREVIEW & VALIDATION TABLE */}
      {importState === 'preview' && (
        <div className="space-y-4 animate-fade-in">
          {/* Validation Warning Alert */}
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl text-xs text-amber-800 space-y-1">
            <div className="flex items-center gap-2 font-extrabold text-amber-900 uppercase">
              <AlertTriangle size={14} />
              <span>2 duplicate emails found</span>
            </div>
            <p className="font-semibold text-slate-500 mt-1">Rows highlighted in red already exist in your CRM. Choose an action below.</p>
          </div>

          {/* Validation Data Table */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-[11px] font-medium text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Company</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx} className={`border-b border-slate-50 last:border-0 ${row.duplicate ? 'bg-red-50 text-red-900' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-4 py-2.5 font-bold">{row.first_name} {row.last_name}</td>
                    <td className="px-4 py-2.5">
                      <span>{row.email}</span>
                      {row.duplicate && <span className="ml-1.5 inline-block text-[8px] uppercase tracking-wider font-black text-red-700 bg-red-100 border border-red-200 px-1 py-0.5 rounded">duplicate</span>}
                    </td>
                    <td className="px-4 py-2.5">{row.company}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-bold ${row.duplicate ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions Row */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
            <button 
              type="button" 
              onClick={() => { setFile(null); setImportState('upload'); }} 
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={() => handleImportAction(false)} 
              disabled={loading} 
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
            >
              Import All (5)
            </button>
            <button 
              type="button" 
              onClick={() => handleImportAction(true)} 
              disabled={loading} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/10 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Skip Duplicates (Import 3)'}
            </button>
          </div>
        </div>
      )}

      {/* WORKFLOW STATE 3: BATCH SUMMARY SUCCESS CARD */}
      {importState === 'success' && (
        <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Batch Ingest Complete</h4>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
              <span className="block font-black text-slate-700 text-lg">{summary.total_rows}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Total Rows</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
              <span className="block font-black text-emerald-600 text-lg">{summary.imported_count}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Imported</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
              <span className="block font-black text-amber-500 text-lg">{summary.duplicate_count}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Duplicates</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
              <span className="block font-black text-red-500 text-lg">{summary.failed_count}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Failed</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => { setFile(null); setSummary(null); setImportState('upload'); }} 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            Upload Another Database File
          </button>
        </div>
      )}
    </div>
  );
}