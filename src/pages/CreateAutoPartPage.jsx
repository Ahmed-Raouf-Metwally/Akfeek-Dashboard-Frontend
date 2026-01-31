import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { autoPartService } from '../services/autoPartService';
import { autoPartCategoryService } from '../services/autoPartCategoryService';
import { vendorService } from '../services/vendorService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

export default function CreateAutoPartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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

  const [imageUrls, setImageUrls] = useState(['']);

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
    
    // Process images
    const validImages = imageUrls
      .filter(url => url.trim() !== '')
      .map((url, index) => ({
        url: url.trim(),
        isPrimary: index === 0,
        sortOrder: index
      }));

    if (validImages.length === 0) {
      toast.error('Please add at least one image URL');
      return;
    }

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

  const handleImageChange = (index, value) => {
    const newImages = [...imageUrls];
    newImages[index] = value;
    setImageUrls(newImages);
  };

  const addImageField = () => setImageUrls([...imageUrls, '']);
  const removeImageField = (index) => setImageUrls(imageUrls.filter((_, i) => i !== index));

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
                <h3 className="font-semibold text-slate-900">Images</h3>
                <div className="space-y-3">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        value={url} 
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        className="flex-1"
                      />
                      {imageUrls.length > 1 && (
                        <button type="button" onClick={() => removeImageField(idx)} className="text-slate-400 hover:text-red-500">
                          <X className="size-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addImageField} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                    <Plus className="size-4" /> Add another image URL
                  </button>
                </div>
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
                       <option key={c.id} value={c.id}>{c.name}</option>
                     ))}
                   </select>
                </div>

                <div>
                   <label className="mb-1.5 block text-sm font-medium text-slate-700">Vendor (Optional)</label>
                   <select
                     name="vendorId"
                     value={formData.vendorId}
                     onChange={handleChange}
                     className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                   >
                     <option value="">Platform (No Vnedor)</option>
                     {vendors.map(v => (
                       <option key={v.id} value={v.id}>{v.businessName}</option>
                     ))}
                   </select>
                   <p className="mt-1 text-xs text-slate-500">Select a vendor if this part belongs to one. Leave empty for platform-owned.</p>
                </div>
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
