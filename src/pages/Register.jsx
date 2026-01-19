import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { FaArrowLeft } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    password: '',
    confirmPassword: '' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register', formData);
  };

  return (
    <div className="container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', fontSize: '20px' }}>
          <FaArrowLeft />
        </button>
      </div>
      
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Create Account</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sign up to get started.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ overflowY: 'auto' }}>
        <Input 
          label="Full Name" 
          placeholder="Enter your name" 
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <Input 
          label="Email" 
          placeholder="Enter your email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <Input 
          label="Phone Number" 
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
          label="Confirm Password" 
          type="password" 
          placeholder="********"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <div style={{ marginTop: '24px' }}>
          <Button fullWidth type="submit">Sign Up</Button>
        </div>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center', paddingBottom: '24px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign In</Link>
      </div>
    </div>
  );
};

export default Register;
