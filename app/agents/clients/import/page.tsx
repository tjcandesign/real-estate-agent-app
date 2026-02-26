'use client';

import { useAuth } from '@clerk/nextjs';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'upload' | 'preview' | 'results';

interface ParsedRow {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface ImportResults {
  imported: number;
  skipped: number;
  failed: number;
  results: {
    success: { name: string; url: string }[];
    skipped: { name: string; reason: string }[];
    failed: { name: string; reason: string }[];
  };
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',' || char === '\t') {
        row.push(current.trim());
        current = '';
      } else if (char === '\n' || (char === '\r' && next === '\n')) {
        row.push(current.trim());
        if (row.some(cell => cell !== '')) rows.push(row);
        row = [];
        current = '';
        if (char === '\r') i++;
      } else {
        current += char;
      }
    }
  }
  // Last row
  row.push(current.trim());
  if (row.some(cell => cell !== '')) rows.push(row);

  return rows;
}

function guessColumnMapping(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {
    firstName: -1,
    lastName: -1,
    email: -1,
    phoneNumber: -1,
  };

  headers.forEach((h, i) => {
    const lower = h.toLowerCase().replace(/[^a-z]/g, '');
    if (['firstname', 'first', 'fname', 'givenname'].includes(lower)) mapping.firstName = i;
    else if (['lastname', 'last', 'lname', 'surname', 'familyname'].includes(lower)) mapping.lastName = i;
    else if (['email', 'emailaddress', 'mail'].includes(lower)) mapping.email = i;
    else if (['phone', 'phonenumber', 'mobile', 'cell', 'telephone', 'tel'].includes(lower)) mapping.phoneNumber = i;
    else if (['name', 'fullname', 'clientname', 'contact'].includes(lower)) {
      // Full name column — map to firstName, we'll split it later
      if (mapping.firstName === -1) mapping.firstName = i;
    }
  });

  // If no matches found, assume column order: first, last, email, phone
  if (mapping.firstName === -1 && headers.length >= 1) mapping.firstName = 0;
  if (mapping.lastName === -1 && headers.length >= 2) mapping.lastName = 1;
  if (mapping.email === -1 && headers.length >= 3) mapping.email = 2;
  if (mapping.phoneNumber === -1 && headers.length >= 4) mapping.phoneNumber = 3;

  return mapping;
}

export default function ImportClientsPage() {
  const { isLoaded } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [columnMapping, setColumnMapping] = useState<Record<string, number>>({
    firstName: 0,
    lastName: 1,
    email: 2,
    phoneNumber: 3,
  });
  const [parsedClients, setParsedClients] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');

  const processData = useCallback((text: string) => {
    const rows = parseCSV(text);
    if (rows.length === 0) {
      setError('No data found');
      return;
    }

    setError(null);
    setRawRows(rows);

    // Guess if first row is headers
    const firstRow = rows[0];
    const looksLikeHeaders = firstRow.some(cell => {
      const lower = cell.toLowerCase().replace(/[^a-z]/g, '');
      return ['name', 'firstname', 'first', 'lastname', 'last', 'email', 'phone', 'mobile', 'contact'].includes(lower);
    });

    setHasHeaders(looksLikeHeaders);
    if (looksLikeHeaders) {
      setHeaders(firstRow);
      const mapping = guessColumnMapping(firstRow);
      setColumnMapping(mapping);
    } else {
      setHeaders(firstRow.map((_, i) => `Column ${i + 1}`));
    }

    setStep('preview');
  }, []);

  // Build preview data whenever mapping changes
  const getPreviewClients = useCallback((): ParsedRow[] => {
    const dataRows = hasHeaders ? rawRows.slice(1) : rawRows;
    return dataRows.map(row => {
      let firstName = row[columnMapping.firstName] || '';
      let lastName = row[columnMapping.lastName] || '';

      // If firstName contains a space and lastName is empty, split it
      if (firstName.includes(' ') && !lastName) {
        const parts = firstName.split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      }

      return {
        firstName,
        lastName,
        email: columnMapping.email >= 0 ? (row[columnMapping.email] || '') : '',
        phoneNumber: columnMapping.phoneNumber >= 0 ? (row[columnMapping.phoneNumber] || '') : '',
      };
    }).filter(c => c.firstName.trim());
  }, [rawRows, hasHeaders, columnMapping]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        processData(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  }, [processData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        processData(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = () => {
    if (pasteText.trim()) {
      processData(pasteText);
    }
  };

  const handleImport = async () => {
    const clients = getPreviewClients();
    if (clients.length === 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const response = await fetch('/api/agents/clients/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Import failed');
      }

      const results = await response.json();
      setImportResults(results);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCopyAllLinks = async () => {
    if (!importResults) return;
    const links = importResults.results.success
      .map(s => `${s.name}: ${s.url}`)
      .join('\n');
    await navigator.clipboard.writeText(links);
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen text-slate-500">Loading...</div>;
  }

  // ─── RESULTS ───
  if (step === 'results' && importResults) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Import Complete</h1>
          <p className="text-slate-500">
            {importResults.imported} imported, {importResults.skipped} skipped, {importResults.failed} failed
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{importResults.imported}</div>
            <div className="text-sm text-green-600">Imported</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{importResults.skipped}</div>
            <div className="text-sm text-amber-600">Skipped</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{importResults.failed}</div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>

        {/* Successfully imported with onboarding links */}
        {importResults.results.success.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
            <div className="flex items-center justify-between px-6 py-4 bg-green-50/50 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">
                Imported Clients & Onboarding Links
              </h3>
              <button
                onClick={handleCopyAllLinks}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy All Links
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {importResults.results.success.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3 border-b border-slate-50 last:border-0 text-sm">
                  <span className="font-medium text-slate-900">{item.name}</span>
                  <span className="text-slate-400 font-mono text-xs truncate max-w-xs ml-4">{item.url}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skipped */}
        {importResults.results.skipped.length > 0 && (
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden mb-6">
            <div className="px-6 py-3 bg-amber-50/50 border-b border-amber-100">
              <h3 className="text-sm font-semibold text-amber-700">Skipped ({importResults.skipped})</h3>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {importResults.results.skipped.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-2.5 border-b border-slate-50 last:border-0 text-sm">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-amber-600 text-xs">{item.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed */}
        {importResults.results.failed.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden mb-6">
            <div className="px-6 py-3 bg-red-50/50 border-b border-red-100">
              <h3 className="text-sm font-semibold text-red-700">Failed ({importResults.failed})</h3>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {importResults.results.failed.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-2.5 border-b border-slate-50 last:border-0 text-sm">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-red-600 text-xs">{item.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => {
              setStep('upload');
              setRawRows([]);
              setImportResults(null);
              setPasteText('');
            }}
            className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium text-sm"
          >
            Import More
          </button>
          <button
            onClick={() => router.push('/agents/clients')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-medium text-sm"
          >
            View All Clients
          </button>
        </div>
      </div>
    );
  }

  // ─── PREVIEW ───
  if (step === 'preview' && rawRows.length > 0) {
    const previewClients = getPreviewClients();
    const displayHeaders = hasHeaders ? rawRows[0] : headers;
    const fieldLabels: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phoneNumber: 'Phone',
    };

    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <button
          onClick={() => { setStep('upload'); setRawRows([]); }}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Map Your Columns</h1>
        <p className="text-slate-500 mb-8">
          Tell us which columns match which fields. We guessed based on your headers.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6 text-sm">{error}</div>
        )}

        {/* Column mapping */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={hasHeaders}
                onChange={(e) => setHasHeaders(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              First row is headers
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(fieldLabels).map(([field, label]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                <select
                  value={columnMapping[field]}
                  onChange={(e) => setColumnMapping({ ...columnMapping, [field]: parseInt(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value={-1}>— Skip —</option>
                  {displayHeaders.map((h, i) => (
                    <option key={i} value={i}>{h || `Col ${i + 1}`}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Data preview table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-700">
              Preview — {previewClients.length} client{previewClients.length !== 1 ? 's' : ''} to import
            </h3>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">#</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">First Name</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">Last Name</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">Email</th>
                  <th className="px-4 py-2.5 text-left font-medium text-slate-500">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {previewClients.slice(0, 50).map((client, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                    <td className={`px-4 py-2.5 font-medium ${client.firstName ? 'text-slate-900' : 'text-red-400 italic'}`}>
                      {client.firstName || 'Missing'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{client.lastName || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{client.email || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{client.phoneNumber || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewClients.length > 50 && (
              <div className="px-4 py-3 text-sm text-slate-500 bg-slate-50 text-center">
                Showing first 50 of {previewClients.length} clients
              </div>
            )}
          </div>
        </div>

        {/* Import button */}
        <div className="flex gap-3">
          <button
            onClick={() => { setStep('upload'); setRawRows([]); }}
            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium text-sm"
          >
            Start Over
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || previewClients.length === 0}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
              isImporting || previewClients.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
            }`}
          >
            {isImporting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Importing {previewClients.length} clients...
              </>
            ) : (
              <>
                Import {previewClients.length} Client{previewClients.length !== 1 ? 's' : ''}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── UPLOAD ───
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Link
        href="/agents/clients"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Clients
      </Link>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Import Clients</h1>
      <p className="text-slate-500 mb-8">Upload a CSV, paste from a spreadsheet, or enter names manually</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6 text-sm">{error}</div>
      )}

      {/* Input mode toggle */}
      <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setInputMode('file')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition ${
            inputMode === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Upload CSV
        </button>
        <button
          onClick={() => setInputMode('paste')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition ${
            inputMode === 'paste' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Paste Data
        </button>
      </div>

      {inputMode === 'file' ? (
        /* CSV file upload */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all
            ${isDragging
              ? 'border-blue-400 bg-blue-50/50'
              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition ${
            isDragging ? 'bg-blue-100' : 'bg-slate-100'
          }`}>
            <svg className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700 mb-2">
            {isDragging ? 'Drop your file here' : 'Drag & drop a CSV file'}
          </p>
          <p className="text-sm text-slate-400 mb-4">or click to browse</p>
          <p className="text-xs text-slate-400">Supports CSV, TSV, and tab-separated files</p>
        </div>
      ) : (
        /* Paste from spreadsheet */
        <div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={"First Name\tLast Name\tEmail\tPhone\nJohn\tDoe\tjohn@email.com\t555-0100\nJane\tSmith\tjane@email.com\t555-0200"}
            rows={10}
            className="w-full border border-slate-200 rounded-xl p-4 text-sm font-mono text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-slate-400 mt-2 mb-4">
            Paste directly from Excel, Google Sheets, or any spreadsheet. Tab or comma separated.
          </p>
          <button
            onClick={handlePaste}
            disabled={!pasteText.trim()}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition ${
              pasteText.trim()
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Preview Import
          </button>
        </div>
      )}

      {/* Format help */}
      <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Accepted formats</h3>
        <div className="space-y-2 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            CSV files from Excel, Google Sheets, etc.
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copy-paste directly from any spreadsheet
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Only first name is required — other fields are optional
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Auto-detects column headers (First Name, Last Name, Email, Phone)
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Up to 200 clients per batch
          </div>
        </div>
      </div>
    </div>
  );
}
