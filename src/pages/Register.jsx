import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register', formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
          <p className="mt-1 text-sm text-slate-500">Sign up to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full name"
            placeholder="Enter your name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Phone number"
            placeholder="+966..."
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Password"
            type="password"
            placeholder="********"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="********"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <div className="pt-2">
            <Button fullWidth type="submit">
              Sign up
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
