import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
import { autoPartService } from '../services/autoPartService';
import { autoPartCategoryService } from '../services/autoPartCategoryService';
import { brandService } from '../services/brandService';
import { vendorService } from '../services/vendorService';
import { vehicleService } from '../services/vehicleService';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/env';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

/** تسطيح شجرة الفئات إلى قائمة للقائمة المنسدلة (جذر + كل الفرعية) */
function flattenCategoryTree(tree) {
  const out = [];
  function walk(nodes, depth = 0) {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      out.push({ ...node, _depth: depth });
      if (node.children?.length) walk(node.children, depth + 1);
    }
  }
  walk(tree);
  return out;
}

export default function CreateAutoPartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const [categoryType, setCategoryType] = useState('CAR'); // CAR | MOTORCYCLE

  const { data: categoryTree = [] } = useQuery({
    queryKey: ['categories-tree', categoryType],
    queryFn: () => autoPartCategoryService.getCategoryTree({ vehicleType: categoryType }),
  });
  const categoriesFlat = flattenCategoryTree(categoryTree);

  const { data: vendorsResult, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors-list-all'],
    queryFn: () => vendorService.getVendors({ limit: 200 }),
  });
  const vendors = vendorsResult?.vendors ?? [];
  
  // Filter to only AUTO_PARTS vendors
  const autoPartsVendors = vendors.filter(v => v.vendorType === 'AUTO_PARTS');
  const { data: brandsResult } = useQuery({
    queryKey: ['brands-for-auto-part'],
    queryFn: () => brandService.getBrands({ activeOnly: true, limit: 200 }),
  });
  const brands = brandsResult?.brands ?? [];

  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (selectedBrandId) {
      vehicleService.getModels(selectedBrandId).then(setModels);
    } else {
      setModels([]);
    }
  }, [selectedBrandId]);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    sku: '',
    brandId: '',
    vehicleModelId: '',
    year: '',
    categoryId: '',
    vendorId: '',
    price: '',
    stockQuantity: '',
    description: '',
  });

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setSelectedBrandId(brandId);
    setFormData((prev) => ({ 
      ...prev, 
      brandId,
      vehicleModelId: ''
    }));
  };

  const handleCategoryTypeChange = (type) => {
    setCategoryType(type);
    setFormData((prev) => ({ ...prev, categoryId: '', brandId: '', vehicleModelId: '' }));
    setSelectedBrandId('');
    setModels([]);
  };

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

    const selectedBrand = formData.brandId ? brands.find(b => String(b.id) === String(formData.brandId)) : null;
    
    createMutation.mutate({
      name: formData.name,
      nameAr: formData.nameAr,
      sku: formData.sku,
      brand: selectedBrand ? (selectedBrand.nameAr || selectedBrand.name) : '',
      brandId: formData.brandId ? String(formData.brandId) : null,
      vehicleModelId: formData.vehicleModelId ? String(formData.vehicleModelId) : null,
      year: formData.year ? Number(formData.year) : null,
      categoryId: formData.categoryId,
      vendorId: formData.vendorId ? String(formData.vendorId) : null,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      description: formData.description,
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
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">الماركة</label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleBrandChange}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    <option value="">اختر الماركة</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.nameAr || b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">الموديل</label>
                  <select
                    name="vehicleModelId"
                    value={formData.vehicleModelId}
                    onChange={handleChange}
                    disabled={!selectedBrandId}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                    required={!!selectedBrandId}
                  >
                    <option value="">اختر الموديل</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{m.nameAr || m.name}</option>
                    ))}
                  </select>
                  {!selectedBrandId && <p className="mt-1 text-xs text-slate-500">اختر الماركة أولاً</p>}
                </div>

                <Input 
                  label="السنة" 
                  name="year" 
                  type="number" 
                  min="1900" 
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="مثال: 2024"
                />

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
              <h3 className="font-semibold text-slate-900">التصنيف</h3>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">نوع الفئة</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryTypeChange('CAR')}
                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-all ${categoryType === 'CAR' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                  >
                    قطع غيار سيارات
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryTypeChange('MOTORCYCLE')}
                    className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-all ${categoryType === 'MOTORCYCLE' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                  >
                    دراجات نارية
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">الفئة</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">اختر الفئة</option>
                  {categoriesFlat.map((c) => (
                    <option key={c.id} value={c.id}>
                      {(c._depth ? '— '.repeat(c._depth) : '') + (c.nameAr || c.name)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">فقط الفئات المرتبطة بنوع «{categoryType === 'CAR' ? 'قطع غيار سيارات' : 'دراجات نارية'}»</p>
              </div>

              {isAdmin && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">المتجر / الفيندور</label>
                  <select
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">منصة أكفيك (بدون فيندور)</option>
                    {autoPartsVendors.map(v => (
                      <option key={v.id} value={v.id}>{v.businessNameAr || v.businessName}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">حدد الفيندور الذي يبيع هذه القطعة أو اتركه للقطعات الخاصة بالمنصة</p>
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
