import React from 'react';
import '../styles/components.css';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  name,
  error
}) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        className={`input-field ${error ? 'input-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
