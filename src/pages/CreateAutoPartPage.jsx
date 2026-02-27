import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
import { autoPartService } from '../services/autoPartService';
import { autoPartCategoryService } from '../services/autoPartCategoryService';
import { vendorService } from '../services/vendorService';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/env';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

export default function CreateAutoPartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  // Data Fetching
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => autoPartCategoryService.getCategoryTree(),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors-list'],
    queryFn: () => vendorService.getVendors({ status: 'ACTIVE' }),
  });

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    sku: '',
    brand: '',
    categoryId: '',
    vendorId: '', // For admin selection
    price: '',
    stockQuantity: '',
    description: '',
  });

  const [portfolioImageUrl, setPortfolioImageUrl] = useState('');
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const portfolioFileInputRef = useRef(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const createMutation = useMutation({
    mutationFn: (data) => autoPartService.createAutoPart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-parts'] });
      toast.success('Auto part created successfully');
      navigate('/auto-parts');
    },
    onError: (err) => toast.error(err?.message || 'Failed to create part'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!portfolioImageUrl) {
      toast.error('Please add the portfolio (main) image');
      return;
    }

    const primary = { url: portfolioImageUrl, isPrimary: true, sortOrder: 0 };
    const additional = imageUrls.map((url, index) => ({
      url: typeof url === 'string' ? url : (url.url || url),
      isPrimary: false,
      sortOrder: index + 1,
    }));
    const validImages = [primary, ...additional];

    createMutation.mutate({
      ...formData,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      images: validImages
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePortfolioFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPortfolioUploading(true);
    try {
      const url = await autoPartService.uploadImages([file]);
      setPortfolioImageUrl(Array.isArray(url) ? url[0] : url);
      toast.success('Portfolio image uploaded');
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setPortfolioUploading(false);
      e.target.value = '';
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await autoPartService.uploadImages(files);
      const newUrls = Array.isArray(urls) ? urls : [urls];
      setImageUrls((prev) => [...prev, ...newUrls]);
      toast.success(newUrls.length > 1 ? 'Images uploaded' : 'Image uploaded');
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => setImageUrls((prev) => prev.filter((_, i) => i !== index));

  const getImageSrc = (url) => (url.startsWith('http') ? url : (API_BASE_URL || '') + url);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/auto-parts" className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Auto Part</h1>
          <p className="text-slate-500">Create a new item in the auto parts catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-6">
              <h3 className="font-semibold text-slate-900">Basic Information</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <Input label="Name (English)" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Name (Arabic)" name="nameAr" value={formData.nameAr} onChange={handleChange} dir="rtl" required />

                <Input label="SKU" name="sku" value={formData.sku} onChange={handleChange} required />
                <Input label="Brand" name="brand" value={formData.brand} onChange={handleChange} required />

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <h3 className="font-semibold text-slate-900">Portfolio image (main)</h3>
              <p className="text-sm text-slate-500">الصورة الرئيسية للمنتج — تظهر في البطاقة والقوائم (مطلوبة)</p>
              <input
                ref={portfolioFileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handlePortfolioFileSelect}
              />
              <div className="flex items-start gap-4">
                {portfolioImageUrl ? (
                  <div className="relative group">
                    <img
                      src={getImageSrc(portfolioImageUrl)}
                      alt="Portfolio"
                      className="h-32 w-32 rounded-lg border-2 border-indigo-200 object-cover bg-slate-100"
                      onError={(e) => { e.target.src = ''; e.target.className += ' opacity-50'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setPortfolioImageUrl('')}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 shadow"
                      aria-label="Remove"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => portfolioFileInputRef.current?.click()}
                  disabled={portfolioUploading}
                  className="h-32 w-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 disabled:opacity-50 shrink-0"
                >
                  <Upload className="size-8" />
                  <span className="text-xs font-medium">{portfolioUploading ? 'Uploading…' : 'Portfolio image'}</span>
                </button>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <h3 className="font-semibold text-slate-900">Additional images</h3>
              <p className="text-sm text-slate-500">صور إضافية (اختياري)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="flex flex-wrap gap-4">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={getImageSrc(url)}
                      alt=""
                      className="h-24 w-24 rounded-lg border border-slate-200 object-cover bg-slate-100"
                      onError={(e) => { e.target.src = ''; e.target.className += ' opacity-50'; }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 opacity-90 group-hover:opacity-100 shadow"
                      aria-label="Remove"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="h-24 w-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 disabled:opacity-50"
                >
                  <Upload className="size-6" />
                  <span className="text-xs">{uploading ? 'Uploading…' : 'Upload image'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500">JPEG, PNG or WebP.</p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <h3 className="font-semibold text-slate-900">Organization</h3>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nameAr || c.name}</option>
                  ))}
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Vendor (Optional)</label>
                  <select
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Platform (No Vendor)</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.businessName}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">Assign this part to a vendor or leave empty for platform-owned parts.</p>
                </div>
              )}
            </Card>

            <Card className="p-6 space-y-6">
              <h3 className="font-semibold text-slate-900">Inventory</h3>
              <Input
                label="Price (SAR)"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <Input
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
              />
            </Card>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save className="size-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Part'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
