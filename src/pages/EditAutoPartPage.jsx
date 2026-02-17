import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Upload, Trash2, Star } from 'lucide-react';
import { autoPartService } from '../services/autoPartService';
import { autoPartCategoryService } from '../services/autoPartCategoryService';
import { vendorService } from '../services/vendorService';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/env';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

export default function EditAutoPartPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const { data: part, isLoading: partLoading } = useQuery({
    queryKey: ['auto-part', id],
    queryFn: () => autoPartService.getAutoPartById(id),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => autoPartCategoryService.getCategoryTree(),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors-list'],
    queryFn: () => vendorService.getVendors({ status: 'ACTIVE' }),
    enabled: isAdmin,
  });

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    sku: '',
    brand: '',
    categoryId: '',
    vendorId: '',
    price: '',
    stockQuantity: '',
    description: '',
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const fileInputRef = useRef(null);
  const portfolioFileInputRef = useRef(null);

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name || '',
        nameAr: part.nameAr || '',
        sku: part.sku || '',
        brand: part.brand || '',
        categoryId: part.categoryId || '',
        vendorId: part.vendorId || '',
        price: part.price != null ? String(part.price) : '',
        stockQuantity: part.stockQuantity != null ? String(part.stockQuantity) : '',
        description: part.description || '',
      });
      if (part.images?.length) {
        setImages(part.images.map((img) => ({
          id: img.id,
          url: img.url || '',
          isPrimary: !!img.isPrimary,
        })));
      } else {
        setImages([]);
      }
    }
  }, [part]);

  const updateMutation = useMutation({
    mutationFn: (data) => autoPartService.updateAutoPart(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-parts'] });
      queryClient.invalidateQueries({ queryKey: ['auto-part', id] });
      toast.success('Auto part updated successfully');
      navigate(`/auto-parts/${id}`);
    },
    onError: (err) => toast.error(err?.message || 'Failed to update part'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      name: formData.name,
      nameAr: formData.nameAr,
      brand: formData.brand,
      categoryId: formData.categoryId,
      vendorId: formData.vendorId || undefined,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      description: formData.description,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePortfolioFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPortfolioUploading(true);
    try {
      const url = await autoPartService.uploadImages([file]);
      const path = Array.isArray(url) ? url[0] : url;
      await autoPartService.addPartImages(id, [{ url: path, isPrimary: true }]);
      queryClient.invalidateQueries({ queryKey: ['auto-part', id] });
      toast.success('Portfolio image updated');
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
      await autoPartService.addPartImages(id, newUrls.map((url) => ({ url })));
      queryClient.invalidateQueries({ queryKey: ['auto-part', id] });
      toast.success(newUrls.length > 1 ? 'Images added' : 'Image added');
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await autoPartService.setPrimaryPartImage(id, imageId);
      queryClient.invalidateQueries({ queryKey: ['auto-part', id] });
      toast.success('Main image updated');
    } catch (err) {
      toast.error(err?.message || 'Failed to set main image');
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await autoPartService.deletePartImage(id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      queryClient.invalidateQueries({ queryKey: ['auto-part', id] });
      toast.success('Image removed');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove image');
    }
  };

  const getImageSrc = (url) => (url.startsWith('http') ? url : (API_BASE_URL || '') + url);
  const primaryImage = images.find((img) => img.isPrimary);
  const otherImages = images.filter((img) => !img.isPrimary);

  if (partLoading || !part) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-slate-500">Loading part...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/auto-parts/${id}`} className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Auto Part</h1>
          <p className="text-slate-500">{part.sku}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="space-y-6 p-6">
              <h3 className="font-semibold text-slate-900">Basic Information</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <Input label="Name (English)" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Name (Arabic)" name="nameAr" value={formData.nameAr} onChange={handleChange} dir="rtl" />
                <Input label="SKU" name="sku" value={formData.sku} onChange={handleChange} required readOnly className="bg-slate-50" />
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

            <Card className="space-y-6 p-6">
              <h3 className="font-semibold text-slate-900">Images</h3>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Portfolio (main) image</p>
                <input
                  ref={portfolioFileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePortfolioFileSelect}
                />
                {primaryImage ? (
                  <div className="relative inline-block">
                    <img
                      src={getImageSrc(primaryImage.url)}
                      alt="Main"
                      className="h-32 w-32 rounded-lg border-2 border-indigo-200 object-cover bg-slate-100"
                      onError={(e) => { e.target.src = ''; e.target.className += ' opacity-50'; }}
                    />
                    <button
                      type="button"
                      onClick={() => portfolioFileInputRef.current?.click()}
                      disabled={portfolioUploading}
                      className="absolute bottom-1 right-1 rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white shadow hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {portfolioUploading ? '…' : 'Change'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => portfolioFileInputRef.current?.click()}
                    disabled={portfolioUploading}
                    className="h-32 w-40 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 disabled:opacity-50"
                  >
                    <Upload className="size-6" />
                    <span className="text-sm">{portfolioUploading ? 'Uploading…' : 'Upload main image'}</span>
                  </button>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Additional images</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex flex-wrap gap-3">
                  {otherImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={getImageSrc(img.url)}
                        alt=""
                        className="h-24 w-24 rounded-lg border border-slate-200 object-cover bg-slate-100"
                        onError={(e) => { e.target.src = ''; e.target.className += ' opacity-50'; }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/50 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img.id)}
                          className="rounded p-1.5 bg-white/90 text-slate-700 hover:bg-white"
                          title="Set as main"
                        >
                          <Star className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="rounded p-1.5 bg-white/90 text-red-600 hover:bg-white"
                          title="Remove"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="h-24 w-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 disabled:opacity-50"
                  >
                    <Upload className="size-6" />
                    <span className="text-xs">{uploading ? '…' : 'Add'}</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">JPEG, PNG or WebP. You can change the main image, add more, or remove.</p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="space-y-6 p-6">
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
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.businessName}</option>
                    ))}
                  </select>
                </div>
              )}
            </Card>

            <Card className="space-y-6 p-6">
              <h3 className="font-semibold text-slate-900">Inventory</h3>
              <Input label="Price (SAR)" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} required />
              <Input label="Stock Quantity" name="stockQuantity" type="number" min="0" value={formData.stockQuantity} onChange={handleChange} required />
            </Card>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save className="size-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
