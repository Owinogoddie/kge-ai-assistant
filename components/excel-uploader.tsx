'use client';

import { CloudDownloadIcon } from 'lucide-react';
import { useState } from 'react';

export default function ExcelUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/process-excel', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Processed data:', result.embeddings);
        alert('File processed successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('An error occurred during processing');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <CloudDownloadIcon className="w-10 h-10 mb-3 text-blue-400" />
            <p className="mb-2 text-sm text-blue-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-blue-500">XLSX or XLS (MAX. 10MB)</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx,.xls" />
        </label>
      </div>
      {file && (
        <p className="text-2xl text-gray-300">
          Selected file: {file.name}
        </p>
      )}
      <button
        type="submit"
        disabled={!file || processing}
        className={`w-full px-4 py-2 text-white rounded-md ${
          !file || processing
            ? 'bg-blue-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } transition duration-300 ease-in-out`}
      >
        {processing ? 'Processing...' : 'Upload and Process'}
      </button>
    </form>
    </div>
  );
}