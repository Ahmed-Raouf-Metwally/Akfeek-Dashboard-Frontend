import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { FaArrowLeft } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login', formData);
    // TODO: Auth integration
    navigate('/dashboard');
  };

  return (
    <div className="container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', fontSize: '20px' }}>
          <FaArrowLeft />
        </button>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Let's Sign you in.</h2>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Input 
          label="Email" 
          placeholder="Enter your email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <Input 
          label="Password" 
          type="password" 
          placeholder="Enter your password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        
        <div style={{ textAlign: 'right', marginBottom: '32px' }}>
          <Link to="/forgot-password" style={{ color: 'var(--primary)', fontWeight: '500', fontSize: '14px' }}>
            Forgot Password?
          </Link>
        </div>

        <Button fullWidth type="submit">Sign In</Button>
      </form>

      <div style={{ marginTop: 'auto', textAlign: 'center', paddingBottom: '24px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register</Link>
      </div>
    </div>
  );
};

export default Login;
