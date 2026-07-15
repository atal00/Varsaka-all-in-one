'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, Shield, LayoutTemplate, Calculator, Star, Quote, BarChart3, CreditCard, Users } from 'lucide-react';
import styles from '@/components/ui/ui.module.css';

export default function LandingPage() {
  return (
    <div style={{ textAlign: 'center', paddingBottom: '0rem' }}>
      
      {/* Hero Section */}
      <section style={{ padding: '0rem 4rem 1rem 4rem', position: 'relative' }}>
        
        {/* Floating Decorative Elements (Left) */}
        <div className={styles.floatingDecor} style={{ top: '15%', left: '5%', animationDelay: '0s' }}>
          <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '12px' }}><CreditCard size={24} color="#10b981" /></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Payment Received</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>+$4,500.00</p>
          </div>
        </div>
        
        <div className={styles.floatingDecor} style={{ top: '65%', left: '10%', animationDelay: '1.5s' }}>
          <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '12px' }}><Calculator size={24} color="#3b82f6" /></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tax Engine</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Automated</p>
          </div>
        </div>

        {/* Floating Decorative Elements (Right) */}
        <div className={styles.floatingDecor} style={{ top: '25%', right: '8%', animationDelay: '3s' }}>
          <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '12px' }}><Users size={24} color="#ef4444" /></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>New Client</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Acme Corp Added</p>
          </div>
        </div>

        <div className={styles.floatingDecor} style={{ top: '70%', right: '5%', animationDelay: '0.8s' }}>
          <div style={{ background: '#f5f3ff', padding: '0.75rem', borderRadius: '12px' }}><BarChart3 size={24} color="#8b5cf6" /></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>MRR Growth</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6' }}>+24%</p>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 20 }}>
          <h2 style={{ fontSize: '5rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1.5rem', letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Billing redefined in <br/><span style={{ background: 'linear-gradient(to right, var(--accent-primary), #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>absolute spatial clarity.</span>
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', lineHeight: 1.6 }}>
            Generate, customize, and manage your invoices within a frictionless, multi-tenant cloud environment built for modern professionals.
          </p>
          <Link href="/login">
            <Button style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }} className="glow-hover">Login to Dashboard <CheckCircle2 style={{ marginLeft: '0.5rem' }} /></Button>
          </Link>
          
          {/* Mini Interactive Preview */}
          <div className="float-animation" style={{ marginTop: '2rem', width: '100%', maxWidth: '600px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.5)', boxShadow: 'var(--shadow-deep)' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'left', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>INVOICE</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>INV-2026-001</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 600 }}>Your Studio Inc.</p>
                    <p style={{ color: 'var(--text-secondary)' }}>hello@studio.com</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontWeight: 600 }}>Total Due</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>$4,500.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
