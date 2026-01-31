import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { vendorService } from '../services/vendorService';
import { Card } from '../components/ui/Card';
import Input from '../components/Input';

export default function CreateVendorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessNameAr: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    country: 'SA',
    userId: '', // Admin creates for a user
  });

  const createMutation = useMutation({
    mutationFn: (data) => vendorService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor profile created successfully');
      navigate('/vendors');
    },
    onError: (err) => toast.error(err?.message || 'Failed to create vendor'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vendors" className="rounded-lg p-2 hover:bg-slate-100">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Vendor</h1>
          <p className="text-slate-500">Create a new vendor profile for a user</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="User ID (UUID)"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="e.g. 550e8400-e29b-..."
              required
              helperText="The existing user UUID to assign this vendor profile to."
            />
            <div className="hidden sm:block"></div>

            <Input
              label="Business Name (English)"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
            <Input
              label="Business Name (Arabic)"
              name="businessNameAr"
              value={formData.businessNameAr}
              onChange={handleChange}
              required
              dir="rtl"
            />
            
            <Input
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              required
            />
            <Input
              label="Contact Phone"
              name="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={handleChange}
              required
            />
            
            <div className="sm:col-span-2">
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <Input
              label="Country Code"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              maxLength={2}
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

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save className="size-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
