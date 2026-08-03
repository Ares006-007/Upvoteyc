import React from 'react';
import './Button.css';

export function Button({ 
  variant = 'primary', 
  children, 
  icon: Icon,
  className = '', 
  ...props 
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary text-button';
      case 'secondary': return 'btn-secondary text-button';
      case 'tertiary': return 'btn-tertiary text-link';
      case 'icon': return 'btn-icon';
      case 'icon-inverse': return 'btn-icon-inverse';
      case 'magenta': return 'btn-magenta-promo text-button';
      default: return 'btn-primary text-button';
    }
  };

  return (
    <button className={`btn ${getVariantClass()} ${className}`} {...props}>
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}
