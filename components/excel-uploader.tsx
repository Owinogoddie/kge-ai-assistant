import React, { useState } from 'react';
import { PlusCircle, XCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './loader';

interface QAEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FileUploaderProps {
  onSubmit: (file: File | null, manualEntries: QAEntry[]) => void;
}

export default function FileUploader({ onSubmit }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [manualEntries, setManualEntries] = useState<QAEntry[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleManualEntryChange = (id: string, field: keyof QAEntry, value: string) => {
    setManualEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addManualEntry = () => {
    setManualEntries(entries => [...entries, { id: Date.now().toString(), question: '', answer: '', category: '' }]);
  };

  const removeManualEntry = (id: string) => {
    setManualEntries(entries => entries.filter(entry => entry.id !== id));
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);
    await onSubmit(file, manualEntries);
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Q&A Data</h2>
        <p className="text-gray-600 mb-4">
          Upload a CSV or Excel file containing questions, answers, and categories, or manually enter the data below.
        </p>

        {processing ? (
          <LoadingSpinner />
        ) : (
          <>
            {manualEntries.length === 0 && !file && (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">CSV, XLSX or XLS (MAX. 10MB)</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
                </label>
              </div>
            )}

            {file && (
              <div className="flex items-center justify-between">
                <p className="text-lg text-green-600 mt-4">Selected file: {file.name}</p>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 transition-colors duration-300"
                >
                  <XCircle size={20} /> Remove File
                </button>
              </div>
            )}

            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold text-gray-700">Manual Entries</h3>
              <AnimatePresence>
                {manualEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => removeManualEntry(entry.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors duration-300"
                    >
                      <XCircle size={20} />
                    </button>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={entry.question}
                        onChange={(e) => handleManualEntryChange(entry.id, 'question', e.target.value)}
                        placeholder="Question"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        value={entry.answer}
                        onChange={(e) => handleManualEntryChange(entry.id, 'answer', e.target.value)}
                        placeholder="Answer"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                      <input
                        type="text"
                        value={entry.category}
                        onChange={(e) => handleManualEntryChange(entry.id, 'category', e.target.value)}
                        placeholder="Category"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={addManualEntry}
                className="flex items-center justify-center w-full p-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-300"
              >
                <PlusCircle size={20} className="mr-2" /> Add Entry
              </button>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={!file && manualEntries.length === 0}
          className={`w-full mt-6 px-4 py-2 text-white rounded-md ${
            !file && manualEntries.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition duration-300 ease-in-out`}
        >
          Upload and Process
        </button>
      </div>
    </form>
  );
}