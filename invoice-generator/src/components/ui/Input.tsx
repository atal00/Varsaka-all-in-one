import React from 'react';
import styles from './ui.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className, ...props }: InputProps) => {
  return (
    <div className={styles.flexCol} style={{ gap: '0.5rem', width: '100%' }}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={`${styles.glassInput} ${className || ''}`} {...props} />
    </div>
  );
};
