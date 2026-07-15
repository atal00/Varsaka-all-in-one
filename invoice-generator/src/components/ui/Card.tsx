import React from 'react';
import styles from './ui.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div className={`${styles.glassCard} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};
