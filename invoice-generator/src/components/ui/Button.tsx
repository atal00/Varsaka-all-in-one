import React from 'react';
import styles from './ui.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({ children, variant = 'primary', className, ...props }: ButtonProps) => {
  const btnClass = 
    variant === 'primary' ? styles.btnPrimary : 
    variant === 'secondary' ? styles.btnSecondary : 
    styles.btnDanger;

  return (
    <button className={`${btnClass} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};
