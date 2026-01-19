import React from 'react';
import '../styles/components.css'; // We will create this

const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  onClick, 
  type = 'button',
  disabled = false
}) => {
  const className = `btn btn-${variant} ${fullWidth ? 'w-full' : ''}`;
  
  return (
    <button 
      type={type} 
      className={className} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
