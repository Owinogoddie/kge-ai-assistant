'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const FileUploader = dynamic(() => import('@/components/excel-uploader'), {
  ssr: false,
});
interface QAEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ProcessingResult {
  addedCount: number;
  duplicateCount: number;
}

export default function Home() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleSubmit = async (file: File | null, manualEntries: QAEntry[]) => {
    setProcessing(true);
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('manualEntries', JSON.stringify(manualEntries));

    try {
      const response = await fetch('/api/process-entries', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Processed data:', result);
        setResult({
          addedCount: result.addedCount,
          duplicateCount: result.duplicateCount,
        });
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
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Q&A Data Uploader</h1>
        <FileUploader onSubmit={handleSubmit} />
        {processing && (
          <div className="mt-8 p-4 bg-blue-100 rounded-md">
            <p className="text-blue-700 text-center">Processing... Please wait.</p>
          </div>
        )}
        {result && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Results:</h2>
            <p className="text-green-700 mb-2">Added entries: {result.addedCount}</p>
            <p className="text-yellow-700">Duplicate entries: {result.duplicateCount}</p>
            {result.duplicateCount > 0 && (
              <p className="text-gray-600 mt-2">
                Duplicate entries were not added to avoid redundancy in the database.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}