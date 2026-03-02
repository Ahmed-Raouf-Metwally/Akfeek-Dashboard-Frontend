import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FileText, Upload, Trash2, Eye, FileImage, FileBadge, Loader2, PlusCircle } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { Card } from './ui/Card';

export const DOC_TYPES = [
  { value: 'COMMERCIAL_LICENSE', label: 'السجل التجاري' },
  { value: 'TAX_CERTIFICATE',    label: 'شهادة ضريبية (VAT)' },
  { value: 'INSURANCE',          label: 'وثيقة تأمين' },
  { value: 'VEHICLE_REGISTRATION', label: 'استمارة مركبة' },
  { value: 'DRIVER_LICENSE',     label: 'رخصة قيادة' },
  { value: 'IDENTITY_CARD',      label: 'هوية وطنية' },
  { value: 'CERTIFICATION',      label: 'شهادة اعتماد' },
  { value: 'CONTRACT',           label: 'عقد / اتفاقية' },
  { value: 'OTHER',              label: 'مستند آخر' },
];

function docTypeLabel(type) {
  return DOC_TYPES.find(d => d.value === type)?.label ?? type;
}

function FileIcon({ mimeType, className }) {
  if (mimeType?.startsWith('image/')) return <FileImage className={className} />;
  return <FileText className={className} />;
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VendorDocuments({ vendorId }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [docType, setDocType] = useState('COMMERCIAL_LICENSE');
  const [docName, setDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['vendor-documents', vendorId],
    queryFn: () => vendorService.getDocuments(vendorId),
    enabled: !!vendorId,
  });

  const uploadMutation = useMutation({
    mutationFn: () => vendorService.uploadDocument(vendorId, selectedFile, docType, docName || selectedFile?.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-documents', vendorId] });
      toast.success('تم رفع المستند بنجاح');
      setShowForm(false);
      setSelectedFile(null);
      setDocName('');
      setDocType('COMMERCIAL_LICENSE');
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'فشل رفع المستند'),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId) => vendorService.deleteDocument(vendorId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-documents', vendorId] });
      toast.success('تم حذف المستند');
    },
    onError: () => toast.error('فشل حذف المستند'),
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ''));
    e.target.value = '';
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) { toast.error('اختر ملفاً أولاً'); return; }
    uploadMutation.mutate();
  };

  const apiBase = import.meta.env.VITE_API_URL || '';

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <FileBadge className="size-5 text-indigo-500" />
          <div>
            <h2 className="text-base font-semibold text-slate-900">المستندات الرسمية</h2>
            <p className="text-xs text-slate-400">السجل التجاري، التأمين، التراخيص وغيرها</p>
          </div>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <PlusCircle className="size-4" /> إضافة مستند
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showForm && (
        <form onSubmit={handleUpload} className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
          <p className="text-sm font-semibold text-indigo-900">رفع مستند جديد</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">نوع المستند</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {DOC_TYPES.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">اسم المستند (اختياري)</label>
              <input
                type="text"
                placeholder="مثال: سجل تجاري 2025"
                value={docName}
                onChange={e => setDocName(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* File picker */}
          <div>
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
            {selectedFile ? (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <FileIcon mimeType={selectedFile.type} className="size-4 text-indigo-500" />
                <span className="flex-1 truncate text-slate-700">{selectedFile.name}</span>
                <span className="shrink-0 text-xs text-slate-400">{formatBytes(selectedFile.size)}</span>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500"><Trash2 className="size-3.5" /></button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-4 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <Upload className="size-4" />
                اختر ملفاً (صورة أو PDF — حد أقصى 10MB)
              </button>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={uploadMutation.isPending || !selectedFile}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {uploadMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              رفع المستند
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setSelectedFile(null); setDocName(''); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Documents list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : docs.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
          <FileBadge className="mx-auto size-9 text-slate-300" />
          <p className="mt-2 text-sm text-slate-400">لا توجد مستندات مرفوعة بعد</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <PlusCircle className="size-4" /> أضف أول مستند
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <FileIcon mimeType={doc.mimeType} className="size-5 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                <p className="text-xs text-slate-400">
                  {docTypeLabel(doc.docType)}
                  {doc.fileSize ? ` · ${formatBytes(doc.fileSize)}` : ''}
                  {' · '}{new Date(doc.uploadedAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`${apiBase}${doc.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                  title="عرض المستند"
                >
                  <Eye className="size-4" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل تريد حذف هذا المستند؟')) deleteMutation.mutate(doc.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  title="حذف"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
