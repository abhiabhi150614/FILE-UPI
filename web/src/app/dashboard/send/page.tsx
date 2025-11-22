'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle } from 'lucide-react';
import { fileAPI, shareAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SendPage() {
  const router = useRouter();
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [targetFolder, setTargetFolder] = useState('Bills');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const { data } = await fileAPI.getAll();
      setFiles(data);
    } catch (error) {
      toast.error('Failed to load files');
    }
  };

  const handleSend = async () => {
    if (!selectedFile || !recipientEmail || !targetFolder) {
      toast.error('Please fill all required fields');
      return;
    }

    setSending(true);
    try {
      const { data } = await shareAPI.send({
        file_id: selectedFile,
        recipient_email: recipientEmail,
        target_folder_name: targetFolder,
        message: message,
        share_type: 'direct',
      });

      toast.success(`File sent! Transaction ID: ${data.transaction_id}`);
      router.push('/dashboard/transactions');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send file');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Send className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Send File</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a file...</option>
              {files.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.filename} ({(file.size_bytes / (1024 * 1024)).toFixed(2)} MB)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email *</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Folder *</label>
            <select
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Bills">🧾 Bills</option>
              <option value="Hospital Reports">🏥 Hospital Reports</option>
              <option value="Company">🏢 Company</option>
              <option value="Education">🎓 Education</option>
              <option value="Receipts">🧾 Receipts</option>
              <option value="Personal">👤 Personal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !selectedFile || !recipientEmail}
            className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-semibold flex items-center justify-center gap-2"
          >
            {sending ? 'Sending...' : (
              <>
                <Send className="w-5 h-5" />
                Send File
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
