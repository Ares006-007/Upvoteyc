import React from 'react';
import './ColorBlock.css';

export function ColorBlock({ 
  color = 'lime', 
  children, 
  className = '',
  ...props 
}) {
  return (
    <section className={`color-block color-block-${color} ${className}`} {...props}>
      {children}
    </section>
  );
}
