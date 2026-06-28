import React, { useRef, useState } from 'react';
import {
  Upload,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function CsvImporter({ onCompleted }) {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [previewRows, setPreviewRows] = useState([]);

  const normalizeHeader = (header) => {
    return String(header || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
  };

  const getValue = (row, keys) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null) {
        return String(row[key]).trim();
      }
    }

    return '';
  };

  const readFileRows = async (selectedFile) => {
    const extension = selectedFile.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
      const text = await selectedFile.text();
      const workbook = XLSX.read(text, { type: 'string' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet, { defval: '' });
    }

    const buffer = await selectedFile.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' });
  };

  const formatRows = (rawRows) => {
    return rawRows
      .map((raw, index) => {
        const normalized = {};

        Object.keys(raw).forEach((key) => {
          normalized[normalizeHeader(key)] = raw[key];
        });

        const firstName = getValue(normalized, ['first_name', 'firstname', 'first']);
        const lastName = getValue(normalized, ['last_name', 'lastname', 'last']);
        const email = getValue(normalized, ['email', 'email_address']);
        const company = getValue(normalized, ['company_name', 'company']);
        const jobTitle = getValue(normalized, ['job_title', 'title', 'position']);
        const phone = getValue(normalized, ['phone', 'phone_number', 'contact']);
        const website = getValue(normalized, ['website', 'site']);
        const country = getValue(normalized, ['country']);
        const status = getValue(normalized, ['status']) || 'New';

        return {
          id: index + 1,
          first_name: firstName,
          last_name: lastName,
          email,
          company_name: company,
          job_title: jobTitle,
          phone,
          website,
          country,
          status,
          duplicate: false,
          duplicateReason: '',
        };
      })
      .filter((row) => row.email || row.first_name || row.last_name || row.company_name);
  };

  const checkDuplicateEmail = async (email) => {
    if (!email) return false;

    const token = localStorage.getItem('lf_token');

    const res = await fetch(
      `http://localhost:5000/api/leads?search=${encodeURIComponent(email)}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    const leads = Array.isArray(data)
      ? data
      : Array.isArray(data.leads)
        ? data.leads
        : [];

    return leads.some(
      (lead) => String(lead.email || '').toLowerCase() === email.toLowerCase()
    );
  };

  const detectDuplicates = async (rows) => {
    const emailCounter = {};

    rows.forEach((row) => {
      const email = row.email.toLowerCase();

      if (!email) return;

      emailCounter[email] = (emailCounter[email] || 0) + 1;
    });

    const checkedRows = await Promise.all(
      rows.map(async (row) => {
        const email = row.email.toLowerCase();

        if (!email) {
          return {
            ...row,
            duplicate: true,
            duplicateReason: 'missing email',
          };
        }

        if (emailCounter[email] > 1) {
          return {
            ...row,
            duplicate: true,
            duplicateReason: 'duplicate in file',
          };
        }

        const existsInCRM = await checkDuplicateEmail(row.email);

        if (existsInCRM) {
          return {
            ...row,
            duplicate: true,
            duplicateReason: 'duplicate',
          };
        }

        return {
          ...row,
          duplicate: false,
          duplicateReason: '',
        };
      })
    );

    return checkedRows;
  };

  const handleFileSelect = async (selectedFile) => {
    setError('');
    setSummary(null);

    if (!selectedFile) return;

    const allowed = ['csv', 'xlsx', 'xls'];
    const extension = selectedFile.name.split('.').pop().toLowerCase();

    if (!allowed.includes(extension)) {
      setError('Only CSV or Excel files are allowed.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must not exceed 10 MB.');
      return;
    }

    setFile(selectedFile);
    setChecking(true);

    try {
      const rawRows = await readFileRows(selectedFile);
      const formattedRows = formatRows(rawRows);

      if (formattedRows.length === 0) {
        throw new Error('No valid rows found in the file.');
      }

      const rowsWithDuplicates = await detectDuplicates(formattedRows);

      setPreviewRows(rowsWithDuplicates);
      setView('preview');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to read uploaded file.');
      setFile(null);
      setPreviewRows([]);
      setView('upload');
    } finally {
      setChecking(false);
    }
  };

  const onFileChange = (e) => {
    handleFileSelect(e.target.files?.[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const downloadTemplate = () => {
    const headers =
      'first_name,last_name,company_name,job_title,email,phone,website,country,status\n';

    const sampleRows =
      'Sarah,Chen,Acme Corp,VP Marketing,sarah@acmecorp.com,+1 415 555 0100,www.acmecorp.com,United States,New\n' +
      'James,Okafor,NovaTech,Sales Manager,james@novatech.io,+234 800 555 0199,www.novatech.io,Ghana,Demo Scheduled\n';

    const csvContent = headers + sampleRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'leadflow_template.csv';
    link.click();

    window.URL.revokeObjectURL(url);
  };

  const escapeCsv = (value) => {
    const stringValue = String(value ?? '');
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const rowsToCsvFile = (rows, fileName) => {
    const headers = [
      'first_name',
      'last_name',
      'company_name',
      'job_title',
      'email',
      'phone',
      'website',
      'country',
    ];

    const csv =
      headers.join(',') +
      '\n' +
      rows
        .map((row) =>
          [
            row.first_name,
            row.last_name,
            row.company_name,
            row.job_title,
            row.email,
            row.phone,
            row.website,
            row.country,
          ]
            .map(escapeCsv)
            .join(',')
        )
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    return new File([blob], fileName, {
      type: 'text/csv',
    });
  };

  const resetImport = () => {
    setFile(null);
    setView('upload');
    setSummary(null);
    setError('');
    setPreviewRows([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadRows = async (skipDuplicates) => {
    const rowsToImport = skipDuplicates
      ? previewRows.filter((row) => !row.duplicate)
      : previewRows;

    if (rowsToImport.length === 0) {
      setError('No rows available to import.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    const token = localStorage.getItem('lf_token');
    const formData = new FormData();

    const csvFile = rowsToCsvFile(
      rowsToImport,
      skipDuplicates ? 'leadflow_filtered_import.csv' : 'leadflow_full_import.csv'
    );

    formData.append('file', csvFile);

    try {
      const res = await fetch('http://localhost:5000/api/imports/csv', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import file.');
      }

      setSummary(data);
      setFile(null);
      setView('success');
      onCompleted?.();
    } catch (err) {
      setError(err.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const value = String(status || '').toLowerCase();

    if (value.includes('converted')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    if (value.includes('demo')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    }

    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const duplicateCount = previewRows.filter((row) => row.duplicate).length;
  const importableCount = previewRows.filter((row) => !row.duplicate).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 w-full max-w-[630px]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Import Leads from CSV / Excel
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Upload a file to bulk import leads. Duplicate emails will be detected
          automatically.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {checking && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
          Reading file and checking duplicate emails...
        </div>
      )}

      {view === 'upload' && (
        <UploadBox
          dragging={dragging}
          setDragging={setDragging}
          onDrop={onDrop}
          fileInputRef={fileInputRef}
          onFileChange={onFileChange}
          downloadTemplate={downloadTemplate}
        />
      )}

      {view === 'preview' && (
        <div className="space-y-4">
          {duplicateCount > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <AlertTriangle size={16} />
                <span>
                  {duplicateCount} duplicate email
                  {duplicateCount > 1 ? 's' : ''} found
                </span>
              </div>

              <p className="text-xs text-amber-700 mt-1 ml-6">
                Rows highlighted in red already exist in your CRM or are
                duplicated inside the uploaded file.
              </p>
            </div>
          )}

          {file && (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
              <FileSpreadsheet size={15} />
              <span>{file.name}</span>
              <button
                type="button"
                onClick={resetImport}
                className="text-blue-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {previewRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-100 ${
                      row.duplicate ? 'bg-red-50' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-900">
                      <div>{row.first_name || '—'}</div>
                      <div>{row.last_name || ''}</div>
                    </td>

                    <td
                      className={`px-4 py-3 text-xs ${
                        row.duplicate ? 'text-red-600' : 'text-slate-700'
                      }`}
                    >
                      <span>{row.email || 'No email'}</span>

                      {row.duplicate && (
                        <span className="ml-2 px-2 py-1 rounded text-[10px] bg-red-100 text-red-600">
                          {row.duplicateReason || 'duplicate'}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {row.company_name || '—'}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-md border text-xs font-medium ${statusBadge(
                          row.status
                        )}`}
                      >
                        {row.status || 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => uploadRows(true)}
              className="px-4 py-2.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {loading
                ? 'Processing...'
                : `Skip Duplicates (Import ${importableCount})`}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => uploadRows(false)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Importing...' : `Import All (${previewRows.length})`}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={resetImport}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {view === 'success' && (
        <div className="space-y-4">
          <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
            <div className="flex items-center gap-2 font-semibold mb-3">
              <CheckCircle size={16} />
              Import completed
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <SummaryBox label="Total" value={summary?.total_rows ?? 0} />
              <SummaryBox
                label="Imported"
                value={summary?.imported_count ?? 0}
                color="text-emerald-600"
              />
              <SummaryBox
                label="Duplicates"
                value={summary?.duplicate_count ?? 0}
                color="text-amber-600"
              />
              <SummaryBox
                label="Failed"
                value={summary?.failed_count ?? 0}
                color="text-red-600"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={resetImport}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}

function UploadBox({
  dragging,
  setDragging,
  onDrop,
  fileInputRef,
  onFileChange,
  downloadTemplate,
}) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`relative border-2 border-dashed rounded-xl min-h-[255px] flex flex-col items-center justify-center text-center transition ${
        dragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-blue-300'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={onFileChange}
        className="hidden"
      />

      <div className="h-14 w-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        <Upload size={26} />
      </div>

      <p className="text-sm font-semibold text-slate-900">
        Drag and drop your CSV or Excel file here
      </p>

      <p className="text-xs text-slate-400 mt-1">
        Supports .csv, .xlsx, .xls — max 10 MB
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Browse File
        </button>

        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
        >
          <Download size={15} />
          Download Template
        </button>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, color = 'text-slate-900' }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-lg p-3">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}